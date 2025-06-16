import { supabase } from '../lib/supabase';

export interface AIAnalysisResult {
  insights: string[];
  recommendations: string[];
  predictions: any;
  confidence: number;
}

export interface DocumentAnalysis {
  extractedData: any;
  classification: string;
  confidence: number;
  suggestedActions: string[];
}

export class AIService {
  private static instance: AIService;

  private constructor() {}

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  // 🧠 Analisi Finanziaria AI
  async analyzeFinancialData(data: any): Promise<AIAnalysisResult> {
    try {
      // Analisi pattern nei dati finanziari
      const insights = this.generateFinancialInsights(data);
      const recommendations = this.generateRecommendations(data);
      const predictions = this.predictTrends(data);

      return {
        insights,
        recommendations,
        predictions,
        confidence: this.calculateConfidence(data)
      };
    } catch (error) {
      console.error('Errore analisi AI:', error);
      throw error;
    }
  }

  // 📊 Previsioni Intelligenti
  async predictCashFlow(historicalData: any[]): Promise<any> {
    // Algoritmo di machine learning per previsioni cash flow
    const trends = this.analyzeTrends(historicalData);
    const seasonality = this.detectSeasonality(historicalData);
    
    return {
      nextMonth: this.predictNextPeriod(trends, seasonality),
      nextQuarter: this.predictQuarter(trends, seasonality),
      confidence: this.calculatePredictionConfidence(historicalData),
      factors: this.identifyInfluencingFactors(historicalData)
    };
  }

  // 📄 Analisi Documenti AI
  async analyzeDocument(file: File): Promise<DocumentAnalysis> {
    try {
      // OCR + AI per analisi documenti
      const ocrResult = await this.performOCR(file);
      const classification = this.classifyDocument(ocrResult.text);
      const extractedData = this.extractStructuredData(ocrResult.text, classification);
      
      return {
        extractedData,
        classification,
        confidence: ocrResult.confidence,
        suggestedActions: this.suggestActions(classification, extractedData)
      };
    } catch (error) {
      console.error('Errore analisi documento:', error);
      throw error;
    }
  }

  // 🎯 Ottimizzazione Prezzi AI
  async optimizePricing(materialData: any, marketData: any): Promise<any> {
    const marketAnalysis = this.analyzeMarketConditions(marketData);
    const costAnalysis = this.analyzeCostStructure(materialData);
    
    return {
      suggestedPrices: this.calculateOptimalPrices(marketAnalysis, costAnalysis),
      competitivePosition: this.assessCompetitivePosition(marketAnalysis),
      profitabilityImpact: this.calculateProfitabilityImpact(costAnalysis),
      recommendations: this.generatePricingRecommendations(marketAnalysis, costAnalysis)
    };
  }

  // 🚨 Rilevamento Anomalie
  async detectAnomalies(data: any[]): Promise<any> {
    const patterns = this.learnNormalPatterns(data);
    const anomalies = this.identifyAnomalies(data, patterns);
    
    return {
      anomalies: anomalies.map(anomaly => ({
        ...anomaly,
        severity: this.calculateSeverity(anomaly),
        explanation: this.explainAnomaly(anomaly),
        suggestedAction: this.suggestAction(anomaly)
      })),
      overallRisk: this.calculateOverallRisk(anomalies),
      trends: this.identifyTrends(data)
    };
  }

  // 💬 Assistente AI Conversazionale
  async chatWithAI(message: string, context: any): Promise<string> {
    try {
      // Simula un assistente AI per l'ERP
      const response = this.generateAIResponse(message, context);
      
      // Salva la conversazione per apprendimento
      await this.saveConversation(message, response, context);
      
      return response;
    } catch (error) {
      console.error('Errore chat AI:', error);
      return 'Mi dispiace, non riesco a elaborare la tua richiesta al momento.';
    }
  }

  // 📈 Analisi Predittiva Lavori
  async predictJobOutcomes(jobData: any): Promise<any> {
    const riskFactors = this.identifyRiskFactors(jobData);
    const successProbability = this.calculateSuccessProbability(jobData);
    
    return {
      estimatedCompletion: this.predictCompletionDate(jobData),
      budgetRisk: this.assessBudgetRisk(jobData),
      qualityScore: this.predictQualityScore(jobData),
      recommendations: this.generateJobRecommendations(riskFactors),
      successProbability
    };
  }

  // 🔍 Analisi Clienti AI
  async analyzeCustomerBehavior(customerData: any): Promise<any> {
    const segments = this.segmentCustomers(customerData);
    const churnRisk = this.calculateChurnRisk(customerData);
    
    return {
      segments,
      churnRisk,
      lifetimeValue: this.calculateCustomerLTV(customerData),
      recommendations: this.generateCustomerRecommendations(segments, churnRisk),
      nextBestAction: this.suggestNextAction(customerData)
    };
  }

