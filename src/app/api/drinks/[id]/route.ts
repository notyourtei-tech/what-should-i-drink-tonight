import { NextResponse } from 'next/server';
import { CLASSIC_DRINKS } from '@/lib/drinks-data';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const drink = CLASSIC_DRINKS.find(d => d.id === params.id);

    if (!drink) {
      return NextResponse.json({ error: 'Drink not found' }, { status: 404 });
    }

    return NextResponse.json(drink);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
