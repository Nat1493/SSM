// ==============================================
// src/components/Dashboard.js - ENHANCED & FULLY FUNCTIONAL
// ==============================================
import React, { useState, useEffect } from 'react';

const Dashboard = () => {
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
    // Set up real-time updates every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, [selectedTimeframe]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock comprehensive data
    const mockStats = {
      totalOrders: 45,
      pendingOrders: 12,
      inProductionOrders: 18,
      completedOrders: 15,
      totalCustomers: 8,
      activeProductionLines: 4,
      avgEfficiency: 87.5,
      totalRevenue: 55900,
      lowStockItems: 8,
      criticalOrders: 3
    };

    const mockRecentActivity = [
      {
        id: 1,
        type: 'order_completed',
        message: 'Order ORD-2025-015 completed successfully',
        timestamp: '2025-08-30T14:30:00Z',
        icon: '✅',
        color: 'text-green-600'
      },
      {
        id: 2,
        type: 'production_alert',
        message: 'Line C efficiency dropped to 78% - attention needed',
        timestamp: '2025-08-30T13:45:00Z',
        icon: '⚠️',
        color: 'text-yellow-600'
      },
      {
        id: 3,
        type: 'inventory_low',
        message: 'Cotton Canvas stock running low (20 meters remaining)',
        timestamp: '2025-08-30T12:20:00Z',
        icon: '📦',
        color: 'text-orange-600'
      },
      {
        id: 4,
        type: 'new_order',
        message: 'New order ORD-2025-016 received from Elite Fashion',
        timestamp: '2025-08-30T11:15:00Z',
        icon: '📋',
        color: 'text-blue-600'
      },
      {
        id: 5,
        type: 'quality_issue',
        message: 'Quality check failed for batch STY-003-M (12 units rework needed)',
        timestamp: '2025-08-30T10:30:00Z',
        icon: '🔍',
        color: 'text-red-600'
      }
    ];

    const mockUpcomingDeadlines = [
      {
        id: 1,
        order_number: 'ORD-2025-003',
        customer: 'Trend Makers',
        delivery_date: '2025-09-10',
        days_remaining: 11,
        priority: 'Critical',
        completion: 75,
        status: 'in_production'
      },
      {
        id: 2,
        order_number: 'ORD-2025-001',
        customer: 'Fashion Plus Ltd',
        delivery_date: '2025-09-15',
        days_remaining: 16,
        priority: 'High',
        completion: 60,
        status: 'in_production'
      },
      {
        id: 3,
        order_number: 'ORD-2025-002',
        customer: 'Style Central Inc',
        delivery_date: '2025-09-20',
        days_remaining: 21,
        priority: 'Medium',
        completion: 25,
        status: 'pending'
      },
      {
        id: 4,
        order_number: 'ORD-2025-004',
        customer: 'Elite Fashion',
        delivery_date: '2025-09-25',
        days_remaining: 26,
        priority: 'Medium',
        completion: 40,
        status: 'in_production'
      }
    ];

    const mockProductionSummary = [
      {
        line: 'Line A',
        status: 'Running',
        efficiency: 95.2,
        target: 300,
        actual: 286,
        operator_count: 6,
        current_order: 'ORD-2025-001'
      },
      {
        line: 'Line B',
        status: 'Running',
        efficiency: 89.8,
        target: 250,
        actual: 225,
        operator_count: 5,
        current_order: 'ORD-2025-002'
      },
      {
        line: 'Line C',
        status: 'Maintenance',
        efficiency: 78.9,
        target: 400,
        actual: 316,
        operator_count: 8,
        current_order: 'ORD-2025-003'
      },
      {
        line: 'Line D',
        status: 'Running',
        efficiency: 102.1,
        target: 200,
        actual: 204,
        operator_count: 4,
        current_order: 'ORD-2025-004'
      }
    ];

    const mockAlerts = [
      {
        id: 1,
        type: 'critical',
        title: 'Critical Delivery Alert',
        message: 'Order ORD-2025-003 due in 11 days - 25% behind schedule',
        action: 'Review Production Schedule'
      },
      {
        id: 2,
        type: 'warning',
        title: 'Inventory Low',
        message: '8 items are running low on stock',
        action: 'Check Inventory'
      },
      {
        id: 3,
        type: 'info',
        title: 'Efficiency Target',
        message: 'Line C below 80% efficiency for 3 consecutive days',
        action: 'Investigate Issues'
      }
    ];

    setStats(mockStats);
    setRecentActivity(mockRecentActivity);
    setUpcomingDeadlines(mockUpcomingDeadlines);
    setProductionSummary(mockProductionSummary);
    setAlerts(mockAlerts);
    setIsLoading(false);
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
    if (days <= 7) return 'text-red-600 bg-red-100';
    if (days <= 14) return 'text-orange-600 bg-orange-100';
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
            Welcome to SS Mudyf Order Tracking System
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
          subtitle="Active in system"
          trend={{ positive: true, value: '+3 this week' }}
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
          subtitle="This month"
          trend={{ positive: true, value: '+12%' }}
        />
        <StatCard
          title="Revenue"
          value={`$${(stats.totalRevenue / 1000).toFixed(0)}K`}
          icon="💰"
          color="text-purple-600"
          subtitle="Total order value"
          trend={{ positive: true, value: '+8.3%' }}
        />
        <StatCard
          title="Efficiency"
          value={`${stats.avgEfficiency}%`}
          icon="📊"
          color="text-orange-600"
          subtitle="Average across lines"
          trend={{ positive: false, value: '-2.1%' }}
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
                    <span>Progress: {line.actual} / {line.target} units</span>
                    <span>{((line.actual / line.target) * 100).toFixed(1)}% complete</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        line.efficiency >= 100 ? 'bg-green-500' :
                        line.efficiency >= 90 ? 'bg-blue-500' :
                        line.efficiency >= 80 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min((line.actual / line.target) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          </div>
          <div className="p-4 max-h-96 overflow-y-auto">
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
          </div>
        </div>
      </div>

      {/* Upcoming Deadlines */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Upcoming Delivery Deadlines</h3>
        </div>
        <div className="overflow-x-auto">
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
                      {order.days_remaining} days
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
        </div>
      </div>
    </div>
  );
};

export default Dashboard;