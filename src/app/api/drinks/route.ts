import { NextResponse } from 'next/server';
import { CLASSIC_DRINKS } from '@/lib/drinks-data';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) || [];

    let filtered = CLASSIC_DRINKS;

    if (search) {
      filtered = filtered.filter(
        d => d.name.includes(search) || d.nameEn.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (category) {
      filtered = filtered.filter(d => d.category === category);
    }

    if (tags.length > 0) {
      filtered = filtered.filter(d => tags.some(t => d.tags.includes(t)));
    }

    return NextResponse.json(filtered);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
