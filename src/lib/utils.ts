import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateABV(alcoholAmount: number, totalVolume: number, alcoholABV: number = 40): number {
  const pureAlcohol = alcoholAmount * (alcoholABV / 100);
  return Math.round((pureAlcohol / totalVolume) * 100 * 10) / 10;
}

export function getStrengthLabel(abv: number): string {
  if (abv < 5) return '微醺';
  if (abv < 8) return '轻度';
  if (abv < 15) return '中度';
  if (abv < 25) return '偏烈';
  return '烈酒模式';
}

export function getStrengthColor(abv: number): string {
  if (abv < 5) return 'text-cyan-400';
  if (abv < 8) return 'text-green-400';
  if (abv < 15) return 'text-yellow-400';
  if (abv < 25) return 'text-orange-400';
  return 'text-red-400';
}

export function getDifficultyLabel(difficulty: string): string {
  const labels: Record<string, string> = {
    easy: '简单',
    medium: '中等',
    hard: '困难',
  };
  return labels[difficulty] || difficulty;
}

export function getDifficultyColor(difficulty: string): string {
  const colors: Record<string, string> = {
    easy: 'bg-green-500/20 text-green-400',
    medium: 'bg-yellow-500/20 text-yellow-400',
    hard: 'bg-red-500/20 text-red-400',
  };
  return colors[difficulty] || 'bg-gray-500/20 text-gray-400';
}

export function getGlassTypeLabel(glassType: string): string {
  const labels: Record<string, string> = {
    highball: '高球杯',
    rocks: '古典杯',
    coupe: '碟形杯',
    martini: '马天尼杯',
    shot: '烈酒杯',
    punch: '潘趣杯',
  };
  return labels[glassType] || glassType;
}

export function getIceTypeLabel(iceType: string): string {
  const labels: Record<string, string> = {
    cubes: '方冰',
    crushed: '碎冰',
    large: '大冰块',
    none: '不加冰',
  };
  return labels[iceType] || iceType;
}

export function getFlavorLabel(flavorId: string): string {
  const labels: Record<string, string> = {
    sweet: '甜',
    sour: '酸',
    bitter: '苦',
    refreshing: '清爽',
    fruity: '果味',
    creamy: '奶味',
    coffee: '咖啡味',
    citrus: '柑橘味',
    rich: '浓郁型',
    spicy: '辛辣',
    herbal: '草本',
    floral: '花香',
    smoky: '烟熏',
    umami: '鲜味',
    tropical: '热带',
    nutty: '坚果',
    chocolate: '巧克力',
    vanilla: '香草',
    caramel: '焦糖',
    warming: '温暖型',
    light: '轻盈',
    complex: '层次丰富',
  };
  return labels[flavorId] || flavorId;
}

export function getDrinkEmoji(drink: { tags: string[]; category?: string; glassType?: string }): string {
  if (drink.tags.includes('coffee')) return '☕';
  if (drink.tags.includes('tropical')) return '🌴';
  if (drink.tags.includes('smoky')) return '🔥';
  if (drink.tags.includes('floral')) return '🌸';
  if (drink.tags.includes('creamy')) return '🍦';
  if (drink.tags.includes('chocolate')) return '🍫';
  if (drink.tags.includes('warming')) return '🧣';
  if (drink.tags.includes('spicy')) return '🌶️';
  if (drink.tags.includes('herbal')) return '🌿';
  if (drink.tags.includes('nutty')) return '🌰';
  if (drink.tags.includes('citrus')) return '🍋';
  if (drink.tags.includes('fruity')) return '🍊';
  if (drink.tags.includes('bitter')) return '🚬';
  if (drink.category === 'tiki') return '🏝️';
  if (drink.category === 'shot') return '🎯';
  if (drink.category === 'hot') return '🍵';
  if (drink.category === 'mocktail') return '🧃';
  if (drink.category === 'japanese') return '🇯🇵';
  if (drink.category === 'korean') return '🇰🇷';
  if (drink.category === 'chinese') return '🇨🇳';
  if (drink.category === 'asian') return '🌏';
  if (drink.glassType === 'martini') return '🍸';
  if (drink.glassType === 'coupe') return '🥂';
  if (drink.glassType === 'shot') return '🥃';
  if (drink.glassType === 'punch') return '🍹';
  return '🍸';
}

export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    classic: '经典',
    modern: '现代',
    tiki: 'Tiki',
    japanese: '日式',
    korean: '韩式',
    chinese: '中式',
    asian: '亚洲',
    hot: '热饮',
    shot: 'Shot',
    mocktail: '无酒精',
    wine: '葡萄酒系',
  };
  return labels[category] || category;
}

export function getCategoryEmoji(category: string): string {
  const emojis: Record<string, string> = {
    classic: '🍸',
    modern: '✨',
    tiki: '🏝️',
    japanese: '🇯🇵',
    korean: '🇰🇷',
    chinese: '🇨🇳',
    asian: '🌏',
    hot: '🍵',
    shot: '🎯',
    mocktail: '🧃',
    wine: '🍷',
  };
  return emojis[category] || '🍸';
}

export function getFlavorColor(flavorId: string): string {
  const colors: Record<string, string> = {
    sweet: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    sour: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    bitter: 'bg-amber-700/20 text-amber-400 border-amber-700/30',
    refreshing: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    fruity: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    creamy: 'bg-cream-500/20 text-cream-400 border-cream-500/30',
    coffee: 'bg-stone-700/20 text-stone-400 border-stone-700/30',
    citrus: 'bg-yellow-400/20 text-yellow-300 border-yellow-400/30',
    rich: 'bg-red-800/20 text-red-400 border-red-800/30',
  };
  return colors[flavorId] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
}
