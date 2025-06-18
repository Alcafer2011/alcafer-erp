import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Package, TrendingUp, RefreshCw, Calculator, Map, Info } from 'lucide-react';
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
    fornitore: '',
    profilato: '',
    lunghezza: 600, // 6 metri standard
    quantita: 1
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
      { nome: 'Tondo Ø 8mm', peso: 0.395, tipo: 'barra' },
      { nome: 'Tondo Ø 10mm', peso: 0.617, tipo: 'barra' },
      { nome: 'Tondo Ø 12mm', peso: 0.888, tipo: 'barra' },
      { nome: 'Tondo Ø 14mm', peso: 1.21, tipo: 'barra' },
      { nome: 'Tondo Ø 16mm', peso: 1.58, tipo: 'barra' },
      { nome: 'Tondo Ø 18mm', peso: 2.00, tipo: 'barra' },
      { nome: 'Tondo Ø 20mm', peso: 2.47, tipo: 'barra' },
      { nome: 'Tondo Ø 25mm', peso: 3.85, tipo: 'barra' },
      { nome: 'Tondo Ø 30mm', peso: 5.55, tipo: 'barra' },
      { nome: 'Quadro 10x10mm', peso: 0.785, tipo: 'barra' },
      { nome: 'Quadro 12x12mm', peso: 1.13, tipo: 'barra' },
      { nome: 'Quadro 14x14mm', peso: 1.54, tipo: 'barra' },
      { nome: 'Quadro 16x16mm', peso: 2.01, tipo: 'barra' },
      { nome: 'Quadro 20x20mm', peso: 3.14, tipo: 'barra' },
      { nome: 'Piatto 20x5mm', peso: 0.785, tipo: 'barra' },
      { nome: 'Piatto 25x5mm', peso: 0.981, tipo: 'barra' },
      { nome: 'Piatto 30x5mm', peso: 1.18, tipo: 'barra' },
      { nome: 'Piatto 40x5mm', peso: 1.57, tipo: 'barra' },
      { nome: 'Piatto 50x5mm', peso: 1.96, tipo: 'barra' },
      { nome: 'Angolare 30x30x3mm', peso: 1.36, tipo: 'barra' },
      { nome: 'Angolare 40x40x4mm', peso: 2.42, tipo: 'barra' },
      { nome: 'Angolare 50x50x5mm', peso: 3.77, tipo: 'barra' },
      { nome: 'Tubolare tondo Ø 21.3x2mm', peso: 0.95, tipo: 'tubo' },
      { nome: 'Tubolare tondo Ø 26.9x2mm', peso: 1.23, tipo: 'tubo' },
      { nome: 'Tubolare tondo Ø 33.7x2mm', peso: 1.56, tipo: 'tubo' },
      { nome: 'Tubolare quadro 20x20x2mm', peso: 1.11, tipo: 'tubo' },
      { nome: 'Tubolare quadro 30x30x2mm', peso: 1.74, tipo: 'tubo' },
      { nome: 'Tubolare quadro 40x40x2mm', peso: 2.36, tipo: 'tubo' },
      { nome: 'Tubolare rettangolare 30x20x2mm', peso: 1.43, tipo: 'tubo' },
      { nome: 'Tubolare rettangolare 40x20x2mm', peso: 1.74, tipo: 'tubo' },
      { nome: 'Tubolare rettangolare 50x30x2mm', peso: 2.36, tipo: 'tubo' }
    ],
    'Ferro S275 grezzo': [
      { nome: 'Tondo Ø 10mm', peso: 0.617, tipo: 'barra' },
      { nome: 'Tondo Ø 12mm', peso: 0.888, tipo: 'barra' },
      { nome: 'Tondo Ø 16mm', peso: 1.58, tipo: 'barra' },
      { nome: 'Tondo Ø 20mm', peso: 2.47, tipo: 'barra' },
      { nome: 'Tondo Ø 25mm', peso: 3.85, tipo: 'barra' },
      { nome: 'Quadro 12x12mm', peso: 1.13, tipo: 'barra' },
      { nome: 'Quadro 16x16mm', peso: 2.01, tipo: 'barra' },
      { nome: 'Quadro 20x20mm', peso: 3.14, tipo: 'barra' },
      { nome: 'Piatto 30x5mm', peso: 1.18, tipo: 'barra' },
      { nome: 'Piatto 40x5mm', peso: 1.57, tipo: 'barra' },
      { nome: 'Piatto 50x5mm', peso: 1.96, tipo: 'barra' },
      { nome: 'Angolare 40x40x4mm', peso: 2.42, tipo: 'barra' },
      { nome: 'Angolare 50x50x5mm', peso: 3.77, tipo: 'barra' },
      { nome: 'Angolare 60x60x6mm', peso: 5.42, tipo: 'barra' },
      { nome: 'Tubolare tondo Ø 33.7x2.5mm', peso: 1.94, tipo: 'tubo' },
      { nome: 'Tubolare tondo Ø 42.4x2.5mm', peso: 2.47, tipo: 'tubo' },
      { nome: 'Tubolare quadro 30x30x2.5mm', peso: 2.15, tipo: 'tubo' },
      { nome: 'Tubolare quadro 40x40x2.5mm', peso: 2.93, tipo: 'tubo' },
      { nome: 'Tubolare rettangolare 40x20x2.5mm', peso: 2.15, tipo: 'tubo' },
      { nome: 'Tubolare rettangolare 50x30x2.5mm', peso: 2.93, tipo: 'tubo' }
    ],
    'Ferro S355 grezzo': [
      { nome: 'Tondo Ø 12mm', peso: 0.888, tipo: 'barra' },
      { nome: 'Tondo Ø 16mm', peso: 1.58, tipo: 'barra' },
      { nome: 'Tondo Ø 20mm', peso: 2.47, tipo: 'barra' },
      { nome: 'Tondo Ø 25mm', peso: 3.85, tipo: 'barra' },
      { nome: 'Tondo Ø 30mm', peso: 5.55, tipo: 'barra' },
      { nome: 'Quadro 16x16mm', peso: 2.01, tipo: 'barra' },
      { nome: 'Quadro 20x20mm', peso: 3.14, tipo: 'barra' },
      { nome: 'Quadro 25x25mm', peso: 4.91, tipo: 'barra' },
      { nome: 'Piatto 40x8mm', peso: 2.51, tipo: 'barra' },
      { nome: 'Piatto 50x8mm', peso: 3.14, tipo: 'barra' },
      { nome: 'Piatto 60x8mm', peso: 3.77, tipo: 'barra' },
      { nome: 'Angolare 50x50x5mm', peso: 3.77, tipo: 'barra' },
      { nome: 'Angolare 60x60x6mm', peso: 5.42, tipo: 'barra' },
      { nome: 'Angolare 70x70x7mm', peso: 7.38, tipo: 'barra' },
      { nome: 'Tubolare tondo Ø 42.4x3mm', peso: 2.95, tipo: 'tubo' },
      { nome: 'Tubolare tondo Ø 48.3x3mm', peso: 3.38, tipo: 'tubo' },
      { nome: 'Tubolare quadro 40x40x3mm', peso: 3.47, tipo: 'tubo' },
      { nome: 'Tubolare quadro 50x50x3mm', peso: 4.42, tipo: 'tubo' },
      { nome: 'Tubolare rettangolare 50x30x3mm', peso: 3.47, tipo: 'tubo' },
      { nome: 'Tubolare rettangolare 60x40x3mm', peso: 4.42, tipo: 'tubo' }
    ],
    'Acciaio inox AISI 304': [
      { nome: 'Tondo Ø 8mm', peso: 0.402, tipo: 'barra' },
      { nome: 'Tondo Ø 10mm', peso: 0.628, tipo: 'barra' },
      { nome: 'Tondo Ø 12mm', peso: 0.904, tipo: 'barra' },
      { nome: 'Tondo Ø 16mm', peso: 1.61, tipo: 'barra' },
      { nome: 'Quadro 10x10mm', peso: 0.800, tipo: 'barra' },
      { nome: 'Quadro 12x12mm', peso: 1.15, tipo: 'barra' },
      { nome: 'Quadro 16x16mm', peso: 2.05, tipo: 'barra' },
      { nome: 'Piatto 20x5mm', peso: 0.800, tipo: 'barra' },
      { nome: 'Piatto 30x5mm', peso: 1.20, tipo: 'barra' },
      { nome: 'Piatto 40x5mm', peso: 1.60, tipo: 'barra' },
      { nome: 'Angolare 30x30x3mm', peso: 1.38, tipo: 'barra' },
      { nome: 'Angolare 40x40x4mm', peso: 2.46, tipo: 'barra' },
      { nome: 'Tubolare tondo Ø 21.3x2mm', peso: 0.97, tipo: 'tubo' },
      { nome: 'Tubolare tondo Ø 26.9x2mm', peso: 1.25, tipo: 'tubo' },
      { nome: 'Tubolare quadro 20x20x2mm', peso: 1.13, tipo: 'tubo' },
      { nome: 'Tubolare quadro 30x30x2mm', peso: 1.77, tipo: 'tubo' },
      { nome: 'Tubolare rettangolare 30x20x2mm', peso: 1.45, tipo: 'tubo' },
      { nome: 'Tubolare rettangolare 40x20x2mm', peso: 1.77, tipo: 'tubo' }
    ],
    'Acciaio inox AISI 316': [
      { nome: 'Tondo Ø 8mm', peso: 0.402, tipo: 'barra' },
      { nome: 'Tondo Ø 10mm', peso: 0.628, tipo: 'barra' },
      { nome: 'Tondo Ø 12mm', peso: 0.904, tipo: 'barra' },
      { nome: 'Tondo Ø 16mm', peso: 1.61, tipo: 'barra' },
      { nome: 'Quadro 10x10mm', peso: 0.800, tipo: 'barra' },
      { nome: 'Quadro 12x12mm', peso: 1.15, tipo: 'barra' },
      { nome: 'Quadro 16x16mm', peso: 2.05, tipo: 'barra' },
      { nome: 'Piatto 20x5mm', peso: 0.800, tipo: 'barra' },
      { nome: 'Piatto 30x5mm', peso: 1.20, tipo: 'barra' },
      { nome: 'Piatto 40x5mm', peso: 1.60, tipo: 'barra' },
      { nome: 'Angolare 30x30x3mm', peso: 1.38, tipo: 'barra' },
      { nome: 'Angolare 40x40x4mm', peso: 2.46, tipo: 'barra' },
      { nome: 'Tubolare tondo Ø 21.3x2mm', peso: 0.97, tipo: 'tubo' },
      { nome: 'Tubolare tondo Ø 26.9x2mm', peso: 1.25, tipo: 'tubo' },
      { nome: 'Tubolare quadro 20x20x2mm', peso: 1.13, tipo: 'tubo' },
      { nome: 'Tubolare quadro 30x30x2mm', peso: 1.77, tipo: 'tubo' },
      { nome: 'Tubolare rettangolare 30x20x2mm', peso: 1.45, tipo: 'tubo' },
      { nome: 'Tubolare rettangolare 40x20x2mm', peso: 1.77, tipo: 'tubo' }
    ],
    'Alluminio 6060': [
      { nome: 'Tondo Ø 10mm', peso: 0.209, tipo: 'barra' },
      { nome: 'Tondo Ø 12mm', peso: 0.301, tipo: 'barra' },
      { nome: 'Tondo Ø 16mm', peso: 0.535, tipo: 'barra' },
      { nome: 'Tondo Ø 20mm', peso: 0.835, tipo: 'barra' },
      { nome: 'Quadro 10x10mm', peso: 0.267, tipo: 'barra' },
      { nome: 'Quadro 15x15mm', peso: 0.601, tipo: 'barra' },
      { nome: 'Quadro 20x20mm', peso: 1.07, tipo: 'barra' },
      { nome: 'Piatto 20x5mm', peso: 0.267, tipo: 'barra' },
      { nome: 'Piatto 30x5mm', peso: 0.401, tipo: 'barra' },
      { nome: 'Piatto 40x5mm', peso: 0.534, tipo: 'barra' },
      { nome: 'Angolare 20x20x2mm', peso: 0.214, tipo: 'barra' },
      { nome: 'Angolare 30x30x3mm', peso: 0.481, tipo: 'barra' },
      { nome: 'Tubolare tondo Ø 20x2mm', peso: 0.321, tipo: 'tubo' },
      { nome: 'Tubolare tondo Ø 25x2mm', peso: 0.408, tipo: 'tubo' },
      { nome: 'Tubolare quadro 20x20x2mm', peso: 0.381, tipo: 'tubo' },
      { nome: 'Tubolare quadro 30x30x2mm', peso: 0.595, tipo: 'tubo' },
      { nome: 'Tubolare rettangolare 30x20x2mm', peso: 0.488, tipo: 'tubo' },
      { nome: 'Tubolare rettangolare 40x20x2mm', peso: 0.595, tipo: 'tubo' }
    ],
    'Lamiera decapata': [
      { nome: 'Spessore 0.8mm', peso: 6.28, tipo: 'lamiera', dimensioni: '1000x2000mm' },
      { nome: 'Spessore 1mm', peso: 7.85, tipo: 'lamiera', dimensioni: '1000x2000mm' },
      { nome: 'Spessore 1.2mm', peso: 9.42, tipo: 'lamiera', dimensioni: '1000x2000mm' },
      { nome: 'Spessore 1.5mm', peso: 11.78, tipo: 'lamiera', dimensioni: '1000x2000mm' },
      { nome: 'Spessore 2mm', peso: 15.7, tipo: 'lamiera', dimensioni: '1000x2000mm' },
      { nome: 'Spessore 2.5mm', peso: 19.63, tipo: 'lamiera', dimensioni: '1000x2000mm' },
      { nome: 'Spessore 3mm', peso: 23.55, tipo: 'lamiera', dimensioni: '1000x2000mm' }
    ],
    'Lamiera striata': [
      { nome: 'Spessore 3/5mm', peso: 31.4, tipo: 'lamiera', dimensioni: '1000x2000mm' },
      { nome: 'Spessore 4/6mm', peso: 39.25, tipo: 'lamiera', dimensioni: '1000x2000mm' },
      { nome: 'Spessore 5/7mm', peso: 47.1, tipo: 'lamiera', dimensioni: '1000x2000mm' }
    ],
    'Lamiera nera': [
      { nome: 'Spessore 1mm', peso: 7.85, tipo: 'lamiera', dimensioni: '1000x2000mm' },
      { nome: 'Spessore 1.5mm', peso: 11.78, tipo: 'lamiera', dimensioni: '1000x2000mm' },
      { nome: 'Spessore 2mm', peso: 15.7, tipo: 'lamiera', dimensioni: '1000x2000mm' },
      { nome: 'Spessore 2.5mm', peso: 19.63, tipo: 'lamiera', dimensioni: '1000x2000mm' },
      { nome: 'Spessore 3mm', peso: 23.55, tipo: 'lamiera', dimensioni: '1000x2000mm' },
      { nome: 'Spessore 4mm', peso: 31.4, tipo: 'lamiera', dimensioni: '1000x2000mm' }
    ],
    'Acciaio corten': [
      { nome: 'Tondo Ø 12mm', peso: 0.888, tipo: 'barra' },
      { nome: 'Tondo Ø 16mm', peso: 1.58, tipo: 'barra' },
      { nome: 'Tondo Ø 20mm', peso: 2.47, tipo: 'barra' },
      { nome: 'Piatto 40x5mm', peso: 1.57, tipo: 'barra' },
      { nome: 'Piatto 50x5mm', peso: 1.96, tipo: 'barra' },
      { nome: 'Lamiera 1mm', peso: 7.85, tipo: 'lamiera', dimensioni: '1000x2000mm' },
      { nome: 'Lamiera 2mm', peso: 15.7, tipo: 'lamiera', dimensioni: '1000x2000mm' },
      { nome: 'Lamiera 3mm', peso: 23.55, tipo: 'lamiera', dimensioni: '1000x2000mm' }
    ],
    'Ferro zincato': [
      { nome: 'Tondo Ø 10mm', peso: 0.617, tipo: 'barra' },
      { nome: 'Tondo Ø 12mm', peso: 0.888, tipo: 'barra' },
      { nome: 'Tubolare tondo Ø 21.3x2mm', peso: 0.95, tipo: 'tubo' },
      { nome: 'Tubolare tondo Ø 26.9x2mm', peso: 1.23, tipo: 'tubo' },
      { nome: 'Tubolare quadro 20x20x2mm', peso: 1.11, tipo: 'tubo' },
      { nome: 'Tubolare quadro 30x30x2mm', peso: 1.74, tipo: 'tubo' },
      { nome: 'Lamiera 1mm', peso: 7.85, tipo: 'lamiera', dimensioni: '1000x2000mm' },
      { nome: 'Lamiera 2mm', peso: 15.7, tipo: 'lamiera', dimensioni: '1000x2000mm' }
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

  useEffect(() => {
    fetchData();
    
    // Aggiorna i prezzi regionali in base alla regione selezionata
    updatePrezziRegionali(selectedRegion);
  }, []);

  useEffect(() => {
    // Aggiorna i prezzi regionali quando cambia la regione selezionata
    updatePrezziRegionali(selectedRegion);
  }, [selectedRegion]);

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
        throw materialiResult.error;
      }

      if (prezziResult.error) {
        console.error('Errore nel caricamento prezzi:', prezziResult.error);
        throw prezziResult.error;
      }

      // Se non ci sono prezzi, mostra un messaggio informativo
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
      let prezzoMateriale = prezziMateriali.find(p => p.tipo_materiale === newMateriale.tipo_materiale.split(' - ')[0]);
      
      // Se il prezzo non esiste, chiedi all'utente di inserirlo
      if (!prezzoMateriale) {
        const tipoBase = newMateriale.tipo_materiale.split(' - ')[0];
        const prezzoInput = prompt(`Inserisci il prezzo per kg per "${tipoBase}" (€/kg):`);
        if (!prezzoInput || isNaN(parseFloat(prezzoInput))) {
          toast.error('Prezzo non valido');
          return;
        }
        
        const prezzoKg = parseFloat(prezzoInput);
        const success = await addNewPrezzoMateriale(tipoBase, prezzoKg);
        if (!success) return;
        
        // Ricarica i prezzi e trova quello appena inserito
        await fetchData();
        prezzoMateriale = prezziMateriali.find(p => p.tipo_materiale === tipoBase);
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

      if (error) throw error;
      
      toast.success('Materiale aggiunto con successo');
      setNewMateriale({
        tipo_materiale: '',
        kg_totali: 0,
        prezzo_kg: 0,
        numero_ddt: '',
        data_trasporto: new Date().toISOString().split('T')[0],
        fornitore: '',
        profilato: '',
        lunghezza: 600,
        quantita: 1
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

  const handleMaterialeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    if (!selectedValue) return;
    
    // Resetta il profilato quando cambia il materiale
    setNewMateriale(prev => ({
      ...prev,
      tipo_materiale: selectedValue,
      profilato: ''
    }));
  };

  const handleProfilatoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    if (!selectedValue) return;
    
    const [tipoMateriale, nomeProfilato] = selectedValue.split('|');
    
    // Trova il materiale e il profilato selezionati
    const materialeTipo = tipoMateriale.trim();
    const profilatoSelezionato = profilatiCommerciali[materialeTipo as keyof typeof profilatiCommerciali]?.find(
      p => p.nome === nomeProfilato.trim()
    );
    
    if (profilatoSelezionato) {
      // Calcola il peso totale in base alla lunghezza e quantità
      const lunghezzaMetri = newMateriale.lunghezza / 100; // da cm a metri
      const pesoStandard = profilatoSelezionato.tipo === 'lamiera' 
        ? profilatoSelezionato.peso // Per le lamiere il peso è già per foglio standard
        : profilatoSelezionato.peso * lunghezzaMetri; // Per barre e tubi, moltiplica per lunghezza
      
      const pesoTotale = pesoStandard * newMateriale.quantita;
      
      setNewMateriale(prev => ({
        ...prev,
        tipo_materiale: `${materialeTipo} - ${profilatoSelezionato.nome}`,
        kg_totali: Math.round(pesoTotale * 1000) / 1000
      }));
    }
  };

  const handleLunghezzaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const lunghezza = parseFloat(e.target.value) || 0;
    setNewMateriale(prev => ({ ...prev, lunghezza }));
    
    // Ricalcola il peso se è già selezionato un profilato
    if (prev.tipo_materiale && prev.profilato) {
      const [tipoMateriale, nomeProfilato] = prev.profilato.split('|');
      const materialeTipo = tipoMateriale.trim();
      const profilatoSelezionato = profilatiCommerciali[materialeTipo as keyof typeof profilatiCommerciali]?.find(
        p => p.nome === nomeProfilato.trim()
      );
      
      if (profilatoSelezionato) {
        const lunghezzaMetri = lunghezza / 100; // da cm a metri
        const pesoStandard = profilatoSelezionato.tipo === 'lamiera' 
          ? profilatoSelezionato.peso
          : profilatoSelezionato.peso * lunghezzaMetri;
        
        const pesoTotale = pesoStandard * prev.quantita;
        
        setNewMateriale(prev => ({
          ...prev,
          kg_totali: Math.round(pesoTotale * 1000) / 1000
        }));
      }
    }
  };

  const handleQuantitaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const quantita = parseInt(e.target.value) || 1;
    setNewMateriale(prev => ({ ...prev, quantita }));
    
    // Ricalcola il peso se è già selezionato un profilato
    if (prev.tipo_materiale && prev.profilato) {
      const [tipoMateriale, nomeProfilato] = prev.profilato.split('|');
      const materialeTipo = tipoMateriale.trim();
      const profilatoSelezionato = profilatiCommerciali[materialeTipo as keyof typeof profilatiCommerciali]?.find(
        p => p.nome === nomeProfilato.trim()
      );
      
      if (profilatoSelezionato) {
        const lunghezzaMetri = prev.lunghezza / 100; // da cm a metri
        const pesoStandard = profilatoSelezionato.tipo === 'lamiera' 
          ? profilatoSelezionato.peso
          : profilatoSelezionato.peso * lunghezzaMetri;
        
        const pesoTotale = pesoStandard * quantita;
        
        setNewMateriale(prev => ({
          ...prev,
          kg_totali: Math.round(pesoTotale * 1000) / 1000
        }));
      }
    }
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="tipo_materiale" className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo Materiale *
                  </label>
                  <select
                    id="tipo_materiale"
                    value={newMateriale.tipo_materiale.split(' - ')[0] || ''}
                    onChange={handleMaterialeChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Seleziona materiale</option>
                    {Object.keys(profilatiCommerciali).map(tipo => (
                      <option key={tipo} value={tipo}>{tipo}</option>
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
                  <label htmlFor="profilato" className="block text-sm font-medium text-gray-700 mb-1">
                    Profilato Commerciale *
                  </label>
                  <select
                    id="profilato"
                    value={newMateriale.profilato}
                    onChange={handleProfilatoChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Seleziona profilato</option>
                    {newMateriale.tipo_materiale && newMateriale.tipo_materiale !== 'custom' && 
                      profilatiCommerciali[newMateriale.tipo_materiale.split(' - ')[0] as keyof typeof profilatiCommerciali]?.map(profilato => (
                        <option 
                          key={`${newMateriale.tipo_materiale.split(' - ')[0]}-${profilato.nome}`} 
                          value={`${newMateriale.tipo_materiale.split(' - ')[0]}|${profilato.nome}`}
                        >
                          {profilato.nome} - {profilato.tipo === 'lamiera' ? profilato.dimensioni : `${profilato.peso.toFixed(3)} kg/m`}
                        </option>
                      ))
                    }
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label htmlFor="lunghezza" className="block text-sm font-medium text-gray-700 mb-1">
                    Lunghezza (cm) *
                  </label>
                  <input
                    type="number"
                    id="lunghezza"
                    value={newMateriale.lunghezza}
                    onChange={handleLunghezzaChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="600 (6 metri)"
                    min="1"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="quantita" className="block text-sm font-medium text-gray-700 mb-1">
                    Quantità (pezzi) *
                  </label>
                  <input
                    type="number"
                    id="quantita"
                    value={newMateriale.quantita}
                    onChange={handleQuantitaChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="1"
                    min="1"
                    required
                  />
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
                  <p className="text-xs text-gray-500 mt-1">
                    Calcolato automaticamente in base al profilato selezionato
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
                        €{(prezziMateriali.find(p => p.tipo_materiale === newMateriale.tipo_materiale.split(' - ')[0])?.prezzo_kg || 0).toFixed(3)}/kg
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-blue-600">Importo totale:</p>
                      <p className="text-sm font-medium">
                        €{(newMateriale.kg_totali * (prezziMateriali.find(p => p.tipo_materiale === newMateriale.tipo_materiale.split(' - ')[0])?.prezzo_kg || 0)).toFixed(2)}
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

      {/* Prontuario Materiali */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Prontuario Materiali Metallici
            </h3>
            <HelpTooltip content="Informazioni tecniche e pesi specifici dei materiali metallici" />
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-3">Pesi Specifici</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Materiale</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Densità (kg/dm³)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {Object.entries(pesoMateriali).map(([materiale, dati]) => (
                      <tr key={materiale} className="hover:bg-gray-100">
                        <td className="px-4 py-2 text-sm text-gray-900">{materiale}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{dati.densita}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-3">Informazioni Tecniche</h4>
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h5 className="font-medium text-blue-800 mb-2">Ferro e Acciaio</h5>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li><span className="font-medium">S235:</span> Resistenza minima allo snervamento 235 MPa</li>
                    <li><span className="font-medium">S275:</span> Resistenza minima allo snervamento 275 MPa</li>
                    <li><span className="font-medium">S355:</span> Resistenza minima allo snervamento 355 MPa</li>
                    <li><span className="font-medium">Corten:</span> Acciaio resistente alla corrosione atmosferica</li>
                  </ul>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <h5 className="font-medium text-green-800 mb-2">Acciaio Inox</h5>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li><span className="font-medium">AISI 304:</span> Inox austenitico 18/8 (Cr-Ni)</li>
                    <li><span className="font-medium">AISI 316:</span> Inox austenitico 18/8/2 (Cr-Ni-Mo), resistente in ambienti marini</li>
                  </ul>
                </div>

                <div className="bg-amber-50 rounded-lg p-4">
                  <h5 className="font-medium text-amber-800 mb-2">Alluminio</h5>
                  <ul className="text-sm text-amber-700 space-y-1">
                    <li><span className="font-medium">6060:</span> Lega Al-Mg-Si, buona resistenza meccanica e ottima estrudibilità</li>
                    <li><span className="font-medium">Anodizzato:</span> Trattamento superficiale per aumentare resistenza a corrosione</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialiMetallici;