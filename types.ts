
export type AppView = 'dashboard' | 'crop-rec' | 'disease-det' | 'market-trend' | 'pest-alert';

export interface MarketDataPoint {
  date: string;
  price: number;
}

export interface Recommendation {
  crop: string;
  reason: string;
  expectedYield: string;
}

export interface DiseaseAnalysis {
  status: 'healthy' | 'diseased' | 'unknown';
  diagnosis: string;
  treatment: string[];
  severity: 'low' | 'medium' | 'high';
}

export interface PestRisk {
  pest: string;
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Severe';
  preventiveMeasures: string[];
}

export interface GrowthStep {
  stage: string;
  duration: string;
  instructions: string[];
  tips: string;
}
