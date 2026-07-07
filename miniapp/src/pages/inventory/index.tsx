/**
 * 库存管理 + AI 推荐
 */
import { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { ALCOHOL_CATEGORIES, MIXER_CATEGORIES, FLAVOR_TAGS, STRENGTH_LEVELS } from '../../utils/index';
import {
  getInventory, addInventory, removeInventory, clearInventory,
  getAIRecommendations, InventoryItem, AIRecommendation,
} from '../../services/api';
import './index.scss';

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'alcohol' | 'mixer'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addType, setAddType] = useState<'alcohol' | 'mixer'>('alcohol');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubtype, setSelectedSubtype] = useState('');
  const [brand, setBrand] = useState('');
  const [quantity, setQuantity] = useState('');
  const [showAIRecommend, setShowAIRecommend] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);
  const [selectedStrength, setSelectedStrength] = useState('');

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      const data = await getInventory();
      if (Array.isArray(data)) setItems(data);
    } catch {}
  };

  const filteredItems = items.filter(item => {
    if (activeTab !== 'all' && item.category !== activeTab) return false;
    if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const alcoholItems = items.filter(i => i.category === 'alcohol');
  const mixerItems = items.filter(i => i.category === 'mixer');

  const handleAdd = async () => {
    const cat = addType === 'alcohol'
      ? ALCOHOL_CATEGORIES.find(c => c.id === selectedCategory)
      : MIXER_CATEGORIES.find(c => c.id === selectedCategory);
    if (!cat) return;

    try {
      const saved = await addInventory({
        category: addType,
        name: selectedSubtype || cat.name,
        brand: brand || undefined,
        quantity: quantity ? parseFloat(quantity) : undefined,
        unit: addType === 'alcohol' ? 'ml' : '个',
      });
      if (saved?.id) {
        setItems(prev => [...prev, saved]);
        Taro.showToast({ title: '添加成功', icon: 'success' });
      }
    } catch {
      Taro.showToast({ title: '添加失败', icon: 'none' });
    }
    resetAddForm();
  };

  const resetAddForm = () => {
    setShowAddModal(false);
    setSelectedCategory('');
    setSelectedSubtype('');
    setBrand('');
    setQuantity('');
  };

  const handleRemove = async (id: string) => {
    try {
      await removeInventory(id);
      setItems(prev => prev.filter(i => i.id !== id));
    } catch {}
  };

  const handleClearAll = () => {
    Taro.showModal({
      title: '确认清空',
      content: '确定要清空所有库存吗？',
      success: async (res) => {
        if (res.confirm) {
          try { await clearInventory(); } catch {}
          setItems([]);
        }
      },
    });
  };

  const handleAIRecommend = async () => {
    setAiLoading(true);
    try {
      const alcohols = items.filter(i => i.category === 'alcohol').map(i => i.name);
      const mixers = items.filter(i => i.category === 'mixer').map(i => i.name);
      const result = await getAIRecommendations({
        alcohols,
        mixers,
        flavors: selectedFlavors,
        strength: selectedStrength || 'medium',
      });
      if (result.length > 0) setAiRecommendations(result);
    } catch {
      Taro.showToast({ title: 'AI 推荐失败', icon: 'none' });
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <View className="inventory-page">
      <View className="page-header">
        <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text className="page-title gradient-text" style={{ fontSize: '42px' }}>我的库存</Text>
            <Text className="page-desc">管理你拥有的酒和配料 · {items.length}件</Text>
          </View>
        </View>
        <View style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
          {items.length > 0 && (
            <View className="btn-ghost" style={{ flex: 1, color: '#f87171' }} onClick={handleClearAll}>
              <Text>清空</Text>
            </View>
          )}
          <View className="btn-primary" style={{ flex: 1 }} onClick={() => setShowAddModal(true)}>
            <Text>+ 添加</Text>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View className="chip-scroll" style={{ padding: '0 24px', marginBottom: '16px' }}>
        {[
          { id: 'all', label: '全部', count: items.length },
          { id: 'alcohol', label: '🥃 酒类', count: alcoholItems.length },
          { id: 'mixer', label: '🥤 配料', count: mixerItems.length },
        ].map(tab => (
          <View
            key={tab.id}
            className={`chip ${activeTab === tab.id ? 'chip-active' : ''}`}
            onClick={() => setActiveTab(tab.id as any)}
          >
            {tab.label}({tab.count})
          </View>
        ))}
      </View>

      {/* 搜索 */}
      <View style={{ padding: '0 24px', marginBottom: '16px' }}>
        <View className="search-bar">
          <Text>🔍</Text>
          <input
            placeholder="搜索库存..."
            value={searchQuery}
            onInput={e => setSearchQuery((e.detail as any).value)}
          />
        </View>
      </View>

      {/* 库存列表 */}
      <ScrollView scrollY style={{ padding: '0 24px', minHeight: '50vh' }}>
        {filteredItems.length > 0 ? (
          filteredItems.map(item => (
            <View key={item.id} className="inventory-item" onClick={() => handleRemove(item.id)}>
              <View className={`inventory-icon ${item.category === 'alcohol' ? 'inventory-icon-alcohol' : 'inventory-icon-mixer'}`}>
                <Text>{item.category === 'alcohol' ? '🥃' : '🥤'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: '28px', fontWeight: 500, color: '#fff' }}>{item.name}</Text>
                <Text style={{ fontSize: '22px', color: 'rgba(255,255,255,0.3)' }}>
                  {item.brand ? `${item.brand} · ` : ''}
                  {item.quantity ? `${item.quantity}${item.unit}` : item.unit}
                </Text>
              </View>
              <Text style={{ fontSize: '24px', color: 'rgba(255,255,255,0.2)' }}>✕</Text>
            </View>
          ))
        ) : (
          <View className="empty-state">
            <Text className="empty-icon">🥃</Text>
            <Text className="empty-text">库存空空如也</Text>
            <Text className="empty-hint">添加你拥有的酒和配料，开始调酒之旅</Text>
            <View className="btn-primary" style={{ marginTop: '24px' }} onClick={() => setShowAddModal(true)}>
              <Text>添加第一件物品</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* AI 推荐浮动按钮 */}
      {items.length > 0 && (
        <View className="fab" onClick={() => setShowAIRecommend(true)}>
          <Text>✨</Text>
        </View>
      )}

      {/* 添加库存弹窗 */}
      {showAddModal && (
        <View>
          <View className="bottom-sheet-overlay" onClick={resetAddForm} />
          <ScrollView scrollY className="bottom-sheet" style={{ maxHeight: '70vh' }}>
            <View className="bottom-sheet-handle" />
            <Text style={{ fontSize: '32px', fontWeight: 600, marginBottom: '20px' }}>添加库存</Text>

            {/* 类型切换 */}
            <View style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
              <View className={`chip ${addType === 'alcohol' ? 'chip-active' : ''}`}
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => { setAddType('alcohol'); setSelectedCategory(''); setSelectedSubtype(''); }}
              >
                🥃 酒类
              </View>
              <View className={`chip ${addType === 'mixer' ? 'chip-active' : ''}`}
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => { setAddType('mixer'); setSelectedCategory(''); setSelectedSubtype(''); }}
              >
                🥤 配料
              </View>
            </View>

            {/* 类别选择 */}
            <Text style={{ fontSize: '24px', color: 'rgba(255,255,255,0.4)', marginBottom: '12px' }}>选择类别</Text>
            <View style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              {(addType === 'alcohol' ? ALCOHOL_CATEGORIES : MIXER_CATEGORIES).map(cat => (
                <View
                  key={cat.id}
                  className={`chip ${selectedCategory === cat.id ? 'chip-active' : ''}`}
                  style={{ flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '16px' }}
                  onClick={() => { setSelectedCategory(cat.id); setSelectedSubtype(''); }}
                >
                  <Text style={{ fontSize: '36px' }}>{cat.icon}</Text>
                  <Text style={{ fontSize: '20px' }}>{cat.name}</Text>
                </View>
              ))}
            </View>

            {/* 子类别 */}
            {addType === 'alcohol' && selectedCategory && (
              <View style={{ marginBottom: '16px' }}>
                <Text style={{ fontSize: '24px', color: 'rgba(255,255,255,0.4)', marginBottom: '12px' }}>子类别</Text>
                <View className="chip-scroll">
                  {ALCOHOL_CATEGORIES.find(c => c.id === selectedCategory)?.subtypes.map(sub => (
                    <View
                      key={sub}
                      className={`chip ${selectedSubtype === sub ? 'chip-active' : ''}`}
                      onClick={() => setSelectedSubtype(sub)}
                    >
                      {sub}
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* 品牌和数量 */}
            <View style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              <View>
                <Text style={{ fontSize: '22px', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '8px' }}>品牌（可选）</Text>
                <input
                  className="input"
                  placeholder="如：杰克丹尼"
                  value={brand}
                  onInput={e => setBrand((e.detail as any).value)}
                />
              </View>
              <View>
                <Text style={{ fontSize: '22px', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '8px' }}>数量</Text>
                <input
                  className="input"
                  type="number"
                  placeholder={addType === 'alcohol' ? 'ml' : '个'}
                  value={quantity}
                  onInput={e => setQuantity((e.detail as any).value)}
                />
              </View>
            </View>

            <View
              className={`btn-primary ${!selectedCategory ? 'btn-disabled' : ''}`}
              onClick={handleAdd}
            >
              <Text>添加到库存</Text>
            </View>
          </ScrollView>
        </View>
      )}

      {/* AI 推荐弹窗 */}
      {showAIRecommend && (
        <View>
          <View className="bottom-sheet-overlay" onClick={() => { setShowAIRecommend(false); setAiRecommendations([]); }} />
          <ScrollView scrollY className="bottom-sheet" style={{ maxHeight: '85vh' }}>
            <View className="bottom-sheet-handle" />
            {aiRecommendations.length === 0 ? (
              <View style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <Text style={{ fontSize: '32px', fontWeight: 600 }}>
                  <Text className="gradient-text">AI 智能推荐</Text>
                </Text>
                <Text style={{ fontSize: '26px', color: 'rgba(255,255,255,0.5)' }}>
                  根据你的库存，AI 会为你推荐最适合的鸡尾酒
                </Text>

                <Text style={{ fontSize: '24px', color: 'rgba(255,255,255,0.4)' }}>口味偏好（可选）</Text>
                <View className="chip-scroll">
                  {['甜', '酸', '苦', '清爽', '果味', '奶味', '咖啡味', '柑橘味', '浓郁型'].map(flavor => (
                    <View
                      key={flavor}
                      className={`chip ${selectedFlavors.includes(flavor) ? 'chip-active' : ''}`}
                      onClick={() => setSelectedFlavors(prev =>
                        prev.includes(flavor) ? prev.filter(f => f !== flavor) : [...prev, flavor]
                      )}
                    >
                      {flavor}
                    </View>
                  ))}
                </View>

                <Text style={{ fontSize: '24px', color: 'rgba(255,255,255,0.4)' }}>酒精度（可选）</Text>
                <View className="chip-scroll">
                  {STRENGTH_LEVELS.map(level => (
                    <View
                      key={level.id}
                      className={`chip ${selectedStrength === level.id ? 'chip-active' : ''}`}
                      onClick={() => setSelectedStrength(prev => prev === level.id ? '' : level.id)}
                    >
                      {level.name} {level.min}%-{level.max}%
                    </View>
                  ))}
                </View>

                <View
                  className={`btn-primary ${aiLoading ? 'btn-disabled' : ''}`}
                  onClick={handleAIRecommend}
                >
                  <Text>{aiLoading ? 'AI 正在分析...' : '✨ 获取推荐'}</Text>
                </View>
              </View>
            ) : (
              <View style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <Text style={{ fontSize: '24px', color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>
                  为你推荐 {aiRecommendations.length} 款鸡尾酒
                </Text>
                {aiRecommendations.map((rec, i) => (
                  <View key={i} className="card">
                    <View style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <View>
                        <Text style={{ fontSize: '30px', fontWeight: 600, color: '#d4a843' }}>{rec.name}</Text>
                        <Text style={{ fontSize: '20px', color: 'rgba(255,255,255,0.3)' }}>{rec.nameEn}</Text>
                      </View>
                    </View>
                    <Text style={{ fontSize: '24px', color: 'rgba(255,255,255,0.5)', marginTop: '8px' }}>
                      {rec.description}
                    </Text>
                    <Text style={{ fontSize: '22px', color: 'rgba(212,168,67,0.6)', fontStyle: 'italic', marginTop: '8px' }}>
                      "{rec.reason}"
                    </Text>
                    <View style={{ background: '#1a1a1a', borderRadius: '12px', padding: '16px', marginTop: '12px' }}>
                      <Text style={{ fontSize: '22px', color: 'rgba(255,255,255,0.4)' }}>材料</Text>
                      {rec.ingredients?.map((ing, j) => (
                        <View key={j} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                          <Text style={{ fontSize: '24px', color: 'rgba(255,255,255,0.6)' }}>{ing.name}</Text>
                          <Text style={{ fontSize: '22px', color: 'rgba(255,255,255,0.3)' }}>{ing.amount}{ing.unit}</Text>
                        </View>
                      ))}
                    </View>
                    <View style={{ marginTop: '12px' }}>
                      <Text style={{ fontSize: '22px', color: 'rgba(255,255,255,0.4)' }}>步骤</Text>
                      {rec.steps?.map((step, j) => (
                        <View key={j} style={{ display: 'flex', gap: '6px' }}>
                          <Text style={{ fontSize: '22px', color: '#d4a843' }}>{j + 1}.</Text>
                          <Text style={{ fontSize: '22px', color: 'rgba(255,255,255,0.5)' }}>{step}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ))}
                <View
                  className="btn-outline"
                  onClick={() => { setAiRecommendations([]); setSelectedFlavors([]); setSelectedStrength(''); }}
                >
                  <Text>再来一次</Text>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
}
