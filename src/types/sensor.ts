export type HazardType = 'flood' | 'wildfire' | 'heatwave' | 'landslide';

export type DataQuality = 'GOOD' | 'DEGRADED' | 'STALE' | 'OFFLINE';

export type NodeStatus = 'ONLINE' | 'WARNING' | 'CRITICAL' | 'OFFLINE';

export interface SensorReading {
  nodeId: string;
  timestamp: string; // ISO string
  temperature: number; // in °C
  humidity: number; // in %
  waterLevel: number; // in cm
  rainfall: boolean; // detected or not
  smokePpm: number; // in ppm / index
  smokeLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  windSpeed: number; // in km/h
  windDirection?: string;
  soilMoisture?: number; // %
  battery: number; // in %
  signalRssi: number; // in dBm (-50 to -95)
  dataQuality: DataQuality;
  rateOfRise?: number; // in cm/min
}

export interface SensorNode {
  id: string;
  name: string;
  hazardType: HazardType;
  zone: string;
  latitude: number;
  longitude: number;
  status: NodeStatus;
  lastReading: SensorReading;
  battery: number;
  signalRssi: number;
  firmwareVersion: string;
  lastUpdated: string;
}

export interface HistoricalReading {
  timestamp: string;
  timeLabel: string;
  waterLevel: number;
  temperature: number;
  humidity: number;
  smokePpm: number;
  rainfall: number; // 0 or 1
  riskScore: number;
}
