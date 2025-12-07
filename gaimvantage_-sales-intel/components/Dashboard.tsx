import React from 'react';
import { AnalysisResult } from '../types';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { AlertTriangle, CheckCircle, TrendingUp, User, Users, Mic, Clock, Award } from 'lucide-react';

interface DashboardProps {
  data: AnalysisResult;
}

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const { performance_metrics, sentiment_graph_data, coaching_matrix, transcript, high_value_moments, coaching_card } = data;

  // Calculate Talk Ratio widths
  const totalTalk = performance_metrics.talk_ratio_rep + performance_metrics.talk_ratio_customer;
  const repPct = (performance_metrics.talk_ratio_rep / totalTalk) * 100;

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* 1. Executive Summary */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-panel border border-gold rounded-lg p-6 flex flex-col justify-between hover:shadow-[0_0_15px_rgba(212,175,55,0.15)] transition-shadow">
            <h3 className="text-text-secondary text-xs uppercase tracking-widest font-serif">Overall Score</h3>
            <div className="flex items-baseline mt-2">
                <span className="text-5xl font-cinzel text-gold">{performance_metrics.overall_score}</span>
                <span className="text-xl text-text-secondary font-cinzel">/100</span>
            </div>
        </div>

        <div className={`bg-panel border rounded-lg p-6 flex flex-col justify-between ${
            performance_metrics.deal_risk_level === 'High' ? 'border-red-900 bg-red-900/10' : 
            performance_metrics.deal_risk_level === 'Medium' ? 'border-yellow-900 bg-yellow-900/10' : 'border-border'
        }`}>
            <h3 className="text-text-secondary text-xs uppercase tracking-widest font-serif">Deal Risk</h3>
            <div className="mt-2">
                <span className={`text-3xl font-cinzel ${
                     performance_metrics.deal_risk_level === 'High' ? 'text-red-500' : 
                     performance_metrics.deal_risk_level === 'Medium' ? 'text-yellow-500' : 'text-gold'
                }`}>
                    {performance_metrics.deal_risk_level}
                </span>
                <p className="text-xs text-text-secondary mt-1 italic border-l-2 border-border pl-2">
                    "{performance_metrics.deal_risk_reason}"
                </p>
            </div>
        </div>

        <div className="col-span-1 md:col-span-2 bg-panel border border-border rounded-lg p-6">
            <h3 className="text-text-secondary text-xs uppercase tracking-widest font-serif mb-4">High-Value Moments</h3>
            <div className="space-y-3">
                {high_value_moments.slice(0, 2).map((moment, idx) => (
                    <div key={idx} className="flex items-start">
                        <span className="text-gold text-xs font-mono mr-3 pt-1">{moment.timestamp}</span>
                        <p className="text-sm text-text-primary font-serif">{moment.summary}</p>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* 2. Visuals & Metrics */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sentiment Chart */}
        <div className="lg:col-span-2 bg-panel border border-border rounded-lg p-6">
            <h3 className="font-cinzel text-lg text-text-primary mb-6 flex items-center">
                <TrendingUp className="w-4 h-4 text-gold mr-2"/> Engagement Timeline
            </h3>
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sentiment_graph_data}>
                        <XAxis dataKey="time" hide />
                        <YAxis hide domain={[-1, 1]}/>
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#0A0A0A', borderColor: '#222', color: '#F5F5F5' }}
                            itemStyle={{ color: '#D4AF37' }}
                        />
                        <ReferenceLine y={0} stroke="#333" strokeDasharray="3 3" />
                        <Line type="monotone" dataKey="sentiment_score" stroke="#D4AF37" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="engagement_score" stroke="#F4DF90" strokeWidth={1} strokeOpacity={0.5} dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Talk Ratio & KPI */}
        <div className="bg-panel border border-border rounded-lg p-6 space-y-6">
            <h3 className="font-cinzel text-lg text-text-primary mb-4">Core Dynamics</h3>
            
            {/* Talk Ratio */}
            <div>
                <div className="flex justify-between text-xs text-text-secondary mb-2 uppercase tracking-wide">
                    <span>Rep ({Math.round(repPct)}%)</span>
                    <span>Customer ({Math.round(100 - repPct)}%)</span>
                </div>
                <div className="h-3 bg-surface rounded-full overflow-hidden flex border border-border">
                    <div style={{ width: `${repPct}%` }} className="bg-gold h-full" />
                    <div style={{ width: `${100 - repPct}%` }} className="bg-gray-700 h-full" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface p-3 rounded border border-border">
                    <div className="flex items-center text-text-secondary text-xs mb-1"><Mic className="w-3 h-3 mr-1"/> Interruptions</div>
                    <div className="text-xl font-cinzel text-text-primary">{performance_metrics.interruption_count}</div>
                </div>
                <div className="bg-surface p-3 rounded border border-border">
                    <div className="flex items-center text-text-secondary text-xs mb-1"><Clock className="w-3 h-3 mr-1"/> Monologues</div>
                    <div className="text-xl font-cinzel text-text-primary">{performance_metrics.monologue_fatigue_segments}</div>
                </div>
                <div className="bg-surface p-3 rounded border border-border">
                    <div className="flex items-center text-text-secondary text-xs mb-1"><Award className="w-3 h-3 mr-1"/> Coachability</div>
                    <div className="text-xl font-cinzel text-gold">{performance_metrics.coachability_score}</div>
                </div>
                <div className="bg-surface p-3 rounded border border-border">
                    <div className="flex items-center text-text-secondary text-xs mb-1"><AlertTriangle className="w-3 h-3 mr-1"/> Question Depth</div>
                    <div className="text-xl font-cinzel text-text-primary">{performance_metrics.avg_question_depth}/5</div>
                </div>
            </div>
        </div>
      </section>

      {/* 3. Coaching Matrix */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-panel border border-border rounded-lg overflow-hidden">
            <div className="p-4 border-b border-border bg-surface">
                 <h3 className="font-cinzel text-lg text-text-primary">Methodology Matrix</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-surface text-xs uppercase text-text-secondary font-cinzel tracking-wider">
                        <tr>
                            <th className="p-4 border-b border-border">Skill Area</th>
                            <th className="p-4 border-b border-border text-center">Score</th>
                            <th className="p-4 border-b border-border">Evidence</th>
                            <th className="p-4 border-b border-border">Advice</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {coaching_matrix.map((item, idx) => (
                            <tr key={idx} className="hover:bg-surface/50 transition-colors">
                                <td className="p-4 font-serif text-sm font-bold text-gold-soft">{item.skill_area}</td>
                                <td className="p-4 text-center">
                                    <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${item.score >= 8 ? 'bg-gold/20 text-gold' : item.score >= 5 ? 'bg-gray-800 text-gray-400' : 'bg-red-900/20 text-red-400'}`}>
                                        {item.score}
                                    </span>
                                </td>
                                <td className="p-4 text-xs text-text-secondary italic max-w-xs">
                                    "{item.evidence_quote}" 
                                    <span className="block text-gray-600 not-italic mt-1 font-mono">{item.timestamp}</span>
                                </td>
                                <td className="p-4 text-sm text-text-primary">{item.advice}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Action Plan Card */}
        <div className="bg-surface border border-gold rounded-lg p-6 relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold to-transparent opacity-50"></div>
            <h3 className="font-cinzel text-lg text-center mb-6 text-gold">Coach's Playbook</h3>
            
            <div className="space-y-6">
                <div>
                    <h4 className="text-xs uppercase tracking-widest text-text-secondary mb-2 flex items-center"><CheckCircle className="w-3 h-3 mr-2 text-green-500"/> Sustain</h4>
                    <ul className="list-disc pl-4 space-y-1 text-sm text-text-primary font-serif">
                        {coaching_card.strengths.slice(0,3).map((s,i) => <li key={i}>{s}</li>)}
                    </ul>
                </div>
                <div>
                    <h4 className="text-xs uppercase tracking-widest text-text-secondary mb-2 flex items-center"><AlertTriangle className="w-3 h-3 mr-2 text-red-500"/> Improve</h4>
                    <ul className="list-disc pl-4 space-y-1 text-sm text-text-primary font-serif">
                         {coaching_card.missed_opportunities.slice(0,3).map((s,i) => <li key={i}>{s}</li>)}
                    </ul>
                </div>
                <div className="bg-panel p-4 rounded border border-border mt-4">
                    <h4 className="text-xs uppercase tracking-widest text-gold mb-3 text-center">Next Call Priorities</h4>
                    <ol className="list-decimal pl-4 space-y-2 text-sm text-white font-serif">
                         {coaching_card.action_steps.slice(0,3).map((s,i) => <li key={i}>{s}</li>)}
                    </ol>
                </div>
            </div>
        </div>
      </section>

      {/* 4. Transcript */}
      <section className="bg-panel border border-border rounded-lg p-6">
          <h3 className="font-cinzel text-lg text-text-primary mb-4">Call Transcript</h3>
          <div className="h-96 overflow-y-auto space-y-4 pr-2">
            {transcript.map((seg, i) => (
                <div key={i} className={`flex ${seg.speaker === 'Customer' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-lg p-3 ${
                        seg.speaker === 'Customer' 
                        ? 'bg-surface border border-border text-text-secondary' 
                        : 'bg-surface border border-gold/30 text-text-primary'
                    }`}>
                        <div className="flex justify-between items-center mb-1">
                            <span className={`text-xs font-bold uppercase ${seg.speaker === 'Customer' ? 'text-gray-500' : 'text-gold'}`}>
                                {seg.speaker === 'Sales Rep' ? 'Rep' : seg.speaker}
                            </span>
                            <span className="text-[10px] font-mono text-gray-600">{seg.timestamp}</span>
                        </div>
                        <p className="font-serif text-sm leading-relaxed">{seg.text}</p>
                        {seg.label && (
                            <div className="mt-2">
                                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-gray-700 text-gray-400 bg-black">
                                    {seg.label}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            ))}
          </div>
      </section>
    </div>
  );
};

export default Dashboard;
