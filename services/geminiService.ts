import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateBurgerDescription = async (burgerName: string, ingredients: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Write a short, mouth-watering, 1-sentence description for a burger named "${burgerName}". 
      Key ingredients/vibe: ${ingredients}. 
      Keep it under 20 words. Make it sound premium and delicious.`,
    });
    
    return response.text?.trim() || "A delicious gourmet burger.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "A tasty burger made with fresh ingredients.";
  }
};
