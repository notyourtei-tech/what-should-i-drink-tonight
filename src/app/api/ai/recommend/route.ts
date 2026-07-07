import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';
import { getRecommendations } from '@/lib/ai';
import { CLASSIC_DRINKS } from '@/lib/drinks-data';

export async function POST(request: Request) {
  try {
    const { authorized } = await requireAuth(request);
    if (!authorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { alcohols, mixers, flavors, strength } = body;

    // Try AI recommendation first
    try {
      const recommendations = await getRecommendations({
        alcohols: alcohols || [],
        mixers: mixers || [],
        flavors: flavors || [],
        strength: strength || 'medium',
        availableIngredients: [...(alcohols || []), ...(mixers || [])],
      });

      return NextResponse.json({ recommendations });
    } catch (aiError) {
      console.log('AI failed, using fallback recommendations');

      let filteredDrinks = CLASSIC_DRINKS;

      if (alcohols?.length > 0) {
        filteredDrinks = filteredDrinks.filter(drink =>
          drink.ingredients.some(
            ing => ing.type === 'alcohol' && alcohols.some((a: string) => ing.name.includes(a))
          )
        );
      }

      if (flavors?.length > 0) {
        const flavorMatches = filteredDrinks.filter(drink =>
          flavors.some((f: string) => drink.tags.includes(f))
        );
        if (flavorMatches.length > 0) filteredDrinks = flavorMatches;
      }

      if (strength) {
        const strengthRanges: Record<string, [number, number]> = {
          light: [3, 8],
          easy: [5, 12],
          medium: [8, 20],
          strong: [15, 30],
          fire: [25, 100],
        };
        const range = strengthRanges[strength];
        if (range) {
          const strengthMatches = filteredDrinks.filter(
            d => d.abv && d.abv >= range[0] && d.abv <= range[1]
          );
          if (strengthMatches.length > 0) filteredDrinks = strengthMatches;
        }
      }

      const recommendations = filteredDrinks.slice(0, 3);

      if (recommendations.length > 0) {
        return NextResponse.json({
          recommendations: recommendations.map(drink => ({
            ...drink,
            reason: alcohols?.length > 0 ? '根据你现有的材料推荐' : '为你精心挑选',
          })),
        });
      }

      return NextResponse.json({
        recommendations: CLASSIC_DRINKS.slice(0, 3).map(drink => ({
          ...drink,
          reason: '经典推荐',
        })),
      });
    }
  } catch (error) {
    console.error('Recommendation error:', error);
    return NextResponse.json(
      { error: 'Failed to get recommendations' },
      { status: 500 }
    );
  }
}
