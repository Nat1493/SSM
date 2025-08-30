// ==============================================
// src/utils/analytics.js - Analytics Utilities
// ==============================================

export const analytics = {
  // Calculate order statistics
  getOrderStats: (orders) => {
    const total = orders.length;
    const completed = orders.filter(o => o.status === 'completed').length;
    const inProduction = orders.filter(o => o.status === 'in_production').length;
    const pending = orders.filter(o => o.status === 'pending').length;
    const totalValue = orders.reduce((sum, order) => sum + (order.price || 0), 0);
    
    return {
      total,
      completed,
      inProduction,
      pending,
      completionRate: total > 0 ? (completed / total * 100).toFixed(1) : 0,
      totalValue,
      averageValue: total > 0 ? totalValue / total : 0
    };
  },

  // Calculate customer statistics
  getCustomerStats: (customers) => {
    const total = customers.length;
    const totalValue = customers.reduce((sum, customer) => sum + (customer.total_value || 0), 0);
    const avgOrderValue = total > 0 ? totalValue / total : 0;
    const premiumCustomers = customers.filter(c => 
      c.category === 'Premium' || c.category === 'VIP'
    ).length;
    
    return {
      total,
      totalValue,
      avgOrderValue,
      premiumCustomers,
      premiumPercentage: total > 0 ? (premiumCustomers / total * 100).toFixed(1) : 0
    };
  },

  // Calculate inventory statistics
  getInventoryStats: (inventory) => {
    const total = inventory.length;
    const totalValue = inventory.reduce((sum, item) => sum + (item.total_value || 0), 0);
    const lowStock = inventory.filter(item => 
      item.quantity_available <= item.low_stock_threshold
    ).length;
    const outOfStock = inventory.filter(item => item.quantity_available === 0).length;
    
    return {
      total,
      totalValue,
      lowStock,
      outOfStock,
      lowStockPercentage: total > 0 ? (lowStock / total * 100).toFixed(1) : 0
    };
  },

  // Calculate production efficiency
  getProductionStats: (productionStages, dailyScores) => {
    const avgEfficiency = dailyScores.length > 0 
      ? dailyScores.reduce((sum, score) => sum + score.efficiency_percentage, 0) / dailyScores.length
      : 0;
    
    const totalUnitsProduced = productionStages.reduce((sum, stage) => sum + stage.units_completed, 0);
    
    const stageStats = productionStages.reduce((acc, stage) => {
      if (!acc[stage.stage]) {
        acc[stage.stage] = { count: 0, units: 0 };
      }
      acc[stage.stage].count += 1;
      acc[stage.stage].units += stage.units_completed;
      return acc;
    }, {});
    
    return {
      avgEfficiency: avgEfficiency.toFixed(1),
      totalUnitsProduced,
      stageStats,
      totalStages: productionStages.length
    };
  }
};
