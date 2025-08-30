// ==============================================
// src/components/Reports.js - FIXED RUNTIME ERRORS
// ==============================================
import React, { useState, useEffect } from 'react';

const Reports = () => {
  const [reportType, setReportType] = useState('production');
  const [dateRange, setDateRange] = useState('month');
  const [selectedLine, setSelectedLine] = useState('all');
  const [reportData, setReportData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Mock data for reports
  const mockData = {
    production: {
      efficiency: [
        { line: 'Line A', efficiency: 87.5, target: 90, actual: 2625, targetUnits: 3000 },
        { line: 'Line B', efficiency: 92.3, target: 90, actual: 2307, targetUnits: 2500 },
        { line: 'Line C', efficiency: 78.9, target: 90, actual: 3156, targetUnits: 4000 },
        { line: 'Line D', efficiency: 95.1, target: 90, actual: 1902, targetUnits: 2000 }
      ],
      dailyOutput: [
        { date: '2025-08-24', lineA: 245, lineB: 220, lineC: 380, lineD: 180 },
        { date: '2025-08-25', lineA: 278, lineB: 235, lineC: 395, lineD: 195 },
        { date: '2025-08-26', lineA: 289, lineB: 242, lineC: 410, lineD: 205 },
        { date: '2025-08-27', lineA: 267, lineB: 228, lineC: 385, lineD: 188 },
        { date: '2025-08-28', lineA: 301, lineB: 251, lineC: 425, lineD: 210 },
        { date: '2025-08-29', lineA: 278, lineB: 238, lineC: 400, lineD: 195 },
        { date: '2025-08-30', lineA: 256, lineB: 225, lineC: 375, lineD: 185 }
      ],
      qualityMetrics: {
        totalProduced: 12500,
        totalDefects: 125,
        defectRate: 1.0,
        reworkRate: 2.3,
        passRate: 96.7
      },
      stages: {
        cutting: { completed: 8500, efficiency: 94.2, avgTime: 45 },
        sewing: { completed: 7200, efficiency: 89.8, avgTime: 120 },
        packing: { completed: 6800, efficiency: 92.1, avgTime: 30 },
        quality_check: { completed: 6750, efficiency: 88.5, avgTime: 15 }
      }
    },
    orders: {
      byStatus: [
        { status: 'Completed', count: 33, percentage: 73.3, value: 274125 },
        { status: 'In Production', count: 8, percentage: 17.8, value: 65100 },
        { status: 'Pending', count: 4, percentage: 8.9, value: 32225 }
      ],
      byCustomer: [
        { customer: 'Fashion Plus Ltd', orders: 15, value: 124875, percentage: 33.6 },
        { customer: 'Style Central Inc', orders: 8, value: 65100, percentage: 17.6 },
        { customer: 'Trend Makers', orders: 12, value: 103800, percentage: 28.0 },
        { customer: 'Elite Fashion', orders: 10, value: 78175, percentage: 21.1 }
      ],
      revenue: {
        total: 371450,
        thisMonth: 123675,
        lastMonth: 101000,
        growth: 22.4
      },
      delivery: {
        onTime: 38,
        late: 5,
        early: 2,
        onTimeRate: 84.4
      }
    },
    inventory: {
      totalValue: 284275,
      totalItems: 125,
      lowStock: 8,
      outOfStock: 2,
      categories: [
        { type: 'Fabric', items: 45, value: 189600, percentage: 66.7 },
        { type: 'Materials', items: 35, value: 59125, percentage: 20.8 },
        { type: 'Trims', items: 45, value: 35550, percentage: 12.5 }
      ],
      usage: [
        { month: 'Jun', fabric: 1200, materials: 450, trims: 680 },
        { month: 'Jul', fabric: 1350, materials: 520, trims: 720 },
        { month: 'Aug', fabric: 1480, materials: 580, trims: 850 }
      ],
      topItems: [
        { name: 'Cotton Denim', used: 380, available: 120, usage: 76.0 },
        { name: 'Polyester Thread', used: 235, available: 65, usage: 78.3 },
        { name: 'Metal Buttons', used: 750, available: 250, usage: 75.0 },
        { name: 'YKK Zippers', used: 115, available: 85, usage: 57.5 }
      ]
    },
    financial: {
      revenue: {
        thisMonth: 123675,
        lastMonth: 101000,
        thisYear: 1102075,
        lastYear: 946125
      },
      costs: {
        materials: 56525,
        labor: 81100,
        overhead: 25270,
        total: 162895
      },
      profit: {
        gross: 939180,
        net: 776285,
        margin: 70.4
      },
      monthlyTrend: [
        { month: 'Mar', revenue: 96525, costs: 61200, profit: 35325 },
        { month: 'Apr', revenue: 111720, costs: 71820, profit: 39900 },
        { month: 'May', revenue: 103740, costs: 65835, profit: 37905 },
        { month: 'Jun', revenue: 114380, costs: 73150, profit: 41230 },
        { month: 'Jul', revenue: 101000, costs: 63840, profit: 37160 },
        { month: 'Aug', revenue: 123675, trades: 78430, profit: 45245 }
      ]
    }
  };

  useEffect(() => {
    generateReport();
  }, [reportType, dateRange, selectedLine]);

  const generateReport = async () => {
    setIsGenerating(true);
    
    // Simulate report generation delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setReportData(mockData[reportType]);
    setIsGenerating(false);
  };

  const exportReport = (format) => {
    const reportContent = {
      type: reportType,
      dateRange: dateRange,
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
      // Simple CSV export for demonstration
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
      
      {/* Revenue Summary - FIXED: Added null checks */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
          <div className="text-3xl font-bold">E {(data?.revenue?.total || 0).toLocaleString('en-SZ', {style: 'currency', currency: 'SZL'}).replace('SZL', '')}</div>
          <div className="text-green-100">Total Revenue</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-blue-600">
            E {(data?.revenue?.thisMonth || 0).toLocaleString('en-SZ', {style: 'currency', currency: 'SZL'}).replace('SZL', '')}
          </div>
          <div className="text-gray-600">This Month</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-purple-600">
            +{data?.revenue?.growth || 0}%
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

      {/* Order Status Distribution - FIXED: Added null checks */}
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
                  Value: E {(status.value || 0).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Revenue by Customer</h4>
          <div className="space-y-4">
            {(data?.byCustomer || []).map((customer, index) => (
              <div key={index}>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{customer.customer}</span>
                  <span className="text-sm text-gray-500">
                    E {(customer.value || 0).toLocaleString()} ({customer.percentage}%)
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

      {/* Delivery Performance - FIXED: Added null checks */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Delivery Performance</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{data?.delivery?.onTime || 0}</div>
            <div className="text-sm text-gray-600">On Time</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600">{data?.delivery?.late || 0}</div>
            <div className="text-sm text-gray-600">Late</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{data?.delivery?.early || 0}</div>
            <div className="text-sm text-gray-600">Early</div>
          </div>
        </div>
      </div>
    </div>
  );

  const InventoryReport = ({ data }) => (
    <div className="space-y-8">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Inventory Analysis Report</h3>
      
      {/* Inventory Overview - FIXED: Added null checks and safe toLocaleString calls */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
          <div className="text-2xl font-bold text-blue-600">
            E {(data?.totalValue || 0).toLocaleString()}
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

      {/* Category Breakdown - FIXED: Added null checks */}
      <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Inventory by Category</h4>
        <div className="space-y-6">
          {(data?.categories || []).map((category, index) => (
            <div key={index}>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">{category.type}</span>
                <span className="text-sm text-gray-500">
                  {category.items} items - E {(category.value || 0).toLocaleString()} ({category.percentage}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className={`h-4 rounded-full ${
                    category.type === 'Fabric' ? 'bg-blue-500' :
                    category.type === 'Materials' ? 'bg-green-500' : 'bg-purple-500'
                  }`}
                  style={{ width: `${category.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Usage Items - FIXED: Added null checks */}
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
              {(data?.topItems || []).map((item, index) => (
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
    </div>
  );

  const FinancialReport = ({ data }) => (
    <div className="space-y-8">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Financial Performance Report</h3>
      
      {/* Financial Summary - FIXED: Added null checks for thisYear and other revenue properties */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
          <div className="text-3xl font-bold">E {(data?.revenue?.thisYear || 0).toLocaleString()}</div>
          <div className="text-green-100">Year Revenue</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-blue-600">
            E {(data?.costs?.total || 0).toLocaleString()}
          </div>
          <div className="text-gray-600">Total Costs</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-purple-600">
            E {(data?.profit?.net || 0).toLocaleString()}
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

      {/* Monthly Trend - FIXED: Added null checks */}
      <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Monthly Financial Trend</h4>
        <div className="space-y-4">
          {(data?.monthlyTrend || []).map((month, index) => (
            <div key={index} className="flex items-center space-x-4">
              <div className="w-12 text-sm font-medium text-gray-600">{month.month}</div>
              <div className="flex-1">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Revenue: E {(month.revenue || 0).toLocaleString()}</span>
                  <span>Profit: E {(month.profit || 0).toLocaleString()}</span>
                </div>
                <div className="relative h-6 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-500 h-full"
                    style={{ width: `${((month.revenue || 0) / 150000) * 100}%` }}
                  />
                  <div
                    className="bg-green-500 h-full absolute top-0 right-0"
                    style={{ width: `${((month.profit || 0) / 150000) * 100}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                    {month.revenue && month.profit ? (((month.profit / month.revenue) * 100).toFixed(1)) : 0}% margin
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cost Breakdown - FIXED: Added null checks */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Cost Breakdown</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">E {(data?.costs?.materials || 0).toLocaleString()}</div>
            <div className="text-sm text-gray-600">Materials</div>
            <div className="text-xs text-gray-500">
              {data?.costs?.total ? (((data.costs.materials || 0) / data.costs.total * 100).toFixed(1)) : 0}%
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">E {(data?.costs?.labor || 0).toLocaleString()}</div>
            <div className="text-sm text-gray-600">Labor</div>
            <div className="text-xs text-gray-500">
              {data?.costs?.total ? (((data.costs.labor || 0) / data.costs.total * 100).toFixed(1)) : 0}%
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">E {(data?.costs?.overhead || 0).toLocaleString()}</div>
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
          <p className="text-gray-600 mt-1">Comprehensive business intelligence and reporting</p>
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
              <option value="Line A">Line A</option>
              <option value="Line B">Line B</option>
              <option value="Line C">Line C</option>
              <option value="Line D">Line D</option>
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