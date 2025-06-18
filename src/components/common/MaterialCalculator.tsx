import React, { useState, useEffect } from 'react';
import { Calculator, RefreshCw, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface MaterialCalculatorProps {
  materiali: any[];
  pesoMateriali: any;
  onAddMaterial?: (material: { tipo: string; peso: number; prezzo: number }) => void;
}

const MaterialCalculator: React.FC<MaterialCalculatorProps> = ({ materiali, pesoMateriali, onAddMaterial }) => {
  const [tipoMateriale, setTipoMateriale] = useState('');
  const [diametro, setDiametro] = useState<number>(10);
  const [lunghezza, setLunghezza] = useState<number>(100);
  const [quantita, setQuantita] = useState<number>(1);
  const [forma, setForma] = useState<'barra' | 'tubo' | 'lamiera'>('barra');
  const [spessore, setSpessore] = useState<number>(1);
  const [larghezza, setLarghezza] = useState<number>(100);
  const [risultato, setRisultato] = useState<{
    peso: number;
    prezzo: number;
    totale: number;
  } | null>(null);

  const calcolaPeso = () => {
    if (!tipoMateriale) {
      toast.error('Seleziona un tipo di materiale');
      return;
    }

    const materialInfo = pesoMateriali[tipoMateriale];
    if (!materialInfo) {
      toast.error('Informazioni sul materiale non disponibili');
      return;
    }

    const prezzoMateriale = materiali.find(m => m.tipo_materiale === tipoMateriale);
    if (!prezzoMateriale) {
      toast.error('Prezzo del materiale non disponibile');
      return;
    }

    let peso = 0;
    
    if (forma === 'barra') {
      // Formula: volume (dm³) * densità (kg/dm³)
      // Volume cilindro: π * r² * h
      const raggio = diametro / 20; // da mm a dm e diviso 2 per avere il raggio
      const lunghezzaDm = lunghezza / 10; // da cm a dm
      const volume = Math.PI * raggio * raggio * lunghezzaDm;
      peso = volume * materialInfo.densita * quantita;
    } 
    else if (forma === 'tubo') {
      // Formula per tubo: π * (R² - r²) * h * densità
      const raggioEsterno = diametro / 20; // da mm a dm e diviso 2
      const raggioInterno = (diametro - 2 * spessore) / 20; // da mm a dm e diviso 2
      const lunghezzaDm = lunghezza / 10; // da cm a dm
      const volume = Math.PI * (raggioEsterno * raggioEsterno - raggioInterno * raggioInterno) * lunghezzaDm;
      peso = volume * materialInfo.densita * quantita;
    }
    else if (forma === 'lamiera') {
      // Formula per lamiera: lunghezza * larghezza * spessore * densità
      const lunghezzaDm = lunghezza / 10; // da cm a dm
      const larghezzaDm = larghezza / 10; // da cm a dm
      const spessoreDm = spessore / 100; // da mm a dm
      const volume = lunghezzaDm * larghezzaDm * spessoreDm;
      peso = volume * materialInfo.densita * quantita;
    }

    // Arrotonda a 3 decimali
    peso = Math.round(peso * 1000) / 1000;
    
    const prezzo = prezzoMateriale.prezzo_kg;
    const totale = Math.round(peso * prezzo * 100) / 100;
    
    setRisultato({ peso, prezzo, totale });
  };

  const handleAddMaterial = () => {
    if (risultato && onAddMaterial) {
      onAddMaterial({
        tipo: tipoMateriale,
        peso: risultato.peso,
        prezzo: risultato.prezzo
      });
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-orange-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-orange-600" />
          <h3 className="text-lg font-semibold text-gray-900">Calcolatore Peso Materiali</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="tipoMateriale" className="block text-sm font-medium text-gray-700 mb-1">
              Tipo Materiale
            </label>
            <select
              id="tipoMateriale"
              value={tipoMateriale}
              onChange={(e) => setTipoMateriale(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Seleziona materiale</option>
              {materiali.map(materiale => (
                <option key={materiale.id} value={materiale.tipo_materiale}>
                  {materiale.tipo_materiale} - €{materiale.prezzo_kg.toFixed(3)}/kg
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="forma" className="block text-sm font-medium text-gray-700 mb-1">
              Forma
            </label>
            <select
              id="forma"
              value={forma}
              onChange={(e) => setForma(e.target.value as 'barra' | 'tubo' | 'lamiera')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="barra">Barra tonda</option>
              <option value="tubo">Tubo</option>
              <option value="lamiera">Lamiera</option>
            </select>
          </div>

          {forma === 'barra' && (
            <>
              <div>
                <label htmlFor="diametro" className="block text-sm font-medium text-gray-700 mb-1">
                  Diametro (mm)
                </label>
                <input
                  type="number"
                  id="diametro"
                  value={diametro}
                  onChange={(e) => setDiametro(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  min="1"
                  step="0.1"
                />
              </div>

              <div>
                <label htmlFor="lunghezza" className="block text-sm font-medium text-gray-700 mb-1">
                  Lunghezza (cm)
                </label>
                <input
                  type="number"
                  id="lunghezza"
                  value={lunghezza}
                  onChange={(e) => setLunghezza(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  min="1"
                  step="0.1"
                />
              </div>
            </>
          )}

          {forma === 'tubo' && (
            <>
              <div>
                <label htmlFor="diametro" className="block text-sm font-medium text-gray-700 mb-1">
                  Diametro esterno (mm)
                </label>
                <input
                  type="number"
                  id="diametro"
                  value={diametro}
                  onChange={(e) => setDiametro(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  min="1"
                  step="0.1"
                />
              </div>

              <div>
                <label htmlFor="spessore" className="block text-sm font-medium text-gray-700 mb-1">
                  Spessore (mm)
                </label>
                <input
                  type="number"
                  id="spessore"
                  value={spessore}
                  onChange={(e) => setSpessore(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  min="0.1"
                  max={diametro / 2 - 0.1}
                  step="0.1"
                />
              </div>

              <div>
                <label htmlFor="lunghezza" className="block text-sm font-medium text-gray-700 mb-1">
                  Lunghezza (cm)
                </label>
                <input
                  type="number"
                  id="lunghezza"
                  value={lunghezza}
                  onChange={(e) => setLunghezza(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  min="1"
                  step="0.1"
                />
              </div>
            </>
          )}

          {forma === 'lamiera' && (
            <>
              <div>
                <label htmlFor="lunghezza" className="block text-sm font-medium text-gray-700 mb-1">
                  Lunghezza (cm)
                </label>
                <input
                  type="number"
                  id="lunghezza"
                  value={lunghezza}
                  onChange={(e) => setLunghezza(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  min="1"
                  step="0.1"
                />
              </div>

              <div>
                <label htmlFor="larghezza" className="block text-sm font-medium text-gray-700 mb-1">
                  Larghezza (cm)
                </label>
                <input
                  type="number"
                  id="larghezza"
                  value={larghezza}
                  onChange={(e) => setLarghezza(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  min="1"
                  step="0.1"
                />
              </div>

              <div>
                <label htmlFor="spessore" className="block text-sm font-medium text-gray-700 mb-1">
                  Spessore (mm)
                </label>
                <input
                  type="number"
                  id="spessore"
                  value={spessore}
                  onChange={(e) => setSpessore(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  min="0.1"
                  step="0.1"
                />
              </div>
            </>
          )}

          <div>
            <label htmlFor="quantita" className="block text-sm font-medium text-gray-700 mb-1">
              Quantità (pezzi)
            </label>
            <input
              type="number"
              id="quantita"
              value={quantita}
              onChange={(e) => setQuantita(parseInt(e.target.value) || 1)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              min="1"
              step="1"
            />
          </div>

          <button
            onClick={calcolaPeso}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Calculator className="h-4 w-4" />
            Calcola Peso e Prezzo
          </button>
        </div>

        <div>
          {risultato ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-6 border border-orange-200 h-full flex flex-col"
            >
              <h4 className="text-lg font-semibold text-orange-900 mb-4">Risultato Calcolo</h4>
              
              <div className="space-y-6 flex-1">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-sm text-orange-600 mb-1">Peso Totale</p>
                    <p className="text-2xl font-bold text-orange-900">{risultato.peso.toFixed(3)} kg</p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-sm text-orange-600 mb-1">Prezzo al kg</p>
                    <p className="text-2xl font-bold text-orange-900">€{risultato.prezzo.toFixed(3)}</p>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-sm text-orange-600 mb-1">Importo Totale</p>
                  <p className="text-3xl font-bold text-orange-900">€{risultato.totale.toFixed(2)}</p>
                  <p className="text-xs text-orange-500 mt-1">
                    {quantita} {quantita === 1 ? 'pezzo' : 'pezzi'} di {tipoMateriale}
                  </p>
                </div>
                
                <div className="bg-orange-100 p-4 rounded-lg">
                  <h5 className="text-sm font-medium text-orange-800 mb-2">Dettagli Materiale</h5>
                  <ul className="text-sm text-orange-700 space-y-1">
                    <li><span className="font-medium">Materiale:</span> {tipoMateriale}</li>
                    <li><span className="font-medium">Forma:</span> {forma === 'barra' ? 'Barra tonda' : forma === 'tubo' ? 'Tubo' : 'Lamiera'}</li>
                    {forma === 'barra' && (
                      <>
                        <li><span className="font-medium">Diametro:</span> {diametro} mm</li>
                        <li><span className="font-medium">Lunghezza:</span> {lunghezza} cm</li>
                      </>
                    )}
                    {forma === 'tubo' && (
                      <>
                        <li><span className="font-medium">Diametro esterno:</span> {diametro} mm</li>
                        <li><span className="font-medium">Spessore:</span> {spessore} mm</li>
                        <li><span className="font-medium">Lunghezza:</span> {lunghezza} cm</li>
                      </>
                    )}
                    {forma === 'lamiera' && (
                      <>
                        <li><span className="font-medium">Dimensioni:</span> {lunghezza}x{larghezza} cm</li>
                        <li><span className="font-medium">Spessore:</span> {spessore} mm</li>
                      </>
                    )}
                    <li><span className="font-medium">Quantità:</span> {quantita} {quantita === 1 ? 'pezzo' : 'pezzi'}</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => setRisultato(null)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  <RefreshCw className="h-4 w-4 inline mr-2" />
                  Nuovo Calcolo
                </button>
                
                {onAddMaterial && (
                  <button
                    onClick={handleAddMaterial}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    <Check className="h-4 w-4 inline mr-2" />
                    Usa Materiale
                  </button>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="bg-orange-50 rounded-lg p-6 border border-orange-200 h-full">
              <h4 className="text-lg font-semibold text-orange-900 mb-4">Informazioni Calcolo</h4>
              
              <div className="space-y-4">
                <p className="text-sm text-orange-700">
                  Questo calcolatore ti permette di determinare il peso e il costo dei materiali metallici in base alle dimensioni.
                </p>
                
                <div className="bg-white p-4 rounded-lg">
                  <h5 className="text-sm font-medium text-orange-800 mb-2">Istruzioni</h5>
                  <ol className="text-sm text-orange-700 space-y-1 list-decimal list-inside">
                    <li>Seleziona il tipo di materiale</li>
                    <li>Scegli la forma (barra, tubo o lamiera)</li>
                    <li>Inserisci le dimensioni</li>
                    <li>Specifica la quantità</li>
                    <li>Clicca su "Calcola Peso e Prezzo"</li>
                  </ol>
                </div>
                
                <div className="bg-white p-4 rounded-lg">
                  <h5 className="text-sm font-medium text-orange-800 mb-2">Formule Utilizzate</h5>
                  <ul className="text-sm text-orange-700 space-y-1">
                    <li><span className="font-medium">Barra:</span> π × r² × lunghezza × densità</li>
                    <li><span className="font-medium">Tubo:</span> π × (R² - r²) × lunghezza × densità</li>
                    <li><span className="font-medium">Lamiera:</span> lunghezza × larghezza × spessore × densità</li>
                  </ul>
                </div>
                
                <p className="text-xs text-orange-500 italic">
                  Nota: I risultati sono approssimativi e possono variare leggermente rispetto ai pesi reali.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MaterialCalculator;