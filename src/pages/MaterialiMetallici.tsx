import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Package, TrendingUp, RefreshCw, Map, Info } from 'lucide-react';
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
  const [prezziRegionali, setPrezziRegionali] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingPrices, setUpdatingPrices] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState('Lombardia');
  const [newMateriale, setNewMateriale] = useState({
    tipo_materiale: '',
    kg_totali: 0,
    prezzo_kg: 0,
    numero_ddt: '',
    data_trasporto: new Date().toISOString().split('T')[0],
    fornitore: ''
  });
  const permissions = usePermissions();

  // Regioni italiane con prezzi
  const regioni = ['Lombardia', 'Piemonte', 'Emilia Romagna', 'Veneto', 'Toscana'];

  // Prezzi realistici per regione (2024)
  const prezziRegioniData = {
    'Lombardia': [
      { tipo: 'Ferro S235 grezzo', prezzo: 0.95 },
      { tipo: 'Ferro S275 grezzo', prezzo: 1.05 },
      { tipo: 'Ferro S355 grezzo', prezzo: 1.15 },
      { tipo: 'Acciaio inox AISI 304', prezzo: 3.20 },
      { tipo: 'Acciaio inox AISI 316', prezzo: 4.20 },
      { tipo: 'Alluminio 6060', prezzo: 2.80 },
      { tipo: 'Alluminio anodizzato', prezzo: 3.50 },
      { tipo: 'Acciaio al carbonio', prezzo: 0.85 },
      { tipo: 'Ferro zincato', prezzo: 1.15 },
      { tipo: 'Acciaio corten', prezzo: 1.45 },
      { tipo: 'Lamiera decapata', prezzo: 1.10 },
      { tipo: 'Lamiera striata', prezzo: 1.25 },
      { tipo: 'Lamiera nera', prezzo: 0.90 }
    ],
    'Piemonte': [
      { tipo: 'Ferro S235 grezzo', prezzo: 0.97 },
      { tipo: 'Ferro S275 grezzo', prezzo: 1.07 },
      { tipo: 'Ferro S355 grezzo', prezzo: 1.17 },
      { tipo: 'Acciaio inox AISI 304', prezzo: 3.25 },
      { tipo: 'Acciaio inox AISI 316', prezzo: 4.25 },
      { tipo: 'Alluminio 6060', prezzo: 2.85 },
      { tipo: 'Alluminio anodizzato', prezzo: 3.55 },
      { tipo: 'Acciaio al carbonio', prezzo: 0.87 },
      { tipo: 'Ferro zincato', prezzo: 1.17 },
      { tipo: 'Acciaio corten', prezzo: 1.47 },
      { tipo: 'Lamiera decapata', prezzo: 1.12 },
      { tipo: 'Lamiera striata', prezzo: 1.27 },
      { tipo: 'Lamiera nera', prezzo: 0.92 }
    ],
    'Emilia Romagna': [
      { tipo: 'Ferro S235 grezzo', prezzo: 0.93 },
      { tipo: 'Ferro S275 grezzo', prezzo: 1.03 },
      { tipo: 'Ferro S355 grezzo', prezzo: 1.13 },
      { tipo: 'Acciaio inox AISI 304', prezzo: 3.18 },
      { tipo: 'Acciaio inox AISI 316', prezzo: 4.18 },
      { tipo: 'Alluminio 6060', prezzo: 2.78 },
      { tipo: 'Alluminio anodizzato', prezzo: 3.48 },
      { tipo: 'Acciaio al carbonio', prezzo: 0.83 },
      { tipo: 'Ferro zincato', prezzo: 1.13 },
      { tipo: 'Acciaio corten', prezzo: 1.43 },
      { tipo: 'Lamiera decapata', prezzo: 1.08 },
      { tipo: 'Lamiera striata', prezzo: 1.23 },
      { tipo: 'Lamiera nera', prezzo: 0.88 }
    ],
    'Veneto': [
      { tipo: 'Ferro S235 grezzo', prezzo: 0.94 },
      { tipo: 'Ferro S275 grezzo', prezzo: 1.04 },
      { tipo: 'Ferro S355 grezzo', prezzo: 1.14 },
      { tipo: 'Acciaio inox AISI 304', prezzo: 3.19 },
      { tipo: 'Acciaio inox AISI 316', prezzo: 4.19 },
      { tipo: 'Alluminio 6060', prezzo: 2.79 },
      { tipo: 'Alluminio anodizzato', prezzo: 3.49 },
      { tipo: 'Acciaio al carbonio', prezzo: 0.84 },
      { tipo: 'Ferro zincato', prezzo: 1.14 },
      { tipo: 'Acciaio corten', prezzo: 1.44 },
      { tipo: 'Lamiera decapata', prezzo: 1.09 },
      { tipo: 'Lamiera striata', prezzo: 1.24 },
      { tipo: 'Lamiera nera', prezzo: 0.89 }
    ],
    'Toscana': [
      { tipo: 'Ferro S235 grezzo', prezzo: 0.96 },
      { tipo: 'Ferro S275 grezzo', prezzo: 1.06 },
      { tipo: 'Ferro S355 grezzo', prezzo: 1.16 },
      { tipo: 'Acciaio inox AISI 304', prezzo: 3.22 },
      { tipo: 'Acciaio inox AISI 316', prezzo: 4.22 },
      { tipo: 'Alluminio 6060', prezzo: 2.82 },
      { tipo: 'Alluminio anodizzato', prezzo: 3.52 },
      { tipo: 'Acciaio al carbonio', prezzo: 0.86 },
      { tipo: 'Ferro zincato', prezzo: 1.16 },
      { tipo: 'Acciaio corten', prezzo: 1.46 },
      { tipo: 'Lamiera decapata', prezzo: 1.11 },
      { tipo: 'Lamiera striata', prezzo: 1.26 },
      { tipo: 'Lamiera nera', prezzo: 0.91 }
    ]
  };

  // Tipi di profilati commerciali
  const profilatiCommerciali = {
    'Ferro S235 grezzo': [
      'Tondo Ø 8mm', 'Tondo Ø 10mm', 'Tondo Ø 12mm', 'Tondo Ø 14mm', 'Tondo Ø 16mm', 'Tondo Ø 18mm', 'Tondo Ø 20mm',
      'Quadro 10x10mm', 'Quadro 12x12mm', 'Quadro 14x14mm', 'Quadro 16x16mm', 'Quadro 20x20mm',
      'Piatto 20x5mm', 'Piatto 25x5mm', 'Piatto 30x5mm', 'Piatto 40x5mm', 'Piatto 50x5mm',
      'Angolare 30x30x3mm', 'Angolare 40x40x4mm', 'Angolare 50x50x5mm',
      'Tubolare tondo Ø 21.3x2mm', 'Tubolare tondo Ø 26.9x2mm', 'Tubolare tondo Ø 33.7x2mm',
      'Tubolare quadro 20x20x2mm', 'Tubolare quadro 30x30x2mm', 'Tubolare quadro 40x40x2mm',
      'Tubolare rettangolare 30x20x2mm', 'Tubolare rettangolare 40x20x2mm', 'Tubolare rettangolare 50x30x2mm',
      'IPE 80', 'IPE 100', 'IPE 120', 'IPE 140', 'IPE 160', 'IPE 180', 'IPE 200',
      'UPN 80', 'UPN 100', 'UPN 120', 'UPN 140', 'UPN 160',
      'HEA 100', 'HEA 120', 'HEA 140', 'HEA 160',
      'HEB 100', 'HEB 120', 'HEB 140', 'HEB 160',
      'HEM 100', 'HEM 120', 'HEM 140'
    ],
    'Ferro S275 grezzo': [
      'Tondo Ø 10mm', 'Tondo Ø 12mm', 'Tondo Ø 16mm', 'Tondo Ø 20mm', 'Tondo Ø 25mm',
      'Quadro 12x12mm', 'Quadro 16x16mm', 'Quadro 20x20mm',
      'Piatto 30x5mm', 'Piatto 40x5mm', 'Piatto 50x5mm',
      'Angolare 40x40x4mm', 'Angolare 50x50x5mm', 'Angolare 60x60x6mm',
      'Tubolare tondo Ø 33.7x2.5mm', 'Tubolare tondo Ø 42.4x2.5mm',
      'Tubolare quadro 30x30x2.5mm', 'Tubolare quadro 40x40x2.5mm',
      'Tubolare rettangolare 40x20x2.5mm', 'Tubolare rettangolare 50x30x2.5mm',
      'IPE 120', 'IPE 140', 'IPE 160', 'IPE 180', 'IPE 200', 'IPE 220',
      'UPN 100', 'UPN 120', 'UPN 140', 'UPN 160', 'UPN 180',
      'HEA 120', 'HEA 140', 'HEA 160', 'HEA 180',
      'HEB 120', 'HEB 140', 'HEB 160', 'HEB 180',
      'HEM 120', 'HEM 140', 'HEM 160'
    ],
    'Ferro S355 grezzo': [
      'Tondo Ø 12mm', 'Tondo Ø 16mm', 'Tondo Ø 20mm', 'Tondo Ø 25mm', 'Tondo Ø 30mm',
      'Quadro 16x16mm', 'Quadro 20x20mm', 'Quadro 25x25mm',
      'Piatto 40x8mm', 'Piatto 50x8mm', 'Piatto 60x8mm',
      'Angolare 50x50x5mm', 'Angolare 60x60x6mm', 'Angolare 70x70x7mm',
      'Tubolare tondo Ø 42.4x3mm', 'Tubolare tondo Ø 48.3x3mm',
      'Tubolare quadro 40x40x3mm', 'Tubolare quadro 50x50x3mm',
      'Tubolare rettangolare 50x30x3mm', 'Tubolare rettangolare 60x40x3mm',
      'IPE 160', 'IPE 180', 'IPE 200', 'IPE 220', 'IPE 240',
      'UPN 140', 'UPN 160', 'UPN 180', 'UPN 200',
      'HEA 160', 'HEA 180', 'HEA 200', 'HEA 220',
      'HEB 160', 'HEB 180', 'HEB 200', 'HEB 220',
      'HEM 160', 'HEM 180', 'HEM 200'
    ],
    'Acciaio inox AISI 304': [
      'Tondo Ø 8mm', 'Tondo Ø 10mm', 'Tondo Ø 12mm', 'Tondo Ø 16mm',
      'Quadro 10x10mm', 'Quadro 12x12mm', 'Quadro 16x16mm',
      'Piatto 20x5mm', 'Piatto 30x5mm', 'Piatto 40x5mm',
      'Angolare 30x30x3mm', 'Angolare 40x40x4mm',
      'Tubolare tondo Ø 21.3x2mm', 'Tubolare tondo Ø 26.9x2mm',
      'Tubolare quadro 20x20x2mm', 'Tubolare quadro 30x30x2mm',
      'Tubolare rettangolare 30x20x2mm', 'Tubolare rettangolare 40x20x2mm'
    ],
    'Acciaio inox AISI 316': [
      'Tondo Ø 8mm', 'Tondo Ø 10mm', 'Tondo Ø 12mm', 'Tondo Ø 16mm',
      'Quadro 10x10mm', 'Quadro 12x12mm', 'Quadro 16x16mm',
      'Piatto 20x5mm', 'Piatto 30x5mm', 'Piatto 40x5mm',
      'Angolare 30x30x3mm', 'Angolare 40x40x4mm',
      'Tubolare tondo Ø 21.3x2mm', 'Tubolare tondo Ø 26.9x2mm',
      'Tubolare quadro 20x20x2mm', 'Tubolare quadro 30x30x2mm',
      'Tubolare rettangolare 30x20x2mm', 'Tubolare rettangolare 40x20x2mm'
    ],
    'Alluminio 6060': [
      'Tondo Ø 10mm', 'Tondo Ø 12mm', 'Tondo Ø 16mm', 'Tondo Ø 20mm',
      'Quadro 10x10mm', 'Quadro 15x15mm', 'Quadro 20x20mm',
      'Piatto 20x5mm', 'Piatto 30x5mm', 'Piatto 40x5mm',
      'Angolare 20x20x2mm', 'Angolare 30x30x3mm',
      'Tubolare tondo Ø 20x2mm', 'Tubolare tondo Ø 25x2mm',
      'Tubolare quadro 20x20x2mm', 'Tubolare quadro 30x30x2mm',
      'Tubolare rettangolare 30x20x2mm', 'Tubolare rettangolare 40x20x2mm'
    ],
    'Lamiera decapata': [
      'Spessore 0.8mm', 'Spessore 1mm', 'Spessore 1.2mm', 'Spessore 1.5mm', 
      'Spessore 2mm', 'Spessore 2.5mm', 'Spessore 3mm'
    ],
    'Lamiera striata': [
      'Spessore 3/5mm', 'Spessore 4/6mm', 'Spessore 5/7mm'
    ],
    'Lamiera nera': [
      'Spessore 1mm', 'Spessore 1.5mm', 'Spessore 2mm', 
      'Spessore 2.5mm', 'Spessore 3mm', 'Spessore 4mm'
    ]
  };

  // Dati per il calcolo del peso
  const pesoMateriali = {
    'Ferro S235 grezzo': { densita: 7.85, lunghezzaBarra: 6 }, // kg/dm³, metri
    'Ferro S275 grezzo': { densita: 7.85, lunghezzaBarra: 6 },
    'Ferro S355 grezzo': { densita: 7.85, lunghezzaBarra: 6 },
    'Acciaio inox AISI 304': { densita: 8.0, lunghezzaBarra: 6 },
    'Acciaio inox AISI 316': { densita: 8.0, lunghezzaBarra: 6 },
    'Alluminio 6060': { densita: 2.7, lunghezzaBarra: 6 },
    'Alluminio anodizzato': { densita: 2.7, lunghezzaBarra: 6 },
    'Acciaio al carbonio': { densita: 7.85, lunghezzaBarra: 6 },
    'Ferro zincato': { densita: 7.85, lunghezzaBarra: 6 },
    'Acciaio corten': { densita: 7.85, lunghezzaBarra: 6 },
    'Lamiera decapata': { densita: 7.85, lunghezzaBarra: 6 },
    'Lamiera striata': { densita: 7.85, lunghezzaBarra: 6 },
    'Lamiera nera': { densita: 7.85, lunghezzaBarra: 6 }
  };

  // Dati per travi IPE, UPN, HEA, HEB, HEM
  const pesoTravi = {
    // IPE (kg/m)
    'IPE 80': 6.0,
    'IPE 100': 8.1,
    'IPE 120': 10.4,
    'IPE 140': 12.9,
    'IPE 160': 15.8,
    'IPE 180': 18.8,
    'IPE 200': 22.4,
    'IPE 220': 26.2,
    'IPE 240': 30.7,
    'IPE 270': 36.1,
    'IPE 300': 42.2,
    
    // UPN (kg/m)
    'UPN 80': 8.64,
    'UPN 100': 10.6,
    'UPN 120': 13.4,
    'UPN 140': 16.0,
    'UPN 160': 18.8,
    'UPN 180': 22.0,
    'UPN 200': 25.3,
    'UPN 220': 29.4,
    'UPN 240': 33.2,
    
    // HEA (kg/m)
    'HEA 100': 16.7,
    'HEA 120': 19.9,
    'HEA 140': 24.7,
    'HEA 160': 30.4,
    'HEA 180': 35.5,
    'HEA 200': 42.3,
    'HEA 220': 50.5,
    
    // HEB (kg/m)
    'HEB 100': 20.4,
    'HEB 120': 26.7,
    'HEB 140': 33.7,
    'HEB 160': 42.6,
    'HEB 180': 51.2,
    'HEB 200': 61.3,
    'HEB 220': 71.5,
    
    // HEM (kg/m)
    'HEM 100': 41.8,
    'HEM 120': 52.1,
    'HEM 140': 63.2,
    'HEM 160': 76.2,
    'HEM 180': 88.9,
    'HEM 200': 103.0
  };

  useEffect(() => {
    fetchData();
    
    // Mostra suggerimento per aggiungere alla home screen
    showAddToHomeScreenPrompt();

    // Aggiorna i prezzi regionali in base alla regione selezionata
    updatePrezziRegionali(selectedRegion);
  }, []);

  useEffect(() => {
    // Aggiorna i prezzi regionali quando cambia la regione selezionata
    updatePrezziRegionali(selectedRegion);
  }, [selectedRegion]);

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

  const updatePrezziRegionali = (regione: string) => {
    if (prezziRegioniData[regione as keyof typeof prezziRegioniData]) {
      setPrezziRegionali(prezziRegioniData[regione as keyof typeof prezziRegioniData]);
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

      // Se non ci sono prezzi, mostra un messaggio informativo invece di tentare l'inizializzazione automatica
      if ((!prezziResult.data || prezziResult.data.length === 0)) {
        console.log('Nessun prezzo materiale trovato. L\'utente può aggiungere manualmente i prezzi.');
        toast('Nessun prezzo materiale configurato. Puoi aggiungere i prezzi manualmente.', {
          icon: 'ℹ️',
          duration: 4000,
        });
        setPrezziMateriali([]);
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
      // Prepara i dati per l'inserimento
      const prezziToInsert = [];
      
      // Aggiungi tutti i materiali dalla regione selezionata
      for (const prezzo of prezziRegionali) {
        prezziToInsert.push({
          tipo_materiale: prezzo.tipo,
          prezzo_kg: prezzo.prezzo,
          data_aggiornamento: new Date().toISOString().split('T')[0],
          fonte: `Mercato ${selectedRegion}`
        });
      }

      // Inserisci i prezzi
      const { error } = await supabase
        .from('prezzi_materiali')
        .insert(prezziToInsert);

      if (error) {
        console.error('Errore nell\'inserimento prezzi:', error);
        if (error.code === '42501') {
          toast.error('Non hai i permessi per inserire i prezzi dei materiali. Contatta l\'amministratore.');
          return;
        }
        throw error;
      }
      
      toast.success('Prezzi materiali inizializzati con successo');
      fetchData(); // Ricarica i dati dopo l'inserimento
    } catch (error) {
      console.error('Errore nell\'inizializzazione dei prezzi:', error);
      toast.error('Errore nell\'inizializzazione dei prezzi');
    }
  };

  const addNewPrezzoMateriale = async (tipoMateriale: string, prezzoKg: number) => {
    try {
      const { error } = await supabase
        .from('prezzi_materiali')
        .insert([{
          tipo_materiale: tipoMateriale,
          prezzo_kg: prezzoKg,
          data_aggiornamento: new Date().toISOString().split('T')[0],
          fonte: 'Inserimento manuale'
        }]);

      if (error) {
        console.error('Errore nell\'inserimento prezzo:', error);
        if (error.code === '42501') {
          toast.error('Non hai i permessi per aggiungere prezzi dei materiali');
          return false;
        }
        throw error;
      }
      
      toast.success('Prezzo materiale aggiunto con successo');
      fetchData();
      return true;
    } catch (error) {
      console.error('Errore nell\'aggiunta del prezzo:', error);
      toast.error('Errore nell\'aggiunta del prezzo');
      return false;
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
      let prezzoMateriale = prezziMateriali.find(p => p.tipo_materiale === newMateriale.tipo_materiale);
      
      // Se il prezzo non esiste, chiedi all'utente di inserirlo
      if (!prezzoMateriale) {
        const prezzoInput = prompt(`Inserisci il prezzo per kg per "${newMateriale.tipo_materiale}" (€/kg):`);
        if (!prezzoInput || isNaN(parseFloat(prezzoInput))) {
          toast.error('Prezzo non valido');
          return;
        }
        
        const prezzoKg = parseFloat(prezzoInput);
        const success = await addNewPrezzoMateriale(newMateriale.tipo_materiale, prezzoKg);
        if (!success) return;
        
        // Ricarica i prezzi e trova quello appena inserito
        await fetchData();
        prezzoMateriale = prezziMateriali.find(p => p.tipo_materiale === newMateriale.tipo_materiale);
        if (!prezzoMateriale) {
          toast.error('Errore nel recupero del prezzo appena inserito');
          return;
        }
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

      if (error) {
        if (error.code === '42501') {
          toast.error('Non hai i permessi per aggiungere materiali metallici');
          return;
        }
        throw error;
      }
      
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

      if (error) {
        if (error.code === '42501') {
          toast.error('Non hai i permessi per eliminare questo materiale');
          return;
        }
        throw error;
      }
      
      toast.success('Materiale eliminato con successo');
      fetchData();
    } catch (error) {
      console.error('Errore nell\'eliminazione del materiale:', error);
      toast.error('Errore nell\'eliminazione');
    }
  };

  const calculateWeight = (tipo: string, profilato: string, lunghezza: number = 100) => {
    // Verifica se è una trave IPE, UPN, HEA, HEB, HEM
    if (profilato.startsWith('IPE') || profilato.startsWith('UPN') || 
        profilato.startsWith('HEA') || profilato.startsWith('HEB') || profilato.startsWith('HEM')) {
      // Peso in kg/m, lunghezza in cm
      const pesoMetro = pesoTravi[profilato as keyof typeof pesoTravi] || 0;
      return (pesoMetro * lunghezza) / 100; // Converte da cm a m
    }
    
    // Per altri profilati, calcola in base alla forma e dimensioni
    const materiale = pesoMateriali[tipo.split(' - ')[0] as keyof typeof pesoMateriali];
    if (!materiale) return 0;
    
    if (profilato.startsWith('Tondo')) {
      // Estrai diametro (es. "Tondo Ø 10mm" -> 10)
      const diametro = parseFloat(profilato.match(/\d+(\.\d+)?/)?.[0] || '0');
      
      // Formula: volume (dm³) * densità (kg/dm³)
      // Volume cilindro: π * r² * h
      const raggio = diametro / 20; // da mm a dm e diviso 2 per avere il raggio
      const lunghezzaDm = lunghezza / 10; // da cm a dm
      const volume = Math.PI * raggio * raggio * lunghezzaDm;
      return volume * materiale.densita;
    }
    
    if (profilato.startsWith('Quadro')) {
      // Estrai lato (es. "Quadro 10x10mm" -> 10)
      const lato = parseFloat(profilato.match(/\d+(\.\d+)?/)?.[0] || '0');
      
      // Volume parallelepipedo: lato² * h
      const latoDm = lato / 10; // da mm a cm
      const lunghezzaDm = lunghezza / 10; // da cm a dm
      const volume = (latoDm/10) * (latoDm/10) * lunghezzaDm;
      return volume * materiale.densita;
    }
    
    if (profilato.startsWith('Piatto')) {
      // Estrai dimensioni (es. "Piatto 20x5mm" -> 20, 5)
      const match = profilato.match(/(\d+)x(\d+)/);
      if (!match) return 0;
      
      const larghezza = parseFloat(match[1]);
      const spessore = parseFloat(match[2]);
      
      // Volume parallelepipedo: larghezza * spessore * lunghezza
      const larghezzaDm = larghezza / 100; // da mm a dm
      const spessoreDm = spessore / 100; // da mm a dm
      const lunghezzaDm = lunghezza / 10; // da cm a dm
      const volume = larghezzaDm * spessoreDm * lunghezzaDm;
      return volume * materiale.densita;
    }
    
    if (profilato.startsWith('Angolare')) {
      // Estrai dimensioni (es. "Angolare 30x30x3mm" -> 30, 30, 3)
      const match = profilato.match(/(\d+)x(\d+)x(\d+)/);
      if (!match) return 0;
      
      const lato1 = parseFloat(match[1]);
      const lato2 = parseFloat(match[2]);
      const spessore = parseFloat(match[3]);
      
      // Calcolo approssimato: (lato1 + lato2 - spessore) * spessore * lunghezza
      const lato1Dm = lato1 / 100; // da mm a dm
      const lato2Dm = lato2 / 100; // da mm a dm
      const spessoreDm = spessore / 100; // da mm a dm
      const lunghezzaDm = lunghezza / 10; // da cm a dm
      const volume = (lato1Dm + lato2Dm - spessoreDm) * spessoreDm * lunghezzaDm;
      return volume * materiale.densita;
    }
    
    if (profilato.startsWith('Tubolare tondo')) {
      // Estrai dimensioni (es. "Tubolare tondo Ø 21.3x2mm" -> 21.3, 2)
      const match = profilato.match(/Ø\s*(\d+(\.\d+)?)x(\d+(\.\d+)?)/);
      if (!match) return 0;
      
      const diametro = parseFloat(match[1]);
      const spessore = parseFloat(match[3]);
      
      // Formula per tubo: π * (R² - r²) * h
      const raggioEsterno = diametro / 20; // da mm a dm e diviso 2
      const raggioInterno = (diametro - 2 * spessore) / 20; // da mm a dm e diviso 2
      const lunghezzaDm = lunghezza / 10; // da cm a dm
      const volume = Math.PI * (raggioEsterno * raggioEsterno - raggioInterno * raggioInterno) * lunghezzaDm;
      return volume * materiale.densita;
    }
    
    if (profilato.startsWith('Tubolare quadro') || profilato.startsWith('Tubolare rettangolare')) {
      // Estrai dimensioni (es. "Tubolare quadro 20x20x2mm" -> 20, 20, 2 o "Tubolare rettangolare 30x20x2mm" -> 30, 20, 2)
      const match = profilato.match(/(\d+)x(\d+)x(\d+)/);
      if (!match) return 0;
      
      const lato1 = parseFloat(match[1]);
      const lato2 = parseFloat(match[2]);
      const spessore = parseFloat(match[3]);
      
      // Volume = area sezione * lunghezza
      // Area sezione = area esterna - area interna
      const lato1Dm = lato1 / 100; // da mm a dm
      const lato2Dm = lato2 / 100; // da mm a dm
      const spessoreDm = spessore / 100; // da mm a dm
      const lunghezzaDm = lunghezza / 10; // da cm a dm
      
      const areaEsterna = lato1Dm * lato2Dm;
      const areaInterna = (lato1Dm - 2 * spessoreDm) * (lato2Dm - 2 * spessoreDm);
      const volume = (areaEsterna - areaInterna) * lunghezzaDm;
      return volume * materiale.densita;
    }
    
    if (profilato.startsWith('Spessore')) {
      // Lamiera: calcolo per 1m² di superficie
      const spessore = parseFloat(profilato.match(/\d+(\.\d+)?/)?.[0] || '0');
      const spessoreDm = spessore / 100; // da mm a dm
      const volume = 1 * 1 * spessoreDm; // 1m² = 1dm² * 1dm²
      return volume * materiale.densita;
    }
    
    return 0;
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
          {prezziMateriali.length > 0 && (
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
          )}
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Aggiungi Materiale
          </button>
        </div>
      </div>

      {/* Prezzi Regionali */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Prezzi Materiali per Regione
            </h3>
            <div className="flex items-center gap-2">
              <Map className="h-5 w-5 text-blue-600" />
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                {regioni.map(regione => (
                  <option key={regione} value={regione}>{regione}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {prezziRegionali.map((prezzo, index) => (
              <motion.div
                key={`${prezzo.tipo}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900 text-sm">{prezzo.tipo}</h4>
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Prezzo:</span>
                  <span className="text-sm font-medium text-blue-700">
                    €{prezzo.prezzo.toFixed(3)}/kg
                  </span>
                </div>
                
                <div className="mt-2 text-xs text-gray-500">
                  Regione: {selectedRegion}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo Materiale *
                  </label>
                  <select
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
                    {Object.keys(profilatiCommerciali).map(tipo => (
                      <optgroup key={tipo} label={tipo}>
                        {profilatiCommerciali[tipo as keyof typeof profilatiCommerciali].map(profilato => (
                          <option key={`${tipo}-${profilato}`} value={`${tipo} - ${profilato}`}>
                            {tipo} - {profilato}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                    <option value="custom">Altro materiale (inserisci manualmente)</option>
                  </select>
                  {newMateriale.tipo_materiale === 'custom' && (
                    <input
                      type="text"
                      placeholder="Nome del materiale"
                      className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onChange={(e) => setNewMateriale(prev => ({ ...prev, tipo_materiale: e.target.value }))}
                    />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Peso Totale (kg) *
                  </label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      value={newMateriale.kg_totali}
                      onChange={(e) => setNewMateriale(prev => ({ ...prev, kg_totali: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.000"
                      min="0"
                      step="0.001"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fornitore
                  </label>
                  <input
                    type="text"
                    value={newMateriale.fornitore}
                    onChange={(e) => setNewMateriale(prev => ({ ...prev, fornitore: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nome fornitore"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Numero DDT *
                  </label>
                  <input
                    type="text"
                    value={newMateriale.numero_ddt}
                    onChange={(e) => setNewMateriale(prev => ({ ...prev, numero_ddt: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Numero documento di trasporto"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data Trasporto *
                  </label>
                  <input
                    type="date"
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
              Prezzi Materiali
            </h3>
            <div className="flex items-center gap-2">
              <HelpTooltip content="Prezzi dei materiali metallici. Puoi modificarli manualmente se necessario." />
              {prezziMateriali.length === 0 && (
                <button
                  onClick={initializePrezziRegionali}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                >
                  Inizializza Prezzi
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="p-6">
          {prezziMateriali.length === 0 ? (
            <div className="text-center py-8">
              <TrendingUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun prezzo configurato</h3>
              <p className="text-gray-500 mb-6">Inizializza i prezzi dei materiali per iniziare</p>
              <button
                onClick={initializePrezziRegionali}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Inizializza Prezzi Regionali
              </button>
            </div>
          ) : (
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
          )}
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