import { Difficulty, MathProblem, CheckResult, ChatMessage } from "../types";
import { generateOfflineProblem } from "./problemBank";
import { checkEquationOffline } from "./mathEngine";

// Use the user provided DeepSeek Key
const DEEPSEEK_API_KEY = "sk-78af19cfbdac407ab01ec7b33a260201";

// CRITICAL: We use a relative path '/api/deepseek' here.
// This triggers the proxy configured in vite.config.ts (for local dev),
// vercel.json (for Vercel), or netlify.toml (for Netlify).
const DEEPSEEK_URL = "/api/deepseek/chat/completions";

// --- Offline Core Functions (Fast & Reliable) ---

export const generateProblem = async (difficulty: Difficulty, seenSignatures: Set<string>): Promise<MathProblem> => {
  // Simulate a short "thinking" delay for better UX, but strictly offline logic
  await new Promise(resolve => setTimeout(resolve, 400));
  return generateOfflineProblem(difficulty, seenSignatures);
};

export const validateEquation = async (
  problem: MathProblem, 
  userEquation: string
): Promise<CheckResult> => {
  // Pure offline validation
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

// --- DeepSeek AI Online Functions (Safe Mode) ---

export const getAIExplanation = async (
  problem: MathProblem,
  history: ChatMessage[],
  userQuestion: string
): Promise<string> => {
  // Setup a timeout controller. If API takes > 8 seconds, we abort to save UX.
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const systemInstruction = `你是一位友善、耐心的小学数学辅导老师。

当前题目详情：
情景：${problem.story}
问题：${problem.question}
未知数定义：${problem.unknownDefinition}
正确方程：${problem.equation}
答案：${problem.answer}

你的任务是回答学生关于这道题的问题。
1. 请使用简体中文。
2. 态度要鼓励、亲切，像一位大朋友。
3. 不要直接给出最终答案，而是循循善诱，引导学生思考。
4. 解释要通俗易懂，避免复杂的术语。
5. 如果学生不知道怎么列方程，请分析题目中的“等量关系”。
6. 回复请简短，控制在3-5句话以内。`;

    const messages = [
      { role: "system", content: systemInstruction },
      ...history.map(msg => ({
        role: msg.role === 'model' ? 'assistant' : 'user',
        content: msg.text
      })),
      { role: "user", content: userQuestion }
    ];

    const response = await fetch(DEEPSEEK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: messages,
        temperature: 0.7,
        max_tokens: 500
      }),
      signal: controller.signal // Attach abort signal
    });

    clearTimeout(timeoutId); // Request succeeded, clear timeout

    if (!response.ok) {
      // Handle 404 specifically (often means proxy not set up)
      if (response.status === 404) {
         console.warn("DeepSeek Proxy Not Found");
         return "网络通道未配置 (Proxy 404)，无法连接 AI 老师。不过没关系，你可以自己尝试解题！";
      }
      throw new Error(`API Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "抱歉，我走神了，请再说一遍。";

  } catch (error: any) {
    clearTimeout(timeoutId); // Ensure timeout is cleared on error
    console.error("DeepSeek AI Request Failed:", error);
    
    // Return friendly fallbacks instead of crashing or throwing
    if (error.name === 'AbortError') {
      return "网络有点卡，AI 老师暂时听不见。别担心，你先试着自己做做看？";
    }
    
    if (error.message === "Proxy Config Missing") {
      return "⚠️ 配置提示：请将项目部署到 Vercel 或 Netlify 以启用 API 代理。";
    }
    
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
       return "网络连接似乎断开了。请检查网络，或者直接尝试做下一题吧！";
    }

    return "AI 老师现在有点忙（连接超时），不过我相信你自己也能解出来！加油！";
  }
};