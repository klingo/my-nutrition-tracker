/**
 * Calculate net carbs based on the formula: net carbs = carbs - fiber - 0.5 x polyols
 * @param {string|number} carbsValue - Total carbohydrates value
 * @param {string|number} fiberValue - Fiber value
 * @param {string|number} polyolsValue - Polyols value
 * @returns {number} Calculated net carbs value (rounded to 1 decimal place, not less than 0)
 */
export default function calculateNetCarbs(carbsValue, fiberValue, polyolsValue) {
    // Parse values, defaulting to 0 if empty or invalid
    const carbs = parseFloat(carbsValue) || 0;
    const fiber = parseFloat(fiberValue) || 0;
    const polyols = parseFloat(polyolsValue) || 0;

    // Calculate net carbs using the formula: net carbs = carbs - fiber - 0.5 x polyols
    const netCarbs = carbs - fiber - 0.5 * polyols;

    // Return the calculated value, ensuring it's not negative and rounded to 1 decimal place
    return Math.max(0, parseFloat(netCarbs.toFixed(1)));
}
