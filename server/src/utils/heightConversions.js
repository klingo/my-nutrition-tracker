import { HEIGHT_CONVERSIONS, HEIGHT_UNITS } from '../models/constants/units.js';

export const convertHeight = {
    toCm: (value, fromUnit) => {
        if (fromUnit === HEIGHT_UNITS.CENTIMETER) return value;
        if (fromUnit === HEIGHT_UNITS.INCH)
            return value * HEIGHT_CONVERSIONS[HEIGHT_UNITS.INCH][HEIGHT_UNITS.CENTIMETER];
        throw new Error('Unsupported height unit');
    },

    toInch: (value, fromUnit) => {
        if (fromUnit === HEIGHT_UNITS.INCH) return value;
        if (fromUnit === HEIGHT_UNITS.CENTIMETER)
            return value * HEIGHT_CONVERSIONS[HEIGHT_UNITS.CENTIMETER][HEIGHT_UNITS.INCH];
        throw new Error('Unsupported height unit');
    },
};
