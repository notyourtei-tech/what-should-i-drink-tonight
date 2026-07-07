/**
 * 个人中心
 */
import { useState, useEffect } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { wxLogin, getUserProfile, getToken, clearToken } from '../../services/api';
import './index.scss';

export default function ProfilePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkLogin();
  }, []);

  const checkLogin = async () => {
    try {
      const token = getToken();
      if (token) {
        const userData = await getUserProfile();
        if (userData) {
          setUser(userData);
          setIsLoggedIn(true);
        }
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  const handleWxLogin = async () => {
    Taro.showLoading({ title: '登录中...' });
    try {
      const result = await wxLogin();
      Taro.hideLoading();
      if (result) {
        setUser(result.user);
        setIsLoggedIn(true);
        Taro.showToast({ title: '登录成功', icon: 'success' });
      }
    } catch {
      Taro.hideLoading();
      Taro.showToast({ title: '登录失败', icon: 'none' });
    }
  };

  const handleLogout = () => {
    Taro.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          clearToken();
          setIsLoggedIn(false);
          setUser(null);
          Taro.showToast({ title: '已退出', icon: 'none' });
        }
      },
    });
  };

  if (loading) {
    return (
      <View className="profile-page">
        <View className="loading-spinner">
          <Text>加载中...</Text>
        </View>
      </View>
    );
  }

  if (!isLoggedIn) {
    return (
      <View className="profile-page">
        <View className="empty-state" style={{ paddingTop: '120px' }}>
          <Text className="empty-icon">🥃</Text>
          <Text className="empty-text" style={{ fontSize: '36px', fontWeight: 600 }}>
            <Text className="gradient-text">Tonight Drink</Text>
          </Text>
          <Text className="empty-hint" style={{ marginTop: '24px' }}>
            登录后同步你的收藏和库存数据
          </Text>
          <View className="btn-primary" style={{ marginTop: '48px', width: '100%' }} onClick={handleWxLogin}>
            <Text>微信一键登录</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="profile-page">
      <View className="page-header">
        <Text className="page-title">
          <Text className="gradient-text">我的</Text>
        </Text>
      </View>

      {/* 用户信息 */}
      <View className="profile-card">
        <View className="profile-avatar">
          <Text style={{ fontSize: '56px' }}>👤</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: '32px', fontWeight: 600, color: '#fff' }}>
            {user?.name || '酒友'}
          </Text>
          <Text style={{ fontSize: '22px', color: 'rgba(255,255,255,0.4)' }}>
            {user?.email || ''}
          </Text>
        </View>
      </View>

      {/* 数据统计 */}
      <View style={{ padding: '0 24px', marginTop: '24px' }}>
        <View style={{ display: 'flex', gap: '12px' }}>
          <View className="stat-card">
            <Text style={{ fontSize: '40px' }}>📊</Text>
            <Text style={{ fontSize: '36px', fontWeight: 700, color: '#fff' }}>
              {user?.drinkLogCount || 0}
            </Text>
            <Text style={{ fontSize: '22px', color: 'rgba(255,255,255,0.4)' }}>饮用记录</Text>
          </View>
          <View className="stat-card">
            <Text style={{ fontSize: '40px' }}>❤️</Text>
            <Text style={{ fontSize: '36px', fontWeight: 700, color: '#fff' }}>
              {user?.favoriteCount || 0}
            </Text>
            <Text style={{ fontSize: '22px', color: 'rgba(255,255,255,0.4)' }}>收藏数</Text>
          </View>
          <View className="stat-card">
            <Text style={{ fontSize: '40px' }}>🥃</Text>
            <Text style={{ fontSize: '36px', fontWeight: 700, color: '#fff' }}>
              {user?.inventoryCount || 0}
            </Text>
            <Text style={{ fontSize: '22px', color: 'rgba(255,255,255,0.4)' }}>库存物品</Text>
          </View>
        </View>
      </View>

      {/* 快捷操作 */}
      <View style={{ padding: '0 24px', marginTop: '32px' }}>
        <View style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <View className="menu-item" onClick={() => Taro.switchTab({ url: '/pages/inventory/index' })}>
            <Text>🥃</Text>
            <Text style={{ flex: 1, fontSize: '28px', color: '#fff' }}>管理库存</Text>
            <Text style={{ fontSize: '24px', color: 'rgba(255,255,255,0.3)' }}>›</Text>
          </View>
          <View className="menu-item" onClick={() => Taro.switchTab({ url: '/pages/favorites/index' })}>
            <Text>❤️</Text>
            <Text style={{ flex: 1, fontSize: '28px', color: '#fff' }}>我的收藏</Text>
            <Text style={{ fontSize: '24px', color: 'rgba(255,255,255,0.3)' }}>›</Text>
          </View>
          <View className="menu-item" onClick={() => Taro.switchTab({ url: '/pages/drinks/index' })}>
            <Text>🍸</Text>
            <Text style={{ flex: 1, fontSize: '28px', color: '#fff' }}>浏览酒单</Text>
            <Text style={{ fontSize: '24px', color: 'rgba(255,255,255,0.3)' }}>›</Text>
          </View>
        </View>
      </View>

      {/* 退出登录 */}
      <View style={{ padding: '0 24px', marginTop: '48px' }}>
        <View className="btn-outline" onClick={handleLogout}>
          <Text>退出登录</Text>
        </View>
      </View>

      {/* 版本信息 */}
      <View style={{ textAlign: 'center', marginTop: '48px', paddingBottom: '32px' }}>
        <Text style={{ fontSize: '22px', color: 'rgba(255,255,255,0.2)' }}>
          Tonight Drink AI v1.0.0
        </Text>
      </View>
    </View>
  );
}
