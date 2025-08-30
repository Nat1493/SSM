// ==============================================
// src/utils/validation.js - Data Validation Utilities
// ==============================================

export const validators = {
  // Order validation
  validateOrder: (order) => {
    const errors = [];
    
    if (!order.order_number?.trim()) {
      errors.push('Order number is required');
    } else if (order.order_number.length < 3) {
      errors.push('Order number must be at least 3 characters');
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
      today.setHours(0, 0, 0, 0);
      if (deliveryDate < today) {
        errors.push('Delivery date cannot be in the past');
      }
    }
    
    if (!order.price || order.price <= 0) {
      errors.push('Price must be greater than 0');
    } else if (order.price > 10000000) {
      errors.push('Price seems unusually high, please verify');
    }

    if (order.total_units && order.total_units <= 0) {
      errors.push('Total units must be greater than 0');
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
    } else if (customer.name.length < 2) {
      errors.push('Customer name must be at least 2 characters');
    }
    
    if (customer.email && !isValidEmail(customer.email)) {
      errors.push('Invalid email address');
    }

    if (customer.phone && !isValidPhone(customer.phone)) {
      errors.push('Invalid phone number format');
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

    if (item.low_stock_threshold && item.low_stock_threshold < 0) {
      errors.push('Low stock threshold cannot be negative');
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
  },

  // Production line validation
  validateProductionLine: (line) => {
    const errors = [];

    if (!line.name?.trim()) {
      errors.push('Line name is required');
    }

    if (line.capacity && line.capacity <= 0) {
      errors.push('Capacity must be greater than 0');
    }

    if (line.operatorCount && line.operatorCount <= 0) {
      errors.push('Operator count must be greater than 0');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Daily score validation
  validateDailyScore: (score) => {
    const errors = [];

    if (!score.production_line?.trim()) {
      errors.push('Production line is required');
    }

    if (!score.date) {
      errors.push('Date is required');
    }

    if (!score.target_units || score.target_units <= 0) {
      errors.push('Target units must be greater than 0');
    }

    if (score.actual_units < 0) {
      errors.push('Actual units cannot be negative');
    }

    if (score.operator_count && score.operator_count <= 0) {
      errors.push('Operator count must be greater than 0');
    }

    if (score.hours_worked && (score.hours_worked <= 0 || score.hours_worked > 24)) {
      errors.push('Hours worked must be between 0 and 24');
    }

    if (score.defective_units && score.defective_units < 0) {
      errors.push('Defective units cannot be negative');
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

// Helper function for phone validation (supports international formats)
const isValidPhone = (phone) => {
  const phoneRegex = /^[\+]?[0-9\s\-\(\)]{7,20}$/;
  return phoneRegex.test(phone);
};