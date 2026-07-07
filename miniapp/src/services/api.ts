// API 基础配置 - 部署时需要替换为实际后端地址
const API_BASE = 'https://your-backend.com/api';

// 存储 Key
const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'user_info',
  OPENID: 'openid',
};

// Token 管理
let token: string | null = null;

export function setToken(t: string) {
  token = t;
  wx.setStorageSync(STORAGE_KEYS.TOKEN, t);
}

export function getToken(): string | null {
  if (token) return token;
  try {
    token = wx.getStorageSync(STORAGE_KEYS.TOKEN) || null;
  } catch {
    token = null;
  }
  return token;
}

export function clearToken() {
  token = null;
  try { wx.removeStorageSync(STORAGE_KEYS.TOKEN); } catch {}
  try { wx.removeStorageSync(STORAGE_KEYS.USER); } catch {}
}

// 请求封装
async function request<T = any>(
  path: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: any;
    noAuth?: boolean;
  } = {}
): Promise<T> {
  const { method = 'GET', body, noAuth = false } = options;
  const t = getToken();

  return new Promise((resolve, reject) => {
    wx.request({
      url: `${API_BASE}${path}`,
      method,
      header: {
        'Content-Type': 'application/json',
        ...(t && !noAuth ? { Authorization: `Bearer ${t}` } : {}),
      },
      data: body,
      success(res: any) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else {
          if (res.statusCode === 401) {
            clearToken();
          }
          reject(res.data);
        }
      },
      fail(err) {
        wx.showToast({ title: '网络错误', icon: 'none' });
        reject(err);
      },
    });
  });
}

// ====== 微信登录 ======
export async function wxLogin(): Promise<{ token: string; user: any } | null> {
  try {
    const loginRes = await wxLoginCode();
    const { code } = loginRes;

    const data = await request<{ token: string; user: any }>('/auth/wechat', {
      method: 'POST',
      body: { code },
      noAuth: true,
    });

    setToken(data.token);
    try { wx.setStorageSync(STORAGE_KEYS.USER, data.user); } catch {}
    return data;
  } catch (err) {
    console.error('微信登录失败:', err);
    return null;
  }
}

function wxLoginCode(): Promise<{ code: string }> {
  return new Promise((resolve, reject) => {
    wx.login({
      success(res) {
        if (res.code) {
          resolve({ code: res.code });
        } else {
          reject(new Error('wx.login 失败'));
        }
      },
      fail: reject,
    });
  });
}

// ====== 用户相关 ======
export async function getUserProfile() {
  return request<any>('/auth/me');
}

// ====== 库存相关 ======
export interface InventoryItem {
  id: string;
  category: string;
  name: string;
  brand?: string;
  quantity?: number;
  unit: string;
}

export async function getInventory(): Promise<InventoryItem[]> {
  return request<InventoryItem[]>('/inventory');
}

export async function addInventory(payload: {
  category: string;
  name: string;
  brand?: string;
  quantity?: number;
  unit: string;
}): Promise<InventoryItem> {
  return request<InventoryItem>('/inventory', { method: 'POST', body: payload });
}

export async function removeInventory(id: string) {
  return request(`/inventory?id=${id}`, { method: 'DELETE' });
}

export async function clearInventory() {
  return request('/inventory', { method: 'DELETE' });
}

// ====== 收藏相关 ======
export async function getFavorites(): Promise<any[]> {
  return request('/favorites');
}

export async function toggleFavorite(drinkId: string, drinkName: string) {
  return request('/favorites', {
    method: 'POST',
    body: { drinkId, drinkName },
  });
}

// ====== AI 功能 ======
export interface AIRecommendation {
  name: string;
  nameEn: string;
  description: string;
  ingredients: { name: string; amount: number; unit: string; type: string }[];
  steps: string[];
  tags: string[];
  difficulty: string;
  abv: number;
  glassType: string;
  iceType: string;
  reason: string;
}

export async function getAIRecommendations(params: {
  alcohols: string[];
  mixers: string[];
  flavors: string[];
  strength: string;
}): Promise<AIRecommendation[]> {
  const data = await request<{ recommendations: AIRecommendation[] }>('/ai/recommend', {
    method: 'POST',
    body: params,
  });
  return data.recommendations || [];
}

export async function createCustomDrink(ingredients: string[]) {
  return request<AIRecommendation>('/ai/create', {
    method: 'POST',
    body: { ingredients },
  });
}

// ====== 饮品记录 ======
export async function logDrink(drinkId: string, rating?: number, note?: string) {
  return request('/drinks/log', {
    method: 'POST',
    body: { drinkId, rating, note },
  });
}

export default {
  setToken,
  getToken,
  clearToken,
  wxLogin,
  getUserProfile,
  getInventory,
  addInventory,
  removeInventory,
  clearInventory,
  getFavorites,
  toggleFavorite,
  getAIRecommendations,
  createCustomDrink,
  logDrink,
};
