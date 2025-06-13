import React, { useEffect, useState } from 'react';
import { Edit, UserCheck, DollarSign, ToggleLeft, ToggleRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { Manovalanza as ManovalanzaType } from '../types/database';
import { usePermissions } from '../hooks/usePermissions';
import LoadingSpinner from '../components/common/LoadingSpinner';
import HelpTooltip from '../components/common/HelpTooltip';
import toast from 'react-hot-toast';

const Manovalanza: React.FC = () => {
  const [manovalanza, setManovalanza] = useState<ManovalanzaType[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);
  const permissions = usePermissions();

  useEffect(() => {
    fetchManovalanza();
  }, []);

  const fetchManovalanza = async () => {
    try {
      const { data, error } = await supabase
        .from('manovalanza')
        .select('*')
        .order('nome');

      if (error) throw error;
      setManovalanza(data || []);
    } catch (error) {
      console.error('Errore nel caricamento della manovalanza:', error);
      toast.error('Errore nel caricamento dei dati');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (persona: ManovalanzaType) => {
    setEditingId(persona.id);
    setEditValue(persona.importo_mensile);
  };

  const handleSave = async (id: string) => {
    try {
      const { error } = await supabase
        .from('manovalanza')
        .update({ importo_mensile: editValue })
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Importo aggiornato con successo');
      setEditingId(null);
      fetchManovalanza();
    } catch (error) {
      console.error('Errore nell\'aggiornamento:', error);
      toast.error('Errore nell\'aggiornamento');
    }
  };

  const toggleAttivo = async (id: string, attivo: boolean) => {
    try {
      const { error } = await supabase
        .from('manovalanza')
        .update({ attivo: !attivo })
        .eq('id', id);

      if (error) throw error;
      
      toast.success(`Dipendente ${!attivo ? 'attivato' : 'disattivato'}`);
      fetchManovalanza();
    } catch (error) {
      console.error('Errore nell\'aggiornamento dello stato:', error);
      toast.error('Errore nell\'aggiornamento');
    }
  };

  const getTotaleMensile = () => {
    return manovalanza
      .filter(m => m.attivo)
      .reduce((sum, m) => sum + m.importo_mensile, 0);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!permissions.canModifyManovalanza) {
    return (
      <div className="text-center py-12">
        <UserCheck className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Accesso Limitato</h3>
        <p className="text-gray-500">Non hai i permessi per visualizzare questa sezione.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestione Manovalanza</h1>
          <p className="mt-2 text-gray-600">Gestisci i costi mensili del personale</p>
        </div>
      </div>

      {/* Riepilogo Totale */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600">Costo Totale Mensile</p>
            <p className="text-3xl font-bold text-blue-900">
              €{getTotaleMensile().toLocaleString('it-IT', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-sm text-blue-600 mt-1">
              {manovalanza.filter(m => m.attivo).length} dipendente/i attivo/i
            </p>
          </div>
          <div className="p-4 bg-blue-600 rounded-full">
            <DollarSign className="h-8 w-8 text-white" />
          </div>
        </div>
      </motion.div>

      {/* Lista Dipendenti */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Dipendenti
            </h3>
            <HelpTooltip content="Gestisci i costi fissi mensili per ogni dipendente. Solo Alessandro può modificare questi valori." />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dipendente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Importo Mensile
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
              {manovalanza.map((persona, index) => (
                <motion.tr
                  key={persona.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`hover:bg-gray-50 transition-colors ${!persona.attivo ? 'opacity-60' : ''}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mr-4">
                        <span className="text-white text-sm font-bold">
                          {persona.nome.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {persona.nome}
                        </div>
                        <div className="text-sm text-gray-500">
                          Dipendente
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === persona.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">€</span>
                        <input
                          type="number"
                          step="0.01"
                          value={editValue}
                          onChange={(e) => setEditValue(parseFloat(e.target.value) || 0)}
                          className="w-32 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    ) : (
                      <div className="text-sm font-medium text-gray-900">
                        €{persona.importo_mensile.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleAttivo(persona.id, persona.attivo)}
                      className="flex items-center gap-2 text-sm"
                    >
                      {persona.attivo ? (
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
                    {editingId === persona.id ? (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleSave(persona.id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                        >
                          Salva
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                        >
                          Annulla
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEdit(persona)}
                        className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Modifica importo"
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

      {/* Informazioni aggiuntive */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <UserCheck className="h-5 w-5 text-yellow-600" />
          <h3 className="font-medium text-yellow-800">Informazioni Importanti</h3>
        </div>
        <div className="text-sm text-yellow-700 space-y-1">
          <p>• I costi della manovalanza vengono distribuiti proporzionalmente sui lavori del mese</p>
          <p>• Solo gli utenti con permessi amministratore possono modificare questi valori</p>
          <p>• I dipendenti inattivi non vengono inclusi nei calcoli dei costi</p>
        </div>
      </div>
    </div>
  );
};

export default Manovalanza;