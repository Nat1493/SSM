// ==============================================
// src/utils/index.js - Main Utils Export File
// ==============================================

// Import all utility modules
import { currencyUtils } from './currency';
import { validators } from './validation';
import { dateUtils } from './dateUtils';
import { analytics } from './analytics';

// Re-export everything for easy importing
export { currencyUtils } from './currency';
export { validators } from './validation';
export { dateUtils } from './dateUtils';
export { analytics } from './analytics';

// ==============================================
// Export all utilities as default export
// ==============================================
export default {
  currencyUtils,
  validators,
  dateUtils,
  analytics
};