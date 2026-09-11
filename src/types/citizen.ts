import { HazardType } from './hazard';
import { RiskLevel } from './risk';

export type CitizenSafetyStatus = 'SAFE' | 'BE_ALERT' | 'HIGH_RISK' | 'CRITICAL';

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relation: string;
}

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
  district: string;
  state: string;
  areaName: string;
  isCustomLocation?: boolean;
  timestamp: string;
}

export interface CitizenUser {
  id: string;
  phoneNumber: string;
  name?: string;
  language: 'en' | 'hi';
  location: UserLocation;
  safetyStatus: CitizenSafetyStatus;
  notificationsEnabled: boolean;
  voiceAlertsEnabled: boolean;
  smsAlertsEnabled: boolean;
  emergencyContacts: EmergencyContact[];
  authenticated: boolean;
}

export type SafeLocationType = 'shelter' | 'hospital' | 'evacuation_point' | 'relief_camp' | 'police_station';

export interface SafeLocation {
  id: string;
  name: string;
  hindiName?: string;
  type: SafeLocationType;
  latitude: number;
  longitude: number;
  distanceKm?: number;
  address: string;
  contactPhone: string;
  capacity?: number;
  availableCapacity?: number;
  isOperational: boolean;
}

export interface GeofencedHazard {
  id: string;
  hazardType: HazardType;
  riskLevel: RiskLevel;
  riskScore: number;
  title: string;
  distanceKm: number;
  zoneName: string;
  whatHappened: string;
  whyMatters: string;
  whatToDo: string[];
  issuedAt: string;
  timeAgo: string;
  affectedRadiusKm: number;
  confirmedByMultiSensor: boolean;
}

export interface EmergencyGuide {
  hazard: HazardType;
  title: string;
  hindiTitle: string;
  tagline: string;
  dos: string[];
  donts: string[];
  emergencyHelpline: string;
  kitItems: string[];
}
