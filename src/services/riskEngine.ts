import { RiskAssessment, RiskLevel, RiskFactor } from '../types/risk';

export function getRiskLevel(score: number): RiskLevel {
  if (score >= 75) return 'CRITICAL';
  if (score >= 50) return 'HIGH';
  if (score >= 25) return 'WATCH';
  return 'LOW';
}

export function getRiskColor(level: RiskLevel): string {
  switch (level) {
    case 'CRITICAL':
      return '#ef4444'; // Red
    case 'HIGH':
      return '#f97316'; // Orange
    case 'WATCH':
      return '#f59e0b'; // Amber
    case 'LOW':
    default:
      return '#10b981'; // Emerald
  }
}

export function getRiskBadgeClasses(level: RiskLevel): string {
  switch (level) {
    case 'CRITICAL':
      return 'bg-red-950/80 text-red-400 border-red-800/80 ring-1 ring-red-500/30';
    case 'HIGH':
      return 'bg-orange-950/80 text-orange-400 border-orange-800/80 ring-1 ring-orange-500/30';
    case 'WATCH':
      return 'bg-amber-950/80 text-amber-400 border-amber-800/80 ring-1 ring-amber-500/30';
    case 'LOW':
    default:
      return 'bg-emerald-950/80 text-emerald-400 border-emerald-800/80 ring-1 ring-emerald-500/30';
  }
}

/**
 * PROTOTYPE FLOOD RISK ASSESSMENT
 * Inputs:
 * - waterLevel (cm) (0-100+ cm range, normal <35cm)
 * - rateOfRise (cm/min) (normal <1.0 cm/min)
 * - rainfall (boolean: true/false)
 *
 * Weighting:
 * - Water Level: 40%
 * - Rate of Rise: 35%
 * - Rainfall: 25%
 */
export function calculateFloodRisk(
  waterLevel: number,
  rateOfRise: number = 0,
  rainfall: boolean = false
): RiskAssessment {
  // 1. Water level factor (0-40 points)
  // Baseline: 25cm = 5pts, 40cm = 18pts, 55cm = 28pts, 70cm+ = 38-40pts
  let waterScore = 0;
  if (waterLevel <= 25) {
    waterScore = Math.min(8, (waterLevel / 25) * 8);
  } else if (waterLevel <= 45) {
    waterScore = 8 + ((waterLevel - 25) / 20) * 14; // 8 to 22
  } else if (waterLevel <= 65) {
    waterScore = 22 + ((waterLevel - 45) / 20) * 12; // 22 to 34
  } else {
    waterScore = Math.min(40, 34 + ((waterLevel - 65) / 20) * 6); // 34 to 40
  }
  waterScore = Math.round(waterScore);

  // 2. Rate of rise factor (0-35 points)
  // <1.0 = 5pts, 1.0 - 2.5 = 15pts, 2.5 - 4.5 = 26pts, >=5.0 = 35pts
  let riseScore = 0;
  if (rateOfRise <= 0.5) {
    riseScore = Math.max(0, rateOfRise * 8);
  } else if (rateOfRise <= 2.0) {
    riseScore = 4 + (rateOfRise / 2.0) * 12; // 4 to 16
  } else if (rateOfRise <= 4.0) {
    riseScore = 16 + ((rateOfRise - 2.0) / 2.0) * 12; // 16 to 28
  } else {
    riseScore = Math.min(35, 28 + ((rateOfRise - 4.0) / 2.0) * 7); // 28 to 35
  }
  riseScore = Math.round(riseScore);

  // 3. Rainfall factor (0-25 points)
  const rainScore = rainfall ? 20 : 2;

  const totalScore = Math.min(100, Math.max(0, waterScore + riseScore + rainScore));
  const riskLevel = getRiskLevel(totalScore);

  const factors: RiskFactor[] = [
    {
      name: 'Water Level Depth',
      weight: 40,
      score: waterScore,
      valueDisplay: `${waterLevel.toFixed(1)} cm`,
      status: waterScore >= 30 ? 'critical' : waterScore >= 18 ? 'elevated' : 'normal',
      detail: waterLevel > 60 ? 'Exceeding secondary retention threshold' : 'Within normal drainage channel capacity'
    },
    {
      name: 'Rate of Water Rise',
      weight: 35,
      score: riseScore,
      valueDisplay: `${rateOfRise >= 0 ? '+' : ''}${rateOfRise.toFixed(1)} cm/min`,
      status: riseScore >= 25 ? 'critical' : riseScore >= 14 ? 'elevated' : 'normal',
      detail: rateOfRise > 3 ? 'Rapid surge accumulation detected' : 'Gradual hydrological variation'
    },
    {
      name: 'Rainfall Precipitation',
      weight: 25,
      score: rainScore,
      valueDisplay: rainfall ? 'DETECTED' : 'NONE',
      status: rainfall ? 'elevated' : 'normal',
      detail: rainfall ? 'Active catchment inflow accelerating surface runoff' : 'No recent rain gauge trigger'
    }
  ];

  const reasons: string[] = [];
  if (waterLevel > 50) reasons.push(`Water level elevated to ${waterLevel.toFixed(1)} cm`);
  if (rateOfRise > 2.5) reasons.push(`Surge rate of rise at ${rateOfRise.toFixed(1)} cm/min indicates fast headwater arrival`);
  if (rainfall) reasons.push('Active rainfall continues to saturate regional drainage basin');
  if (reasons.length === 0) reasons.push('Hydrological parameters remain within historical equilibrium baseline');

  let action = 'Continue standard sensor polling and baseline observation.';
  if (riskLevel === 'CRITICAL') {
    action = 'Immediate attention required: Notify emergency response teams and verify downstream sluice gates.';
  } else if (riskLevel === 'HIGH') {
    action = 'Inspect river node catchment telemetry and alert local embankment patrols.';
  } else if (riskLevel === 'WATCH') {
    action = 'Monitor upstream river levels for rate of rise acceleration.';
  }

  return {
    hazard: 'flood',
    riskScore: totalScore,
    riskLevel,
    trend: rateOfRise > 1.5 ? 'increasing' : rateOfRise < -0.5 ? 'decreasing' : 'stable',
    factors,
    reasons,
    recommendedAction: action,
    timestamp: new Date().toISOString()
  };
}

