// ==============================================
// src/contexts/DataContext.js - Complete Centralized Data Management
// ==============================================
import React, { createContext, useContext, useReducer, useEffect } from 'react';

const DataContext = createContext();

// Action types
const ACTION_TYPES = {
  // Orders
  SET_ORDERS: 'SET_ORDERS',
  ADD_ORDER: 'ADD_ORDER',
  UPDATE_ORDER: 'UPDATE_ORDER',
  DELETE_ORDER: 'DELETE_ORDER',
  
  // Customers
  SET_CUSTOMERS: 'SET_CUSTOMERS',
  ADD_CUSTOMER: 'ADD_CUSTOMER',
  UPDATE_CUSTOMER: 'UPDATE_CUSTOMER',
  DELETE_CUSTOMER: 'DELETE_CUSTOMER',
  
  // Inventory
  SET_INVENTORY: 'SET_INVENTORY',
  ADD_INVENTORY_ITEM: 'ADD_INVENTORY_ITEM',
  UPDATE_INVENTORY_ITEM: 'UPDATE_INVENTORY_ITEM',
  DELETE_INVENTORY_ITEM: 'DELETE_INVENTORY_ITEM',
  USE_INVENTORY_ITEM: 'USE_INVENTORY_ITEM',
  RECEIVE_INVENTORY_ITEM: 'RECEIVE_INVENTORY_ITEM',
  
  // Production
  SET_PRODUCTION_STAGES: 'SET_PRODUCTION_STAGES',
  ADD_PRODUCTION_STAGE: 'ADD_PRODUCTION_STAGE',
  UPDATE_PRODUCTION_STAGE: 'UPDATE_PRODUCTION_STAGE',
  DELETE_PRODUCTION_STAGE: 'DELETE_PRODUCTION_STAGE',
  SET_DAILY_SCORES: 'SET_DAILY_SCORES',
  ADD_DAILY_SCORE: 'ADD_DAILY_SCORE',
  UPDATE_DAILY_SCORE: 'UPDATE_DAILY_SCORE',
  DELETE_DAILY_SCORE: 'DELETE_DAILY_SCORE',
  
  // Production Lines
  SET_PRODUCTION_LINES: 'SET_PRODUCTION_LINES',
  ADD_PRODUCTION_LINE: 'ADD_PRODUCTION_LINE',
  UPDATE_PRODUCTION_LINE: 'UPDATE_PRODUCTION_LINE',
  DELETE_PRODUCTION_LINE: 'DELETE_PRODUCTION_LINE',
  
  // Settings
  SET_SETTINGS: 'SET_SETTINGS',
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
  
  // Loading states
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Initial state with SZL currency
const initialState = {
  orders: [],
  customers: [],
  inventory: [],
  productionStages: [],
  dailyScores: [],
  productionLines: [],
  settings: {
    currency: 'SZL',
    currencySymbol: 'E',
    company: {
      name: 'SS Mudyf',
      fullName: 'SS Mudyf Textile CMT Factory',
      location: 'Eswatini',
      contact: '+268 123 4567',
      email: 'info@ssmudyf.co.sz',
      address: 'Matsapha Industrial Area, Eswatini'
    },
    theme: 'light',
    autoSave: true,
    backupFrequency: 'daily',
    notifications: true,
    language: 'en'
  },
  loading: {
    orders: false,
    customers: false,
    inventory: false,
    production: false,
    reports: false
  },
  error: null,
  lastSaved: null
};

// Local storage utilities
const STORAGE_KEYS = {
  ORDERS: 'ssMudyf_orders',
  CUSTOMERS: 'ssMudyf_customers',
  INVENTORY: 'ssMudyf_inventory',
  PRODUCTION_STAGES: 'ssMudyf_productionStages',
  DAILY_SCORES: 'ssMudyf_dailyScores',
  PRODUCTION_LINES: 'ssMudyf_productionLines',
  SETTINGS: 'ssMudyf_settings',
  LAST_BACKUP: 'ssMudyf_lastBackup'
};

const StorageUtils = {
  save: (key, data) => {
    try {
      const serialized = JSON.stringify(data);
      localStorage.setItem(key, serialized);
      localStorage.setItem('ssMudyf_lastSaved', new Date().toISOString());
      return true;
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      return false;
    }
  },

  load: (key, defaultValue = []) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      return defaultValue;
    }
  },

  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Failed to remove from localStorage:', error);
      return false;
    }
  },

  clearAll: () => {
    Object.values(STORAGE_KEYS).forEach(key => {
      StorageUtils.remove(key);
    });
    localStorage.removeItem('ssMudyf_lastSaved');
  },

  exportAllData: () => {
    const data = {
      orders: StorageUtils.load(STORAGE_KEYS.ORDERS),
      customers: StorageUtils.load(STORAGE_KEYS.CUSTOMERS),
      inventory: StorageUtils.load(STORAGE_KEYS.INVENTORY),
      productionStages: StorageUtils.load(STORAGE_KEYS.PRODUCTION_STAGES),
      dailyScores: StorageUtils.load(STORAGE_KEYS.DAILY_SCORES),
      productionLines: StorageUtils.load(STORAGE_KEYS.PRODUCTION_LINES),
      settings: StorageUtils.load(STORAGE_KEYS.SETTINGS, initialState.settings),
      exportDate: new Date().toISOString(),
      version: '1.0.0',
      application: 'SS Mudyf Order Tracking System'
    };
    return data;
  },

  importAllData: (data) => {
    try {
      if (data.orders) StorageUtils.save(STORAGE_KEYS.ORDERS, data.orders);
      if (data.customers) StorageUtils.save(STORAGE_KEYS.CUSTOMERS, data.customers);
      if (data.inventory) StorageUtils.save(STORAGE_KEYS.INVENTORY, data.inventory);
      if (data.productionStages) StorageUtils.save(STORAGE_KEYS.PRODUCTION_STAGES, data.productionStages);
      if (data.dailyScores) StorageUtils.save(STORAGE_KEYS.DAILY_SCORES, data.dailyScores);
      if (data.productionLines) StorageUtils.save(STORAGE_KEYS.PRODUCTION_LINES, data.productionLines);
      if (data.settings) StorageUtils.save(STORAGE_KEYS.SETTINGS, data.settings);
      
      StorageUtils.save(STORAGE_KEYS.LAST_BACKUP, new Date().toISOString());
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }
};

