import { HazardType } from './sensor';
import { RiskLevel } from './risk';

export interface ActionableAlert {
  id: string;
  hazard: HazardType;
  level: RiskLevel;
  nodeId: string;
  zone: string;
  riskScore: number;
  timestamp: string; // ISO string
  relativeTime: string;
  what: string;
  why: string;
  action: string;
  acknowledged: boolean;
}

export interface TimelineEvent {
  id: string;
  timestamp: string; // "12:02:18"
  hazard?: HazardType;
  message: string;
  level: 'info' | 'watch' | 'high' | 'critical';
  details?: string;
}
