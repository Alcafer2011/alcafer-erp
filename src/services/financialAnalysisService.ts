import { supabase } from '../lib/supabase';

export interface FinancialMetrics {
  ebitda: number;
  roi: number;
  roe: number;
  roa: number;
  currentRatio: number;
  quickRatio: number;
  debtToEquity: number;
  grossMargin: number;
  netMargin: number;
  assetTurnover: number;
  inventoryTurnover: number;
  cashFlow: {
    operativo: number;
    investimenti: number;
    finanziario: number;
  };
  puntoPareggio: number;
  indiceIndebitamento: number;
}

export interface GasparottoAnalysis {
  redditività: {
    score: number;
    suggerimenti: string[];
  };
  liquidità: {
    score: number;
    suggerimenti: string[];
  };
  efficienza: {
    score: number;
    suggerimenti: string[];
  };
  crescita: {
    score: number;
    suggerimenti: string[];
  };
  scoreComplessivo: number;
  priorità: string[];
}

export class FinancialAnalysisService {
  private static instance: FinancialAnalysisService;

  private constructor() {}

  public static getInstance(): FinancialAnalysisService {
    if (!FinancialAnalysisService.instance) {
      FinancialAnalysisService.instance = new FinancialAnalysisService();
    }
    return FinancialAnalysisService.instance;
  }

  async calculateFinancialMetrics(anno: number): Promise<FinancialMetrics> {
    try {
      // Recupera dati finanziari dall'anno specificato
      const { data: lavori } = await supabase
        .from('lavori')
        .select(`
          *,
          materiali_metallici(*),
          materiali_vari(*)
        `)
        .gte('data_fine', `${anno}-01-01`)
        .lt('data_fine', `${anno + 1}-01-01`)
        .eq('stato', 'completato');

      const { data: leasing } = await supabase
        .from('leasing_strumentali')
        .select('*')
        .eq('attivo', true);

      const { data: manovalanza } = await supabase
        .from('manovalanza')
        .select('*')
        .eq('attivo', true);

      // Calcoli base
      const ricaviTotali = lavori?.reduce((sum, l) => sum + l.importo_totale, 0) || 0;
      const costiMateriali = lavori?.reduce((sum, l) => {
        const costiMetallici = l.materiali_metallici?.reduce((s: number, m: any) => s + m.importo_totale, 0) || 0;
        const costiVari = l.materiali_vari?.reduce((s: number, m: any) => s + m.importo_totale, 0) || 0;
        return sum + costiMetallici + costiVari;
      }, 0) || 0;

      const costiLeasing = leasing?.reduce((sum, l) => sum + l.rata_mensile * 12, 0) || 0;
      const costiManovalanza = manovalanza?.reduce((sum, m) => sum + m.importo_mensile * 12, 0) || 0;

      const costiTotali = costiMateriali + costiLeasing + costiManovalanza;
      const margineOperativo = ricaviTotali - costiTotali;
      const ebitda = margineOperativo; // Semplificato

      // Calcolo metriche Gasparotto
      const attiviFissi = costiLeasing * 10; // Stima basata sui leasing
      const attiviCircolanti = ricaviTotali * 0.3; // Stima 30% dei ricavi
      const attiviTotali = attiviFissi + attiviCircolanti;
      const patrimonio = attiviTotali * 0.6; // Stima 60% di equity
      const debiti = attiviTotali - patrimonio;

      const roi = attiviTotali > 0 ? (margineOperativo / attiviTotali) : 0;
      const roe = patrimonio > 0 ? (margineOperativo / patrimonio) : 0;
      const roa = attiviTotali > 0 ? (margineOperativo / attiviTotali) : 0;

      const currentRatio = debiti > 0 ? (attiviCircolanti / (debiti * 0.4)) : 0; // 40% debiti a breve
      const quickRatio = currentRatio * 0.8; // Stima
      const debtToEquity = patrimonio > 0 ? (debiti / patrimonio) : 0;

      const grossMargin = ricaviTotali > 0 ? ((ricaviTotali - costiMateriali) / ricaviTotali) : 0;
      const netMargin = ricaviTotali > 0 ? (margineOperativo / ricaviTotali) : 0;
      const assetTurnover = attiviTotali > 0 ? (ricaviTotali / attiviTotali) : 0;
      const inventoryTurnover = costiMateriali > 0 ? (costiMateriali / (costiMateriali * 0.1)) : 0; // Stima 10% di scorte

      // Cash Flow semplificato
      const cashFlow = {
        operativo: margineOperativo,
        investimenti: -costiLeasing * 0.2, // Stima 20% per investimenti
        finanziario: debiti * 0.05 // Stima 5% per movimenti finanziari
      };

      const puntoPareggio = costiTotali;
      const indiceIndebitamento = debtToEquity;

      return {
        ebitda,
        roi,
        roe,
        roa,
        currentRatio,
        quickRatio,
        debtToEquity,
        grossMargin,
        netMargin,
        assetTurnover,
        inventoryTurnover,
        cashFlow,
        puntoPareggio,
        indiceIndebitamento
      };
    } catch (error) {
      console.error('Errore nel calcolo delle metriche finanziarie:', error);
      throw error;
    }
  }

