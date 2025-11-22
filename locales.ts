import { Language } from "./types";

export const translations = {
  zh: {
    appTitle: "方程大冒险",
    subTitle: "选择难度，开始你的数学探险之旅！",
    levels: {
      easy: "简单 (入门)",
      medium: "中等 (进阶)",
      hard: "困难 (挑战)"
    },
    steps: {
      define: "设未知数",
      build: "列方程",
      solve: "解方程"
    },
    actions: {
      backToMenu: "返回主菜单",
      next: "下一步",
      confirmVar: "确认，去列方程",
      hint: "💡 提示",
      submitEq: "提交方程",
      submitAns: "提交答案",
      retry: "再来一题",
      home: "返回主页"
    },
    feedback: {
      loading: "题目正在光速生成中...",
      definePrompt: "这道题里，我们不知道的数是什么呢？",
      defineAction: "我知道了！",
      defineDone: "AI老师已经帮你写好了“解：设...”，接下来最关键咯！",
      buildPrompt: "找出等量关系，用 x 表示出来。",
      buildPlaceholder: "例如: 2x + 5 = 15",
      solvePrompt: "现在解开这个方程吧。",
      successTitle: "挑战成功!",
      successMsg: "你太厉害了！完全掌握了这个知识点。",
      errorEq: "方程好像不太对哦，左右两边相等吗？",
      errorAns: "再试一次哦，计算可能有点小误差。",
      correctEq: "太棒了！方程是正确的！"
    },
    problemLabel: "应用题",
    solutionLabel: "解：",
    fullSolution: "完整解题过程："
  },
  en: {
    appTitle: "Equation Explorer",
    subTitle: "Choose your difficulty and start the adventure!",
    levels: {
      easy: "Easy (Starter)",
      medium: "Medium (Pro)",
      hard: "Hard (Master)"
    },
    steps: {
      define: "Define X",
      build: "Equation",
      solve: "Solve It"
    },
    actions: {
      backToMenu: "Main Menu",
      next: "Next Step",
      confirmVar: "Confirm & Build",
      hint: "💡 Hint",
      submitEq: "Submit Equation",
      submitAns: "Check Answer",
      retry: "Next Level",
      home: "Home"
    },
    feedback: {
      loading: "Generating challenge instantly...",
      definePrompt: "What is the unknown value in this story?",
      defineAction: "I know it!",
      defineDone: "We've set up 'Let x be...'. Now for the fun part!",
      buildPrompt: "Find the relationship and write the equation.",
      buildPlaceholder: "e.g., 2x + 5 = 15",
      solvePrompt: "Great! Now find the value of x.",
      successTitle: "Challenge Complete!",
      successMsg: "You are amazing! You mastered this problem.",
      errorEq: "That doesn't look quite right. Do both sides balance?",
      errorAns: "Not quite. Check your calculation again.",
      correctEq: "Awesome! That equation works!"
    },
    problemLabel: "Word Problem",
    solutionLabel: "Solution: ",
    fullSolution: "Full Solution:"
  }
};

export const t = (lang: Language, key: string): string => {
  const keys = key.split('.');
  let value: any = translations[lang];
  for (const k of keys) {
    value = value?.[k];
  }
  return value || key;
};