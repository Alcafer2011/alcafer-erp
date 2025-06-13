import axios from 'axios';
import { supabase } from '../lib/supabase';
import { notificationService } from './notificationService';

export interface MaterialPrice {
  material: string;
  price: number;
  currency: string;
  date: string;
  source: string;
}

export class MaterialPricesService {
  private static instance: MaterialPricesService;

  private constructor() {}

  public static getInstance(): MaterialPricesService {
    if (!MaterialPricesService.instance) {
      MaterialPricesService.instance = new MaterialPricesService();
    }
    return MaterialPricesService.instance;
  }

  async fetchCurrentPrices(): Promise<MaterialPrice[]> {
    try {
      // Simulazione API prezzi materiali - sostituire con API reale
      const mockPrices: MaterialPrice[] = [
        {
          material: 'Ferro S235 grezzo',
          price: 0.95 + (Math.random() - 0.5) * 0.1, // Variazione casuale per simulazione
          currency: 'EUR',
          date: new Date().toISOString(),
          source: 'MetalPrices API'
        },
        {
          material: 'Acciaio inox AISI 304',
          price: 3.20 + (Math.random() - 0.5) * 0.2,
          currency: 'EUR',
          date: new Date().toISOString(),
          source: 'MetalPrices API'
        },
        {
          material: 'Alluminio 6060',
          price: 2.80 + (Math.random() - 0.5) * 0.15,
          currency: 'EUR',
          date: new Date().toISOString(),
          source: 'MetalPrices API'
        },
        {
          material: 'Acciaio al carbonio',
          price: 0.85 + (Math.random() - 0.5) * 0.08,
          currency: 'EUR',
          date: new Date().toISOString(),
          source: 'MetalPrices API'
        }
      ];

      return mockPrices;
    } catch (error) {
      console.error('Error fetching material prices:', error);
      throw error;
    }
  }

  async updateDatabasePrices(): Promise<void> {
    try {
      const currentPrices = await this.fetchCurrentPrices();
      const updates: Array<{ material: string; oldPrice: number; newPrice: number }> = [];

      for (const priceData of currentPrices) {
        // Ottieni il prezzo attuale dal database
        const { data: currentRecord } = await supabase
          .from('prezzi_materiali')
          .select('prezzo_kg')
          .eq('tipo_materiale', priceData.material)
          .single();

        const oldPrice = currentRecord?.prezzo_kg || 0;
        const newPrice = Math.round(priceData.price * 1000) / 1000; // Arrotonda a 3 decimali

        // Aggiorna solo se c'è una differenza significativa (>1%)
        if (Math.abs(newPrice - oldPrice) / oldPrice > 0.01) {
          await supabase
            .from('prezzi_materiali')
            .upsert({
              tipo_materiale: priceData.material,
              prezzo_kg: newPrice,
              data_aggiornamento: new Date().toISOString().split('T')[0],
              fonte: priceData.source
            });

          updates.push({
            material: priceData.material,
            oldPrice,
            newPrice
          });
        }
      }

      // Invia notifica se ci sono stati aggiornamenti
      if (updates.length > 0) {
        await notificationService.sendPriceUpdateNotification(updates);
      }

      console.log(`Aggiornati ${updates.length} prezzi materiali`);
    } catch (error) {
      console.error('Error updating material prices:', error);
      throw error;
    }
  }

  async getUtilityCosts(): Promise<any> {
    try {
      // Simulazione API costi utenze - sostituire con API reali
      const utilityCosts = {
        electricity: {
          provider: 'ASM Voghera',
          fixedCost: 45.50, // €/mese
          variableCost: 0.25, // €/kWh
          installedPower: 100, // kW
          lastUpdate: new Date().toISOString()
        },
        water: {
          provider: 'Pavia Acque',
          fixedCost: 12.30, // €/mese
          variableCost: 2.50, // €/m³
          lastUpdate: new Date().toISOString()
        },
        gas: {
          provider: 'ASM Voghera',
          fixedCost: 8.90, // €/mese
          variableCost: 0.85, // €/m³
          installedCapacity: 3, // m³
          lastUpdate: new Date().toISOString()
        }
      };

      return utilityCosts;
    } catch (error) {
      console.error('Error fetching utility costs:', error);
      throw error;
    }
  }

  async updateUtilityCosts(): Promise<void> {
    try {
      const costs = await this.getUtilityCosts();

      // Aggiorna elettricità
      await supabase
        .from('costi_utenze')
        .upsert({
          tipo: 'elettricita',
          fornitore: costs.electricity.provider,
          costo_fisso: costs.electricity.fixedCost,
          costo_variabile: costs.electricity.variableCost,
          unita_misura: 'kWh',
          potenza_installata: costs.electricity.installedPower,
          data_aggiornamento: new Date().toISOString().split('T')[0]
        });

      // Aggiorna acqua
      await supabase
        .from('costi_utenze')
        .upsert({
          tipo: 'acqua',
          fornitore: costs.water.provider,
          costo_fisso: costs.water.fixedCost,
          costo_variabile: costs.water.variableCost,
          unita_misura: 'm³',
          data_aggiornamento: new Date().toISOString().split('T')[0]
        });

      // Aggiorna gas
      await supabase
        .from('costi_utenze')
        .upsert({
          tipo: 'gas',
          fornitore: costs.gas.provider,
          costo_fisso: costs.gas.fixedCost,
          costo_variabile: costs.gas.variableCost,
          unita_misura: 'm³',
          potenza_installata: costs.gas.installedCapacity,
          data_aggiornamento: new Date().toISOString().split('T')[0]
        });

      console.log('Costi utenze aggiornati con successo');
    } catch (error) {
      console.error('Error updating utility costs:', error);
      throw error;
    }
  }
}

export const materialPricesService = MaterialPricesService.getInstance();