import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Package, TrendingUp, RefreshCw, Music, Calculator } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { MaterialeMetallico, PrezzoMateriale } from '../types/database';
import { usePermissions } from '../hooks/usePermissions';
import LoadingSpinner from '../components/common/LoadingSpinner';
import HelpTooltip from '../components/common/HelpTooltip';
import SpotifyPlayer from '../components/common/SpotifyPlayer';
import MaterialCalculator from '../components/common/MaterialCalculator';
import toast from 'react-hot-toast';

const MaterialiMetallici: React.FC = () => {
  const [materiali, setMateriali] = useState<MaterialeMetallico[]>([]);
  const [prezziMateriali, setPrezziMateriali] = useState<PrezzoMateriale[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingPrices, setUpdatingPrices] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [showSpotify, setShowSpotify] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMateriale, setNewMateriale] = useState({
    tipo_materiale: '',
    kg_totali: 0,
    prezzo_kg: 0,
    numero_ddt: '',
    data_trasporto: new Date().toISOString().split('T')[0],
    fornitore: ''
  });
  const permissions = usePermissions();

  // Prezzi realistici per Lombardia, Piemonte, Emilia Romagna (2024)
  const prezziRegionali = [
    { tipo: 'Ferro S235 grezzo', prezzo: 0.95, regione: 'Lombardia' },
    { tipo: 'Acciaio inox AISI 304', prezzo: 3.20, regione: 'Lombardia' },
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

  // Dati per il calcolo del peso
  const pesoMateriali = {
    'Ferro S235 grezzo': { densita: 7.85, lunghezzaBarra: 6 }, // kg/dm³, metri
    'Acciaio inox AISI 304': { densita: 8.0, lunghezzaBarra: 6 },
    'Alluminio 6060': { densita: 2.7, lunghezzaBarra: 6 },
    'Acciaio al carbonio': { densita: 7.85, lunghezzaBarra: 6 },
    'Ferro zincato': { densita: 7.85, lunghezzaBarra: 6 },
    'Acciaio corten': { densita: 7.85, lunghezzaBarra: 6 },
    'Alluminio anodizzato': { densita: 2.7, lunghezzaBarra: 6 },
    'Acciaio inox AISI 316': { densita: 8.0, lunghezzaBarra: 6 }
  };

  useEffect(() => {
    fetchData();
    
    // Inizializza l'elemento audio
    const audio = new Audio('https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0c6ff1bab.mp3?filename=relaxing-mountains-rivers-streams-running-water-18178.mp3');
    audio.loop = true;
    setAudioElement(audio);
    
    // Avvia automaticamente la musica
    audio.play().catch(e => {
      console.error('Errore nella riproduzione audio:', e);
      toast.error('Impossibile riprodurre la musica automaticamente. Clicca sul pulsante per attivarla.');
    });
    setIsPlaying(true);
    
    // Mostra suggerimento per aggiungere alla home screen
    showAddToHomeScreenPrompt();
    
    return () => {
      // Pulisci l'audio quando il componente viene smontato
      if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
      }
    };
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

  const toggleMusic = () => {
    if (audioElement) {
      if (isPlaying) {
        audioElement.pause();
      } else {
        audioElement.play().catch(e => {
          console.error('Errore nella riproduzione audio:', e);
          toast.error('Impossibile riprodurre la musica. Prova a interagire prima con la pagina.');
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const fetchData = async () => {
    try {
      const [materialiResult, prezziResult] = await Promise.all([
        supabase.from('materiali_metallici').select('*').order('created_at', { ascending: false }),
        supabase.from('prezzi_materiali').select('*').order('tipo_materiale')
      ]);

      if (materialiResult.error) {
        console.error('Errore nel caricamento materiali:', materialiResult.error);
        if (materialiResult.error.code === '42501') {
          toast.error('Non hai i permessi per visualizzare i materiali metallici');
          return;
        }
        throw materialiResult.error;
      }

      if (prezziResult.error) {
        console.error('Errore nel caricamento prezzi:', prezziResult.error);
        if (prezziResult.error.code === '42501') {
          toast.error('Non hai i permessi per visualizzare i prezzi dei materiali');
          return;
        }
        throw prezziResult.error;
      }

      // Se non ci sono prezzi e l'utente ha i permessi, prova a inizializzare
      if ((!prezziResult.data || prezziResult.data.length === 0)) {
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

      if (error) {
        console.error('Errore nell\'inserimento prezzi:', error);
        if (error.code === '42501') {
          toast.error('Non hai i permessi per inserire i prezzi dei materiali');
          return;
        }
        throw error;
      }
      
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

      if (error) {
        console.error('Errore nell\'aggiornamento prezzo:', error);
        if (error.code === '42501') {
          toast.error('Non hai i permessi per aggiornare questo prezzo');
          return;
        }
        throw error;
      }
      
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
        const { error } = await supabase
          .from('prezzi_materiali')
          .update({
            prezzo_kg: update.prezzo_kg,
            data_aggiornamento: update.data_aggiornamento,
            fonte: update.fonte
          })
          .eq('id', update.id);

        if (error) {
          console.error('Errore nell\'aggiornamento prezzo:', error);
          if (error.code === '42501') {
            toast.error('Non hai i permessi per aggiornare i prezzi');
            return;
          }
          throw error;
        }
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

  const handleAddMateriale = async () => {
    if (!newMateriale.tipo_materiale) {
      toast.error('Il tipo di materiale è obbligatorio');
      return;
    }

    if (!newMateriale.numero_ddt) {
      toast.error('Il numero DDT è obbligatorio');
      return;
    }

    try {
      // Trova il prezzo del materiale selezionato
      const prezzoMateriale = prezziMateriali.find(p => p.tipo_materiale === newMateriale.tipo_materiale);
      
      if (!prezzoMateriale) {
        toast.error('Prezzo del materiale non trovato');
        return;
      }
      
      const importoTotale = newMateriale.kg_totali * prezzoMateriale.prezzo_kg;
      
      const { error } = await supabase
        .from('materiali_metallici')
        .insert([{
          tipo_materiale: newMateriale.tipo_materiale,
          kg_totali: newMateriale.kg_totali,
          prezzo_kg: prezzoMateriale.prezzo_kg,
          importo_totale: importoTotale,
          numero_ddt: newMateriale.numero_ddt,
          data_trasporto: newMateriale.data_trasporto,
          fornitore: newMateriale.fornitore || null
        }]);

      if (error) throw error;
      
      toast.success('Materiale aggiunto con successo');
      setNewMateriale({
        tipo_materiale: '',
        kg_totali: 0,
        prezzo_kg: 0,
        numero_ddt: '',
        data_trasporto: new Date().toISOString().split('T')[0],
        fornitore: ''
      });
      setShowAddForm(false);
      fetchData();
    } catch (error) {
      console.error('Errore nell\'aggiunta del materiale:', error);
      toast.error('Errore nell\'aggiunta del materiale');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo materiale?')) return;

    try {
      const { error } = await supabase
        .from('materiali_metallici')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Materiale eliminato con successo');
      fetchData();
    } catch (error) {
      console.error('Errore nell\'eliminazione del materiale:', error);
      toast.error('Errore nell\'eliminazione');
    }
  };

  const calculateWeight = (tipo: string, diametro: number, lunghezza: number, quantita: number) => {
    const materiale = pesoMateriali[tipo as keyof typeof pesoMateriali];
    
    if (!materiale) return 0;
    
    // Formula: volume (dm³) * densità (kg/dm³)
    // Volume cilindro: π * r² * h
    const raggio = diametro / 20; // da mm a dm e diviso 2 per avere il raggio
    const lunghezzaDm = lunghezza / 10; // da cm a dm
    const volume = Math.PI * raggio * raggio * lunghezzaDm;
    const peso = volume * materiale.densita * quantita;
    
    return peso;
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
          <h1 className="text-3xl font-bold text-gray-900">Materiali Metallici</h1>
          <p className="mt-2 text-gray-600">Gestisci i costi e i prezzi dei materiali metallici</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={toggleMusic}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <Music className="h-4 w-4" />
            {isPlaying ? 'Ferma Musica' : 'Musica Rilassante'}
          </button>
          <button
            onClick={() => setShowSpotify(!showSpotify)}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <Music className="h-4 w-4" />
            Spotify
          </button>
          <button
            onClick={() => setShowCalculator(!showCalculator)}
            className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <Calculator className="h-4 w-4" />
            Calcolatore
          </button>
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
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Aggiungi Materiale
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

      {/* Calcolatore Materiali */}
      <AnimatePresence>
        {showCalculator && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <MaterialCalculator 
              materiali={prezziMateriali} 
              pesoMateriali={pesoMateriali}
              onAddMaterial={(material) => {
                setNewMateriale({
                  ...newMateriale,
                  tipo_materiale: material.tipo,
                  kg_totali: material.peso
                });
                setShowAddForm(true);
                toast.success('Materiale calcolato. Completa i dettagli per aggiungerlo.');
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form Aggiungi Materiale */}
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
                Aggiungi Nuovo Materiale
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label htmlFor="tipo_materiale" className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo Materiale *
                  </label>
                  <select
                    id="tipo_materiale"
                    value={newMateriale.tipo_materiale}
                    onChange={(e) => {
                      const selectedMaterial = e.target.value;
                      const prezzoMateriale = prezziMateriali.find(p => p.tipo_materiale === selectedMaterial);
                      setNewMateriale(prev => ({ 
                        ...prev, 
                        tipo_materiale: selectedMaterial,
                        prezzo_kg: prezzoMateriale?.prezzo_kg || 0
                      }));
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Seleziona materiale</option>
                    {prezziMateriali.map(prezzo => (
                      <option key={prezzo.id} value={prezzo.tipo_materiale}>
                        {prezzo.tipo_materiale} - €{prezzo.prezzo_kg.toFixed(3)}/kg
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="kg_totali" className="block text-sm font-medium text-gray-700 mb-1">
                    Peso Totale (kg) *
                  </label>
                  <input
                    type="number"
                    id="kg_totali"
                    value={newMateriale.kg_totali}
                    onChange={(e) => setNewMateriale(prev => ({ ...prev, kg_totali: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.000"
                    min="0"
                    step="0.001"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="fornitore" className="block text-sm font-medium text-gray-700 mb-1">
                    Fornitore
                  </label>
                  <input
                    type="text"
                    id="fornitore"
                    value={newMateriale.fornitore}
                    onChange={(e) => setNewMateriale(prev => ({ ...prev, fornitore: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nome fornitore"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="numero_ddt" className="block text-sm font-medium text-gray-700 mb-1">
                    Numero DDT *
                  </label>
                  <input
                    type="text"
                    id="numero_ddt"
                    value={newMateriale.numero_ddt}
                    onChange={(e) => setNewMateriale(prev => ({ ...prev, numero_ddt: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Numero documento di trasporto"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="data_trasporto" className="block text-sm font-medium text-gray-700 mb-1">
                    Data Trasporto *
                  </label>
                  <input
                    type="date"
                    id="data_trasporto"
                    value={newMateriale.data_trasporto}
                    onChange={(e) => setNewMateriale(prev => ({ ...prev, data_trasporto: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              
              {/* Anteprima importo */}
              {newMateriale.tipo_materiale && newMateriale.kg_totali > 0 && (
                <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">Anteprima Importo</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-blue-600">Prezzo al kg:</p>
                      <p className="text-sm font-medium">
                        €{newMateriale.prezzo_kg.toFixed(3)}/kg
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-600">Importo totale:</p>
                      <p className="text-sm font-medium">
                        €{(newMateriale.kg_totali * newMateriale.prezzo_kg).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors mr-2"
                >
                  Annulla
                </button>
                <button
                  onClick={handleAddMateriale}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Aggiungi
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
            <button 
              onClick={() => setShowAddForm(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
            >
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
            <button 
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
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
                        {materiale.kg_totali.toFixed(3)} kg
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
                            onClick={() => handleDelete(materiale.id)}
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