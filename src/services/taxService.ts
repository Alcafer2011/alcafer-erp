import { supabase } from '../lib/supabase';
import { notificationService } from './notificationService';
import { addDays, format } from 'date-fns';

export interface TaxCalculation {
  ditta: 'alcafer' | 'gabifer';
  imponibile: number;
  iva: number;
  tasse: number;
  totale: number;
  regime: 'ordinario' | 'forfettario';
}

export class TaxService {
  private static instance: TaxService;

  private constructor() {}

  public static getInstance(): TaxService {
    if (!TaxService.instance) {
      TaxService.instance = new TaxService();
    }
    return TaxService.instance;
  }

  // Calcolo tasse regime ordinario (Alcafer)
  calculateOrdinaryTaxes(imponibile: number): TaxCalculation {
    let irpef = 0;
    let addizionali = 0;

    // Scaglioni IRPEF 2024
    if (imponibile <= 15000) {
      irpef = imponibile * 0.23;
    } else if (imponibile <= 28000) {
      irpef = 15000 * 0.23 + (imponibile - 15000) * 0.27;
    } else if (imponibile <= 55000) {
      irpef = 15000 * 0.23 + 13000 * 0.27 + (imponibile - 28000) * 0.38;
    } else if (imponibile <= 75000) {
      irpef = 15000 * 0.23 + 13000 * 0.27 + 27000 * 0.38 + (imponibile - 55000) * 0.41;
    } else {
      irpef = 15000 * 0.23 + 13000 * 0.27 + 27000 * 0.38 + 20000 * 0.41 + (imponibile - 75000) * 0.43;
    }

    // Addizionali regionali e comunali (stima)
    addizionali = imponibile * 0.018; // 1.8% medio

    const iva = imponibile * 0.22; // IVA 22%
    const tasse = irpef + addizionali;

    return {
      ditta: 'alcafer',
      imponibile,
      iva,
      tasse,
      totale: iva + tasse,
      regime: 'ordinario'
    };
  }

  // Calcolo tasse regime forfettario (Gabifer)
  calculateForfaitTaxes(fatturato: number): TaxCalculation {
    // Coefficiente di redditività per lavorazione metalli (67%)
    const coefficienteRedditivita = 0.67;
    const imponibile = fatturato * coefficienteRedditivita;
    
    // Imposta sostitutiva 15% (5% per i primi 5 anni se nuova attività)
    const impostaSostitutiva = imponibile * 0.15;
    
    // Contributi INPS 25.98%
    const contributiINPS = imponibile * 0.2598;
    
    const tasse = impostaSostitutiva + contributiINPS;

    return {
      ditta: 'gabifer',
      imponibile,
      iva: 0, // Regime forfettario senza IVA
      tasse,
      totale: tasse,
      regime: 'forfettario'
    };
  }

  async updateTaxesForJob(importo: number, ditta: 'alcafer' | 'gabifer'): Promise<void> {
    try {
      const calculation = ditta === 'alcafer' 
        ? this.calculateOrdinaryTaxes(importo)
        : this.calculateForfaitTaxes(importo);

      const periodo = format(new Date(), 'yyyy-MM');
      const dataScadenza = this.getNextTaxDeadline();

      // Aggiorna o inserisci il record delle tasse
      await supabase
        .from('tasse_iva')
        .upsert({
          ditta,
          periodo,
          iva_da_versare: calculation.iva,
          tasse_da_versare: calculation.tasse,
          data_scadenza: dataScadenza,
          pagato: false
        });

    } catch (error) {
      console.error('Errore nell\'aggiornamento delle tasse:', error);
      throw error;
    }
  }

  async checkUpcomingDeadlines(): Promise<void> {
    try {
      const today = new Date();
      const alertDate = addDays(today, 15); // 15 giorni prima

      const { data: scadenze, error } = await supabase
        .from('tasse_iva')
        .select('*')
        .eq('pagato', false)
        .lte('data_scadenza', format(alertDate, 'yyyy-MM-dd'))
        .gte('data_scadenza', format(today, 'yyyy-MM-dd'));

      if (error) throw error;

      for (const scadenza of scadenze || []) {
        const importoTotale = scadenza.iva_da_versare + scadenza.tasse_da_versare;
        await notificationService.sendTaxReminder(
          scadenza.ditta,
          importoTotale,
          format(new Date(scadenza.data_scadenza), 'dd/MM/yyyy')
        );
      }
    } catch (error) {
      console.error('Errore nel controllo delle scadenze:', error);
    }
  }

  private getNextTaxDeadline(): string {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Le scadenze IVA sono generalmente il 16 del mese successivo
    let deadlineMonth = currentMonth + 1;
    let deadlineYear = currentYear;

    if (deadlineMonth > 11) {
      deadlineMonth = 0;
      deadlineYear++;
    }

    return format(new Date(deadlineYear, deadlineMonth, 16), 'yyyy-MM-dd');
  }

  async getTaxSummary(ditta: 'alcafer' | 'gabifer', anno: number): Promise<any> {
    try {
      const { data: tasse, error } = await supabase
        .from('tasse_iva')
        .select('*')
        .eq('ditta', ditta)
        .gte('data_scadenza', `${anno}-01-01`)
        .lt('data_scadenza', `${anno + 1}-01-01`)
        .order('data_scadenza');

      if (error) throw error;

      const totalePagato = tasse?.filter(t => t.pagato)
        .reduce((sum, t) => sum + t.iva_da_versare + t.tasse_da_versare, 0) || 0;

      const totaleDaPagare = tasse?.filter(t => !t.pagato)
        .reduce((sum, t) => sum + t.iva_da_versare + t.tasse_da_versare, 0) || 0;

      return {
        ditta,
        anno,
        totalePagato,
        totaleDaPagare,
        scadenze: tasse || []
      };
    } catch (error) {
      console.error('Errore nel recupero del riepilogo tasse:', error);
      throw error;
    }
  }
}

export const taxService = TaxService.getInstance();
