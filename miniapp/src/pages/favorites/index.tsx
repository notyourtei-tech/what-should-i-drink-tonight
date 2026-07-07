/**
 * 收藏页
 */
import { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { getFavorites, toggleFavorite } from '../../services/api';
import { getDrinkEmoji, getFlavorLabel, getDifficultyLabel } from '../../utils/index';
import './index.scss';

interface FavoriteItem {
  id: string;
  drinkId: string;
  drinkName: string;
  drinkData?: any;
  createdAt?: string;
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const data = await getFavorites();
      if (Array.isArray(data)) setFavorites(data);
    } catch {} finally {
      setLoading(false);
    }
  };

  const handleRemove = async (fav: FavoriteItem) => {
    try {
      await toggleFavorite(fav.drinkId, fav.drinkName);
      setFavorites(prev => prev.filter(f => f.id !== fav.id));
    } catch {}
  };

  const renderDrink = (fav: FavoriteItem) => {
    const data = fav.drinkData || { name: fav.drinkName, tags: [], difficulty: 'medium', abv: 0, description: '' };
    const isCustom = !!fav.drinkData && !data.glassType; // 简化的判断逻辑
    return { ...data, favId: fav.id, isCustom };
  };

  return (
    <View className="favorites-page">
      <View className="page-header">
        <Text className="page-title">
          <Text className="gradient-text">我的收藏</Text>
        </Text>
        <Text className="page-desc">保存你喜欢的配方 · {favorites.length}款</Text>
      </View>

      {loading ? (
        <View className="loading-spinner">
          <Text>加载中...</Text>
        </View>
      ) : favorites.length > 0 ? (
        <ScrollView scrollY className="fav-scroll">
          <View className="grid-2 fav-grid">
            {favorites.map(fav => {
              const drink = renderDrink(fav);
              return (
                <View key={fav.id} className="drink-card card-hover">
                  <View className="drink-card-img">
                    <Text className="drink-card-emoji">
                      {drink.tags ? getDrinkEmoji(drink) : '🍸'}
                    </Text>
                    <View
                      className="drink-card-remove"
                      onClick={() => handleRemove(fav)}
                    >
                      <Text style={{ fontSize: '24px' }}>♥</Text>
                    </View>
                    {drink.isCustom && (
                      <View className="drink-card-ai-badge">
                        <Text style={{ fontSize: '16px', color: '#d4a843' }}>AI</Text>
                      </View>
                    )}
                  </View>
                  <View className="drink-card-info">
                    <Text className="drink-card-name">{drink.name}</Text>
                    <Text className="drink-card-desc" numberOfLines={2}>
                      {drink.description || '自定义饮品'}
                    </Text>
                    <View style={{ display: 'flex', gap: '4px', marginTop: '8px' }}>
                      {(drink.tags || []).slice(0, 2).map((tag: string) => (
                        <Text key={tag} className="tag">{getFlavorLabel(tag)}</Text>
                      ))}
                    </View>
                    <View style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                      <Text style={{ fontSize: '24px', fontWeight: 700, color: '#facc15' }}>
                        {drink.abv || 0}%
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
      ) : (
        <View className="empty-state">
          <Text className="empty-icon">❤️</Text>
          <Text className="empty-text">还没有收藏</Text>
          <Text className="empty-hint">浏览酒单，收藏你喜欢的配方</Text>
          <View
            className="btn-primary"
            style={{ marginTop: '24px' }}
            onClick={() => Taro.switchTab({ url: '/pages/drinks/index' })}
          >
            <Text>浏览酒单</Text>
          </View>
        </View>
      )}
    </View>
  );
}
