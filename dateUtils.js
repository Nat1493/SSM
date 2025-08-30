// ==============================================
// src/utils/dateUtils.js - Enhanced Date Utilities
// ==============================================

export const dateUtils = {
  // Format date for display
  formatDate: (date, options = {}) => {
    if (!date) return '';
    
    const {
      format = 'short', // 'short', 'long', 'medium', 'iso'
      includeTime = false,
      locale = 'en-GB'
    } = options;
    
    const dateObj = new Date(date);
    
    if (isNaN(dateObj.getTime())) return '';
    
    if (format === 'iso') {
      return includeTime ? dateObj.toISOString() : dateObj.toISOString().split('T')[0];
    }
    
    const formatOptions = {
      short: { day: '2-digit', month: '2-digit', year: 'numeric' },
      medium: { day: 'numeric', month: 'short', year: 'numeric' },
      long: { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }
    };
    
    const baseOptions = formatOptions[format] || formatOptions.short;
    
    if (includeTime) {
      baseOptions.hour = '2-digit';
      baseOptions.minute = '2-digit';
    }
    
    return dateObj.toLocaleDateString(locale, baseOptions);
  },

  // Get relative time (e.g., "2 days ago")
  getRelativeTime: (date) => {
    if (!date) return '';
    
    const now = new Date();
    const dateObj = new Date(date);
    const diffInMs = now - dateObj;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} week${Math.floor(diffInDays / 7) === 1 ? '' : 's'} ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} month${Math.floor(diffInDays / 30) === 1 ? '' : 's'} ago`;
    return `${Math.floor(diffInDays / 365)} year${Math.floor(diffInDays / 365) === 1 ? '' : 's'} ago`;
  },

  // Check if date is overdue
  isOverdue: (date) => {
    if (!date) return false;
    const now = new Date();
    const dateObj = new Date(date);
    now.setHours(0, 0, 0, 0);
    dateObj.setHours(0, 0, 0, 0);
    return dateObj < now;
  },

  // Get days until date
  getDaysUntil: (date) => {
    if (!date) return null;
    
    const now = new Date();
    const dateObj = new Date(date);
    now.setHours(0, 0, 0, 0);
    dateObj.setHours(0, 0, 0, 0);
    const diffInMs = dateObj - now;
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
    
    return diffInDays;
  },

  // Get date range for filters
  getDateRange: (period) => {
    const now = new Date();
    const start = new Date();
    
    switch (period) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        break;
      case 'yesterday':
        start.setDate(now.getDate() - 1);
        start.setHours(0, 0, 0, 0);
        break;
      case 'week':
        start.setDate(now.getDate() - 7);
        break;
      case 'month':
        start.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        start.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        start.setFullYear(now.getFullYear() - 1);
        break;
      default:
        start.setDate(now.getDate() - 7);
    }
    
    return {
      start: start.toISOString().split('T')[0],
      end: now.toISOString().split('T')[0]
    };
  },

  // Format duration
  formatDuration: (startDate, endDate) => {
    if (!startDate || !endDate) return '';
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffInMs = end - start;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInHours = Math.floor((diffInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffInDays > 0) {
      return `${diffInDays} day${diffInDays === 1 ? '' : 's'}${diffInHours > 0 ? ` ${diffInHours}h` : ''}`;
    } else if (diffInHours > 0) {
      const diffInMinutes = Math.floor((diffInMs % (1000 * 60 * 60)) / (1000 * 60));
      return `${diffInHours}h${diffInMinutes > 0 ? ` ${diffInMinutes}m` : ''}`;
    } else {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'}`;
    }
  },

  // Get current date in ISO format for input fields
  getCurrentDate: () => {
    return new Date().toISOString().split('T')[0];
  },

  // Get start of current month
  getStartOfMonth: (date = new Date()) => {
    const start = new Date(date);
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    return start.toISOString().split('T')[0];
  },

  // Get end of current month
  getEndOfMonth: (date = new Date()) => {
    const end = new Date(date);
    end.setMonth(end.getMonth() + 1, 0);
    end.setHours(23, 59, 59, 999);
    return end.toISOString().split('T')[0];
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