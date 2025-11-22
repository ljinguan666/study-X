export const STRINGS = {
  appTitle: "方程大冒险",
  subTitle: "生活中的数学挑战，等你来解！",
  levels: {
    easy: "生活基础 (简单)",
    medium: "商业逻辑 (中等)",
    hard: "复杂推理 (困难)"
  },
  steps: {
    define: "第一步：设未知数",
    build: "第二步：列方程",
    solve: "第三步：解方程"
  },
  actions: {
    backToMenu: "返回菜单",
    next: "下一题 →",
    prev: "← 上一题",
    confirmVar: "设定完成",
    hint: "💡 给我一点提示",
    submitEq: "提交方程",
    submitAns: "提交答案",
    retry: "再试一次",
    home: "返回主页",
    close: "关闭"
  },
  feedback: {
    loading: "正在寻找有趣的数学挑战...",
    definePrompt: "仔细阅读题目，我们要求的未知数是什么？",
    defineAction: "我找到未知数了！",
    defineDone: "非常好！既然设定了未知数 x，那就要找出题目中的【等量关系】。",
    buildPrompt: "根据题目中的数量关系，列出一个方程。",
    buildPlaceholder: "例如: 3x + 5 = 20",
    solvePrompt: "现在，请计算出 x 等于多少。",
    successTitle: "挑战成功!",
    successMsg: "逻辑非常清晰！你已经掌握了解决这类问题的方法。",
    errorEq: "方程好像不太对。请检查题目中的固定数值和变化数值是否都用上了？",
    errorAns: "计算结果有点小误差，请检查一下算术过程。",
    correctEq: "太棒了！这个方程准确描述了题目中的关系！"
  },
  problemLabel: "生活应用题",
  solutionLabel: "解：",
  fullSolution: "参考解析：",
  chat: {
    title: "AI 辅导老师",
    intro: "你好！我是DeepSeek驱动的智能助教。这道题哪里不懂，可以问我哦！",
    placeholder: "输入问题或点击麦克风提问...",
    listening: "正在听...",
    speakPrompt: "请说话...",
    noVoice: "抱歉，你的浏览器不支持语音识别功能。"
  }
};