import React, { useState } from 'react';
import { Search, ArrowRight, ExternalLink } from 'lucide-react';
import { GeminiService } from '../services/geminiService';
import { SearchResult } from '../types';

interface InsightsProps {
  apiKey: string;
}

const Insights: React.FC<InsightsProps> = ({ apiKey }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    const service = new GeminiService(apiKey);
    try {
        const res = await service.searchInsights(query);
        setResult(res);
    } catch (err) {
        console.error(err);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        <div className="text-center space-y-4">
            <h2 className="font-cinzel text-3xl text-gold">Market Intelligence</h2>
            <p className="font-serif text-text-secondary max-w-xl mx-auto">
                Query real-time data to prepare for your next call. Find competitor news, recent stock shifts, or industry trends.
            </p>
        </div>

        <form onSubmit={handleSearch} className="relative">
            <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ex: What are the top 3 objections for selling CRM software in 2024?"
                className="w-full bg-surface border border-border rounded-full py-4 px-8 text-lg text-text-primary focus:outline-none focus:border-gold transition-colors placeholder-gray-700 font-serif"
            />
            <button 
                type="submit"
                disabled={loading}
                className="absolute right-2 top-2 bottom-2 bg-gold hover:bg-gold-soft text-black rounded-full px-6 flex items-center justify-center transition-colors disabled:opacity-50"
            >
                {loading ? (
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"/>
                ) : (
                    <ArrowRight className="w-5 h-5" />
                )}
            </button>
        </form>

        {result && (
            <div className="bg-panel border border-border rounded-lg p-8 space-y-6">
                <div className="prose prose-invert max-w-none">
                    <p className="font-serif text-lg leading-relaxed whitespace-pre-line">{result.text}</p>
                </div>
                
                {result.sources.length > 0 && (
                    <div className="pt-6 border-t border-border">
                        <h4 className="text-xs uppercase tracking-widest text-text-secondary mb-4">Sources</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {result.sources.map((src, idx) => (
                                <a 
                                    key={idx} 
                                    href={src.uri} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center p-3 rounded bg-surface border border-border hover:border-gold/50 transition-colors group"
                                >
                                    <div className="flex-1 truncate">
                                        <div className="text-sm font-serif text-gold group-hover:underline truncate">{src.title}</div>
                                        <div className="text-xs text-gray-600 truncate">{src.uri}</div>
                                    </div>
                                    <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-gold ml-2" />
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        )}
    </div>
  );
};

export default Insights;
