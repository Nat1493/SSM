// ==============================================
// src/contexts/DataContext.js - Enhanced with Daily Score Coordination
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
  
  // Daily Scores - Enhanced
  SET_DAILY_SCORES: 'SET_DAILY_SCORES',
  ADD_DAILY_SCORE: 'ADD_DAILY_SCORE',
  UPDATE_DAILY_SCORE: 'UPDATE_DAILY_SCORE',
  DELETE_DAILY_SCORE: 'DELETE_DAILY_SCORE',
  BATCH_UPDATE_DAILY_SCORES: 'BATCH_UPDATE_DAILY_SCORES',
  
  // Production Lines - Enhanced
  SET_PRODUCTION_LINES: 'SET_PRODUCTION_LINES',
  ADD_PRODUCTION_LINE: 'ADD_PRODUCTION_LINE',
  UPDATE_PRODUCTION_LINE: 'UPDATE_PRODUCTION_LINE',
  DELETE_PRODUCTION_LINE: 'DELETE_PRODUCTION_LINE',
  UPDATE_LINE_EFFICIENCY: 'UPDATE_LINE_EFFICIENCY',
  BATCH_UPDATE_LINES: 'BATCH_UPDATE_LINES',
  
  // Settings
  SET_SETTINGS: 'SET_SETTINGS',
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
  
  // System Analytics
  CALCULATE_ANALYTICS: 'CALCULATE_ANALYTICS',
  UPDATE_PERFORMANCE_METRICS: 'UPDATE_PERFORMANCE_METRICS',
  
  // Loading states
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Initial state with enhanced daily score tracking
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
    language: 'en',
    
    // Enhanced analytics settings
    analytics: {
      enableRealTimeUpdates: true,
      retainHistoryDays: 90,
      efficiencyAlertThreshold: 85,
      qualityAlertThreshold: 95,
      autoCalculateOEE: true
    }
  },
  
  // Enhanced performance metrics
  performanceMetrics: {
    overallEfficiency: 0,
    totalProductivity: 0,
    qualityIndex: 0,
    oeeScore: 0,
    lastUpdated: null,
    trends: {
      efficiency: [],
      productivity: [],
      quality: []
    }
  },
  
  loading: {
    orders: false,
    customers: false,
    inventory: false,
    production: false,
    reports: false,
    analytics: false
  },
  error: null,
  lastSaved: null
};

// Enhanced local storage utilities
const STORAGE_KEYS = {
  ORDERS: 'ssMudyf_orders',
  CUSTOMERS: 'ssMudyf_customers',
  INVENTORY: 'ssMudyf_inventory',
  PRODUCTION_STAGES: 'ssMudyf_productionStages',
  DAILY_SCORES: 'ssMudyf_dailyScores',
  PRODUCTION_LINES: 'ssMudyf_productionLines',
  SETTINGS: 'ssMudyf_settings',
  PERFORMANCE_METRICS: 'ssMudyf_performanceMetrics',
  ANALYTICS_CACHE: 'ssMudyf_analyticsCache',
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
      performanceMetrics: StorageUtils.load(STORAGE_KEYS.PERFORMANCE_METRICS, initialState.performanceMetrics),
      exportDate: new Date().toISOString(),
      version: '2.0.0',
      application: 'SS Mudyf Order Tracking System Enhanced'
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
      if (data.performanceMetrics) StorageUtils.save(STORAGE_KEYS.PERFORMANCE_METRICS, data.performanceMetrics);
      
      StorageUtils.save(STORAGE_KEYS.LAST_BACKUP, new Date().toISOString());
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }
};

