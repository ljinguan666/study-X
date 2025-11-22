
import { Difficulty, MathProblem } from "../types";

// --- 1. DATA BANKS (The Building Blocks) ---

const NAMES = [
  "小明", "小红", "李华", "张伟", "王叔叔", "刘阿姨", "陈老师", 
  "爷爷", "奶奶", "小强", "丽丽", "大壮", "赵经理", "孙悟空", 
  "光头强", "喜羊羊", "小刚", "菲菲", "马丁", "罗伯特"
];

const LOCATIONS = [
  "超市", "文具店", "书店", "游乐园", "果园", "学校仓库", 
  "菜市场", "网上商城", "工厂", "实验室", "体育馆", "外太空空间站"
];

const CITIES = [
  "北京", "上海", "广州", "深圳", "成都", "杭州", "西安", "武汉"
];

const ITEMS_SHOPPING = [
  { name: "笔记本", unit: "本", priceRange: [5, 15] },
  { name: "钢笔", unit: "支", priceRange: [8, 25] },
  { name: "故事书", unit: "本", priceRange: [12, 35] },
  { name: "玩具车", unit: "辆", priceRange: [25, 60] },
  { name: "巧克力", unit: "盒", priceRange: [15, 40] },
  { name: "篮球", unit: "个", priceRange: [80, 150] },
  { name: "苹果", unit: "箱", priceRange: [30, 60] },
  { name: "牛奶", unit: "箱", priceRange: [40, 70] },
  { name: "薯片", unit: "包", priceRange: [4, 10] },
  { name: "画笔", unit: "套", priceRange: [18, 50] }
];

const ITEMS_COLLECTION = [
  { name: "邮票", unit: "张", verb: "收集" },
  { name: "玻璃珠", unit: "颗", verb: "收集" },
  { name: "贝壳", unit: "个", verb: "捡到" },
  { name: "卡片", unit: "张", verb: "收藏" },
  { name: "贴纸", unit: "张", verb: "购买" },
  { name: "书签", unit: "枚", verb: "制作" }
];

const ITEMS_WORK = [
  { name: "零件", unit: "个", verb: "加工" },
  { name: "树苗", unit: "棵", verb: "种植" },
  { name: "千纸鹤", unit: "只", verb: "折" },
  { name: "快递", unit: "件", verb: "打包" },
  { name: "传单", unit: "张", verb: "分发" }
];

// --- 2. HELPER FUNCTIONS ---

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// --- 3. SCENARIO GENERATORS (The Story Builders) ---

// --- EASY GENERATORS (One Step) ---

const genEasy_Total = () => {
  // Logic: a * x = total  (Groups) OR a + x = total (Sum)
  const type = Math.random() > 0.5 ? 'mult' : 'add';
  const person = pick(NAMES);
  const item = pick(ITEMS_SHOPPING);
  
  if (type === 'mult') {
    // e.g. Bought 5 books, total 50 yuan. How much per book?
    const count = randomInt(3, 9);
    const price = randomInt(item.priceRange[0], item.priceRange[1]);
    const total = count * price;
    
    return {
      story: `${person}去${pick(LOCATIONS)}买了 ${count} ${item.unit}${item.name}，一共花了 ${total} 元。`,
      question: `${item.name}的单价是多少元？`,
      unknown: `设${item.name}的单价为 x 元`,
      equation: `${count}x = ${total}`,
      answer: price,
      hint: `数量 × 单价 = 总金额`
    };
  } else {
    // e.g. Read 20 pages, need to reach 50. How many more?
    const colItem = pick(ITEMS_COLLECTION);
    const current = randomInt(10, 40);
    const add = randomInt(5, 20);
    const total = current + add;
    
    return {
      story: `${person}原本有 ${current} ${colItem.unit}${colItem.name}。今天${person}又${colItem.verb}了一些，现在总共有 ${total} ${colItem.unit}。`,
      question: `今天${colItem.verb}了多少${colItem.unit}${colItem.name}？`,
      unknown: `设今天${colItem.verb}了 x ${colItem.unit}`,
      equation: `${current} + x = ${total}`,
      answer: add,
      hint: `原有的 + 新增的 = 总数`
    };
  }
};

const genEasy_Diff = () => {
  // Logic: total - x = left
  const person = pick(NAMES);
  const totalMoney = randomInt(50, 100);
  const leftMoney = randomInt(10, 40);
  const spend = totalMoney - leftMoney;
  const loc = pick(LOCATIONS);
  
  return {
    story: `${person}带了 ${totalMoney} 元去${loc}。买完东西后，钱包里还剩 ${leftMoney} 元。`,
    question: `${person}买东西花了多少钱？`,
    unknown: `设花了 x 元`,
    equation: `${totalMoney} - x = ${leftMoney}`,
    answer: spend,
    hint: `带去的钱 - 花掉的钱 = 剩下的钱`
  };
};

