import { Difficulty, MathProblem } from "../types";

// Helper to get random integer between min and max (inclusive)
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

interface Template {
  story: (v: any) => string;
  question: (v: any) => string;
  unknown: (v: any) => string;
  hint: (v: any) => string;
  gen: () => any;
}

// --- Templates ---

const templates: Record<Difficulty, Template[]> = {
  [Difficulty.EASY]: [
    {
      // Scenario: Environmental / Recycling
      // Logic: x * a = b (Multiplication)
      gen: () => {
        const x = randomInt(15, 40); // Bottles per student
        const a = randomInt(4, 8);   // Number of students
        const b = x * a;             // Total
        return { x, a, b };
      },
      story: (v) => `为了保护环境，学校环保小组的 ${v.a} 名同学去海边捡塑料瓶。大家非常努力，平均每人捡了同样数量的瓶子，最后清点发现一共有 ${v.b} 个塑料瓶。`,
      question: () => "平均每位同学捡了多少个瓶子？",
      unknown: () => "设平均每人捡了 x 个",
      hint: (v) => `人数 × 每人捡的数量 = 总数量`
    },
    {
      // Scenario: Library / Reading
      // Logic: a + x = b (Addition)
      gen: () => {
        const a = randomInt(20, 50); // Pages read previously
        const x = randomInt(10, 30); // Pages read today
        const b = a + x;             // Total pages
        return { a, x, b };
      },
      story: (v) => `小明正在读一本《科学百科》。前几天他已经读了 ${v.a} 页，今天他又读了一些，现在正好读到了第 ${v.b} 页。`,
      question: () => "小明今天读了多少页？",
      unknown: () => "设今天读了 x 页",
      hint: (v) => `之前读的页数 + 今天读的页数 = 现在的总页数`
    },
    {
      // Scenario: Cooking / Recipes
      // Logic: b - x = a (Subtraction)
      gen: () => {
        const b = randomInt(500, 1000); // Total flour
        const x = randomInt(200, 400);  // Used
        const a = b - x;                // Left
        return { b, x, a };
      },
      story: (v) => `妈妈准备做蛋糕，厨房里的一袋面粉原本有 ${v.b} 克。倒出一部分做蛋糕后，称了一下，袋子里还剩下 ${v.a} 克面粉。`,
      question: () => "做蛋糕用掉了多少克面粉？",
      unknown: () => "设用掉了 x 克",
      hint: (v) => `原有的重量 - 用掉的重量 = 剩下的重量`
    }
  ],
  [Difficulty.MEDIUM]: [
    {
      // Scenario: Online Shopping
      // Logic: ax + b = c (Price * Qty + Shipping = Total)
      gen: () => {
        const x = randomInt(15, 45); // Price per book
        const a = randomInt(3, 6);   // Quantity
        const b = randomInt(6, 12);  // Shipping fee
        const c = a * x + b;         // Total
        return { x, a, b, c };
      },
      story: (v) => `小红在网上书店买了 ${v.a} 本同样的故事书。除了书款外，还需要支付 ${v.b} 元的快递费。最后付款总额是 ${v.c} 元。`,
      question: () => "一本故事书的价格是多少？",
      unknown: () => "设一本书 x 元",
      hint: (v) => `(书的数量 × 单价) + 快递费 = 总金额`
    },
    {
      // Scenario: Plant Growth / Observation
      // Logic: a + bx = c (Initial height + growth_rate * days = final height)
      gen: () => {
        const a = randomInt(5, 15);  // Initial height
        const b = randomInt(2, 4);   // Growth per day
        const x = randomInt(5, 14);  // Days
        const c = a + b * x;         // Final
        return { a, b, x, c };
      },
      story: (v) => `科学课上，同学们在观察竹子的生长。刚种下时竹子高 ${v.a} 厘米，之后它每天长高 ${v.b} 厘米。经过若干天观察，竹子长到了 ${v.c} 厘米。`,
      question: () => "同学们一共观察了多少天？",
      unknown: () => "设观察了 x 天",
      hint: (v) => `初始高度 + (每天长的 × 天数) = 最终高度`
    },
    {
      // Scenario: Family Trip / Gas
      // Logic: a - bx = c (Total fuel - consumption * hours = remaining)
      gen: () => {
        const a = randomInt(50, 70); // Tank capacity
        const b = randomInt(6, 9);   // Consumption per hour
        const x = randomInt(3, 5);   // Hours drove
        const c = a - b * x;         // Remaining
        return { a, b, x, c };
      },
      story: (v) => `爸爸开车带全家去郊游。出发时油箱里有 ${v.a} 升汽油。汽车平均每小时消耗 ${v.b} 升油。到达目的地后，油箱里还剩 ${v.c} 升油。`,
      question: () => "他们开了几个小时的车？",
      unknown: () => "设开了 x 小时",
      hint: (v) => `出发时的油量 - (每小时耗油 × 时间) = 剩下的油量`
    }
  ],
  [Difficulty.HARD]: [
    {
      // Scenario: Savings Plan Comparison
      // Logic: a + bx = c + dx (StartA + RateA * time = StartB + RateB * time)
      gen: () => {
        const x = randomInt(5, 12);  // Months
        
        const startA = randomInt(100, 300);
        const rateA = randomInt(20, 40);
        
        const rateB = randomInt(10, 15); // Slower rate
        // To make equal: startA + rateA*x = startB + rateB*x
        // startB = startA + (rateA - rateB) * x
        const startB = startA + (rateA - rateB) * x;
        
        return { x, startA, rateA, startB, rateB };
      },
      story: (v) => `小明和小强在进行存钱比赛。小明原本有 ${v.startA} 元，以后每个月存 ${v.rateA} 元；小强原本有 ${v.startB} 元，但每个月只存 ${v.rateB} 元。存了几个月后，两人的存款总数竟然一样多了。`,
      question: () => "他们存了多少个月？",
      unknown: () => "设存了 x 个月",
      hint: (v) => `小明的总钱数 = 小强的总钱数。分别列出两人的公式让它们相等。`
    },
    {
      // Scenario: Engineering / Tunnel
      // Logic: (a + b) * x = c (Combined work rate)
      gen: () => {
        const a = randomInt(10, 20); // Team A speed
        const b = randomInt(12, 25); // Team B speed
        const x = randomInt(8, 15);  // Days
        const c = (a + b) * x;       // Total length
        return { a, b, x, c };
      },
      story: (v) => `两个工程队从两端同时开凿一条长 ${v.c} 米的隧道。甲队每天开凿 ${v.a} 米，乙队每天开凿 ${v.b} 米。`,
      question: () => "经过多少天隧道可以贯通？",
      unknown: () => "设需要 x 天",
      hint: (v) => `(甲队每天米数 + 乙队每天米数) × 天数 = 总长度`
    },
    {
      // Scenario: Mobile Phone Plan
      // Logic: a + bx = cx (Base + rate*x = rate2*x)
      gen: () => {
        const x = randomInt(20, 60); // Minutes
        const a = randomInt(10, 30); // Base fee Plan A
        const b = 0.2;               // Rate Plan A
        const c = 0.5;               // Rate Plan B
        // a + 0.2x = 0.5x -> a = 0.3x -> x = a / 0.3
        // Let's simplify numbers to integers mostly
        // a + 2x = 5x (scaled by 10) -> a = 3x.
        // Let x be integer
        const xInt = randomInt(5, 15);
        const aInt = 3 * xInt; 
        
        return { 
          x: xInt, 
          a: aInt, 
          b: 2, // representing 0.2
          c: 5  // representing 0.5
        };
      },
      story: (v) => `李叔叔在对比两种电话套餐。A套餐每月月租 ${v.a} 元，通话费每分钟 ${v.b} 角；B套餐没有月租，通话费每分钟 ${v.c} 角。李叔叔算了一下，如果通话时长是某个特定时间，两种套餐的费用正好一样。`,
      question: () => "这个通话时长是多少分钟？",
      unknown: () => "设通话时长为 x 分钟",
      hint: (v) => `套餐A总费用 = 套餐B总费用。注意单位是“角”还是“元”。`
    }
  ]
};

export const generateOfflineProblem = (difficulty: Difficulty, seenSignatures: Set<string> = new Set()): MathProblem => {
  const group = templates[difficulty];
  
  let attempts = 0;
  let bestProblem: any = null;
  let isUnique = false;

  while (attempts < 50 && !isUnique) {
    const tplIndex = randomInt(0, group.length - 1);
    const tpl = group[tplIndex];
    const vars = tpl.gen();
    
    const signature = `${difficulty}-${tplIndex}-${JSON.stringify(vars)}`;

    if (!seenSignatures.has(signature)) {
      isUnique = true;
      
      // Construct Equation string for checking
      let eq = "";
      // Simple heuristic based on vars present
      if (vars.startA !== undefined) {
         eq = `${vars.startA} + ${vars.rateA}x = ${vars.startB} + ${vars.rateB}x`;
      } else if (vars.c !== undefined && vars.b !== undefined && vars.a !== undefined && vars.x !== undefined) {
         // Logic matching
         // Engineering: (a+b)x=c
         if (Math.abs((vars.a + vars.b) * vars.x - vars.c) < 0.1) {
            eq = `(${vars.a} + ${vars.b})x = ${vars.c}`;
         } 
         // Mobile: a + bx = cx
         else if (vars.a + vars.b * vars.x === vars.c * vars.x) {
            eq = `${vars.a} + ${vars.b}x = ${vars.c}x`;
         }
         // Trip: a - bx = c
         else if (Math.abs(vars.a - vars.b * vars.x - vars.c) < 0.1) {
            eq = `${vars.a} - ${vars.b}x = ${vars.c}`;
         }
         // Plant: a + bx = c
         else if (Math.abs(vars.a + vars.b * vars.x - vars.c) < 0.1) {
             eq = `${vars.a} + ${vars.b}x = ${vars.c}`;
         }
         // Shopping: ax + b = c
         else {
             eq = `${vars.a}x + ${vars.b} = ${vars.c}`;
         }
      } else {
         // Easy templates
         if (vars.a * vars.x === vars.b) eq = `${vars.a}x = ${vars.b}`;
         else if (vars.a + vars.x === vars.b) eq = `${vars.a} + x = ${vars.b}`;
         else if (vars.b - vars.x === vars.a) eq = `${vars.b} - x = ${vars.a}`;
      }

      bestProblem = {
        id: Date.now().toString() + Math.random(),
        signature: signature,
        story: tpl.story(vars),
        question: tpl.question(vars),
        unknownDefinition: tpl.unknown(vars),
        equation: eq,
        answer: vars.x,
        hint: tpl.hint(vars)
      };
    }
    attempts++;
  }

  // Fallback if loops fail
  if (!bestProblem) {
     const tpl = group[0];
     const vars = tpl.gen();
     bestProblem = {
        id: Date.now().toString(),
        signature: "fallback",
        story: tpl.story(vars),
        question: tpl.question(vars),
        unknownDefinition: tpl.unknown(vars),
        equation: "x=0",
        answer: vars.x,
        hint: tpl.hint(vars)
     };
  }

  return bestProblem;
};