/**
 * PROTOTYPE WILDFIRE RISK ENGINE
 * Inputs:
 * - temperature (°C) (normal 22-28°C, high >32°C)
 * - humidity (%) (normal 55-75%, critical dry <45%)
 * - smokeLevel ('LOW' | 'MEDIUM' | 'HIGH') or smokePpm (ppm)
 * - windSpeed (km/h) (spread multiplier)
 *
 * Weighting:
 * - Temperature Trend: 35%
 * - Humidity Condition: 25%
 * - Smoke Anomaly: 40%
 */
export function calculateWildfireRisk(
  temperature: number,
  humidity: number,
  smokeLevel: 'LOW' | 'MEDIUM' | 'HIGH' | string,
  smokePpm: number = 45,
  windSpeed: number = 12
): RiskAssessment {
  // 1. Temperature score (0-35 points)
  // 24°C = 5, 28°C = 14, 32°C = 25, 36°C+ = 35
  let tempScore = 0;
  if (temperature <= 25) {
    tempScore = Math.max(2, (temperature / 25) * 8);
  } else if (temperature <= 30) {
    tempScore = 8 + ((temperature - 25) / 5) * 12; // 8 to 20
  } else if (temperature <= 35) {
    tempScore = 20 + ((temperature - 30) / 5) * 11; // 20 to 31
  } else {
    tempScore = Math.min(35, 31 + ((temperature - 35) / 5) * 4); // 31 to 35
  }
  tempScore = Math.round(tempScore);

  // 2. Humidity score (0-25 points) (Inverted: lower humidity = higher fire risk)
  // >65% = 3, 50-65% = 10, 40-50% = 18, <40% = 25
  let humidityScore = 0;
  if (humidity >= 65) {
    humidityScore = 4;
  } else if (humidity >= 50) {
    humidityScore = 4 + ((65 - humidity) / 15) * 10; // 4 to 14
  } else if (humidity >= 38) {
    humidityScore = 14 + ((50 - humidity) / 12) * 8; // 14 to 22
  } else {
    humidityScore = Math.min(25, 22 + ((38 - humidity) / 15) * 3); // 22 to 25
  }
  humidityScore = Math.round(humidityScore);

  // 3. Smoke anomaly score (0-40 points)
  let smokeScore = 6;
  const isHighSmoke = smokeLevel === 'HIGH' || smokePpm > 180;
  const isMedSmoke = smokeLevel === 'MEDIUM' || (smokePpm > 90 && smokePpm <= 180);

  if (isHighSmoke) {
    smokeScore = 37;
  } else if (isMedSmoke) {
    smokeScore = 22;
  } else {
    smokeScore = Math.min(10, Math.max(3, Math.round((smokePpm / 80) * 8)));
  }

  // Slight wind escalation if high wind + high smoke
  if (windSpeed > 20 && (isHighSmoke || isMedSmoke)) {
    smokeScore = Math.min(40, smokeScore + 2);
  }

  const totalScore = Math.min(100, Math.max(0, tempScore + humidityScore + smokeScore));
  const riskLevel = getRiskLevel(totalScore);

  const factors: RiskFactor[] = [
    {
      name: 'Temperature Trend',
      weight: 35,
      score: tempScore,
      valueDisplay: `${temperature.toFixed(1)}°C`,
      status: tempScore >= 25 ? 'critical' : tempScore >= 16 ? 'elevated' : 'normal',
      detail: temperature > 31 ? 'Elevated ambient heat accelerating fuel desiccation' : 'Seasonal thermal equilibrium'
    },
    {
      name: 'Humidity Condition',
      weight: 25,
      score: humidityScore,
      valueDisplay: `${Math.round(humidity)}%`,
      status: humidityScore >= 18 ? 'critical' : humidityScore >= 12 ? 'elevated' : 'normal',
      detail: humidity < 50 ? 'Critically low relative humidity drying vegetation' : 'Adequate moisture levels'
    },
    {
      name: 'Smoke Anomaly',
      weight: 40,
      score: smokeScore,
      valueDisplay: `${smokeLevel} (${smokePpm} ppm)`,
      status: smokeScore >= 30 ? 'critical' : smokeScore >= 18 ? 'elevated' : 'normal',
      detail: isHighSmoke ? 'Sustained particulate & combustion gas spikes detected' : 'Background particulate concentrations'
    }
  ];

  const reasons: string[] = [];
  if (temperature >= 31) reasons.push(`Ambient temperature elevated at ${temperature.toFixed(1)}°C`);
  if (humidity <= 50) reasons.push(`Relative humidity critically low at ${Math.round(humidity)}%`);
  if (isHighSmoke || isMedSmoke) reasons.push(`Particulate smoke anomaly detected (${smokeLevel} level, ${smokePpm} ppm)`);
  if (windSpeed >= 15) reasons.push(`Wind velocity (${windSpeed} km/h) capable of rapid ember propagation`);
  if (reasons.length === 0) reasons.push('Canopy temperature and fuel moisture within safe thresholds');

  let action = 'Normal surveillance. Sensor nodes polling every 3 seconds.';
  if (riskLevel === 'CRITICAL') {
    action = 'POTENTIAL WILDFIRE RISK: Dispatch forestry drone inspection to Forest Zone 01; alert fire watch towers.';
  } else if (riskLevel === 'HIGH') {
    action = 'Heightened alert: Monitor wind vector and prepare secondary sector thermal cameras.';
  } else if (riskLevel === 'WATCH') {
    action = 'Check smoke sensor optical chamber and review forest moisture trends.';
  }

  return {
    hazard: 'wildfire',
    riskScore: totalScore,
    riskLevel,
    trend: tempScore > 20 && isHighSmoke ? 'increasing' : 'stable',
    factors,
    reasons,
    recommendedAction: action,
    timestamp: new Date().toISOString()
  };
}
