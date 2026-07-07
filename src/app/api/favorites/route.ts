import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { authorized, user } = await requireAuth(request);
    if (!authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId: user.userId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(favorites);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { authorized, user } = await requireAuth(request);
    if (!authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { drinkId, drinkName, drinkData } = body;

    if (!drinkName) {
      return NextResponse.json({ error: 'drinkName is required' }, { status: 400 });
    }

    const existing = await prisma.favorite.findFirst({
      where: {
        userId: user.userId,
        ...(drinkId ? { drinkId } : {}),
        drinkName,
      },
    });

    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } });
      return NextResponse.json({ favorited: false });
    }

    const favorite = await prisma.favorite.create({
      data: {
        userId: user.userId,
        drinkId,
        drinkName,
        drinkData,
      },
    });

    return NextResponse.json({ favorited: true, favorite });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { authorized, user } = await requireAuth(request);
    if (!authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      await prisma.favorite.deleteMany({
        where: { id, userId: user.userId },
      });
    } else {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
