// ==============================================
// src/utils/validation.js - Data Validation Utilities
// ==============================================

export const validators = {
  // Order validation
  validateOrder: (order) => {
    const errors = [];
    
    if (!order.order_number?.trim()) {
      errors.push('Order number is required');
    }
    
    if (!order.style_number?.trim()) {
      errors.push('Style number is required');
    }
    
    if (!order.customer_id) {
      errors.push('Customer is required');
    }
    
    if (!order.delivery_date) {
      errors.push('Delivery date is required');
    } else {
      const deliveryDate = new Date(order.delivery_date);
      const today = new Date();
      if (deliveryDate < today) {
        errors.push('Delivery date cannot be in the past');
      }
    }
    
    if (!order.price || order.price <= 0) {
      errors.push('Price must be greater than 0');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Customer validation
  validateCustomer: (customer) => {
    const errors = [];
    
    if (!customer.name?.trim()) {
      errors.push('Customer name is required');
    }
    
    if (customer.email && !isValidEmail(customer.email)) {
      errors.push('Invalid email address');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Inventory validation
  validateInventoryItem: (item) => {
    const errors = [];
    
    if (!item.name?.trim()) {
      errors.push('Item name is required');
    }
    
    if (!item.supplier?.trim()) {
      errors.push('Supplier is required');
    }
    
    if (!item.unit?.trim()) {
      errors.push('Unit of measurement is required');
    }
    
    if (!item.quantity_received || item.quantity_received <= 0) {
      errors.push('Quantity received must be greater than 0');
    }
    
    if (!item.cost_per_unit || item.cost_per_unit <= 0) {
      errors.push('Cost per unit must be greater than 0');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Production stage validation
  validateProductionStage: (stage) => {
    const errors = [];
    
    if (!stage.stage?.trim()) {
      errors.push('Production stage is required');
    }
    
    if (!stage.size?.trim()) {
      errors.push('Size is required');
    }
    
    if (!stage.units_completed || stage.units_completed <= 0) {
      errors.push('Units completed must be greater than 0');
    }
    
    if (!stage.date_completed) {
      errors.push('Completion date is required');
    }
    
    if (!stage.production_line?.trim()) {
      errors.push('Production line is required');
    }
    
    if (!stage.operator?.trim()) {
      errors.push('Operator name is required');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

// Helper function for email validation
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
