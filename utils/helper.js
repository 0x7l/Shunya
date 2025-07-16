// Utility helper functions for reconx project

/**
 * Deduplicate an array
 * @param {Array} arr
 * @returns {Array}
 */
function dedupe(arr) {
  return Array.from(new Set(arr));
}

/**
 * Sleep for ms milliseconds
 * @param {number} ms
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Format error for logging
 * @param {Error} err
 * @returns {string}
 */
function formatError(err) {
  return err && err.message ? err.message : String(err);
}

module.exports = {
  dedupe,
  sleep,
  formatError
};
