import React, { useEffect, useState } from 'react';
import { Edit, UserCheck, DollarSign, ToggleLeft, ToggleRight, Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { Manovalanza as ManovalanzaType } from '../types/database';
import { usePermissions } from '../hooks/usePermissions';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';
import HelpTooltip from '../components/common/HelpTooltip';
import toast from 'react-hot-toast';

const Manovalanza: React.FC = () => {
  const [manovalanza, setManovalanza] = useState<ManovalanzaType[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);
  const [newDipendente, setNewDipendente] = useState({
    nome: '',
    importo_mensile: 0
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const permissions = usePermissions();
  const { userProfile } = useAuth();

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
      
      // Se non ci sono dati, inizializza con valori predefiniti
      if (!data || data.length === 0) {
        await initializeManovalanzaPredefinita();
        const { data: initialData } = await supabase
          .from('manovalanza')
          .select('*')
          .order('nome');
        
        setManovalanza(initialData || []);
      } else {
        setManovalanza(data);
      }
    } catch (error) {
      console.error('Errore nel caricamento della manovalanza:', error);
      toast.error('Errore nel caricamento dei dati');
    } finally {
      setLoading(false);
    }
  };

  const initializeManovalanzaPredefinita = async () => {
    try {
      const dipendentiPredefiniti = [
        { nome: 'Mario Rossi', importo_mensile: 2200 },
        { nome: 'Luigi Bianchi', importo_mensile: 1800 },
        { nome: 'Giuseppe Verdi', importo_mensile: 2000 },
        { nome: 'Anna Neri', importo_mensile: 2100 },
        { nome: 'Paolo Gialli', importo_mensile: 1900 }
      ];
      
      for (const dipendente of dipendentiPredefiniti) {
        const { error } = await supabase
          .from('manovalanza')
          .insert([{
            nome: dipendente.nome,
            importo_mensile: dipendente.importo_mensile,
            attivo: true
          }]);
        
        if (error) {
          console.error(`Errore nell'inserimento di ${dipendente.nome}:`, error);
        }
      }
      
      toast.success('Dipendenti predefiniti inizializzati');
    } catch (error) {
      console.error('Errore nell\'inizializzazione dei dipendenti:', error);
      toast.error('Errore nell\'inizializzazione dei dipendenti');
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

  const handleAddDipendente = async () => {
    if (!newDipendente.nome) {
      toast.error('Il nome del dipendente è obbligatorio');
      return;
    }

    try {
      const { error } = await supabase
        .from('manovalanza')
        .insert([{
          nome: newDipendente.nome,
          importo_mensile: newDipendente.importo_mensile,
          attivo: true
        }]);

      if (error) throw error;
      
      toast.success('Dipendente aggiunto con successo');
      setNewDipendente({
        nome: '',
        importo_mensile: 0
      });
      setShowAddForm(false);
      fetchManovalanza();
    } catch (error) {
      console.error('Errore nell\'aggiunta del dipendente:', error);
      toast.error('Errore nell\'aggiunta del dipendente');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo dipendente?')) return;

    try {
      const { error } = await supabase
        .from('manovalanza')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Dipendente eliminato con successo');
      fetchManovalanza();
    } catch (error) {
      console.error('Errore nell\'eliminazione del dipendente:', error);
      toast.error('Errore nell\'eliminazione');
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

  // Permetti ad Alessandro di modificare la manovalanza
  const canModify = userProfile?.ruolo === 'alessandro';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestione Manovalanza</h1>
          <p className="mt-2 text-gray-600">Gestisci i costi mensili del personale</p>
        </div>
        {canModify && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Aggiungi Dipendente
          </button>
        )}
      </div>

      {/* Form Aggiungi Dipendente */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-xl shadow-sm overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">
                Aggiungi Nuovo Dipendente
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Dipendente *
                  </label>
                  <input
                    type="text"
                    id="nome"
                    value={newDipendente.nome}
                    onChange={(e) => setNewDipendente(prev => ({ ...prev, nome: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nome e cognome"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="importo_mensile" className="block text-sm font-medium text-gray-700 mb-1">
                    Importo Mensile (€) *
                  </label>
                  <input
                    type="number"
                    id="importo_mensile"
                    value={newDipendente.importo_mensile}
                    onChange={(e) => setNewDipendente(prev => ({ ...prev, importo_mensile: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors mr-2"
                >
                  Annulla
                </button>
                <button
                  onClick={handleAddDipendente}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Aggiungi
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
            <HelpTooltip content="Gestisci i costi fissi mensili per ogni dipendente. Solo gli utenti con permessi amministratore possono modificare questi valori." />
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
                      <input
                        type="number"
                        step="0.01"
                        value={editValue}
                        onChange={(e) => setEditValue(parseFloat(e.target.value) || 0)}
                        className="w-32 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="text-sm font-medium text-gray-900">
                        €{persona.importo_mensile.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => canModify && toggleAttivo(persona.id, persona.attivo)}
                      className={`flex items-center gap-2 text-sm ${canModify ? 'cursor-pointer' : 'cursor-default'}`}
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
                    {canModify && (
                      editingId === persona.id ? (
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
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(persona)}
                            className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Modifica importo"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(persona.id)}
                            className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
                            title="Elimina dipendente"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )
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