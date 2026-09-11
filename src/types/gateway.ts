export type GatewayStatus = 'ONLINE' | 'DEGRADED' | 'OFFLINE';

export interface RaspberryPiGateway {
  id: string;
  name: string;
  zone: string;
  latitude: number;
  longitude: number;
  status: GatewayStatus;
  loraStatus: 'ACTIVE' | 'LISTENING' | 'JAMMED' | 'OFFLINE';
  loraFrequency: string; // e.g. "868.1 MHz (IN865)"
  packetsReceivedTotal: number;
  packetsPerMinute: number;
  packetLossRatePct: number;
  connectedNodesCount: number;
  cellularBackhaul: {
    carrier: string;
    signalBars: number; // 1-5
    status: 'CONNECTED' | 'FALLBACK_EDGE' | 'OFFLINE';
    ipAddress?: string;
  };
  localStorage: {
    dbEngine: string; // "SQLite 3.42 (Local Edge)"
    bufferedEvents: number;
    syncPending: boolean;
    lastSyncedAt: string;
  };
  power: {
    solarActive: boolean;
    solarInputWatts: number;
    batteryPct: number;
    voltage: number;
  };
  firmwareVersion: string;
  uptimeHours: number;
  lastHeartbeat: string;
}

export interface CitizenImpactSummary {
  hazardId: string;
  zoneName: string;
  affectedRadiusKm: number;
  estimatedCitizenPopulation: number;
  notificationDelivery: {
    inAppDelivered: number;
    pushSent: number;
    pushDelivered: number;
    smsSent: number;
    smsDelivered: number;
    voiceCallsTriggered: number;
    totalAcknowledged: number;
  };
  sheltersOpenInZone: number;
  shelterCapacityTotal: number;
  shelterOccupancy: number;
  lastCalculatedAt: string;
}
