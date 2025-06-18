import { ENERGY_UNITS, ENERGY_CONVERSIONS } from '../models/constants/units';

export const convertEnergy = {
    toKcal: (value, fromUnit) => {
        if (fromUnit === ENERGY_UNITS.KILOCALORIE) return value;
        if (fromUnit === ENERGY_UNITS.KILOJOULE) {
            return value * ENERGY_CONVERSIONS[ENERGY_UNITS.KILOJOULE][ENERGY_UNITS.KILOCALORIE];
        }
        throw new Error('Unsupported energy unit');
    },

    toKj: (value, fromUnit) => {
        if (fromUnit === ENERGY_UNITS.KILOJOULE) return value;
        if (fromUnit === ENERGY_UNITS.KILOCALORIE) {
            return value * ENERGY_CONVERSIONS[ENERGY_UNITS.KILOCALORIE][ENERGY_UNITS.KILOJOULE];
        }
        throw new Error('Unsupported energy unit');
    },
};
