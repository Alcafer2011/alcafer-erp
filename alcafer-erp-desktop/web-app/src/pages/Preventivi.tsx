import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, FileText, Upload, Camera, Download, Eye, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { Preventivo } from '../types/database';
import PreventivoModal from '../components/PreventivoModal';
import FileUpload from '../components/common/FileUpload';
import { usePermissions } from '../hooks/usePermissions';
import LoadingSpinner from '../components/common/LoadingSpinner';
import HelpTooltip from '../components/common/HelpTooltip';
import toast from 'react-hot-toast';

const Preventivi: React.FC = () => {
  const [preventivi, setPreventivi] = useState<Preventivo[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedPreventivo, setSelectedPreventivo] = useState<Preventivo | null>(null);
  const permissions = usePermissions();

  useEffect(() => {
    fetchPreventivi();
  }, []);

  const fetchPreventivi = async () => {
    try {
      // Simula dati preventivi per demo
      const mockPreventivi: Preventivo[] = [
        {
          id: '1',
          numero_preventivo: 'PREV-2024-001',
          descrizione: 'Lavorazione cancello in ferro battuto',
          importo: 2500.00,
          stato: 'inviato',
          file_path: '/preventivi/prev-001.pdf',
          data_creazione: '2024-12-01',
          data_scadenza: '2024-12-31',
          ditta: 'alcafer',
          cliente: {
            id: 'cliente-1',
            nome: 'Mario Rossi',
            email: 'mario.rossi@email.com'
          }
        },
        {
          id: '2',
          numero_preventivo: 'PREV-2024-002',
          descrizione: 'Struttura metallica per capannone',
          importo: 15000.00,
          stato: 'accettato',
          file_path: '/preventivi/prev-002.pdf',
          data_creazione: '2024-12-05',
          data_scadenza: '2025-01-15',
          ditta: 'gabifer',
          cliente: {
            id: 'cliente-2',
            nome: 'Azienda Costruzioni SRL',
            email: 'info@costruzioni.it'
          }
        }
      ];

      setPreventivi(mockPreventivi);
    } catch (error) {
      console.error('Errore nel caricamento dei preventivi:', error);
      toast.error('Errore nel caricamento dei preventivi');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo preventivo?')) return;

    try {
      setPreventivi(prev => prev.filter(p => p.id !== id));
      toast.success('Preventivo eliminato con successo');
    } catch (error) {
      console.error('Errore nell\'eliminazione del preventivo:', error);
      toast.error('Errore nell\'eliminazione del preventivo');
    }
  };

  const handleEdit = (preventivo: Preventivo) => {
    setSelectedPreventivo(preventivo);
    setModalOpen(true);
  };

  const handleNew = () => {
    setSelectedPreventivo(null);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedPreventivo(null);
    fetchPreventivi();
  };

  const handleFileUpload = (files: any[]) => {
    files.forEach(file => {
      toast.success(`Preventivo ${file.file.name} caricato con successo`);
    });
    setUploadModalOpen(false);
    fetchPreventivi();
  };

  const getStatoColor = (stato: string) => {
    switch (stato) {
      case 'accettato':
        return 'bg-green-100 text-green-800';
      case 'rifiutato':
        return 'bg-red-100 text-red-800';
      case 'inviato':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!permissions.canModifyPreventivi) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Accesso Limitato</h3>
        <p className="text-gray-500">Non hai i permessi per visualizzare questa sezione.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestione Preventivi</h1>
          <p className="mt-2 text-gray-600">Gestisci i tuoi preventivi e carica documenti PDF</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setUploadModalOpen(true)}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Carica Preventivo
          </button>
          <button 
            onClick={handleNew}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nuovo Preventivo
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {preventivi.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nessun preventivo</h3>
            <p className="text-gray-500 mb-6">Inizia creando il tuo primo preventivo o caricando un PDF</p>
            <div className="flex justify-center gap-3">
              <button 
                onClick={() => setUploadModalOpen(true)}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                <Upload className="h-4 w-4 inline mr-2" />
                Carica PDF
              </button>
              <button 
                onClick={handleNew}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                <Plus className="h-4 w-4 inline mr-2" />
                Nuovo Preventivo
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Preventivi ({preventivi.length})
                </h3>
                <HelpTooltip content="Gestisci i preventivi: crea nuovi, carica PDF o scansiona con la camera" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Numero
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Importo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stato
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ditta
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Azioni
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <AnimatePresence>
                    {preventivi.map((preventivo, index) => (
                      <motion.tr
                        key={preventivo.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mr-3">
                              <span className="text-white text-xs font-bold">
                                {preventivo.cliente?.nome?.charAt(0) || '?'}
                              </span>
                            </div>
                            <div className="text-sm font-medium text-gray-900">
                              {preventivo.cliente?.nome || 'Cliente non specificato'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {preventivo.numero_preventivo || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {preventivo.importo ? `€${preventivo.importo.toLocaleString('it-IT', { minimumFractionDigits: 2 })}` : '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatoColor(preventivo.stato || 'bozza')}`}>
                            {preventivo.stato || 'bozza'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            preventivo.ditta === 'alcafer' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                          }`}>
                            {preventivo.ditta?.toUpperCase() || 'ALCAFER'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            {preventivo.file_path && (
                              <button
                                className="text-green-600 hover:text-green-900 p-2 hover:bg-green-50 rounded-lg transition-colors"
                                title="Visualizza PDF"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleEdit(preventivo)}
                              className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Modifica preventivo"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(preventivo.id)}
                              className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
                              title="Elimina preventivo"
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
          </>
        )}
      </div>

      {/* Modal Upload */}
      <AnimatePresence>
        {uploadModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setUploadModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Upload className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Carica Preventivo</h3>
                    <p className="text-sm text-gray-500">Carica file PDF o scansiona con la camera</p>
                  </div>
                </div>
                <button 
                  onClick={() => setUploadModalOpen(false)} 
                  className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6">
                <FileUpload
                  onFilesUploaded={handleFileUpload}
                  acceptedTypes={['.pdf', '.jpg', '.jpeg', '.png']}
                  maxFiles={5}
                  allowCamera={true}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {modalOpen && (
          <PreventivoModal
            preventivo={selectedPreventivo}
            onClose={handleModalClose}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Preventivi;