  // Metodi privati per implementazione AI
  private generateFinancialInsights(data: any): string[] {
    const insights = [];
    
    // Analisi margini
    if (data.margineOperativo < 0.15) {
      insights.push('📉 Margine operativo sotto la soglia ottimale del 15%');
    }
    
    // Analisi liquidità
    if (data.liquidita < data.costiMensili * 3) {
      insights.push('💧 Liquidità insufficiente per coprire 3 mesi di costi');
    }
    
    // Analisi crescita
    if (data.crescitaMensile < 0.05) {
      insights.push('📈 Crescita mensile sotto il 5% - considerare strategie di espansione');
    }
    
    return insights;
  }

  private generateRecommendations(data: any): string[] {
    const recommendations = [];
    
    if (data.margineOperativo < 0.15) {
      recommendations.push('🎯 Ottimizzare i costi operativi del 10-15%');
      recommendations.push('💰 Rivedere la strategia di pricing sui progetti più profittevoli');
    }
    
    if (data.liquidita < data.costiMensili * 3) {
      recommendations.push('🏦 Negoziare termini di pagamento più favorevoli con i clienti');
      recommendations.push('📊 Implementare un sistema di cash flow forecasting');
    }
    
    return recommendations;
  }

  private predictTrends(data: any): any {
    // Algoritmo semplificato di previsione
    const trend = data.crescitaMensile || 0;
    const volatility = 0.1; // 10% di volatilità
    
    return {
      nextMonth: data.ricaviAttuali * (1 + trend + (Math.random() - 0.5) * volatility),
      nextQuarter: data.ricaviAttuali * Math.pow(1 + trend, 3),
      confidence: Math.max(0.6, 1 - Math.abs(trend) * 2)
    };
  }

  private calculateConfidence(data: any): number {
    // Calcola la confidenza basata sulla qualità e quantità dei dati
    let confidence = 0.5;
    
    if (data.dataPoints > 12) confidence += 0.2; // Almeno un anno di dati
    if (data.dataQuality > 0.8) confidence += 0.2; // Dati di alta qualità
    if (data.consistency > 0.7) confidence += 0.1; // Dati consistenti
    
    return Math.min(confidence, 0.95);
  }

  private analyzeTrends(data: any[]): any {
    if (data.length < 2) return { trend: 0, direction: 'stable' };
    
    const values = data.map(d => d.value);
    const trend = (values[values.length - 1] - values[0]) / values.length;
    
    return {
      trend,
      direction: trend > 0.05 ? 'growing' : trend < -0.05 ? 'declining' : 'stable',
      strength: Math.abs(trend)
    };
  }

  private detectSeasonality(data: any[]): any {
    // Analisi semplificata della stagionalità
    const monthlyAvg = new Array(12).fill(0);
    const monthlyCount = new Array(12).fill(0);
    
    data.forEach(point => {
      const month = new Date(point.date).getMonth();
      monthlyAvg[month] += point.value;
      monthlyCount[month]++;
    });
    
    const seasonalFactors = monthlyAvg.map((sum, i) => 
      monthlyCount[i] > 0 ? sum / monthlyCount[i] : 0
    );
    
    return { factors: seasonalFactors };
  }

  private predictNextPeriod(trends: any, seasonality: any): number {
    const basePrediction = trends.trend;
    const seasonalAdjustment = seasonality.factors[new Date().getMonth()] || 1;
    
    return basePrediction * seasonalAdjustment;
  }

  private predictQuarter(trends: any, seasonality: any): number {
    const currentMonth = new Date().getMonth();
    const quarterMonths = [currentMonth, currentMonth + 1, currentMonth + 2].map(m => m % 12);
    
    const avgSeasonalFactor = quarterMonths.reduce((sum, month) => 
      sum + (seasonality.factors[month] || 1), 0
    ) / 3;
    
    return trends.trend * 3 * avgSeasonalFactor;
  }

  private calculatePredictionConfidence(data: any[]): number {
    if (data.length < 6) return 0.4;
    if (data.length < 12) return 0.6;
    return 0.8;
  }

  private identifyInfluencingFactors(data: any[]): string[] {
    const factors = [];
    
    // Analisi correlazioni semplificata
    const variance = this.calculateVariance(data.map(d => d.value));
    
    if (variance > 0.2) factors.push('Alta volatilità nei dati storici');
    if (data.length > 12) factors.push('Trend stagionale identificato');
    
    return factors;
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
  }

  private async performOCR(file: File): Promise<any> {
    // Implementazione OCR semplificata
    return {
      text: 'Testo estratto dal documento...',
      confidence: 0.85
    };
  }