  async performGasparottoAnalysis(metrics: FinancialMetrics): Promise<GasparottoAnalysis> {
    // Analisi secondo i metodi di Mirko Gasparotto
    
    // Analisi Redditività
    const redditabilitàScore = this.calculateProfitabilityScore(metrics);
    const redditabilitàSuggerimenti = this.getProfitabilitySuggestions(metrics);

    // Analisi Liquidità
    const liquiditàScore = this.calculateLiquidityScore(metrics);
    const liquiditàSuggerimenti = this.getLiquiditySuggestions(metrics);

    // Analisi Efficienza
    const efficienzaScore = this.calculateEfficiencyScore(metrics);
    const efficienzaSuggerimenti = this.getEfficiencySuggestions(metrics);

    // Analisi Crescita
    const crescitaScore = this.calculateGrowthScore(metrics);
    const crescitaSuggerimenti = this.getGrowthSuggestions(metrics);

    const scoreComplessivo = (redditabilitàScore + liquiditàScore + efficienzaScore + crescitaScore) / 4;

    const priorità = this.calculatePriorities(metrics);

    return {
      redditività: {
        score: redditabilitàScore,
        suggerimenti: redditabilitàSuggerimenti
      },
      liquidità: {
        score: liquiditàScore,
        suggerimenti: liquiditàSuggerimenti
      },
      efficienza: {
        score: efficienzaScore,
        suggerimenti: efficienzaSuggerimenti
      },
      crescita: {
        score: crescitaScore,
        suggerimenti: crescitaSuggerimenti
      },
      scoreComplessivo,
      priorità
    };
  }

  private calculateProfitabilityScore(metrics: FinancialMetrics): number {
    let score = 0;
    
    // ROI
    if (metrics.roi > 0.15) score += 25;
    else if (metrics.roi > 0.1) score += 15;
    else if (metrics.roi > 0.05) score += 10;

    // ROE
    if (metrics.roe > 0.18) score += 25;
    else if (metrics.roe > 0.12) score += 15;
    else if (metrics.roe > 0.08) score += 10;

    // Margine Netto
    if (metrics.netMargin > 0.15) score += 25;
    else if (metrics.netMargin > 0.1) score += 15;
    else if (metrics.netMargin > 0.05) score += 10;

    // EBITDA
    if (metrics.ebitda > 100000) score += 25;
    else if (metrics.ebitda > 50000) score += 15;
    else if (metrics.ebitda > 0) score += 10;

    return Math.min(score, 100);
  }

  private getProfitabilitySuggestions(metrics: FinancialMetrics): string[] {
    const suggestions: string[] = [];

    if (metrics.roi < 0.1) {
      suggestions.push('Aumenta l\'efficienza operativa riducendo i costi non produttivi');
      suggestions.push('Rivedi la strategia di pricing per migliorare i margini');
    }

    if (metrics.netMargin < 0.1) {
      suggestions.push('Ottimizza la struttura dei costi per migliorare la redditività');
      suggestions.push('Concentrati sui clienti e progetti più profittevoli');
    }

    if (metrics.ebitda < 50000) {
      suggestions.push('Incrementa il volume di affari mantenendo i margini');
      suggestions.push('Riduci i costi fissi attraverso l\'automazione');
    }

    return suggestions;
  }

