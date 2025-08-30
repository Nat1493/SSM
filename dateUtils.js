// ==============================================
// src/utils/dateUtils.js - Date Utilities
// ==============================================

export const dateUtils = {
  // Format date for display
  formatDate: (date, options = {}) => {
    if (!date) return '';
    
    const {
      format = 'short', // 'short', 'long', 'medium'
      includeTime = false
    } = options;
    
    const dateObj = new Date(date);
    
    if (isNaN(dateObj.getTime())) return '';
    
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
    
    return dateObj.toLocaleDateString('en-GB', baseOptions);
  },

  // Get relative time (e.g., "2 days ago")
  getRelativeTime: (date) => {
    if (!date) return '';
    
    const now = new Date();
    const dateObj = new Date(date);
    const diffInMs = now - dateObj;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  },

  // Check if date is overdue
  isOverdue: (date) => {
    if (!date) return false;
    return new Date(date) < new Date();
  },

  // Get days until date
  getDaysUntil: (date) => {
    if (!date) return null;
    
    const now = new Date();
    const dateObj = new Date(date);
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
  }
};
// ==============================================
// Export all utilities
// ==============================================

export default {
  currencyUtils,
  validators,
  analytics,
  dateUtils
};