const genEasy_Speed = () => {
  // Logic: speed * time = distance -> v * x = d
  const person = pick(NAMES);
  const vehicle = Math.random() > 0.5 ? "骑自行车" : "跑步";
  const speed = vehicle === "骑自行车" ? randomInt(12, 20) : randomInt(5, 10);
  const time = randomInt(2, 5);
  const dist = speed * time;

  return {
    story: `${person}周末去公园${vehicle}锻炼。${person}的速度是每小时 ${speed} 千米，一共跑了 ${dist} 千米。`,
    question: `${person}${vehicle}用了多少小时？`,
    unknown: `设用了 x 小时`,
    equation: `${speed}x = ${dist}`,
    answer: time,
    hint: `速度 × 时间 = 路程`
  };
};

// --- MEDIUM GENERATORS (Two Steps) ---

const genMedium_Shopping = () => {
  // Logic: ax + b = c (Price*Count + Extra = Total)
  const person = pick(NAMES);
  const item = pick(ITEMS_SHOPPING);
  const count = randomInt(3, 8);
  const price = randomInt(item.priceRange[0], item.priceRange[1]);
  const extraFee = randomInt(5, 15); // Shipping or packaging
  const extraName = Math.random() > 0.5 ? "运费" : "包装费";
  const total = count * price + extraFee;
  
  return {
    story: `${person}在${pick(LOCATIONS)}订购了 ${count} ${item.unit}${item.name}。除了商品本身的钱，还额外支付了 ${extraFee} 元的${extraName}，一共付款 ${total} 元。`,
    question: `每${item.unit}${item.name}的价格是多少？`,
    unknown: `设单价为 x 元`,
    equation: `${count}x + ${extraFee} = ${total}`,
    answer: price,
    hint: `(数量 × 单价) + ${extraName} = 总金额`
  };
};

const genMedium_Linear = () => {
  // Logic: a + bx = c (Base + Rate*Time = Total)
  const contexts = [
    { type: "taxi", name: "出租车", baseName: "起步价", rateName: "每公里", unit: "公里" },
    { type: "plant", name: "小树", baseName: "原始高度", rateName: "每天长", unit: "天" },
    { type: "member", name: "健身房", baseName: "入会费", rateName: "每月", unit: "个月" }
  ];
  const ctx = pick(contexts);
  
  const base = randomInt(5, 20); // a
  const rate = randomInt(2, 8);  // b
  const x = randomInt(3, 12);    // x
  const total = base + rate * x; // c
  
  let story = "";
  if (ctx.type === "taxi") {
    story = `${pick(NAMES)}坐出租车回家，起步价是 ${base} 元，之后每行驶1公里收费 ${rate} 元。到达目的地时，一共付了 ${total} 元。`,
    story = `${pick(NAMES)}坐出租车回家，起步价是 ${base} 元，之后每行驶1公里收费 ${rate} 元。到达目的地时，一共付了 ${total} 元。`;
  } else if (ctx.type === "plant") {
    story = `同学们种了一棵高 ${base} 厘米的${ctx.name}，它生长非常快，平均每天长高 ${rate} 厘米。经过一段时间后，它长到了 ${total} 厘米。`;
  } else {
    story = `${pick(NAMES)}办了一张${ctx.name}会员卡，交了 ${base} 元入会费，之后每月月费 ${rate}0 元。一段时间后累计花费 ${total}0 元。`; // Multiply by 10 for realism
    return {
        story,
        question: `办了几个月的会员？`,
        unknown: `设办了 x 个月`,
        equation: `${base}0 + ${rate}0x = ${total}0`,
        answer: x,
        hint: `入会费 + (月费 × 月数) = 总费用`
    };
  }
  
  return {
    story,
    question: `这里的未知数量（${ctx.unit}数）是多少？`,
    unknown: `设为 x ${ctx.unit}`,
    equation: `${base} + ${rate}x = ${total}`,
    answer: x,
    hint: `基础数值 + (变化率 × 数量) = 总数值`
  };
};

// --- HARD GENERATORS (Complex Logic) ---

const genHard_CatchUp = () => {
  // Logic: v1*x + headStart = v2*x  -> (v2-v1)x = headStart
  const slowSpeed = randomInt(40, 60);
  const speedDiff = randomInt(10, 30);
  const fastSpeed = slowSpeed + speedDiff;
  const time = randomInt(2, 6); // Hours
  const headStart = speedDiff * time; // Distance gap
  
  const p1 = "货车";
  const p2 = "轿车";

  return {
    story: `一辆${p1}和一辆${p2}同时从两地出发，同向而行。${p1}在前，每小时行 ${slowSpeed} 千米；${p2}在后，每小时行 ${fastSpeed} 千米。两车原本相距 ${headStart} 千米。`,
    question: `${p2}出发后多少小时能追上${p1}？`,
    unknown: `设${p2}出发 x 小时后追上`,
    equation: `${fastSpeed}x - ${slowSpeed}x = ${headStart}`,
    answer: time,
    hint: `(快车速度 × 时间) - (慢车速度 × 时间) = 初始距离`
  };
};

