// ==============================================
// src/components/Dashboard.js - FIXED TO USE REAL DATA
// ==============================================
import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { currencyUtils } from '../utils/currency';
import { dateUtils } from '../utils/dateUtils';

const Dashboard = () => {
  const { 
    orders, 
    customers, 
    inventory, 
    productionStages, 
    dailyScores, 
    productionLines, 
    settings,
    actions 
  } = useData();

  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    inProductionOrders: 0,
    completedOrders: 0,
    totalCustomers: 0,
    activeProductionLines: 0,
    avgEfficiency: 0,
    totalRevenue: 0,
    lowStockItems: 0,
    criticalOrders: 0
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
  const [productionSummary, setProductionSummary] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('today');

  useEffect(() => {
    loadDashboardData();
  }, [orders, customers, inventory, productionStages, dailyScores, productionLines, selectedTimeframe]);

  const loadDashboardData = () => {
    setIsLoading(true);
    
    try {
      // Calculate real statistics
      const pendingOrders = orders.filter(order => order.status === 'pending').length;
      const inProductionOrders = orders.filter(order => order.status === 'in_production').length;
      const completedOrders = orders.filter(order => order.status === 'completed').length;
      const totalRevenue = orders.reduce((sum, order) => sum + (order.price || 0), 0);
      const activeLines = productionLines.filter(line => line.status === 'active').length;
      const lowStockItems = inventory.filter(item => 
        (item.quantity_available || 0) <= (item.low_stock_threshold || 0)
      ).length;
      
      // Calculate critical orders (due within 7 days)
      const today = new Date();
      const criticalOrders = orders.filter(order => {
        if (!order.delivery_date || order.status === 'completed') return false;
        const deliveryDate = new Date(order.delivery_date);
        const daysUntil = Math.ceil((deliveryDate - today) / (1000 * 60 * 60 * 24));
        return daysUntil <= 7 && daysUntil >= 0;
      }).length;

      // Calculate average efficiency from recent daily scores
      const recentScores = dailyScores
        .filter(score => {
          const scoreDate = new Date(score.date);
          const daysDiff = Math.floor((today - scoreDate) / (1000 * 60 * 60 * 24));
          return daysDiff <= 7; // Last 7 days
        });
      
      const avgEfficiency = recentScores.length > 0
        ? recentScores.reduce((sum, score) => sum + (score.efficiency_percentage || 0), 0) / recentScores.length
        : 0;

      const calculatedStats = {
        totalOrders: orders.length,
        pendingOrders,
        inProductionOrders,
        completedOrders,
        totalCustomers: customers.length,
        activeProductionLines: activeLines,
        avgEfficiency: Math.round(avgEfficiency * 10) / 10,
        totalRevenue,
        lowStockItems,
        criticalOrders
      };

      setStats(calculatedStats);

      // Generate real recent activity
      generateRecentActivity();
      
      // Generate real upcoming deadlines
      generateUpcomingDeadlines();
      
      // Generate real production summary
      generateProductionSummary();
      
      // Generate real alerts
      generateAlerts(calculatedStats);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateRecentActivity = () => {
    const activity = [];
    const now = new Date();

    // Add order-based activities
    orders.slice(0, 10).forEach(order => {
      const createdDate = new Date(order.created_at || order.updated_at || now);
      const daysDiff = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff <= 7) { // Last 7 days
        let activityType, message, icon, color;
        
        switch (order.status) {
          case 'completed':
            activityType = 'order_completed';
            message = `Order ${order.order_number} completed for ${order.customer_name}`;
            icon = '✅';
            color = 'text-green-600';
            break;
          case 'in_production':
            activityType = 'production_started';
            message = `Order ${order.order_number} started production on ${order.production_line}`;
            icon = '🏭';
            color = 'text-blue-600';
            break;
          case 'pending':
            activityType = 'new_order';
            message = `New order ${order.order_number} received from ${order.customer_name}`;
            icon = '📋';
            color = 'text-blue-600';
            break;
          default:
            return;
        }

        activity.push({
          id: `order-${order.id}`,
          type: activityType,
          message,
          timestamp: order.updated_at || order.created_at || now.toISOString(),
          icon,
          color
        });
      }
    });

    // Add inventory alerts
    inventory.forEach(item => {
      if ((item.quantity_available || 0) <= (item.low_stock_threshold || 0)) {
        activity.push({
          id: `inventory-${item.id}`,
          type: 'inventory_low',
          message: `${item.name} stock running low (${item.quantity_available || 0} ${item.unit} remaining)`,
          timestamp: item.last_updated || now.toISOString(),
          icon: '📦',
          color: 'text-orange-600'
        });
      }
    });

    // Add production stage activities
    productionStages.slice(0, 5).forEach(stage => {
      const stageDate = new Date(stage.created_at || now);
      const daysDiff = Math.floor((now - stageDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff <= 3) { // Last 3 days
        const order = orders.find(o => o.id === stage.order_id);
        activity.push({
          id: `stage-${stage.id}`,
          type: 'production_stage',
          message: `${stage.stage} completed for order ${order?.order_number || 'Unknown'} - ${stage.units_completed} units`,
          timestamp: stage.created_at || now.toISOString(),
          icon: getStageIcon(stage.stage),
          color: 'text-purple-600'
        });
      }
    });

    // Sort by timestamp (most recent first) and limit to 8 items
    const sortedActivity = activity
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 8);

    setRecentActivity(sortedActivity);
  };

  const generateUpcomingDeadlines = () => {
    const today = new Date();
    
    const deadlines = orders
      .filter(order => {
        if (!order.delivery_date || order.status === 'completed') return false;
        const deliveryDate = new Date(order.delivery_date);
        const daysUntil = Math.ceil((deliveryDate - today) / (1000 * 60 * 60 * 24));
        return daysUntil >= -5 && daysUntil <= 30; // Show overdue (up to 5 days) and upcoming (30 days)
      })
      .map(order => {
        const deliveryDate = new Date(order.delivery_date);
        const daysRemaining = Math.ceil((deliveryDate - today) / (1000 * 60 * 60 * 24));
        
        // Calculate completion percentage based on production stages
        const orderStages = productionStages.filter(stage => stage.order_id === order.id);
        const totalCompleted = orderStages.reduce((sum, stage) => sum + (stage.units_completed || 0), 0);
        const completion = order.total_units > 0 ? Math.min((totalCompleted / order.total_units) * 100, 100) : 0;
        
        return {
          id: order.id,
          order_number: order.order_number,
          customer: order.customer_name,
          delivery_date: order.delivery_date,
          days_remaining: daysRemaining,
          priority: order.priority || 'Medium',
          completion: Math.round(completion),
          status: order.status
        };
      })
      .sort((a, b) => a.days_remaining - b.days_remaining) // Sort by urgency
      .slice(0, 10); // Limit to 10 most urgent

    setUpcomingDeadlines(deadlines);
  };

  const generateProductionSummary = () => {
    const summary = productionLines.map(line => {
      // Get recent daily scores for this line
      const lineScores = dailyScores
        .filter(score => score.production_line === line.name)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 7); // Last 7 days

      // Calculate average efficiency
      const avgEfficiency = lineScores.length > 0
        ? lineScores.reduce((sum, score) => sum + (score.efficiency_percentage || 0), 0) / lineScores.length
        : line.efficiency || 0;

      // Get today's score
      const today = new Date().toISOString().split('T')[0];
      const todayScore = lineScores.find(score => score.date === today);
      
      // Find current order for this line
      const currentOrder = orders.find(order => 
        order.production_line === line.name && 
        (order.status === 'in_production' || order.status === 'pending')
      );

      return {
        line: line.name,
        status: line.status === 'active' ? 'Running' : 
                line.status === 'maintenance' ? 'Maintenance' : 'Stopped',
        efficiency: Math.round(avgEfficiency * 10) / 10,
        target: todayScore?.target_units || line.capacity || 0,
        actual: todayScore?.actual_units || 0,
        operator_count: todayScore?.operator_count || line.operatorCount || 0,
        current_order: currentOrder?.order_number || 'None'
      };
    });

    setProductionSummary(summary);
  };

  const generateAlerts = (stats) => {
    const alerts = [];

    // Critical delivery alerts
    if (stats.criticalOrders > 0) {
      alerts.push({
        id: 'critical-deliveries',
        type: 'critical',
        title: 'Critical Delivery Alert',
        message: `${stats.criticalOrders} order${stats.criticalOrders === 1 ? '' : 's'} due within 7 days`,
        action: 'Review Orders'
      });
    }

    // Low stock alerts
    if (stats.lowStockItems > 0) {
      alerts.push({
        id: 'low-stock',
        type: 'warning',
        title: 'Inventory Alert',
        message: `${stats.lowStockItems} item${stats.lowStockItems === 1 ? ' is' : 's are'} running low on stock`,
        action: 'Check Inventory'
      });
    }

    // Efficiency alerts
    if (stats.avgEfficiency < 80 && stats.avgEfficiency > 0) {
      alerts.push({
        id: 'low-efficiency',
        type: 'warning',
        title: 'Production Efficiency',
        message: `Average efficiency is ${stats.avgEfficiency}% - below target of 90%`,
        action: 'Review Production'
      });
    }

    // High efficiency celebration
    if (stats.avgEfficiency >= 95) {
      alerts.push({
        id: 'high-efficiency',
        type: 'info',
        title: 'Excellent Performance',
        message: `Outstanding efficiency of ${stats.avgEfficiency}% - above 95% target!`,
        action: 'View Details'
      });
    }

    // No active production lines alert
    if (stats.activeProductionLines === 0 && productionLines.length > 0) {
      alerts.push({
        id: 'no-active-lines',
        type: 'critical',
        title: 'Production Alert',
        message: 'No production lines are currently active',
        action: 'Check Production'
      });
    }

    setAlerts(alerts);
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

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getDaysRemainingColor = (days) => {
    if (days < 0) return 'text-red-600 bg-red-100'; // Overdue
    if (days <= 3) return 'text-red-600 bg-red-100';
    if (days <= 7) return 'text-orange-600 bg-orange-100';
    if (days <= 14) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEfficiencyColor = (efficiency) => {
    if (efficiency >= 100) return 'text-green-600';
    if (efficiency >= 90) return 'text-blue-600';
    if (efficiency >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Running': return '🟢';
      case 'Maintenance': return '🟡';
      case 'Stopped': return '🔴';
      default: return '⚪';
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'critical': return '🚨';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'critical': return 'border-l-red-500 bg-red-50';
      case 'warning': return 'border-l-orange-500 bg-orange-50';
      case 'info': return 'border-l-blue-500 bg-blue-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const formatCurrency = (amount) => {
    return currencyUtils.format(amount);
  };

  const StatCard = ({ title, value, icon, color, subtitle, trend }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-3xl font-bold ${color} mb-1`}>{value}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          {trend && (
            <p className={`text-xs font-medium ${trend.positive ? 'text-green-600' : 'text-red-600'} mt-1`}>
              {trend.positive ? '↗' : '↘'} {trend.value}
            </p>
          )}
        </div>
        <div className="text-4xl opacity-80">{icon}</div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading dashboard data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-600 mt-1">
            Welcome to {settings.company?.name || 'SS Mudyf'} Order Tracking System
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
          <div className="text-sm text-gray-500">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div key={alert.id} className={`border-l-4 p-4 ${getAlertColor(alert.type)} rounded-r-lg`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{getAlertIcon(alert.type)}</span>
                  <div>
                    <h4 className="font-semibold text-gray-900">{alert.title}</h4>
                    <p className="text-sm text-gray-700">{alert.message}</p>
                  </div>
                </div>
                <button className="text-sm bg-white px-3 py-1 rounded border hover:bg-gray-50 transition-colors">
                  {alert.action}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon="📋"
          color="text-blue-600"
          subtitle="All orders in system"
        />
        <StatCard
          title="In Production"
          value={stats.inProductionOrders}
          icon="🏭"
          color="text-green-600"
          subtitle={`${stats.pendingOrders} pending`}
        />
        <StatCard
          title="Completed"
          value={stats.completedOrders}
          icon="✅"
          color="text-green-600"
          subtitle="Successfully delivered"
        />
        <StatCard
          title="Revenue"
          value={formatCurrency(stats.totalRevenue)}
          icon="💰"
          color="text-purple-600"
          subtitle="Total order value"
        />
        <StatCard
          title="Efficiency"
          value={`${stats.avgEfficiency}%`}
          icon="📊"
          color={stats.avgEfficiency >= 90 ? "text-green-600" : stats.avgEfficiency >= 80 ? "text-yellow-600" : "text-red-600"}
          subtitle="Average (last 7 days)"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-lg font-bold text-gray-900">{stats.totalCustomers}</div>
          <div className="text-sm text-gray-600">Active Customers</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-lg font-bold text-blue-600">{stats.activeProductionLines}</div>
          <div className="text-sm text-gray-600">Production Lines</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-lg font-bold text-orange-600">{stats.lowStockItems}</div>
          <div className="text-sm text-gray-600">Low Stock Items</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-lg font-bold text-red-600">{stats.criticalOrders}</div>
          <div className="text-sm text-gray-600">Critical Orders</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Production Summary */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Production Lines Status</h3>
          </div>
          <div className="p-6">
            {productionSummary.length > 0 ? (
              <div className="space-y-4">
                {productionSummary.map((line, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{getStatusIcon(line.status)}</span>
                        <div>
                          <h4 className="font-semibold text-gray-900">{line.line}</h4>
                          <p className="text-sm text-gray-500">{line.status} - {line.current_order}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${getEfficiencyColor(line.efficiency)}`}>
                          {line.efficiency}%
                        </div>
                        <div className="text-xs text-gray-500">{line.operator_count} operators</div>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Today: {line.actual} / {line.target} units</span>
                      <span>{line.target > 0 ? ((line.actual / line.target) * 100).toFixed(1) : 0}% of target</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          line.efficiency >= 100 ? 'bg-green-500' :
                          line.efficiency >= 90 ? 'bg-blue-500' :
                          line.efficiency >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min((line.actual / (line.target || 1)) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No production lines configured.</p>
                <button 
                  onClick={() => window.dispatchEvent(new CustomEvent('navigate-to-production'))}
                  className="mt-2 text-blue-600 hover:text-blue-800 font-medium"
                >
                  Set up production lines →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          </div>
          <div className="p-4 max-h-96 overflow-y-auto">
            {recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <span className="text-lg flex-shrink-0 mt-0.5">{activity.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTimeAgo(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No recent activity.</p>
                <p className="text-xs mt-1">Activity will appear here as you use the system.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upcoming Deadlines */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Upcoming Delivery Deadlines</h3>
        </div>
        <div className="overflow-x-auto">
          {upcomingDeadlines.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Delivery Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Days Left
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {upcomingDeadlines.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      {order.order_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.customer}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.delivery_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getDaysRemainingColor(order.days_remaining)}`}>
                        {order.days_remaining < 0 ? `${Math.abs(order.days_remaining)} days overdue` : `${order.days_remaining} days`}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(order.priority)}`}>
                        {order.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${order.completion}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium">{order.completion}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        order.status === 'in_production' ? 'bg-blue-100 text-blue-800' : 
                        order.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No upcoming deadlines.</p>
              <p className="text-xs mt-1">Orders with delivery dates will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;