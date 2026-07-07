import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface DrinkRecommendation {
  name: string;
  nameEn: string;
  description: string;
  ingredients: { name: string; amount: number; unit: string; type: string }[];
  steps: string[];
  tags: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  abv: number;
  glassType: string;
  iceType: string;
  reason: string;
}

export async function getRecommendations(params: {
  alcohols: string[];
  mixers: string[];
  flavors: string[];
  strength: string;
  availableIngredients: string[];
}): Promise<DrinkRecommendation[]> {
  const prompt = `You are an expert bartender. Based on the user's available ingredients, preferred flavors, and desired alcohol strength, recommend 3 cocktails.

Available Alcohols: ${params.alcohols.join(', ') || 'None'}
Available Mixers/Garnishes: ${params.mixers.join(', ') || 'None'}
Preferred Flavors: ${params.flavors.join(', ') || 'Any'}
Desired Strength: ${params.strength}

For each drink, provide a JSON array with objects containing:
- name: Drink name in Chinese
- nameEn: Drink name in English
- description: Brief description (Chinese)
- ingredients: Array of { name, amount (in ml), unit: "ml", type: "alcohol"|"mixer"|"garnish" }
- steps: Array of preparation steps in Chinese
- tags: Flavor tags array
- difficulty: "easy"|"medium"|"hard"
- abv: estimated ABV percentage
- glassType: "highball"|"rocks"|"coupe"|"martini"|"shot"|"punch"
- iceType: "cubes"|"crushed"|"large"|"none"
- reason: Why this drink suits the user (Chinese)

Return ONLY valid JSON array, no markdown. Calculate actual ABV based on alcohol volume / total volume.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
      max_tokens: 2000,
    });

    const content = completion.choices[0]?.message?.content || '[]';
    // Clean up any markdown code block wrappers
    const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('AI recommendation error:', error);
    return getFallbackRecommendations(params);
  }
}

export async function createCustomDrink(params: {
  ingredients: string[];
  description?: string;
}): Promise<DrinkRecommendation> {
  const prompt = `You are a creative bartender. Create a unique cocktail recipe using ONLY these ingredients:
${params.ingredients.join(', ')}
${params.description ? `User's vision: ${params.description}` : ''}

Provide a JSON object with:
- name: Creative drink name in Chinese
- nameEn: Drink name in English
- description: Brief description (Chinese)
- ingredients: Array of { name, amount (in ml), unit: "ml", type: "alcohol"|"mixer"|"garnish" }
- steps: Array of preparation steps in Chinese
- tags: Flavor tags array
- difficulty: "easy"|"medium"|"hard"
- abv: estimated ABV percentage
- glassType: "highball"|"rocks"|"coupe"|"martini"|"shot"|"punch"
- iceType: "cubes"|"crushed"|"large"|"none"
- reason: Creative inspiration behind this drink (Chinese)

Return ONLY valid JSON object, no markdown.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.9,
      max_tokens: 1000,
    });

    const content = completion.choices[0]?.message?.content || '{}';
    const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('AI create error:', error);
    return getFallbackCustomDrink(params.ingredients);
  }
}

