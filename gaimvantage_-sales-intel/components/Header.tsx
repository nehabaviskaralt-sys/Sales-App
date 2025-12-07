import React from 'react';
import { GAIM_LOGO_URL } from '../constants';
import { AppTab } from '../types';

interface HeaderProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  onLogoClick: () => void;
  momentumScore?: number;
}

const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange, onLogoClick, momentumScore }) => {
  return (
    <header className="border-b border-border bg-background sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo & Title */}
          <div className="flex items-center cursor-pointer" onClick={onLogoClick}>
            <img src={GAIM_LOGO_URL} alt="GAIM Logo" className="h-10 w-auto mr-4" />
            <div>
              <h1 className="font-cinzel text-2xl text-text-primary tracking-wide">
                GAIMvantage<span className="text-gold">.</span>
              </h1>
              <p className="font-serif text-xs text-text-secondary tracking-widest uppercase mt-1">
                Sales Intel
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            {[
              { id: AppTab.DASHBOARD, label: 'Calls' },
              { id: AppTab.LIVE_COACH, label: 'Coach' },
              { id: AppTab.INSIGHTS, label: 'Insights' },
              { id: AppTab.TEAMS, label: 'Teams' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`font-serif text-sm tracking-wider px-3 py-2 transition-colors duration-200 uppercase ${
                  activeTab === item.id
                    ? 'text-gold border-b border-gold'
                    : 'text-text-secondary hover:text-gold-soft'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Momentum Score Pill */}
          <div className="flex items-center">
            {momentumScore !== undefined && (
              <div className="flex flex-col items-end mr-6">
                 <span className="text-[10px] text-text-secondary uppercase">Deal Momentum</span>
                 <div className="flex items-center space-x-2">
                    <div className="h-2 w-24 bg-surface rounded-full overflow-hidden border border-border">
                        <div 
                            className="h-full bg-gold transition-all duration-1000" 
                            style={{ width: `${momentumScore}%` }}
                        />
                    </div>
                    <span className="text-gold font-cinzel font-bold">{momentumScore}</span>
                 </div>
              </div>
            )}
            <div className="h-8 w-8 rounded-full bg-surface border border-gold flex items-center justify-center text-xs font-bold text-gold">
              JD
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
