
import { GoogleGenAI } from "@google/genai";

// Fix: Strictly follow initialization guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getSmartPlanningAdvice = async (guests: number, purpose: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Actúa como un experto gestor de Txokos vascos. Un cliente quiere reservar para "${purpose}" con ${guests} personas. 
      Proporciona 3 consejos rápidos sobre cantidades de comida (kg de carne/pescado aproximado) y organización del espacio. 
      Responde de forma breve y cercana en español.`,
      config: {
        temperature: 0.7,
      }
    });
    // Fix: Access .text property directly instead of calling it as a method
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini:", error);
    return "No se pudieron obtener sugerencias en este momento.";
  }
};
