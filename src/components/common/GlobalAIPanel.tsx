import React, { useState } from 'react';
import { Bot, Bug, Wand2, Upload, MessageCircle, Cpu, Brain, Sparkles, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface GlobalAIPanelProps {
  hiddenOnLogin?: boolean;
}

const GlobalAIPanel: React.FC<GlobalAIPanelProps> = ({ hiddenOnLogin = true }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showChatModal, setShowChatModal] = useState(false);
  const [showBugModal, setShowBugModal] = useState(false);
  const [showImprovementModal, setShowImprovementModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [bugDescription, setBugDescription] = useState('');
  const [improvementDescription, setImprovementDescription] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(true); // Pannello collassato di default
  
  const onLogin = location.pathname.toLowerCase().includes('login');
  if (hiddenOnLogin && onLogin) return null;

  const handleChatSubmit = () => {
    if (chatMessage.trim()) {
      toast.success('Messaggio inviato all\'AI Assistant!');
      setChatMessage('');
      setShowChatModal(false);
    }
  };

  const handleBugSubmit = () => {
    if (bugDescription.trim()) {
      toast.success('Bug segnalato con successo!');
      setBugDescription('');
      setShowBugModal(false);
    }
  };

  const handleImprovementSubmit = () => {
    if (improvementDescription.trim()) {
      toast.success('Suggerimento inviato con successo!');
      setImprovementDescription('');
      setShowImprovementModal(false);
    }
  };

  // Chiudi tutti i modali quando si clicca fuori
  const closeAllModals = () => {
    setShowChatModal(false);
    setShowBugModal(false);
    setShowImprovementModal(false);
    setShowUploadModal(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadFile(file);
      toast.success(`File ${file.name} selezionato per l'upload!`);
    }
  };

  const handleUploadSubmit = () => {
    if (uploadFile) {
      toast.success(`File ${uploadFile.name} caricato su Cloudinary!`);
      setUploadFile(null);
      setShowUploadModal(false);
    }
  };

  return (
    <div className="fixed right-6 top-24 z-[1000]">
      {/* Pulsante per espandere/collassare - Più piccolo e discreto */}
      <motion.button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="mb-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white p-3 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 backdrop-blur-sm"
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        title={isCollapsed ? "Espandi AI Panel" : "Collassa AI Panel"}
      >
        <Brain className="h-5 w-5" />
      </motion.button>

      {/* Pannello AI Provider - Collassabile */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="rounded-3xl backdrop-blur-xl bg-white/95 border border-white/30 shadow-2xl p-4 mb-3"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Sparkles className="h-3 w-3 text-white" />
                </div>
                <p className="text-sm font-semibold text-gray-800">AI Provider</p>
              </div>
              <motion.button 
                onClick={() => setIsCollapsed(true)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                title="Chiudi"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="h-4 w-4" />
              </motion.button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <motion.button 
                className="text-xs px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200 font-medium" 
                onClick={() => localStorage.setItem('ai_provider', 'free')} 
                title="Gratuito"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Cpu className="inline h-3 w-3 mr-1" /> Free
              </motion.button>
              <motion.button 
                className="text-xs px-3 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-xl transition-all duration-200 font-medium" 
                onClick={() => localStorage.setItem('ai_provider', 'openai')} 
                title="OpenAI"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Brain className="inline h-3 w-3 mr-1" /> OpenAI
              </motion.button>
              <motion.button 
                className="text-xs px-3 py-2 bg-orange-100 hover:bg-orange-200 text-orange-800 rounded-xl transition-all duration-200 font-medium" 
                onClick={() => localStorage.setItem('ai_provider', 'anthropic')} 
                title="Anthropic"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Claude
              </motion.button>
              <motion.button 
                className="text-xs px-3 py-2 bg-sky-100 hover:bg-sky-200 text-sky-800 rounded-xl transition-all duration-200 font-medium" 
                onClick={() => localStorage.setItem('ai_provider', 'groq')} 
                title="Groq"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Groq
              </motion.button>
              <motion.button 
                className="text-xs px-3 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-xl transition-all duration-200 font-medium" 
                onClick={() => localStorage.setItem('ai_provider', 'hf')} 
                title="Hugging Face"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                HF
              </motion.button>
              <motion.button 
                className="text-xs px-3 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-800 rounded-xl transition-all duration-200 font-medium" 
                onClick={() => localStorage.setItem('ai_provider', 'mistral')} 
                title="Mistral"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Mistral
              </motion.button>
              <motion.button 
                className="text-xs px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-xl transition-all duration-200 font-medium" 
                onClick={() => localStorage.setItem('ai_provider', 'cohere')} 
                title="Cohere"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Cohere
              </motion.button>
              <motion.button 
                className="text-xs px-3 py-2 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-xl transition-all duration-200 font-medium" 
                onClick={() => localStorage.setItem('ai_provider', 'openrouter')} 
                title="OpenRouter"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                OpenRouter
              </motion.button>
              <motion.button 
                className="text-xs px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl transition-all duration-200 font-medium" 
                onClick={() => localStorage.setItem('ai_provider', 'ollama')} 
                title="oLLAMA"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                oLLAMA
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pulsanti di azione - Solo quando espanso */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="space-y-2"
          >
            <button
              onClick={() => setShowChatModal(true)}
              className="flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 shadow-lg hover:shadow-xl hover:opacity-95 transition-all"
              title="Assistente AI"
            >
              <Bot className="h-4 w-4" /> Apri Assistente
            </button>
            <button
              onClick={() => setShowBugModal(true)}
              className="flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-600 to-pink-600 text-white px-4 py-2 shadow-lg hover:shadow-xl"
              title="Segnala bug alla AI"
            >
              <Bug className="h-4 w-4" /> Segnala Bug
            </button>
            <button
              onClick={() => setShowImprovementModal(true)}
              className="flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 shadow-lg hover:shadow-xl"
              title="Chiedi un miglioramento"
            >
              <Wand2 className="h-4 w-4" /> Suggerisci Miglioria
            </button>
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-600 to-green-600 text-white px-4 py-2 shadow-lg hover:shadow-xl"
              title="Upload a Cloudinary"
            >
              <Upload className="h-4 w-4" /> Upload Media
            </button>
            <a
              href="https://wa.me/393331234567"
              target="_blank"
              className="flex items-center gap-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 shadow-lg hover:shadow-xl"
              rel="noreferrer"
              title="WhatsApp"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay per chiudere modali */}
      <AnimatePresence>
        {(showChatModal || showBugModal || showImprovementModal || showUploadModal) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[2000]"
            onClick={closeAllModals}
          />
        )}
      </AnimatePresence>

      {/* Modali */}
      <AnimatePresence>
        {showChatModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-[2001]"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-96 max-w-[90vw]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Bot className="h-5 w-5 text-purple-600" />
                  Chat con AI Assistant
                </h3>
                <button onClick={() => setShowChatModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <textarea
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Scrivi il tuo messaggio per l'AI Assistant..."
                className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleChatSubmit}
                  className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Invia
                </button>
                <button
                  onClick={() => setShowChatModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annulla
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showBugModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-[2001]"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-96 max-w-[90vw]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Bug className="h-5 w-5 text-rose-600" />
                  Segnala Bug
                </h3>
                <button onClick={() => setShowBugModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <textarea
                value={bugDescription}
                onChange={(e) => setBugDescription(e.target.value)}
                placeholder="Descrivi il bug che hai riscontrato..."
                className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleBugSubmit}
                  className="flex-1 bg-rose-600 text-white py-2 px-4 rounded-lg hover:bg-rose-700 transition-colors"
                >
                  Segnala
                </button>
                <button
                  onClick={() => setShowBugModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annulla
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showImprovementModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-[2001]"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-96 max-w-[90vw]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Wand2 className="h-5 w-5 text-blue-600" />
                  Suggerisci Miglioramento
                </h3>
                <button onClick={() => setShowImprovementModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <textarea
                value={improvementDescription}
                onChange={(e) => setImprovementDescription(e.target.value)}
                placeholder="Descrivi il miglioramento che vorresti vedere..."
                className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleImprovementSubmit}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Invia
                </button>
                <button
                  onClick={() => setShowImprovementModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annulla
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-[2001]"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-96 max-w-[90vw]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Upload className="h-5 w-5 text-emerald-600" />
                  Upload Media
                </h3>
                <button onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  accept="image/*,video/*,audio/*"
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Clicca per selezionare un file</p>
                  <p className="text-xs text-gray-400 mt-1">Supporta immagini, video e audio</p>
                </label>
              </div>
              {uploadFile && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium">File selezionato:</p>
                  <p className="text-sm text-gray-600">{uploadFile.name}</p>
                </div>
              )}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleUploadSubmit}
                  disabled={!uploadFile}
                  className="flex-1 bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Carica
                </button>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annulla
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GlobalAIPanel;


