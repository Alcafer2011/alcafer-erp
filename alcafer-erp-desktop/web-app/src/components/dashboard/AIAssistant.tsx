import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Send, X, Maximize2, Minimize2, Zap, MessageSquare, Lightbulb, Sparkles } from 'lucide-react';
import { aiService } from '../../services/aiService';
import { useAuth } from '../../hooks/useAuth';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [aiModel, setAiModel] = useState<'gemini' | 'ollama' | 'huggingface'>('gemini');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { userProfile } = useAuth();

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Initial greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const initialMessage: Message = {
        id: Date.now().toString(),
        text: `Ciao ${userProfile?.nome || 'utente'}! Sono l'assistente AI di Alcafer ERP. Come posso aiutarti oggi?`,
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages([initialMessage]);
    }
  }, [isOpen, messages.length, userProfile?.nome]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsTyping(true);
    
    try {
      // Get AI response
      const context = {
        userId: userProfile?.id,
        userRole: userProfile?.ruolo,
        previousMessages: messages.slice(-5)
      };
      
      const response = await aiService.chatWithAI(message, context);
      
      // Add AI message with typing effect
      setTimeout(() => {
        const aiMessage: Message = {
          id: Date.now().toString(),
          text: response,
          sender: 'ai',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, aiMessage]);
        setIsTyping(false);
      }, 1000);
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: 'Mi dispiace, ho avuto un problema nel processare la tua richiesta. Puoi riprovare?',
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const switchAiModel = (model: 'gemini' | 'ollama' | 'huggingface') => {
    setAiModel(model);
    
    const switchMessage: Message = {
      id: Date.now().toString(),
      text: `Modello AI cambiato a ${model === 'gemini' ? 'Google Gemini' : model === 'ollama' ? 'Ollama (locale)' : 'Hugging Face'}`,
      sender: 'ai',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, switchMessage]);
  };

  if (!isOpen) {
    return (
      <motion.button
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-50"
        onClick={() => setIsOpen(true)}
      >
        <Brain className="h-6 w-6" />
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ 
        opacity: 1, 
        y: 0, 
        scale: 1,
        height: isMinimized ? 'auto' : '500px',
        width: isMinimized ? 'auto' : '380px'
      }}
      transition={{ duration: 0.2 }}
      className={`fixed bottom-6 right-6 bg-white rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden border border-gray-200`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          <h3 className="font-medium">Assistente AI Alcafer</h3>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={toggleMinimize}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </button>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex-1 overflow-hidden flex flex-col"
          >
            {/* AI Model Selector */}
            <div className="flex border-b border-gray-200 bg-gray-50 p-2">
              <button
                onClick={() => switchAiModel('gemini')}
                className={`flex-1 text-xs py-1 px-2 rounded-l-md ${
                  aiModel === 'gemini' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center justify-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  <span>Gemini</span>
                </div>
              </button>
              <button
                onClick={() => switchAiModel('ollama')}
                className={`flex-1 text-xs py-1 px-2 ${
                  aiModel === 'ollama' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center justify-center gap-1">
                  <Brain className="h-3 w-3" />
                  <span>Ollama</span>
                </div>
              </button>
              <button
                onClick={() => switchAiModel('huggingface')}
                className={`flex-1 text-xs py-1 px-2 rounded-r-md ${
                  aiModel === 'huggingface' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="flex items-center justify-center gap-1">
                  <Lightbulb className="h-3 w-3" />
                  <span>HF</span>
                </div>
              </button>
            </div>
            
            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        msg.sender === 'user'
                          ? 'bg-purple-600 text-white'
                          : 'bg-white border border-gray-200 text-gray-800'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </motion.div>
                ))}
                
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="bg-white border border-gray-200 rounded-lg p-3 max-w-[80%]">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input */}
            <div className="p-3 border-t border-gray-200 bg-white">
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Chiedi all'AI..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    rows={1}
                    disabled={isTyping}
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!message.trim() || isTyping}
                  className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-purple-300"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  Powered by Alcafer AI
                </div>
                <div className="text-xs text-purple-600 flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  Assistente Privato
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AIAssistant;
