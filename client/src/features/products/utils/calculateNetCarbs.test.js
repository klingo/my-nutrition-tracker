import { describe, expect, it } from 'vitest';
import calculateNetCarbs from './calculateNetCarbs';

describe('calculateNetCarbs', () => {
    it('should calculate net carbs correctly with all positive values', () => {
        const result = calculateNetCarbs(10, 2, 4);
        expect(result).toBe(6.0); // 10 - 2 - 0.5 * 4 = 6.0
    });

    it('should handle string inputs correctly', () => {
        const result = calculateNetCarbs('10', '2', '4');
        expect(result).toBe(6.0); // 10 - 2 - 0.5 * 4 = 6.0
    });

    it('should return 0 when calculated net carbs is negative', () => {
        const result = calculateNetCarbs(1, 5, 2);
        expect(result).toBe(0); // 1 - 5 - 0.5 * 2 = -5, but clamped to 0
    });

    it('should handle zero values correctly', () => {
        const result = calculateNetCarbs(0, 0, 0);
        expect(result).toBe(0); // 0 - 0 - 0.5 * 0 = 0
    });

    it('should handle missing polyols value', () => {
        const result = calculateNetCarbs(10, 2, null);
        expect(result).toBe(8.0); // 10 - 2 - 0.5 * 0 = 8.0
    });

    it('should handle missing fiber value', () => {
        const result = calculateNetCarbs(10, null, 4);
        expect(result).toBe(8.0); // 10 - 0 - 0.5 * 4 = 8.0
    });

    it('should handle missing carbs value', () => {
        const result = calculateNetCarbs(null, 2, 4);
        expect(result).toBe(0); // 0 - 2 - 0.5 * 4 = -4, but clamped to 0
    });

    it('should handle empty string values', () => {
        const result = calculateNetCarbs('', '', '');
        expect(result).toBe(0); // 0 - 0 - 0.5 * 0 = 0
    });

    it('should handle negative input values', () => {
        const result = calculateNetCarbs(-10, -2, -4);
        expect(result).toBe(0); // -10 - (-2) - 0.5 * (-4) = -6, but clamped to 0
    });

    it('should round result to 1 decimal place', () => {
        const result = calculateNetCarbs(10.55, 2.11, 3.33);
        expect(result).toBe(6.8); // 10.55 - 2.11 - 0.5 * 3.33 = 6.775, rounded to 6.8
    });

    it('should handle decimal inputs correctly', () => {
        const result = calculateNetCarbs(10.5, 2.2, 4.4);
        expect(result).toBe(6.1); // 10.5 - 2.2 - 0.5 * 4.4 = 6.1
    });

    it('should handle all missing values', () => {
        const result = calculateNetCarbs(null, null, null);
        expect(result).toBe(0); // 0 - 0 - 0.5 * 0 = 0
    });
});
