import { GoogleGenAI } from "@google/genai";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key not found in environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateCourseDetails = async (topic: string): Promise<{ description: string; prerequisites: string } | null> => {
  const ai = getAiClient();
  if (!ai) return null;

  try {
    const prompt = `
      You are an expert curriculum designer for handmade crafts and DIY workshops.
      Create a compelling, warm, and inviting course description (approx 80-100 words) for a workshop titled "${topic}".
      Also list 3 short prerequisites or things to bring.
      
      Return the response in strictly valid JSON format with keys: "description" (string) and "prerequisites" (string).
      Do not include markdown code blocks.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text;
    if (!text) return null;

    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating course details:", error);
    return null;
  }
};
