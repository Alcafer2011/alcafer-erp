import React, { useEffect, useState } from 'react';
import { Edit, Wrench, Zap, DollarSign, ToggleLeft, ToggleRight, Plus, Trash2, Music } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { LeasingStrumentale } from '../types/database';
import { usePermissions } from '../hooks/usePermissions';
import LoadingSpinner from '../components/common/LoadingSpinner';
import HelpTooltip from '../components/common/HelpTooltip';
import SpotifyPlayer from '../components/common/SpotifyPlayer';
import toast from 'react-hot-toast';

const LeasingStrumentali: React.FC = () => {
  const [leasingStrumentali, setLeasingStrumentali] = useState<LeasingStrumentale[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ rata_mensile: number; consumo_kw?: number }>({
    rata_mensile: 0,
    consumo_kw: 0
  });
  const [newStrumento, setNewStrumento] = useState({
    nome_strumento: '',
    rata_mensile: 0,
    consumo_kw: 0
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [showSpotify, setShowSpotify] = useState(false);
  const permissions = usePermissions();

  // Elenco di strumenti predefiniti
  const strumentiPredefiniti = [
    { nome: 'Taglio laser Trumpf', rata: 3500, consumo: 25 },
    { nome: 'Piegatrice Amada', rata: 1800, consumo: 12 },
    { nome: 'Saldatrice TIG Miller', rata: 450, consumo: 8 },
    { nome: 'Saldatrice MIG Fronius', rata: 380, consumo: 7.5 },
    { nome: 'Trapano a colonna', rata: 120, consumo: 2.2 },
    { nome: 'Smerigliatrice industriale', rata: 90, consumo: 3.5 },
    { nome: 'Seghetto a nastro', rata: 150, consumo: 2.8 },
    { nome: 'Tornio CNC', rata: 1200, consumo: 15 },
    { nome: 'Fresa CNC', rata: 1500, consumo: 18 },
    { nome: 'Plasma Hypertherm', rata: 850, consumo: 22 },
    { nome: 'Compressore Atlas Copco', rata: 320, consumo: 30 },
    { nome: 'Carroponte 5 ton', rata: 650, consumo: 8 },
    { nome: 'Muletto Linde', rata: 480, consumo: 0 },
    { nome: 'Software CAD/CAM', rata: 250, consumo: 0 },
    { nome: 'Aspiratore fumi', rata: 180, consumo: 5.5 }
  ];

  useEffect(() => {
    fetchLeasingStrumentali();
    
    // Mostra suggerimento per aggiungere alla home screen
    showAddToHomeScreenPrompt();
  }, []);

  const showAddToHomeScreenPrompt = () => {
    // Rileva il sistema operativo
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
      const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
      const isAndroid = /Android/i.test(navigator.userAgent);
      
      let message = '';
      
      if (isIOS) {
        message = 'Per aggiungere questa app alla tua home screen: tocca l\'icona di condivisione (📤) e poi "Aggiungi a Home"';
      } else if (isAndroid) {
        message = 'Per aggiungere questa app alla tua home screen: tocca i tre puntini (⋮) e poi "Aggiungi a schermata Home"';
      }
      
      if (message) {
        toast(message, {
          icon: '📱',
          duration: 6000,
        });
      }
    }
  };

  const fetchLeasingStrumentali = async () => {
    try {
      const { data, error } = await supabase
        .from('leasing_strumentali')
        .select('*')
        .order('nome_strumento');

      if (error) throw error;
      
      // Se non ci sono dati, inizializza automaticamente
      if (!data || data.length === 0) {
        await initializeStrumentiPredefiniti();
        const { data: initialData } = await supabase
          .from('leasing_strumentali')
          .select('*')
          .order('nome_strumento');
        
        setLeasingStrumentali(initialData || []);
      } else {
        setLeasingStrumentali(data);
      }
    } catch (error) {
      console.error('Errore nel caricamento del leasing strumentali:', error);
      toast.error('Errore nel caricamento dei dati');
    } finally {
      setLoading(false);
    }
  };

  const initializeStrumentiPredefiniti = async () => {
    try {
      const strumentiToInsert = strumentiPredefiniti.map(s => ({
        nome_strumento: s.nome,
        rata_mensile: s.rata,
        consumo_kw: s.consumo,
        attivo: true
      }));
      
      // Inserisci gli strumenti uno alla volta per gestire meglio gli errori
      for (const strumento of strumentiToInsert) {
        const { error } = await supabase
          .from('leasing_strumentali')
          .insert([strumento]);
        
        if (error) {
          console.error(`Errore nell'inserimento di ${strumento.nome_strumento}:`, error);
          // Continua con gli altri strumenti anche se uno fallisce
        }
      }
      
      toast.success('Strumenti predefiniti inizializzati');
    } catch (error) {
      console.error('Errore nell\'inizializzazione degli strumenti:', error);
      toast.error('Errore nell\'inizializzazione degli strumenti');
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

  const handleAddStrumento = async () => {
    if (!newStrumento.nome_strumento) {
      toast.error('Il nome dello strumento è obbligatorio');
      return;
    }

    try {
      const { error } = await supabase
        .from('leasing_strumentali')
        .insert([{
          nome_strumento: newStrumento.nome_strumento,
          rata_mensile: newStrumento.rata_mensile,
          consumo_kw: newStrumento.consumo_kw || null,
          attivo: true
        }]);

      if (error) throw error;
      
      toast.success('Strumento aggiunto con successo');
      setNewStrumento({
        nome_strumento: '',
        rata_mensile: 0,
        consumo_kw: 0
      });
      setShowAddForm(false);
      fetchLeasingStrumentali();
    } catch (error) {
      console.error('Errore nell\'aggiunta dello strumento:', error);
      toast.error('Errore nell\'aggiunta dello strumento');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo strumento?')) return;

    try {
      const { error } = await supabase
        .from('leasing_strumentali')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Strumento eliminato con successo');
      fetchLeasingStrumentali();
    } catch (error) {
      console.error('Errore nell\'eliminazione dello strumento:', error);
      toast.error('Errore nell\'eliminazione');
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leasing Strumentali</h1>
          <p className="mt-2 text-gray-600">Gestisci i costi mensili di attrezzature e servizi</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowSpotify(!showSpotify)}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <Music className="h-4 w-4" />
            Spotify
          </button>
          {leasingStrumentali.length === 0 && (
            <button
              onClick={initializeStrumentiPredefiniti}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <Wrench className="h-4 w-4" />
              Inizializza Strumenti
            </button>
          )}
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Aggiungi Strumento
          </button>
        </div>
      </div>

      {/* Spotify Player */}
      <AnimatePresence>
        {showSpotify && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <SpotifyPlayer />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form Aggiungi Strumento */}
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
                Aggiungi Nuovo Strumento
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="nome_strumento" className="block text-sm font-medium text-gray-700 mb-1">
                    Nome Strumento *
                  </label>
                  <input
                    type="text"
                    id="nome_strumento"
                    value={newStrumento.nome_strumento}
                    onChange={(e) => setNewStrumento(prev => ({ ...prev, nome_strumento: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Es. Taglio laser Trumpf"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="rata_mensile" className="block text-sm font-medium text-gray-700 mb-1">
                    Rata Mensile (€) *
                  </label>
                  <input
                    type="number"
                    id="rata_mensile"
                    value={newStrumento.rata_mensile}
                    onChange={(e) => setNewStrumento(prev => ({ ...prev, rata_mensile: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="consumo_kw" className="block text-sm font-medium text-gray-700 mb-1">
                    Consumo (kW)
                  </label>
                  <input
                    type="number"
                    id="consumo_kw"
                    value={newStrumento.consumo_kw}
                    onChange={(e) => setNewStrumento(prev => ({ ...prev, consumo_kw: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.0"
                    min="0"
                    step="0.1"
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
                  onClick={handleAddStrumento}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Aggiungi
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messaggio quando non ci sono strumenti */}
      {leasingStrumentali.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <Wrench className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nessuno strumento configurato</h3>
          <p className="text-gray-500 mb-4">
            Inizia aggiungendo i tuoi strumenti e servizi in leasing, oppure usa il pulsante "Inizializza Strumenti" per caricare una lista predefinita.
          </p>
        </div>
      )}

      {/* Riepilogo Totali */}
      {leasingStrumentali.length > 0 && (
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
      )}

      {/* Lista Strumenti */}
      {leasingStrumentali.length > 0 && (
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
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(strumento)}
                            className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Modifica valori"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(strumento.id)}
                            className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
                            title="Elimina strumento"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeasingStrumentali;