import React, { useEffect, useState } from 'react';
import { Receipt, AlertTriangle, Calendar, DollarSign, TrendingUp, Calculator } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { usePermissions } from '../../hooks/usePermissions';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import HelpTooltip from '../../components/common/HelpTooltip';
import toast from 'react-hot-toast';

interface TasseData {
  tasseCorrente: number;
  scadenzeImminenti: any[];
  totalePagato: number;
  totaleDaPagare: number;
  fatturatoAnno: number;
}

const TasseGabifer: React.FC = () => {
  const [tasseData, setTasseData] = useState<TasseData>({
    tasseCorrente: 0,
    scadenzeImminenti: [],
    totalePagato: 0,
    totaleDaPagare: 0,
    fatturatoAnno: 0
  });
  const [loading, setLoading] = useState(true);
  const permissions = usePermissions();

  useEffect(() => {
    fetchTasseData();
  }, []);

  const fetchTasseData = async () => {
    try {
      // Recupera dati tasse per Gabifer (no IVA)
      const { data: tasse, error } = await supabase
        .from('tasse_iva')
        .select('*')
        .eq('ditta', 'gabifer')
        .order('data_scadenza', { ascending: true });

      if (error) throw error;

      const oggi = new Date();
      const tra15Giorni = new Date();
      tra15Giorni.setDate(oggi.getDate() + 15);

      const scadenzeImminenti = tasse?.filter(t => 
        !t.pagato && 
        new Date(t.data_scadenza) <= tra15Giorni &&
        new Date(t.data_scadenza) >= oggi
      ) || [];

      const totalePagato = tasse?.filter(t => t.pagato)
        .reduce((sum, t) => sum + t.tasse_da_versare, 0) || 0;

      const totaleDaPagare = tasse?.filter(t => !t.pagato)
        .reduce((sum, t) => sum + t.tasse_da_versare, 0) || 0;

      // Calcola tasse correnti
      const periodoCorrente = `${oggi.getFullYear()}-${String(oggi.getMonth() + 1).padStart(2, '0')}`;
      const tasseCorrente = tasse?.find(t => t.periodo === periodoCorrente);

      // Calcola fatturato anno corrente (simulato)
      const fatturatoAnno = 45000; // Da calcolare dai lavori reali

      setTasseData({
        tasseCorrente: tasseCorrente?.tasse_da_versare || 0,
        scadenzeImminenti,
        totalePagato,
        totaleDaPagare,
        fatturatoAnno
      });
    } catch (error) {
      console.error('Errore nel caricamento delle tasse:', error);
      toast.error('Errore nel caricamento dei dati');
    } finally {
      setLoading(false);
    }
  };

  const marcaPagato = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tasse_iva')
        .update({ pagato: true })
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Pagamento registrato con successo');
      fetchTasseData();
    } catch (error) {
      console.error('Errore nell\'aggiornamento:', error);
      toast.error('Errore nell\'aggiornamento');
    }
  };

  const calcolaRegimeForfettario = (fatturato: number) => {
    // Regime forfettario 2024 - Codice ATECO 25.50.00 (Fabbricazione di articoli in metallo)
    const coefficienteRedditivita = 0.67; // 67% per lavorazione metalli
    const aliquotaImposta = 0.15; // 15% (NON 5% per i primi 5 anni)
    const contributiINPS = 0.2598; // 25.98% su reddito imponibile

    const redditoImponibile = fatturato * coefficienteRedditivita;
    const impostaSostitutiva = redditoImponibile * aliquotaImposta;
    const contributi = redditoImponibile * contributiINPS;
    const totaleImposte = impostaSostitutiva + contributi;

    return {
      fatturato,
      coefficienteRedditivita: coefficienteRedditivita * 100,
      redditoImponibile: Math.round(redditoImponibile),
      impostaSostitutiva: Math.round(impostaSostitutiva),
      contributi: Math.round(contributi),
      totaleImposte: Math.round(totaleImposte),
      aliquotaEffettiva: ((totaleImposte / fatturato) * 100).toFixed(2)
    };
  };

  const calcoloCorrente = calcolaRegimeForfettario(tasseData.fatturatoAnno);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!permissions.canModifyTaxes) {
    return (
      <div className="text-center py-12">
        <Receipt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Accesso Limitato</h3>
        <p className="text-gray-500">Non hai i permessi per visualizzare questa sezione.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tasse Gabifer</h1>
          <p className="mt-2 text-gray-600">Gestione fiscale regime forfettario - Ditta individuale</p>
        </div>
      </div>

      {/* Alert Scadenze */}
      {tasseData.scadenzeImminenti.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg"
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h3 className="font-medium text-red-800">Scadenze Imminenti</h3>
          </div>
          <div className="space-y-1">
            {tasseData.scadenzeImminenti.map((scadenza: any) => (
              <p key={scadenza.id} className="text-sm text-red-700">
                {scadenza.periodo}: €{scadenza.tasse_da_versare.toLocaleString('it-IT')} 
                - Scadenza: {new Date(scadenza.data_scadenza).toLocaleDateString('it-IT')}
              </p>
            ))}
          </div>
        </motion.div>
      )}

      {/* Riepilogo Corrente */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-purple-600">Fatturato Anno</p>
              <p className="text-2xl font-bold text-purple-900">
                €{tasseData.fatturatoAnno.toLocaleString('it-IT')}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-green-600">Tasse Correnti</p>
              <p className="text-2xl font-bold text-green-900">
                €{calcoloCorrente.totaleImposte.toLocaleString('it-IT')}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-yellow-600">Da Pagare</p>
              <p className="text-2xl font-bold text-yellow-900">
                €{tasseData.totaleDaPagare.toLocaleString('it-IT')}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-yellow-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-blue-600">Già Pagato</p>
              <p className="text-2xl font-bold text-blue-900">
                €{tasseData.totalePagato.toLocaleString('it-IT')}
              </p>
            </div>
            <Receipt className="h-8 w-8 text-blue-600" />
          </div>
        </motion.div>
      </div>

      {/* Calcolatore Regime Forfettario */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl shadow-sm p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Calcolatore Regime Forfettario</h3>
          <HelpTooltip content="Calcolo automatico delle imposte secondo il regime forfettario 2024 - ATECO 25.50.00" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Parametri Regime Forfettario</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="text-sm text-gray-600">Codice ATECO</span>
                <span className="text-sm font-medium text-gray-900">25.50.00</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="text-sm text-gray-600">Coefficiente Redditività</span>
                <span className="text-sm font-medium text-gray-900">67%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="text-sm text-gray-600">Imposta Sostitutiva</span>
                <span className="text-sm font-medium text-gray-900">15%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="text-sm text-gray-600">Contributi INPS</span>
                <span className="text-sm font-medium text-gray-900">25.98%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="text-sm text-gray-600">Limite Fatturato</span>
                <span className="text-sm font-medium text-gray-900">€85.000</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-4">Calcolo Anno Corrente</h4>
            <div className="space-y-3">
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Fatturato:</span>
                    <span className="text-sm font-medium">€{calcoloCorrente.fatturato.toLocaleString('it-IT')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Reddito Imponibile (67%):</span>
                    <span className="text-sm font-medium">€{calcoloCorrente.redditoImponibile.toLocaleString('it-IT')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Imposta Sostitutiva (15%):</span>
                    <span className="text-sm font-medium">€{calcoloCorrente.impostaSostitutiva.toLocaleString('it-IT')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Contributi INPS:</span>
                    <span className="text-sm font-medium">€{calcoloCorrente.contributi.toLocaleString('it-IT')}</span>
                  </div>
                  <div className="border-t border-purple-200 pt-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-purple-900">Totale Imposte:</span>
                      <span className="text-sm font-bold text-purple-900">€{calcoloCorrente.totaleImposte.toLocaleString('it-IT')}</span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-purple-600">Aliquota Effettiva:</span>
                      <span className="text-xs font-medium text-purple-600">{calcoloCorrente.aliquotaEffettiva}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Simulazioni */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-xl shadow-sm p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Simulazioni Fatturato</h3>
          <Calculator className="h-6 w-6 text-gray-600" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[30000, 50000, 70000].map(fatturato => {
            const calcolo = calcolaRegimeForfettario(fatturato);
            return (
              <div key={fatturato} className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-900 mb-3">
                  Fatturato: €{fatturato.toLocaleString('it-IT')}
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>Reddito: €{calcolo.redditoImponibile.toLocaleString('it-IT')}</div>
                  <div>Imposta: €{calcolo.impostaSostitutiva.toLocaleString('it-IT')}</div>
                  <div>Contributi: €{calcolo.contributi.toLocaleString('it-IT')}</div>
                  <div className="font-medium text-gray-900 pt-1 border-t">
                    Totale: €{calcolo.totaleImposte.toLocaleString('it-IT')}
                  </div>
                  <div className="text-purple-600">
                    Aliquota: {calcolo.aliquotaEffettiva}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Lista Scadenze */}
      {tasseData.scadenzeImminenti.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-sm overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900">Scadenze da Gestire</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Periodo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tasse
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Scadenza
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Azioni
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tasseData.scadenzeImminenti.map((scadenza: any) => (
                  <tr key={scadenza.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {scadenza.periodo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      €{scadenza.tasse_da_versare.toLocaleString('it-IT')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(scadenza.data_scadenza).toLocaleDateString('it-IT')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => marcaPagato(scadenza.id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
                      >
                        Marca Pagato
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Informazioni Regime Forfettario */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-lg"
      >
        <div className="flex items-center gap-2 mb-3">
          <Receipt className="h-5 w-5 text-purple-600" />
          <h3 className="font-medium text-purple-800">Regime Forfettario - Vantaggi</h3>
        </div>
        
        <div className="text-sm text-purple-700 space-y-1">
          <p>• <strong>No IVA:</strong> Fatturazione senza IVA (art. 1, comma 58, L. 190/2014)</p>
          <p>• <strong>Imposta Unica:</strong> 15% sul reddito imponibile</p>
          <p>• <strong>Semplificazioni:</strong> Contabilità semplificata, no spesometro</p>
          <p>• <strong>Limite:</strong> Fatturato massimo €85.000/anno</p>
          <p>• <strong>Contributi:</strong> INPS gestione separata su reddito imponibile</p>
        </div>
      </motion.div>
    </div>
  );
};

export default TasseGabifer;