// Reducer function
const dataReducer = (state, action) => {
  switch (action.type) {
    // Orders
    case ACTION_TYPES.SET_ORDERS:
      return { ...state, orders: action.payload };
    case ACTION_TYPES.ADD_ORDER:
      return { ...state, orders: [action.payload, ...state.orders] };
    case ACTION_TYPES.UPDATE_ORDER:
      return {
        ...state,
        orders: state.orders.map(order =>
          order.id === action.payload.id ? { ...order, ...action.payload } : order
        )
      };
    case ACTION_TYPES.DELETE_ORDER:
      return {
        ...state,
        orders: state.orders.filter(order => order.id !== action.payload)
      };

    // Customers
    case ACTION_TYPES.SET_CUSTOMERS:
      return { ...state, customers: action.payload };
    case ACTION_TYPES.ADD_CUSTOMER:
      return { ...state, customers: [action.payload, ...state.customers] };
    case ACTION_TYPES.UPDATE_CUSTOMER:
      return {
        ...state,
        customers: state.customers.map(customer =>
          customer.id === action.payload.id ? { ...customer, ...action.payload } : customer
        )
      };
    case ACTION_TYPES.DELETE_CUSTOMER:
      return {
        ...state,
        customers: state.customers.filter(customer => customer.id !== action.payload)
      };

    // Inventory
    case ACTION_TYPES.SET_INVENTORY:
      return { ...state, inventory: action.payload };
    case ACTION_TYPES.ADD_INVENTORY_ITEM:
      return { ...state, inventory: [action.payload, ...state.inventory] };
    case ACTION_TYPES.UPDATE_INVENTORY_ITEM:
      return {
        ...state,
        inventory: state.inventory.map(item =>
          item.id === action.payload.id ? { ...item, ...action.payload } : item
        )
      };
    case ACTION_TYPES.DELETE_INVENTORY_ITEM:
      return {
        ...state,
        inventory: state.inventory.filter(item => item.id !== action.payload)
      };
    case ACTION_TYPES.USE_INVENTORY_ITEM:
      return {
        ...state,
        inventory: state.inventory.map(item =>
          item.id === action.payload.id 
            ? {
                ...item,
                quantity_used: item.quantity_used + action.payload.quantity,
                quantity_available: item.quantity_available - action.payload.quantity,
                last_updated: new Date().toISOString()
              }
            : item
        )
      };
    case ACTION_TYPES.RECEIVE_INVENTORY_ITEM:
      return {
        ...state,
        inventory: state.inventory.map(item =>
          item.id === action.payload.id 
            ? {
                ...item,
                quantity_received: item.quantity_received + action.payload.quantity,
                quantity_available: item.quantity_available + action.payload.quantity,
                cost_per_unit: action.payload.costPerUnit || item.cost_per_unit,
                total_value: (item.quantity_received + action.payload.quantity) * (action.payload.costPerUnit || item.cost_per_unit),
                received_date: action.payload.receivedDate || item.received_date,
                last_updated: new Date().toISOString()
              }
            : item
        )
      };

    // Production
    case ACTION_TYPES.SET_PRODUCTION_STAGES:
      return { ...state, productionStages: action.payload };
    case ACTION_TYPES.ADD_PRODUCTION_STAGE:
      return { ...state, productionStages: [action.payload, ...state.productionStages] };
    case ACTION_TYPES.UPDATE_PRODUCTION_STAGE:
      return {
        ...state,
        productionStages: state.productionStages.map(stage =>
          stage.id === action.payload.id ? { ...stage, ...action.payload } : stage
        )
      };
    case ACTION_TYPES.DELETE_PRODUCTION_STAGE:
      return {
        ...state,
        productionStages: state.productionStages.filter(stage => stage.id !== action.payload)
      };
    case ACTION_TYPES.SET_DAILY_SCORES:
      return { ...state, dailyScores: action.payload };
    case ACTION_TYPES.ADD_DAILY_SCORE:
      // Replace existing score for same date and line
      const filteredScores = state.dailyScores.filter(score => 
        !(score.production_line === action.payload.production_line && score.date === action.payload.date)
      );
      return { ...state, dailyScores: [action.payload, ...filteredScores] };
    case ACTION_TYPES.UPDATE_DAILY_SCORE:
      return {
        ...state,
        dailyScores: state.dailyScores.map(score =>
          score.id === action.payload.id ? { ...score, ...action.payload } : score
        )
      };
    case ACTION_TYPES.DELETE_DAILY_SCORE:
      return {
        ...state,
        dailyScores: state.dailyScores.filter(score => score.id !== action.payload)
      };

    // Production Lines
    case ACTION_TYPES.SET_PRODUCTION_LINES:
      return { ...state, productionLines: action.payload };
    case ACTION_TYPES.ADD_PRODUCTION_LINE:
      return { ...state, productionLines: [action.payload, ...state.productionLines] };
    case ACTION_TYPES.UPDATE_PRODUCTION_LINE:
      return {
        ...state,
        productionLines: state.productionLines.map(line =>
          line.id === action.payload.id ? { ...line, ...action.payload } : line
        )
      };
    case ACTION_TYPES.DELETE_PRODUCTION_LINE:
      return {
        ...state,
        productionLines: state.productionLines.filter(line => line.id !== action.payload)
      };

    // Settings
    case ACTION_TYPES.SET_SETTINGS:
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case ACTION_TYPES.UPDATE_SETTINGS:
      return { ...state, settings: { ...state.settings, ...action.payload } };

    // Loading and Error states
    case ACTION_TYPES.SET_LOADING:
      return {
        ...state,
        loading: { ...state.loading, [action.payload.key]: action.payload.value }
      };
    case ACTION_TYPES.SET_ERROR:
      return { ...state, error: action.payload };
    case ACTION_TYPES.CLEAR_ERROR:
      return { ...state, error: null };

    default:
      return state;
  }
};

