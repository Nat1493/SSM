// ==============================================
// src/database/database.js - Simplified JSON Database
// ==============================================

const fs = require('fs');
const path = require('path');

class DatabaseManager {
  constructor() {
    this.dbPath = path.join(__dirname, '../../data');
    this.initializeDatabase();
  }

  initializeDatabase() {
    // Create data directory if it doesn't exist
    if (!fs.existsSync(this.dbPath)) {
      fs.mkdirSync(this.dbPath, { recursive: true });
    }

    // Initialize JSON files for each table
    this.initializeTable('orders', []);
    this.initializeTable('customers', []);
    this.initializeTable('inventory', []);
    this.initializeTable('production_stages', []);
    this.initializeTable('daily_production_scores', []);

    // Add some sample data if tables are empty
    this.addSampleData();
  }

  initializeTable(tableName, defaultData) {
    const filePath = path.join(this.dbPath, `${tableName}.json`);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
    }
  }

  readTable(tableName) {
    const filePath = path.join(this.dbPath, `${tableName}.json`);
    try {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error reading ${tableName}:`, error);
      return [];
    }
  }

  writeTable(tableName, data) {
    const filePath = path.join(this.dbPath, `${tableName}.json`);
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error(`Error writing ${tableName}:`, error);
      return false;
    }
  }

  generateId() {
    return Date.now() + Math.random().toString(36).substr(2, 9);
  }

  // Order methods
  createOrder(orderData) {
    const orders = this.readTable('orders');
    const newOrder = {
      id: this.generateId(),
      ...orderData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    orders.push(newOrder);
    this.writeTable('orders', orders);
    return newOrder;
  }

  getAllOrders() {
    const orders = this.readTable('orders');
    const customers = this.readTable('customers');
    
    // Join with customer data
    return orders.map(order => {
      const customer = customers.find(c => c.id === order.customer_id);
      return {
        ...order,
        customer_name: customer ? customer.name : 'Unknown Customer'
      };
    }).sort((a, b) => new Date(a.delivery_date) - new Date(b.delivery_date));
  }

  updateOrder(id, orderData) {
    const orders = this.readTable('orders');
    const index = orders.findIndex(order => order.id === id);
    if (index !== -1) {
      orders[index] = {
        ...orders[index],
        ...orderData,
        updated_at: new Date().toISOString()
      };
      this.writeTable('orders', orders);
      return orders[index];
    }
    return null;
  }

  deleteOrder(id) {
    const orders = this.readTable('orders');
    const filteredOrders = orders.filter(order => order.id !== id);
    return this.writeTable('orders', filteredOrders);
  }

  // Customer methods
  createCustomer(customerData) {
    const customers = this.readTable('customers');
    const newCustomer = {
      id: this.generateId(),
      ...customerData,
      created_at: new Date().toISOString()
    };
    customers.push(newCustomer);
    this.writeTable('customers', customers);
    return newCustomer;
  }

  getAllCustomers() {
    return this.readTable('customers').sort((a, b) => a.name.localeCompare(b.name));
  }

  updateCustomer(id, customerData) {
    const customers = this.readTable('customers');
    const index = customers.findIndex(customer => customer.id === id);
    if (index !== -1) {
      customers[index] = { ...customers[index], ...customerData };
      this.writeTable('customers', customers);
      return customers[index];
    }
    return null;
  }

  // Inventory methods
  createInventoryItem(itemData) {
    const inventory = this.readTable('inventory');
    const newItem = {
      id: this.generateId(),
      ...itemData,
      quantity_used: 0,
      created_at: new Date().toISOString()
    };
    inventory.push(newItem);
    this.writeTable('inventory', inventory);
    return newItem;
  }

  getAllInventory() {
    return this.readTable('inventory');
  }

  updateInventoryItem(id, itemData) {
    const inventory = this.readTable('inventory');
    const index = inventory.findIndex(item => item.id === id);
    if (index !== -1) {
      inventory[index] = { ...inventory[index], ...itemData };
      this.writeTable('inventory', inventory);
      return inventory[index];
    }
    return null;
  }

  // Production methods
  addProductionStage(stageData) {
    const stages = this.readTable('production_stages');
    const newStage = {
      id: this.generateId(),
      ...stageData,
      created_at: new Date().toISOString()
    };
    stages.push(newStage);
    this.writeTable('production_stages', stages);
    return newStage;
  }

  getProductionByOrder(orderId) {
    const stages = this.readTable('production_stages');
    return stages
      .filter(stage => stage.order_id === orderId)
      .sort((a, b) => new Date(b.date_completed) - new Date(a.date_completed));
  }

  getAllProductionStages() {
    return this.readTable('production_stages');
  }

  // Daily production score methods
  addDailyScore(scoreData) {
    const scores = this.readTable('daily_production_scores');
    
    // Remove existing score for same date and line
    const filteredScores = scores.filter(score => 
      !(score.production_line === scoreData.production_line && score.date === scoreData.date)
    );
    
    const newScore = {
      id: this.generateId(),
      ...scoreData,
      efficiency_percentage: ((scoreData.actual_units / scoreData.target_units) * 100).toFixed(1),
      created_at: new Date().toISOString()
    };
    
    filteredScores.push(newScore);
    this.writeTable('daily_production_scores', filteredScores);
    return newScore;
  }

  getDailyScores(startDate, endDate) {
    const scores = this.readTable('daily_production_scores');
    return scores
      .filter(score => score.date >= startDate && score.date <= endDate)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  getAllDailyScores() {
    return this.readTable('daily_production_scores');
  }

  // Analytics methods
  getOrderStatistics() {
    const orders = this.getAllOrders();
    const total = orders.length;
    const completed = orders.filter(o => o.status === 'completed').length;
    const inProduction = orders.filter(o => o.status === 'in_production').length;
    const pending = orders.filter(o => o.status === 'pending').length;

    return {
      total,
      completed,
      inProduction,
      pending,
      completionRate: total > 0 ? ((completed / total) * 100).toFixed(1) : 0
    };
  }

  getProductionEfficiency() {
    const scores = this.getAllDailyScores();
    if (scores.length === 0) return 0;
    
    const totalEfficiency = scores.reduce((sum, score) => sum + parseFloat(score.efficiency_percentage), 0);
    return (totalEfficiency / scores.length).toFixed(1);
  }

  addSampleData() {
    // Only add sample data if tables are empty
    const orders = this.readTable('orders');
    const customers = this.readTable('customers');
    
    if (customers.length === 0) {
      const sampleCustomers = [
        {
          id: 'cust-001',
          name: 'Fashion Plus Ltd',
          contact_person: 'Sarah Johnson',
          email: 'sarah@fashionplus.com',
          phone: '+268 78901234',
          address: 'Mbabane, Eswatini',
          created_at: new Date().toISOString()
        },
        {
          id: 'cust-002',
          name: 'Style Central Inc',
          contact_person: 'Michael Brown',
          email: 'michael@stylecentral.com',
          phone: '+268 76543210',
          address: 'Manzini, Eswatini',
          created_at: new Date().toISOString()
        },
        {
          id: 'cust-003',
          name: 'Trend Makers',
          contact_person: 'Lisa Davis',
          email: 'lisa@trendmakers.com',
          phone: '+268 75432109',
          address: 'Matsapha, Eswatini',
          created_at: new Date().toISOString()
        }
      ];
      this.writeTable('customers', sampleCustomers);
    }

    if (orders.length === 0) {
      const sampleOrders = [
        {
          id: 'ord-001',
          order_number: 'ORD-2025-001',
          style_number: 'STY-001',
          cutsheet_number: 'CS-001',
          account: 'Fashion Plus',
          brand: 'Premium',
          customer_id: 'cust-001',
          delivery_date: '2025-09-15',
          price: 1250.00,
          colour: 'Navy Blue',
          production_line: 'Line A',
          status: 'in_production',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'ord-002',
          order_number: 'ORD-2025-002',
          style_number: 'STY-002',
          cutsheet_number: 'CS-002',
          account: 'Style Central',
          brand: 'Classic',
          customer_id: 'cust-002',
          delivery_date: '2025-09-20',
          price: 980.00,
          colour: 'White',
          production_line: 'Line B',
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      this.writeTable('orders', sampleOrders);
    }
  }

  // Backup and restore methods
  exportData() {
    const data = {
      orders: this.readTable('orders'),
      customers: this.readTable('customers'),
      inventory: this.readTable('inventory'),
      production_stages: this.readTable('production_stages'),
      daily_production_scores: this.readTable('daily_production_scores'),
      exported_at: new Date().toISOString()
    };
    return data;
  }

  importData(data) {
    try {
      if (data.orders) this.writeTable('orders', data.orders);
      if (data.customers) this.writeTable('customers', data.customers);
      if (data.inventory) this.writeTable('inventory', data.inventory);
      if (data.production_stages) this.writeTable('production_stages', data.production_stages);
      if (data.daily_production_scores) this.writeTable('daily_production_scores', data.daily_production_scores);
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }
}

module.exports = DatabaseManager;