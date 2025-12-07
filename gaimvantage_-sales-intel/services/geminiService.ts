import { GoogleGenAI, Type } from "@google/genai";
import { ANALYSIS_SYSTEM_INSTRUCTION } from "../constants";
import { AnalysisResult, SearchResult } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.ai = new GoogleGenAI({ apiKey });
  }

  async analyzeCall(
    audioBase64: string | null,
    transcriptText: string | null,
    framework: string,
    dealStage: string
  ): Promise<AnalysisResult> {
    
    // We construct the prompt dynamically based on input type
    const userPrompt = `
      Analyze this sales call.
      Sales Framework: ${framework}
      Deal Stage: ${dealStage}
      
      ${transcriptText ? `Transcript: \n${transcriptText}` : ''}
    `;

    const parts: any[] = [{ text: userPrompt }];

    if (audioBase64) {
      parts.unshift({
        inlineData: {
          mimeType: "audio/mp3", // Assuming MP3 or generic audio, Gemini handles most
          data: audioBase64
        }
      });
    }

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: {
          role: 'user',
          parts: parts
        },
        config: {
          systemInstruction: ANALYSIS_SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          temperature: 0.2, // Low temp for consistent analysis
        }
      });

      const text = response.text;
      if (!text) throw new Error("No response from Gemini");

      // Clean markdown if present
      const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(jsonStr) as AnalysisResult;

    } catch (error) {
      console.error("Gemini Analysis Error:", error);
      throw error;
    }
  }

  async searchInsights(query: string): Promise<SearchResult> {
    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: query,
        config: {
          tools: [{ googleSearch: {} }],
        }
      });

      const text = response.text || "No insights found.";
      // Extract grounding metadata
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      
      const sources = chunks
        .map((chunk: any) => chunk.web)
        .filter((web: any) => web && web.uri && web.title)
        .map((web: any) => ({ uri: web.uri, title: web.title }));

      // De-duplicate sources
      const uniqueSources = Array.from(new Map(sources.map((s:any) => [s.uri, s])).values()) as {uri:string, title:string}[];

      return {
        text,
        sources: uniqueSources
      };

    } catch (error) {
      console.error("Search Error:", error);
      throw error;
    }
  }
}