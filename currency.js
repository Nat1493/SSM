// ==============================================
// src/utils/currency.js - Currency Utilities for Eswatini (SZL)
// ==============================================

export const currencyUtils = {
  // Format amount in Emalangeni
  format: (amount, options = {}) => {
    const {
      minimumFractionDigits = 2,
      maximumFractionDigits = 2,
      showSymbol = true,
      showCode = false
    } = options;

    const numAmount = parseFloat(amount) || 0;
    const formatted = numAmount.toLocaleString('en-US', {
      minimumFractionDigits,
      maximumFractionDigits
    });

    if (showCode) {
      return `SZL ${formatted}`;
    } else if (showSymbol) {
      return `E ${formatted}`;
    } else {
      return formatted;
    }
  },

  // Parse currency string to number
  parse: (currencyString) => {
    if (typeof currencyString === 'number') return currencyString;
    const numStr = currencyString?.toString().replace(/[E,\s]/g, '') || '0';
    return parseFloat(numStr) || 0;
  },

  // Convert to different currencies (rates as of 2025)
  convert: (amount, toCurrency = 'USD') => {
    const rates = {
      USD: 0.054, // 1 SZL = ~0.054 USD
      EUR: 0.050, // 1 SZL = ~0.050 EUR
      GBP: 0.043, // 1 SZL = ~0.043 GBP
      ZAR: 1.0,   // 1 SZL = 1 ZAR (pegged)
    };
    
    const rate = rates[toCurrency.toUpperCase()] || 1;
    return (parseFloat(amount) || 0) * rate;
  }
};