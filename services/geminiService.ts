import { GoogleGenAI, Type } from "@google/genai";
import { Medicine, RiskPrediction, FamilyHistoryItem } from "../types";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

// Clean JSON markdown code blocks if present
const cleanJson = (text: string): string => {
  return text.replace(/```json/g, '').replace(/```/g, '').trim();
};

export const parsePrescriptionImage = async (base64Image: string): Promise<{ medicines: Medicine[], diagnosis: string, notes: string }> => {
  const ai = getAiClient();
  
  const prompt = `
    You are an expert medical transcriptionist for Indian prescriptions. 
    Analyze this image of a prescription (handwritten or printed). 
    Extract the following strictly in JSON format:
    1. List of medicines with name, dosage (e.g. 500mg), frequency (e.g. 1-0-1 or Twice daily), duration (e.g. 5 days), and specific instructions (e.g. after food).
    2. Any diagnosis mentioned.
    3. Any additional doctor notes.

    If a field is illegible, make a best guess or leave it empty string.
  `;

  // Schema definition for structured output
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      medicines: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            dosage: { type: Type.STRING },
            frequency: { type: Type.STRING },
            duration: { type: Type.STRING },
            instructions: { type: Type.STRING }
          }
        }
      },
      diagnosis: { type: Type.STRING },
      notes: { type: Type.STRING }
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(cleanJson(text));
  } catch (error) {
    console.error("OCR Error:", error);
    throw new Error("Failed to parse prescription. Please try again.");
  }
};

export const analyzeHealthRisk = async (
  age: number, 
  gender: string, 
  familyHistory: FamilyHistoryItem[]
): Promise<RiskPrediction> => {
  const ai = getAiClient();

  const prompt = `
    Analyze the health risks for a patient with the following profile:
    Age: ${age}
    Gender: ${gender}
    Family Medical History: ${JSON.stringify(familyHistory)}

    Based on Indian genetic patterns and general medical knowledge, predict potential hereditary disease risks.
    Return a strict JSON object.
  `;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      riskLevel: { type: Type.STRING, enum: ['LOW', 'MEDIUM', 'HIGH'] },
      score: { type: Type.NUMBER, description: "Risk score from 0 to 100" },
      prediction: { type: Type.STRING, description: "Main predicted condition or summary" },
      factors: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING },
        description: "List of contributing factors from history"
      },
      recommendations: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "List of screening or lifestyle recommendations"
      }
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(cleanJson(text));
  } catch (error) {
    console.error("Risk Analysis Error:", error);
    throw new Error("Failed to analyze risk.");
  }
};
