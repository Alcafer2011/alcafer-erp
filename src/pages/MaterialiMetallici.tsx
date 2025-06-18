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

  // Database completo di profilati metallici
  const prontuarioMetallico = {
    // TONDO
    'Tondo': {
      'Ferro S235 grezzo': [
        { diametro: 5, peso: 0.154 },
        { diametro: 6, peso: 0.222 },
        { diametro: 8, peso: 0.395 },
        { diametro: 10, peso: 0.617 },
        { diametro: 12, peso: 0.888 },
        { diametro: 14, peso: 1.21 },
        { diametro: 16, peso: 1.58 },
        { diametro: 18, peso: 2.00 },
        { diametro: 20, peso: 2.47 },
        { diametro: 22, peso: 2.98 },
        { diametro: 24, peso: 3.55 },
        { diametro: 25, peso: 3.85 },
        { diametro: 26, peso: 4.17 },
        { diametro: 28, peso: 4.83 },
        { diametro: 30, peso: 5.55 },
        { diametro: 32, peso: 6.31 },
        { diametro: 35, peso: 7.55 },
        { diametro: 36, peso: 7.99 },
        { diametro: 38, peso: 8.90 },
        { diametro: 40, peso: 9.87 },
        { diametro: 42, peso: 10.9 },
        { diametro: 45, peso: 12.5 },
        { diametro: 48, peso: 14.2 },
        { diametro: 50, peso: 15.4 },
        { diametro: 55, peso: 18.7 },
        { diametro: 60, peso: 22.2 },
        { diametro: 65, peso: 26.0 },
        { diametro: 70, peso: 30.2 },
        { diametro: 80, peso: 39.5 },
        { diametro: 90, peso: 50.0 },
        { diametro: 100, peso: 61.7 },
        { diametro: 110, peso: 74.6 },
        { diametro: 120, peso: 88.8 }
      ],
      'Acciaio inox AISI 304': [
        { diametro: 5, peso: 0.154 * 1.02 },
        { diametro: 6, peso: 0.222 * 1.02 },
        { diametro: 8, peso: 0.395 * 1.02 },
        { diametro: 10, peso: 0.617 * 1.02 },
        { diametro: 12, peso: 0.888 * 1.02 },
        { diametro: 14, peso: 1.21 * 1.02 },
        { diametro: 16, peso: 1.58 * 1.02 },
        { diametro: 18, peso: 2.00 * 1.02 },
        { diametro: 20, peso: 2.47 * 1.02 },
        { diametro: 22, peso: 2.98 * 1.02 },
        { diametro: 25, peso: 3.85 * 1.02 },
        { diametro: 30, peso: 5.55 * 1.02 },
        { diametro: 35, peso: 7.55 * 1.02 },
        { diametro: 40, peso: 9.87 * 1.02 },
        { diametro: 45, peso: 12.5 * 1.02 },
        { diametro: 50, peso: 15.4 * 1.02 },
        { diametro: 60, peso: 22.2 * 1.02 }
      ],
      'Alluminio 6060': [
        { diametro: 6, peso: 0.222 * 0.34 },
        { diametro: 8, peso: 0.395 * 0.34 },
        { diametro: 10, peso: 0.617 * 0.34 },
        { diametro: 12, peso: 0.888 * 0.34 },
        { diametro: 14, peso: 1.21 * 0.34 },
        { diametro: 16, peso: 1.58 * 0.34 },
        { diametro: 18, peso: 2.00 * 0.34 },
        { diametro: 20, peso: 2.47 * 0.34 },
        { diametro: 25, peso: 3.85 * 0.34 },
        { diametro: 30, peso: 5.55 * 0.34 },
        { diametro: 35, peso: 7.55 * 0.34 },
        { diametro: 40, peso: 9.87 * 0.34 }
      ]
    },
    
    // QUADRO
    'Quadro': {
      'Ferro S235 grezzo': [
        { lato: 5, peso: 0.196 },
        { lato: 6, peso: 0.283 },
        { lato: 8, peso: 0.502 },
        { lato: 10, peso: 0.785 },
        { lato: 12, peso: 1.13 },
        { lato: 14, peso: 1.54 },
        { lato: 16, peso: 2.01 },
        { lato: 18, peso: 2.54 },
        { lato: 20, peso: 3.14 },
        { lato: 22, peso: 3.80 },
        { lato: 25, peso: 4.91 },
        { lato: 30, peso: 7.07 },
        { lato: 35, peso: 9.62 },
        { lato: 40, peso: 12.6 },
        { lato: 45, peso: 15.9 },
        { lato: 50, peso: 19.6 },
        { lato: 60, peso: 28.3 },
        { lato: 70, peso: 38.5 },
        { lato: 80, peso: 50.3 },
        { lato: 90, peso: 63.6 },
        { lato: 100, peso: 78.5 }
      ],
      'Acciaio inox AISI 304': [
        { lato: 5, peso: 0.196 * 1.02 },
        { lato: 6, peso: 0.283 * 1.02 },
        { lato: 8, peso: 0.502 * 1.02 },
        { lato: 10, peso: 0.785 * 1.02 },
        { lato: 12, peso: 1.13 * 1.02 },
        { lato: 14, peso: 1.54 * 1.02 },
        { lato: 16, peso: 2.01 * 1.02 },
        { lato: 18, peso: 2.54 * 1.02 },
        { lato: 20, peso: 3.14 * 1.02 },
        { lato: 25, peso: 4.91 * 1.02 },
        { lato: 30, peso: 7.07 * 1.02 },
        { lato: 40, peso: 12.6 * 1.02 },
        { lato: 50, peso: 19.6 * 1.02 }
      ],
      'Alluminio 6060': [
        { lato: 8, peso: 0.502 * 0.34 },
        { lato: 10, peso: 0.785 * 0.34 },
        { lato: 12, peso: 1.13 * 0.34 },
        { lato: 15, peso: 1.77 * 0.34 },
        { lato: 20, peso: 3.14 * 0.34 },
        { lato: 25, peso: 4.91 * 0.34 },
        { lato: 30, peso: 7.07 * 0.34 },
        { lato: 40, peso: 12.6 * 0.34 }
      ]
    },
    
    // PIATTO
    'Piatto': {
      'Ferro S235 grezzo': [
        { base: 20, altezza: 3, peso: 0.471 },
        { base: 20, altezza: 4, peso: 0.628 },
        { base: 20, altezza: 5, peso: 0.785 },
        { base: 25, altezza: 3, peso: 0.589 },
        { base: 25, altezza: 4, peso: 0.785 },
        { base: 25, altezza: 5, peso: 0.982 },
        { base: 25, altezza: 6, peso: 1.18 },
        { base: 25, altezza: 8, peso: 1.57 },
        { base: 30, altezza: 3, peso: 0.707 },
        { base: 30, altezza: 4, peso: 0.942 },
        { base: 30, altezza: 5, peso: 1.18 },
        { base: 30, altezza: 6, peso: 1.41 },
        { base: 30, altezza: 8, peso: 1.88 },
        { base: 30, altezza: 10, peso: 2.36 },
        { base: 35, altezza: 4, peso: 1.10 },
        { base: 35, altezza: 5, peso: 1.37 },
        { base: 35, altezza: 6, peso: 1.65 },
        { base: 35, altezza: 8, peso: 2.20 },
        { base: 35, altezza: 10, peso: 2.75 },
        { base: 40, altezza: 3, peso: 0.942 },
        { base: 40, altezza: 4, peso: 1.26 },
        { base: 40, altezza: 5, peso: 1.57 },
        { base: 40, altezza: 6, peso: 1.88 },
        { base: 40, altezza: 8, peso: 2.51 },
        { base: 40, altezza: 10, peso: 3.14 },
        { base: 40, altezza: 12, peso: 3.77 },
        { base: 40, altezza: 15, peso: 4.71 },
        { base: 40, altezza: 20, peso: 6.28 },
        { base: 45, altezza: 5, peso: 1.77 },
        { base: 45, altezza: 8, peso: 2.83 },
        { base: 45, altezza: 10, peso: 3.53 },
        { base: 50, altezza: 3, peso: 1.18 },
        { base: 50, altezza: 4, peso: 1.57 },
        { base: 50, altezza: 5, peso: 1.96 },
        { base: 50, altezza: 6, peso: 2.36 },
        { base: 50, altezza: 8, peso: 3.14 },
        { base: 50, altezza: 10, peso: 3.93 },
        { base: 50, altezza: 12, peso: 4.71 },
        { base: 50, altezza: 15, peso: 5.89 },
        { base: 50, altezza: 20, peso: 7.85 },
        { base: 50, altezza: 25, peso: 9.82 },
        { base: 60, altezza: 5, peso: 2.36 },
        { base: 60, altezza: 6, peso: 2.83 },
        { base: 60, altezza: 8, peso: 3.77 },
        { base: 60, altezza: 10, peso: 4.71 },
        { base: 60, altezza: 12, peso: 5.65 },
        { base: 60, altezza: 15, peso: 7.07 },
        { base: 60, altezza: 20, peso: 9.42 },
        { base: 60, altezza: 25, peso: 11.8 },
        { base: 60, altezza: 30, peso: 14.1 },
        { base: 70, altezza: 5, peso: 2.75 },
        { base: 70, altezza: 6, peso: 3.30 },
        { base: 70, altezza: 8, peso: 4.40 },
        { base: 70, altezza: 10, peso: 5.50 },
        { base: 70, altezza: 12, peso: 6.59 },
        { base: 70, altezza: 15, peso: 8.24 },
        { base: 70, altezza: 20, peso: 11.0 },
        { base: 80, altezza: 5, peso: 3.14 },
        { base: 80, altezza: 6, peso: 3.77 },
        { base: 80, altezza: 8, peso: 5.03 },
        { base: 80, altezza: 10, peso: 6.28 },
        { base: 80, altezza: 12, peso: 7.54 },
        { base: 80, altezza: 15, peso: 9.42 },
        { base: 80, altezza: 20, peso: 12.6 },
        { base: 100, altezza: 5, peso: 3.93 },
        { base: 100, altezza: 6, peso: 4.71 },
        { base: 100, altezza: 8, peso: 6.28 },
        { base: 100, altezza: 10, peso: 7.85 },
        { base: 100, altezza: 12, peso: 9.42 },
        { base: 100, altezza: 15, peso: 11.8 },
        { base: 100, altezza: 20, peso: 15.7 },
        { base: 100, altezza: 25, peso: 19.6 },
        { base: 100, altezza: 30, peso: 23.6 },
        { base: 120, altezza: 6, peso: 5.65 },
        { base: 120, altezza: 8, peso: 7.54 },
        { base: 120, altezza: 10, peso: 9.42 },
        { base: 120, altezza: 12, peso: 11.3 },
        { base: 120, altezza: 15, peso: 14.1 },
        { base: 120, altezza: 20, peso: 18.8 },
        { base: 150, altezza: 6, peso: 7.07 },
        { base: 150, altezza: 8, peso: 9.42 },
        { base: 150, altezza: 10, peso: 11.8 },
        { base: 150, altezza: 12, peso: 14.1 },
        { base: 150, altezza: 15, peso: 17.7 },
        { base: 150, altezza: 20, peso: 23.6 },
        { base: 200, altezza: 8, peso: 12.6 },
        { base: 200, altezza: 10, peso: 15.7 },
        { base: 200, altezza: 12, peso: 18.8 },
        { base: 200, altezza: 15, peso: 23.6 },
        { base: 200, altezza: 20, peso: 31.4 }
      ],
      'Acciaio inox AISI 304': [
        { base: 20, altezza: 3, peso: 0.471 * 1.02 },
        { base: 20, altezza: 4, peso: 0.628 * 1.02 },
        { base: 20, altezza: 5, peso: 0.785 * 1.02 },
        { base: 25, altezza: 3, peso: 0.589 * 1.02 },
        { base: 25, altezza: 4, peso: 0.785 * 1.02 },
        { base: 25, altezza: 5, peso: 0.982 * 1.02 },
        { base: 30, altezza: 3, peso: 0.707 * 1.02 },
        { base: 30, altezza: 4, peso: 0.942 * 1.02 },
        { base: 30, altezza: 5, peso: 1.18 * 1.02 },
        { base: 40, altezza: 3, peso: 0.942 * 1.02 },
        { base: 40, altezza: 4, peso: 1.26 * 1.02 },
        { base: 40, altezza: 5, peso: 1.57 * 1.02 },
        { base: 50, altezza: 3, peso: 1.18 * 1.02 },
        { base: 50, altezza: 4, peso: 1.57 * 1.02 },
        { base: 50, altezza: 5, peso: 1.96 * 1.02 }
      ],
      'Alluminio 6060': [
        { base: 20, altezza: 3, peso: 0.471 * 0.34 },
        { base: 20, altezza: 5, peso: 0.785 * 0.34 },
        { base: 25, altezza: 3, peso: 0.589 * 0.34 },
        { base: 25, altezza: 5, peso: 0.982 * 0.34 },
        { base: 30, altezza: 3, peso: 0.707 * 0.34 },
        { base: 30, altezza: 5, peso: 1.18 * 0.34 },
        { base: 40, altezza: 3, peso: 0.942 * 0.34 },
        { base: 40, altezza: 5, peso: 1.57 * 0.34 },
        { base: 50, altezza: 5, peso: 1.96 * 0.34 }
      ]
    },
    
    // ANGOLARE
    'Angolare': {
      'Ferro S235 grezzo': [
        { lato: 20, spessore: 3, peso: 0.888 },
        { lato: 25, spessore: 3, peso: 1.12 },
        { lato: 25, spessore: 4, peso: 1.47 },
        { lato: 30, spessore: 3, peso: 1.36 },
        { lato: 30, spessore: 4, peso: 1.78 },
        { lato: 35, spessore: 3, peso: 1.60 },
        { lato: 35, spessore: 4, peso: 2.09 },
        { lato: 35, spessore: 5, peso: 2.57 },
        { lato: 40, spessore: 3, peso: 1.84 },
        { lato: 40, spessore: 4, peso: 2.42 },
        { lato: 40, spessore: 5, peso: 2.97 },
        { lato: 45, spessore: 3, peso: 2.08 },
        { lato: 45, spessore: 4, peso: 2.74 },
        { lato: 45, spessore: 5, peso: 3.38 },
        { lato: 50, spessore: 3, peso: 2.33 },
        { lato: 50, spessore: 4, peso: 3.06 },
        { lato: 50, spessore: 5, peso: 3.77 },
        { lato: 50, spessore: 6, peso: 4.47 },
        { lato: 60, spessore: 4, peso: 3.70 },
        { lato: 60, spessore: 5, peso: 4.57 },
        { lato: 60, spessore: 6, peso: 5.42 },
        { lato: 60, spessore: 8, peso: 7.09 },
        { lato: 70, spessore: 5, peso: 5.37 },
        { lato: 70, spessore: 6, peso: 6.38 },
        { lato: 70, spessore: 7, peso: 7.38 },
        { lato: 70, spessore: 8, peso: 8.33 },
        { lato: 70, spessore: 9, peso: 9.27 },
        { lato: 70, spessore: 10, peso: 10.2 },
        { lato: 80, spessore: 6, peso: 7.34 },
        { lato: 80, spessore: 7, peso: 8.51 },
        { lato: 80, spessore: 8, peso: 9.63 },
        { lato: 80, spessore: 10, peso: 11.9 },
        { lato: 90, spessore: 6, peso: 8.30 },
        { lato: 90, spessore: 7, peso: 9.61 },
        { lato: 90, spessore: 8, peso: 10.9 },
        { lato: 90, spessore: 9, peso: 12.2 },
        { lato: 90, spessore: 10, peso: 13.4 },
        { lato: 100, spessore: 8, peso: 12.2 },
        { lato: 100, spessore: 10, peso: 15.0 },
        { lato: 100, spessore: 12, peso: 17.8 },
        { lato: 120, spessore: 8, peso: 14.7 },
        { lato: 120, spessore: 10, peso: 18.2 },
        { lato: 120, spessore: 12, peso: 21.6 },
        { lato: 150, spessore: 10, peso: 23.0 },
        { lato: 150, spessore: 12, peso: 27.3 },
        { lato: 150, spessore: 15, peso: 33.8 }
      ],
      'Acciaio inox AISI 304': [
        { lato: 20, spessore: 3, peso: 0.888 * 1.02 },
        { lato: 25, spessore: 3, peso: 1.12 * 1.02 },
        { lato: 30, spessore: 3, peso: 1.36 * 1.02 },
        { lato: 40, spessore: 4, peso: 2.42 * 1.02 },
        { lato: 50, spessore: 5, peso: 3.77 * 1.02 }
      ],
      'Alluminio 6060': [
        { lato: 20, spessore: 2, peso: 0.888 * 0.34 * 0.67 },
        { lato: 25, spessore: 2, peso: 1.12 * 0.34 * 0.67 },
        { lato: 30, spessore: 3, peso: 1.36 * 0.34 },
        { lato: 40, spessore: 3, peso: 1.84 * 0.34 }
      ]
    },
    
    // TUBOLARE TONDO
    'Tubolare Tondo': {
      'Ferro S235 grezzo': [
        { diametro: 21.3, spessore: 2, peso: 0.95 },
        { diametro: 21.3, spessore: 2.3, peso: 1.08 },
        { diametro: 21.3, spessore: 2.6, peso: 1.20 },
        { diametro: 21.3, spessore: 3.2, peso: 1.44 },
        { diametro: 26.9, spessore: 2, peso: 1.23 },
        { diametro: 26.9, spessore: 2.3, peso: 1.40 },
        { diametro: 26.9, spessore: 2.6, peso: 1.56 },
        { diametro: 26.9, spessore: 3.2, peso: 1.87 },
        { diametro: 33.7, spessore: 2, peso: 1.56 },
        { diametro: 33.7, spessore: 2.6, peso: 2.00 },
        { diametro: 33.7, spessore: 3.2, peso: 2.41 },
        { diametro: 33.7, spessore: 4, peso: 2.93 },
        { diametro: 42.4, spessore: 2, peso: 1.99 },
        { diametro: 42.4, spessore: 2.6, peso: 2.55 },
        { diametro: 42.4, spessore: 3.2, peso: 3.09 },
        { diametro: 42.4, spessore: 4, peso: 3.79 },
        { diametro: 48.3, spessore: 2, peso: 2.28 },
        { diametro: 48.3, spessore: 2.6, peso: 2.93 },
        { diametro: 48.3, spessore: 3.2, peso: 3.56 },
        { diametro: 48.3, spessore: 4, peso: 4.37 },
        { diametro: 60.3, spessore: 2, peso: 2.87 },
        { diametro: 60.3, spessore: 2.6, peso: 3.70 },
        { diametro: 60.3, spessore: 3.2, peso: 4.51 },
        { diametro: 60.3, spessore: 4, peso: 5.55 },
        { diametro: 76.1, spessore: 2, peso: 3.65 },
        { diametro: 76.1, spessore: 2.6, peso: 4.71 },
        { diametro: 76.1, spessore: 3.2, peso: 5.75 },
        { diametro: 76.1, spessore: 4, peso: 7.11 },
        { diametro: 88.9, spessore: 3.2, peso: 6.76 },
        { diametro: 88.9, spessore: 4, peso: 8.38 },
        { diametro: 88.9, spessore: 5, peso: 10.3 },
        { diametro: 101.6, spessore: 3.6, peso: 8.70 },
        { diametro: 101.6, spessore: 4, peso: 9.63 },
        { diametro: 101.6, spessore: 5, peso: 11.9 },
        { diametro: 114.3, spessore: 3.6, peso: 9.83 },
        { diametro: 114.3, spessore: 4, peso: 10.9 },
        { diametro: 114.3, spessore: 5, peso: 13.5 },
        { diametro: 139.7, spessore: 4, peso: 13.4 },
        { diametro: 139.7, spessore: 5, peso: 16.6 },
        { diametro: 139.7, spessore: 6.3, peso: 20.7 },
        { diametro: 168.3, spessore: 4, peso: 16.2 },
        { diametro: 168.3, spessore: 5, peso: 20.1 },
        { diametro: 168.3, spessore: 6.3, peso: 25.2 },
        { diametro: 193.7, spessore: 5, peso: 23.2 },
        { diametro: 193.7, spessore: 6.3, peso: 29.0 },
        { diametro: 219.1, spessore: 5, peso: 26.3 },
        { diametro: 219.1, spessore: 6.3, peso: 33.0 }
      ],
      'Acciaio inox AISI 304': [
        { diametro: 21.3, spessore: 2, peso: 0.95 * 1.02 },
        { diametro: 26.9, spessore: 2, peso: 1.23 * 1.02 },
        { diametro: 33.7, spessore: 2, peso: 1.56 * 1.02 },
        { diametro: 42.4, spessore: 2, peso: 1.99 * 1.02 },
        { diametro: 48.3, spessore: 2, peso: 2.28 * 1.02 },
        { diametro: 60.3, spessore: 2, peso: 2.87 * 1.02 }
      ]
    },
    
    // TUBOLARE QUADRO
    'Tubolare Quadro': {
      'Ferro S235 grezzo': [
        { lato: 15, spessore: 1.5, peso: 0.639 },
        { lato: 15, spessore: 2, peso: 0.824 },
        { lato: 20, spessore: 1.5, peso: 0.879 },
        { lato: 20, spessore: 2, peso: 1.14 },
        { lato: 25, spessore: 1.5, peso: 1.12 },
        { lato: 25, spessore: 2, peso: 1.46 },
        { lato: 30, spessore: 1.5, peso: 1.36 },
        { lato: 30, spessore: 2, peso: 1.78 },
        { lato: 30, spessore: 3, peso: 2.57 },
        { lato: 35, spessore: 1.5, peso: 1.60 },
        { lato: 35, spessore: 2, peso: 2.10 },
        { lato: 35, spessore: 3, peso: 3.03 },
        { lato: 40, spessore: 1.5, peso: 1.84 },
        { lato: 40, spessore: 2, peso: 2.41 },
        { lato: 40, spessore: 3, peso: 3.49 },
        { lato: 40, spessore: 4, peso: 4.50 },
        { lato: 50, spessore: 1.5, peso: 2.32 },
        { lato: 50, spessore: 2, peso: 3.05 },
        { lato: 50, spessore: 3, peso: 4.42 },
        { lato: 50, spessore: 4, peso: 5.72 },
        { lato: 50, spessore: 5, peso: 6.95 },
        { lato: 60, spessore: 2, peso: 3.69 },
        { lato: 60, spessore: 3, peso: 5.41 },
        { lato: 60, spessore: 4, peso: 7.05 },
        { lato: 60, spessore: 5, peso: 8.58 },
        { lato: 70, spessore: 2, peso: 4.33 },
        { lato: 70, spessore: 3, peso: 6.38 },
        { lato: 70, spessore: 4, peso: 8.33 },
        { lato: 70, spessore: 5, peso: 10.2 },
        { lato: 80, spessore: 2, peso: 4.97 },
        { lato: 80, spessore: 3, peso: 7.34 },
        { lato: 80, spessore: 4, peso: 9.63 },
        { lato: 80, spessore: 5, peso: 11.8 },
        { lato: 90, spessore: 3, peso: 8.31 },
        { lato: 90, spessore: 4, peso: 10.9 },
        { lato: 90, spessore: 5, peso: 13.4 },
        { lato: 100, spessore: 3, peso: 9.27 },
        { lato: 100, spessore: 4, peso: 12.2 },
        { lato: 100, spessore: 5, peso: 15.0 },
        { lato: 100, spessore: 6, peso: 17.8 },
        { lato: 120, spessore: 3, peso: 11.2 },
        { lato: 120, spessore: 4, peso: 14.8 },
        { lato: 120, spessore: 5, peso: 18.2 },
        { lato: 120, spessore: 6, peso: 21.6 },
        { lato: 140, spessore: 4, peso: 17.3 },
        { lato: 140, spessore: 5, peso: 21.4 },
        { lato: 140, spessore: 6, peso: 25.4 },
        { lato: 150, spessore: 4, peso: 18.6 },
        { lato: 150, spessore: 5, peso: 23.0 },
        { lato: 150, spessore: 6, peso: 27.3 },
        { lato: 150, spessore: 8, peso: 35.5 },
        { lato: 160, spessore: 4, peso: 19.9 },
        { lato: 160, spessore: 5, peso: 24.6 },
        { lato: 160, spessore: 6, peso: 29.2 },
        { lato: 160, spessore: 8, peso: 38.1 },
        { lato: 180, spessore: 5, peso: 27.8 },
        { lato: 180, spessore: 6, peso: 33.0 },
        { lato: 180, spessore: 8, peso: 43.2 },
        { lato: 200, spessore: 5, peso: 31.0 },
        { lato: 200, spessore: 6, peso: 36.8 },
        { lato: 200, spessore: 8, peso: 48.3 }
      ],
      'Acciaio inox AISI 304': [
        { lato: 20, spessore: 1.5, peso: 0.879 * 1.02 },
        { lato: 20, spessore: 2, peso: 1.14 * 1.02 },
        { lato: 25, spessore: 1.5, peso: 1.12 * 1.02 },
        { lato: 25, spessore: 2, peso: 1.46 * 1.02 },
        { lato: 30, spessore: 1.5, peso: 1.36 * 1.02 },
        { lato: 30, spessore: 2, peso: 1.78 * 1.02 },
        { lato: 40, spessore: 1.5, peso: 1.84 * 1.02 },
        { lato: 40, spessore: 2, peso: 2.41 * 1.02 },
        { lato: 50, spessore: 1.5, peso: 2.32 * 1.02 },
        { lato: 50, spessore: 2, peso: 3.05 * 1.02 }
      ],
      'Alluminio 6060': [
        { lato: 20, spessore: 1.5, peso: 0.879 * 0.34 },
        { lato: 20, spessore: 2, peso: 1.14 * 0.34 },
        { lato: 25, spessore: 1.5, peso: 1.12 * 0.34 },
        { lato: 25, spessore: 2, peso: 1.46 * 0.34 },
        { lato: 30, spessore: 1.5, peso: 1.36 * 0.34 },
        { lato: 30, spessore: 2, peso: 1.78 * 0.34 },
        { lato: 40, spessore: 2, peso: 2.41 * 0.34 },
        { lato: 50, spessore: 2, peso: 3.05 * 0.34 }
      ]
    },
    
    // TUBOLARE RETTANGOLARE
    'Tubolare Rettangolare': {
      'Ferro S235 grezzo': [
        { base: 30, altezza: 20, spessore: 1.5, peso: 1.12 },
        { base: 30, altezza: 20, spessore: 2, peso: 1.46 },
        { base: 40, altezza: 20, spessore: 1.5, peso: 1.36 },
        { base: 40, altezza: 20, spessore: 2, peso: 1.78 },
        { base: 40, altezza: 20, spessore: 3, peso: 2.57 },
        { base: 40, altezza: 30, spessore: 2, peso: 2.10 },
        { base: 40, altezza: 30, spessore: 3, peso: 3.03 },
        { base: 50, altezza: 20, spessore: 1.5, peso: 1.60 },
        { base: 50, altezza: 20, spessore: 2, peso: 2.10 },
        { base: 50, altezza: 20, spessore: 3, peso: 3.03 },
        { base: 50, altezza: 25, spessore: 2, peso: 2.26 },
        { base: 50, altezza: 25, spessore: 3, peso: 3.26 },
        { base: 50, altezza: 30, spessore: 2, peso: 2.41 },
        { base: 50, altezza: 30, spessore: 3, peso: 3.49 },
        { base: 50, altezza: 30, spessore: 4, peso: 4.50 },
        { base: 60, altezza: 20, spessore: 2, peso: 2.41 },
        { base: 60, altezza: 20, spessore: 3, peso: 3.49 },
        { base: 60, altezza: 30, spessore: 2, peso: 2.73 },
        { base: 60, altezza: 30, spessore: 3, peso: 3.95 },
        { base: 60, altezza: 40, spessore: 2, peso: 3.05 },
        { base: 60, altezza: 40, spessore: 3, peso: 4.42 },
        { base: 60, altezza: 40, spessore: 4, peso: 5.72 },
        { base: 70, altezza: 30, spessore: 2, peso: 3.05 },
        { base: 70, altezza: 30, spessore: 3, peso: 4.42 },
        { base: 70, altezza: 40, spessore: 2, peso: 3.37 },
        { base: 70, altezza: 40, spessore: 3, peso: 4.88 },
        { base: 70, altezza: 50, spessore: 2, peso: 3.69 },
        { base: 70, altezza: 50, spessore: 3, peso: 5.34 },
        { base: 80, altezza: 40, spessore: 2, peso: 3.69 },
        { base: 80, altezza: 40, spessore: 3, peso: 5.34 },
        { base: 80, altezza: 40, spessore: 4, peso: 6.95 },
        { base: 80, altezza: 40, spessore: 5, peso: 8.47 },
        { base: 80, altezza: 60, spessore: 2, peso: 4.33 },
        { base: 80, altezza: 60, spessore: 3, peso: 6.27 },
        { base: 80, altezza: 60, spessore: 4, peso: 8.19 },
        { base: 100, altezza: 40, spessore: 3, peso: 6.27 },
        { base: 100, altezza: 40, spessore: 4, peso: 8.19 },
        { base: 100, altezza: 50, spessore: 3, peso: 6.73 },
        { base: 100, altezza: 50, spessore: 4, peso: 8.80 },
        { base: 100, altezza: 50, spessore: 5, peso: 10.8 },
        { base: 100, altezza: 60, spessore: 3, peso: 7.19 },
        { base: 100, altezza: 60, spessore: 4, peso: 9.42 },
        { base: 100, altezza: 60, spessore: 5, peso: 11.6 },
        { base: 120, altezza: 40, spessore: 3, peso: 7.19 },
        { base: 120, altezza: 40, spessore: 4, peso: 9.42 },
        { base: 120, altezza: 60, spessore: 3, peso: 8.12 },
        { base: 120, altezza: 60, spessore: 4, peso: 10.7 },
        { base: 120, altezza: 60, spessore: 5, peso: 13.1 },
        { base: 120, altezza: 80, spessore: 3, peso: 9.04 },
        { base: 120, altezza: 80, spessore: 4, peso: 11.9 },
        { base: 120, altezza: 80, spessore: 5, peso: 14.7 },
        { base: 140, altezza: 70, spessore: 4, peso: 12.8 },
        { base: 140, altezza: 70, spessore: 5, peso: 15.8 },
        { base: 150, altezza: 50, spessore: 3, peso: 9.04 },
        { base: 150, altezza: 50, spessore: 4, peso: 11.9 },
        { base: 150, altezza: 50, spessore: 5, peso: 14.7 },
        { base: 150, altezza: 100, spessore: 4, peso: 15.3 },
        { base: 150, altezza: 100, spessore: 5, peso: 18.9 },
        { base: 150, altezza: 100, spessore: 6, peso: 22.4 },
        { base: 160, altezza: 80, spessore: 4, peso: 14.8 },
        { base: 160, altezza: 80, spessore: 5, peso: 18.2 },
        { base: 160, altezza: 80, spessore: 6, peso: 21.6 },
        { base: 180, altezza: 60, spessore: 4, peso: 14.8 },
        { base: 180, altezza: 60, spessore: 5, peso: 18.2 },
        { base: 180, altezza: 60, spessore: 6, peso: 21.6 },
        { base: 180, altezza: 80, spessore: 5, peso: 19.8 },
        { base: 180, altezza: 80, spessore: 6, peso: 23.5 },
        { base: 180, altezza: 100, spessore: 5, peso: 21.4 },
        { base: 180, altezza: 100, spessore: 6, peso: 25.4 },
        { base: 200, altezza: 100, spessore: 5, peso: 23.0 },
        { base: 200, altezza: 100, spessore: 6, peso: 27.3 },
        { base: 200, altezza: 100, spessore: 8, peso: 35.5 },
        { base: 200, altezza: 120, spessore: 5, peso: 24.6 },
        { base: 200, altezza: 120, spessore: 6, peso: 29.2 },
        { base: 200, altezza: 120, spessore: 8, peso: 38.1 },
        { base: 250, altezza: 100, spessore: 6, peso: 32.4 },
        { base: 250, altezza: 100, spessore: 8, peso: 42.4 },
        { base: 250, altezza: 150, spessore: 6, peso: 37.3 },
        { base: 250, altezza: 150, spessore: 8, peso: 48.9 },
        { base: 300, altezza: 100, spessore: 6, peso: 37.3 },
        { base: 300, altezza: 100, spessore: 8, peso: 48.9 },
        { base: 300, altezza: 150, spessore: 6, peso: 42.2 },
        { base: 300, altezza: 150, spessore: 8, peso: 55.4 },
        { base: 300, altezza: 200, spessore: 6, peso: 47.1 },
        { base: 300, altezza: 200, spessore: 8, peso: 61.9 }
      ],
      'Acciaio inox AISI 304': [
        { base: 30, altezza: 20, spessore: 1.5, peso: 1.12 * 1.02 },
        { base: 30, altezza: 20, spessore: 2, peso: 1.46 * 1.02 },
        { base: 40, altezza: 20, spessore: 1.5, peso: 1.36 * 1.02 },
        { base: 40, altezza: 20, spessore: 2, peso: 1.78 * 1.02 },
        { base: 40, altezza: 30, spessore: 2, peso: 2.10 * 1.02 },
        { base: 50, altezza: 30, spessore: 2, peso: 2.41 * 1.02 }
      ],
      'Alluminio 6060': [
        { base: 30, altezza: 20, spessore: 2, peso: 1.46 * 0.34 },
        { base: 40, altezza: 20, spessore: 2, peso: 1.78 * 0.34 },
        { base: 40, altezza: 30, spessore: 2, peso: 2.10 * 0.34 },
        { base: 50, altezza: 30, spessore: 2, peso: 2.41 * 0.34 }
      ]
    },
    
    // LAMIERA
    'Lamiera': {
      'Ferro S235 grezzo': [
        { spessore: 0.5, peso: 3.93 },
        { spessore: 0.8, peso: 6.28 },
        { spessore: 1, peso: 7.85 },
        { spessore: 1.2, peso: 9.42 },
        { spessore: 1.5, peso: 11.8 },
        { spessore: 2, peso: 15.7 },
        { spessore: 2.5, peso: 19.6 },
        { spessore: 3, peso: 23.6 },
        { spessore: 4, peso: 31.4 },
        { spessore: 5, peso: 39.3 },
        { spessore: 6, peso: 47.1 },
        { spessore: 8, peso: 62.8 },
        { spessore: 10, peso: 78.5 },
        { spessore: 12, peso: 94.2 },
        { spessore: 15, peso: 118 },
        { spessore: 20, peso: 157 }
      ],
      'Acciaio inox AISI 304': [
        { spessore: 0.5, peso: 3.93 * 1.02 },
        { spessore: 0.8, peso: 6.28 * 1.02 },
        { spessore: 1, peso: 7.85 * 1.02 },
        { spessore: 1.2, peso: 9.42 * 1.02 },
        { spessore: 1.5, peso: 11.8 * 1.02 },
        { spessore: 2, peso: 15.7 * 1.02 },
        { spessore: 3, peso: 23.6 * 1.02 },
        { spessore: 4, peso: 31.4 * 1.02 },
        { spessore: 5, peso: 39.3 * 1.02 }
      ],
      'Alluminio 6060': [
        { spessore: 1, peso: 7.85 * 0.34 },
        { spessore: 1.5, peso: 11.8 * 0.34 },
        { spessore: 2, peso: 15.7 * 0.34 },
        { spessore: 3, peso: 23.6 * 0.34 },
        { spessore: 4, peso: 31.4 * 0.34 },
        { spessore: 5, peso: 39.3 * 0.34 }
      ]
    }
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

  // Funzione per calcolare il peso in base al tipo di materiale e alle dimensioni
  const calcolaPesoMateriale = (
    tipoMateriale: string, 
    tipoProfilato: string, 
    dimensioni: any, 
    lunghezza: number = 100, // cm
    quantita: number = 1
  ) => {
    // Trova il materiale base (es. "Ferro S235 grezzo" da "Ferro S235 grezzo - Tondo Ø 10mm")
    const materialBase = Object.keys(pesoMateriali).find(m => tipoMateriale.startsWith(m));
    if (!materialBase) return 0;
    
    // Estrai il tipo di profilato e le dimensioni
    let peso = 0;
    
    if (tipoProfilato === 'Tondo') {
      // Cerca nel prontuario
      const profilati = prontuarioMetallico.Tondo[materialBase as keyof typeof prontuarioMetallico.Tondo];
      if (!profilati) return 0;
      
      const profilato = profilati.find(p => p.diametro === dimensioni.diametro);
      if (profilato) {
        // Peso al metro * lunghezza in metri * quantità
        peso = profilato.peso * (lunghezza / 100) * quantita;
      }
    } 
    else if (tipoProfilato === 'Quadro') {
      const profilati = prontuarioMetallico.Quadro[materialBase as keyof typeof prontuarioMetallico.Quadro];
      if (!profilati) return 0;
      
      const profilato = profilati.find(p => p.lato === dimensioni.lato);
      if (profilato) {
        peso = profilato.peso * (lunghezza / 100) * quantita;
      }
    }
    else if (tipoProfilato === 'Piatto') {
      const profilati = prontuarioMetallico.Piatto[materialBase as keyof typeof prontuarioMetallico.Piatto];
      if (!profilati) return 0;
      
      const profilato = profilati.find(p => p.base === dimensioni.base && p.altezza === dimensioni.altezza);
      if (profilato) {
        peso = profilato.peso * (lunghezza / 100) * quantita;
      }
    }
    else if (tipoProfilato === 'Angolare') {
      const profilati = prontuarioMetallico.Angolare[materialBase as keyof typeof prontuarioMetallico.Angolare];
      if (!profilati) return 0;
      
      const profilato = profilati.find(p => p.lato === dimensioni.lato && p.spessore === dimensioni.spessore);
      if (profilato) {
        peso = profilato.peso * (lunghezza / 100) * quantita;
      }
    }
    else if (tipoProfilato === 'Tubolare Tondo') {
      const profilati = prontuarioMetallico['Tubolare Tondo'][materialBase as keyof typeof prontuarioMetallico['Tubolare Tondo']];
      if (!profilati) return 0;
      
      const profilato = profilati.find(p => p.diametro === dimensioni.diametro && p.spessore === dimensioni.spessore);
      if (profilato) {
        peso = profilato.peso * (lunghezza / 100) * quantita;
      }
    }
    else if (tipoProfilato === 'Tubolare Quadro') {
      const profilati = prontuarioMetallico['Tubolare Quadro'][materialBase as keyof typeof prontuarioMetallico['Tubolare Quadro']];
      if (!profilati) return 0;
      
      const profilato = profilati.find(p => p.lato === dimensioni.lato && p.spessore === dimensioni.spessore);
      if (profilato) {
        peso = profilato.peso * (lunghezza / 100) * quantita;
      }
    }
    else if (tipoProfilato === 'Tubolare Rettangolare') {
      const profilati = prontuarioMetallico['Tubolare Rettangolare'][materialBase as keyof typeof prontuarioMetallico['Tubolare Rettangolare']];
      if (!profilati) return 0;
      
      const profilato = profilati.find(p => 
        p.base === dimensioni.base && 
        p.altezza === dimensioni.altezza && 
        p.spessore === dimensioni.spessore
      );
      if (profilato) {
        peso = profilato.peso * (lunghezza / 100) * quantita;
      }
    }
    else if (tipoProfilato === 'Lamiera') {
      const profilati = prontuarioMetallico.Lamiera[materialBase as keyof typeof prontuarioMetallico.Lamiera];
      if (!profilati) return 0;
      
      const profilato = profilati.find(p => p.spessore === dimensioni.spessore);
      if (profilato) {
        // Per le lamiere, il peso è per m², quindi calcoliamo l'area in m²
        const area = (dimensioni.larghezza / 100) * (lunghezza / 100); // m²
        peso = profilato.peso * area * quantita;
      }
    }
    
    return Math.round(peso * 1000) / 1000; // Arrotonda a 3 decimali
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

  // Genera le opzioni per il menu a tendina dei materiali
  const generateMaterialOptions = () => {
    const options = [];
    
    // Per ogni tipo di profilato
    for (const [tipoProfilato, materialiPerProfilato] of Object.entries(prontuarioMetallico)) {
      // Per ogni materiale di quel profilato
      for (const [materiale, profilati] of Object.entries(materialiPerProfilato)) {
        // Per ogni dimensione di quel profilato
        for (const profilato of profilati) {
          let descrizione = '';
          
          if (tipoProfilato === 'Tondo') {
            descrizione = `Ø ${profilato.diametro}mm`;
          } 
          else if (tipoProfilato === 'Quadro') {
            descrizione = `${profilato.lato}x${profilato.lato}mm`;
          }
          else if (tipoProfilato === 'Piatto') {
            descrizione = `${profilato.base}x${profilato.altezza}mm`;
          }
          else if (tipoProfilato === 'Angolare') {
            descrizione = `${profilato.lato}x${profilato.lato}x${profilato.spessore}mm`;
          }
          else if (tipoProfilato === 'Tubolare Tondo') {
            descrizione = `Ø ${profilato.diametro}x${profilato.spessore}mm`;
          }
          else if (tipoProfilato === 'Tubolare Quadro') {
            descrizione = `${profilato.lato}x${profilato.lato}x${profilato.spessore}mm`;
          }
          else if (tipoProfilato === 'Tubolare Rettangolare') {
            descrizione = `${profilato.base}x${profilato.altezza}x${profilato.spessore}mm`;
          }
          else if (tipoProfilato === 'Lamiera') {
            descrizione = `Spessore ${profilato.spessore}mm`;
          }
          
          const value = `${materiale} - ${tipoProfilato} ${descrizione}`;
          options.push({
            value,
            label: value,
            tipoProfilato,
            materiale,
            dimensioni: profilato,
            pesoMetro: profilato.peso
          });
        }
      }
    }
    
    return options;
  };

  // Opzioni per il menu a tendina
  const materialOptions = generateMaterialOptions();

  // Gestisce il cambio di materiale e calcola automaticamente il peso
  const handleMaterialChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    if (!selectedValue) return;
    
    // Trova l'opzione selezionata
    const selectedOption = materialOptions.find(opt => opt.value === selectedValue);
    if (!selectedOption) return;
    
    // Imposta il tipo di materiale
    setNewMateriale(prev => ({
      ...prev,
      tipo_materiale: selectedValue
    }));
    
    // Apri il form per completare i dettagli
    setShowAddForm(true);
  };

  // Calcola il peso in base al materiale selezionato e alla lunghezza
  const calcolaPesoAutomatico = (tipoMateriale: string, lunghezza: number, quantita: number) => {
    if (!tipoMateriale) return 0;
    
    const selectedOption = materialOptions.find(opt => opt.value === tipoMateriale);
    if (!selectedOption) return 0;
    
    const { tipoProfilato, materiale, dimensioni } = selectedOption;
    return calcolaPesoMateriale(materiale, tipoProfilato, dimensioni, lunghezza, quantita);
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
                    onChange={handleMaterialChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Seleziona materiale</option>
                    {Object.keys(prontuarioMetallico).map(tipoProfilato => (
                      <optgroup key={tipoProfilato} label={tipoProfilato}>
                        {Object.keys(prontuarioMetallico[tipoProfilato as keyof typeof prontuarioMetallico]).map(materiale => {
                          const profilati = prontuarioMetallico[tipoProfilato as keyof typeof prontuarioMetallico][materiale as any];
                          return profilati.map((profilato: any, index: number) => {
                            let descrizione = '';
                            
                            if (tipoProfilato === 'Tondo') {
                              descrizione = `Ø ${profilato.diametro}mm`;
                            } 
                            else if (tipoProfilato === 'Quadro') {
                              descrizione = `${profilato.lato}x${profilato.lato}mm`;
                            }
                            else if (tipoProfilato === 'Piatto') {
                              descrizione = `${profilato.base}x${profilato.altezza}mm`;
                            }
                            else if (tipoProfilato === 'Angolare') {
                              descrizione = `${profilato.lato}x${profilato.lato}x${profilato.spessore}mm`;
                            }
                            else if (tipoProfilato === 'Tubolare Tondo') {
                              descrizione = `Ø ${profilato.diametro}x${profilato.spessore}mm`;
                            }
                            else if (tipoProfilato === 'Tubolare Quadro') {
                              descrizione = `${profilato.lato}x${profilato.lato}x${profilato.spessore}mm`;
                            }
                            else if (tipoProfilato === 'Tubolare Rettangolare') {
                              descrizione = `${profilato.base}x${profilato.altezza}x${profilato.spessore}mm`;
                            }
                            else if (tipoProfilato === 'Lamiera') {
                              descrizione = `Spessore ${profilato.spessore}mm`;
                            }
                            
                            const value = `${materiale} - ${tipoProfilato} ${descrizione}`;
                            
                            return (
                              <option key={`${materiale}-${tipoProfilato}-${index}`} value={value}>
                                {value}
                              </option>
                            );
                          });
                        })}
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
                    Lunghezza (cm) *
                  </label>
                  <input
                    type="number"
                    value={newMateriale.lunghezza || 100}
                    onChange={(e) => {
                      const lunghezza = parseFloat(e.target.value) || 100;
                      const quantita = newMateriale.quantita || 1;
                      const peso = calcolaPesoAutomatico(newMateriale.tipo_materiale, lunghezza, quantita);
                      
                      setNewMateriale(prev => ({ 
                        ...prev, 
                        lunghezza,
                        kg_totali: peso
                      }));
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="100"
                    min="1"
                    step="0.1"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantità (pezzi) *
                  </label>
                  <input
                    type="number"
                    value={newMateriale.quantita || 1}
                    onChange={(e) => {
                      const quantita = parseInt(e.target.value) || 1;
                      const lunghezza = newMateriale.lunghezza || 100;
                      const peso = calcolaPesoAutomatico(newMateriale.tipo_materiale, lunghezza, quantita);
                      
                      setNewMateriale(prev => ({ 
                        ...prev, 
                        quantita,
                        kg_totali: peso
                      }));
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="1"
                    min="1"
                    step="1"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Peso Totale (kg) *
                  </label>
                  <input
                    type="number"
                    value={newMateriale.kg_totali}
                    readOnly
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    placeholder="0.000"
                  />
                </div>
                
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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