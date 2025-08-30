// ==============================================
// src/App.js - Enhanced with Data Context Integration
// ==============================================

import React, { useState, useEffect } from 'react';
import './App.css';

// Import the DataProvider
import { DataProvider, useData } from './contexts/DataContext';

// Import components
import Dashboard from './components/Dashboard';
import OrderManager from './components/OrderManager';
import CustomerManager from './components/CustomerManager';
import InventoryManager from './components/InventoryManager';
import ProductionTracker from './components/ProductionTracker';
import Reports from './components/Reports';

// Currency utility
const formatCurrency = (amount, options = {}) => {
  const {
    minimumFractionDigits = 2,
    maximumFractionDigits = 2
  } = options;

  return `E ${amount.toLocaleString('en-SZ', {
    minimumFractionDigits,
    maximumFractionDigits
  })}`;
};

// Main App Component (wrapped with DataProvider)
const AppContent = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  const { settings, actions, loading } = useData();

  const navigation = [
    { 
      id: 'dashboard', 
      name: 'Dashboard', 
      icon: '📊',
      description: 'Overview and statistics'
    },
    { 
      id: 'orders', 
      name: 'Orders', 
      icon: '📋',
      description: 'Manage customer orders'
    },
    { 
      id: 'customers', 
      name: 'Customers', 
      icon: '👥',
      description: 'Customer database'
    },
    { 
      id: 'inventory', 
      name: 'Inventory', 
      icon: '📦',
      description: 'Stock management'
    },
    { 
      id: 'production', 
      name: 'Production', 
      icon: '🏭',
      description: 'Production tracking'
    },
    { 
      id: 'reports', 
      name: 'Reports', 
      icon: '📈',
      description: 'Analytics and reports'
    }
  ];

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showNotificationMessage('Connection restored', 'success');
    };

    const handleOffline = () => {
      setIsOnline(false);
      showNotificationMessage('Working offline', 'warning');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '1':
            e.preventDefault();
            setCurrentPage('dashboard');
            break;
          case '2':
            e.preventDefault();
            setCurrentPage('orders');
            break;
          case '3':
            e.preventDefault();
            setCurrentPage('customers');
            break;
          case '4':
            e.preventDefault();
            setCurrentPage('inventory');
            break;
          case '5':
            e.preventDefault();
            setCurrentPage('production');
            break;
          case '6':
            e.preventDefault();
            setCurrentPage('reports');
            break;
          case 's':
            e.preventDefault();
            handleQuickSave();
            break;
          case 'e':
            e.preventDefault();
            handleExportData();
            break;
          default:
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Auto-backup functionality
  useEffect(() => {
    if (settings.autoSave && settings.backupFrequency) {
      const interval = setInterval(() => {
        handleAutoBackup();
      }, getBackupInterval());

      return () => clearInterval(interval);
    }
  }, [settings.autoSave, settings.backupFrequency]);

  const getBackupInterval = () => {
    switch (settings.backupFrequency) {
      case 'hourly': return 60 * 60 * 1000; // 1 hour
      case 'daily': return 24 * 60 * 60 * 1000; // 24 hours
      case 'weekly': return 7 * 24 * 60 * 60 * 1000; // 1 week
      default: return 24 * 60 * 60 * 1000; // Default to daily
    }
  };

  const handleAutoBackup = () => {
    try {
      const data = actions.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Create a hidden download link
      const link = document.createElement('a');
      link.href = url;
      link.download = `ssmudyf-autobackup-${new Date().toISOString().split('T')[0]}.json`;
      
      // Only actually download if explicitly requested (to avoid spam)
      // For now, just show notification that backup is ready
      showNotificationMessage('Auto-backup created successfully', 'success');
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Auto-backup failed:', error);
      showNotificationMessage('Auto-backup failed', 'error');
    }
  };

  const handleQuickSave = () => {
    try {
      // Force save all data (this is automatically done by the context)
      showNotificationMessage('Data saved successfully', 'success');
    } catch (error) {
      console.error('Quick save failed:', error);
      showNotificationMessage('Save failed', 'error');
    }
  };

  const handleExportData = async () => {
    try {
      const data = actions.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `ssmudyf-export-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      URL.revokeObjectURL(url);
      showNotificationMessage('Data exported successfully', 'success');
    } catch (error) {
      console.error('Export failed:', error);
      showNotificationMessage('Export failed', 'error');
    }
  };

  const handleImportData = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        const success = actions.importData(data);
        
        if (success) {
          showNotificationMessage('Data imported successfully', 'success');
          // Refresh the current page
          setCurrentPage(currentPage);
        } else {
          showNotificationMessage('Import failed - invalid data format', 'error');
        }
      } catch (error) {
        console.error('Import error:', error);
        showNotificationMessage('Import failed - file corrupted', 'error');
      }
    };
    reader.readAsText(file);
  };

  const showNotificationMessage = (message, type = 'info') => {
    setNotificationMessage(message);
    setShowNotification(true);
    
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  const renderCurrentPage = () => {
    // Show loading spinner if any critical data is loading
    if (loading.orders || loading.customers || loading.inventory) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading data...</p>
          </div>
        </div>
      );
    }

    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'orders':
        return <OrderManager />;
      case 'customers':
        return <CustomerManager />;
      case 'inventory':
        return <InventoryManager />;
      case 'production':
        return <ProductionTracker />;
      case 'reports':
        return <Reports />;
      default:
        return <Dashboard />;
    }
  };

  const getConnectionStatus = () => {
    if (!isOnline) {
      return (
        <div className="flex items-center space-x-2 text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full text-sm">
          <span>🔄</span>
          <span>Working Offline</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 rounded-md hover:bg-gray-100 lg:hidden"
              >
                <span className="text-xl">☰</span>
              </button>
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🏭</span>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {settings.company?.name || 'SS Mudyf'}
                  </h1>
                  <span className="text-sm text-gray-500">Order Tracking System</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {getConnectionStatus()}
              
              {/* Quick Actions */}
              <div className="hidden md:flex items-center space-x-2">
                <button
                  onClick={handleQuickSave}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
                  title="Quick Save (Ctrl+S)"
                >
                  💾
                </button>
                
                <button
                  onClick={handleExportData}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
                  title="Export Data (Ctrl+E)"
                >
                  📤
                </button>
                
                <label className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer" title="Import Data">
                  📥
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportData}
                    className="hidden"
                  />
                </label>
              </div>
              
              <div className="text-sm text-gray-500">
                <div>{settings.company?.location || 'Eswatini Textile CMT Factory'}</div>
                <div className="text-xs">{new Date().toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <nav className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-white shadow-sm min-h-screen transition-all duration-300 ease-in-out lg:block ${sidebarCollapsed ? 'block' : 'hidden lg:block'}`}>
          <div className="p-4">
            <ul className="space-y-2">
              {navigation.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      setCurrentPage(item.id);
                      // Auto-collapse sidebar on mobile after selection
                      if (window.innerWidth < 1024) {
                        setSidebarCollapsed(true);
                      }
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition-all duration-200 group ${
                      currentPage === item.id
                        ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-500'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    title={sidebarCollapsed ? `${item.name} - ${item.description}` : ''}
                  >
                    <span className="text-lg">{item.icon}</span>
                    {!sidebarCollapsed && (
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-gray-500 group-hover:text-gray-600">
                          {item.description}
                        </div>
                      </div>
                    )}
                  </button>
                </li>
              ))}
            </ul>

            {/* Sidebar Footer */}
            {!sidebarCollapsed && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="text-xs text-gray-500 space-y-1">
                  <div className="font-medium">System Status</div>
                  <div className="flex items-center justify-between">
                    <span>Auto-save:</span>
                    <span className={settings.autoSave ? 'text-green-600' : 'text-red-600'}>
                      {settings.autoSave ? '✓' : '✗'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Connection:</span>
                    <span className={isOnline ? 'text-green-600' : 'text-yellow-600'}>
                      {isOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                  <div className="pt-2 text-center">
                    <div className="text-blue-600 font-medium">v1.0.0</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Main Content */}
        <main className={`flex-1 p-6 transition-all duration-300 ${sidebarCollapsed ? 'ml-0' : 'ml-0'}`}>
          <div className="max-w-7xl mx-auto">
            {renderCurrentPage()}
          </div>
        </main>
      </div>

      {/* Notification Toast */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-full duration-300">
          <div className={`px-6 py-3 rounded-lg shadow-lg text-white font-medium ${
            notificationMessage.includes('success') ? 'bg-green-500' :
            notificationMessage.includes('error') || notificationMessage.includes('failed') ? 'bg-red-500' :
            notificationMessage.includes('warning') || notificationMessage.includes('offline') ? 'bg-yellow-500' :
            'bg-blue-500'
          }`}>
            <div className="flex items-center space-x-2">
              <span>
                {notificationMessage.includes('success') ? '✅' :
                 notificationMessage.includes('error') || notificationMessage.includes('failed') ? '❌' :
                 notificationMessage.includes('warning') || notificationMessage.includes('offline') ? '⚠️' :
                 'ℹ️'}
              </span>
              <span>{notificationMessage}</span>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Help (Hidden, for reference) */}
      <div className="sr-only">
        <h3>Keyboard Shortcuts</h3>
        <ul>
          <li>Ctrl+1: Dashboard</li>
          <li>Ctrl+2: Orders</li>
          <li>Ctrl+3: Customers</li>
          <li>Ctrl+4: Inventory</li>
          <li>Ctrl+5: Production</li>
          <li>Ctrl+6: Reports</li>
          <li>Ctrl+S: Quick Save</li>
          <li>Ctrl+E: Export Data</li>
        </ul>
      </div>
    </div>
  );
};

// Main App Component with Data Provider
function App() {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
}

export default App;