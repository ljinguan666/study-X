import { Difficulty, MathProblem, CheckResult, ChatMessage } from "../types";
import { generateOfflineProblem } from "./problemBank";
import { checkEquationOffline } from "./mathEngine";
import { GoogleGenAI, Modality } from "@google/genai";

// --- Offline Core Functions ---

export const generateProblem = async (difficulty: Difficulty, seenSignatures: Set<string>): Promise<MathProblem> => {
  // Simulate a short "thinking" delay for better UX
  await new Promise(resolve => setTimeout(resolve, 400));
  return generateOfflineProblem(difficulty, seenSignatures);
};

export const validateEquation = async (
  problem: MathProblem, 
  userEquation: string
): Promise<CheckResult> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return checkEquationOffline(problem.answer, userEquation);
};

export const checkAnswer = (problem: MathProblem, userAnswer: number): CheckResult => {
  // Allow small floating point tolerance
  const isCorrect = Math.abs(problem.answer - userAnswer) < 0.01;
  
  const feedback = isCorrect 
    ? "答案正确！"
    : "答案不太对，请再算一下。";
    
  return { correct: isCorrect, feedback };
};

// --- AI Online Functions ---

const getAIClient = () => {
  const apiKey = import.meta.env.VITE_API_KEY;
  if (!apiKey) {
    throw new Error('API Key not configured. Please set VITE_API_KEY in your .env file.');
  }
  return new GoogleGenAI({ apiKey });
};

export const getAIExplanation = async (
  problem: MathProblem,
  history: ChatMessage[],
  userQuestion: string
): Promise<string> => {
  try {
    // Check if API key is configured
    if (!import.meta.env.VITE_API_KEY) {
      return "AI 功能需要配置 API Key。请在 .env 文件中设置 VITE_API_KEY。";
    }
    
    const ai = getAIClient();
    
    const systemInstruction = `You are a friendly and patient elementary school math tutor. 
    
    Current Problem Context:
    Story: ${problem.story}
    Question: ${problem.question}
    Unknown: ${problem.unknownDefinition}
    Equation: ${problem.equation}
    Answer: ${problem.answer}
    
    Your goal is to help the student understand the problem and how to solve it. 
    Do not just give the final answer immediately. Guide them step-by-step.
    Use simple, encouraging language suitable for children.
    If they are stuck on setting up the equation, explain the relationship between the numbers.
    Speak in Chinese (Simplified).
    Keep responses concise (around 2-4 sentences).`;

    // Convert history to SDK format
    const chatHistory = history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    }));

    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: systemInstruction,
      },
      history: chatHistory
    });

    const response = await chat.sendMessage({ message: userQuestion });
    return response.text || "抱歉，我没听清，请再说一遍。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "网络连接好像有点问题，请稍后再试。";
  }
};

export const getGeminiTTS = async (text: string): Promise<ArrayBuffer | null> => {
  // Check if API key is configured
  if (!import.meta.env.VITE_API_KEY) {
    return null;
  }
  
  try {
    const ai = getAIClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) return null;

    // Decode base64 to ArrayBuffer
    const binaryString = atob(base64Audio);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;

  } catch (error) {
    console.error("Gemini TTS Error:", error);
    return null;
  }
};
