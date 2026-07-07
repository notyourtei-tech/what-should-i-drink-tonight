/**
 * 首页 - 今晚喝什么
 */
import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Button as TaroButton } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { FLAVOR_TAGS, STRENGTH_LEVELS, getDrinkEmoji, getFlavorLabel } from '../../utils/index';
import './index.scss';

// 今日推荐数据集（小程序内置精简版）
const TONIGHT_PICKS = [
  { id: '1', mood: '微醺', text: '今晚来杯金汤力？清爽经典', drinkId: 'gin-tonic' },
  { id: '2', mood: '浪漫', text: '一杯尼格罗尼，苦中带甜', drinkId: 'negroni' },
  { id: '3', mood: '热情', text: '莫吉托的柠檬薄荷香', drinkId: 'mojito' },
  { id: '4', mood: '放松', text: '古典鸡尾酒，时光的味道', drinkId: 'old-fashioned' },
  { id: '5', mood: '优雅', text: '马天尼，简洁就是优雅', drinkId: 'martini' },
  { id: '6', mood: '清爽', text: '威士忌Highball，消暑必备', drinkId: 'whisky-highball' },
];

export default function HomePage() {
  const [tonightPick, setTonightPick] = useState(TONIGHT_PICKS[0]);
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);
  const [selectedStrength, setSelectedStrength] = useState('');

  useEffect(() => {
    const idx = Math.floor(Math.random() * TONIGHT_PICKS.length);
    setTonightPick(TONIGHT_PICKS[idx]);
  }, []);

  const toggleFlavor = (id: string) => {
    setSelectedFlavors(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const goToSearch = () => {
    const params: string[] = [];
    if (selectedFlavors.length > 0) params.push(`flavors=${selectedFlavors.join(',')}`);
    if (selectedStrength) params.push(`strength=${selectedStrength}`);
    Taro.navigateTo({
      url: `/pages/drinks/index${params.length > 0 ? '?' + params.join('&') : ''}`,
    });
  };

  return (
    <View className="home-page">
      {/* Hero */}
      <View className="hero">
        <View className="hero-badge">
          <View className="hero-badge-dot" />
          <Text className="hero-badge-text">AI 智能推荐</Text>
        </View>

        <Text className="hero-title">
          <Text className="gradient-text">今晚</Text>
          {'\n'}喝什么？
        </Text>
        <Text className="hero-desc">
          告诉我你有什么酒，AI帮你找到最适合今晚的那杯
        </Text>
      </View>

      {/* 今日推荐 */}
      <View className="section">
        <View className="tonight-card">
          <View className="tonight-card-header">
            <Text className="tonight-card-mood">{tonightPick.mood}</Text>
          </View>
          <View className="tonight-card-body">
            <Text className="tonight-card-emoji">🍸</Text>
            <Text className="tonight-card-label">今日推荐</Text>
            <Text className="tonight-card-text">{tonightPick.text}</Text>
            <View
              className="btn-primary"
              onClick={() => Taro.navigateTo({ url: `/pages/drinks/index?drinkId=${tonightPick.drinkId}` })}
            >
              <Text>查看详情</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 快捷操作 */}
      <View className="section">
        <View className="quick-actions">
          <View
            className="quick-action"
            onClick={() => Taro.switchTab({ url: '/pages/inventory/index' })}
          >
            <Text className="quick-action-icon">🥃</Text>
            <Text className="quick-action-title">添加库存</Text>
            <Text className="quick-action-desc">告诉我你有什么酒</Text>
          </View>
          <View
            className="quick-action"
            onClick={() => Taro.switchTab({ url: '/pages/drinks/index' })}
          >
            <Text className="quick-action-icon">🍸</Text>
            <Text className="quick-action-title">浏览酒单</Text>
            <Text className="quick-action-desc">经典鸡尾酒配方</Text>
          </View>
          <View
            className="quick-action"
            onClick={() => Taro.switchTab({ url: '/pages/favorites/index' })}
          >
            <Text className="quick-action-icon">❤️</Text>
            <Text className="quick-action-title">我的收藏</Text>
            <Text className="quick-action-desc">常喝的配方</Text>
          </View>
        </View>
      </View>

      {/* 口味筛选 */}
      <View className="section">
        <Text className="section-title">你想喝什么样的？</Text>

        <Text className="section-label">口味偏好</Text>
        <View className="chip-scroll">
          {FLAVOR_TAGS.map(flavor => (
            <View
              key={flavor.id}
              className={`chip ${selectedFlavors.includes(flavor.id) ? 'chip-active' : ''}`}
              onClick={() => toggleFlavor(flavor.id)}
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
              {level.name} {level.min}%-{level.max}%
            </View>
          ))}
        </View>

        <View className="btn-primary" onClick={goToSearch}>
          <Text>查找推荐</Text>
        </View>
      </View>

      {/* AI 创意调酒 CTA */}
      <View className="section">
        <View className="ai-cta">
          <Text className="ai-cta-title">
            <Text className="gradient-text">AI 创意调酒</Text>
          </Text>
          <Text className="ai-cta-desc">
            告诉我你有什么材料，AI帮你创造独一无二的创意饮品
          </Text>
          <View
            className="btn-primary"
            onClick={() => Taro.switchTab({ url: '/pages/drinks/index' })}
          >
            <Text>✨ 开始创作</Text>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View className="footer">
        <Text className="footer-text">
          © 2026 Tonight Drink AI · 请适量饮酒 · 未满18岁禁止饮酒
        </Text>
      </View>
    </View>
  );
}
