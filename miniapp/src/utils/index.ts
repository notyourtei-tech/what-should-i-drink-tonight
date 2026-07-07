// Drink data utilities - 与 Web 端共享逻辑
// 精简版，包含小程序常用函数

export interface DrinkData {
  id: string;
  name: string;
  nameEn: string;
  category?: string;
  description: string;
  ingredients: { name: string; amount?: number; unit?: string; type: string }[];
  steps: string[];
  tags: string[];
  difficulty: string;
  abv: number;
  glassType: string;
  iceType: string;
}

// 难度标签映射
export function getDifficultyLabel(difficulty: string): string {
  const labels: Record<string, string> = {
    easy: '简单',
    medium: '中等',
    hard: '困难',
  };
  return labels[difficulty] || difficulty;
}

// 口味标签映射
export function getFlavorLabel(flavorId: string): string {
  const labels: Record<string, string> = {
    sweet: '甜', sour: '酸', bitter: '苦',
    refreshing: '清爽', fruity: '果味', creamy: '奶味',
    coffee: '咖啡味', citrus: '柑橘味', rich: '浓郁型',
    spicy: '辛辣', herbal: '草本', floral: '花香',
    smoky: '烟熏', tropical: '热带', nutty: '坚果',
    chocolate: '巧克力', vanilla: '香草', caramel: '焦糖',
    warming: '温暖型', light: '轻盈', complex: '层次丰富',
  };
  return labels[flavorId] || flavorId;
}

// 酒精度标签
export function getStrengthLabel(abv: number): string {
  if (abv < 5) return '微醺';
  if (abv < 8) return '轻度';
  if (abv < 15) return '中度';
  if (abv < 25) return '偏烈';
  return '烈酒模式';
}

// Emoji 映射
export function getDrinkEmoji(drink: { tags?: string[]; category?: string; glassType?: string }): string {
  const tags = drink.tags || [];
  if (tags.includes('coffee')) return '☕';
  if (tags.includes('tropical')) return '🌴';
  if (tags.includes('smoky')) return '🔥';
  if (tags.includes('floral')) return '🌸';
  if (tags.includes('creamy')) return '🍦';
  if (tags.includes('chocolate')) return '🍫';
  if (tags.includes('warming')) return '🧣';
  if (tags.includes('spicy')) return '🌶️';
  if (tags.includes('herbal')) return '🌿';
  if (tags.includes('nutty')) return '🌰';
  if (tags.includes('citrus')) return '🍋';
  if (tags.includes('fruity')) return '🍊';
  if (tags.includes('bitter')) return '🚬';
  if (drink.category === 'tiki') return '🏝️';
  if (drink.category === 'shot') return '🎯';
  if (drink.category === 'hot') return '🍵';
  if (drink.category === 'mocktail') return '🧃';
  if (drink.glassType === 'martini') return '🍸';
  if (drink.glassType === 'coupe') return '🥂';
  if (drink.glassType === 'shot') return '🥃';
  return '🍸';
}

// 酒类分类
export const ALCOHOL_CATEGORIES = [
  { id: 'whisky', name: '威士忌', icon: '🥃', subtypes: ['波本', '苏格兰', '爱尔兰', '黑麦'] },
  { id: 'vodka', name: '伏特加', icon: '🍶', subtypes: ['原味', '调味'] },
  { id: 'gin', name: '金酒', icon: '🌿', subtypes: ['伦敦干', '老汤姆'] },
  { id: 'rum', name: '朗姆酒', icon: '🌴', subtypes: ['白朗姆', '黑朗姆', '金朗姆'] },
  { id: 'tequila', name: '龙舌兰', icon: '🌵', subtypes: ['Blanco', 'Reposado', 'Añejo'] },
  { id: 'brandy', name: '白兰地', icon: '🍇', subtypes: ['VS', 'VSOP', 'XO'] },
  { id: 'liqueur', name: '利口酒', icon: '🍒', subtypes: ['咖啡', '橙味', '薄荷', '杏仁'] },
  { id: 'wine', name: '葡萄酒', icon: '🍷', subtypes: ['红', '白', '起泡'] },
  { id: 'soju', name: '烧酒/白酒', icon: '🍶', subtypes: ['烧酒', '白酒', '清酒'] },
];

// 配料分类
export const MIXER_CATEGORIES = [
  { id: 'juice', name: '果汁', icon: '🧃' },
  { id: 'soda', name: '碳酸饮料', icon: '🥤' },
  { id: 'syrup', name: '糖浆', icon: '🍯' },
  { id: 'dairy', name: '奶制品', icon: '🥛' },
  { id: 'fruit', name: '水果', icon: '🍋' },
  { id: 'herb', name: '香草/香料', icon: '🌿' },
  { id: 'bitters', name: '苦精', icon: '💧' },
];

// 口味标签
export const FLAVOR_TAGS = [
  { id: 'sweet', name: '甜' },
  { id: 'sour', name: '酸' },
  { id: 'bitter', name: '苦' },
  { id: 'refreshing', name: '清爽' },
  { id: 'fruity', name: '果味' },
  { id: 'creamy', name: '奶味' },
  { id: 'coffee', name: '咖啡味' },
  { id: 'citrus', name: '柑橘味' },
  { id: 'rich', name: '浓郁型' },
  { id: 'spicy', name: '辛辣' },
  { id: 'herbal', name: '草本' },
  { id: 'floral', name: '花香' },
  { id: 'smoky', name: '烟熏' },
  { id: 'tropical', name: '热带' },
  { id: 'chocolate', name: '巧克力' },
  { id: 'warming', name: '温暖型' },
];

// 酒精度级别
export const STRENGTH_LEVELS = [
  { id: 'light', name: '微醺', min: 3, max: 5 },
  { id: 'easy', name: '轻度', min: 5, max: 8 },
  { id: 'medium', name: '中度', min: 8, max: 15 },
  { id: 'strong', name: '偏烈', min: 15, max: 25 },
  { id: 'fire', name: '烈酒模式', min: 25, max: 60 },
];
