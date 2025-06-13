import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { FinancialMetrics, GasparottoAnalysis } from '../../services/financialAnalysisService';

interface FinancialChartsProps {
  metrics: FinancialMetrics;
  analysis: GasparottoAnalysis;
  monthlyData: Array<{
    mese: string;
    ricavi: number;
    costi: number;
    margine: number;
  }>;
}

const FinancialCharts: React.FC<FinancialChartsProps> = ({ metrics, analysis, monthlyData }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (score >= 60) return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    return <TrendingDown className="h-5 w-5 text-red-600" />;
  };

  const pieData = [
    { name: 'Ricavi', value: monthlyData.reduce((sum, item) => sum + item.ricavi, 0), color: '#10B981' },
    { name: 'Costi', value: monthlyData.reduce((sum, item) => sum + item.costi, 0), color: '#EF4444' },
  ];

  const kpiData = [
    { name: 'ROI', value: metrics.roi * 100, target: 15, color: '#3B82F6' },
    { name: 'ROE', value: metrics.roe * 100, target: 18, color: '#8B5CF6' },
    { name: 'Margine Netto', value: metrics.netMargin * 100, target: 12, color: '#10B981' },
    { name: 'Current Ratio', value: metrics.currentRatio, target: 1.5, color: '#F59E0B' },
  ];

  return (
    <div className="space-y-6">
      {/* Score Complessivo Gasparotto */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-blue-900">Analisi Gasparotto</h3>
          <div className="flex items-center gap-2">
            {getScoreIcon(analysis.scoreComplessivo)}
            <span className={`text-2xl font-bold ${getScoreColor(analysis.scoreComplessivo)}`}>
              {analysis.scoreComplessivo.toFixed(0)}/100
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'Redditività', score: analysis.redditività.score },
            { name: 'Liquidità', score: analysis.liquidità.score },
            { name: 'Efficienza', score: analysis.efficienza.score },
            { name: 'Crescita', score: analysis.crescita.score },
          ].map((item) => (
            <div key={item.name} className="text-center">
              <div className={`text-lg font-bold ${getScoreColor(item.score)}`}>
                {item.score.toFixed(0)}
              </div>
              <div className="text-sm text-gray-600">{item.name}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Grafici Principali */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Andamento Mensile */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Andamento Ricavi vs Costi</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mese" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [`€${value.toLocaleString('it-IT')}`, '']}
              />
              <Line 
                type="monotone" 
                dataKey="ricavi" 
                stroke="#10B981" 
                strokeWidth={3}
                name="Ricavi"
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="costi" 
                stroke="#EF4444" 
                strokeWidth={3}
                name="Costi"
                dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="margine" 
                stroke="#3B82F6" 
                strokeWidth={3}
                name="Margine"
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Distribuzione Ricavi/Costi */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribuzione Ricavi/Costi</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [`€${value.toLocaleString('it-IT')}`, '']}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 mt-4">
            {pieData.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-600">{item.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* KPI Dashboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl shadow-sm p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">KPI vs Target</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={kpiData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip 
              formatter={(value: number, name: string) => [
                name === 'Current Ratio' ? value.toFixed(2) : `${value.toFixed(1)}%`,
                ''
              ]}
            />
            <Bar dataKey="value" fill="#3B82F6" name="Attuale" />
            <Bar dataKey="target" fill="#E5E7EB" name="Target" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Suggerimenti AI */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl shadow-sm p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Suggerimenti Strategici AI</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Priorità */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">🎯 Priorità Immediate</h4>
            <div className="space-y-2">
              {analysis.priorità.map((priorita, index) => (
                <div key={index} className="p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                  <p className="text-sm text-yellow-800">{priorita}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Suggerimenti per area */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">💡 Suggerimenti per Area</h4>
            <div className="space-y-3">
              {analysis.redditività.score < 70 && (
                <div className="p-3 bg-red-50 border-l-4 border-red-400 rounded">
                  <p className="text-sm font-medium text-red-800">Redditività</p>
                  <p className="text-xs text-red-600 mt-1">
                    {analysis.redditività.suggerimenti[0]}
                  </p>
                </div>
              )}
              
              {analysis.liquidità.score < 70 && (
                <div className="p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
                  <p className="text-sm font-medium text-blue-800">Liquidità</p>
                  <p className="text-xs text-blue-600 mt-1">
                    {analysis.liquidità.suggerimenti[0]}
                  </p>
                </div>
              )}
              
              {analysis.efficienza.score < 70 && (
                <div className="p-3 bg-purple-50 border-l-4 border-purple-400 rounded">
                  <p className="text-sm font-medium text-purple-800">Efficienza</p>
                  <p className="text-xs text-purple-600 mt-1">
                    {analysis.efficienza.suggerimenti[0]}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Metriche Dettagliate */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-xl shadow-sm p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Metriche Finanziarie Dettagliate</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'EBITDA', value: `€${metrics.ebitda.toLocaleString('it-IT')}`, color: 'text-green-600' },
            { name: 'Punto Pareggio', value: `€${metrics.puntoPareggio.toLocaleString('it-IT')}`, color: 'text-blue-600' },
            { name: 'Debt/Equity', value: metrics.debtToEquity.toFixed(2), color: 'text-purple-600' },
            { name: 'Asset Turnover', value: metrics.assetTurnover.toFixed(2), color: 'text-orange-600' },
          ].map((metric) => (
            <div key={metric.name} className="text-center p-4 bg-gray-50 rounded-lg">
              <div className={`text-lg font-bold ${metric.color}`}>
                {metric.value}
              </div>
              <div className="text-sm text-gray-600">{metric.name}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default FinancialCharts;