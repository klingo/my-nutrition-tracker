import { WEIGHT_CONVERSIONS, WEIGHT_UNITS } from '../models/constants/units';

export const convertWeight = {
    // For people
    toKg: (value, fromUnit) => {
        if (fromUnit === WEIGHT_UNITS.KILOGRAM) return value;
        if (fromUnit === WEIGHT_UNITS.POUND) return value * WEIGHT_CONVERSIONS[WEIGHT_UNITS.POUND][WEIGHT_UNITS.KILOGRAM];
        throw new Error('Unsupported weight unit for person');
    },

    // For products
    toGrams: (value, fromUnit) => {
        if (fromUnit === WEIGHT_UNITS.GRAM) return value;
        if (fromUnit === WEIGHT_UNITS.OUNCE) return value * WEIGHT_CONVERSIONS[WEIGHT_UNITS.OUNCE][WEIGHT_UNITS.GRAM];
        throw new Error('Unsupported weight unit for product');
    },
};