function getFallbackRecommendations(params: any): DrinkRecommendation[] {
  const recommendations: DrinkRecommendation[] = [];

  if (params.alcohols.some((a: string) => a.includes('威士忌') || a.toLowerCase().includes('whisky'))) {
    if (params.mixers.some((m: string) => m.includes('可乐') || m.toLowerCase().includes('cola'))) {
      recommendations.push({
        name: '自由古巴',
        nameEn: 'Cuba Libre',
        description: '经典威士忌可乐调酒，简单易做',
        ingredients: [
          { name: '威士忌', amount: 45, unit: 'ml', type: 'alcohol' },
          { name: '可乐', amount: 120, unit: 'ml', type: 'mixer' },
          { name: '柠檬', amount: 1, unit: 'slice', type: 'garnish' },
        ],
        steps: ['在杯中加入冰块', '倒入威士忌', '加入可乐', '挤入柠檬汁并放入柠檬片装饰'],
        tags: ['甜', '清爽', '果味'],
        difficulty: 'easy',
        abv: 12,
        glassType: 'highball',
        iceType: 'cubes',
        reason: '经典搭配，口感顺滑',
      });
    }
    recommendations.push({
      name: '威士忌酸',
      nameEn: 'Whiskey Sour',
      description: '酸甜平衡的经典鸡尾酒',
      ingredients: [
        { name: '威士忌', amount: 60, unit: 'ml', type: 'alcohol' },
        { name: '柠檬汁', amount: 20, unit: 'ml', type: 'mixer' },
        { name: '糖浆', amount: 15, unit: 'ml', type: 'mixer' },
      ],
      steps: ['将所有材料加入摇酒壶', '加入冰块充分摇匀', '滤入杯中'],
      tags: ['酸', '甜', '清爽'],
      difficulty: 'medium',
      abv: 18,
      glassType: 'rocks',
      iceType: 'cubes',
      reason: '酸甜平衡，适合入门',
    });
  }

  if (params.alcohols.some((a: string) => a.includes('金酒') || a.toLowerCase().includes('gin'))) {
    recommendations.push({
      name: '金汤力',
      nameEn: 'Gin & Tonic',
      description: '清爽经典的金酒调酒',
      ingredients: [
        { name: '金酒', amount: 45, unit: 'ml', type: 'alcohol' },
        { name: '汤力水', amount: 120, unit: 'ml', type: 'mixer' },
        { name: '青柠', amount: 1, unit: 'slice', type: 'garnish' },
      ],
      steps: ['在杯中加入冰块', '倒入金酒', '加满汤力水', '放入青柠片装饰'],
      tags: ['清爽', '苦', '柑橘味'],
      difficulty: 'easy',
      abv: 10,
      glassType: 'highball',
      iceType: 'cubes',
      reason: '金酒与汤力水的完美组合',
    });
  }

  if (params.alcohols.some((a: string) => a.includes('伏特加') || a.toLowerCase().includes('vodka'))) {
    recommendations.push({
      name: '莫斯科骡子',
      nameEn: 'Moscow Mule',
      description: '清爽的姜汁啤酒调酒',
      ingredients: [
        { name: '伏特加', amount: 45, unit: 'ml', type: 'alcohol' },
        { name: '姜汁啤酒', amount: 120, unit: 'ml', type: 'mixer' },
        { name: '青柠汁', amount: 15, unit: 'ml', type: 'mixer' },
      ],
      steps: ['在铜杯中加入冰块', '倒入伏特加和青柠汁', '加满姜汁啤酒搅拌'],
      tags: ['清爽', '酸', '果味'],
      difficulty: 'easy',
      abv: 10,
      glassType: 'highball',
      iceType: 'cubes',
      reason: '清爽开胃，适合夏天',
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      name: 'Highball',
      nameEn: 'Highball',
      description: '万能的Highball调法',
      ingredients: [
        { name: '任意烈酒', amount: 45, unit: 'ml', type: 'alcohol' },
        { name: '苏打水', amount: 120, unit: 'ml', type: 'mixer' },
      ],
      steps: ['在杯中加入冰块', '倒入烈酒', '加满苏打水轻轻搅拌'],
      tags: ['清爽'],
      difficulty: 'easy',
      abv: 10,
      glassType: 'highball',
      iceType: 'cubes',
      reason: '简单万能的调法',
    });
  }

  return recommendations.slice(0, 3);
}

function getFallbackCustomDrink(ingredients: string[]): DrinkRecommendation {
  return {
    name: '今晚特调',
    nameEn: 'Tonight Special',
    description: '根据你的材料创意调制',
    ingredients: ingredients.map(name => ({
      name,
      amount: 30,
      unit: 'ml',
      type: name.includes('汁') || name.includes('水') ? 'mixer' : 'alcohol',
    })),
    steps: ['在杯中加入冰块', '依次倒入材料', '轻轻搅拌均匀', '品尝并调整'],
    tags: ['创意'],
    difficulty: 'medium',
    abv: 12,
    glassType: 'highball',
    iceType: 'cubes',
    reason: '你的独特创意组合',
  };
}
