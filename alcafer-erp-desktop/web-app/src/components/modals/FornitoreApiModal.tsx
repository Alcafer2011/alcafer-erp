import React, { useState } from 'react';
import { X, Search, Building2, AlertTriangle, CheckCircle, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import LoadingSpinner from '../common/LoadingSpinner';
import toast from 'react-hot-toast';

interface FornitoreApiModalProps {
  onClose: () => void;
  onSelect: (fornitore: any) => void;
}

const FornitoreApiModal: React.FC<FornitoreApiModalProps> = ({ onClose, onSelect }) => {
  const [partitaIva, setPartitaIva] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [affidabilita, setAffidabilita] = useState<{
    score: number;
    stato: 'ottimo' | 'buono' | 'medio' | 'scarso';
    dettagli: string[];
  } | null>(null);

  const handleSearch = async () => {
    if (!partitaIva || partitaIva.length !== 11) {
      setError('Inserisci una partita IVA valida (11 cifre)');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Simula una chiamata API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Dati di esempio basati sulla partita IVA
      if (partitaIva === '12345678901') {
        setResults({
          partita_iva: '12345678901',
          nome: 'Acciai Speciali Milano S.r.l.',
          indirizzo: 'Via Industria 15, 20100 Milano',
          email: 'info@acciaispeciali.it',
          telefono: '+39 02 1234567',
          codice_fiscale: '12345678901',
          tipo_fornitore: 'materiali',
          settore_merceologico: 'Acciai e leghe metalliche'
        });
        
        setAffidabilita({
          score: 85,
          stato: 'ottimo',
          dettagli: [
            'Nessun protesto o pregiudizievole rilevato',
            'Pagamenti puntuali negli ultimi 24 mesi',
            'Solidità patrimoniale elevata',
            'Bilanci in attivo negli ultimi 3 anni'
          ]
        });
      } else if (partitaIva === '98765432109') {
        setResults({
          partita_iva: '98765432109',
          nome: 'Gas Tecnici Lombardia S.p.A.',
          indirizzo: 'Via Chimica 8, 20090 Segrate (MI)',
          email: 'info@gastecnici.com',
          telefono: '+39 02 9876543',
          codice_fiscale: '98765432109',
          tipo_fornitore: 'materiali',
          settore_merceologico: 'Gas industriali'
        });
        
        setAffidabilita({
          score: 72,
          stato: 'buono',
          dettagli: [
            'Nessun protesto rilevato',
            'Ritardi occasionali nei pagamenti',
            'Buona solidità patrimoniale',
            'Bilanci in attivo negli ultimi 2 anni'
          ]
        });
      } else if (partitaIva === '11223344556') {
        setResults({
          partita_iva: '11223344556',
          nome: 'Metalli Pregiati S.r.l.',
          indirizzo: 'Via dei Metalli 42, 20019 Settimo Milanese (MI)',
          email: 'info@metallipregiati.it',
          telefono: '+39 02 5544332',
          codice_fiscale: '11223344556',
          tipo_fornitore: 'materiali',
          settore_merceologico: 'Metalli preziosi e leghe speciali'
        });
        
        setAffidabilita({
          score: 45,
          stato: 'medio',
          dettagli: [
            'Nessun protesto recente',
            'Ritardi frequenti nei pagamenti',
            'Solidità patrimoniale nella media',
            'Bilancio in perdita nell\'ultimo anno'
          ]
        });
      } else if (partitaIva === '55667788990') {
        setResults({
          partita_iva: '55667788990',
          nome: 'Ferro Battuto Artigianale S.r.l.',
          indirizzo: 'Via Artigiani 15, 20077 Melegnano (MI)',
          email: 'info@ferrobattutoart.it',
          telefono: '+39 02 8877665',
          codice_fiscale: '55667788990',
          tipo_fornitore: 'materiali',
          settore_merceologico: 'Ferro battuto e lavorazioni artistiche'
        });
        
        setAffidabilita({
          score: 25,
          stato: 'scarso',
          dettagli: [
            'Protesti o pregiudizievoli rilevati',
            'Gravi ritardi nei pagamenti',
            'Scarsa solidità patrimoniale',
            'Bilanci in perdita negli ultimi 3 anni'
          ]
        });
      } else {
        setError('Nessun risultato trovato per questa partita IVA');
      }
    } catch (error) {
      setError('Errore durante la ricerca. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSelect = () => {
    if (results) {
      onSelect(results);
      toast.success('Dati fornitore importati con successo');
      onClose();
    }
  };
  
  const getAffidabilitaColor = (stato: string) => {
    switch (stato) {
      case 'ottimo': return 'bg-green-50 border-green-200 text-green-800';
      case 'buono': return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'medio': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'scarso': return 'bg-red-50 border-red-200 text-red-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };
  
  const getAffidabilitaIcon = (stato: string) => {
    switch (stato) {
      case 'ottimo': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'buono': return <CheckCircle className="h-5 w-5 text-blue-600" />;
      case 'medio': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'scarso': return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default: return <Loader className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Search className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Ricerca Fornitore
              </h3>
              <p className="text-sm text-gray-500">
                Cerca un fornitore tramite partita IVA
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <label htmlFor="partita_iva" className="block text-sm font-medium text-gray-700 mb-2">
              Partita IVA
            </label>
            <div className="flex">
              <input
                type="text"
                id="partita_iva"
                value={partitaIva}
                onChange={(e) => setPartitaIva(e.target.value.replace(/[^0-9]/g, '').slice(0, 11))}
                onKeyDown={handleKeyDown}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Inserisci 11 cifre"
                maxLength={11}
              />
              <button
                onClick={handleSearch}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-r-lg transition-colors disabled:bg-blue-400"
              >
                {loading ? <LoadingSpinner size="sm" color="text-white" /> : 'Cerca'}
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Prova con 12345678901, 98765432109, 11223344556 o 55667788990 per vedere risultati di esempio
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-md">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {results && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Risultato:</h4>
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <Building2 className="h-6 w-6 text-green-600" />
                  <h5 className="font-medium text-gray-900">{results.nome}</h5>
                </div>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">P.IVA:</span> {results.partita_iva}</p>
                  <p><span className="font-medium">Indirizzo:</span> {results.indirizzo}</p>
                  <p><span className="font-medium">Email:</span> {results.email}</p>
                  <p><span className="font-medium">Telefono:</span> {results.telefono}</p>
                  <p><span className="font-medium">Settore:</span> {results.settore_merceologico}</p>
                </div>
                
                {affidabilita && (
                  <div className={`mt-4 p-3 rounded-lg border ${getAffidabilitaColor(affidabilita.stato)}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getAffidabilitaIcon(affidabilita.stato)}
                        <h5 className="text-sm font-medium capitalize">{affidabilita.stato}</h5>
                      </div>
                      <div className="text-sm font-bold">
                        Score: {affidabilita.score}/100
                      </div>
                    </div>
                    
                    <ul className="text-xs space-y-1 mt-2">
                      {affidabilita.dettagli.map((dettaglio, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span>•</span>
                          <span>{dettaglio}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <button
                  onClick={handleSelect}
                  className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Importa Dati
                </button>
              </div>
            </div>
          )}

          <div className="text-center">
            <p className="text-sm text-gray-500">
              Non trovi il fornitore? Puoi inserire i dati manualmente.
            </p>
            <button
              onClick={onClose}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Torna al form
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default FornitoreApiModal;
