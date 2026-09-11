export type HazardType =
  | 'flood'
  | 'wildfire'
  | 'landslide'
  | 'heatwave'
  | 'cyclone'
  | 'tsunami'
  | 'air_pollution'
  | 'generic';

export interface HazardConfig {
  id: HazardType;
  title: string;
  hindiTitle: string;
  category: 'hydrological' | 'meteorological' | 'climatological' | 'geophysical' | 'atmospheric';
  iconName: string;
  color: string;
  description: string;
  primaryMetrics: string[];
  warningThresholds: {
    watch: string;
    high: string;
    critical: string;
  };
}

export const HAZARD_REGISTRY: Record<HazardType, HazardConfig> = {
  flood: {
    id: 'flood',
    title: 'Flood & River Surge',
    hindiTitle: 'बाढ़ एवं जलस्तर चेतावनी',
    category: 'hydrological',
    iconName: 'Waves',
    color: '#0284c7',
    description: 'Catchment runoff, rising river levels, and severe drainage inundation.',
    primaryMetrics: ['Water Depth (cm)', 'Rate of Rise (cm/min)', 'Rainfall Intensity (mm/h)'],
    warningThresholds: {
      watch: 'Water level > 45 cm or Rate > 1.5 cm/min',
      high: 'Water level > 55 cm and active rainfall',
      critical: 'Water level > 70 cm with rapid surge'
    }
  },
  wildfire: {
    id: 'wildfire',
    title: 'Forest & Wildfire',
    hindiTitle: 'दावानल एवं वन अग्नि',
    category: 'climatological',
    iconName: 'Flame',
    color: '#ea580c',
    description: 'Canopy thermal desiccation, relative humidity deficit, and combustion gas anomalies.',
    primaryMetrics: ['Canopy Temp (°C)', 'Relative Humidity (%)', 'MQ-2 Smoke Density (ppm)'],
    warningThresholds: {
      watch: 'Temp > 30°C and Humidity < 50%',
      high: 'Temp > 32°C, Humidity < 45%, Smoke > 120 ppm',
      critical: 'Temp > 34°C, Humidity < 40%, Smoke > 250 ppm'
    }
  },
  landslide: {
    id: 'landslide',
    title: 'Landslide & Slope Incline',
    hindiTitle: 'भूस्खलन एवं ढलान अस्थिरता',
    category: 'geophysical',
    iconName: 'Mountain',
    color: '#854d0e',
    description: 'Geotechnical soil pore water saturation and inclinometer slope displacement.',
    primaryMetrics: ['Soil Moisture (%)', 'Inclinometer Drift (°)', 'Pore Pressure (kPa)'],
    warningThresholds: {
      watch: 'Soil Moisture > 55% with sustained rain',
      high: 'Displacement > 0.05° and Pore Pressure > 25 kPa',
      critical: 'Displacement > 0.15° slope shear failure risk'
    }
  },
  heatwave: {
    id: 'heatwave',
    title: 'Extreme Heatwave',
    hindiTitle: 'भीषण ग्रीष्म लहर (लू)',
    category: 'meteorological',
    iconName: 'Sun',
    color: '#eab308',
    description: 'Elevated ambient daytime surface temperatures and dangerous Solar UV indices.',
    primaryMetrics: ['Ambient Temp (°C)', 'Heat Index (°C)', 'Solar UV Index'],
    warningThresholds: {
      watch: 'Temp > 38°C (Daytime peak)',
      high: 'Temp > 42°C with high solar irradiance',
      critical: 'Temp > 45°C dangerous thermal stress'
    }
  },
  cyclone: {
    id: 'cyclone',
    title: 'Cyclone & Severe Storm',
    hindiTitle: 'चक्रवात एवं भीषण तूफान',
    category: 'meteorological',
    iconName: 'Wind',
    color: '#6366f1',
    description: 'Atmospheric barometric pressure drop and high sustained gale wind vectors.',
    primaryMetrics: ['Wind Speed (km/h)', 'Barometric Pressure (hPa)', 'Rain Accumulation (mm)'],
    warningThresholds: {
      watch: 'Wind > 50 km/h, Barometer drop > 5 hPa',
      high: 'Wind > 75 km/h with heavy squalls',
      critical: 'Wind > 100 km/h severe cyclonic intensity'
    }
  },
  tsunami: {
    id: 'tsunami',
    title: 'Tsunami & Coastal Surge',
    hindiTitle: 'सुनामी एवं तटीय जलप्रलय',
    category: 'hydrological',
    iconName: 'ShieldAlert',
    color: '#0891b2',
    description: 'Deep ocean seismic shockwaves and abrupt coastal sea surface displacement.',
    primaryMetrics: ['Sea Level Anomaly (m)', 'Tide Gauge Variance (cm)', 'Seismic Intensity (M)'],
    warningThresholds: {
      watch: 'Tide Variance > 50 cm unexpected draw',
      high: 'Coastal surge > 1.5 m anomaly',
      critical: 'Tsunami wave front > 3.0 m rapid influx'
    }
  },
  air_pollution: {
    id: 'air_pollution',
    title: 'Air Quality & Severe Smog',
    hindiTitle: 'वायु प्रदूषण एवं गंभीर धुंध',
    category: 'atmospheric',
    iconName: 'CloudFog',
    color: '#71717a',
    description: 'Dangerous PM2.5 / PM10 particulate accumulation and toxic combustion gases.',
    primaryMetrics: ['AQI Index', 'PM2.5 Concentration (µg/m³)', 'PM10 Concentration (µg/m³)'],
    warningThresholds: {
      watch: 'AQI 151 - 200 (Unhealthy)',
      high: 'AQI 201 - 300 (Very Unhealthy)',
      critical: 'AQI 301+ (Severe / Hazardous Emergency)'
    }
  },
  generic: {
    id: 'generic',
    title: 'Environmental Anomaly',
    hindiTitle: 'पर्यावरणीय विषमता',
    category: 'atmospheric',
    iconName: 'Radio',
    color: '#10b981',
    description: 'General environmental monitoring and baseline field observation.',
    primaryMetrics: ['Sensor Baseline', 'Battery Voltage', 'Link RSSI'],
    warningThresholds: {
      watch: 'Parameter deviation > 1.5 sigma',
      high: 'Parameter deviation > 2.5 sigma',
      critical: 'Multi-sensor anomaly detected'
    }
  }
};
