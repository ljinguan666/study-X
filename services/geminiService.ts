import { Difficulty, MathProblem, CheckResult, ChatMessage } from "../types";
import { generateOfflineProblem } from "./problemBank";
import { checkEquationOffline } from "./mathEngine";
import { GoogleGenAI, Modality } from "@google/genai";

// Initialize Gemini Client
const apiKey = import.meta.env.VITE_API_KEY || 'YOUR_API_KEY';
const ai = new GoogleGenAI({ apiKey });

// --- Offline Core Functions (Fast & Reliable) ---

export const generateProblem = async (difficulty: Difficulty, seenSignatures: Set<string>): Promise<MathProblem> => {
  // Fast response for offline feel
  await new Promise(resolve => setTimeout(resolve, 100));
  return generateOfflineProblem(difficulty, seenSignatures);
};

export const validateEquation = async (
  problem: MathProblem, 
  userEquation: string
): Promise<CheckResult> => {
  // Fast check
  await new Promise(resolve => setTimeout(resolve, 100));
  return checkEquationOffline(problem.answer, userEquation);
};

export const checkAnswer = (problem: MathProblem, userAnswer: number): CheckResult => {
  const isCorrect = Math.abs(problem.answer - userAnswer) < 0.01;
  
  const feedback = isCorrect 
    ? "太棒了！答案完全正确！"
    : "再试一次哦，计算可能有点小误差。";
    
  return { correct: isCorrect, feedback };
};

// --- Online AI Feature (The Tutor) ---

export const getAIExplanation = async (
  problem: MathProblem,
  messageHistory: ChatMessage[],
  currentInput: string
): Promise<string> => {
  try {
    if (!import.meta.env.VITE_API_KEY && apiKey === 'YOUR_API_KEY') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return "我现在处于离线演示模式。请配置 API Key 来激活我的 AI 大脑哦！不过这道题的关键在于找到等量关系。";
    }

    const model = "gemini-2.5-flash";
    
    const systemInstruction = `你是一位小学数学辅导老师，性格温柔、理智、有耐心。
    
    当前情境：
    学生正在做这道应用题： "${problem.story}".
    问题是： "${problem.question}".
    正确的方程应该是： "${problem.equation}".
    答案是： ${problem.answer}.

    规则：
    1. 绝对不要直接把答案或完整方程告诉学生。
    2. 使用苏格拉底式教学法，通过提问引导学生思考。
    3. 语气要鼓励学生，可以使用适量的 emoji。
    4. 回复要简短（通常不超过 50 字）。
    5. 如果学生直接问答案，委婉拒绝并给出提示。
    `;

    // Convert chat history to Gemini format
    // Exclude the last user message as it is passed in 'contents'
    let contents = messageHistory
      .filter(m => m.role !== 'user' || m.text !== currentInput) // basics
      .map(m => ({
         role: m.role,
         parts: [{ text: m.text }]
      }));

    // Add the current new message
    const response = await ai.models.generateContent({
      model: model,
      contents: [
        ...contents,
        { role: 'user', parts: [{ text: currentInput }] }
      ],
      config: {
        systemInstruction: systemInstruction,
      }
    });

    return response.text || "哎呀，我走神了，再说一遍？";

  } catch (error) {
    console.error("AI Error:", error);
    return "网络有点小差错，请稍后再试！";
  }
};

// --- Gemini TTS (Text to Speech) ---

// Helper to decode base64 to ArrayBuffer
function base64ToArrayBuffer(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

export const getGeminiTTS = async (text: string): Promise<ArrayBuffer | null> => {
  if (!import.meta.env.VITE_API_KEY) return null;

  try {
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
    if (base64Audio) {
      return base64ToArrayBuffer(base64Audio);
    }
    return null;
  } catch (e) {
    console.error("TTS Error", e);
    return null;
  }
}