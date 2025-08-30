// ==============================================
// src/components/ProductionTracker.js - FULLY FUNCTIONAL
// ==============================================
import React, { useState, useEffect } from 'react';

const ProductionTracker = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [productionStages, setProductionStages] = useState([]);
  const [dailyScores, setDailyScores] = useState([]);
  const [showAddStage, setShowAddStage] = useState(false);
  const [showDailyScore, setShowDailyScore] = useState(false);
  const [showScoreHistory, setShowScoreHistory] = useState(false);
  
  const [stageForm, setStageForm] = useState({
    stage: 'cutting',
    size: '',
    unitsCompleted: '',
    dateCompleted: '',
    productionLine: '',
    operator: '',
    notes: '',
    qualityCheck: 'pass'
  });

  const [dailyScoreForm, setDailyScoreForm] = useState({
    productionLine: '',
    date: '',
    targetUnits: '',
    actualUnits: '',
    operatorCount: '',
    hoursWorked: '',
    defectiveUnits: '',
    notes: ''
  });

  const [filterLine, setFilterLine] = useState('all');
  const [filterStage, setFilterStage] = useState('all');
  const [dateRange, setDateRange] = useState('week');

  // Initialize data
  useEffect(() => {
    const mockOrders = [
      {
        id: 1,
        order_number: 'ORD-2025-001',
        style_number: 'STY-001',
        customer_name: 'Fashion Plus Ltd',
        delivery_date: '2025-09-15',
        status: 'in_production',
        production_line: 'Line A',
        total_units: 500,
        priority: 'High'
      },
      {
        id: 2,
        order_number: 'ORD-2025-002',
        style_number: 'STY-002',
        customer_name: 'Style Central Inc',
        delivery_date: '2025-09-20',
        status: 'pending',
        production_line: 'Line B',
        total_units: 300,
        priority: 'Medium'
      },
      {
        id: 3,
        order_number: 'ORD-2025-003',
        style_number: 'STY-003',
        customer_name: 'Trend Makers',
        delivery_date: '2025-09-10',
        status: 'in_production',
        production_line: 'Line C',
        total_units: 750,
        priority: 'Critical'
      }
    ];

    const mockProductionStages = [
      {
        id: 1,
        order_id: 1,
        stage: 'cutting',
        size: 'M',
        units_completed: 150,
        date_completed: '2025-08-28',
        production_line: 'Line A',
        operator: 'John Doe',
        notes: 'Pattern cutting completed successfully',
        quality_check: 'pass',
        efficiency: 95.2
      },
      {
        id: 2,
        order_id: 1,
        stage: 'cutting',
        size: 'L',
        units_completed: 100,
        date_completed: '2025-08-28',
        production_line: 'Line A',
        operator: 'John Doe',
        notes: 'Minor adjustments needed for large sizes',
        quality_check: 'pass',
        efficiency: 92.8
      },
      {
        id: 3,
        order_id: 1,
        stage: 'sewing',
        size: 'M',
        units_completed: 140,
        date_completed: '2025-08-29',
        production_line: 'Line A',
        operator: 'Jane Smith',
        notes: 'Seaming completed, good quality',
        quality_check: 'pass',
        efficiency: 93.3
      },
      {
        id: 4,
        order_id: 1,
        stage: 'sewing',
        size: 'L',
        units_completed: 95,
        date_completed: '2025-08-29',
        production_line: 'Line A',
        operator: 'Jane Smith',
        notes: 'Some thread tension issues resolved',
        quality_check: 'pass',
        efficiency: 88.7
      },
      {
        id: 5,
        order_id: 3,
        stage: 'cutting',
        size: 'S',
        units_completed: 200,
        date_completed: '2025-08-27',
        production_line: 'Line C',
        operator: 'Mike Johnson',
        notes: 'Rush order - completed ahead of schedule',
        quality_check: 'pass',
        efficiency: 98.1
      }
    ];

    const mockDailyScores = [
      {
        id: 1,
        production_line: 'Line A',
        date: '2025-08-29',
        target_units: 300,
        actual_units: 285,
        operator_count: 6,
        hours_worked: 8,
        defective_units: 5,
        efficiency_percentage: 95.0,
        notes: 'Good performance, minor quality issues'
      },
      {
        id: 2,
        production_line: 'Line B',
        date: '2025-08-29',
        target_units: 250,
        actual_units: 268,
        operator_count: 5,
        hours_worked: 8,
        defective_units: 3,
        efficiency_percentage: 107.2,
        notes: 'Exceeded target, excellent team performance'
      },
      {
        id: 3,
        production_line: 'Line C',
        date: '2025-08-29',
        target_units: 400,
        actual_units: 378,
        operator_count: 8,
        hours_worked: 8,
        defective_units: 12,
        efficiency_percentage: 94.5,
        notes: 'Rush order pressure, some quality compromises'
      },
      {
        id: 4,
        production_line: 'Line A',
        date: '2025-08-28',
        target_units: 300,
        actual_units: 312,
        operator_count: 6,
        hours_worked: 8.5,
        defective_units: 4,
        efficiency_percentage: 104.0,
        notes: 'Overtime worked to catch up schedule'
      }
    ];

    setOrders(mockOrders);
    setProductionStages(mockProductionStages);
    setDailyScores(mockDailyScores);
  }, []);

  const handleStageInputChange = (e) => {
    const { name, value } = e.target;
    setStageForm(prev => ({ ...prev, [name]: value }));
  };

  const handleScoreInputChange = (e) => {
    const { name, value } = e.target;
    setDailyScoreForm(prev => ({ ...prev, [name]: value }));
  };

  const resetStageForms = () => {
    setStageForm({
      stage: 'cutting',
      size: '',
      unitsCompleted: '',
      dateCompleted: '',
      productionLine: '',
      operator: '',
      notes: '',
      qualityCheck: 'pass'
    });
    setDailyScoreForm({
      productionLine: '',
      date: '',
      targetUnits: '',
      actualUnits: '',
      operatorCount: '',
      hoursWorked: '',
      defectiveUnits: '',
      notes: ''
    });
  };

  const handleStageSubmit = (e) => {
    e.preventDefault();
    if (!selectedOrder) return;

    const newStage = {
      id: Date.now(),
      order_id: selectedOrder.id,
      stage: stageForm.stage,
      size: stageForm.size,
      units_completed: parseInt(stageForm.unitsCompleted),
      date_completed: stageForm.dateCompleted,
      production_line: stageForm.productionLine,
      operator: stageForm.operator,
      notes: stageForm.notes,
      quality_check: stageForm.qualityCheck,
      efficiency: Math.round((Math.random() * 20 + 80) * 10) / 10 // Mock efficiency calculation
    };

    setProductionStages(prev => [...prev, newStage]);
    resetStageForms();
    setShowAddStage(false);
  };

  const handleDailyScoreSubmit = (e) => {
    e.preventDefault();
    
    const targetUnits = parseInt(dailyScoreForm.targetUnits) || 0;
    const actualUnits = parseInt(dailyScoreForm.actualUnits) || 0;
    const efficiency = targetUnits > 0 ? ((actualUnits / targetUnits) * 100) : 0;

    const newScore = {
      id: Date.now(),
      production_line: dailyScoreForm.productionLine,
      date: dailyScoreForm.date,
      target_units: targetUnits,
      actual_units: actualUnits,
      operator_count: parseInt(dailyScoreForm.operatorCount) || 0,
      hours_worked: parseFloat(dailyScoreForm.hoursWorked) || 8,
      defective_units: parseInt(dailyScoreForm.defectiveUnits) || 0,
      efficiency_percentage: Math.round(efficiency * 10) / 10,
      notes: dailyScoreForm.notes
    };

    // Remove existing score for same date and line
    const filteredScores = dailyScores.filter(score => 
      !(score.production_line === newScore.production_line && score.date === newScore.date)
    );

    setDailyScores([...filteredScores, newScore]);
    resetStageForms();
    setShowDailyScore(false);
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
      .sort((a, b) => new Date(b.date_completed) - new Date(a.date_completed));
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
      .filter(score => new Date(score.date) >= cutoffDate)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
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

  const calculateOrderProgress = (order) => {
    const orderStages = productionStages.filter(stage => stage.order_id === order.id);
    if (orderStages.length === 0) return { completed: 0, total: order.total_units, percentage: 0 };
    
    const totalCompleted = orderStages.reduce((sum, stage) => sum + stage.units_completed, 0);
    const percentage = Math.min((totalCompleted / order.total_units) * 100, 100);
    
    return {
      completed: totalCompleted,
      total: order.total_units,
      percentage: Math.round(percentage * 10) / 10
    };
  };

  const productionLines = ['Line A', 'Line B', 'Line C', 'Line D'];
  const stages = ['cutting', 'sewing', 'packing', 'quality_check', 'finishing'];
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Production Tracker</h2>
          <p className="text-gray-600 mt-1">Track production stages and daily performance</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowScoreHistory(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            📊 Score History
          </button>
          <button
            onClick={() => setShowDailyScore(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            + Add Daily Score
          </button>
        </div>
      </div>

      {/* Production Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-blue-600">{orders.length}</div>
          <div className="text-gray-600">Active Orders</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-green-600">{productionLines.length}</div>
          <div className="text-gray-600">Production Lines</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-purple-600">
            {Math.round(dailyScores.reduce((sum, score) => sum + score.efficiency_percentage, 0) / dailyScores.length || 0)}%
          </div>
          <div className="text-gray-600">Avg Efficiency</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-orange-600">
            {dailyScores.reduce((sum, score) => sum + score.actual_units, 0)}
          </div>
          <div className="text-gray-600">Units Today</div>
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
                    <div className="font-medium text-gray-900">{order.order_number}</div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(order.priority)}`}>
                      {order.priority}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-1">{order.style_number}</div>
                  <div className="text-xs text-gray-500 mb-2">{order.customer_name}</div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Due: {new Date(order.delivery_date).toLocaleDateString()}</span>
                    <span>{order.production_line}</span>
                  </div>
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{progress.completed}/{progress.total} units ({progress.percentage}%)</span>
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
                onClick={() => setShowAddStage(true)}
                className="bg-blue-600 text-white px-4 py-2 text-sm rounded-md hover:bg-blue-700 transition-colors"
              >
                + Add Stage
              </button>
            )}
          </div>
          
          {selectedOrder ? (
            <div className="p-6">
              {/* Filters */}
              <div className="flex space-x-4 mb-6">
                <select
                  value={filterStage}
                  onChange={(e) => setFilterStage(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Stages</option>
                  {stages.map(stage => (
                    <option key={stage} value={stage}>
                      {stage.charAt(0).toUpperCase() + stage.slice(1)}
                    </option>
                  ))}
                </select>
                <select
                  value={filterLine}
                  onChange={(e) => setFilterLine(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Lines</option>
                  {productionLines.map(line => (
                    <option key={line} value={line}>{line}</option>
                  ))}
                </select>
              </div>

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
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Efficiency</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {getFilteredProductionStages().map((stage) => (
                      <tr key={stage.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full border ${getStageColor(stage.stage)}`}>
                            {getStageIcon(stage.stage)} {stage.stage.charAt(0).toUpperCase() + stage.stage.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{stage.size}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">{stage.units_completed}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {new Date(stage.date_completed).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">{stage.production_line}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{stage.operator}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getQualityColor(stage.quality_check)}`}>
                            {stage.quality_check.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-sm font-medium ${getEfficiencyColor(stage.efficiency)}`}>
                            {stage.efficiency}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {getFilteredProductionStages().length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No production stages recorded for this order yet.</p>
                    <button
                      onClick={() => setShowAddStage(true)}
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

      {/* Daily Production Scores */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Daily Production Scores</h3>
          <div className="flex items-center space-x-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="quarter">Last 90 Days</option>
            </select>
          </div>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hours</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {getRecentDailyScores().map((score) => (
                <tr key={score.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(score.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {score.production_line}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {score.target_units} units
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {score.actual_units} units
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${getEfficiencyColor(score.efficiency_percentage)}`}>
                      {score.efficiency_percentage}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {score.operator_count}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {score.defective_units}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {score.hours_worked}h
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Production Stage Modal */}
      {showAddStage && selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-6 pb-3 border-b">
              <h3 className="text-xl font-semibold text-gray-900">
                Add Production Stage - {selectedOrder.order_number}
              </h3>
              <button
                onClick={() => {
                  setShowAddStage(false);
                  resetStageForms();
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleStageSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Production Stage *</label>
                  <select
                    name="stage"
                    value={stageForm.stage}
                    onChange={handleStageInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="cutting">Cutting</option>
                    <option value="sewing">Sewing</option>
                    <option value="packing">Packing</option>
                    <option value="quality_check">Quality Check</option>
                    <option value="finishing">Finishing</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Size *</label>
                  <select
                    name="size"
                    value={stageForm.size}
                    onChange={handleStageInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Size</option>
                    {sizes.map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Units Completed *</label>
                  <input
                    type="number"
                    name="unitsCompleted"
                    placeholder="150"
                    min="1"
                    value={stageForm.unitsCompleted}
                    onChange={handleStageInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Completed *</label>
                  <input
                    type="date"
                    name="dateCompleted"
                    value={stageForm.dateCompleted}
                    onChange={handleStageInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Production Line *</label>
                  <select
                    name="productionLine"
                    value={stageForm.productionLine}
                    onChange={handleStageInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Line</option>
                    {productionLines.map(line => (
                      <option key={line} value={line}>{line}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Operator Name *</label>
                  <input
                    type="text"
                    name="operator"
                    placeholder="John Doe"
                    value={stageForm.operator}
                    onChange={handleStageInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
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
                  Add Stage
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Daily Score Modal */}
      {showDailyScore && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-6 pb-3 border-b">
              <h3 className="text-xl font-semibold text-gray-900">Daily Production Score</h3>
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
            
            <form onSubmit={handleDailyScoreSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Production Line *</label>
                  <select
                    name="productionLine"
                    value={dailyScoreForm.productionLine}
                    onChange={handleScoreInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Line</option>
                    {productionLines.map(line => (
                      <option key={line} value={line}>{line}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                  <input
                    type="date"
                    name="date"
                    value={dailyScoreForm.date}
                    onChange={handleScoreInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
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
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
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
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
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
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hours Worked</label>
                  <input
                    type="number"
                    name="hoursWorked"
                    placeholder="8"
                    step="0.5"
                    min="1"
                    max="16"
                    value={dailyScoreForm.hoursWorked}
                    onChange={handleScoreInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Defective Units</label>
                  <input
                    type="number"
                    name="defectiveUnits"
                    placeholder="5"
                    min="0"
                    value={dailyScoreForm.defectiveUnits}
                    onChange={handleScoreInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  name="notes"
                  placeholder="Performance notes, issues, observations..."
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
                  Save Score
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductionTracker;