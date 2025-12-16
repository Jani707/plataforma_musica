import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';

// Safe initialization
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

export const generateLessonPlan = async (studentName: string, instrument: string, level: string, topic: string) => {
  if (!ai) {
    // Return mock data if no API key is present to prevent app crash
    return `[Modo Demo - Sin API Key]
    
    Plan de lección sugerido para ${studentName} (${instrument} - ${level}):
    
    1. Calentamiento (5 min): Escalas básicas en Do Mayor.
    2. Ejercicio Técnico (10 min): Arpegios y digitación.
    3. Repertorio (20 min): Práctica de la pieza actual enfocándose en el ritmo.
    4. Teoría (10 min): Repaso del Círculo de Quintas.
    5. Improvisación (5 min): Juego libre sobre una pentatónica.
    
    Nota: Configure la API Key de Gemini para obtener planes personalizados reales.`;
  }

  try {
    const prompt = `Actúa como un profesor de música experto llamado Sergio Alfaro.
    Crea un plan de práctica breve (máximo 150 palabras) para un estudiante llamado ${studentName}.
    Instrumento: ${instrument}.
    Nivel: ${level}.
    Objetivo de hoy: ${topic}.
    
    El tono debe ser motivador y educativo.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Error calling Gemini:", error);
    return "Hubo un error generando el plan. Por favor intenta nuevamente.";
  }
};
