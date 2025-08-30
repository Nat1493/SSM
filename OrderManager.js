// ==============================================
// src/components/OrderManager.js - FULLY FUNCTIONAL
// ==============================================
import React, { useState, useEffect } from 'react';

const OrderManager = () => {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [showAddOrder, setShowAddOrder] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [sortBy, setSortBy] = useState('delivery_date');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filterBy, setFilterBy] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [orderForm, setOrderForm] = useState({
    orderNumber: '',
    styleNumber: '',
    cutsheetNumber: '',
    account: '',
    brand: '',
    customerId: '',
    deliveryDate: '',
    price: '',
    colour: '',
    productionLine: '',
    status: 'pending'
  });

  // Initialize data
  useEffect(() => {
    const mockOrders = [
      {
        id: 1,
        order_number: 'ORD-2025-001',
        style_number: 'STY-001',
        cutsheet_number: 'CS-001',
        account: 'Fashion Plus',
        brand: 'Premium',
        customer_id: 1,
        customer_name: 'Fashion Plus Ltd',
        delivery_date: '2025-09-15',
        price: 1250.00,
        colour: 'Navy Blue',
        production_line: 'Line A',
        status: 'in_production',
        created_at: '2025-08-20'
      },
      {
        id: 2,
        order_number: 'ORD-2025-002',
        style_number: 'STY-002',
        cutsheet_number: 'CS-002',
        account: 'Style Central',
        brand: 'Classic',
        customer_id: 2,
        customer_name: 'Style Central Inc',
        delivery_date: '2025-09-20',
        price: 980.00,
        colour: 'White',
        production_line: 'Line B',
        status: 'pending',
        created_at: '2025-08-22'
      },
      {
        id: 3,
        order_number: 'ORD-2025-003',
        style_number: 'STY-003',
        cutsheet_number: 'CS-003',
        account: 'Trend Makers',
        brand: 'Casual',
        customer_id: 3,
        customer_name: 'Trend Makers',
        delivery_date: '2025-09-10',
        price: 1500.00,
        colour: 'Black',
        production_line: 'Line C',
        status: 'completed',
        created_at: '2025-08-18'
      }
    ];

    const mockCustomers = [
      { id: 1, name: 'Fashion Plus Ltd' },
      { id: 2, name: 'Style Central Inc' },
      { id: 3, name: 'Trend Makers' },
      { id: 4, name: 'Elite Fashion' }
    ];

    setOrders(mockOrders);
    setCustomers(mockCustomers);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOrderForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setOrderForm({
      orderNumber: '',
      styleNumber: '',
      cutsheetNumber: '',
      account: '',
      brand: '',
      customerId: '',
      deliveryDate: '',
      price: '',
      colour: '',
      productionLine: '',
      status: 'pending'
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const customerName = customers.find(c => c.id == orderForm.customerId)?.name || '';
    
    if (editingOrder) {
      // Update existing order
      const updatedOrders = orders.map(order => 
        order.id === editingOrder.id 
          ? { 
              ...order, 
              order_number: orderForm.orderNumber,
              style_number: orderForm.styleNumber,
              cutsheet_number: orderForm.cutsheetNumber,
              account: orderForm.account,
              brand: orderForm.brand,
              customer_id: parseInt(orderForm.customerId),
              customer_name: customerName,
              delivery_date: orderForm.deliveryDate,
              price: parseFloat(orderForm.price),
              colour: orderForm.colour,
              production_line: orderForm.productionLine,
              status: orderForm.status,
              updated_at: new Date().toISOString()
            }
          : order
      );
      setOrders(updatedOrders);
      setEditingOrder(null);
    } else {
      // Add new order
      const newOrder = {
        id: Date.now(),
        order_number: orderForm.orderNumber,
        style_number: orderForm.styleNumber,
        cutsheet_number: orderForm.cutsheetNumber,
        account: orderForm.account,
        brand: orderForm.brand,
        customer_id: parseInt(orderForm.customerId),
        customer_name: customerName,
        delivery_date: orderForm.deliveryDate,
        price: parseFloat(orderForm.price),
        colour: orderForm.colour,
        production_line: orderForm.productionLine,
        status: orderForm.status,
        created_at: new Date().toISOString()
      };
      setOrders(prev => [...prev, newOrder]);
    }
    
    resetForm();
    setShowAddOrder(false);
  };

  const handleEdit = (order) => {
    setEditingOrder(order);
    setOrderForm({
      orderNumber: order.order_number,
      styleNumber: order.style_number,
      cutsheetNumber: order.cutsheet_number,
      account: order.account,
      brand: order.brand,
      customerId: order.customer_id.toString(),
      deliveryDate: order.delivery_date,
      price: order.price.toString(),
      colour: order.colour,
      productionLine: order.production_line,
      status: order.status
    });
    setShowAddOrder(true);
  };

  const handleDelete = (orderId) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      setOrders(prev => prev.filter(order => order.id !== orderId));
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

  const filteredAndSortedOrders = orders
    .filter(order => {
      const matchesSearch = 
        order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.style_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.account.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.colour.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterBy === 'all' || order.status === filterBy;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      let valueA, valueB;
      
      switch (sortBy) {
        case 'delivery_date':
          valueA = new Date(a.delivery_date);
          valueB = new Date(b.delivery_date);
          break;
        case 'price':
          valueA = a.price;
          valueB = b.price;
          break;
        case 'created_at':
          valueA = new Date(a.created_at);
          valueB = new Date(b.created_at);
          break;
        default:
          valueA = a[sortBy] || '';
          valueB = b[sortBy] || '';
      }

      if (sortDirection === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_production': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Order Management</h2>
          <p className="text-gray-600 mt-1">Manage all your textile orders in one place</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setEditingOrder(null);
            setShowAddOrder(true);
          }}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2"
        >
          <span>+</span>
          <span>Add New Order</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-blue-600">{orders.length}</div>
          <div className="text-gray-600">Total Orders</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-yellow-600">
            {orders.filter(o => o.status === 'pending').length}
          </div>
          <div className="text-gray-600">Pending</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-blue-600">
            {orders.filter(o => o.status === 'in_production').length}
          </div>
          <div className="text-gray-600">In Production</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-green-600">
            {orders.filter(o => o.status === 'completed').length}
          </div>
          <div className="text-gray-600">Completed</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Orders</label>
            <input
              type="text"
              placeholder="Search by order#, style#, customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="delivery_date">Delivery Date</option>
              <option value="order_number">Order Number</option>
              <option value="style_number">Style Number</option>
              <option value="price">Price</option>
              <option value="customer_name">Customer</option>
              <option value="created_at">Created Date</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter Status</label>
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_production">In Production</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
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
        </div>
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredAndSortedOrders.length} of {orders.length} orders
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('order_number')}
                >
                  Order # {getSortIcon('order_number')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('style_number')}
                >
                  Style # {getSortIcon('style_number')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cutsheet #
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('customer_name')}
                >
                  Customer {getSortIcon('customer_name')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account/Brand
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('delivery_date')}
                >
                  Delivery {getSortIcon('delivery_date')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('price')}
                >
                  Price {getSortIcon('price')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Colour/Line
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                    {order.order_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {order.style_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.cutsheet_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.customer_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>{order.account}</div>
                    <div className="text-xs text-gray-400">{order.brand}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.delivery_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    ${order.price?.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>{order.colour}</div>
                    <div className="text-xs text-gray-400">{order.production_line}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {order.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(order)}
                      className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(order.id)}
                      className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Order Modal */}
      {showAddOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-6 pb-3 border-b">
              <h3 className="text-xl font-semibold text-gray-900">
                {editingOrder ? 'Edit Order' : 'Add New Order'}
              </h3>
              <button
                onClick={() => {
                  setShowAddOrder(false);
                  setEditingOrder(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Order Number *</label>
                    <input
                      type="text"
                      name="orderNumber"
                      placeholder="ORD-2025-001"
                      value={orderForm.orderNumber}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Style Number *</label>
                    <input
                      type="text"
                      name="styleNumber"
                      placeholder="STY-001"
                      value={orderForm.styleNumber}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cutsheet Number</label>
                    <input
                      type="text"
                      name="cutsheetNumber"
                      placeholder="CS-001"
                      value={orderForm.cutsheetNumber}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer *</label>
                    <select
                      name="customerId"
                      value={orderForm.customerId}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Select Customer</option>
                      {customers.map(customer => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Account & Brand Information */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Account & Brand</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account *</label>
                    <input
                      type="text"
                      name="account"
                      placeholder="Fashion Plus"
                      value={orderForm.account}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                    <input
                      type="text"
                      name="brand"
                      placeholder="Premium"
                      value={orderForm.brand}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Production Information */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Production Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Date *</label>
                    <input
                      type="date"
                      name="deliveryDate"
                      value={orderForm.deliveryDate}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                    <input
                      type="number"
                      name="price"
                      placeholder="1250.00"
                      step="0.01"
                      value={orderForm.price}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Colour</label>
                    <input
                      type="text"
                      name="colour"
                      placeholder="Navy Blue"
                      value={orderForm.colour}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Production Line</label>
                    <select
                      name="productionLine"
                      value={orderForm.productionLine}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Line</option>
                      <option value="Line A">Line A</option>
                      <option value="Line B">Line B</option>
                      <option value="Line C">Line C</option>
                      <option value="Line D">Line D</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      name="status"
                      value={orderForm.status}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_production">In Production</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddOrder(false);
                    setEditingOrder(null);
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
                  {editingOrder ? 'Update Order' : 'Add Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManager;