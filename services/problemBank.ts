import { Difficulty, MathProblem, Language } from "../types";

// Helper to get random integer between min and max (inclusive)
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

interface Template {
  story: (v: any) => { zh: string, en: string };
  question: (v: any) => { zh: string, en: string };
  unknown: (v: any) => { zh: string, en: string };
  hint: (v: any) => { zh: string, en: string };
  gen: () => any; // Generates the numbers
}

// --- Templates ---

const templates: Record<Difficulty, Template[]> = {
  [Difficulty.EASY]: [
    {
      // Type: x + a = b (Addition)
      gen: () => {
        const x = randomInt(5, 20);
        const a = randomInt(5, 20);
        const b = x + a;
        return { x, a, b, item: ["apples", "books", "candies"][randomInt(0, 2)] };
      },
      story: (v) => ({
        zh: `小明有一些${v.item === 'apples' ? '苹果' : v.item === 'books' ? '书' : '糖果'}，妈妈又给了他 ${v.a} 个。现在他一共有 ${v.b} 个。`,
        en: `Tom had some ${v.item}, and his mom gave him ${v.a} more. Now he has ${v.b} in total.`
      }),
      question: () => ({ zh: "原来有多少个？", en: "How many did he have originally?" }),
      unknown: (v) => ({ zh: `设原来有 x 个${v.item === 'apples' ? '苹果' : v.item === 'books' ? '书' : '糖果'}`, en: `Let x be the original number of ${v.item}` }),
      hint: (v) => ({ zh: `原来的数量 + 妈妈给的 = 总数 (${v.b})`, en: `Original + Given = Total (${v.b})` })
    },
    {
      // Type: x - a = b (Subtraction)
      gen: () => {
        const x = randomInt(20, 50);
        const a = randomInt(5, 15);
        const b = x - a;
        return { x, a, b, item: ["coins", "cards"][randomInt(0, 1)] };
      },
      story: (v) => ({
        zh: `盒子里有一些${v.item === 'coins' ? '硬币' : '卡片'}，拿走了 ${v.a} 个后，还剩下 ${v.b} 个。`,
        en: `There were some ${v.item} in a box. After taking out ${v.a}, there are ${v.b} left.`
      }),
      question: () => ({ zh: "盒子里原来有多少个？", en: "How many were in the box originally?" }),
      unknown: (v) => ({ zh: "设原来有 x 个", en: "Let x be the original number" }),
      hint: (v) => ({ zh: `原来的 - 拿走的 = 剩下的`, en: `Original - Taken = Left` })
    }
  ],
  [Difficulty.MEDIUM]: [
    {
      // Type: ax + b = c
      gen: () => {
        const x = randomInt(2, 12);
        const a = randomInt(2, 5); // price or multiplier
        const b = randomInt(5, 20); // extra
        const c = a * x + b;
        return { x, a, b, c };
      },
      story: (v) => ({
        zh: `文具店里，一支钢笔 ${v.a} 元。小红买了若干支钢笔，又买了一个 ${v.b} 元的笔记本，一共花了 ${v.c} 元。`,
        en: `A pen costs $${v.a}. Sarah bought some pens and a notebook for $${v.b}. She spent $${v.c} in total.`
      }),
      question: () => ({ zh: "她买了几支钢笔？", en: "How many pens did she buy?" }),
      unknown: () => ({ zh: "设她买了 x 支钢笔", en: "Let x be the number of pens" }),
      hint: (v) => ({ zh: `(钢笔单价 × 数量) + 笔记本 = 总花费`, en: `(Price × Quantity) + Notebook = Total` })
    },
    {
      // Type: ax - b = c
      gen: () => {
        const x = randomInt(5, 15);
        const a = randomInt(3, 6); 
        const b = randomInt(1, 10);
        const c = a * x - b;
        return { x, a, b, c };
      },
      story: (v) => ({
        zh: `一个数字的 ${v.a} 倍减去 ${v.b} 等于 ${v.c}。`,
        en: `${v.a} times a number minus ${v.b} equals ${v.c}.`
      }),
      question: () => ({ zh: "这个数字是多少？", en: "What is the number?" }),
      unknown: () => ({ zh: "设这个数字是 x", en: "Let x be the number" }),
      hint: (v) => ({ zh: `${v.a}x - ${v.b} = ...`, en: `${v.a}x - ${v.b} = ...` })
    }
  ],
  [Difficulty.HARD]: [
    {
      // Type: a(x + b) = c
      gen: () => {
        const x = randomInt(2, 15);
        const b = randomInt(1, 10);
        const a = randomInt(2, 6);
        const c = a * (x + b);
        return { x, a, b, c };
      },
      story: (v) => ({
        zh: `两袋大米，第一袋重 ${v.b} 千克。如果你往每袋里都加 x 千克，那么两袋的总重量的 ${v.a} 倍甚至达到了 ${2*v.c} (哎呀搞错了，是每袋加完后的重量乘以 ${v.a} 等于 ${v.c})。简单点说：(${v.b} + x) 的 ${v.a} 倍是 ${v.c}。`,
        en: `Think of a number, add ${v.b} to it, then multiply the result by ${v.a}. You get ${v.c}.`
      }),
      question: () => ({ zh: "这个数是多少？", en: "What is the number?" }),
      unknown: () => ({ zh: "设这个数是 x", en: "Let x be the number" }),
      hint: (v) => ({ zh: `${v.a} × (x + ${v.b}) = ${v.c}`, en: `${v.a}(x + ${v.b}) = ${v.c}` })
    },
    {
      // Type: ax + b = cx + d
      gen: () => {
        const x = randomInt(2, 10);
        const c = randomInt(2, 5);
        const a = c + randomInt(1, 3); // Ensure a > c so x is positive
        const b = randomInt(1, 20);
        // ax + b = cx + d  =>  (a-c)x = d - b. 
        // Let d - b = (a-c)x
        const diffX = a - c;
        const rhsVal = diffX * x;
        const d = rhsVal + b;
        return { x, a, b, c, d };
      },
      story: (v) => ({
        zh: `左边有 ${v.a} 盒积木和 ${v.b} 块散装积木。右边有 ${v.c} 盒积木和 ${v.d} 块散装积木。两边的积木总数一样多。`,
        en: `Left side has ${v.a} boxes of blocks and ${v.b} loose blocks. Right side has ${v.c} boxes and ${v.d} loose blocks. The total is equal.`
      }),
      question: () => ({ zh: "每盒积木有多少块？", en: "How many blocks are in one box?" }),
      unknown: () => ({ zh: "设每盒有 x 块", en: "Let x be the blocks per box" }),
      hint: (v) => ({ zh: `${v.a}x + ${v.b} = ${v.c}x + ${v.d}`, en: `${v.a}x + ${v.b} = ${v.c}x + ${v.d}` })
    }
  ]
};

export const generateOfflineProblem = (difficulty: Difficulty, lang: Language): MathProblem => {
  const group = templates[difficulty];
  const tpl = group[randomInt(0, group.length - 1)];
  const vars = tpl.gen();
  
  // Construct Equation String for display/check
  // Note: This is a simplified construction for the "answer key"
  let eq = "";
  if (vars.d !== undefined) {
    eq = `${vars.a}x + ${vars.b} = ${vars.c}x + ${vars.d}`;
  } else if (vars.item) {
    // Simple types
    eq = vars.b > vars.x ? `x + ${vars.a} = ${vars.b}` : `x - ${vars.a} = ${vars.b}`;
  } else {
    // Medium/Hard generic
    if (vars.c === vars.a * (vars.x + vars.b)) eq = `${vars.a}(x + ${vars.b}) = ${vars.c}`;
    else if (vars.c === vars.a * vars.x + vars.b) eq = `${vars.a}x + ${vars.b} = ${vars.c}`;
    else if (vars.c === vars.a * vars.x - vars.b) eq = `${vars.a}x - ${vars.b} = ${vars.c}`;
  }

  return {
    id: Date.now().toString(),
    story: tpl.story(vars)[lang],
    question: tpl.question(vars)[lang],
    unknownDefinition: tpl.unknown(vars)[lang],
    equation: eq,
    answer: vars.x,
    hint: tpl.hint(vars)[lang]
  };
};