// ==============================================
// src/App.js - Main React Application
// ==============================================

import React, { useState } from 'react';
import './App.css';

// Import components
import Dashboard from './components/Dashboard';
import OrderManager from './components/OrderManager';
import CustomerManager from './components/CustomerManager';
import InventoryManager from './components/InventoryManager';
import ProductionTracker from './components/ProductionTracker';
import Reports from './components/Reports';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: '📊' },
    { id: 'orders', name: 'Orders', icon: '📋' },
    { id: 'customers', name: 'Customers', icon: '👥' },
    { id: 'inventory', name: 'Inventory', icon: '📦' },
    { id: 'production', name: 'Production', icon: '🏭' },
    { id: 'reports', name: 'Reports', icon: '📈' },
  ];

  const renderCurrentPage = () => {
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

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">SS Mudyf</h1>
              <span className="text-sm text-gray-500">Order Tracking System</span>
            </div>
            <div className="text-sm text-gray-500">
              Eswatini Textile CMT Factory
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <nav className="w-64 bg-white shadow-sm min-h-screen">
          <div className="p-4">
            <ul className="space-y-2">
              {navigation.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => setCurrentPage(item.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors ${
                      currentPage === item.id
                        ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-500'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="font-medium">{item.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {renderCurrentPage()}
        </main>
      </div>
    </div>
  );
}

export default App;