// Mock data generators with SZL currency
const getMockOrders = () => [
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
    price: 23125.00, // SZL amount (was $1250 USD)
    colour: 'Navy Blue',
    production_line: 'Line A',
    status: 'in_production',
    created_at: '2025-08-20T10:30:00.000Z',
    updated_at: '2025-08-20T10:30:00.000Z',
    customSizes: ['XS', 'S', 'M', 'L', 'XL', 'Custom-38', 'Custom-42'],
    total_units: 500,
    priority: 'High'
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
    price: 18130.00, // SZL amount (was $980 USD)
    colour: 'White',
    production_line: 'Line B',
    status: 'pending',
    created_at: '2025-08-22T14:15:00.000Z',
    updated_at: '2025-08-22T14:15:00.000Z',
    customSizes: ['S', 'M', 'L', 'Custom-36', 'Custom-40'],
    total_units: 300,
    priority: 'Medium'
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
    price: 27750.00, // SZL amount (was $1500 USD)
    colour: 'Black',
    production_line: 'Line C',
    status: 'completed',
    created_at: '2025-08-18T16:45:00.000Z',
    updated_at: '2025-08-25T10:30:00.000Z',
    customSizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Custom-34', 'Custom-44'],
    total_units: 750,
    priority: 'Critical'
  }
];