const genHard_Meeting = () => {
  // Logic: (v1 + v2) * x = Total Distance
  // Classic "Meeting" problem (相遇问题)
  const cityA = pick(CITIES);
  let cityB = pick(CITIES);
  while(cityA === cityB) cityB = pick(CITIES);

  const v1 = randomInt(60, 90); // Car A speed
  const v2 = randomInt(60, 90); // Car B speed
  const t = randomInt(3, 8);    // Time
  const totalDist = (v1 + v2) * t;

  return {
    story: `甲乙两车分别从${cityA}和${cityB}两地同时出发，相向而行。甲车每小时行 ${v1} 千米，乙车每小时行 ${v2} 千米。两地相距 ${totalDist} 千米。`,
    question: `经过多少小时两车相遇？`,
    unknown: `设经过 x 小时相遇`,
    equation: `(${v1} + ${v2})x = ${totalDist}`,
    answer: t,
    hint: `(甲车速度 + 乙车速度) × 时间 = 总路程`
  };
};

const genHard_Work = () => {
  // Logic: (v1 + v2) * x = Total
  const p1 = pick(NAMES);
  const p2 = pick(NAMES);
  if (p1 === p2) return genHard_Work(); // Retry
  
  const item = pick(ITEMS_WORK);
  const v1 = randomInt(10, 25);
  const v2 = randomInt(12, 28);
  const x = randomInt(4, 10);
  const total = (v1 + v2) * x;
  
  return {
    story: `${p1}和${p2}合作${item.verb}一批${item.name}。${p1}每天能${item.verb} ${v1} ${item.unit}，${p2}每天能${item.verb} ${v2} ${item.unit}。如果两人合作，几天能完成 ${total} ${item.unit}的任务？`,
    question: `两人合作需要多少天？`,
    unknown: `设需要 x 天`,
    equation: `(${v1} + ${v2})x = ${total}`,
    answer: x,
    hint: `(甲的速度 + 乙的速度) × 时间 = 总工作量`
  };
};

const genHard_EquationBalance = () => {
  // Logic: a + bx = c + dx
  // Comparison of two plans
  const x = randomInt(5, 15);
  const b = randomInt(10, 20); // Rate 1
  const d = randomInt(5, b - 2); // Rate 2 (smaller)
  
  // We need a + bx = c + dx
  // a - c = x(d - b) -> Wait, result must be positive.
  // a + bx = c + dx  (assuming b > d)
  // bx - dx = c - a
  // x(b - d) = c - a
  // Let (c - a) be a multiple of (b - d)
  const diffRate = b - d;
  const diffBase = diffRate * x;
  
  const a = randomInt(50, 200);
  const c = a + diffBase;
  
  const p1 = pick(NAMES);
  const p2 = pick(NAMES);

  return {
    story: `${p1}有存款 ${c} 元，以后每月存 ${d} 元。${p2}有存款 ${a} 元，以后每月存 ${b} 元。`,
    question: `几个月后，两人的存款总额一样多？`,
    unknown: `设 x 个月后`,
    equation: `${a} + ${b}x = ${c} + ${d}x`,
    answer: x,
    hint: `甲的本金 + (甲的月存 × 月数) = 乙的本金 + (乙的月存 × 月数)`
  };
};


// --- 4. MAIN GENERATOR FUNCTION ---

export const generateOfflineProblem = (difficulty: Difficulty, seenSignatures: Set<string>): MathProblem => {
  
  // Select Generator based on difficulty
  let generators: (() => any)[] = [];
  
  switch (difficulty) {
    case Difficulty.EASY:
      generators = [genEasy_Total, genEasy_Diff, genEasy_Speed];
      break;
    case Difficulty.MEDIUM:
      generators = [genMedium_Shopping, genMedium_Linear, genMedium_Linear]; // Double weight for linear/taxi
      break;
    case Difficulty.HARD:
      generators = [genHard_CatchUp, genHard_Meeting, genHard_Work, genHard_EquationBalance];
      break;
  }

  let bestProblem: MathProblem | null = null;
  let attempts = 0;

  // Retry loop to ensure uniqueness
  while (attempts < 50) {
    const genFn = pick(generators);
    const raw = genFn();
    
    // Create a signature based on the core numbers and question type
    // e.g. "MEDIUM-Shopping-3x+10=100"
    const signature = `${difficulty}-${raw.equation}-${raw.answer}`;
    
    if (!seenSignatures.has(signature)) {
      bestProblem = {
        id: Date.now().toString() + Math.random(),
        signature: signature,
        story: raw.story,
        question: raw.question,
        unknownDefinition: raw.unknown,
        equation: raw.equation,
        answer: raw.answer,
        hint: raw.hint
      };
      break;
    }
    attempts++;
  }

  // Fallback if we somehow fail to generate unique (unlikely with this combinatorics)
  if (!bestProblem) {
    const fallbackRaw = genEasy_Total();
    bestProblem = {
        id: Date.now().toString(),
        signature: "fallback-" + Date.now(),
        story: fallbackRaw.story,
        question: fallbackRaw.question,
        unknownDefinition: fallbackRaw.unknown,
        equation: fallbackRaw.equation,
        answer: fallbackRaw.answer,
        hint: fallbackRaw.hint
    };
  }

  return bestProblem;
};
