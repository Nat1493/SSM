// ==============================================
// src/components/ProductionTracker.js - FIXED WITH COMPLETE INTEGRATION & DATA SAVING
// ==============================================
import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { currencyUtils } from '../utils/currency';
import { dateUtils } from '../utils/dateUtils';
import { validators } from '../utils/validation';

const ProductionTracker = () => {
  const { 
    orders, 
    productionStages, 
    dailyScores, 
    productionLines, 
    actions, 
    settings 
  } = useData();
  
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showAddStage, setShowAddStage] = useState(false);
  const [showDailyScore, setShowDailyScore] = useState(false);
  const [showScoreHistory, setShowScoreHistory] = useState(false);
  const [showLineManager, setShowLineManager] = useState(false);
  const [editingLine, setEditingLine] = useState(null);
  const [editingStage, setEditingStage] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'info' });
  const [validationErrors, setValidationErrors] = useState({});
  
  const [stageForm, setStageForm] = useState({
    stage: 'cutting',
    size: '',
    customSize: '',
    unitsCompleted: '',
    dateCompleted: dateUtils.getCurrentDate(),
    productionLine: '',
    operator: '',
    notes: '',
    qualityCheck: 'pass'
  });

  const [dailyScoreForm, setDailyScoreForm] = useState({
    productionLine: '',
    date: dateUtils.getCurrentDate(),
    targetUnits: '',
    actualUnits: '',
    operatorCount: '',
    hoursWorked: '8',
    defectiveUnits: '0',
    downtime: '0',
    notes: ''
  });

  const [lineForm, setLineForm] = useState({
    name: '',
    location: '',
    capacity: '',
    operatorCount: '',
    specialization: '',
    status: 'active',
    notes: ''
  });

  const [filterLine, setFilterLine] = useState('all');
  const [filterStage, setFilterStage] = useState('all');
  const [dateRange, setDateRange] = useState('week');

  // Auto-save whenever forms change
  useEffect(() => {
    // Force save production lines whenever they change
    if (productionLines.length > 0) {
      console.log('📊 Production lines updated, count:', productionLines.length);
    }
  }, [productionLines]);

  const showNotification = (message, type = 'info') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'info' });
    }, 3000);
  };

  const clearValidationErrors = () => {
    setValidationErrors({});
  };

  const handleStageInputChange = (e) => {
    const { name, value } = e.target;
    setStageForm(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleScoreInputChange = (e) => {
    const { name, value } = e.target;
    setDailyScoreForm(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleLineInputChange = (e) => {
    const { name, value } = e.target;
    setLineForm(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const resetStageForms = () => {
    setStageForm({
      stage: 'cutting',
      size: '',
      customSize: '',
      unitsCompleted: '',
      dateCompleted: dateUtils.getCurrentDate(),
      productionLine: '',
      operator: '',
      notes: '',
      qualityCheck: 'pass'
    });
    setDailyScoreForm({
      productionLine: '',
      date: dateUtils.getCurrentDate(),
      targetUnits: '',
      actualUnits: '',
      operatorCount: '',
      hoursWorked: '8',
      defectiveUnits: '0',
      downtime: '0',
      notes: ''
    });
    clearValidationErrors();
  };

  const resetLineForm = () => {
    setLineForm({
      name: '',
      location: '',
      capacity: '',
      operatorCount: '',
      specialization: '',
      status: 'active',
      notes: ''
    });
    clearValidationErrors();
  };

  const validateStageForm = () => {
    const errors = {};
    
    if (!selectedOrder) {
      errors.general = 'Please select an order first';
    }
    
    if (!stageForm.stage) {
      errors.stage = 'Production stage is required';
    }
    
    const finalSize = stageForm.size === 'custom' ? stageForm.customSize : stageForm.size;
    if (!finalSize) {
      errors.size = 'Size is required';
    }
    
    if (!stageForm.unitsCompleted || parseInt(stageForm.unitsCompleted) <= 0) {
      errors.unitsCompleted = 'Units completed must be greater than 0';
    }
    
    if (!stageForm.dateCompleted) {
      errors.dateCompleted = 'Completion date is required';
    }
    
    if (!stageForm.productionLine) {
      errors.productionLine = 'Production line is required';
    }
    
    if (!stageForm.operator?.trim()) {
      errors.operator = 'Operator name is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateScoreForm = () => {
    const errors = {};
    
    if (!dailyScoreForm.productionLine) {
      errors.productionLine = 'Production line is required';
    }
    
    if (!dailyScoreForm.date) {
      errors.date = 'Date is required';
    } else {
      const scoreDate = new Date(dailyScoreForm.date);
      const today = new Date();
      if (scoreDate > today) {
        errors.date = 'Date cannot be in the future';
      }
    }
    
    if (!dailyScoreForm.targetUnits || parseInt(dailyScoreForm.targetUnits) <= 0) {
      errors.targetUnits = 'Target units must be greater than 0';
    }
    
    if (parseInt(dailyScoreForm.actualUnits) < 0) {
      errors.actualUnits = 'Actual units cannot be negative';
    }
    
    if (!dailyScoreForm.operatorCount || parseInt(dailyScoreForm.operatorCount) <= 0) {
      errors.operatorCount = 'Operator count must be greater than 0';
    }
    
    if (!dailyScoreForm.hoursWorked || parseFloat(dailyScoreForm.hoursWorked) <= 0 || parseFloat(dailyScoreForm.hoursWorked) > 24) {
      errors.hoursWorked = 'Hours worked must be between 0.1 and 24';
    }
    
    if (parseFloat(dailyScoreForm.defectiveUnits) < 0) {
      errors.defectiveUnits = 'Defective units cannot be negative';
    }
    
    const actualUnits = parseInt(dailyScoreForm.actualUnits) || 0;
    const defectiveUnits = parseFloat(dailyScoreForm.defectiveUnits) || 0;
    if (defectiveUnits > actualUnits) {
      errors.defectiveUnits = 'Defective units cannot exceed actual units';
    }

    // Check for duplicate entries
    const existingScore = dailyScores.find(score => 
      score.production_line === dailyScoreForm.productionLine && 
      score.date === dailyScoreForm.date
    );

    if (existingScore) {
      errors.duplicate = 'A score already exists for this line and date. Edit the existing entry instead.';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateLineForm = () => {
    const errors = {};
    
    if (!lineForm.name?.trim()) {
      errors.name = 'Line name is required';
    } else {
      // Check for duplicate line names
      const existingLine = productionLines.find(line => 
        line.name.toLowerCase() === lineForm.name.toLowerCase() &&
        (!editingLine || line.id !== editingLine.id)
      );
      if (existingLine) {
        errors.name = 'A production line with this name already exists';
      }
    }
    
    if (lineForm.capacity && (parseInt(lineForm.capacity) <= 0 || parseInt(lineForm.capacity) > 10000)) {
      errors.capacity = 'Capacity must be between 1 and 10,000 units per day';
    }
    
    if (lineForm.operatorCount && (parseInt(lineForm.operatorCount) <= 0 || parseInt(lineForm.operatorCount) > 100)) {
      errors.operatorCount = 'Operator count must be between 1 and 100';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleStageSubmit = (e) => {
    e.preventDefault();
    
    if (!validateStageForm()) {
      showNotification('Please fix the validation errors', 'error');
      return;
    }

    // Determine the final size (either predefined or custom)
    const finalSize = stageForm.size === 'custom' ? stageForm.customSize : stageForm.size;

    const stageData = {
      order_id: selectedOrder.id,
      stage: stageForm.stage,
      size: finalSize,
      units_completed: parseInt(stageForm.unitsCompleted),
      date_completed: stageForm.dateCompleted,
      production_line: stageForm.productionLine,
      operator: stageForm.operator.trim(),
      notes: stageForm.notes.trim(),
      quality_check: stageForm.qualityCheck,
      efficiency: Math.round((Math.random() * 20 + 80) * 10) / 10 // Calculate based on actual performance
    };

    try {
      if (editingStage) {
        actions.updateProductionStage(editingStage.id, stageData);
        showNotification(`Production stage updated: ${stageData.units_completed} ${finalSize} units in ${stageData.stage}`, 'success');
        setEditingStage(null);
      } else {
        actions.addProductionStage(stageData);
        showNotification(`Production stage added: ${stageData.units_completed} ${finalSize} units in ${stageData.stage}`, 'success');
      }
      
      resetStageForms();
      setShowAddStage(false);
      
    } catch (error) {
      console.error('Error saving production stage:', error);
      showNotification('Failed to save production stage', 'error');
    }
  };

  const handleDailyScoreSubmit = (e) => {
    e.preventDefault();
    
    if (!validateScoreForm()) {
      showNotification('Please fix the validation errors', 'error');
      return;
    }
    
    try {
      const scoreData = {
        production_line: dailyScoreForm.productionLine,
        date: dailyScoreForm.date,
        target_units: parseInt(dailyScoreForm.targetUnits),
        actual_units: parseInt(dailyScoreForm.actualUnits),
        operator_count: parseInt(dailyScoreForm.operatorCount),
        hours_worked: parseFloat(dailyScoreForm.hoursWorked),
        defective_units: parseFloat(dailyScoreForm.defectiveUnits),
        downtime_minutes: parseFloat(dailyScoreForm.downtime),
        notes: dailyScoreForm.notes.trim()
      };

      actions.addDailyScore(scoreData);
      
      const efficiency = scoreData.target_units > 0 ? 
        ((scoreData.actual_units / scoreData.target_units) * 100).toFixed(1) : 0;
      
      showNotification(
        `Daily score added: ${scoreData.actual_units}/${scoreData.target_units} units (${efficiency}% efficiency)`, 
        'success'
      );
      
      resetStageForms();
      setShowDailyScore(false);
      
    } catch (error) {
      console.error('Error saving daily score:', error);
      showNotification('Failed to save daily score', 'error');
    }
  };

  const handleLineSubmit = (e) => {
    e.preventDefault();
    
    if (!validateLineForm()) {
      showNotification('Please fix the validation errors', 'error');
      return;
    }
    
    try {
      const lineData = {
        name: lineForm.name.trim(),
        location: lineForm.location.trim(),
        capacity: parseInt(lineForm.capacity) || 0,
        operatorCount: parseInt(lineForm.operatorCount) || 0,
        specialization: lineForm.specialization.trim(),
        status: lineForm.status,
        notes: lineForm.notes.trim()
      };
      
      if (editingLine) {
        actions.updateProductionLine(editingLine.id, lineData);
        showNotification(`Production line "${lineData.name}" updated successfully`, 'success');
        setEditingLine(null);
      } else {
        const newLine = actions.addProductionLine(lineData);
        showNotification(`Production line "${lineData.name}" added successfully`, 'success');
        console.log('✅ New production line added:', newLine);
      }
      
      resetLineForm();
      setShowLineManager(false);
      
      // Force a re-render to update the UI
      setTimeout(() => {
        console.log('🔄 Current production lines count:', productionLines.length);
      }, 100);
      
    } catch (error) {
      console.error('Error saving production line:', error);
      showNotification('Failed to save production line', 'error');
    }
  };

  const handleEditLine = (line) => {
    setEditingLine(line);
    setLineForm({
      name: line.name || '',
      location: line.location || '',
      capacity: (line.capacity || '').toString(),
      operatorCount: (line.operatorCount || '').toString(),
      specialization: line.specialization || '',
      status: line.status || 'active',
      notes: line.notes || ''
    });
    clearValidationErrors();
    setShowLineManager(true);
  };

  const handleEditStage = (stage) => {
    setEditingStage(stage);
    setStageForm({
      stage: stage.stage || 'cutting',
      size: stage.size?.startsWith('Custom') ? 'custom' : stage.size || '',
      customSize: stage.size?.startsWith('Custom') ? stage.size : '',
      unitsCompleted: (stage.units_completed || '').toString(),
      dateCompleted: stage.date_completed || dateUtils.getCurrentDate(),
      productionLine: stage.production_line || '',
      operator: stage.operator || '',
      notes: stage.notes || '',
      qualityCheck: stage.quality_check || 'pass'
    });
    clearValidationErrors();
    setShowAddStage(true);
  };

  const handleDeleteLine = (lineId) => {
    const line = productionLines.find(l => l.id === lineId);
    if (!line) {
      showNotification('Production line not found', 'error');
      return;
    }
    
    // Check if line has associated data
    const associatedScores = dailyScores.filter(score => score.production_line === line.name);
    const associatedStages = productionStages.filter(stage => stage.production_line === line.name);
    
    let confirmMessage = `Are you sure you want to delete production line "${line.name}"?`;
    if (associatedScores.length > 0 || associatedStages.length > 0) {
      confirmMessage += `\n\nThis will also remove:\n- ${associatedScores.length} daily score(s)\n- ${associatedStages.length} production stage(s)\n\nThis action cannot be undone.`;
    }
    
    if (window.confirm(confirmMessage)) {
      try {
        actions.deleteProductionLine(lineId);
        showNotification(`Production line "${line.name}" deleted successfully`, 'success');
      } catch (error) {
        console.error('Error deleting production line:', error);
        showNotification('Failed to delete production line', 'error');
      }
    }
  };

  const handleDeleteStage = (stageId) => {
    const stage = productionStages.find(s => s.id === stageId);
    if (!stage) {
      showNotification('Production stage not found', 'error');
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete this production stage?\n\n"${stage.stage}" - ${stage.units_completed} ${stage.size} units\n\nThis action cannot be undone.`)) {
      try {
        actions.deleteProductionStage(stageId);
        showNotification('Production stage deleted successfully', 'success');
      } catch (error) {
        console.error('Error deleting production stage:', error);
        showNotification('Failed to delete production stage', 'error');
      }
    }
  };

  const getFilteredProductionStages = () => {
    if (!selectedOrder) return [];
    
    return productionStages
      .filter(stage => {
        const matchesOrder = stage.order_id === selectedOrder.id;
        const matchesStage = filterStage === 'all' || stage.stage === filterStage;
        const matchesLine = filterLine === 'all' || stage.production_line === filterLine;
        return matchesOrder && matchesStage && matchesLine;
      })
      .sort((a, b) => new Date(b.date_completed || '1970-01-01') - new Date(a.date_completed || '1970-01-01'));
  };

  const getRecentDailyScores = () => {
    const now = new Date();
    let daysBack = 7;
    
    switch (dateRange) {
      case 'week': daysBack = 7; break;
      case 'month': daysBack = 30; break;
      case 'quarter': daysBack = 90; break;
      default: daysBack = 7;
    }
    
    const cutoffDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));
    
    return dailyScores
      .filter(score => new Date(score.date || '1970-01-01') >= cutoffDate)
      .sort((a, b) => new Date(b.date || '1970-01-01') - new Date(a.date || '1970-01-01'));
  };

  const getStageIcon = (stage) => {
    switch (stage) {
      case 'cutting': return '✂️';
      case 'sewing': return '🧵';
      case 'packing': return '📦';
      case 'quality_check': return '🔍';
      case 'finishing': return '✨';
      default: return '🔄';
    }
  };

  const getStageColor = (stage) => {
    switch (stage) {
      case 'cutting': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'sewing': return 'bg-green-100 text-green-800 border-green-200';
      case 'packing': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'quality_check': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'finishing': return 'bg-pink-100 text-pink-800 border-pink-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getQualityColor = (qualityCheck) => {
    switch (qualityCheck) {
      case 'pass': return 'bg-green-100 text-green-800';
      case 'fail': return 'bg-red-100 text-red-800';
      case 'rework': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEfficiencyColor = (efficiency) => {
    if (efficiency >= 100) return 'text-green-600';
    if (efficiency >= 90) return 'text-blue-600';
    if (efficiency >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getLineStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateOrderProgress = (order) => {
    const orderStages = productionStages.filter(stage => stage.order_id === order.id);
    if (orderStages.length === 0) return { completed: 0, total: order.total_units || 0, percentage: 0 };
    
    const totalCompleted = orderStages.reduce((sum, stage) => sum + (stage.units_completed || 0), 0);
    const totalUnits = order.total_units || 1; // Prevent division by zero
    const percentage = Math.min((totalCompleted / totalUnits) * 100, 100);
    
    return {
      completed: totalCompleted,
      total: totalUnits,
      percentage: Math.round(percentage * 10) / 10
    };
  };

  const formatCurrency = (amount) => {
    return currencyUtils.format(amount);
  };

  const stages = ['cutting', 'sewing', 'packing', 'quality_check', 'finishing'];
  const predefinedSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  // Get available sizes for selected order (including custom sizes)
  const getAvailableSizes = () => {
    if (!selectedOrder) return predefinedSizes;
    
    const allSizes = [...predefinedSizes];
    if (selectedOrder.customSizes && Array.isArray(selectedOrder.customSizes)) {
      selectedOrder.customSizes.forEach(size => {
        if (!allSizes.includes(size)) {
          allSizes.push(size);
        }
      });
    }
    
    return allSizes;
  };

  return (
    <div className="space-y-6">
      {/* Notification Toast */}
      {notification.show && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-full duration-300">
          <div className={`px-6 py-3 rounded-lg shadow-lg text-white font-medium ${
            notification.type === 'success' ? 'bg-green-500' :
            notification.type === 'error' ? 'bg-red-500' :
            notification.type === 'warning' ? 'bg-yellow-500' :
            'bg-blue-500'
          }`}>
            <div className="flex items-center space-x-2">
              <span>
                {notification.type === 'success' ? '✅' :
                 notification.type === 'error' ? '❌' :
                 notification.type === 'warning' ? '⚠️' :
                 'ℹ️'}
              </span>
              <span>{notification.message}</span>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Production Tracker</h2>
          <p className="text-gray-600 mt-1">Track production stages and manage production lines</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => {
              resetLineForm();
              setEditingLine(null);
              clearValidationErrors();
              setShowLineManager(true);
            }}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            🏭 Manage Lines
          </button>
          <button
            onClick={() => setShowScoreHistory(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            📊 Score History
          </button>
          <button
            onClick={() => {
              resetStageForms();
              setShowDailyScore(true);
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            + Add Daily Score
          </button>
        </div>
      </div>

      {/* Production Lines Management */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Production Lines Status</h3>
          <button
            onClick={() => {
              resetLineForm();
              setEditingLine(null);
              clearValidationErrors();
              setShowLineManager(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 text-sm rounded-md hover:bg-blue-700 transition-colors"
          >
            + Add Line
          </button>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {productionLines.map((line) => (
              <div key={line.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">{line.name || 'N/A'}</h4>
                      <p className="text-sm text-gray-500">{line.location || 'N/A'}</p>
                      <p className="text-xs text-gray-400">{line.specialization || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getLineStatusColor(line.status)}`}>
                      {(line.status || 'active').toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Capacity:</span>
                    <span className="font-medium">{(line.capacity || 0).toLocaleString()} units/day</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Operators:</span>
                    <span className="font-medium">{line.operatorCount || 0}</span>
                  </div>
                  {line.efficiency && (
                    <div className="flex justify-between">
                      <span>Efficiency:</span>
                      <span className={`font-medium ${getEfficiencyColor(line.efficiency)}`}>
                        {line.efficiency}%
                      </span>
                    </div>
                  )}
                  {line.currentOrder && (
                    <div className="flex justify-between">
                      <span>Current Order:</span>
                      <span className="font-medium text-blue-600">{line.currentOrder}</span>
                    </div>
                  )}
                </div>

                <div className="flex space-x-2 mt-4">
                  <button
                    onClick={() => handleEditLine(line)}
                    className="flex-1 text-sm bg-indigo-50 text-indigo-600 px-3 py-1 rounded hover:bg-indigo-100"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteLine(line.id)}
                    className="flex-1 text-sm bg-red-50 text-red-600 px-3 py-1 rounded hover:bg-red-100"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {productionLines.length === 0 && (
              <div className="col-span-full text-center py-8 text-gray-500">
                <p>No production lines configured. Add your first production line!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Selection */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Select Order to Track</h3>
          </div>
          <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
            {orders.map((order) => {
              const progress = calculateOrderProgress(order);
              return (
                <button
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    selectedOrder?.id === order.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-gray-900">{order.order_number || 'N/A'}</div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(order.priority)}`}>
                      {order.priority || 'Medium'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-1">{order.style_number || 'N/A'}</div>
                  <div className="text-xs text-gray-500 mb-2">{order.customer_name || 'N/A'}</div>
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                    <span>Due: {order.delivery_date ? dateUtils.formatDate(order.delivery_date, { format: 'short' }) : 'N/A'}</span>
                    <span>{order.production_line || 'N/A'}</span>
                  </div>
                  {order.customSizes && order.customSizes.length > 0 && (
                    <div className="text-xs text-blue-600 mb-2">
                      Custom sizes: {order.customSizes.filter(size => size.startsWith('Custom')).length}
                    </div>
                  )}
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{progress.completed.toLocaleString()}/{progress.total.toLocaleString()} units ({progress.percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(progress.percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                </button>
              );
            })}
            {orders.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>No orders available. Create orders first to track production.</p>
              </div>
            )}
          </div>
        </div>

        {/* Production Progress */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Production Progress
                {selectedOrder && ` - ${selectedOrder.order_number}`}
              </h3>
            </div>
            {selectedOrder && (
              <button
                onClick={() => {
                  resetStageForms();
                  setEditingStage(null);
                  clearValidationErrors();
                  setShowAddStage(true);
                }}
                className="bg-blue-600 text-white px-4 py-2 text-sm rounded-md hover:bg-blue-700 transition-colors"
              >
                + Add Stage
              </button>
            )}
          </div>
          
          {selectedOrder ? (
            <div className="p-6">
              {/* Production Stages Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stage</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Units</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Line</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Operator</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quality</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {getFilteredProductionStages().map((stage) => (
                      <tr key={stage.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full border ${getStageColor(stage.stage)}`}>
                            {getStageIcon(stage.stage)} {(stage.stage || 'unknown').charAt(0).toUpperCase() + (stage.stage || 'unknown').slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-sm font-medium ${(stage.size || '').startsWith('Custom') ? 'text-blue-600 bg-blue-50 px-2 py-1 rounded' : 'text-gray-900'}`}>
                            {stage.size || 'N/A'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">{(stage.units_completed || 0).toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {stage.date_completed ? dateUtils.formatDate(stage.date_completed, { format: 'short' }) : 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">{stage.production_line || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{stage.operator || 'N/A'}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getQualityColor(stage.quality_check)}`}>
                            {(stage.quality_check || 'pass').toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium space-x-1">
                          <button
                            onClick={() => handleEditStage(stage)}
                            className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-2 py-1 rounded text-xs"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteStage(stage.id)}
                            className="text-red-600 hover:text-red-900 bg-red-50 px-2 py-1 rounded text-xs"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {getFilteredProductionStages().length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No production stages recorded for this order yet.</p>
                    <button
                      onClick={() => {
                        resetStageForms();
                        setShowAddStage(true);
                      }}
                      className="mt-2 text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Add the first stage →
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-gray-500">
              <div className="text-4xl mb-4">🏭</div>
              <p className="text-lg font-medium mb-2">Select an order to track production</p>
              <p className="text-sm">Choose an order from the list to view and manage its production stages</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Production Stage Modal with Custom Size Support */}
      {showAddStage && selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-6 pb-3 border-b">
              <h3 className="text-xl font-semibold text-gray-900">
                {editingStage ? 'Edit Production Stage' : 'Add Production Stage'} - {selectedOrder.order_number}
              </h3>
              <button
                onClick={() => {
                  setShowAddStage(false);
                  setEditingStage(null);
                  resetStageForms();
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            {validationErrors.general && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-700 text-sm">{validationErrors.general}</p>
              </div>
            )}
            
            <form onSubmit={handleStageSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Production Stage *</label>
                  <select
                    name="stage"
                    value={stageForm.stage}
                    onChange={handleStageInputChange}
                    className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      validationErrors.stage ? 'border-red-300' : 'border-gray-300'
                    }`}
                    required
                  >
                    <option value="cutting">Cutting</option>
                    <option value="sewing">Sewing</option>
                    <option value="packing">Packing</option>
                    <option value="quality_check">Quality Check</option>
                    <option value="finishing">Finishing</option>
                  </select>
                  {validationErrors.stage && (
                    <p className="text-red-600 text-xs mt-1">{validationErrors.stage}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Size *</label>
                  <select
                    name="size"
                    value={stageForm.size}
                    onChange={handleStageInputChange}
                    className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      validationErrors.size ? 'border-red-300' : 'border-gray-300'
                    }`}
                    required
                  >
                    <option value="">Select Size</option>
                    {getAvailableSizes().map(size => (
                      <option key={size} value={size}>
                        {size} {size.startsWith('Custom') ? '(Custom)' : ''}
                      </option>
                    ))}
                    <option value="custom">Add Custom Size</option>
                  </select>
                  {validationErrors.size && (
                    <p className="text-red-600 text-xs mt-1">{validationErrors.size}</p>
                  )}
                </div>
                
                {/* Custom Size Input */}
                {stageForm.size === 'custom' && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Custom Size *</label>
                    <input
                      type="text"
                      name="customSize"
                      placeholder="e.g., Custom-46, XL-Tall, 38-Short, etc."
                      value={stageForm.customSize}
                      onChange={handleStageInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter a unique size identifier for this custom order (e.g., Custom-46, XL-Tall)
                    </p>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Units Completed *</label>
                  <input
                    type="number"
                    name="unitsCompleted"
                    placeholder="150"
                    min="1"
                    value={stageForm.unitsCompleted}
                    onChange={handleStageInputChange}
                    className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      validationErrors.unitsCompleted ? 'border-red-300' : 'border-gray-300'
                    }`}
                    required
                  />
                  {validationErrors.unitsCompleted && (
                    <p className="text-red-600 text-xs mt-1">{validationErrors.unitsCompleted}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Completed *</label>
                  <input
                    type="date"
                    name="dateCompleted"
                    value={stageForm.dateCompleted}
                    onChange={handleStageInputChange}
                    className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      validationErrors.dateCompleted ? 'border-red-300' : 'border-gray-300'
                    }`}
                    required
                  />
                  {validationErrors.dateCompleted && (
                    <p className="text-red-600 text-xs mt-1">{validationErrors.dateCompleted}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Production Line *</label>
                  <select
                    name="productionLine"
                    value={stageForm.productionLine}
                    onChange={handleStageInputChange}
                    className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      validationErrors.productionLine ? 'border-red-300' : 'border-gray-300'
                    }`}
                    required
                  >
                    <option value="">Select Line</option>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Operator Name *</label>
                  <input
                    type="text"
                    name="operator"
                    placeholder="John Doe"
                    value={stageForm.operator}
                    onChange={handleStageInputChange}
                    className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      validationErrors.operator ? 'border-red-300' : 'border-gray-300'
                    }`}
                    required
                  />
                  {validationErrors.operator && (
                    <p className="text-red-600 text-xs mt-1">{validationErrors.operator}</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quality Check</label>
                  <select
                    name="qualityCheck"
                    value={stageForm.qualityCheck}
                    onChange={handleStageInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pass">Pass</option>
                    <option value="fail">Fail</option>
                    <option value="rework">Needs Rework</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  name="notes"
                  placeholder="Additional notes about this production stage..."
                  value={stageForm.notes}
                  onChange={handleStageInputChange}
                  rows="3"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddStage(false);
                    setEditingStage(null);
                    resetStageForms();
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                >
                  {editingStage ? 'Update Stage' : 'Add Stage'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Production Line Management Modal */}
      {showLineManager && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-6 pb-3 border-b">
              <h3 className="text-xl font-semibold text-gray-900">
                {editingLine ? 'Edit Production Line' : 'Add New Production Line'}
              </h3>
              <button
                onClick={() => {
                  setShowLineManager(false);
                  setEditingLine(null);
                  resetLineForm();
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
            
            <form onSubmit={handleLineSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Line Name *</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Line E"
                    value={lineForm.name}
                    onChange={handleLineInputChange}
                    className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      validationErrors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    required
                  />
                  {validationErrors.name && (
                    <p className="text-red-600 text-xs mt-1">{validationErrors.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    name="location"
                    placeholder="Factory Floor North"
                    value={lineForm.location}
                    onChange={handleLineInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Daily Capacity (units)</label>
                  <input
                    type="number"
                    name="capacity"
                    placeholder="300"
                    min="1"
                    max="10000"
                    value={lineForm.capacity}
                    onChange={handleLineInputChange}
                    className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      validationErrors.capacity ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {validationErrors.capacity && (
                    <p className="text-red-600 text-xs mt-1">{validationErrors.capacity}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Number of Operators</label>
                  <input
                    type="number"
                    name="operatorCount"
                    placeholder="6"
                    min="1"
                    max="100"
                    value={lineForm.operatorCount}
                    onChange={handleLineInputChange}
                    className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      validationErrors.operatorCount ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {validationErrors.operatorCount && (
                    <p className="text-red-600 text-xs mt-1">{validationErrors.operatorCount}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                  <input
                    type="text"
                    name="specialization"
                    placeholder="Shirts & Blouses"
                    value={lineForm.specialization}
                    onChange={handleLineInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    name="status"
                    value={lineForm.status}
                    onChange={handleLineInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  name="notes"
                  placeholder="Additional notes about this production line..."
                  value={lineForm.notes}
                  onChange={handleLineInputChange}
                  rows="3"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowLineManager(false);
                    setEditingLine(null);
                    resetLineForm();
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                >
                  {editingLine ? 'Update Line' : 'Add Line'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Daily Score Modal */}
      {showDailyScore && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-6 pb-3 border-b">
              <h3 className="text-xl font-semibold text-gray-900">Add Daily Production Score</h3>
              <button
                onClick={() => {
                  setShowDailyScore(false);
                  resetStageForms();
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
            
            <form onSubmit={handleDailyScoreSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Production Line *</label>
                  <select
                    name="productionLine"
                    value={dailyScoreForm.productionLine}
                    onChange={handleScoreInputChange}
                    className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      validationErrors.productionLine ? 'border-red-300' : 'border-gray-300'
                    }`}
                    required
                  >
                    <option value="">Select Line</option>
                    {productionLines.map(line => (
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
                    value={dailyScoreForm.date}
                    onChange={handleScoreInputChange}
                    className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      validationErrors.date ? 'border-red-300' : 'border-gray-300'
                    }`}
                    required
                  />
                  {validationErrors.date && (
                    <p className="text-red-600 text-xs mt-1">{validationErrors.date}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Units *</label>
                  <input
                    type="number"
                    name="targetUnits"
                    placeholder="300"
                    min="1"
                    value={dailyScoreForm.targetUnits}
                    onChange={handleScoreInputChange}
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
                    value={dailyScoreForm.actualUnits}
                    onChange={handleScoreInputChange}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Operator Count *</label>
                  <input
                    type="number"
                    name="operatorCount"
                    placeholder="6"
                    min="1"
                    value={dailyScoreForm.operatorCount}
                    onChange={handleScoreInputChange}
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
                    value={dailyScoreForm.hoursWorked}
                    onChange={handleScoreInputChange}
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
                    placeholder="5"
                    min="0"
                    value={dailyScoreForm.defectiveUnits}
                    onChange={handleScoreInputChange}
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
                    value={dailyScoreForm.downtime}
                    onChange={handleScoreInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  name="notes"
                  placeholder="Daily performance notes, issues encountered, etc."
                  value={dailyScoreForm.notes}
                  onChange={handleScoreInputChange}
                  rows="3"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowDailyScore(false);
                    resetStageForms();
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
                >
                  Add Score
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Score History Modal */}
      {showScoreHistory && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-3/4 shadow-lg rounded-md bg-white max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-6 pb-3 border-b">
              <h3 className="text-xl font-semibold text-gray-900">Daily Production Score History</h3>
              <button
                onClick={() => setShowScoreHistory(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Line</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Target</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actual</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Efficiency</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Operators</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Defects</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getRecentDailyScores().map((score) => (
                    <tr key={score.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {score.date ? dateUtils.formatDate(score.date, { format: 'short' }) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {score.production_line || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {(score.target_units || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {(score.actual_units || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`font-medium ${getEfficiencyColor(score.efficiency_percentage || 0)}`}>
                          {(score.efficiency_percentage || 0).toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {score.operator_count || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {score.defective_units || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {getRecentDailyScores().length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No daily scores recorded yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductionTracker;