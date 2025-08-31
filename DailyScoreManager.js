// ==============================================
// src/components/DailyScoreManager.js - Enhanced Daily Score Management
// ==============================================
import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { currencyUtils } from '../utils/currency';
import { dateUtils } from '../utils/dateUtils';

const DailyScoreManager = () => {
  const { 
    dailyScores, 
    productionLines, 
    orders,
    productionStages,
    actions,
    settings 
  } = useData();

  const [showAddScore, setShowAddScore] = useState(false);
  const [editingScore, setEditingScore] = useState(null);
  const [selectedLine, setSelectedLine] = useState('all');
  const [dateRange, setDateRange] = useState('week');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const [scoreForm, setScoreForm] = useState({
    productionLine: '',
    date: dateUtils.getCurrentDate(),
    targetUnits: '',
    actualUnits: '',
    operatorCount: '',
    hoursWorked: '8',
    defectiveUnits: '0',
    downtime: '0',
    notes: '',
    qualityScore: '100',
    efficiencyTarget: '90'
  });

  const [analytics, setAnalytics] = useState({
    trends: [],
    averageEfficiency: 0,
    bestPerformingLine: null,
    improvementAreas: [],
    weeklyComparison: [],
    productivityIndex: 0
  });

  useEffect(() => {
    calculateAnalytics();
    autoUpdateProductionLineEfficiency();
  }, [dailyScores, selectedLine, dateRange]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setScoreForm(prev => {
      const updated = { ...prev, [name]: value };
      
      // Auto-calculate efficiency when target or actual changes
      if (name === 'targetUnits' || name === 'actualUnits') {
        const target = parseFloat(name === 'targetUnits' ? value : prev.targetUnits) || 0;
        const actual = parseFloat(name === 'actualUnits' ? value : prev.actualUnits) || 0;
        updated.calculatedEfficiency = target > 0 ? ((actual / target) * 100).toFixed(1) : 0;
      }

      return updated;
    });

    // Clear validation errors when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!scoreForm.productionLine) {
      errors.productionLine = 'Production line is required';
    }

    if (!scoreForm.date) {
      errors.date = 'Date is required';
    } else {
      const scoreDate = new Date(scoreForm.date);
      const today = new Date();
      if (scoreDate > today) {
        errors.date = 'Date cannot be in the future';
      }
    }

    if (!scoreForm.targetUnits || parseFloat(scoreForm.targetUnits) <= 0) {
      errors.targetUnits = 'Target units must be greater than 0';
    }

    if (parseFloat(scoreForm.actualUnits) < 0) {
      errors.actualUnits = 'Actual units cannot be negative';
    }

    if (!scoreForm.operatorCount || parseInt(scoreForm.operatorCount) <= 0) {
      errors.operatorCount = 'Operator count must be greater than 0';
    }

    if (!scoreForm.hoursWorked || parseFloat(scoreForm.hoursWorked) <= 0 || parseFloat(scoreForm.hoursWorked) > 24) {
      errors.hoursWorked = 'Hours worked must be between 0.1 and 24';
    }

    if (parseFloat(scoreForm.defectiveUnits) < 0) {
      errors.defectiveUnits = 'Defective units cannot be negative';
    }

    const actualUnits = parseFloat(scoreForm.actualUnits) || 0;
    const defectiveUnits = parseFloat(scoreForm.defectiveUnits) || 0;
    if (defectiveUnits > actualUnits) {
      errors.defectiveUnits = 'Defective units cannot exceed actual units';
    }

    // Check for duplicate entries
    const existingScore = dailyScores.find(score => 
      score.production_line === scoreForm.productionLine && 
      score.date === scoreForm.date &&
      (!editingScore || score.id !== editingScore.id)
    );

    if (existingScore) {
      errors.duplicate = 'A score already exists for this line and date. Edit the existing entry instead.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const targetUnits = parseFloat(scoreForm.targetUnits) || 0;
    const actualUnits = parseFloat(scoreForm.actualUnits) || 0;
    const defectiveUnits = parseFloat(scoreForm.defectiveUnits) || 0;
    const hoursWorked = parseFloat(scoreForm.hoursWorked) || 8;
    const operatorCount = parseInt(scoreForm.operatorCount) || 0;

    // Calculate comprehensive metrics
    const efficiency = targetUnits > 0 ? ((actualUnits / targetUnits) * 100) : 0;
    const qualityRate = actualUnits > 0 ? (((actualUnits - defectiveUnits) / actualUnits) * 100) : 100;
    const productivity = operatorCount > 0 && hoursWorked > 0 ? actualUnits / (operatorCount * hoursWorked) : 0;
    const oee = (efficiency * qualityRate) / 100; // Overall Equipment Effectiveness

    const scoreData = {
      production_line: scoreForm.productionLine,
      date: scoreForm.date,
      target_units: targetUnits,
      actual_units: actualUnits,
      operator_count: operatorCount,
      hours_worked: hoursWorked,
      defective_units: defectiveUnits,
      downtime_minutes: parseFloat(scoreForm.downtime) || 0,
      quality_score: parseFloat(scoreForm.qualityScore) || 100,
      efficiency_target: parseFloat(scoreForm.efficiencyTarget) || 90,
      notes: scoreForm.notes.trim(),
      
      // Calculated metrics
      efficiency_percentage: Math.round(efficiency * 10) / 10,
      quality_rate: Math.round(qualityRate * 10) / 10,
      productivity_rate: Math.round(productivity * 100) / 100,
      oee_score: Math.round(oee * 10) / 10,
      
      // Additional analytics
      units_per_operator: operatorCount > 0 ? Math.round(actualUnits / operatorCount) : 0,
      units_per_hour: hoursWorked > 0 ? Math.round(actualUnits / hoursWorked * 10) / 10 : 0,
      variance_from_target: actualUnits - targetUnits,
      variance_percentage: targetUnits > 0 ? ((actualUnits - targetUnits) / targetUnits * 100) : 0
    };

    if (editingScore) {
      actions.updateDailyScore(editingScore.id, scoreData);
      setEditingScore(null);
    } else {
      actions.addDailyScore(scoreData);
    }

    resetForm();
    setShowAddScore(false);
    
    // Update production line efficiency in real-time
    updateProductionLineEfficiency(scoreForm.productionLine, efficiency);
  };

  const resetForm = () => {
    setScoreForm({
      productionLine: '',
      date: dateUtils.getCurrentDate(),
      targetUnits: '',
      actualUnits: '',
      operatorCount: '',
      hoursWorked: '8',
      defectiveUnits: '0',
      downtime: '0',
      notes: '',
      qualityScore: '100',
      efficiencyTarget: '90'
    });
    setValidationErrors({});
  };

  const handleEdit = (score) => {
    setEditingScore(score);
    setScoreForm({
      productionLine: score.production_line || '',
      date: score.date || dateUtils.getCurrentDate(),
      targetUnits: (score.target_units || 0).toString(),
      actualUnits: (score.actual_units || 0).toString(),
      operatorCount: (score.operator_count || 0).toString(),
      hoursWorked: (score.hours_worked || 8).toString(),
      defectiveUnits: (score.defective_units || 0).toString(),
      downtime: (score.downtime_minutes || 0).toString(),
      notes: score.notes || '',
      qualityScore: (score.quality_score || 100).toString(),
      efficiencyTarget: (score.efficiency_target || 90).toString()
    });
    setShowAddScore(true);
  };

  const handleDelete = (scoreId) => {
    if (window.confirm('Are you sure you want to delete this daily score? This action cannot be undone.')) {
      actions.deleteDailyScore(scoreId);
    }
  };

  const updateProductionLineEfficiency = (lineName, efficiency) => {
    const line = productionLines.find(l => l.name === lineName);
    if (line) {
      actions.updateProductionLine(line.id, {
        efficiency: Math.round(efficiency * 10) / 10,
        lastUpdated: new Date().toISOString()
      });
    }
  };

  const autoUpdateProductionLineEfficiency = () => {
    productionLines.forEach(line => {
      const recentScores = dailyScores
        .filter(score => score.production_line === line.name)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 7); // Last 7 days

      if (recentScores.length > 0) {
        const avgEfficiency = recentScores.reduce((sum, score) => sum + (score.efficiency_percentage || 0), 0) / recentScores.length;
        actions.updateProductionLine(line.id, {
          efficiency: Math.round(avgEfficiency * 10) / 10,
          lastUpdated: new Date().toISOString()
        });
      }
    });
  };

  const calculateAnalytics = () => {
    const filteredScores = getFilteredScores();
    
    if (filteredScores.length === 0) {
      setAnalytics({
        trends: [],
        averageEfficiency: 0,
        bestPerformingLine: null,
        improvementAreas: [],
        weeklyComparison: [],
        productivityIndex: 0
      });
      return;
    }

    // Calculate average efficiency
    const averageEfficiency = filteredScores.reduce((sum, score) => sum + (score.efficiency_percentage || 0), 0) / filteredScores.length;

    // Find best performing line
    const linePerformance = {};
    filteredScores.forEach(score => {
      if (!linePerformance[score.production_line]) {
        linePerformance[score.production_line] = { totalEfficiency: 0, count: 0 };
      }
      linePerformance[score.production_line].totalEfficiency += score.efficiency_percentage || 0;
      linePerformance[score.production_line].count += 1;
    });

    const bestPerformingLine = Object.entries(linePerformance)
      .map(([line, data]) => ({
        line,
        avgEfficiency: data.totalEfficiency / data.count
      }))
      .sort((a, b) => b.avgEfficiency - a.avgEfficiency)[0];

    // Calculate trends (last 7 days)
    const trends = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayScores = filteredScores.filter(score => score.date === dateStr);
      const dayEfficiency = dayScores.length > 0 
        ? dayScores.reduce((sum, score) => sum + (score.efficiency_percentage || 0), 0) / dayScores.length
        : 0;
      
      trends.push({
        date: dateStr,
        efficiency: Math.round(dayEfficiency * 10) / 10,
        count: dayScores.length
      });
    }

    // Find improvement areas
    const improvementAreas = Object.entries(linePerformance)
      .map(([line, data]) => ({
        line,
        avgEfficiency: data.totalEfficiency / data.count,
        count: data.count
      }))
      .filter(item => item.avgEfficiency < 85)
      .sort((a, b) => a.avgEfficiency - b.avgEfficiency);

    // Calculate productivity index
    const totalProduction = filteredScores.reduce((sum, score) => sum + (score.actual_units || 0), 0);
    const totalCapacity = filteredScores.reduce((sum, score) => sum + (score.target_units || 0), 0);
    const productivityIndex = totalCapacity > 0 ? (totalProduction / totalCapacity) * 100 : 0;

    setAnalytics({
      trends,
      averageEfficiency: Math.round(averageEfficiency * 10) / 10,
      bestPerformingLine,
      improvementAreas,
      weeklyComparison: trends,
      productivityIndex: Math.round(productivityIndex * 10) / 10
    });
  };

  const getFilteredScores = () => {
    const now = new Date();
    let startDate = new Date();

    switch (dateRange) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    return dailyScores.filter(score => {
      const scoreDate = new Date(score.date);
      const matchesDate = scoreDate >= startDate && scoreDate <= now;
      const matchesLine = selectedLine === 'all' || score.production_line === selectedLine;
      return matchesDate && matchesLine;
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const getEfficiencyColor = (efficiency) => {
    if (efficiency >= 100) return 'text-green-600 bg-green-100';
    if (efficiency >= 90) return 'text-blue-600 bg-blue-100';
    if (efficiency >= 80) return 'text-yellow-600 bg-yellow-100';
    if (efficiency >= 70) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getQualityColor = (qualityRate) => {
    if (qualityRate >= 99) return 'text-green-600';
    if (qualityRate >= 95) return 'text-blue-600';
    if (qualityRate >= 90) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatCurrency = (amount) => {
    return currencyUtils.format(amount);
  };

  const filteredScores = getFilteredScores();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Daily Score Management</h2>
          <p className="text-gray-600 mt-1">Track and analyze daily production performance</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            📊 {showAnalytics ? 'Hide' : 'Show'} Analytics
          </button>
          <button
            onClick={() => {
              resetForm();
              setEditingScore(null);
              setShowAddScore(true);
            }}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2"
          >
            <span>+</span>
            <span>Add Daily Score</span>
          </button>
        </div>
      </div>

      {/* Analytics Dashboard */}
      {showAnalytics && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Production Analytics</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg text-white">
              <div className="text-2xl font-bold">{analytics.averageEfficiency}%</div>
              <div className="text-blue-100">Average Efficiency</div>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-lg text-white">
              <div className="text-2xl font-bold">{analytics.productivityIndex}%</div>
              <div className="text-green-100">Productivity Index</div>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-lg text-white">
              <div className="text-lg font-bold">
                {analytics.bestPerformingLine?.line || 'N/A'}
              </div>
              <div className="text-purple-100">Best Performing Line</div>
              {analytics.bestPerformingLine && (
                <div className="text-sm text-purple-200">
                  {analytics.bestPerformingLine.avgEfficiency.toFixed(1)}% avg
                </div>
              )}
            </div>
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-lg text-white">
              <div className="text-2xl font-bold">{analytics.improvementAreas.length}</div>
              <div className="text-orange-100">Areas for Improvement</div>
            </div>
          </div>

          {/* Weekly Trends Chart */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Weekly Efficiency Trends</h4>
            <div className="h-32 bg-gray-50 rounded-lg p-4 flex items-end justify-between">
              {analytics.trends.map((trend, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div
                    className="bg-blue-500 rounded-t"
                    style={{
                      height: `${Math.max(trend.efficiency, 5)}px`,
                      width: '20px'
                    }}
                  />
                  <div className="text-xs text-gray-500 mt-1 transform rotate-45 origin-left">
                    {dateUtils.formatDate(trend.date, { format: 'short' })}
                  </div>
                  <div className="text-xs font-medium text-gray-700">
                    {trend.efficiency}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Improvement Areas */}
          {analytics.improvementAreas.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Lines Needing Improvement</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {analytics.improvementAreas.slice(0, 3).map((area, index) => (
                  <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="font-medium text-gray-900">{area.line}</div>
                    <div className="text-red-600 font-bold">{area.avgEfficiency.toFixed(1)}%</div>
                    <div className="text-sm text-gray-500">{area.count} scores recorded</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Production Line</label>
            <select
              value={selectedLine}
              onChange={(e) => setSelectedLine(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Lines</option>
              {productionLines.map(line => (
                <option key={line.id} value={line.name}>{line.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
            </select>
          </div>
          <div className="flex items-end">
            <div className="text-sm text-gray-600">
              Showing {filteredScores.length} daily scores
            </div>
          </div>
        </div>
      </div>

      {/* Daily Scores Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Line
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Production Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance Metrics
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quality & OEE
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Team Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredScores.map((score) => (
                <tr key={score.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {dateUtils.formatDate(score.date, { format: 'medium' })}
                    </div>
                    <div className="text-sm text-blue-600 font-medium">
                      {score.production_line}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <strong>{(score.actual_units || 0).toLocaleString()}</strong> / {(score.target_units || 0).toLocaleString()} units
                    </div>
                    <div className="text-xs text-gray-500">
                      Variance: {score.variance_from_target > 0 ? '+' : ''}{score.variance_from_target} 
                      ({score.variance_percentage > 0 ? '+' : ''}{score.variance_percentage?.toFixed(1)}%)
                    </div>
                    {score.defective_units > 0 && (
                      <div className="text-xs text-red-600">
                        Defects: {score.defective_units}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEfficiencyColor(score.efficiency_percentage || 0)}`}>
                      {score.efficiency_percentage?.toFixed(1) || 0}% Efficiency
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Productivity: {score.units_per_hour?.toFixed(1) || 0} units/hr
                    </div>
                    <div className="text-xs text-gray-500">
                      Per Operator: {score.units_per_operator || 0} units
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${getQualityColor(score.quality_rate || 100)}`}>
                      {score.quality_rate?.toFixed(1) || 100}% Quality
                    </div>
                    <div className="text-sm font-medium text-purple-600">
                      {score.oee_score?.toFixed(1) || 0}% OEE
                    </div>
                    {score.downtime_minutes > 0 && (
                      <div className="text-xs text-orange-600">
                        Downtime: {score.downtime_minutes}min
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>{score.operator_count || 0} operators</div>
                    <div>{score.hours_worked || 0}h worked</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(score)}
                      className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(score.id)}
                      className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredScores.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No daily scores found for the selected criteria.</p>
              <button
                onClick={() => {
                  resetForm();
                  setShowAddScore(true);
                }}
                className="mt-2 text-blue-600 hover:text-blue-800 font-medium"
              >
                Add the first daily score →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Daily Score Modal */}
      {showAddScore && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-6 pb-3 border-b">
              <h3 className="text-xl font-semibold text-gray-900">
                {editingScore ? 'Edit Daily Score' : 'Add Daily Score'}
              </h3>
              <button
                onClick={() => {
                  setShowAddScore(false);
                  setEditingScore(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            {validationErrors.duplicate && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-700 text-sm">{validationErrors.duplicate}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Production Line *</label>
                    <select
                      name="productionLine"
                      value={scoreForm.productionLine}
                      onChange={handleInputChange}
                      className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        validationErrors.productionLine ? 'border-red-300' : 'border-gray-300'
                      }`}
                      required
                    >
                      <option value="">Select Production Line</option>
                      {productionLines
                        .filter(line => line.status === 'active')
                        .map(line => (
                          <option key={line.id} value={line.name}>{line.name}</option>
                        ))}
                    </select>
                    {validationErrors.productionLine && (
                      <p className="text-red-600 text-xs mt-1">{validationErrors.productionLine}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                    <input
                      type="date"
                      name="date"
                      value={scoreForm.date}
                      onChange={handleInputChange}
                      className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        validationErrors.date ? 'border-red-300' : 'border-gray-300'
                      }`}
                      required
                    />
                    {validationErrors.date && (
                      <p className="text-red-600 text-xs mt-1">{validationErrors.date}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Production Targets and Actuals */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Production Data</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Units *</label>
                    <input
                      type="number"
                      name="targetUnits"
                      placeholder="300"
                      min="1"
                      value={scoreForm.targetUnits}
                      onChange={handleInputChange}
                      className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        validationErrors.targetUnits ? 'border-red-300' : 'border-gray-300'
                      }`}
                      required
                    />
                    {validationErrors.targetUnits && (
                      <p className="text-red-600 text-xs mt-1">{validationErrors.targetUnits}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Actual Units *</label>
                    <input
                      type="number"
                      name="actualUnits"
                      placeholder="285"
                      min="0"
                      value={scoreForm.actualUnits}
                      onChange={handleInputChange}
                      className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        validationErrors.actualUnits ? 'border-red-300' : 'border-gray-300'
                      }`}
                      required
                    />
                    {validationErrors.actualUnits && (
                      <p className="text-red-600 text-xs mt-1">{validationErrors.actualUnits}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Efficiency</label>
                    <div className={`w-full border border-gray-200 rounded-md px-3 py-2 bg-gray-50 text-gray-900 font-medium ${
                      scoreForm.calculatedEfficiency >= 100 ? 'text-green-600' :
                      scoreForm.calculatedEfficiency >= 90 ? 'text-blue-600' :
                      scoreForm.calculatedEfficiency >= 80 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {scoreForm.calculatedEfficiency || 0}%
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Auto-calculated</p>
                  </div>
                </div>
              </div>

              {/* Team and Quality Data */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Team & Quality Data</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Operator Count *</label>
                    <input
                      type="number"
                      name="operatorCount"
                      placeholder="6"
                      min="1"
                      value={scoreForm.operatorCount}
                      onChange={handleInputChange}
                      className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        validationErrors.operatorCount ? 'border-red-300' : 'border-gray-300'
                      }`}
                      required
                    />
                    {validationErrors.operatorCount && (
                      <p className="text-red-600 text-xs mt-1">{validationErrors.operatorCount}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hours Worked *</label>
                    <input
                      type="number"
                      name="hoursWorked"
                      placeholder="8"
                      min="0.1"
                      max="24"
                      step="0.5"
                      value={scoreForm.hoursWorked}
                      onChange={handleInputChange}
                      className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        validationErrors.hoursWorked ? 'border-red-300' : 'border-gray-300'
                      }`}
                      required
                    />
                    {validationErrors.hoursWorked && (
                      <p className="text-red-600 text-xs mt-1">{validationErrors.hoursWorked}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Defective Units</label>
                    <input
                      type="number"
                      name="defectiveUnits"
                      placeholder="0"
                      min="0"
                      value={scoreForm.defectiveUnits}
                      onChange={handleInputChange}
                      className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        validationErrors.defectiveUnits ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {validationErrors.defectiveUnits && (
                      <p className="text-red-600 text-xs mt-1">{validationErrors.defectiveUnits}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Downtime (minutes)</label>
                    <input
                      type="number"
                      name="downtime"
                      placeholder="0"
                      min="0"
                      value={scoreForm.downtime}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Metrics */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Quality Standards</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quality Score (%)</label>
                    <input
                      type="number"
                      name="qualityScore"
                      placeholder="100"
                      min="0"
                      max="100"
                      value={scoreForm.qualityScore}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Efficiency Target (%)</label>
                    <input
                      type="number"
                      name="efficiencyTarget"
                      placeholder="90"
                      min="0"
                      max="200"
                      value={scoreForm.efficiencyTarget}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  name="notes"
                  placeholder="Additional notes about today's production, issues encountered, achievements, etc."
                  value={scoreForm.notes}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddScore(false);
                    setEditingScore(null);
                    resetForm();
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                >
                  {editingScore ? 'Update Score' : 'Add Score'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyScoreManager;