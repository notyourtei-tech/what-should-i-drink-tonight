import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import prisma from '@/lib/prisma';

// GET /api/auth/me - 获取当前用户信息（小程序端用）
export async function GET(request: Request) {
  try {
    const { authorized, user } = await requireAuth(request);
    if (!authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 获取统计数据
    const [favoriteCount, inventoryCount, drinkLogCount] = await Promise.all([
      prisma.favorite.count({ where: { userId: user.userId } }),
      prisma.inventoryItem.count({ where: { userId: user.userId } }),
      prisma.drinkLog.count({ where: { userId: user.userId } }),
    ]);

    return NextResponse.json({
      ...dbUser,
      favoriteCount,
      inventoryCount,
      drinkLogCount,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