// Enhanced analytics utilities
const AnalyticsUtils = {
  calculateEfficiencyMetrics: (dailyScores, productionLines) => {
    if (!dailyScores.length) return { overall: 0, byLine: {} };
    
    const byLine = {};
    let totalEfficiency = 0;
    let totalEntries = 0;

    productionLines.forEach(line => {
      const lineScores = dailyScores.filter(score => score.production_line === line.name);
      if (lineScores.length > 0) {
        const avgEfficiency = lineScores.reduce((sum, score) => sum + (score.efficiency_percentage || 0), 0) / lineScores.length;
        byLine[line.name] = {
          efficiency: Math.round(avgEfficiency * 10) / 10,
          count: lineScores.length,
          trend: AnalyticsUtils.calculateTrend(lineScores.map(s => s.efficiency_percentage || 0))
        };
        totalEfficiency += avgEfficiency;
        totalEntries++;
      }
    });

    return {
      overall: totalEntries > 0 ? Math.round((totalEfficiency / totalEntries) * 10) / 10 : 0,
      byLine
    };
  },

  calculateOEE: (dailyScores) => {
    if (!dailyScores.length) return 0;
    
    const avgOEE = dailyScores.reduce((sum, score) => {
      const efficiency = (score.efficiency_percentage || 0) / 100;
      const quality = (score.quality_rate || 100) / 100;
      const availability = 1 - ((score.downtime_minutes || 0) / (score.hours_worked * 60 || 480));
      return sum + (efficiency * quality * Math.max(availability, 0));
    }, 0) / dailyScores.length;

    return Math.round(avgOEE * 100 * 10) / 10;
  },

  calculateProductivityIndex: (dailyScores) => {
    if (!dailyScores.length) return 0;

    const totalActual = dailyScores.reduce((sum, score) => sum + (score.actual_units || 0), 0);
    const totalTarget = dailyScores.reduce((sum, score) => sum + (score.target_units || 0), 0);
    
    return totalTarget > 0 ? Math.round((totalActual / totalTarget) * 100 * 10) / 10 : 0;
  },

  calculateTrend: (values) => {
    if (values.length < 2) return 0;
    
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
    
    return Math.round((secondAvg - firstAvg) * 10) / 10;
  },

  identifyImprovementAreas: (efficiencyData, threshold = 85) => {
    const areas = [];
    
    Object.entries(efficiencyData.byLine).forEach(([lineName, data]) => {
      if (data.efficiency < threshold) {
        areas.push({
          line: lineName,
          efficiency: data.efficiency,
          gap: threshold - data.efficiency,
          trend: data.trend,
          priority: data.efficiency < 70 ? 'Critical' : data.efficiency < 80 ? 'High' : 'Medium'
        });
      }
    });

    return areas.sort((a, b) => a.efficiency - b.efficiency);
  }
};

