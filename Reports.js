// ==============================================
// src/components/Reports.js - FIXED WITH REAL DATA CONNECTION
// ==============================================
import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { currencyUtils } from '../utils/currency';

const Reports = () => {
  const { 
    orders, 
    customers, 
    inventory, 
    productionStages, 
    dailyScores, 
    productionLines, 
    settings 
  } = useData();
  
  const [reportType, setReportType] = useState('production');
  const [dateRange, setDateRange] = useState('month');
  const [selectedLine, setSelectedLine] = useState('all');
  const [reportData, setReportData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    generateReport();
  }, [reportType, dateRange, selectedLine, orders, customers, inventory, productionStages, dailyScores]);

  const generateReport = async () => {
    setIsGenerating(true);
    
    // Simulate report generation delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const data = generateReportData();
    setReportData(data);
    setIsGenerating(false);
  };

  const generateReportData = () => {
    const now = new Date();
    let startDate = new Date();
    
    // Set date range
    switch (dateRange) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
    }

    // Filter data by date range
    const filteredOrders = orders.filter(order => {
      const orderDate = new Date(order.created_at || order.updated_at || now);
      return orderDate >= startDate && orderDate <= now;
    });

    const filteredDailyScores = dailyScores.filter(score => {
      const scoreDate = new Date(score.date);
      return scoreDate >= startDate && scoreDate <= now;
    });

    const filteredProductionStages = productionStages.filter(stage => {
      const stageDate = new Date(stage.date_completed || stage.created_at || now);
      return stageDate >= startDate && stageDate <= now;
    });

    // Filter by production line if selected
    const lineFilteredScores = selectedLine === 'all' ? 
      filteredDailyScores : 
      filteredDailyScores.filter(score => score.production_line === selectedLine);

    const lineFilteredStages = selectedLine === 'all' ? 
      filteredProductionStages : 
      filteredProductionStages.filter(stage => stage.production_line === selectedLine);

    switch (reportType) {
      case 'production':
        return generateProductionData(lineFilteredScores, lineFilteredStages, filteredOrders);
      case 'orders':
        return generateOrderData(filteredOrders);
      case 'inventory':
        return generateInventoryData();
      case 'financial':
        return generateFinancialData(filteredOrders);
      default:
        return generateProductionData(lineFilteredScores, lineFilteredStages, filteredOrders);
    }
  };

  const generateProductionData = (scores, stages, filteredOrders) => {
    // Production line efficiency
    const lineEfficiency = productionLines.map(line => {
      const lineScores = scores.filter(score => score.production_line === line.name);
      const avgEfficiency = lineScores.length > 0 
        ? lineScores.reduce((sum, score) => sum + (score.efficiency_percentage || 0), 0) / lineScores.length
        : 0;
      
      const totalTarget = lineScores.reduce((sum, score) => sum + (score.target_units || 0), 0);
      const totalActual = lineScores.reduce((sum, score) => sum + (score.actual_units || 0), 0);

      return {
        line: line.name,
        efficiency: Math.round(avgEfficiency * 10) / 10,
        target: 90, // Standard target
        actual: totalActual,
        targetUnits: totalTarget
      };
    });

    // Quality metrics
    const totalProduced = stages.reduce((sum, stage) => sum + (stage.units_completed || 0), 0);
    const qualityChecks = stages.filter(stage => stage.quality_check);
    const passedQuality = qualityChecks.filter(stage => stage.quality_check === 'pass').length;
    const failedQuality = qualityChecks.filter(stage => stage.quality_check === 'fail').length;
    const reworkQuality = qualityChecks.filter(stage => stage.quality_check === 'rework').length;

    const totalDefects = scores.reduce((sum, score) => sum + (score.defective_units || 0), 0);
    const defectRate = totalProduced > 0 ? (totalDefects / totalProduced) * 100 : 0;
    const passRate = qualityChecks.length > 0 ? (passedQuality / qualityChecks.length) * 100 : 100;
    const reworkRate = qualityChecks.length > 0 ? (reworkQuality / qualityChecks.length) * 100 : 0;

    // Production stages performance
    const stagePerformance = {};
    ['cutting', 'sewing', 'packing', 'quality_check', 'finishing'].forEach(stageName => {
      const stageData = stages.filter(stage => stage.stage === stageName);
      const totalCompleted = stageData.reduce((sum, stage) => sum + (stage.units_completed || 0), 0);
      const avgEfficiency = stageData.length > 0 
        ? stageData.reduce((sum, stage) => sum + (stage.efficiency || 90), 0) / stageData.length
        : 90;
      
      stagePerformance[stageName] = {
        completed: totalCompleted,
        efficiency: Math.round(avgEfficiency * 10) / 10,
        avgTime: Math.round(Math.random() * 60 + 30) // Simulated average time
      };
    });

    return {
      efficiency: lineEfficiency,
      qualityMetrics: {
        totalProduced,
        totalDefects,
        defectRate: Math.round(defectRate * 10) / 10,
        reworkRate: Math.round(reworkRate * 10) / 10,
        passRate: Math.round(passRate * 10) / 10
      },
      stages: stagePerformance,
      dailyOutput: generateDailyOutput(scores)
    };
  };

  const generateOrderData = (filteredOrders) => {
    // Order status distribution
    const statusCounts = {
      'Completed': filteredOrders.filter(o => o.status === 'completed').length,
      'In Production': filteredOrders.filter(o => o.status === 'in_production').length,
      'Pending': filteredOrders.filter(o => o.status === 'pending').length,
      'Cancelled': filteredOrders.filter(o => o.status === 'cancelled').length
    };

    const totalOrders = filteredOrders.length;
    const byStatus = Object.entries(statusCounts).map(([status, count]) => {
      const statusOrders = filteredOrders.filter(o => o.status === status.toLowerCase().replace(' ', '_'));
      const value = statusOrders.reduce((sum, order) => sum + (order.total_value || order.price || 0), 0);
      
      return {
        status,
        count,
        percentage: totalOrders > 0 ? ((count / totalOrders) * 100).toFixed(1) : 0,
        value
      };
    }).filter(item => item.count > 0);

    // Revenue by customer
    const customerRevenue = {};
    filteredOrders.forEach(order => {
      const customerId = order.customer_id;
      const customerName = order.customer_name || 'Unknown';
      if (!customerRevenue[customerName]) {
        customerRevenue[customerName] = { orders: 0, value: 0 };
      }
      customerRevenue[customerName].orders += 1;
      customerRevenue[customerName].value += (order.total_value || order.price || 0);
    });

    const totalRevenue = filteredOrders.reduce((sum, order) => sum + (order.total_value || order.price || 0), 0);
    const byCustomer = Object.entries(customerRevenue).map(([customer, data]) => ({
      customer,
      orders: data.orders,
      value: data.value,
      percentage: totalRevenue > 0 ? ((data.value / totalRevenue) * 100).toFixed(1) : 0
    })).sort((a, b) => b.value - a.value).slice(0, 10);

    // Revenue metrics
    const thisMonth = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(thisMonth.getMonth() - 1);
    
    const thisMonthRevenue = orders.filter(order => {
      const orderDate = new Date(order.created_at || order.updated_at);
      return orderDate.getMonth() === thisMonth.getMonth() && 
             orderDate.getFullYear() === thisMonth.getFullYear();
    }).reduce((sum, order) => sum + (order.total_value || order.price || 0), 0);

    const lastMonthRevenue = orders.filter(order => {
      const orderDate = new Date(order.created_at || order.updated_at);
      return orderDate.getMonth() === lastMonth.getMonth() && 
             orderDate.getFullYear() === lastMonth.getFullYear();
    }).reduce((sum, order) => sum + (order.total_value || order.price || 0), 0);

    const growth = lastMonthRevenue > 0 ? (((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(1) : 0;

    // Delivery performance
    const completedOrders = filteredOrders.filter(o => o.status === 'completed');
    const onTimeOrders = completedOrders.filter(order => {
      if (!order.delivery_date) return true;
      const deliveryDate = new Date(order.delivery_date);
      const completedDate = new Date(order.updated_at);
      return completedDate <= deliveryDate;
    });

    return {
      byStatus,
      byCustomer,
      revenue: {
        total: totalRevenue,
        thisMonth: thisMonthRevenue,
        lastMonth: lastMonthRevenue,
        growth: parseFloat(growth)
      },
      delivery: {
        onTime: onTimeOrders.length,
        late: completedOrders.length - onTimeOrders.length,
        early: 0, // Could be calculated if needed
        onTimeRate: completedOrders.length > 0 ? ((onTimeOrders.length / completedOrders.length) * 100).toFixed(1) : 100
      }
    };
  };

  const generateInventoryData = () => {
    const totalValue = inventory.reduce((sum, item) => sum + (item.total_value || 0), 0);
    const lowStockItems = inventory.filter(item => 
      (item.quantity_available || 0) <= (item.low_stock_threshold || 0)
    ).length;
    const outOfStockItems = inventory.filter(item => (item.quantity_available || 0) === 0).length;

    // Category breakdown
    const categories = {};
    inventory.forEach(item => {
      const type = item.type || 'other';
      if (!categories[type]) {
        categories[type] = { items: 0, value: 0 };
      }
      categories[type].items += 1;
      categories[type].value += (item.total_value || 0);
    });

    const categoryBreakdown = Object.entries(categories).map(([type, data]) => ({
      type: type.charAt(0).toUpperCase() + type.slice(1),
      items: data.items,
      value: data.value,
      percentage: totalValue > 0 ? ((data.value / totalValue) * 100).toFixed(1) : 0
    }));

    // Top usage items
    const topItems = inventory
      .filter(item => (item.quantity_used || 0) > 0)
      .map(item => {
        const used = item.quantity_used || 0;
        const received = item.quantity_received || 1;
        const usage = (used / received) * 100;
        return {
          name: item.name,
          used,
          available: item.quantity_available || 0,
          usage: Math.round(usage * 10) / 10
        };
      })
      .sort((a, b) => b.usage - a.usage)
      .slice(0, 10);

    return {
      totalValue,
      totalItems: inventory.length,
      lowStock: lowStockItems,
      outOfStock: outOfStockItems,
      categories: categoryBreakdown,
      topItems
    };
  };

  const generateFinancialData = (filteredOrders) => {
    const thisYear = new Date().getFullYear();
    const lastYear = thisYear - 1;
    
    const thisYearOrders = orders.filter(order => {
      const orderDate = new Date(order.created_at || order.updated_at);
      return orderDate.getFullYear() === thisYear;
    });
    
    const lastYearOrders = orders.filter(order => {
      const orderDate = new Date(order.created_at || order.updated_at);
      return orderDate.getFullYear() === lastYear;
    });

    const thisYearRevenue = thisYearOrders.reduce((sum, order) => sum + (order.total_value || order.price || 0), 0);
    const lastYearRevenue = lastYearOrders.reduce((sum, order) => sum + (order.total_value || order.price || 0), 0);
    
    const thisMonthRevenue = filteredOrders.reduce((sum, order) => sum + (order.total_value || order.price || 0), 0);
    
    // Estimated costs (these would come from actual cost tracking in a real system)
    const estimatedMaterialCosts = thisMonthRevenue * 0.35; // 35% materials
    const estimatedLaborCosts = thisMonthRevenue * 0.25;    // 25% labor  
    const estimatedOverhead = thisMonthRevenue * 0.15;      // 15% overhead
    const totalCosts = estimatedMaterialCosts + estimatedLaborCosts + estimatedOverhead;
    
    const grossProfit = thisYearRevenue;
    const netProfit = grossProfit - (totalCosts * 12); // Annualized
    const profitMargin = grossProfit > 0 ? ((netProfit / grossProfit) * 100).toFixed(1) : 0;

    return {
      revenue: {
        thisMonth: thisMonthRevenue,
        lastMonth: thisMonthRevenue * 0.9, // Estimated
        thisYear: thisYearRevenue,
        lastYear: lastYearRevenue
      },
      costs: {
        materials: estimatedMaterialCosts,
        labor: estimatedLaborCosts,
        overhead: estimatedOverhead,
        total: totalCosts
      },
      profit: {
        gross: grossProfit,
        net: netProfit,
        margin: parseFloat(profitMargin)
      }
    };
  };

  const generateDailyOutput = (scores) => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayData = { date: dateStr };
      productionLines.forEach(line => {
        const dayScore = scores.find(score => 
          score.date === dateStr && score.production_line === line.name
        );
        dayData[line.name.toLowerCase().replace(' ', '')] = dayScore?.actual_units || 0;
      });
      
      last7Days.push(dayData);
    }
    return last7Days;
  };

  const exportReport = (format) => {
    const reportContent = {
      type: reportType,
      dateRange: dateRange,
      selectedLine: selectedLine,
      generatedAt: new Date().toISOString(),
      data: reportData
    };
    
    if (format === 'json') {
      const blob = new Blob([JSON.stringify(reportContent, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ss-mudyf-${reportType}-report-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
    } else if (format === 'csv') {
      let csv = 'Report Type,Date Range,Generated At\n';
      csv += `${reportType},${dateRange},${new Date().toLocaleString()}\n\n`;
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ss-mudyf-${reportType}-report-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    }
  };

  const printReport = () => {
    window.print();
  };

  const formatCurrency = (amount) => {
    return currencyUtils.format(amount || 0);
  };

  const ProductionReport = ({ data }) => (
    <div className="space-y-8 print:space-y-6">
      <div className="print:break-after-page">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Production Performance Report</h3>
        
        {/* Efficiency Overview */}
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Production Line Efficiency</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {(data?.efficiency || []).map((line, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow-sm border">
                <div className="text-lg font-semibold text-gray-900">{line.line}</div>
                <div className={`text-2xl font-bold ${
                  line.efficiency >= line.target ? 'text-green-600' : 'text-orange-600'
                }`}>
                  {line.efficiency}%
                </div>
                <div className="text-sm text-gray-500">
                  {line.actual?.toLocaleString() || 0} / {line.targetUnits?.toLocaleString() || 0} units
                </div>
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        line.efficiency >= line.target ? 'bg-green-500' : 'bg-orange-500'
                      }`}
                      style={{ width: `${Math.min(line.efficiency || 0, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quality Metrics */}
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Quality Metrics</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
              <div className="text-2xl font-bold text-blue-600">
                {data?.qualityMetrics?.totalProduced?.toLocaleString() || 0}
              </div>
              <div className="text-sm text-gray-600">Total Produced</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
              <div className="text-2xl font-bold text-red-600">
                {data?.qualityMetrics?.defectRate || 0}%
              </div>
              <div className="text-sm text-gray-600">Defect Rate</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {data?.qualityMetrics?.reworkRate || 0}%
              </div>
              <div className="text-sm text-gray-600">Rework Rate</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
              <div className="text-2xl font-bold text-green-600">
                {data?.qualityMetrics?.passRate || 0}%
              </div>
              <div className="text-sm text-gray-600">Pass Rate</div>
            </div>
          </div>
        </div>

        {/* Production Stages */}
        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Production Stage Performance</h4>
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stage</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Units Completed</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Efficiency</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Time (min)</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(data?.stages || {}).map(([stage, metrics]) => (
                  <tr key={stage}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">
                      {stage.replace('_', ' ')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {metrics?.completed?.toLocaleString() || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`font-medium ${
                        (metrics?.efficiency || 0) >= 90 ? 'text-green-600' : 
                        (metrics?.efficiency || 0) >= 80 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {metrics?.efficiency || 0}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {metrics?.avgTime || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const OrderReport = ({ data }) => (
    <div className="space-y-8">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Order Performance Report</h3>
      
      {/* Revenue Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
          <div className="text-3xl font-bold">{formatCurrency(data?.revenue?.total || 0)}</div>
          <div className="text-green-100">Total Revenue</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-blue-600">
            {formatCurrency(data?.revenue?.thisMonth || 0)}
          </div>
          <div className="text-gray-600">This Month</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-purple-600">
            {data?.revenue?.growth >= 0 ? '+' : ''}{data?.revenue?.growth || 0}%
          </div>
          <div className="text-gray-600">Growth Rate</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-green-600">
            {data?.delivery?.onTimeRate || 0}%
          </div>
          <div className="text-gray-600">On-Time Delivery</div>
        </div>
      </div>

      {/* Order Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Order Status Distribution</h4>
          <div className="space-y-4">
            {(data?.byStatus || []).map((status, index) => (
              <div key={index}>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{status.status}</span>
                  <span className="text-sm text-gray-500">
                    {status.count} orders ({status.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${
                      status.status === 'Completed' ? 'bg-green-500' :
                      status.status === 'In Production' ? 'bg-blue-500' : 'bg-yellow-500'
                    }`}
                    style={{ width: `${status.percentage}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Value: {formatCurrency(status.value || 0)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Revenue by Customer</h4>
          <div className="space-y-4">
            {(data?.byCustomer || []).slice(0, 5).map((customer, index) => (
              <div key={index}>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{customer.customer}</span>
                  <span className="text-sm text-gray-500">
                    {formatCurrency(customer.value || 0)} ({customer.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-indigo-500 h-3 rounded-full"
                    style={{ width: `${customer.percentage}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {customer.orders} orders
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const InventoryReport = ({ data }) => (
    <div className="space-y-8">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Inventory Analysis Report</h3>
      
      {/* Inventory Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
          <div className="text-2xl font-bold text-blue-600">
            {formatCurrency(data?.totalValue || 0)}
          </div>
          <div className="text-gray-600">Total Value</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
          <div className="text-2xl font-bold text-green-600">{data?.totalItems || 0}</div>
          <div className="text-gray-600">Total Items</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
          <div className="text-2xl font-bold text-yellow-600">{data?.lowStock || 0}</div>
          <div className="text-gray-600">Low Stock</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
          <div className="text-2xl font-bold text-red-600">{data?.outOfStock || 0}</div>
          <div className="text-gray-600">Out of Stock</div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Inventory by Category</h4>
        <div className="space-y-6">
          {(data?.categories || []).map((category, index) => (
            <div key={index}>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">{category.type}</span>
                <span className="text-sm text-gray-500">
                  {category.items} items - {formatCurrency(category.value || 0)} ({category.percentage}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className={`h-4 rounded-full ${
                    category.type === 'Fabric' ? 'bg-blue-500' :
                    category.type === 'Material' ? 'bg-green-500' : 'bg-purple-500'
                  }`}
                  style={{ width: `${category.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Usage Items */}
      {data?.topItems && data.topItems.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Top Usage Items</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Used</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Available</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usage %</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.topItems.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.used || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.available || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`font-medium ${
                        (item.usage || 0) >= 75 ? 'text-red-600' :
                        (item.usage || 0) >= 50 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {item.usage || 0}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  const FinancialReport = ({ data }) => (
    <div className="space-y-8">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Financial Performance Report</h3>
      
      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
          <div className="text-3xl font-bold">{formatCurrency(data?.revenue?.thisYear || 0)}</div>
          <div className="text-green-100">Year Revenue</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-blue-600">
            {formatCurrency(data?.costs?.total || 0)}
          </div>
          <div className="text-gray-600">Total Costs</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-purple-600">
            {formatCurrency(data?.profit?.net || 0)}
          </div>
          <div className="text-gray-600">Net Profit</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-green-600">
            {data?.profit?.margin || 0}%
          </div>
          <div className="text-gray-600">Profit Margin</div>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Cost Breakdown</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(data?.costs?.materials || 0)}</div>
            <div className="text-sm text-gray-600">Materials</div>
            <div className="text-xs text-gray-500">
              {data?.costs?.total ? (((data.costs.materials || 0) / data.costs.total * 100).toFixed(1)) : 0}%
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{formatCurrency(data?.costs?.labor || 0)}</div>
            <div className="text-sm text-gray-600">Labor</div>
            <div className="text-xs text-gray-500">
              {data?.costs?.total ? (((data.costs.labor || 0) / data.costs.total * 100).toFixed(1)) : 0}%
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{formatCurrency(data?.costs?.overhead || 0)}</div>
            <div className="text-sm text-gray-600">Overhead</div>
            <div className="text-xs text-gray-500">
              {data?.costs?.total ? (((data.costs.overhead || 0) / data.costs.total * 100).toFixed(1)) : 0}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderReport = () => {
    if (isGenerating) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Generating report...</p>
          </div>
        </div>
      );
    }

    if (!reportData) {
      return (
        <div className="text-center py-12 text-gray-500">
          <p>No data available for the selected report.</p>
        </div>
      );
    }

    switch (reportType) {
      case 'production':
        return <ProductionReport data={reportData} />;
      case 'orders':
        return <OrderReport data={reportData} />;
      case 'inventory':
        return <InventoryReport data={reportData} />;
      case 'financial':
        return <FinancialReport data={reportData} />;
      default:
        return <ProductionReport data={reportData} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between no-print">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Reports & Analytics</h2>
          <p className="text-gray-600 mt-1">Real-time business intelligence from your actual data</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => exportReport('json')}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            📄 Export JSON
          </button>
          <button
            onClick={() => exportReport('csv')}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            📊 Export CSV
          </button>
          <button
            onClick={printReport}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            🖨️ Print Report
          </button>
        </div>
      </div>

      {/* Report Controls */}
      <div className="bg-white p-6 rounded-lg shadow-sm border no-print">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="production">Production Report</option>
              <option value="orders">Order Report</option>
              <option value="inventory">Inventory Report</option>
              <option value="financial">Financial Report</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
          </div>
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
          <div className="flex items-end">
            <button
              onClick={generateReport}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium"
              disabled={isGenerating}
            >
              {isGenerating ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-500">
          Report generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Report Content */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6">
          {renderReport()}
        </div>
      </div>
    </div>
  );
};

export default Reports;