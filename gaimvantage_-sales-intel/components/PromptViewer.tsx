import React from 'react';
import { X } from 'lucide-react';

interface PromptViewerProps {
  isOpen: boolean;
  onClose: () => void;
  spec: object;
}

const PromptViewer: React.FC<PromptViewerProps> = ({ isOpen, onClose, spec }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="bg-background border border-gold w-full max-w-4xl max-h-[90vh] flex flex-col rounded-lg shadow-[0_0_50px_rgba(212,175,55,0.2)]">
        <div className="flex justify-between items-center p-6 border-b border-border">
          <h2 className="font-cinzel text-xl text-gold">App Blueprint: GAIMvantage Prompt</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-gold transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-6 bg-[#080808]">
          <pre className="font-mono text-xs text-green-500 whitespace-pre-wrap leading-relaxed">
            {JSON.stringify(spec, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default PromptViewer;
