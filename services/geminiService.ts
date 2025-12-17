import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";
import { Message } from "../types";

// Initialize the client. 
// Note: In a production Firebase app, you might proxy this through a Cloud Function to hide the key, 
// but for this frontend-only demo, we use the env var directly.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generatePrediction = async (
  query: string, 
  history: Message[]
): Promise<{ text: string; sources: Array<{ title: string; uri: string }> }> => {
  
  try {
    // We use gemini-2.5-flash for its speed and Google Search tool capability
    const modelId = 'gemini-2.5-flash';

    // Format history for context (limit to last few turns to save tokens)
    const recentHistory = history.slice(-6).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const response = await ai.models.generateContent({
      model: modelId,
      contents: [
        ...recentHistory,
        { role: 'user', parts: [{ text: query }] }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.4, // Lower temperature for more analytical/grounded results
        tools: [{ googleSearch: {} }] // MANDATORY: Enable search for real-time validation
      }
    });

    const text = response.text || "I could not generate a prediction based on the available data.";
    
    // Extract sources from grounding chunks if available
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = groundingChunks
      .filter(chunk => chunk.web?.uri && chunk.web?.title)
      .map(chunk => ({
        title: chunk.web!.title!,
        uri: chunk.web!.uri!
      }));

    // Dedup sources
    const uniqueSources = Array.from(
      new Map<string, { title: string; uri: string }>(
        sources.map(item => [item.uri, item])
      ).values()
    );

    return { text, sources: uniqueSources };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to analyze probability. Please try again.");
  }
};