const getMockCustomers = () => [
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
    total_value: 346875.00, // SZL amount (was $18,750 USD)
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
    total_value: 181300.00, // SZL amount (was $9,800 USD)
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
    total_value: 288600.00, // SZL amount (was $15,600 USD)
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
    total_value: 654900.00, // SZL amount (was $35,400 USD)
    last_order: '2025-08-25'
  }
];

const getMockInventory = () => [
  {
    id: 1,
    type: 'fabric',
    name: 'Cotton Denim',
    supplier: 'Textile Suppliers Ltd',
    quantity_received: 500,
    quantity_used: 120,
    quantity_available: 380,
    unit: 'meters',
    cost_per_unit: 231.25, // SZL amount (was $12.50 USD)
    received_date: '2025-08-20',
    low_stock_threshold: 50,
    description: 'High-quality cotton denim, 14oz weight',
    color: 'Indigo Blue',
    category: 'Denim',
    created_at: '2025-08-20',
    last_updated: '2025-08-28',
    total_value: 115625.00 // SZL amount
  },
  {
    id: 2,
    type: 'trim',
    name: 'Metal Buttons',
    supplier: 'Button Co',
    quantity_received: 1000,
    quantity_used: 250,
    quantity_available: 750,
    unit: 'pieces',
    cost_per_unit: 6.48, // SZL amount (was $0.35 USD)
    received_date: '2025-08-22',
    low_stock_threshold: 100,
    description: 'Brass-plated metal buttons, 15mm diameter',
    color: 'Brass',
    category: 'Buttons',
    created_at: '2025-08-22',
    last_updated: '2025-08-26',
    total_value: 6480.00 // SZL amount
  },
  {
    id: 3,
    type: 'material',
    name: 'Polyester Thread',
    supplier: 'Thread Masters',
    quantity_received: 50,
    quantity_used: 12,
    quantity_available: 38,
    unit: 'spools',
    cost_per_unit: 77.70, // SZL amount (was $4.20 USD)
    received_date: '2025-08-25',
    low_stock_threshold: 10,
    description: 'High-strength polyester thread, 40 weight',
    color: 'Navy Blue',
    category: 'Thread',
    created_at: '2025-08-25',
    last_updated: '2025-08-29',
    total_value: 3885.00 // SZL amount
  },
  {
    id: 4,
    type: 'fabric',
    name: 'Cotton Canvas',
    supplier: 'Premium Fabrics',
    quantity_received: 200,
    quantity_used: 180,
    quantity_available: 20,
    unit: 'meters',
    cost_per_unit: 346.88, // SZL amount (was $18.75 USD)
    received_date: '2025-08-15',
    low_stock_threshold: 30,
    description: 'Heavy-duty cotton canvas, 16oz weight',
    color: 'Natural',
    category: 'Canvas',
    created_at: '2025-08-15',
    last_updated: '2025-08-28',
    total_value: 69376.00 // SZL amount
  },
  {
    id: 5,
    type: 'trim',
    name: 'YKK Zippers',
    supplier: 'YKK Fasteners',
    quantity_received: 200,
    quantity_used: 85,
    quantity_available: 115,
    unit: 'pieces',
    cost_per_unit: 46.25, // SZL amount (was $2.50 USD)
    received_date: '2025-08-18',
    low_stock_threshold: 20,
    description: 'Heavy-duty metal zippers, 20cm length',
    color: 'Silver',
    category: 'Zippers',
    created_at: '2025-08-18',
    last_updated: '2025-08-27',
    total_value: 9250.00 // SZL amount
  }
];

