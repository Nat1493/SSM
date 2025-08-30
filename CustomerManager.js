// ==============================================
// src/components/CustomerManager.js - FULLY FUNCTIONAL
// ==============================================
import React, { useState, useEffect } from 'react';

const CustomerManager = () => {
  const [customers, setCustomers] = useState([]);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  const [customerForm, setCustomerForm] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    country: 'Eswatini',
    category: 'Regular',
    notes: ''
  });

  // Initialize data
  useEffect(() => {
    const mockCustomers = [
      {
        id: 1,
        name: 'Fashion Plus Ltd',
        contact_person: 'Sarah Johnson',
        email: 'sarah@fashionplus.com',
        phone: '+268 78901234',
        address: 'Mbabane Industrial Area, Eswatini',
        country: 'Eswatini',
        category: 'Premium',
        notes: 'Long-term client, prefers premium quality fabrics',
        created_at: '2025-01-15T10:30:00.000Z',
        total_orders: 15,
        total_value: 18750.00,
        last_order: '2025-08-20'
      },
      {
        id: 2,
        name: 'Style Central Inc',
        contact_person: 'Michael Brown',
        email: 'michael@stylecentral.com',
        phone: '+268 76543210',
        address: 'Manzini Commercial District, Eswatini',
        country: 'Eswatini',
        category: 'Regular',
        notes: 'Volume orders, price-sensitive',
        created_at: '2025-02-20T14:15:00.000Z',
        total_orders: 8,
        total_value: 9800.00,
        last_order: '2025-08-22'
      },
      {
        id: 3,
        name: 'Trend Makers',
        contact_person: 'Lisa Davis',
        email: 'lisa@trendmakers.com',
        phone: '+268 75432109',
        address: 'Matsapha Export Processing Zone, Eswatini',
        country: 'Eswatini',
        category: 'Premium',
        notes: 'Fashion-forward designs, quick turnaround required',
        created_at: '2025-03-10T09:00:00.000Z',
        total_orders: 12,
        total_value: 15600.00,
        last_order: '2025-08-18'
      },
      {
        id: 4,
        name: 'Elite Fashion',
        contact_person: 'James Wilson',
        email: 'james@elitefashion.com',
        phone: '+268 74321098',
        address: 'Big Bend Industrial Park, Eswatini',
        country: 'Eswatini',
        category: 'VIP',
        notes: 'Highest quality requirements, luxury segment',
        created_at: '2025-01-08T16:45:00.000Z',
        total_orders: 22,
        total_value: 35400.00,
        last_order: '2025-08-25'
      }
    ];
    setCustomers(mockCustomers);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setCustomerForm({
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      country: 'Eswatini',
      category: 'Regular',
      notes: ''
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingCustomer) {
      // Update existing customer
      const updatedCustomers = customers.map(customer => 
        customer.id === editingCustomer.id 
          ? { 
              ...customer, 
              name: customerForm.name,
              contact_person: customerForm.contactPerson,
              email: customerForm.email,
              phone: customerForm.phone,
              address: customerForm.address,
              country: customerForm.country,
              category: customerForm.category,
              notes: customerForm.notes,
              updated_at: new Date().toISOString()
            }
          : customer
      );
      setCustomers(updatedCustomers);
      setEditingCustomer(null);
    } else {
      // Add new customer
      const newCustomer = {
        id: Date.now(),
        name: customerForm.name,
        contact_person: customerForm.contactPerson,
        email: customerForm.email,
        phone: customerForm.phone,
        address: customerForm.address,
        country: customerForm.country,
        category: customerForm.category,
        notes: customerForm.notes,
        created_at: new Date().toISOString(),
        total_orders: 0,
        total_value: 0.00,
        last_order: null
      };
      setCustomers(prev => [...prev, newCustomer]);
    }
    
    resetForm();
    setShowAddCustomer(false);
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setCustomerForm({
      name: customer.name,
      contactPerson: customer.contact_person,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      country: customer.country || 'Eswatini',
      category: customer.category || 'Regular',
      notes: customer.notes || ''
    });
    setShowAddCustomer(true);
  };

  const handleDelete = (customerId) => {
    if (window.confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
      setCustomers(prev => prev.filter(customer => customer.id !== customerId));
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

  const filteredAndSortedCustomers = customers
    .filter(customer => {
      const searchLower = searchTerm.toLowerCase();
      return (
        customer.name.toLowerCase().includes(searchLower) ||
        customer.contact_person.toLowerCase().includes(searchLower) ||
        customer.email.toLowerCase().includes(searchLower) ||
        customer.phone.includes(searchTerm) ||
        customer.category.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      let valueA, valueB;
      
      switch (sortBy) {
        case 'total_value':
        case 'total_orders':
          valueA = a[sortBy] || 0;
          valueB = b[sortBy] || 0;
          break;
        case 'created_at':
        case 'last_order':
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

  const getCategoryColor = (category) => {
    switch (category) {
      case 'VIP': return 'bg-purple-100 text-purple-800';
      case 'Premium': return 'bg-blue-100 text-blue-800';
      case 'Regular': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const totalCustomers = customers.length;
  const totalValue = customers.reduce((sum, customer) => sum + (customer.total_value || 0), 0);
  const avgOrderValue = totalCustomers > 0 ? totalValue / totalCustomers : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Customer Management</h2>
          <p className="text-gray-600 mt-1">Manage your client relationships and contact information</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setEditingCustomer(null);
            setShowAddCustomer(true);
          }}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2"
        >
          <span>+</span>
          <span>Add New Customer</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-blue-600">{totalCustomers}</div>
          <div className="text-gray-600">Total Customers</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-green-600">
            ${totalValue.toFixed(0)}
          </div>
          <div className="text-gray-600">Total Value</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-purple-600">
            ${avgOrderValue.toFixed(0)}
          </div>
          <div className="text-gray-600">Avg per Customer</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="text-2xl font-bold text-orange-600">
            {customers.filter(c => c.category === 'VIP' || c.category === 'Premium').length}
          </div>
          <div className="text-gray-600">Premium Clients</div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Customers</label>
            <input
              type="text"
              placeholder="Search by name, contact, email, or phone..."
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
              <option value="name">Customer Name</option>
              <option value="contact_person">Contact Person</option>
              <option value="category">Category</option>
              <option value="total_orders">Total Orders</option>
              <option value="total_value">Total Value</option>
              <option value="created_at">Created Date</option>
              <option value="last_order">Last Order</option>
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
          Showing {filteredAndSortedCustomers.length} of {customers.length} customers
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('name')}
                >
                  Customer Name {getSortIcon('name')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('contact_person')}
                >
                  Contact Person {getSortIcon('contact_person')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Address
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('category')}
                >
                  Category {getSortIcon('category')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('total_orders')}
                >
                  Orders {getSortIcon('total_orders')}
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
              {filteredAndSortedCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                    <div className="text-xs text-gray-500">
                      Since {new Date(customer.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {customer.contact_person}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>{customer.email}</div>
                    <div className="text-blue-600">{customer.phone}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                    <div className="truncate" title={customer.address}>
                      {customer.address}
                    </div>
                    <div className="text-xs text-gray-400">{customer.country}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(customer.category)}`}>
                      {customer.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="font-medium">{customer.total_orders || 0}</div>
                    <div className="text-xs text-gray-500">
                      Last: {customer.last_order ? new Date(customer.last_order).toLocaleDateString() : 'Never'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    ${(customer.total_value || 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(customer)}
                      className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(customer.id)}
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

      {/* Add/Edit Customer Modal */}
      {showAddCustomer && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between mb-6 pb-3 border-b">
              <h3 className="text-xl font-semibold text-gray-900">
                {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
              </h3>
              <button
                onClick={() => {
                  setShowAddCustomer(false);
                  setEditingCustomer(null);
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Fashion Plus Ltd"
                      value={customerForm.name}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                    <input
                      type="text"
                      name="contactPerson"
                      placeholder="Sarah Johnson"
                      value={customerForm.contactPerson}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="sarah@fashionplus.com"
                      value={customerForm.email}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="+268 78901234"
                      value={customerForm.phone}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Address Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <textarea
                      name="address"
                      placeholder="Mbabane Industrial Area, Eswatini"
                      value={customerForm.address}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <select
                      name="country"
                      value={customerForm.country}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Eswatini">Eswatini</option>
                      <option value="South Africa">South Africa</option>
                      <option value="Botswana">Botswana</option>
                      <option value="Lesotho">Lesotho</option>
                      <option value="Mozambique">Mozambique</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer Category</label>
                    <select
                      name="category"
                      value={customerForm.category}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Regular">Regular</option>
                      <option value="Premium">Premium</option>
                      <option value="VIP">VIP</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    name="notes"
                    placeholder="Special requirements, preferences, or important notes about this customer..."
                    value={customerForm.notes}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddCustomer(false);
                    setEditingCustomer(null);
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
                  {editingCustomer ? 'Update Customer' : 'Add Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerManager;