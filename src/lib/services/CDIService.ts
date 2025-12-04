const BCB_API_URL = 'https://api.bcb.gov.br/dados/serie/bcdata.sgs.12/dados';

interface CDIData {
  data: string;
  valor: string; // Vem como string "0.04"
}

// Cache para dados do CDI
let cdiCache: { data: CDIData[], timestamp: number } | null = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas (CDI muda diariamente)

export const CDIService = {
  async getCDIHistory(startDate?: string): Promise<CDIData[]> {
    if (cdiCache && Date.now() - cdiCache.timestamp < CACHE_DURATION) {
      return filterData(cdiCache.data, startDate);
    }

    try {
      // Busca últimos 10 anos para garantir
      const response = await fetch(`${BCB_API_URL}?formato=json`);
      if (!response.ok) throw new Error('BCB API error');
      
      const data: CDIData[] = await response.json();
      
      cdiCache = { data, timestamp: Date.now() };
      return filterData(data, startDate);
    } catch (error) {
      console.error('Error fetching CDI history:', error);
      return [];
    }
  },

  async calculateCorrection(
    amount: number, 
    startDate: string, 
    percentage: number = 100
  ): Promise<{ currentValue: number, grossReturn: number }> {
    const history = await this.getCDIHistory(startDate);
    
    if (history.length === 0) {
      return { currentValue: amount, grossReturn: 0 };
    }

    let factor = 1.0;
    
    // O CDI diário da API do BCB já é percentual (ex: 0.04 significa 0.04%)
    // Fórmula: Fator = Product (1 + (CDI_diario * percentual / 100))
    // Mas a API retorna em percentual, então dividimos por 100
    
    for (const day of history) {
      const dailyRate = parseFloat(day.valor); // ex: 0.04
      const appliedRate = (dailyRate / 100) * (percentage / 100);
      factor *= (1 + appliedRate);
    }

    const currentValue = amount * factor;
    const grossReturn = currentValue - amount;

    return {
      currentValue: Number(currentValue.toFixed(2)),
      grossReturn: Number(grossReturn.toFixed(2))
    };
  }
};

function filterData(data: CDIData[], startDate?: string): CDIData[] {
  if (!startDate) return data;
  
  const start = parseDate(startDate);
  return data.filter(item => parseDate(formatDateToISO(item.data)) >= start);
}

function parseDate(dateStr: string): number {
  // dateStr vem como YYYY-MM-DD (ISO) ou DD/MM/YYYY (API)
  if (dateStr.includes('/')) {
    const [day, month, year] = dateStr.split('/');
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).getTime();
  }
  return new Date(dateStr).getTime();
}

function formatDateToISO(dateStr: string): string {
  if (dateStr.includes('/')) {
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month}-${day}`;
  }
  return dateStr;
}