  private calculateLiquidityScore(metrics: FinancialMetrics): number {
    let score = 0;

    if (metrics.currentRatio > 2) score += 30;
    else if (metrics.currentRatio > 1.5) score += 20;
    else if (metrics.currentRatio > 1) score += 10;

    if (metrics.quickRatio > 1.5) score += 30;
    else if (metrics.quickRatio > 1) score += 20;
    else if (metrics.quickRatio > 0.8) score += 10;

    if (metrics.cashFlow.operativo > 0) score += 40;
    else score -= 20;

    return Math.max(0, Math.min(score, 100));
  }

  private getLiquiditySuggestions(metrics: FinancialMetrics): string[] {
    const suggestions: string[] = [];

    if (metrics.currentRatio < 1.2) {
      suggestions.push('Migliora la gestione del capitale circolante');
      suggestions.push('Riduci i tempi di incasso dai clienti');
    }

    if (metrics.cashFlow.operativo < 0) {
      suggestions.push('Monitora attentamente i flussi di cassa operativi');
      suggestions.push('Considera linee di credito per la liquidità');
    }

    return suggestions;
  }

  private calculateEfficiencyScore(metrics: FinancialMetrics): number {
    let score = 0;

    if (metrics.assetTurnover > 1.5) score += 25;
    else if (metrics.assetTurnover > 1) score += 15;
    else if (metrics.assetTurnover > 0.5) score += 10;

    if (metrics.inventoryTurnover > 8) score += 25;
    else if (metrics.inventoryTurnover > 6) score += 15;
    else if (metrics.inventoryTurnover > 4) score += 10;

    if (metrics.grossMargin > 0.4) score += 25;
    else if (metrics.grossMargin > 0.3) score += 15;
    else if (metrics.grossMargin > 0.2) score += 10;

    if (metrics.debtToEquity < 0.3) score += 25;
    else if (metrics.debtToEquity < 0.5) score += 15;
    else if (metrics.debtToEquity < 0.8) score += 10;

    return Math.min(score, 100);
  }

  private getEfficiencySuggestions(metrics: FinancialMetrics): string[] {
    const suggestions: string[] = [];

    if (metrics.assetTurnover < 1) {
      suggestions.push('Ottimizza l\'utilizzo degli asset aziendali');
      suggestions.push('Considera la dismissione di asset non produttivi');
    }

    if (metrics.inventoryTurnover < 6) {
      suggestions.push('Migliora la gestione delle scorte di materiali');
      suggestions.push('Implementa sistemi just-in-time per i materiali');
    }

    if (metrics.debtToEquity > 0.5) {
      suggestions.push('Riduci il livello di indebitamento');
      suggestions.push('Aumenta il capitale proprio attraverso reinvestimenti');
    }

    return suggestions;
  }

  private calculateGrowthScore(metrics: FinancialMetrics): number {
    // Score basato sulla sostenibilità della crescita
    let score = 50; // Base score

    if (metrics.roe > 0.15 && metrics.debtToEquity < 0.4) score += 30;
    if (metrics.cashFlow.operativo > metrics.ebitda * 0.8) score += 20;

    return Math.min(score, 100);
  }

  private getGrowthSuggestions(metrics: FinancialMetrics): string[] {
    const suggestions: string[] = [];

    suggestions.push('Investi in tecnologie per aumentare la produttività');
    suggestions.push('Sviluppa nuovi mercati e clienti strategici');
    suggestions.push('Considera partnership per espandere le capacità');

    if (metrics.roe > 0.15) {
      suggestions.push('Reinvesti gli utili per sostenere la crescita');
    }

    return suggestions;
  }

  private calculatePriorities(metrics: FinancialMetrics): string[] {
    const priorities: string[] = [];

    if (metrics.currentRatio < 1.2) {
      priorities.push('PRIORITÀ ALTA: Migliorare la liquidità aziendale');
    }

    if (metrics.netMargin < 0.1) {
      priorities.push('PRIORITÀ ALTA: Aumentare la redditività operativa');
    }

    if (metrics.debtToEquity > 0.6) {
      priorities.push('PRIORITÀ MEDIA: Ridurre il livello di indebitamento');
    }

    if (metrics.assetTurnover < 1) {
      priorities.push('PRIORITÀ MEDIA: Ottimizzare l\'utilizzo degli asset');
    }

    if (priorities.length === 0) {
      priorities.push('Situazione finanziaria stabile - Focus sulla crescita');
    }

    return priorities;
  }
}

export const financialAnalysisService = FinancialAnalysisService.getInstance();