import { HazardType } from './sensor';

export type RiskLevel = 'LOW' | 'WATCH' | 'HIGH' | 'CRITICAL';

export interface RiskFactor {
  name: string;
  weight: number; // e.g. 40 (%)
  score: number; // e.g. 32 (out of 40)
  valueDisplay: string;
  status: 'normal' | 'elevated' | 'critical';
  detail: string;
}

export interface RiskAssessment {
  hazard: HazardType;
  riskScore: number; // 0 - 100
  riskLevel: RiskLevel;
  trend: 'increasing' | 'stable' | 'decreasing';
  factors: RiskFactor[];
  reasons: string[];
  recommendedAction: string;
  timestamp: string;
}

export interface HazardSummary {
  hazard: HazardType;
  title: string;
  riskScore: number;
  riskLevel: RiskLevel;
  trend: '↑ Increasing' | '→ Stable' | '↓ Decreasing';
  primaryMetric: string;
  primaryValue: string;
  summaryReason: string;
}
