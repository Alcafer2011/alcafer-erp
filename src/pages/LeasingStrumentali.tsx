import React, { useEffect, useState } from 'react';
import { Edit, Wrench, Zap, DollarSign, ToggleLeft, ToggleRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { LeasingStrumentale } from '../types/database';
import { usePermissions } from '../hooks/usePermissions';
import LoadingSpinner from '../components/common/LoadingSpinner';
import HelpTooltip from '../components/common/HelpTooltip';
import toast from 'react-hot-toast';

const LeasingStrumentali: React.FC = () => {
  const [leasingStrumentali, setLeasingStrumentali] = useState<LeasingStrumentale[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ rata_mensile: number; consumo_kw?: number }>({
    rata_mensile: 0,
    consumo_kw: 0
  });
  const permissions = usePermissions();

  useEffect(() => {
    fetchLeasingStrumentali();
  }, []);

  const fetchLeasingStrumentali = async () => {
    try {
      const { data, error } = await supabase
        .from('leasing_strumentali')
        .select('*')
        .order('nome_strumento');

      if (error) throw error;
      setLeasingStrumentali(data || []);
    } catch (error) {
      console.error('Errore nel caricamento del leasing strumentali:', error);
      toast.error('Errore nel caricamento dei dati');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (strumento: LeasingStrumentale) => {
    setEditingId(strumento.id);
    setEditValues({
      rata_mensile: strumento.rata_mensile,
      consumo_kw: strumento.consumo_kw || 0
    });
  };

  const handleSave = async (id: string) => {
    try {
      const { error } = await supabase
        .from('leasing_strumentali')
        .update({
          rata_mensile: editValues.rata_mensile,
          consumo_kw: editValues.consumo_kw || null
        })
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Dati aggiornati con successo');
      setEditingId(null);
      fetchLeasingStrumentali();
    } catch (error) {
      console.error('Errore nell\'aggiornamento:', error);
      toast.error('Errore nell\'aggiornamento');
    }
  };

  const toggleAttivo = async (id: string, attivo: boolean) => {
    try {
      const { error } = await supabase
        .from('leasing_strumentali')
        .update({ attivo: !attivo })
        .eq('id', id);

      if (error) throw error;
      
      toast.success(`Strumento ${!attivo ? 'attivato' : 'disattivato'}`);
      fetchLeasingStrumentali();
    } catch (error) {
      console.error('Errore nell\'aggiornamento dello stato:', error);
      toast.error('Errore nell\'aggiornamento');
    }
  };

  const getTotaleMensile = () => {
    return leasingStrumentali
      .filter(s => s.attivo)
      .reduce((sum, s) => sum + s.rata_mensile, 0);
  };

  const getConsumoTotale = () => {
    return leasingStrumentali
      .filter(s => s.attivo && s.consumo_kw)
      .reduce((sum, s) => sum + (s.consumo_kw || 0), 0);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!permissions.canModifyLeasing) {
    return (
      <div className="text-center py-12">
        <Wrench className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Accesso Limitato</h3>
        <p className="text-gray-500">Non hai i permessi per visualizzare questa sezione.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leasing Strumentali</h1>
          <p className="mt-2 text-gray-600">Gestisci i costi mensili di attrezzature e servizi</p>
        </div>
      </div>

      {/* Riepilogo Totali */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Totale Mensile</p>
              <p className="text-2xl font-bold text-blue-900">
                €{getTotaleMensile().toLocaleString('it-IT', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-blue-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Consumo Totale</p>
              <p className="text-2xl font-bold text-green-900">
                {getConsumoTotale().toFixed(1)} kW
              </p>
            </div>
            <Zap className="h-8 w-8 text-green-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Strumenti Attivi</p>
              <p className="text-2xl font-bold text-purple-900">
                {leasingStrumentali.filter(s => s.attivo).length}/{leasingStrumentali.length}
              </p>
            </div>
            <Wrench className="h-8 w-8 text-purple-600" />
          </div>
        </motion.div>
      </div>

      {/* Lista Strumenti */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Strumenti e Servizi
            </h3>
            <HelpTooltip content="Gestisci i costi mensili fissi per attrezzature, servizi e utenze aziendali" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Strumento/Servizio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rata Mensile
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Consumo kW
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stato
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Azioni
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leasingStrumentali.map((strumento, index) => (
                <motion.tr
                  key={strumento.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`hover:bg-gray-50 transition-colors ${!strumento.attivo ? 'opacity-60' : ''}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Wrench className={`h-5 w-5 mr-3 ${strumento.attivo ? 'text-blue-600' : 'text-gray-400'}`} />
                      <div className="text-sm font-medium text-gray-900">
                        {strumento.nome_strumento}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === strumento.id ? (
                      <input
                        type="number"
                        step="0.01"
                        value={editValues.rata_mensile}
                        onChange={(e) => setEditValues(prev => ({ ...prev, rata_mensile: parseFloat(e.target.value) || 0 }))}
                        className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="text-sm text-gray-900">
                        €{strumento.rata_mensile.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === strumento.id ? (
                      <input
                        type="number"
                        step="0.1"
                        value={editValues.consumo_kw || ''}
                        onChange={(e) => setEditValues(prev => ({ ...prev, consumo_kw: parseFloat(e.target.value) || 0 }))}
                        className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0"
                      />
                    ) : (
                      <div className="text-sm text-gray-900">
                        {strumento.consumo_kw ? `${strumento.consumo_kw} kW` : '-'}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleAttivo(strumento.id, strumento.attivo)}
                      className="flex items-center gap-2 text-sm"
                    >
                      {strumento.attivo ? (
                        <>
                          <ToggleRight className="h-5 w-5 text-green-600" />
                          <span className="text-green-600 font-medium">Attivo</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="h-5 w-5 text-gray-400" />
                          <span className="text-gray-400">Inattivo</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {editingId === strumento.id ? (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleSave(strumento.id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
                        >
                          Salva
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm transition-colors"
                        >
                          Annulla
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEdit(strumento)}
                        className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Modifica valori"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LeasingStrumentali;