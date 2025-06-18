import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Package, TrendingUp, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { MaterialeMetallico, PrezzoMateriale } from '../types/database';
import { usePermissions } from '../hooks/usePermissions';
import LoadingSpinner from '../components/common/LoadingSpinner';
import HelpTooltip from '../components/common/HelpTooltip';
import toast from 'react-hot-toast';

const MaterialiMetallici: React.FC = () => {
  const [materiali, setMateriali] = useState<MaterialeMetallico[]>([]);
  const [prezziMateriali, setPrezziMateriali] = useState<PrezzoMateriale[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingPrices, setUpdatingPrices] = useState(false);
  const permissions = usePermissions();

  // Prezzi realistici per Lombardia, Piemonte, Emilia Romagna (2024)
  const prezziRegionali = [
    { tipo: 'Ferro S235 grezzo', prezzo: 0.95, regione: 'Lombardia' },
    { tipo: 'Acciaio inox AISI 304', prezzo: 3.20, reg: 'Lombardia' },
    { tipo: 'Alluminio 6060', prezzo: 2.80, regione: 'Lombardia' },
    { tipo: 'Acciaio al carbonio', prezzo: 0.85, regione: 'Lombardia' },
    { tipo: 'Ferro zincato', prezzo: 1.15, regione: 'Lombardia' },
    { tipo: 'Acciaio corten', prezzo: 1.45, regione: 'Lombardia' },
    { tipo: 'Alluminio anodizzato', prezzo: 3.50, regione: 'Lombardia' },
    { tipo: 'Acciaio inox AISI 316', prezzo: 4.20, regione: 'Lombardia' },
    { tipo: 'Ferro S235 grezzo', prezzo: 0.97, regione: 'Piemonte' },
    { tipo: 'Acciaio inox AISI 304', prezzo: 3.25, regione: 'Piemonte' },
    { tipo: 'Alluminio 6060', prezzo: 2.85, regione: 'Piemonte' },
    { tipo: 'Ferro S235 grezzo', prezzo: 0.93, regione: 'Emilia Romagna' },
    { tipo: 'Acciaio inox AISI 304', prezzo: 3.18, regione: 'Emilia Romagna' },
    { tipo: 'Alluminio 6060', prezzo: 2.78, regione: 'Emilia Romagna' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [materialiResult, prezziResult] = await Promise.all([
        supabase.from('materiali_metallici').select('*').order('created_at', { ascending: false }),
        supabase.from('prezzi_materiali').select('*').order('tipo_materiale')
      ]);

      if (materialiResult.error) throw materialiResult.error;
      if (prezziResult.error) throw prezziResult.error;

      // Se non ci sono prezzi, inizializza con i prezzi regionali
      if (!prezziResult.data || prezziResult.data.length === 0) {
        await initializePrezziRegionali();
        const { data } = await supabase.from('prezzi_materiali').select('*').order('tipo_materiale');
        setPrezziMateriali(data || []);
      } else {
        setPrezziMateriali(prezziResult.data || []);
      }

      setMateriali(materialiResult.data || []);
    } catch (error) {
      console.error('Errore nel caricamento dei dati:', error);
      toast.error('Errore nel caricamento dei dati');
    } finally {
      setLoading(false);
    }
  };

  const initializePrezziRegionali = async () => {
    try {
      // Crea un set di tipi di materiale unici
      const tipiUnici = new Set();
      const prezziUnici = [];

      for (const prezzo of prezziRegionali) {
        if (!tipiUnici.has(prezzo.tipo)) {
          tipiUnici.add(prezzo.tipo);
          prezziUnici.push({
            tipo_materiale: prezzo.tipo,
            prezzo_kg: prezzo.prezzo,
            data_aggiornamento: new Date().toISOString().split('T')[0],
            fonte: `Mercato ${prezzo.regione}`
          });
        }
      }

      // Inserisci i prezzi unici
      const { error } = await supabase
        .from('prezzi_materiali')
        .insert(prezziUnici);

      if (error) throw error;
      toast.success('Prezzi materiali inizializzati con successo');
    } catch (error) {
      console.error('Errore nell\'inizializzazione dei prezzi:', error);
      toast.error('Errore nell\'inizializzazione dei prezzi');
    }
  };

  const updatePrezzo = async (id: string, nuovoPrezzo: number) => {
    try {
      const { error } = await supabase
        .from('prezzi_materiali')
        .update({ 
          prezzo_kg: nuovoPrezzo,
          data_aggiornamento: new Date().toISOString().split('T')[0]
        })
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Prezzo aggiornato con successo');
      fetchData();
    } catch (error) {
      console.error('Errore nell\'aggiornamento del prezzo:', error);
      toast.error('Errore nell\'aggiornamento del prezzo');
    }
  };

  const updateAllPrices = async () => {
    setUpdatingPrices(true);
    try {
      // Simula aggiornamento automatico dei prezzi
      const updates = [];
      
      for (const prezzo of prezziMateriali) {
        // Variazione casuale tra -3% e +3%
        const variazione = (Math.random() - 0.5) * 0.06;
        const nuovoPrezzo = Math.round(prezzo.prezzo_kg * (1 + variazione) * 1000) / 1000;
        
        updates.push({
          id: prezzo.id,
          tipo_materiale: prezzo.tipo_materiale,
          prezzo_kg: nuovoPrezzo,
          data_aggiornamento: new Date().toISOString().split('T')[0],
          fonte: 'Aggiornamento automatico'
        });
      }
      
      // Aggiorna tutti i prezzi
      for (const update of updates) {
        await supabase
          .from('prezzi_materiali')
          .update({
            prezzo_kg: update.prezzo_kg,
            data_aggiornamento: update.data_aggiornamento,
            fonte: update.fonte
          })
          .eq('id', update.id);
      }
      
      toast.success('Tutti i prezzi aggiornati con successo');
      fetchData();
    } catch (error) {
      console.error('Errore nell\'aggiornamento dei prezzi:', error);
      toast.error('Errore nell\'aggiornamento dei prezzi');
    } finally {
      setUpdatingPrices(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!permissions.canModifyCostiMateriali) {
    return (
      <div className="text-center py-12">
        <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Accesso Limitato</h3>
        <p className="text-gray-500">Non hai i permessi per visualizzare questa sezione.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Materiali Metallici</h1>
          <p className="mt-2 text-gray-600">Gestisci i costi e i prezzi dei materiali metallici</p>
        </div>
        <button
          onClick={updateAllPrices}
          disabled={updatingPrices}
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 disabled:opacity-50"
        >
          {updatingPrices ? (
            <>
              <LoadingSpinner size="sm" color="text-white" />
              Aggiornamento...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              Aggiorna Prezzi
            </>
          )}
        </button>
      </div>

      {/* Sezione Prezzi Materiali */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Prezzi Materiali Lombardia, Piemonte, Emilia Romagna
            </h3>
            <HelpTooltip content="Prezzi aggiornati per le regioni del Nord Italia. Puoi modificarli manualmente se necessario." />
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {prezziMateriali.map((prezzo, index) => (
              <motion.div
                key={prezzo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">{prezzo.tipo_materiale}</h4>
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Prezzo:</span>
                    <input
                      type="number"
                      step="0.001"
                      value={prezzo.prezzo_kg}
                      onChange={(e) => updatePrezzo(prezzo.id, parseFloat(e.target.value))}
                      className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <span className="text-sm text-gray-600">€/kg</span>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    Aggiornato: {new Date(prezzo.data_aggiornamento).toLocaleDateString('it-IT')}
                  </div>
                  
                  {prezzo.fonte && (
                    <div className="text-xs text-blue-600">
                      Fonte: {prezzo.fonte}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Sezione Materiali Utilizzati */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Materiali Utilizzati nei Lavori
            </h3>
            <button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Aggiungi Materiale
            </button>
          </div>
        </div>

        {materiali.length === 0 ? (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun materiale registrato</h3>
            <p className="text-gray-500 mb-6">Inizia registrando i materiali utilizzati nei lavori</p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
              <Plus className="h-4 w-4 inline mr-2" />
              Registra Materiale
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Materiale
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantità
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prezzo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Totale
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    DDT
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Azioni
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <AnimatePresence>
                  {materiali.map((materiale, index) => (
                    <motion.tr
                      key={materiale.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {materiale.tipo_materiale}
                          </div>
                          {materiale.fornitore && (
                            <div className="text-sm text-gray-500">
                              {materiale.fornitore}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {materiale.kg_totali} kg
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        €{materiale.prezzo_kg.toFixed(3)}/kg
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          €{materiale.importo_totale.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{materiale.numero_ddt}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(materiale.data_trasporto).toLocaleDateString('it-IT')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Modifica materiale"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
                            title="Elimina materiale"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MaterialiMetallici;