const getMockProductionStages = () => [
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
    efficiency: 95.2,
    created_at: '2025-08-28T10:30:00.000Z'
  },
  {
    id: 2,
    order_id: 1,
    stage: 'cutting',
    size: 'Custom-38',
    units_completed: 45,
    date_completed: '2025-08-28',
    production_line: 'Line A',
    operator: 'John Doe',
    notes: 'Custom size pattern adjusted for client specifications',
    quality_check: 'pass',
    efficiency: 88.5,
    created_at: '2025-08-28T11:15:00.000Z'
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
    efficiency: 93.3,
    created_at: '2025-08-29T14:20:00.000Z'
  },
  {
    id: 4,
    order_id: 1,
    stage: 'sewing',
    size: 'Custom-42',
    units_completed: 30,
    date_completed: '2025-08-29',
    production_line: 'Line A',
    operator: 'Jane Smith',
    notes: 'Custom fitting adjustments made',
    quality_check: 'pass',
    efficiency: 85.7,
    created_at: '2025-08-29T15:45:00.000Z'
  }
];

const getMockDailyScores = () => [
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
    notes: 'Good performance, minor quality issues',
    created_at: '2025-08-29T17:00:00.000Z'
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
    notes: 'Exceeded target, excellent team performance',
    created_at: '2025-08-29T17:00:00.000Z'
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
    notes: 'Rush order pressure, some quality compromises',
    created_at: '2025-08-29T17:00:00.000Z'
  }
];

const getMockProductionLines = () => [
  {
    id: 'line-a',
    name: 'Line A',
    location: 'Factory Floor East',
    capacity: 300,
    operatorCount: 6,
    specialization: 'Shirts & Blouses',
    status: 'active',
    notes: 'High-quality garment production line',
    efficiency: 95.2,
    currentOrder: 'ORD-2025-001',
    created_at: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'line-b',
    name: 'Line B',
    location: 'Factory Floor East',
    capacity: 250,
    operatorCount: 5,
    specialization: 'Trousers & Pants',
    status: 'active',
    notes: 'Specialized in bottom wear production',
    efficiency: 89.8,
    currentOrder: 'ORD-2025-002',
    created_at: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'line-c',
    name: 'Line C',
    location: 'Factory Floor West',
    capacity: 400,
    operatorCount: 8,
    specialization: 'Dresses & Skirts',
    status: 'maintenance',
    notes: 'Under maintenance - resuming Monday',
    efficiency: 78.9,
    currentOrder: 'ORD-2025-003',
    created_at: '2025-01-01T00:00:00.000Z'
  },
  {
    id: 'line-d',
    name: 'Line D',
    location: 'Factory Floor West',
    capacity: 200,
    operatorCount: 4,
    specialization: 'Jackets & Outerwear',
    status: 'active',
    notes: 'Heavy-duty garment production',
    efficiency: 95.1,
    currentOrder: 'ORD-2025-004',
    created_at: '2025-01-01T00:00:00.000Z'
  }
];

