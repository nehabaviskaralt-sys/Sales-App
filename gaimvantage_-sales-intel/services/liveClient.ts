import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

export class LiveClient {
  private client: GoogleGenAI;
  private session: any = null;
  private inputAudioContext: AudioContext | null = null;
  private outputAudioContext: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private nextStartTime = 0;
  private sources = new Set<AudioBufferSourceNode>();
  
  public isConnected = false;
  public onTranscriptUpdate: ((input: string, output: string) => void) | null = null;

  private currentInputTranscription = '';
  private currentOutputTranscription = '';

  constructor(apiKey: string) {
    this.client = new GoogleGenAI({ apiKey });
  }

  async connect(systemInstruction: string) {
    this.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    this.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const sessionPromise = this.client.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }, // A deep, professional voice fits the "Coach" persona
        },
        systemInstruction: systemInstruction,
        inputAudioTranscription: {},
        outputAudioTranscription: {},
      },
      callbacks: {
        onopen: () => {
          console.log("Live Session Opened");
          this.isConnected = true;
          this.startAudioInput(sessionPromise);
        },
        onmessage: (message: LiveServerMessage) => this.handleMessage(message),
        onclose: () => {
            console.log("Live Session Closed");
            this.isConnected = false;
            this.stop();
        },
        onerror: (err) => {
            console.error("Live Session Error", err);
            this.isConnected = false;
        }
      }
    });

    this.session = sessionPromise; // Store promise to access session methods later if needed, though we primarily use it in the onopen closure
  }

  private startAudioInput(sessionPromise: Promise<any>) {
    if (!this.inputAudioContext || !this.stream) return;

    this.source = this.inputAudioContext.createMediaStreamSource(this.stream);
    this.processor = this.inputAudioContext.createScriptProcessor(4096, 1, 1);

    this.processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      const b64Data = this.pcmToB64(inputData);
      
      sessionPromise.then(session => {
        session.sendRealtimeInput({
          media: {
            mimeType: 'audio/pcm;rate=16000',
            data: b64Data
          }
        });
      });
    };

    this.source.connect(this.processor);
    this.processor.connect(this.inputAudioContext.destination);
  }

  private async handleMessage(message: LiveServerMessage) {
    // Handle Transcription
    if (message.serverContent?.outputTranscription) {
        this.currentOutputTranscription += message.serverContent.outputTranscription.text;
    } else if (message.serverContent?.inputTranscription) {
        this.currentInputTranscription += message.serverContent.inputTranscription.text;
    }

    if (message.serverContent?.turnComplete) {
        if (this.onTranscriptUpdate) {
            this.onTranscriptUpdate(this.currentInputTranscription, this.currentOutputTranscription);
        }
        this.currentInputTranscription = '';
        this.currentOutputTranscription = '';
    }

    // Handle Audio
    const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
    if (base64Audio && this.outputAudioContext) {
        const audioData = this.b64ToUint8Array(base64Audio);
        const audioBuffer = await this.decodeAudioData(audioData, this.outputAudioContext, 24000, 1);
        this.playAudio(audioBuffer);
    }

    // Handle Interruptions
    if (message.serverContent?.interrupted) {
        this.sources.forEach(src => src.stop());
        this.sources.clear();
        this.nextStartTime = 0;
        this.currentOutputTranscription = ''; // Clear partial transcription on interrupt
    }
  }

  private playAudio(buffer: AudioBuffer) {
      if (!this.outputAudioContext) return;

      const source = this.outputAudioContext.createBufferSource();
      source.buffer = buffer;
      source.connect(this.outputAudioContext.destination);
      
      const currentTime = this.outputAudioContext.currentTime;
      const startTime = Math.max(this.nextStartTime, currentTime);
      
      source.start(startTime);
      this.nextStartTime = startTime + buffer.duration;
      
      this.sources.add(source);
      source.onended = () => this.sources.delete(source);
  }

  stop() {
    this.isConnected = false;
    if (this.session) {
       this.session.then((s: any) => s.close());
    }
    this.stream?.getTracks().forEach(t => t.stop());
    this.processor?.disconnect();
    this.source?.disconnect();
    this.inputAudioContext?.close();
    this.outputAudioContext?.close();
    this.sources.forEach(s => s.stop());
    this.sources.clear();
  }

  // Utils
  private pcmToB64(data: Float32Array): string {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
        int16[i] = data[i] * 32768;
    }
    return this.arrayBufferToBase64(int16.buffer);
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private b64ToUint8Array(base64: string): Uint8Array {
      const binaryString = atob(base64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes;
  }

  private async decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
      const dataInt16 = new Int16Array(data.buffer);
      const frameCount = dataInt16.length / numChannels;
      const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

      for (let channel = 0; channel < numChannels; channel++) {
          const channelData = buffer.getChannelData(channel);
          for (let i = 0; i < frameCount; i++) {
              channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
          }
      }
      return buffer;
  }
}
