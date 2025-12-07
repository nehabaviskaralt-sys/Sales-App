import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import LiveRoleplay from './components/LiveRoleplay';
import Insights from './components/Insights';
import PromptViewer from './components/PromptViewer';
import { AppTab, AnalysisResult } from './types';
import { INITIAL_ANALYSIS_RESULT, ANALYSIS_SYSTEM_INSTRUCTION } from './constants';
import { GeminiService } from './services/geminiService';
import { Upload, FileText, Lock, Unlock, PlayCircle, Users } from 'lucide-react';

// Hardcoded spec for the modal display
const APP_SPEC = {
  app_name: "GAIMvantage: Sales Intel",
  role: "AI Revenue Intelligence & Performance Coach",
  features: ["Gemini 2.5 Analysis", "Live API Roleplay", "Search Grounding"],
  tech_stack: ["React", "TypeScript", "Tailwind", "Gemini API"]
};

function App() {
  const [apiKey, setApiKey] = useState(process.env.API_KEY || '');
  const [isKeyValid, setIsKeyValid] = useState(!!process.env.API_KEY);
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.DASHBOARD);
  const [showPrompt, setShowPrompt] = useState(false);
  
  const [file, setFile] = useState<File | null>(null);
  const [transcriptText, setTranscriptText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const [framework, setFramework] = useState("MEDDIC");
  const [dealStage, setDealStage] = useState("Discovery");

  const handleKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.length > 10) setIsKeyValid(true);
  };

  const handleAnalyze = async () => {
    if ((!file && !transcriptText) || !isKeyValid) return;

    setIsAnalyzing(true);
    const service = new GeminiService(apiKey);

    try {
      let audioB64: string | null = null;
      if (file) {
        audioB64 = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
            reader.readAsDataURL(file);
        });
      }

      const result = await service.analyzeCall(audioB64, transcriptText || null, framework, dealStage);
      setAnalysisResult(result);
    } catch (error) {
      console.error(error);
      alert("Analysis failed. Please check your API key and try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Render content based on tab
  const renderContent = () => {
    if (!isKeyValid) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
            <div className="bg-panel border border-border p-10 rounded-lg max-w-md w-full text-center shadow-2xl">
                <Lock className="w-12 h-12 text-gold mx-auto mb-4" />
                <h2 className="font-cinzel text-2xl text-text-primary mb-2">System Locked</h2>
                <p className="font-serif text-text-secondary mb-6">Enter your secure Gemini API credentials to access revenue intelligence.</p>
                <form onSubmit={handleKeySubmit} className="space-y-4">
                    <input 
                        type="password" 
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Paste Gemini API Key"
                        className="w-full bg-background border border-border p-3 rounded text-text-primary focus:border-gold outline-none text-center font-mono"
                    />
                    <button 
                        type="submit"
                        className="w-full bg-gold hover:bg-gold-soft text-black font-bold font-cinzel py-3 rounded transition-all"
                    >
                        Unlock Platform
                    </button>
                </form>
            </div>
        </div>
      );
    }

    switch (activeTab) {
      case AppTab.DASHBOARD:
        if (analysisResult) {
            return (
                <div className="space-y-6">
                    <div className="flex justify-between items-center mb-6">
                        <button 
                            onClick={() => setAnalysisResult(null)}
                            className="text-text-secondary hover:text-gold text-sm font-serif underline"
                        >
                            ← Upload New Call
                        </button>
                        <h2 className="font-cinzel text-2xl text-text-primary">Call Analysis Report</h2>
                    </div>
                    <Dashboard data={analysisResult} />
                </div>
            );
        }
        return (
            <div className="max-w-2xl mx-auto py-12">
                <div className="text-center mb-12">
                     <h2 className="font-cinzel text-4xl text-text-primary mb-4">Ingest Call Data</h2>
                     <p className="font-serif text-text-secondary text-lg">Upload an audio recording or paste a transcript to generate insights.</p>
                </div>

                <div className="bg-panel border border-border rounded-lg p-8 space-y-8">
                    {/* Settings */}
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                             <label className="block text-xs uppercase text-text-secondary mb-2">Framework</label>
                             <select 
                                value={framework} 
                                onChange={(e) => setFramework(e.target.value)}
                                className="w-full bg-surface border border-border p-2 rounded text-text-primary font-serif"
                            >
                                <option value="MEDDIC">MEDDIC</option>
                                <option value="SPICED">SPICED</option>
                                <option value="BANT">BANT</option>
                                <option value="Challenger">Challenger</option>
                             </select>
                         </div>
                         <div>
                             <label className="block text-xs uppercase text-text-secondary mb-2">Deal Stage</label>
                             <select 
                                value={dealStage}
                                onChange={(e) => setDealStage(e.target.value)}
                                className="w-full bg-surface border border-border p-2 rounded text-text-primary font-serif"
                            >
                                <option>Discovery</option>
                                <option>Demo</option>
                                <option>Negotiation</option>
                                <option>Closing</option>
                             </select>
                         </div>
                    </div>

                    {/* Input */}
                    <div className="space-y-6">
                        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-gold transition-colors cursor-pointer relative">
                             <input 
                                type="file" 
                                accept="audio/*"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                             />
                             <Upload className="w-8 h-8 text-gold mx-auto mb-3" />
                             <p className="text-text-primary font-serif">{file ? file.name : "Drop audio file here or click to upload"}</p>
                             <p className="text-text-secondary text-xs mt-2">MP3, WAV, M4A supported</p>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-border"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-panel px-2 text-text-secondary">OR</span>
                            </div>
                        </div>

                        <div>
                            <textarea 
                                value={transcriptText}
                                onChange={(e) => setTranscriptText(e.target.value)}
                                placeholder="Paste raw transcript text here..."
                                className="w-full bg-surface border border-border p-4 rounded text-text-primary font-serif h-32 focus:border-gold outline-none"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleAnalyze}
                        disabled={isAnalyzing || (!file && !transcriptText)}
                        className={`w-full py-4 rounded font-cinzel font-bold text-lg flex items-center justify-center space-x-2 transition-all ${
                            isAnalyzing || (!file && !transcriptText) 
                            ? 'bg-surface text-text-secondary cursor-not-allowed' 
                            : 'bg-gold hover:bg-gold-soft text-black shadow-[0_0_20px_rgba(212,175,55,0.3)]'
                        }`}
                    >
                        {isAnalyzing ? (
                             <>
                                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin mr-2" />
                                Analyzing...
                             </>
                        ) : (
                             <>
                                <PlayCircle className="w-5 h-5 mr-2" />
                                Run Analysis
                             </>
                        )}
                    </button>
                </div>
            </div>
        );
      case AppTab.LIVE_COACH:
        return <LiveRoleplay apiKey={apiKey} />;
      case AppTab.INSIGHTS:
        return <Insights apiKey={apiKey} />;
      default:
        return (
            <div className="flex flex-col items-center justify-center h-64 text-text-secondary">
                <Users className="w-12 h-12 mb-4 opacity-50"/>
                <p className="font-serif">Team functionality coming soon.</p>
            </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-primary selection:bg-gold selection:text-black">
      <Header 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        onLogoClick={() => setShowPrompt(true)}
        momentumScore={analysisResult?.performance_metrics.deal_momentum_score}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>

      <PromptViewer isOpen={showPrompt} onClose={() => setShowPrompt(false)} spec={APP_SPEC} />
    </div>
  );
}

export default App;