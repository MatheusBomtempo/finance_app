import { NextRequest, NextResponse } from 'next/server';
import { CoinGeckoService } from '@/lib/services/CoinGeckoService';
import { getSessionUser } from '@/lib/session';

export async function GET(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const query = searchParams.get('query');
  const ids = searchParams.get('ids');

  try {
    if (action === 'search' && query) {
      const results = await CoinGeckoService.searchCoins(query);
      return NextResponse.json(results);
    }

    if (action === 'price' && ids) {
      const idList = ids.split(',');
      const prices = await CoinGeckoService.getPrices(idList);
      return NextResponse.json(prices);
    }

    return NextResponse.json({ message: 'Ação inválida' }, { status: 400 });
  } catch (error) {
    console.error('Crypto API error:', error);
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
  }
}