// Data Provider Component
export const DataProvider = ({ children }) => {
  const [state, dispatch] = useReducer(dataReducer, initialState);

  // Load data from localStorage on initialization
  useEffect(() => {
    const loadInitialData = () => {
      try {
        const orders = StorageUtils.load(STORAGE_KEYS.ORDERS, getMockOrders());
        const customers = StorageUtils.load(STORAGE_KEYS.CUSTOMERS, getMockCustomers());
        const inventory = StorageUtils.load(STORAGE_KEYS.INVENTORY, getMockInventory());
        const productionStages = StorageUtils.load(STORAGE_KEYS.PRODUCTION_STAGES, getMockProductionStages());
        const dailyScores = StorageUtils.load(STORAGE_KEYS.DAILY_SCORES, getMockDailyScores());
        const productionLines = StorageUtils.load(STORAGE_KEYS.PRODUCTION_LINES, getMockProductionLines());
        const settings = StorageUtils.load(STORAGE_KEYS.SETTINGS, initialState.settings);

        // Dispatch loaded data
        dispatch({ type: ACTION_TYPES.SET_ORDERS, payload: orders });
        dispatch({ type: ACTION_TYPES.SET_CUSTOMERS, payload: customers });
        dispatch({ type: ACTION_TYPES.SET_INVENTORY, payload: inventory });
        dispatch({ type: ACTION_TYPES.SET_PRODUCTION_STAGES, payload: productionStages });
        dispatch({ type: ACTION_TYPES.SET_DAILY_SCORES, payload: dailyScores });
        dispatch({ type: ACTION_TYPES.SET_PRODUCTION_LINES, payload: productionLines });
        dispatch({ type: ACTION_TYPES.SET_SETTINGS, payload: settings });
      } catch (error) {
        console.error('Failed to load initial data:', error);
        dispatch({ type: ACTION_TYPES.SET_ERROR, payload: 'Failed to load application data' });
      }
    };

    loadInitialData();
  }, []);

  // Auto-save to localStorage when data changes
  useEffect(() => {
    if (state.settings.autoSave && state.orders.length > 0) {
      StorageUtils.save(STORAGE_KEYS.ORDERS, state.orders);
    }
  }, [state.orders, state.settings.autoSave]);

  useEffect(() => {
    if (state.settings.autoSave && state.customers.length > 0) {
      StorageUtils.save(STORAGE_KEYS.CUSTOMERS, state.customers);
    }
  }, [state.customers, state.settings.autoSave]);

  useEffect(() => {
    if (state.settings.autoSave && state.inventory.length > 0) {
      StorageUtils.save(STORAGE_KEYS.INVENTORY, state.inventory);
    }
  }, [state.inventory, state.settings.autoSave]);

  useEffect(() => {
    if (state.settings.autoSave) {
      StorageUtils.save(STORAGE_KEYS.PRODUCTION_STAGES, state.productionStages);
    }
  }, [state.productionStages, state.settings.autoSave]);

  useEffect(() => {
    if (state.settings.autoSave) {
      StorageUtils.save(STORAGE_KEYS.DAILY_SCORES, state.dailyScores);
    }
  }, [state.dailyScores, state.settings.autoSave]);

  useEffect(() => {
    if (state.settings.autoSave) {
      StorageUtils.save(STORAGE_KEYS.PRODUCTION_LINES, state.productionLines);
    }
  }, [state.productionLines, state.settings.autoSave]);

  useEffect(() => {
    StorageUtils.save(STORAGE_KEYS.SETTINGS, state.settings);
  }, [state.settings]);

  // Action creators
  const actions = {
    // Orders
    addOrder: (order) => {
      const newOrder = {
        ...order,
        id: Date.now(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        customSizes: order.customSizes || [],
        total_units: order.total_units || 0
      };
      dispatch({ type: ACTION_TYPES.ADD_ORDER, payload: newOrder });
      return newOrder;
    },

    updateOrder: (id, updates) => {
      const updatedOrder = {
        ...updates,
        id,
        updated_at: new Date().toISOString()
      };
      dispatch({ type: ACTION_TYPES.UPDATE_ORDER, payload: updatedOrder });
      return updatedOrder;
    },

    deleteOrder: (id) => {
      dispatch({ type: ACTION_TYPES.DELETE_ORDER, payload: id });
      // Also delete related production stages
      const stagesToDelete = state.productionStages.filter(stage => stage.order_id === id);
      stagesToDelete.forEach(stage => {
        dispatch({ type: ACTION_TYPES.DELETE_PRODUCTION_STAGE, payload: stage.id });
      });
    },

    // Customers
    addCustomer: (customer) => {
      const newCustomer = {
        ...customer,
        id: Date.now(),
        created_at: new Date().toISOString(),
        total_orders: 0,
        total_value: 0,
        last_order: null
      };
      dispatch({ type: ACTION_TYPES.ADD_CUSTOMER, payload: newCustomer });
      return newCustomer;
    },

    updateCustomer: (id, updates) => {
      const updatedCustomer = {
        ...updates,
        id,
        updated_at: new Date().toISOString()
      };
      dispatch({ type: ACTION_TYPES.UPDATE_CUSTOMER, payload: updatedCustomer });
      return updatedCustomer;
    },

    deleteCustomer: (id) => {
      dispatch({ type: ACTION_TYPES.DELETE_CUSTOMER, payload: id });
      // Update orders to remove customer reference
      const ordersToUpdate = state.orders.filter(order => order.customer_id === id);
      ordersToUpdate.forEach(order => {
        actions.updateOrder(order.id, { customer_id: null, customer_name: 'Deleted Customer' });
      });
    },

    // Inventory
    addInventoryItem: (item) => {
      const quantityReceived = parseFloat(item.quantity_received) || 0;
      const costPerUnit = parseFloat(item.cost_per_unit) || 0;
      
      const newItem = {
        ...item,
        id: Date.now(),
        quantity_received: quantityReceived,
        quantity_used: 0,
        quantity_available: quantityReceived,
        cost_per_unit: costPerUnit,
        total_value: quantityReceived * costPerUnit,
        created_at: new Date().toISOString(),
        last_updated: new Date().toISOString()
      };
      dispatch({ type: ACTION_TYPES.ADD_INVENTORY_ITEM, payload: newItem });
      return newItem;
    },

    updateInventoryItem: (id, updates) => {
      const updatedItem = {
        ...updates,
        id,
        last_updated: new Date().toISOString()
      };
      dispatch({ type: ACTION_TYPES.UPDATE_INVENTORY_ITEM, payload: updatedItem });
      return updatedItem;
    },

    deleteInventoryItem: (id) => {
      dispatch({ type: ACTION_TYPES.DELETE_INVENTORY_ITEM, payload: id });
    },

    useInventoryItem: (id, quantity, usageData = {}) => {
      const item = state.inventory.find(item => item.id === id);
      if (!item || item.quantity_available < quantity) {
        throw new Error('Insufficient inventory available');
      }
      
      dispatch({ 
        type: ACTION_TYPES.USE_INVENTORY_ITEM, 
        payload: { id, quantity, ...usageData } 
      });
    },

    receiveInventoryItem: (id, quantity, receivingData = {}) => {
      dispatch({ 
        type: ACTION_TYPES.RECEIVE_INVENTORY_ITEM, 
        payload: { id, quantity, ...receivingData } 
      });
    },

    // Production
    addProductionStage: (stage) => {
      const newStage = {
        ...stage,
        id: Date.now(),
        created_at: new Date().toISOString(),
        efficiency: stage.efficiency || Math.round((Math.random() * 20 + 80) * 10) / 10
      };
      dispatch({ type: ACTION_TYPES.ADD_PRODUCTION_STAGE, payload: newStage });
      return newStage;
    },

    updateProductionStage: (id, updates) => {
      const updatedStage = {
        ...updates,
        id,
        updated_at: new Date().toISOString()
      };
      dispatch({ type: ACTION_TYPES.UPDATE_PRODUCTION_STAGE, payload: updatedStage });
      return updatedStage;
    },

    deleteProductionStage: (id) => {
      dispatch({ type: ACTION_TYPES.DELETE_PRODUCTION_STAGE, payload: id });
    },

    addDailyScore: (score) => {
      const targetUnits = parseInt(score.target_units) || 0;
      const actualUnits = parseInt(score.actual_units) || 0;
      const efficiency = targetUnits > 0 ? ((actualUnits / targetUnits) * 100) : 0;
      
      const newScore = {
        ...score,
        id: Date.now(),
        target_units: targetUnits,
        actual_units: actualUnits,
        efficiency_percentage: Math.round(efficiency * 10) / 10,
        created_at: new Date().toISOString()
      };
      dispatch({ type: ACTION_TYPES.ADD_DAILY_SCORE, payload: newScore });
      return newScore;
    },

    // Production Lines
    addProductionLine: (line) => {
      const newLine = {
        ...line,
        id: `line-${Date.now()}`,
        efficiency: 0,
        currentOrder: null,
        capacity: parseInt(line.capacity) || 0,
        operatorCount: parseInt(line.operatorCount) || 0,
        created_at: new Date().toISOString()
      };
      dispatch({ type: ACTION_TYPES.ADD_PRODUCTION_LINE, payload: newLine });
      return newLine;
    },

    updateProductionLine: (id, updates) => {
      const updatedLine = {
        ...updates,
        id,
        capacity: parseInt(updates.capacity) || 0,
        operatorCount: parseInt(updates.operatorCount) || 0,
        updated_at: new Date().toISOString()
      };
      dispatch({ type: ACTION_TYPES.UPDATE_PRODUCTION_LINE, payload: updatedLine });
      return updatedLine;
    },

    deleteProductionLine: (id) => {
      dispatch({ type: ACTION_TYPES.DELETE_PRODUCTION_LINE, payload: id });
      // Update any orders using this line
      const ordersToUpdate = state.orders.filter(order => order.production_line === state.productionLines.find(line => line.id === id)?.name);
      ordersToUpdate.forEach(order => {
        actions.updateOrder(order.id, { production_line: '' });
      });
    },

    // Settings
    updateSettings: (updates) => {
      dispatch({ type: ACTION_TYPES.UPDATE_SETTINGS, payload: updates });
    },

    // Utility actions
    setLoading: (key, value) => {
      dispatch({ type: ACTION_TYPES.SET_LOADING, payload: { key, value } });
    },

    setError: (error) => {
      dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error });
    },

    clearError: () => {
      dispatch({ type: ACTION_TYPES.CLEAR_ERROR });
    },

    // Data management
    exportData: () => {
      return StorageUtils.exportAllData();
    },

    importData: (data) => {
      const success = StorageUtils.importAllData(data);
      if (success) {
        // Reload all data
        dispatch({ type: ACTION_TYPES.SET_ORDERS, payload: data.orders || [] });
        dispatch({ type: ACTION_TYPES.SET_CUSTOMERS, payload: data.customers || [] });
        dispatch({ type: ACTION_TYPES.SET_INVENTORY, payload: data.inventory || [] });
        dispatch({ type: ACTION_TYPES.SET_PRODUCTION_STAGES, payload: data.productionStages || [] });
        dispatch({ type: ACTION_TYPES.SET_DAILY_SCORES, payload: data.dailyScores || [] });
        dispatch({ type: ACTION_TYPES.SET_PRODUCTION_LINES, payload: data.productionLines || [] });
        dispatch({ type: ACTION_TYPES.SET_SETTINGS, payload: { ...initialState.settings, ...data.settings } });
      }
      return success;
    },

    clearAllData: () => {
      StorageUtils.clearAll();
      dispatch({ type: ACTION_TYPES.SET_ORDERS, payload: [] });
      dispatch({ type: ACTION_TYPES.SET_CUSTOMERS, payload: [] });
      dispatch({ type: ACTION_TYPES.SET_INVENTORY, payload: [] });
      dispatch({ type: ACTION_TYPES.SET_PRODUCTION_STAGES, payload: [] });
      dispatch({ type: ACTION_TYPES.SET_DAILY_SCORES, payload: [] });
      dispatch({ type: ACTION_TYPES.SET_PRODUCTION_LINES, payload: [] });
      dispatch({ type: ACTION_TYPES.SET_SETTINGS, payload: initialState.settings });
    },

    // Analytics helper methods
    getOrdersByStatus: (status) => {
      return state.orders.filter(order => order.status === status);
    },

    getOrdersByCustomer: (customerId) => {
      return state.orders.filter(order => order.customer_id === customerId);
    },

    getInventoryByType: (type) => {
      return state.inventory.filter(item => item.type === type);
    },

    getLowStockItems: () => {
      return state.inventory.filter(item => item.quantity_available <= item.low_stock_threshold);
    },

    getProductionStagesByOrder: (orderId) => {
      return state.productionStages.filter(stage => stage.order_id === orderId);
    },

    getActiveProductionLines: () => {
      return state.productionLines.filter(line => line.status === 'active');
    }
  };

  const value = {
    ...state,
    actions,
    StorageUtils,
    ACTION_TYPES
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

// Hook to use the data context
export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export default DataContext;