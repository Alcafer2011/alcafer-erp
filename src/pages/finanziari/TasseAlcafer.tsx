import React, { useEffect, useState } from 'react';
import { Receipt, AlertTriangle, Calendar, DollarSign, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { usePermissions } from '../../hooks/usePermissions';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import HelpTooltip from '../../components/common/HelpTooltip';
import toast from 'react-hot-toast';

interface TasseData {
  ivaCorrente: number;
  tasseCorrente: number;
  scadenzeImminenti: any[];
  totalePagato: number;
  totaleDaPagare: number;
}

const TasseAlcafer: React.FC = () => {
  const [tasseData, setTasseData] = useState<TasseData>({
    ivaCorrente: 0,
    tasseCorrente: 0,
    scadenzeImminenti: [],
    totalePagato: 0,
    totaleDaPagare: 0
  });
  const [loading, setLoading] = useState(true);
  const permissions = usePermissions();

  useEffect(() => {
    fetchTasseData();
  }, []);

  const fetchTasseData = async () => {
    try {
      // Recupera dati IVA e tasse per Alcafer
      const { data: tasse, error } = await supabase
        .from('tasse_iva')
        .select('*')
        .eq('ditta', 'alcafer')
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
        .reduce((sum, t) => sum + (t.iva_da_versare + t.tasse_da_versare), 0) || 0;

      const totaleDaPagare = tasse?.filter(t => !t.pagato)
        .reduce((sum, t) => sum + (t.iva_da_versare + t.tasse_da_versare), 0) || 0;

      // Calcola IVA e tasse correnti (periodo attuale)
      const periodoCorrente = `${oggi.getFullYear()}-${String(oggi.getMonth() + 1).padStart(2, '0')}`;
      const tasseCorrente = tasse?.find(t => t.periodo === periodoCorrente);

      setTasseData({
        ivaCorrente: tasseCorrente?.iva_da_versare || 0,
        tasseCorrente: tasseCorrente?.tasse_da_versare || 0,
        scadenzeImminenti,
        totalePagato,
        totaleDaPagare
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

  const calcolaAliquoteRegimeOrdinario = (imponibile: number) => {
    // Regime ordinario ditta individuale - aliquote 2024
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

    // Addizionali regionali e comunali (stima media)
    addizionali = imponibile * 0.018; // 1.8% medio

    return {
      irpef: Math.round(irpef),
      addizionali: Math.round(addizionali),
      totale: Math.round(irpef + addizionali)
    };
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Tasse e IVA Alcafer</h1>
          <p className="mt-2 text-gray-600">Gestione fiscale regime ordinario - Ditta individuale</p>
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
                {scadenza.periodo}: €{(scadenza.iva_da_versare + scadenza.tasse_da_versare).toLocaleString('it-IT')} 
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
          className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-blue-600">IVA Corrente</p>
              <p className="text-2xl font-bold text-blue-900">
                €{tasseData.ivaCorrente.toLocaleString('it-IT')}
              </p>
            </div>
            <Receipt className="h-8 w-8 text-blue-600" />
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
                €{tasseData.tasseCorrente.toLocaleString('it-IT')}
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
          className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-purple-600">Già Pagato</p>
              <p className="text-2xl font-bold text-purple-900">
                €{tasseData.totalePagato.toLocaleString('it-IT')}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-600" />
          </div>
        </motion.div>
      </div>

      {/* Calcolatore Regime Ordinario */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl shadow-sm p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Calcolatore Regime Ordinario</h3>
          <HelpTooltip content="Calcolo automatico delle imposte secondo le aliquote IRPEF 2024 per ditta individuale" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Scaglioni IRPEF 2024</h4>
            <div className="space-y-3">
              {[
                { da: 0, a: 15000, aliquota: 23 },
                { da: 15001, a: 28000, aliquota: 27 },
                { da: 28001, a: 55000, aliquota: 38 },
                { da: 55001, a: 75000, aliquota: 41 },
                { da: 75001, a: null, aliquota: 43 }
              ].map((scaglione) => (
                <div key={scaglione.da} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">
                    €{scaglione.da.toLocaleString('it-IT')} - {scaglione.a ? `€${scaglione.a.toLocaleString('it-IT')}` : 'oltre'}
                  </span>
                  <span className="text-sm font-medium text-gray-900">{scaglione.aliquota}%</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-4">Esempio di Calcolo</h4>
            <div className="space-y-3">
              {[50000, 75000, 100000].map(imponibile => {
                const calcolo = calcolaAliquoteRegimeOrdinario(imponibile);
                return (
                  <div key={imponibile} className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm font-medium text-blue-900 mb-2">
                      Imponibile: €{imponibile.toLocaleString('it-IT')}
                    </div>
                    <div className="text-xs text-blue-700 space-y-1">
                      <div>IRPEF: €{calcolo.irpef.toLocaleString('it-IT')}</div>
                      <div>Addizionali: €{calcolo.addizionali.toLocaleString('it-IT')}</div>
                      <div className="font-medium">Totale: €{calcolo.totale.toLocaleString('it-IT')}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Lista Scadenze */}
      {tasseData.scadenzeImminenti.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
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
                    IVA
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tasse
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Totale
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
                      €{scadenza.iva_da_versare.toLocaleString('it-IT')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      €{scadenza.tasse_da_versare.toLocaleString('it-IT')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      €{(scadenza.iva_da_versare + scadenza.tasse_da_versare).toLocaleString('it-IT')}
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

      {/* Informazioni Regime Ordinario */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg"
      >
        <div className="flex items-center gap-2 mb-3">
          <Receipt className="h-5 w-5 text-blue-600" />
          <h3 className="font-medium text-blue-800">Regime Ordinario - Informazioni</h3>
        </div>
        
        <div className="text-sm text-blue-700 space-y-1">
          <p>• <strong>IVA:</strong> Versamento mensile o trimestrale al 22%</p>
          <p>• <strong>IRPEF:</strong> Calcolata su scaglioni progressivi (23% - 43%)</p>
          <p>• <strong>Addizionali:</strong> Regionali (max 3.33%) e comunali (max 0.8%)</p>
          <p>• <strong>Contributi INPS:</strong> Gestione separata 25.98% su reddito</p>
          <p>• <strong>Deduzioni:</strong> Spese professionali, ammortamenti, costi deducibili</p>
        </div>
      </motion.div>
    </div>
  );
};

export default TasseAlcafer;