/**
 * Central export untuk semua utility functions
 * Memudahkan import di berbagai file
 */

// Format utilities
export {
  formatNumber,
  parseNumber,
  formatCurrency,
  formatDateIndonesian,
  generateSlug,
  getTodayDateString,
  calculateDiscountPercentage,
  calculateFinalPrice,
} from "./format";

// Form validation utilities
export {
  validateDateNotPast,
  validateEndDateAfterStart,
  validateDiscountNotGreaterThanOriginal,
  validateSeatsTakenNotGreaterThanTotal,
  validateArrayNotEmpty,
  validateUrl,
  validateSlug,
} from "./form-validation";

// Form helper utilities
export {
  addArrayField,
  removeArrayField,
  addHighlight,
  removeHighlight,
  addItinerary,
  removeItinerary,
  addActivity,
  removeActivity,
} from "./form-helpers";

