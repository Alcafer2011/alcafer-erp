import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Calendar, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface EnhancedLoginFormProps {
  onSuccess: () => void;
}

const EnhancedLoginForm: React.FC<EnhancedLoginFormProps> = ({ onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [securityLevel, setSecurityLevel] = useState(0);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nome: '',
    cognome: '',
    dataNascita: '',
    confirmPassword: '',
  });

  // Calcola livello di sicurezza password
  useEffect(() => {
    const calculateSecurity = () => {
      let level = 0;
      const password = formData.password;
      
      if (password.length >= 8) level += 20;
      if (password.length >= 12) level += 10;
      if (/[A-Z]/.test(password)) level += 20;
      if (/[a-z]/.test(password)) level += 20;
      if (/[0-9]/.test(password)) level += 15;
      if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) level += 15;
      
      setSecurityLevel(Math.min(level, 100));
    };
    
    if (!isLogin) calculateSecurity();
  }, [formData.password, isLogin]);

  const generateSecurePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*';
    let password = '';
    
    // Assicura diversità caratteri
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
    password += '0123456789'[Math.floor(Math.random() * 10)];
    password += '!@#$%&*'[Math.floor(Math.random() * 7)];
    
    for (let i = 4; i < 12; i++) {
      password += chars[Math.floor(Math.random() * chars.length)];
    }
    
    return password.split('').sort(() => Math.random() - 0.5).join('');
  };

  const validateUserAuthorization = (nome: string, cognome: string) => {
    const nomeNormalized = nome.toLowerCase().trim();
    const cognomeNormalized = cognome.toLowerCase().trim();
    
    const authorizedUsers = [
      { 
        names: ['alessandro'], 
        surnames: ['calabria'], 
        role: 'alessandro' 
      },
      { 
        names: ['gabriel', 'gabriele'], 
        surnames: ['prunaru'], 
        role: 'gabriel' 
      },
      { 
        names: ['hanna', 'anna'], 
        surnames: ['mazhar'], 
        role: 'hanna' 
      }
    ];
    
    return authorizedUsers.find(user => 
      user.names.some(name => nomeNormalized.includes(name)) && 
      user.surnames.some(surname => cognomeNormalized.includes(surname))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // LOGIN
        console.log('🔐 Tentativo di login per:', formData.email);
        
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) {
          // Gestione errori specifici
          if (error.message.includes('Invalid login credentials')) {
            throw new Error('❌ Email o password non corretti. Verifica i tuoi dati di accesso.');
          } else if (error.message.includes('Email not confirmed')) {
            throw new Error('❌ Email non confermata. Controlla la tua casella di posta e clicca sul link di conferma.');
          } else if (error.message.includes('Too many requests')) {
            throw new Error('❌ Troppi tentativi di accesso. Riprova tra qualche minuto.');
          } else {
            throw new Error(`❌ Errore di accesso: ${error.message}`);
          }
        }
        
        console.log('✅ Login completato con successo');
        toast.success('🎉 Accesso effettuato con successo!');
        onSuccess();
      } else {
        // REGISTRAZIONE DIRETTA SENZA EMAIL DI CONFERMA
        console.log('📝 Registrazione diretta per:', formData.email);
        
        // Validazioni
        const userAuth = validateUserAuthorization(formData.nome, formData.cognome);
        if (!userAuth) {
          throw new Error('❌ Utente non autorizzato alla registrazione. Contattare l\'amministratore.');
        }

        if (formData.password !== formData.confirmPassword) {
          throw new Error('❌ Le password non coincidono');
        }

        if (securityLevel < 60) {
          throw new Error('❌ Password non sufficientemente sicura (minimo 60%)');
        }

        // REGISTRAZIONE DIRETTA SU SUPABASE (SENZA EMAIL DI CONFERMA)
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: undefined, // Disabilita redirect email
            data: {
              nome: formData.nome,
              cognome: formData.cognome,
              data_nascita: formData.dataNascita,
              ruolo: userAuth.role,
            }
          }
        });

        if (authError) {
          if (authError.message.includes('User already registered')) {
            throw new Error('❌ Questo indirizzo email è già registrato. Prova ad effettuare il login.');
          } else if (authError.message.includes('Password should be at least')) {
            throw new Error('❌ La password deve essere di almeno 6 caratteri.');
          } else {
            throw new Error(`❌ Errore durante la registrazione: ${authError.message}`);
          }
        }

        if (authData.user) {
          console.log('✅ Utente creato su Supabase:', authData.user.id);

          // Crea IMMEDIATAMENTE il profilo utente
          const { error: profileError } = await supabase
            .from('users')
            .insert([{
              id: authData.user.id,
              email: formData.email,
              nome: formData.nome,
              cognome: formData.cognome,
              data_nascita: formData.dataNascita,
              ruolo: userAuth.role,
            }]);

          if (profileError) {
            console.error('Errore nella creazione del profilo:', profileError);
            // Non bloccare il processo se il profilo esiste già
            if (!profileError.message.includes('duplicate key')) {
              throw profileError;
            }
          }

          // ACCESSO IMMEDIATO - Nessuna conferma email richiesta
          console.log('✅ Registrazione e accesso immediato completati');
          
          toast.success('🎉 Registrazione completata! Benvenuto in Alcafer ERP!', {
            duration: 6000,
          });

          // Reset form
          setFormData({
            email: '', password: '', nome: '', cognome: '', 
            dataNascita: '', confirmPassword: ''
          });

          onSuccess();
        }
      }
    } catch (error: any) {
      console.error('❌ Errore:', error);
      toast.error(error.message || 'Errore durante l\'operazione');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePassword = () => {
    const newPassword = generateSecurePassword();
    setFormData(prev => ({ 
      ...prev, 
      password: newPassword,
      confirmPassword: newPassword
    }));
    
    navigator.clipboard.writeText(newPassword);
    toast.success('Password generata e copiata negli appunti!');
  };

  const getSecurityColor = () => {
    if (securityLevel >= 80) return 'bg-green-500';
    if (securityLevel >= 60) return 'bg-yellow-500';
    if (securityLevel >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getSecurityLabel = () => {
    if (securityLevel >= 80) return 'Sicurezza Ottima 🛡️';
    if (securityLevel >= 60) return 'Sicurezza Buona 🔒';
    if (securityLevel >= 40) return 'Sicurezza Media ⚠️';
    return 'Sicurezza Bassa ❌';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 text-white text-center relative">
          <div className="absolute top-4 right-4">
            <Shield className="h-6 w-6 text-blue-200" />
          </div>
          <h1 className="text-2xl font-bold">Alcafer & Gabifer ERP</h1>
          <p className="text-blue-100 mt-1">Sistema di Gestione Aziendale</p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="text-xs">🔐 Accesso Diretto</span>
          </div>
        </div>

        <div className="p-6">
          {/* Toggle Login/Registrazione */}
          <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 text-center font-medium rounded-md transition-all ${
                isLogin 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Accesso
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 text-center font-medium rounded-md transition-all ${
                !isLogin 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Registrazione
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="nome@alcafer.com"
                />
              </div>
            </div>

            {/* Campi registrazione */}
            {!isLogin && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        required
                        value={formData.nome}
                        onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Nome"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cognome *</label>
                    <input
                      type="text"
                      required
                      value={formData.cognome}
                      onChange={(e) => setFormData(prev => ({ ...prev, cognome: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Cognome"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data di Nascita *</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="date"
                      required
                      value={formData.dataNascita}
                      onChange={(e) => setFormData(prev => ({ ...prev, dataNascita: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password {!isLogin && '(minimo 8 caratteri)'}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Password"
                  minLength={isLogin ? 1 : 8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              
              {!isLogin && (
                <>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    🎲 Genera Password Sicura
                  </button>
                  
                  {formData.password && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Livello Sicurezza</span>
                        <span className="text-sm font-bold text-gray-900">{securityLevel}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${getSecurityColor()}`}
                          style={{ width: `${securityLevel}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600">{getSecurityLabel()}</span>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Conferma password per registrazione */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Conferma Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ripeti la password"
                  />
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">Le password non coincidono</p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || (!isLogin && securityLevel < 60)}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {isLogin ? 'Accesso...' : 'Registrazione...'}
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Shield className="h-4 w-4" />
                  {isLogin ? 'Accedi' : 'Registrati'}
                </div>
              )}
            </button>
          </form>

          {/* Info sistema */}
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Accesso Diretto</span>
            </div>
            <ul className="text-xs text-green-700 space-y-1">
              <li>• ✅ Registrazione immediata senza conferma email</li>
              <li>• 🔒 Autenticazione sicura con Supabase</li>
              <li>• 👥 Accesso limitato a utenti autorizzati</li>
              <li>• 🛡️ Password sicure obbligatorie</li>
            </ul>
          </div>

          {/* Suggerimenti per il login */}
          {isLogin && (
            <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-800">Problemi di accesso?</span>
              </div>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Verifica email e password</li>
                <li>• Assicurati di aver completato la registrazione</li>
                <li>• Contatta l'amministratore se necessario</li>
              </ul>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default EnhancedLoginForm;