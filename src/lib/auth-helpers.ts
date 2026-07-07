/**
 * 通用认证工具 - 同时支持 NextAuth (Web) 和 Bearer Token (小程序)
 */
import { getServerSession } from 'next-auth';
import { authOptions } from './auth';

export interface AuthUser {
  userId: string;
  name?: string;
  email?: string;
}

/**
 * 获取当前认证用户
 * 优先使用 NextAuth session，其次解析 Bearer token
 */
export async function getAuthUser(req?: Request | { headers: Headers }): Promise<AuthUser | null> {
  // 1. 尝试 NextAuth session（Web 端）
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.email) {
      return {
        userId: (session.user as any).id || session.user.email,
        name: session.user.name || undefined,
        email: session.user.email,
      };
    }
  } catch {
    // 忽略 NextAuth 错误，继续尝试 Bearer token
  }

  // 2. 解析 Bearer token（小程序端）
  if (req) {
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.slice(7);
        const payload = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
        if (payload.exp && payload.exp > Date.now() && payload.userId) {
          return {
            userId: payload.userId,
          };
        }
      } catch {
        // token 解析失败
      }
    }
  }

  return null;
}

/**
 * 检查请求是否已认证
 */
export async function requireAuth(req?: Request | { headers: Headers }) {
  const user = await getAuthUser(req);
  if (!user) {
    return { authorized: false as const, user: null };
  }
  return { authorized: true as const, user };
}

/**
 * 获取认证用户 ID 或抛出 401
 */
export async function getAuthUserId(req?: Request): Promise<string> {
  const user = await getAuthUser(req);
  if (!user) throw new Error('Unauthorized');
  return user.userId;
}
