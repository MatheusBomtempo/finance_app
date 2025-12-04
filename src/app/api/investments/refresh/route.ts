import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';
import { getSessionUser } from '@/lib/session';
import { CoinGeckoService } from '@/lib/services/CoinGeckoService';
import { CDIService } from '@/lib/services/CDIService';

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
  }

  try {
    // Buscar investimentos automatizados do usuário
    const [investments] = await pool.execute(
      'SELECT * FROM investments WHERE user_id = ? AND is_automated = TRUE',
      [user.userId]
    ) as any[];

    if (investments.length === 0) {
      return NextResponse.json({ message: 'Nenhum investimento automatizado encontrado', updated: 0 });
    }

    const cryptoIds: string[] = [];
    const cryptoInvestments: any[] = [];
    const cdiInvestments: any[] = [];

    // Separar por tipo
    for (const inv of investments) {
      if (inv.type === 'Criptomoedas' && inv.api_id) {
        cryptoIds.push(inv.api_id);
        cryptoInvestments.push(inv);
      } else if (inv.type === 'Renda Fixa' && inv.api_id === 'CDI') {
        cdiInvestments.push(inv);
      }
    }

    let updatedCount = 0;

    // Atualizar Criptomoedas
    if (cryptoIds.length > 0) {
      const prices = await CoinGeckoService.getPrices(cryptoIds);
      
      for (const inv of cryptoInvestments) {
        const priceData = prices[inv.api_id];
        if (priceData && priceData.brl) {
          // Se tiver quantidade, usa ela. Se não, tenta estimar (fallback)
          const quantity = inv.quantity || (inv.amount / (priceData.brl / (1 + (priceData.brl_24h_change / 100)))); 
          // Fallback é ruim pois o preço mudou. 
          // Melhor: se não tiver quantity, não atualiza ou assume que amount é o valor investido e tenta manter proporção?
          // Vamos usar quantity. Se for null, não atualiza corretamente (ou atualiza apenas variação %?)
          
          if (inv.quantity) {
             const newCurrentValue = inv.quantity * priceData.brl;
             if (newCurrentValue !== inv.current_value) {
               await pool.execute(
                 'UPDATE investments SET current_value = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                 [newCurrentValue, inv.id]
               );
               updatedCount++;
             }
          }
        }
      }
    }

    // Wait, I need to pause and fix the schema.
    
    // Atualizar CDI
    if (cdiInvestments.length > 0) {
      for (const inv of cdiInvestments) {
        // yield_rate armazena o percentual do CDI (ex: 100, 110)
        const percentage = inv.yield_rate || 100;
        const startDate = inv.purchase_date instanceof Date 
          ? inv.purchase_date.toISOString().split('T')[0] 
          : inv.purchase_date;

        const { currentValue } = await CDIService.calculateCorrection(
          inv.amount,
          startDate,
          percentage
        );

        if (currentValue !== inv.current_value) {
          await pool.execute(
            'UPDATE investments SET current_value = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [currentValue, inv.id]
          );
          updatedCount++;
        }
      }
    }

    return NextResponse.json({ 
      message: 'Atualização concluída', 
      updated: updatedCount 
    });
  } catch (error) {
    console.error('Error refreshing investments:', error);
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
  }
}
