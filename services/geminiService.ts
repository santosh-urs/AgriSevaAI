
import { GoogleGenAI, Type } from "@google/genai";
import { DiseaseAnalysis, PestRisk, Recommendation, GrowthStep } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getCropRecommendations = async (soilType: string, region: string, currentClimate: string): Promise<Recommendation[]> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Based on soil type: ${soilType}, region: ${region}, and current climate: ${currentClimate}, suggest 3 most suitable crops for a farmer.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            crop: { type: Type.STRING },
            reason: { type: Type.STRING },
            expectedYield: { type: Type.STRING }
          },
          required: ["crop", "reason", "expectedYield"]
        }
      }
    }
  });
  return JSON.parse(response.text || '[]');
};

export const getAutoLocationRecommendations = async (lat: number, lng: number, soilType: string): Promise<{ locationName: string; climateDesc: string; recommendations: Recommendation[] }> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `The user is at coordinates: latitude ${lat}, longitude ${lng}. 
    1. Identify the city/region name for these coordinates.
    2. Search for the CURRENT weather and local climate patterns for this specific area.
    3. Given the soil type "${soilType}", recommend 3 crops.
    Return the data in a structured JSON format.`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          locationName: { type: Type.STRING },
          climateDesc: { type: Type.STRING },
          recommendations: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                crop: { type: Type.STRING },
                reason: { type: Type.STRING },
                expectedYield: { type: Type.STRING }
              },
              required: ["crop", "reason", "expectedYield"]
            }
          }
        },
        required: ["locationName", "climateDesc", "recommendations"]
      }
    }
  });
  return JSON.parse(response.text || '{}');
};

export const analyzeFarmOverview = async (base64Image: string): Promise<{ soilQuality: string; pestRisk: string; cropHealth: string; summary: string }> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
        { text: "Analyze this agricultural photo (soil or crop). Provide 1-2 word ratings for: 'soilQuality', 'pestRisk', and 'cropHealth'. Also provide a short 1-sentence 'summary' of current status." }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          soilQuality: { type: Type.STRING },
          pestRisk: { type: Type.STRING },
          cropHealth: { type: Type.STRING },
          summary: { type: Type.STRING }
        },
        required: ["soilQuality", "pestRisk", "cropHealth", "summary"]
      }
    }
  });
  return JSON.parse(response.text || '{}');
};

export const analyzePestFromImage = async (base64Image: string): Promise<{ pestName: string; damageDescription: string; solutions: string[]; riskLevel: string }> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
        { text: "Analyze this image for agricultural pests or crop damage. Identify the pest/problem, describe the damage, and provide specific biological or chemical solutions." }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          pestName: { type: Type.STRING },
          damageDescription: { type: Type.STRING },
          solutions: { type: Type.ARRAY, items: { type: Type.STRING } },
          riskLevel: { type: Type.STRING, enum: ['Low', 'Moderate', 'High', 'Severe'] }
        },
        required: ["pestName", "damageDescription", "solutions", "riskLevel"]
      }
    }
  });
  return JSON.parse(response.text || '{}');
};

export const getCropGrowthGuide = async (crop: string): Promise<GrowthStep[]> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Provide a detailed step-by-step growth guide for the crop: "${crop}". Include stages from seed preparation to harvest.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            stage: { type: Type.STRING },
            duration: { type: Type.STRING },
            instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
            tips: { type: Type.STRING }
          },
          required: ["stage", "duration", "instructions", "tips"]
        }
      }
    }
  });
  return JSON.parse(response.text || '[]');
};

export const detectPlantDisease = async (base64Image: string): Promise<DiseaseAnalysis> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
        { text: "Analyze this plant leaf or soil image. Detect any diseases or nutrient deficiencies. Provide diagnosis, severity, and suggested treatments." }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          status: { type: Type.STRING, enum: ['healthy', 'diseased', 'unknown'] },
          diagnosis: { type: Type.STRING },
          severity: { type: Type.STRING, enum: ['low', 'medium', 'high'] },
          treatment: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["status", "diagnosis", "severity", "treatment"]
      }
    }
  });
  return JSON.parse(response.text || '{}');
};

export const getMarketAdvice = async (priceHistory: string): Promise<{ advice: string; reasoning: string }> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Analyze this price history of crops (prices in Indian Rupees ₹): ${priceHistory}. Advise the farmer whether to "Sell Now" or "Wait" for better prices based on 2025 market trends and economic factors. Ensure the reasoning is localized and helpful.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          advice: { type: Type.STRING },
          reasoning: { type: Type.STRING }
        },
        required: ["advice", "reasoning"]
      }
    }
  });
  return JSON.parse(response.text || '{}');
};

export const getPestRisks = async (cropType: string, weather: string): Promise<PestRisk[]> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Given the crop type "${cropType}" and weather conditions "${weather}", identify potential pest risks and preventive measures.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            pest: { type: Type.STRING },
            riskLevel: { type: Type.STRING, enum: ['Low', 'Moderate', 'High', 'Severe'] },
            preventiveMeasures: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["pest", "riskLevel", "preventiveMeasures"]
        }
      }
    }
  });
  return JSON.parse(response.text || '[]');
};