// Enhanced reducer function
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

    // Production Stages
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

    // Daily Scores - Enhanced
    case ACTION_TYPES.SET_DAILY_SCORES:
      return { ...state, dailyScores: action.payload };
    
    case ACTION_TYPES.ADD_DAILY_SCORE:
      // Replace existing score for same date and line, then recalculate metrics
      const filteredScores = state.dailyScores.filter(score => 
        !(score.production_line === action.payload.production_line && score.date === action.payload.date)
      );
      const newDailyScores = [action.payload, ...filteredScores];
      
      // Auto-update production line efficiency
      const affectedLine = state.productionLines.find(line => line.name === action.payload.production_line);
      const updatedLines = affectedLine ? state.productionLines.map(line => 
        line.name === action.payload.production_line 
          ? { 
              ...line, 
              efficiency: action.payload.efficiency_percentage,
              lastScoreUpdate: new Date().toISOString()
            }
          : line
      ) : state.productionLines;
      
      return { 
        ...state, 
        dailyScores: newDailyScores,
        productionLines: updatedLines
      };
    
    case ACTION_TYPES.UPDATE_DAILY_SCORE:
      const updatedDailyScores = state.dailyScores.map(score =>
        score.id === action.payload.id ? { ...score, ...action.payload } : score
      );
      
      // Update corresponding production line efficiency
      const scoreToUpdate = updatedDailyScores.find(score => score.id === action.payload.id);
      const lineToUpdate = state.productionLines.find(line => line.name === scoreToUpdate?.production_line);
      const updatedLinesForScore = lineToUpdate ? state.productionLines.map(line => 
        line.name === scoreToUpdate.production_line 
          ? { 
              ...line, 
              efficiency: action.payload.efficiency_percentage || scoreToUpdate.efficiency_percentage,
              lastScoreUpdate: new Date().toISOString()
            }
          : line
      ) : state.productionLines;
      
      return {
        ...state,
        dailyScores: updatedDailyScores,
        productionLines: updatedLinesForScore
      };
    
    case ACTION_TYPES.DELETE_DAILY_SCORE:
      return {
        ...state,
        dailyScores: state.dailyScores.filter(score => score.id !== action.payload)
      };

    case ACTION_TYPES.BATCH_UPDATE_DAILY_SCORES:
      return {
        ...state,
        dailyScores: action.payload.scores,
        productionLines: action.payload.updatedLines || state.productionLines
      };

    // Production Lines - Enhanced
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
      // When deleting a production line, clean up related daily scores
      const remainingLines = state.productionLines.filter(line => line.id !== action.payload);
      const deletedLine = state.productionLines.find(line => line.id === action.payload);
      const cleanedDailyScores = deletedLine 
        ? state.dailyScores.filter(score => score.production_line !== deletedLine.name)
        : state.dailyScores;
      
      return {
        ...state,
        productionLines: remainingLines,
        dailyScores: cleanedDailyScores
      };

    case ACTION_TYPES.UPDATE_LINE_EFFICIENCY:
      return {
        ...state,
        productionLines: state.productionLines.map(line =>
          line.id === action.payload.lineId 
            ? { 
                ...line, 
                efficiency: action.payload.efficiency,
                lastEfficiencyUpdate: new Date().toISOString()
              }
            : line
        )
      };

    case ACTION_TYPES.BATCH_UPDATE_LINES:
      return {
        ...state,
        productionLines: action.payload
      };

    // Performance Metrics
    case ACTION_TYPES.UPDATE_PERFORMANCE_METRICS:
      return {
        ...state,
        performanceMetrics: {
          ...state.performanceMetrics,
          ...action.payload,
          lastUpdated: new Date().toISOString()
        }
      };

    case ACTION_TYPES.CALCULATE_ANALYTICS:
      const efficiencyMetrics = AnalyticsUtils.calculateEfficiencyMetrics(state.dailyScores, state.productionLines);
      const oeeScore = AnalyticsUtils.calculateOEE(state.dailyScores);
      const productivityIndex = AnalyticsUtils.calculateProductivityIndex(state.dailyScores);
      
      return {
        ...state,
        performanceMetrics: {
          ...state.performanceMetrics,
          overallEfficiency: efficiencyMetrics.overall,
          oeeScore: oeeScore,
          totalProductivity: productivityIndex,
          qualityIndex: Math.round(
            state.dailyScores.reduce((sum, score) => sum + (score.quality_rate || 100), 0) / 
            (state.dailyScores.length || 1)
          ),
          lastUpdated: new Date().toISOString(),
          improvementAreas: AnalyticsUtils.identifyImprovementAreas(efficiencyMetrics)
        }
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

// Enhanced mock data generators
const getMockDailyScores = () => [
  {
    id: 1,
    production_line: 'Line A',
    date: '2025-08-31',
    target_units: 300,
    actual_units: 295,
    operator_count: 6,
    hours_worked: 8,
    defective_units: 3,
    downtime_minutes: 15,
    quality_score: 99,
    efficiency_percentage: 98.3,
    quality_rate: 98.9,
    productivity_rate: 6.15,
    oee_score: 97.2,
    units_per_operator: 49,
    units_per_hour: 36.9,
    variance_from_target: -5,
    variance_percentage: -1.7,
    notes: 'Excellent performance, minor adjustment needed on machine 3',
    created_at: '2025-08-31T17:00:00.000Z'
  },
  {
    id: 2,
    production_line: 'Line B',
    date: '2025-08-31',
    target_units: 250,
    actual_units: 268,
    operator_count: 5,
    hours_worked: 8,
    defective_units: 2,
    downtime_minutes: 5,
    quality_score: 100,
    efficiency_percentage: 107.2,
    quality_rate: 99.3,
    productivity_rate: 6.7,
    oee_score: 106.4,
    units_per_operator: 54,
    units_per_hour: 33.5,
    variance_from_target: 18,
    variance_percentage: 7.2,
    notes: 'Exceeded target significantly, great teamwork',
    created_at: '2025-08-31T17:00:00.000Z'
  },
  {
    id: 3,
    production_line: 'Line A',
    date: '2025-08-30',
    target_units: 300,
    actual_units: 285,
    operator_count: 6,
    hours_worked: 8,
    defective_units: 5,
    downtime_minutes: 30,
    quality_score: 95,
    efficiency_percentage: 95.0,
    quality_rate: 98.2,
    productivity_rate: 5.94,
    oee_score: 93.3,
    units_per_operator: 48,
    units_per_hour: 35.6,
    variance_from_target: -15,
    variance_percentage: -5.0,
    notes: 'Good performance, some downtime for maintenance',
    created_at: '2025-08-30T17:00:00.000Z'
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
    efficiency: 96.7, // Will be updated from daily scores
    currentOrder: 'ORD-2025-001',
    lastScoreUpdate: '2025-08-31T17:00:00.000Z',
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
    efficiency: 107.2,
    currentOrder: 'ORD-2025-002',
    lastScoreUpdate: '2025-08-31T17:00:00.000Z',
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
    currentOrder: null,
    lastScoreUpdate: '2025-08-29T17:00:00.000Z',
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
        const performanceMetrics = StorageUtils.load(STORAGE_KEYS.PERFORMANCE_METRICS, initialState.performanceMetrics);

        // Dispatch loaded data
        dispatch({ type: ACTION_TYPES.SET_ORDERS, payload: orders });
        dispatch({ type: ACTION_TYPES.SET_CUSTOMERS, payload: customers });
        dispatch({ type: ACTION_TYPES.SET_INVENTORY, payload: inventory });
        dispatch({ type: ACTION_TYPES.SET_PRODUCTION_STAGES, payload: productionStages });
        dispatch({ type: ACTION_TYPES.SET_DAILY_SCORES, payload: dailyScores });
        dispatch({ type: ACTION_TYPES.SET_PRODUCTION_LINES, payload: productionLines });
        dispatch({ type: ACTION_TYPES.SET_SETTINGS, payload: settings });
        dispatch({ type: ACTION_TYPES.UPDATE_PERFORMANCE_METRICS, payload: performanceMetrics });
      } catch (error) {
        console.error('Failed to load initial data:', error);
        dispatch({ type: ACTION_TYPES.SET_ERROR, payload: 'Failed to load application data' });
      }
    };

    loadInitialData();
  }, []);

  // Auto-save enhanced data to localStorage when data changes
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

  useEffect(() => {
    StorageUtils.save(STORAGE_KEYS.PERFORMANCE_METRICS, state.performanceMetrics);
  }, [state.performanceMetrics]);

  // Auto-recalculate analytics when daily scores change
  useEffect(() => {
    if (state.settings.analytics?.enableRealTimeUpdates) {
      dispatch({ type: ACTION_TYPES.CALCULATE_ANALYTICS });
    }
  }, [state.dailyScores, state.settings.analytics?.enableRealTimeUpdates]);

  // Enhanced action creators
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

    // Enhanced Daily Scores
    addDailyScore: (score) => {
      const targetUnits = parseInt(score.target_units) || 0;
      const actualUnits = parseInt(score.actual_units) || 0;
      const defectiveUnits = parseInt(score.defective_units) || 0;
      const hoursWorked = parseFloat(score.hours_worked) || 8;
      const operatorCount = parseInt(score.operator_count) || 1;
      const downtimeMinutes = parseInt(score.downtime_minutes) || 0;

      // Calculate comprehensive metrics
      const efficiency = targetUnits > 0 ? ((actualUnits / targetUnits) * 100) : 0;
      const qualityRate = actualUnits > 0 ? (((actualUnits - defectiveUnits) / actualUnits) * 100) : 100;
      const productivity = operatorCount > 0 && hoursWorked > 0 ? actualUnits / (operatorCount * hoursWorked) : 0;
      const availability = 1 - (downtimeMinutes / (hoursWorked * 60));
      const oee = (efficiency * qualityRate * Math.max(availability, 0)) / 10000;

      const newScore = {
        ...score,
        id: Date.now(),
        target_units: targetUnits,
        actual_units: actualUnits,
        defective_units: defectiveUnits,
        hours_worked: hoursWorked,
        operator_count: operatorCount,
        downtime_minutes: downtimeMinutes,
        
        // Calculated metrics
        efficiency_percentage: Math.round(efficiency * 10) / 10,
        quality_rate: Math.round(qualityRate * 10) / 10,
        productivity_rate: Math.round(productivity * 100) / 100,
        oee_score: Math.round(oee * 100 * 10) / 10,
        
        // Additional analytics
        units_per_operator: operatorCount > 0 ? Math.round(actualUnits / operatorCount) : 0,
        units_per_hour: hoursWorked > 0 ? Math.round(actualUnits / hoursWorked * 10) / 10 : 0,
        variance_from_target: actualUnits - targetUnits,
        variance_percentage: targetUnits > 0 ? Math.round(((actualUnits - targetUnits) / targetUnits * 100) * 10) / 10 : 0,
        
        created_at: new Date().toISOString()
      };

      dispatch({ type: ACTION_TYPES.ADD_DAILY_SCORE, payload: newScore });
      return newScore;
    },

    updateDailyScore: (id, updates) => {
      const updatedScore = {
        ...updates,
        id,
        updated_at: new Date().toISOString()
      };
      dispatch({ type: ACTION_TYPES.UPDATE_DAILY_SCORE, payload: updatedScore });
      return updatedScore;
    },

    deleteDailyScore: (id) => {
      dispatch({ type: ACTION_TYPES.DELETE_DAILY_SCORE, payload: id });
    },

    // Batch operations for daily scores
    batchUpdateDailyScores: (scores, updatedLines = null) => {
      dispatch({ 
        type: ACTION_TYPES.BATCH_UPDATE_DAILY_SCORES, 
        payload: { scores, updatedLines } 
      });
    },

    // Enhanced Production Lines
    addProductionLine: (line) => {
      const newLine = {
        ...line,
        id: `line-${Date.now()}`,
        efficiency: 0,
        currentOrder: null,
        capacity: parseInt(line.capacity) || 0,
        operatorCount: parseInt(line.operatorCount) || 0,
        lastScoreUpdate: null,
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
    },

    updateLineEfficiency: (lineId, efficiency) => {
      dispatch({ 
        type: ACTION_TYPES.UPDATE_LINE_EFFICIENCY, 
        payload: { lineId, efficiency: Math.round(efficiency * 10) / 10 } 
      });
    },

    batchUpdateProductionLines: (lines) => {
      dispatch({ type: ACTION_TYPES.BATCH_UPDATE_LINES, payload: lines });
    },

    // Settings
    updateSettings: (updates) => {
      dispatch({ type: ACTION_TYPES.UPDATE_SETTINGS, payload: updates });
    },

    // Analytics
    calculateAnalytics: () => {
      dispatch({ type: ACTION_TYPES.CALCULATE_ANALYTICS });
    },

    updatePerformanceMetrics: (metrics) => {
      dispatch({ type: ACTION_TYPES.UPDATE_PERFORMANCE_METRICS, payload: metrics });
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

    // Enhanced data management
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
        if (data.performanceMetrics) {
          dispatch({ type: ACTION_TYPES.UPDATE_PERFORMANCE_METRICS, payload: data.performanceMetrics });
        }
        // Recalculate analytics after import
        dispatch({ type: ACTION_TYPES.CALCULATE_ANALYTICS });
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
      dispatch({ type: ACTION_TYPES.UPDATE_PERFORMANCE_METRICS, payload: initialState.performanceMetrics });
    },

    // Enhanced analytics helper methods
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
    },

    getDailyScoresByLine: (productionLine, dateRange = 7) => {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - dateRange);
      
      return state.dailyScores.filter(score => 
        score.production_line === productionLine && 
        new Date(score.date) >= cutoffDate
      ).sort((a, b) => new Date(b.date) - new Date(a.date));
    },

    getEfficiencyTrends: (days = 7) => {
      const trends = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayScores = state.dailyScores.filter(score => score.date === dateStr);
        const avgEfficiency = dayScores.length > 0 
          ? dayScores.reduce((sum, score) => sum + (score.efficiency_percentage || 0), 0) / dayScores.length
          : 0;
        
        trends.push({
          date: dateStr,
          efficiency: Math.round(avgEfficiency * 10) / 10,
          count: dayScores.length
        });
      }
      return trends;
    },

    getPerformanceInsights: () => {
      const recentScores = state.dailyScores.filter(score => {
        const scoreDate = new Date(score.date);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return scoreDate >= weekAgo;
      });

      if (recentScores.length === 0) {
        return {
          summary: 'No recent performance data available',
          insights: [],
          recommendations: []
        };
      }

      const avgEfficiency = recentScores.reduce((sum, score) => sum + (score.efficiency_percentage || 0), 0) / recentScores.length;
      const avgQuality = recentScores.reduce((sum, score) => sum + (score.quality_rate || 100), 0) / recentScores.length;
      const avgOEE = recentScores.reduce((sum, score) => sum + (score.oee_score || 0), 0) / recentScores.length;

      const insights = [];
      const recommendations = [];

      if (avgEfficiency >= 95) {
        insights.push('Excellent efficiency performance this week');
      } else if (avgEfficiency < 80) {
        insights.push('Efficiency below target - requires attention');
        recommendations.push('Review production processes and identify bottlenecks');
      }

      if (avgQuality < 95) {
        insights.push('Quality rates below optimal levels');
        recommendations.push('Implement additional quality control measures');
      }

      if (avgOEE >= 85) {
        insights.push('Outstanding Overall Equipment Effectiveness');
      } else if (avgOEE < 70) {
        recommendations.push('Focus on reducing downtime and improving availability');
      }

      return {
        summary: `Weekly Performance: ${avgEfficiency.toFixed(1)}% efficiency, ${avgQuality.toFixed(1)}% quality, ${avgOEE.toFixed(1)}% OEE`,
        insights,
        recommendations,
        metrics: {
          efficiency: avgEfficiency,
          quality: avgQuality,
          oee: avgOEE
        }
      };
    }
  };

  // Include mock data generators (keeping existing ones)
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
      price_per_unit: 46.25,
      total_units: 500,
      total_value: 23125.00,
      price: 23125.00,
      colour: 'Navy Blue',
      production_line: 'Line A',
      status: 'in_production',
      created_at: '2025-08-20T10:30:00.000Z',
      updated_at: '2025-08-20T10:30:00.000Z',
      customSizes: ['XS', 'S', 'M', 'L', 'XL', 'Custom-38', 'Custom-42'],
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
      price_per_unit: 60.43,
      total_units: 300,
      total_value: 18130.00,
      price: 18130.00,
      colour: 'White',
      production_line: 'Line B',
      status: 'pending',
      created_at: '2025-08-22T14:15:00.000Z',
      updated_at: '2025-08-22T14:15:00.000Z',
      customSizes: ['S', 'M', 'L', 'Custom-36', 'Custom-40'],
      priority: 'Medium'
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
      total_value: 346875.00,
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
      total_value: 181300.00,
      last_order: '2025-08-22'
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
      cost_per_unit: 231.25,
      received_date: '2025-08-20',
      low_stock_threshold: 50,
      description: 'High-quality cotton denim, 14oz weight',
      color: 'Indigo Blue',
      category: 'Denim',
      created_at: '2025-08-20',
      last_updated: '2025-08-28',
      total_value: 115625.00
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
    }
  ];

  const value = {
    ...state,
    actions,
    StorageUtils,
    AnalyticsUtils,
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