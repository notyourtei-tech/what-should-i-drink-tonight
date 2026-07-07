/**
 * 酒单页 - 浏览经典鸡尾酒 + AI创意调酒
 */
import { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { FLAVOR_TAGS, STRENGTH_LEVELS, getDrinkEmoji, getFlavorLabel, getDifficultyLabel } from '../../utils/index';
import { createCustomDrink, AIRecommendation } from '../../services/api';
import './index.scss';

// 经典鸡尾酒数据集（内置精简版）
const CLASSIC_DRINKS = [
  { id: 'old-fashioned', name: '古典鸡尾酒', nameEn: 'Old Fashioned', category: 'classic', description: '威士忌、苦精、糖和橙皮的简约交响', tags: ['bitter', 'rich', 'smoky'], difficulty: 'easy', abv: 32, glassType: 'rocks' },
  { id: 'martini', name: '马天尼', nameEn: 'Martini', category: 'classic', description: '金酒与干味美思的优雅共舞', tags: ['citrus', 'floral'], difficulty: 'medium', abv: 28, glassType: 'martini' },
  { id: 'margarita', name: '玛格丽特', nameEn: 'Margarita', category: 'classic', description: '龙舌兰、橙皮利口酒和青柠的完美搭配', tags: ['sour', 'citrus', 'refreshing'], difficulty: 'easy', abv: 18, glassType: 'coupe' },
  { id: 'mojito', name: '莫吉托', nameEn: 'Mojito', category: 'classic', description: '朗姆酒、薄荷、青柠和苏打水的清爽组合', tags: ['refreshing', 'citrus', 'herbal'], difficulty: 'easy', abv: 12, glassType: 'highball' },
  { id: 'negroni', name: '尼格罗尼', nameEn: 'Negroni', category: 'classic', description: '金酒、甜味美思和金巴利的苦甜三部曲', tags: ['bitter', 'sweet', 'complex'], difficulty: 'easy', abv: 24, glassType: 'rocks' },
  { id: 'whisky-sour', name: '威士忌酸', nameEn: 'Whiskey Sour', category: 'classic', description: '波本威士忌配柠檬汁和糖浆，酸甜平衡', tags: ['sour', 'sweet'], difficulty: 'easy', abv: 18, glassType: 'rocks' },
  { id: 'gin-tonic', name: '金汤力', nameEn: 'Gin & Tonic', category: 'classic', description: '金酒与汤力水的清爽经典', tags: ['refreshing', 'citrus', 'bitter'], difficulty: 'easy', abv: 10, glassType: 'highball' },
  { id: 'daiquiri', name: '得其利', nameEn: 'Daiquiri', category: 'classic', description: '朗姆酒、青柠汁和糖的极简主义', tags: ['sour', 'citrus', 'refreshing'], difficulty: 'easy', abv: 16, glassType: 'coupe' },
  { id: 'moscow-mule', name: '莫斯科骡子', nameEn: 'Moscow Mule', category: 'classic', description: '伏特加搭配姜汁啤酒与青柠', tags: ['refreshing', 'spicy', 'citrus'], difficulty: 'easy', abv: 10, glassType: 'highball' },
  { id: 'cosmopolitan', name: '大都会', nameEn: 'Cosmopolitan', category: 'classic', description: '伏特加、蔓越莓汁和橙皮利口酒的优雅粉红', tags: ['sour', 'fruity', 'refreshing'], difficulty: 'easy', abv: 20, glassType: 'martini' },
  { id: 'pina-colada', name: '椰林飘香', nameEn: 'Piña Colada', category: 'classic', description: '朗姆酒、椰奶和菠萝汁的热带风情', tags: ['sweet', 'creamy', 'tropical'], difficulty: 'medium', abv: 12, glassType: 'highball' },
  { id: 'hot-toddy', name: '热托地', nameEn: 'Hot Toddy', category: 'hot', description: '威士忌、蜂蜜、柠檬热饮，冬日暖身首选', tags: ['sweet', 'citrus', 'warming'], difficulty: 'easy', abv: 10, glassType: 'highball' },
];

export default function DrinksPage() {
  const [search, setSearch] = useState('');
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);
  const [selectedStrength, setSelectedStrength] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showAICreate, setShowAICreate] = useState(false);
  const [aiIngredients, setAiIngredients] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AIRecommendation | null>(null);

  // 从参数初始化筛选
  useEffect(() => {
    const instance = Taro.getCurrentInstance();
    const params = instance.router?.params || {};
    if (params.flavors) setSelectedFlavors(params.flavors.split(','));
    if (params.strength) setSelectedStrength(params.strength);
  }, []);

  const filteredDrinks = CLASSIC_DRINKS.filter(drink => {
    if (search && !drink.name.includes(search) && !drink.nameEn.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (selectedFlavors.length > 0 && !selectedFlavors.some(f => drink.tags.includes(f))) {
      return false;
    }
    if (selectedStrength) {
      const level = STRENGTH_LEVELS.find(l => l.id === selectedStrength);
      if (level && (drink.abv < level.min || drink.abv > level.max)) return false;
    }
    return true;
  });

  const handleAICreate = async () => {
    if (!aiIngredients.trim()) return;
    setAiLoading(true);
    try {
      const ingredients = aiIngredients.split(/[,，、]/).map(s => s.trim()).filter(Boolean);
      const result = await createCustomDrink(ingredients);
      if (result) setAiResult(result);
    } catch {
      Taro.showToast({ title: 'AI 创作失败，请重试', icon: 'none' });
    } finally {
      setAiLoading(false);
    }
  };

  const clearFilters = () => {
    setSelectedFlavors([]);
    setSelectedStrength('');
  };

  return (
    <View className="drinks-page">
      <View className="page-header">
        <Text className="page-title">
          <Text className="gradient-text">酒单</Text>
        </Text>
        <Text className="page-desc">发现经典与创意鸡尾酒</Text>
      </View>

      {/* 搜索 + 筛选 + AI */}
      <View className="toolbar">
        <View className="search-bar">
          <Text>🔍</Text>
          <input
            placeholder="搜索鸡尾酒..."
            value={search}
            onInput={e => setSearch((e.detail as any).value)}
          />
        </View>
        <View className="toolbar-buttons">
          <View
            className={`btn-ghost ${showFilters ? 'chip-active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Text>筛选</Text>
          </View>
          <View className="btn-ai" onClick={() => setShowAICreate(true)}>
            <Text>✨ AI创意</Text>
          </View>
        </View>
      </View>

      {/* 筛选面板 */}
      {showFilters && (
        <View className="filter-panel">
          <Text className="section-label">口味偏好</Text>
          <View className="chip-scroll">
            {FLAVOR_TAGS.map(flavor => (
              <View
                key={flavor.id}
                className={`chip ${selectedFlavors.includes(flavor.id) ? 'chip-active' : ''}`}
                onClick={() => setSelectedFlavors(prev =>
                  prev.includes(flavor.id) ? prev.filter(f => f !== flavor.id) : [...prev, flavor.id]
                )}
              >
                {flavor.name}
              </View>
            ))}
          </View>

          <Text className="section-label">酒精度</Text>
          <View className="chip-scroll">
            {STRENGTH_LEVELS.map(level => (
              <View
                key={level.id}
                className={`chip ${selectedStrength === level.id ? 'chip-active' : ''}`}
                onClick={() => setSelectedStrength(prev => prev === level.id ? '' : level.id)}
              >
                {level.name}
              </View>
            ))}
          </View>

          <View className="btn-ghost" onClick={clearFilters}>
            <Text>清除筛选</Text>
          </View>
        </View>
      )}

      {/* 酒单网格 */}
      <ScrollView scrollY className="drinks-scroll">
        {filteredDrinks.length > 0 ? (
          <View className="grid-2 drinks-grid">
            {filteredDrinks.map(drink => (
              <View key={drink.id} className="drink-card card-hover">
                <View className="drink-card-img">
                  <Text className="drink-card-emoji">{getDrinkEmoji(drink)}</Text>
                  <View className={`drink-card-badge ${drink.difficulty === 'easy' ? 'badge-green' : 'badge-yellow'}`}>
                    <Text className="badge-text">{getDifficultyLabel(drink.difficulty)}</Text>
                  </View>
                </View>
                <View className="drink-card-info">
                  <Text className="drink-card-name">{drink.name}</Text>
                  <Text className="drink-card-en">{drink.nameEn}</Text>
                  <Text className="drink-card-desc">{drink.description}</Text>
                  <View className="drink-card-tags">
                    {drink.tags.slice(0, 2).map(tag => (
                      <Text key={tag} className="tag">{getFlavorLabel(tag)}</Text>
                    ))}
                  </View>
                  <View className="drink-card-footer">
                    <Text className="drink-card-abv">
                      {drink.abv}%
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View className="empty-state">
            <Text className="empty-icon">🔍</Text>
            <Text className="empty-text">没有找到匹配的鸡尾酒</Text>
            <Text className="empty-hint">试试调整筛选条件</Text>
          </View>
        )}
      </ScrollView>

      {/* AI 创意调酒弹窗 */}
      {showAICreate && (
        <View>
          <View className="bottom-sheet-overlay" onClick={() => { setShowAICreate(false); setAiResult(null); }} />
          <View className="bottom-sheet">
            <View className="bottom-sheet-handle" />
            {!aiResult ? (
              <View style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <Text style={{ fontSize: '32px', fontWeight: 600 }}>
                  <Text className="gradient-text">✨ AI 创意调酒</Text>
                </Text>
                <Text style={{ fontSize: '26px', color: 'rgba(255,255,255,0.5)' }}>
                  输入你拥有的材料，AI会为你创造独特的鸡尾酒配方
                </Text>
                <textarea
                  className="input"
                  style={{ height: '160px', padding: '20px' }}
                  placeholder="例如：威士忌、可乐、蜂蜜、柠檬"
                  value={aiIngredients}
                  onInput={e => setAiIngredients((e.detail as any).value)}
                />
                <View
                  className={`btn-primary ${(!aiIngredients.trim() || aiLoading) ? 'btn-disabled' : ''}`}
                  onClick={handleAICreate}
                >
                  <Text>{aiLoading ? 'AI 正在创作...' : '✨ 让 AI 创作'}</Text>
                </View>
              </View>
            ) : (
              <View style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '80vh' }}>
                <Text style={{ fontSize: '48px', textAlign: 'center' }}>🍸</Text>
                <Text style={{ fontSize: '36px', fontWeight: 700, textAlign: 'center' }} className="gradient-text">
                  {aiResult.name}
                </Text>
                <Text style={{ fontSize: '24px', color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>
                  {aiResult.nameEn}
                </Text>
                <Text style={{ fontSize: '26px', color: 'rgba(255,255,255,0.6)', textAlign: 'center' }}>
                  {aiResult.description}
                </Text>

                <View className="card">
                  <Text style={{ fontSize: '24px', color: 'rgba(255,255,255,0.4)', marginBottom: '12px' }}>材料</Text>
                  {aiResult.ingredients?.map((ing, i) => (
                    <View key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                      <Text style={{ fontSize: '26px', color: 'rgba(255,255,255,0.7)' }}>{ing.name}</Text>
                      <Text style={{ fontSize: '24px', color: 'rgba(255,255,255,0.4)' }}>
                        {ing.amount}{ing.unit}
                      </Text>
                    </View>
                  ))}
                </View>

                <View className="card">
                  <Text style={{ fontSize: '24px', color: 'rgba(255,255,255,0.4)', marginBottom: '12px' }}>制作步骤</Text>
                  {aiResult.steps?.map((step, i) => (
                    <View key={i} style={{ display: 'flex', gap: '8px', padding: '4px 0' }}>
                      <Text style={{ fontSize: '24px', color: '#d4a843' }}>{i + 1}.</Text>
                      <Text style={{ fontSize: '24px', color: 'rgba(255,255,255,0.7)' }}>{step}</Text>
                    </View>
                  ))}
                </View>

                {aiResult.reason && (
                  <Text style={{ fontSize: '22px', color: 'rgba(212,168,67,0.6)', textAlign: 'center', fontStyle: 'italic' }}>
                    "{aiResult.reason}"
                  </Text>
                )}

                <View
                  className="btn-outline"
                  onClick={() => { setAiResult(null); setAiIngredients(''); }}
                >
                  <Text>再来一杯</Text>
                </View>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
}