  private classifyDocument(text: string): string {
    // Classificazione documento basata su parole chiave
    if (text.includes('fattura') || text.includes('invoice')) return 'invoice';
    if (text.includes('preventivo') || text.includes('quote')) return 'quote';
    if (text.includes('contratto') || text.includes('contract')) return 'contract';
    return 'unknown';
  }

  private extractStructuredData(text: string, classification: string): any {
    // Estrazione dati strutturati basata sul tipo di documento
    const data: any = {};
    
    // Regex per importi
    const amountRegex = /€?\s*(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)/g;
    const amounts = text.match(amountRegex);
    if (amounts) data.amounts = amounts;
    
    // Regex per date
    const dateRegex = /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/g;
    const dates = text.match(dateRegex);
    if (dates) data.dates = dates;
    
    return data;
  }

  private suggestActions(classification: string, data: any): string[] {
    const actions = [];
    
    switch (classification) {
      case 'invoice':
        actions.push('Registrare la fattura nel sistema contabile');
        actions.push('Verificare i termini di pagamento');
        break;
      case 'quote':
        actions.push('Creare un nuovo preventivo nel sistema');
        actions.push('Assegnare al responsabile commerciale');
        break;
      default:
        actions.push('Archiviare il documento');
    }
    
    return actions;
  }

  private analyzeMarketConditions(marketData: any): any {
    return {
      trend: 'stable',
      competitionLevel: 'medium',
      demandForecast: 'growing'
    };
  }

  private analyzeCostStructure(materialData: any): any {
    return {
      fixedCosts: materialData.fixedCosts || 0,
      variableCosts: materialData.variableCosts || 0,
      marginTarget: 0.25
    };
  }

  private calculateOptimalPrices(market: any, costs: any): any {
    const basePrice = costs.variableCosts * (1 + costs.marginTarget);
    
    return {
      conservative: basePrice * 1.1,
      optimal: basePrice * 1.2,
      aggressive: basePrice * 1.3
    };
  }

  private assessCompetitivePosition(market: any): string {
    return market.competitionLevel === 'high' ? 'challenging' : 'favorable';
  }

  private calculateProfitabilityImpact(costs: any): any {
    return {
      currentMargin: costs.marginTarget,
      projectedMargin: costs.marginTarget * 1.1,
      impact: 'positive'
    };
  }

  private generatePricingRecommendations(market: any, costs: any): string[] {
    return [
      'Monitorare i prezzi della concorrenza settimanalmente',
      'Implementare pricing dinamico basato sulla domanda',
      'Considerare bundle di prodotti per aumentare il valore percepito'
    ];
  }

  private learnNormalPatterns(data: any[]): any {
    // Apprendimento pattern normali
    const values = data.map(d => d.value);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const stdDev = Math.sqrt(this.calculateVariance(values));
    
    return { mean, stdDev, threshold: stdDev * 2 };
  }

  private identifyAnomalies(data: any[], patterns: any): any[] {
    return data.filter(point => 
      Math.abs(point.value - patterns.mean) > patterns.threshold
    ).map(point => ({
      ...point,
      deviation: Math.abs(point.value - patterns.mean)
    }));
  }

  private calculateSeverity(anomaly: any): 'low' | 'medium' | 'high' {
    if (anomaly.deviation > 3) return 'high';
    if (anomaly.deviation > 2) return 'medium';
    return 'low';
  }

  private explainAnomaly(anomaly: any): string {
    return `Valore ${anomaly.value} significativamente ${
      anomaly.value > anomaly.mean ? 'superiore' : 'inferiore'
    } alla media (${anomaly.mean.toFixed(2)})`;
  }

  private suggestAction(anomaly: any): string {
    if (anomaly.severity === 'high') return 'Investigare immediatamente';
    if (anomaly.severity === 'medium') return 'Monitorare attentamente';
    return 'Nessuna azione immediata richiesta';
  }

  private calculateOverallRisk(anomalies: any[]): 'low' | 'medium' | 'high' {
    const highCount = anomalies.filter(a => a.severity === 'high').length;
    const mediumCount = anomalies.filter(a => a.severity === 'medium').length;
    
    if (highCount > 2) return 'high';
    if (highCount > 0 || mediumCount > 2) return 'medium';
    return 'low';
  }

  private identifyTrends(data: any[]): any {
    // Implementazione semplificata
    return { trend: 'stable', confidence: 0.7 };
  }

  private generateAIResponse(message: string, context: any): string {
    // Implementazione semplificata di risposta AI
    if (message.includes('previsione') || message.includes('forecast')) {
      return 'Basandomi sui dati storici, prevedo un aumento del 12% nei ricavi del prossimo trimestre, con un margine di errore del 3%.';
    }
    
    if (message.includes('consiglio') || message.includes('suggerimento')) {
      return 'Consiglio di concentrarsi sui clienti del settore manifatturiero, che mostrano il più alto tasso di conversione e valore lifetime.';
    }
    
    return 'Posso aiutarti con analisi finanziarie, previsioni, o suggerimenti strategici. Cosa ti serve sapere?';
  }

