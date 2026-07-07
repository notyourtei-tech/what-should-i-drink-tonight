import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import { createCustomDrink } from '@/lib/ai';

export async function POST(request: Request) {
  try {
    const { authorized } = await requireAuth(request);
    if (!authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { ingredients, description } = body;

    if (!ingredients || ingredients.length === 0) {
      return NextResponse.json(
        { error: '请至少提供一种材料' },
        { status: 400 }
      );
    }

    const customDrink = await createCustomDrink({
      ingredients,
      description,
    });

    return NextResponse.json(customDrink);
  } catch (error) {
    console.error('Create custom drink error:', error);
    return NextResponse.json(
      { error: 'Failed to create custom drink' },
      { status: 500 }
    );
  }
}
