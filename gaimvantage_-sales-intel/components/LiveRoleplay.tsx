import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Volume2, User, Cpu } from 'lucide-react';
import { LiveClient } from '../services/liveClient';

interface LiveRoleplayProps {
  apiKey: string;
}

const LiveRoleplay: React.FC<LiveRoleplayProps> = ({ apiKey }) => {
  const [isActive, setIsActive] = useState(false);
  const [messages, setMessages] = useState<{role: 'user'|'model', text: string}[]>([]);
  const liveClientRef = useRef<LiveClient | null>(null);

  useEffect(() => {
    return () => {
      if (liveClientRef.current) {
        liveClientRef.current.stop();
      }
    };
  }, []);

  const toggleSession = async () => {
    if (isActive) {
      liveClientRef.current?.stop();
      setIsActive(false);
      return;
    }

    const client = new LiveClient(apiKey);
    liveClientRef.current = client;

    client.onTranscriptUpdate = (input, output) => {
        setMessages(prev => {
            const newMsgs = [...prev];
            if (input) newMsgs.push({ role: 'user', text: input });
            if (output) newMsgs.push({ role: 'model', text: output });
            return newMsgs;
        });
    };

    const instruction = `
      You are a tough, skeptical enterprise buyer (CTO role).
      I am a sales rep trying to pitch you a new SaaS product.
      Your goal is to challenge me with realistic objections about budget, security, and implementation time.
      Be concise. Do not monologue. React naturally to my points.
      Start by asking "So, what is this about exactly? I have 2 minutes."
    `;

    try {
        await client.connect(instruction);
        setIsActive(true);
    } catch (e) {
        console.error("Failed to connect live client", e);
        alert("Failed to connect to Live API. Check console.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-12rem)] flex flex-col bg-panel border border-border rounded-lg overflow-hidden relative">
      <div className="p-4 border-b border-border bg-surface flex justify-between items-center">
         <h2 className="font-cinzel text-xl text-gold">Live Roleplay: The Skeptical CTO</h2>
         <div className={`flex items-center space-x-2 ${isActive ? 'text-green-500' : 'text-gray-500'}`}>
            <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
            <span className="text-xs uppercase tracking-widest">{isActive ? 'Live Connection' : 'Offline'}</span>
         </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-black/50">
        {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-text-secondary opacity-30">
                <Mic className="w-16 h-16 mb-4" />
                <p className="font-serif text-lg">Start the session to begin the roleplay scenario.</p>
            </div>
        )}
        {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                 <div className={`max-w-[70%] p-4 rounded-lg flex items-start space-x-3 ${
                     msg.role === 'user' ? 'bg-surface border border-border' : 'bg-gold/10 border border-gold/30'
                 }`}>
                     <div className="mt-1">
                        {msg.role === 'user' ? <User className="w-4 h-4 text-gray-400"/> : <Cpu className="w-4 h-4 text-gold"/>}
                     </div>
                     <p className="font-serif text-sm leading-relaxed text-text-primary">{msg.text}</p>
                 </div>
            </div>
        ))}
      </div>

      {/* Controls */}
      <div className="p-6 bg-surface border-t border-border flex justify-center">
        <button
            onClick={toggleSession}
            className={`
                group relative flex items-center justify-center space-x-3 px-8 py-4 rounded-full font-cinzel font-bold text-lg transition-all duration-300
                ${isActive 
                    ? 'bg-red-900/20 text-red-500 border border-red-900 hover:bg-red-900/40' 
                    : 'bg-gold/10 text-gold border border-gold hover:bg-gold hover:text-black hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]'
                }
            `}
        >
            {isActive ? (
                <>
                    <MicOff className="w-6 h-6" />
                    <span>End Session</span>
                </>
            ) : (
                <>
                    <Mic className="w-6 h-6" />
                    <span>Start Roleplay</span>
                </>
            )}
        </button>
      </div>
    </div>
  );
};

export default LiveRoleplay;