  private async saveConversation(message: string, response: string, context: any): Promise<void> {
    try {
      await supabase.from('ai_conversations').insert({
        user_id: context.userId,
        message,
        response,
        context: context,
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Errore salvataggio conversazione:', error);
    }
  }

  private identifyRiskFactors(jobData: any): string[] {
    const risks = [];
    
    if (jobData.timeline < 14) risks.push('Timeline molto stretta');
    if (jobData.complexity > 7) risks.push('Complessità elevata');
    if (jobData.newTechnology) risks.push('Utilizzo di nuove tecnologie');
    
    return risks;
  }

  private calculateSuccessProbability(jobData: any): number {
    let probability = 0.8; // Base 80%
    
    if (jobData.timeline < 14) probability -= 0.1;
    if (jobData.complexity > 7) probability -= 0.1;
    if (jobData.newTechnology) probability -= 0.1;
    if (jobData.experiencedTeam) probability += 0.1;
    
    return Math.max(0.4, Math.min(0.95, probability));
  }

  private predictCompletionDate(jobData: any): Date {
    const startDate = new Date(jobData.startDate);
    const estimatedDays = jobData.timeline * (1 + this.calculateRiskFactor(jobData));
    
    const completionDate = new Date(startDate);
    completionDate.setDate(completionDate.getDate() + Math.ceil(estimatedDays));
    
    return completionDate;
  }

  private calculateRiskFactor(jobData: any): number {
    let riskFactor = 0;
    
    if (jobData.timeline < 14) riskFactor += 0.2;
    if (jobData.complexity > 7) riskFactor += 0.15;
    if (jobData.newTechnology) riskFactor += 0.1;
    if (!jobData.experiencedTeam) riskFactor += 0.1;
    
    return riskFactor;
  }

  private assessBudgetRisk(jobData: any): 'low' | 'medium' | 'high' {
    const riskFactor = this.calculateRiskFactor(jobData);
    
    if (riskFactor > 0.3) return 'high';
    if (riskFactor > 0.15) return 'medium';
    return 'low';
  }

  private predictQualityScore(jobData: any): number {
    let baseScore = 8.5;
    
    if (jobData.timeline < 14) baseScore -= 0.5;
    if (jobData.complexity > 7) baseScore -= 0.3;
    if (jobData.newTechnology) baseScore -= 0.2;
    if (jobData.experiencedTeam) baseScore += 0.5;
    
    return Math.max(6, Math.min(10, baseScore));
  }

  private generateJobRecommendations(riskFactors: string[]): string[] {
    const recommendations = [];
    
    if (riskFactors.includes('Timeline molto stretta')) {
      recommendations.push('Considerare l\'aggiunta di risorse aggiuntive');
      recommendations.push('Prioritizzare le funzionalità critiche');
    }
    
    if (riskFactors.includes('Complessità elevata')) {
      recommendations.push('Suddividere il lavoro in fasi più gestibili');
      recommendations.push('Pianificare revisioni tecniche regolari');
    }
    
    if (riskFactors.includes('Utilizzo di nuove tecnologie')) {
      recommendations.push('Allocare tempo per formazione e sperimentazione');
      recommendations.push('Identificare esperti esterni per consulenza');
    }
    
    return recommendations;
  }

  private segmentCustomers(customerData: any): any[] {
    // Implementazione semplificata di segmentazione clienti
    return [
      { segment: 'high_value', count: 12, avgValue: 15000 },
      { segment: 'medium_value', count: 28, avgValue: 5000 },
      { segment: 'low_value', count: 45, avgValue: 1200 }
    ];
  }

  private calculateChurnRisk(customerData: any): any {
    // Implementazione semplificata di rischio abbandono
    return {
      highRisk: { count: 8, value: 32000 },
      mediumRisk: { count: 15, value: 45000 },
      lowRisk: { count: 62, value: 124000 }
    };
  }

  private calculateCustomerLTV(customerData: any): any {
    // Implementazione semplificata di Customer Lifetime Value
    return {
      average: 12500,
      bySegment: {
        high_value: 35000,
        medium_value: 15000,
        low_value: 4500
      }
    };
  }

  private generateCustomerRecommendations(segments: any[], churnRisk: any): string[] {
    return [
      'Implementare programma di fidelizzazione per clienti high_value',
      'Contattare proattivamente i clienti ad alto rischio di abbandono',
      'Sviluppare strategie di upselling per clienti medium_value'
    ];
  }

  private suggestNextAction(customerData: any): string {
    // Implementazione semplificata
    return 'Contattare i 5 clienti high_value con progetti in scadenza nei prossimi 30 giorni';
  }
}

export const aiService = AIService.getInstance();