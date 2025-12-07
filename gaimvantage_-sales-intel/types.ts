export interface TranscriptSegment {
  speaker: string;
  timestamp: string;
  text: string;
  label?: string; // e.g. "Objection", "Closing"
}

export interface SentimentData {
  time: number; // seconds
  sentiment_score: number; // -1 to 1
  engagement_score: number; // 0 to 100
}

export interface PerformanceMetrics {
  overall_score: number;
  deal_risk_level: 'Low' | 'Medium' | 'High';
  deal_risk_reason: string;
  talk_ratio_rep: number;
  talk_ratio_customer: number;
  interruption_count: number;
  avg_question_depth: number;
  monologue_fatigue_segments: number;
  deal_momentum_score: number;
  coachability_score: number;
}

export interface CoachingItem {
  skill_area: string;
  score: number;
  evidence_quote: string;
  timestamp: string;
  advice: string;
}

export interface CoachingCard {
  strengths: string[];
  missed_opportunities: string[];
  action_steps: string[];
}

export interface AnalysisResult {
  transcript: TranscriptSegment[];
  sentiment_graph_data: SentimentData[];
  performance_metrics: PerformanceMetrics;
  high_value_moments: { timestamp: string; summary: string }[];
  coaching_matrix: CoachingItem[];
  coaching_card: CoachingCard;
  is_sales_call: boolean;
}

export interface SearchResult {
    text: string;
    sources: { uri: string; title: string }[];
}

export enum AppTab {
  DASHBOARD = 'DASHBOARD',
  LIVE_COACH = 'LIVE_COACH',
  INSIGHTS = 'INSIGHTS',
  TEAMS = 'TEAMS'
}