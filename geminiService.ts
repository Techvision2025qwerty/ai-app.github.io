import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AIResponse } from "../types";

const apiKey = process.env.API_KEY || '';

// We use the Gemini 3 Flash model for fast, structured responses.
const MODEL_NAME = 'gemini-3-flash-preview';

const ai = new GoogleGenAI({ apiKey });

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    text: {
      type: Type.STRING,
      description: "The natural language response in Russian.",
    },
    graph: {
      type: Type.OBJECT,
      description: "A mathematical representation of the sentence structure.",
      properties: {
        nodes: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING, description: "Unique ID for the node (usually the word)" },
              word: { type: Type.STRING, description: "The specific Russian word" },
              role: { type: Type.STRING, description: "Grammatical role (Субъект, Предикат, Объект, Определение)" },
              weight: { type: Type.NUMBER, description: "Probability weight of this word choice (0.0-1.0)" },
              group: { type: Type.INTEGER, description: "Grouping ID (1 for subject, 2 for verb, 3 for object)" },
            },
            required: ["id", "word", "role", "weight", "group"]
          },
        },
        links: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              source: { type: Type.STRING, description: "Source node ID" },
              target: { type: Type.STRING, description: "Target node ID" },
              value: { type: Type.NUMBER, description: "Strength of the syntactic connection" },
            },
            required: ["source", "target", "value"]
          },
        },
      },
      required: ["nodes", "links"]
    },
  },
  required: ["text", "graph"],
};

export const generateAIResponse = async (input: string): Promise<AIResponse> => {
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: input,
      config: {
        systemInstruction: `
          Ты - уникальный ИИ "Вектор-Ру" (Syntactic Vector Flow). 
          Ты не просто генерируешь текст, ты строишь предложения на основе строгой математической модели русского языка.
          
          Твоя задача:
          1. Отвечать на русском языке.
          2. Использовать уникальный алгоритм построения предложений, где каждое слово имеет "вес" и "грамматическую роль".
          3. Быть вежливым, кратким и точным.
          
          Когда ты отвечаешь, ты должен вернуть JSON, описывающий не только текст ответа, но и структуру графа, показывающую, как слова связаны (Субъект -> Предикат -> Объект).
          Убедись, что nodes и links корректно формируют связный граф предложения.
          Минимизируй количество узлов в графе до самых важных слов (максимум 8-10 слов для визуализации).
        `,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.7,
      },
    });

    const responseText = response.text;
    if (!responseText) throw new Error("No response from AI");

    const data = JSON.parse(responseText) as AIResponse;
    return data;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};