// ==============================================
// src/components/InventoryManager.js - FIXED WITH DATA CONTEXT INTEGRATION
// ==============================================
import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { currencyUtils } from '../utils/currency';

const InventoryManager = () => {
  const { inventory, actions, settings } = useData();
  const [showAddItem, setShowAddItem] = useState(false);
  const [showReceiving, setShowReceiving] = useState(false);
  const [showUsage, setShowUsage] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [showLowStock, setShowLowStock] = useState(false);

  const [itemForm, setItemForm] = useState({
    type: 'fabric',
    name: '',
    supplier: '',
    quantityReceived: '',
    unit: '',
    costPerUnit: '',
    receivedDate: '',
    lowStockThreshold: '10',
    description: '',
    color: '',
    category: ''
  });

  const [receivingForm, setReceivingForm] = useState({
    quantity: '',
    costPerUnit: '',
    receivedDate: '',
    supplierBatch: '',
    notes: ''
  });

  const [usageForm, setUsageForm] = useState({
    quantity: '',
    usedDate: '',
    usedFor: '',
    notes: ''
  });

  const handleInputChange = (e, formType = 'item') => {
    const { name, value } = e.target;
    if (formType === 'item') {
      setItemForm(prev => ({ ...prev, [name]: value }));
    } else if (formType === 'receiving') {
      setReceivingForm(prev => ({ ...prev, [name]: value }));
    } else if (formType === 'usage') {
      setUsageForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const resetForms = () => {
    setItemForm({
      type: 'fabric',
      name: '',
      supplier: '',
      quantityReceived: '',
      unit: '',
      costPerUnit: '',
      receivedDate: '',
      lowStockThreshold: '10',
      description: '',
      color: '',
      category: ''
    });
    setReceivingForm({
      quantity: '',
      costPerUnit: '',
      receivedDate: '',
      supplierBatch: '',
      notes: ''
    });
    setUsageForm({
      quantity: '',
      usedDate: '',
      usedFor: '',
      notes: ''
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingItem) {
      // Update existing item
      const updateData = {
        type: itemForm.type,
        name: itemForm.name,
        supplier: itemForm.supplier,
        unit: itemForm.unit,
        cost_per_unit: parseFloat(itemForm.costPerUnit) || 0,
        low_stock_threshold: parseInt(itemForm.lowStockThreshold) || 0,
        description: itemForm.description,
        color: itemForm.color,
        category: itemForm.category
      };
      actions.updateInventoryItem(editingItem.id, updateData);
      setEditingItem(null);
    } else {
      // Add new item
      const itemData = {
        type: itemForm.type,
        name: itemForm.name,
        supplier: itemForm.supplier,
        quantity_received: parseFloat(itemForm.quantityReceived) || 0,
        unit: itemForm.unit,
        cost_per_unit: parseFloat(itemForm.costPerUnit) || 0,
        received_date: itemForm.receivedDate,
        low_stock_threshold: parseInt(itemForm.lowStockThreshold) || 0,
        description: itemForm.description,
        color: itemForm.color,
        category: itemForm.category
      };
      actions.addInventoryItem(itemData);
    }
    
    resetForms();
    setShowAddItem(false);
  };

  const handleReceiving = (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    const additionalQuantity = parseFloat(receivingForm.quantity) || 0;
    const newCostPerUnit = parseFloat(receivingForm.costPerUnit) || selectedItem.cost_per_unit;

    const receivingData = {
      quantity: additionalQuantity,
      costPerUnit: newCostPerUnit,
      receivedDate: receivingForm.receivedDate,
      supplierBatch: receivingForm.supplierBatch,
      notes: receivingForm.notes
    };

    actions.receiveInventoryItem(selectedItem.id, additionalQuantity, receivingData);
    resetForms();
    setShowReceiving(false);
    setSelectedItem(null);
  };

  const handleUsage = (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    const usedQuantity = parseFloat(usageForm.quantity) || 0;
    if (usedQuantity > selectedItem.quantity_available) {
      alert('Cannot use more than available quantity!');
      return;
    }

    const usageData = {
      usedDate: usageForm.usedDate,
      usedFor: usageForm.usedFor,
      notes: usageForm.notes
    };

    try {
      actions.useInventoryItem(selectedItem.id, usedQuantity, usageData);
      resetForms();
      setShowUsage(false);
      setSelectedItem(null);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setItemForm({
      type: item.type || 'fabric',
      name: item.name || '',
      supplier: item.supplier || '',
      quantityReceived: '',
      unit: item.unit || '',
      costPerUnit: (item.cost_per_unit || 0).toString(),
      receivedDate: item.received_date || '',
      lowStockThreshold: (item.low_stock_threshold || 0).toString(),
      description: item.description || '',
      color: item.color || '',
      category: item.category || ''
    });
    setShowAddItem(true);
  };

  const handleDelete = (itemId) => {
    if (window.confirm('Are you sure you want to delete this inventory item?')) {
      actions.deleteInventoryItem(itemId);
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedInventory = inventory
    .filter(item => {
      const matchesType = filterType === 'all' || item.type === filterType;
      const matchesSearch = 
        (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.supplier || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.color || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLowStock = !showLowStock || ((item.quantity_available || 0) <= (item.low_stock_threshold || 0));
      
      return matchesType && matchesSearch && matchesLowStock;
    })
    .sort((a, b) => {
      let valueA, valueB;
      
      switch (sortBy) {
        case 'quantity_available':
        case 'quantity_received':
        case 'quantity_used':
        case 'cost_per_unit':
        case 'total_value':
        case 'low_stock_threshold':
          valueA = a[sortBy] || 0;
          valueB = b[sortBy] || 0;
          break;
        case 'received_date':
        case 'created_at':
        case 'last_updated':
          valueA = new Date(a[sortBy] || '1970-01-01');
          valueB = new Date(b[sortBy] || '1970-01-01');
          break;
        default:
          valueA = (a[sortBy] || '').toLowerCase();
          valueB = (b[sortBy] || '').toLowerCase();
      }

      if (sortDirection === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });

  const getTypeColor = (type) => {
    switch (type) {
      case 'fabric': return 'bg-blue-100 text-blue-800';
      case 'material': return 'bg-green-100 text-green-800';
      case 'trim': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStockLevel = (item) => {
    const quantityAvailable = item.quantity_available || 0;
    const quantityReceived = item.quantity_received || 1; // Prevent division by zero
    const lowStockThreshold = item.low_stock_threshold || 0;
    
    const percentage = (quantityAvailable / quantityReceived) * 100;
    
    if (quantityAvailable <= lowStockThreshold) {
      return { level: 'Critical', color: 'text-red-600', bgColor: 'bg-red-100' };
    } else if (percentage <= 30) {
      return { level: 'Low', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    } else if (percentage <= 60) {
      return { level: 'Medium', color: 'text-blue-600', bgColor: 'bg-blue-100' };
    } else {
      return { level: 'Good', color: 'text-green-600', bgColor: 'bg-green-100' };
    }
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const formatCurrency = (amount) => {
  return currencyUtils.format(amount);
  };


  const totalItems = inventory.length;
  const totalValue = inventory.reduce((sum, item) => sum + (item.total_value || 0), 0);
  const lowStockItems = inventory.filter(item => (item.quantity_available || 0) <= (item.low_stock_threshold || 0)).length;
  const criticalItems = inventory.filter(item => (item.quantity_available || 0) === 0).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Inventory Management</h2>
          <p className="text-gray-600 mt-1">Manage fabrics, materials, and trims inventory</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => {
              resetForms();
              setEditingItem(null);
              setShowAddItem(true);
            }}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            + Add Item
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-blue-600">{totalItems}</div>
          <div className="text-gray-600">Total Items</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(totalValue)}
          </div>
          <div className="text-gray-600">Total Value</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-yellow-600">{lowStockItems}</div>
          <div className="text-gray-600">Low Stock</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-red-600">{criticalItems}</div>
          <div className="text-gray-600">Out of Stock</div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Items</label>
            <input
              type="text"
              placeholder="Search by name, supplier, category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="fabric">Fabric</option>
              <option value="material">Material</option>
              <option value="trim">Trim</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="name">Item Name</option>
              <option value="type">Type</option>
              <option value="quantity_available">Available Stock</option>
              <option value="total_value">Total Value</option>
              <option value="received_date">Received Date</option>
              <option value="supplier">Supplier</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort Direction</label>
            <select
              value={sortDirection}
              onChange={(e) => setSortDirection(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showLowStock}
                onChange={(e) => setShowLowStock(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Low Stock Only</span>
            </label>
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredAndSortedInventory.length} of {inventory.length} items
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('type')}
                >
                  Type {getSortIcon('type')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('name')}
                >
                  Item Details {getSortIcon('name')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('supplier')}
                >
                  Supplier {getSortIcon('supplier')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('quantity_available')}
                >
                  Stock Status {getSortIcon('quantity_available')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('cost_per_unit')}
                >
                  Unit Cost {getSortIcon('cost_per_unit')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock Level
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('total_value')}
                >
                  Total Value {getSortIcon('total_value')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedInventory.map((item) => {
                const stockLevel = getStockLevel(item);
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(item.type)}`}>
                        {(item.type || 'unknown').charAt(0).toUpperCase() + (item.type || 'unknown').slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.name || 'N/A'}</div>
                      <div className="text-xs text-gray-500">{item.category || 'N/A'}</div>
                      <div className="text-xs text-gray-400">{item.color || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{item.supplier || 'N/A'}</div>
                      <div className="text-xs text-gray-400">
                        Received: {item.received_date ? new Date(item.received_date).toLocaleDateString() : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="text-sm font-medium text-gray-900">
                        {(item.quantity_available || 0).toLocaleString()} / {(item.quantity_received || 0).toLocaleString()} {item.unit || 'units'}
                      </div>
                      <div className="text-xs text-gray-500">
                        Used: {(item.quantity_used || 0).toLocaleString()} {item.unit || 'units'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {formatCurrency(item.cost_per_unit || 0)} / {item.unit || 'unit'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${stockLevel.bgColor} ${stockLevel.color}`}>
                        {stockLevel.level}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {formatCurrency(item.total_value || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-1">
                      <button
                        onClick={() => {
                          setSelectedItem(item);
                          setShowReceiving(true);
                        }}
                        className="text-green-600 hover:text-green-900 bg-green-50 px-2 py-1 rounded text-xs"
                      >
                        Receive
                      </button>
                      <button
                        onClick={() => {
                          setSelectedItem(item);
                          setShowUsage(true);
                        }}
                        className="text-orange-600 hover:text-orange-900 bg-orange-50 px-2 py-1 rounded text-xs"
                        disabled={(item.quantity_available || 0) === 0}
                      >
                        Use
                      </button>
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-2 py-1 rounded text-xs"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-900 bg-red-50 px-2 py-1 rounded text-xs"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredAndSortedInventory.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No inventory items found. Add your first item!</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Item Modal */}
      {showAddItem && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-6 pb-3 border-b">
              <h3 className="text-xl font-semibold text-gray-900">
                {editingItem ? 'Edit Inventory Item' : 'Add New Inventory Item'}
              </h3>
              <button
                onClick={() => {
                  setShowAddItem(false);
                  setEditingItem(null);
                  resetForms();
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                  <select
                    name="type"
                    value={itemForm.type}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="fabric">Fabric</option>
                    <option value="material">Material</option>
                    <option value="trim">Trim</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Cotton Denim"
                    value={itemForm.name}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Supplier *</label>
                  <input
                    type="text"
                    name="supplier"
                    placeholder="Textile Suppliers Ltd"
                    value={itemForm.supplier}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <input
                    type="text"
                    name="category"
                    placeholder="Denim, Buttons, Thread, etc."
                    value={itemForm.category}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                  <input
                    type="text"
                    name="color"
                    placeholder="Indigo Blue"
                    value={itemForm.color}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit *</label>
                  <select
                    name="unit"
                    value={itemForm.unit}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Unit</option>
                    <option value="meters">Meters</option>
                    <option value="yards">Yards</option>
                    <option value="pieces">Pieces</option>
                    <option value="spools">Spools</option>
                    <option value="kg">Kilograms</option>
                    <option value="lbs">Pounds</option>
                    <option value="rolls">Rolls</option>
                    <option value="boxes">Boxes</option>
                  </select>
                </div>
                {!editingItem && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Initial Quantity</label>
                    <input
                      type="number"
                      name="quantityReceived"
                      placeholder="500"
                      step="0.01"
                      value={itemForm.quantityReceived}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cost per Unit (Emalangeni)</label>
                  <input
                    type="number"
                    name="costPerUnit"
                    placeholder="231.25"
                    step="0.01"
                    value={itemForm.costPerUnit}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Low Stock Threshold</label>
                  <input
                    type="number"
                    name="lowStockThreshold"
                    placeholder="10"
                    value={itemForm.lowStockThreshold}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Received Date</label>
                  <input
                    type="date"
                    name="receivedDate"
                    value={itemForm.receivedDate}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  placeholder="High-quality cotton denim, 14oz weight"
                  value={itemForm.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddItem(false);
                    setEditingItem(null);
                    resetForms();
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                >
                  {editingItem ? 'Update Item' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receiving Modal */}
      {showReceiving && selectedItem && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-6 pb-3 border-b">
              <h3 className="text-xl font-semibold text-gray-900">
                Receive Stock: {selectedItem.name}
              </h3>
              <button
                onClick={() => {
                  setShowReceiving(false);
                  setSelectedItem(null);
                  resetForms();
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleReceiving} className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Current Stock Status</h4>
                <p className="text-sm text-gray-600">
                  Available: <span className="font-medium">{(selectedItem.quantity_available || 0).toLocaleString()} {selectedItem.unit}</span> | 
                  Total Received: <span className="font-medium">{(selectedItem.quantity_received || 0).toLocaleString()} {selectedItem.unit}</span> | 
                  Used: <span className="font-medium">{(selectedItem.quantity_used || 0).toLocaleString()} {selectedItem.unit}</span>
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Received *</label>
                  <input
                    type="number"
                    name="quantity"
                    placeholder="100"
                    step="0.01"
                    value={receivingForm.quantity}
                    onChange={(e) => handleInputChange(e, 'receiving')}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Unit: {selectedItem.unit}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cost per Unit (Emalangeni)</label>
                  <input
                    type="number"
                    name="costPerUnit"
                    placeholder={(selectedItem.cost_per_unit || 0).toString()}
                    step="0.01"
                    value={receivingForm.costPerUnit}
                    onChange={(e) => handleInputChange(e, 'receiving')}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Received Date *</label>
                  <input
                    type="date"
                    name="receivedDate"
                    value={receivingForm.receivedDate}
                    onChange={(e) => handleInputChange(e, 'receiving')}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Batch #</label>
                  <input
                    type="text"
                    name="supplierBatch"
                    placeholder="BATCH-2025-001"
                    value={receivingForm.supplierBatch}
                    onChange={(e) => handleInputChange(e, 'receiving')}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  name="notes"
                  placeholder="Quality check passed, no damages noted"
                  value={receivingForm.notes}
                  onChange={(e) => handleInputChange(e, 'receiving')}
                  rows="3"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowReceiving(false);
                    setSelectedItem(null);
                    resetForms();
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
                >
                  Record Receiving
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Usage Modal */}
      {showUsage && selectedItem && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-6 pb-3 border-b">
              <h3 className="text-xl font-semibold text-gray-900">
                Record Usage: {selectedItem.name}
              </h3>
              <button
                onClick={() => {
                  setShowUsage(false);
                  setSelectedItem(null);
                  resetForms();
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleUsage} className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Available Stock</h4>
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-lg">{(selectedItem.quantity_available || 0).toLocaleString()} {selectedItem.unit}</span> available for use
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Used *</label>
                  <input
                    type="number"
                    name="quantity"
                    placeholder="50"
                    step="0.01"
                    max={selectedItem.quantity_available}
                    value={usageForm.quantity}
                    onChange={(e) => handleInputChange(e, 'usage')}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Max: {(selectedItem.quantity_available || 0).toLocaleString()} {selectedItem.unit}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Usage Date *</label>
                  <input
                    type="date"
                    name="usedDate"
                    value={usageForm.usedDate}
                    onChange={(e) => handleInputChange(e, 'usage')}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Used For</label>
                <input
                  type="text"
                  name="usedFor"
                  placeholder="Order ORD-2025-001 - Style STY-001"
                  value={usageForm.usedFor}
                  onChange={(e) => handleInputChange(e, 'usage')}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  name="notes"
                  placeholder="Production notes, quality observations, etc."
                  value={usageForm.notes}
                  onChange={(e) => handleInputChange(e, 'usage')}
                  rows="3"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowUsage(false);
                    setSelectedItem(null);
                    resetForms();
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 font-medium"
                >
                  Record Usage
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManager;