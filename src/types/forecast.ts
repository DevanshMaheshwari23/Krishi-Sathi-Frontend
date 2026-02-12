export interface SoilHealthData {
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  pH: number;
  temperature?: number;
  humidity?: number;
  rainfall?: number;
}

export interface CropRecommendation {
  cropName: string;
  suitabilityScore: number;
  predictedYield: number;
  predictedPrice: number;
  seasonality: string;
  waterRequirement: string;
  fertilizers: string[];
  pros: string[];
  cons: string[];
}

export interface ForecastResponse {
  recommendations: CropRecommendation[];
  soilAnalysis: {
    quality: 'Excellent' | 'Good' | 'Fair' | 'Poor';
    nutrients: {
      nitrogen: 'Low' | 'Moderate' | 'High';
      phosphorus: 'Low' | 'Moderate' | 'High';
      potassium: 'Low' | 'Moderate' | 'High';
    };
    pHStatus: 'Acidic' | 'Neutral' | 'Alkaline';
  };
}
