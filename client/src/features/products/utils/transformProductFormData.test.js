import { describe, expect, it } from 'vitest';
import transformProductFormData from './transformProductFormData';

describe('transformProductFormData', () => {
    it('should transform basic product data correctly', () => {
        const formData = {
            name: 'Test Product',
            packageAmount: '100',
            referenceAmount: '100',
            barcode: '123456789',
            calories: '200',
            carbs: '20',
            sugars: '10',
            polyols: '5',
            fiber: '3',
            fat: '10',
            saturatedFat: '3',
            monounsaturatedFat: '4',
            polyunsaturatedFat: '3',
            protein: '5',
            salt: '0.5',
            magnesium: '20',
            potassium: '150',
            sodium: '200',
            calcium: '50',
            vitaminA: '0.1',
            vitaminB1: '0.05',
            vitaminB2: '0.03',
            vitaminB3: '0.04',
            vitaminB6: '0.02',
            vitaminB12: '0.001',
            vitaminC: '20',
            vitaminD: '0.002',
            vitaminE: '0.5',
            vitaminK: '0.01',
        };

        const result = transformProductFormData(formData);

        expect(result).toEqual({
            name: 'Test Product',
            category: 'other',
            barcode: 123456789,
            package: {
                amount: 100,
                unit: 'g',
            },
            nutrients: {
                referenceAmount: {
                    amount: 100,
                    unit: 'g',
                },
                values: {
                    energy: {
                        kcal: 200,
                    },
                    carbohydrates: {
                        total: 20,
                        sugars: 10,
                        polyols: {
                            total: 5,
                            erythritol: undefined,
                            sorbitol: undefined,
                            xylitol: undefined,
                            maltitol: undefined,
                        },
                        starches: undefined,
                        fiber: 3,
                    },
                    lipids: {
                        total: 10,
                        saturated: 3,
                        monounsaturated: 4,
                        polyunsaturated: 3,
                    },
                    protein: 5,
                    minerals: {
                        salt: 0.5,
                        magnesium: 20,
                        potassium: 150,
                        sodium: 200,
                        calcium: 50,
                        iron: undefined,
                        zinc: undefined,
                    },
                    vitamins: {
                        a: 0.1,
                        b1: 0.05,
                        b2: 0.03,
                        b3: 0.04,
                        b6: 0.02,
                        b12: 0.001,
                        c: 20,
                        d: 0.002,
                        e: 0.5,
                        k: 0.01,
                    },
                },
            },
        });
    });

    it('should handle empty form data correctly', () => {
        const formData = {};
        const result = transformProductFormData(formData);

        expect(result).toEqual({
            name: undefined,
            category: 'other',
            barcode: undefined,
            package: {
                amount: undefined,
                unit: 'g',
            },
            nutrients: {
                referenceAmount: {
                    amount: undefined,
                    unit: 'g',
                },
                values: {
                    energy: {
                        kcal: undefined,
                    },
                    carbohydrates: {
                        total: undefined,
                        sugars: undefined,
                        polyols: {
                            total: undefined,
                            erythritol: undefined,
                            sorbitol: undefined,
                            xylitol: undefined,
                            maltitol: undefined,
                        },
                        starches: undefined,
                        fiber: undefined,
                    },
                    lipids: {
                        total: undefined,
                        saturated: undefined,
                        monounsaturated: undefined,
                        polyunsaturated: undefined,
                    },
                    protein: undefined,
                    minerals: {
                        salt: undefined,
                        magnesium: undefined,
                        potassium: undefined,
                        sodium: undefined,
                        calcium: undefined,
                        iron: undefined,
                        zinc: undefined,
                    },
                    vitamins: {
                        a: undefined,
                        b1: undefined,
                        b2: undefined,
                        b3: undefined,
                        b6: undefined,
                        b12: undefined,
                        c: undefined,
                        d: undefined,
                        e: undefined,
                        k: undefined,
                    },
                },
            },
        });
    });

    it('should convert string numbers to actual numbers', () => {
        const formData = {
            packageAmount: '150.5',
            referenceAmount: '100',
            calories: '250.75',
        };
        const result = transformProductFormData(formData);

        expect(result.package.amount).toBe(150.5);
        expect(result.nutrients.referenceAmount.amount).toBe(100);
        expect(result.nutrients.values.energy.kcal).toBe(250.75);
    });

    it('should handle empty string values as zero', () => {
        const formData = {
            packageAmount: '',
            calories: '',
            carbs: '',
        };
        const result = transformProductFormData(formData);

        expect(result.package.amount).toBe(0);
        expect(result.nutrients.values.energy.kcal).toBe(0);
        expect(result.nutrients.values.carbohydrates.total).toBe(0);
    });

    it('should handle null and undefined values as zero', () => {
        const formData = {
            packageAmount: null,
            calories: undefined,
            carbs: null,
        };
        const result = transformProductFormData(formData);

        expect(result.package.amount).toBe(0);
        expect(result.nutrients.values.energy.kcal).toBe(0);
        expect(result.nutrients.values.carbohydrates.total).toBe(0);
    });

    it('should handle missing barcode correctly', () => {
        const formData = {
            name: 'Product without barcode',
        };
        const result = transformProductFormData(formData);

        expect(result.barcode).toBeUndefined();
        expect(result.name).toBe('Product without barcode');
    });

    it('should handle zero values correctly', () => {
        const formData = {
            packageAmount: '0',
            calories: '0',
            carbs: '0',
        };
        const result = transformProductFormData(formData);

        expect(result.package.amount).toBe(0);
        expect(result.nutrients.values.energy.kcal).toBe(0);
        expect(result.nutrients.values.carbohydrates.total).toBe(0);
    });

    it('should handle partial data correctly', () => {
        const formData = {
            name: 'Partial Product',
            calories: '150',
            protein: '10',
        };
        const result = transformProductFormData(formData);

        expect(result.name).toBe('Partial Product');
        expect(result.nutrients.values.energy.kcal).toBe(150);
        expect(result.nutrients.values.protein).toBe(10);
        // Other values that were not in the input should have undefined fields
        expect(result.nutrients.values.carbohydrates.total).toBeUndefined();
        expect(result.nutrients.values.lipids.total).toBeUndefined();
    });

    it('should handle all numeric fields conversion correctly', () => {
        // Testing all numeric fields are properly converted
        const formData = {
            packageAmount: '100',
            referenceAmount: '50',
            barcode: '987654321',
            calories: '200',
            carbs: '20',
            sugars: '10',
            polyols: '5',
            fiber: '3',
            fat: '10',
            saturatedFat: '3',
            monounsaturatedFat: '4',
            polyunsaturatedFat: '3',
            protein: '5',
            salt: '0.5',
            magnesium: '20',
            potassium: '150',
            sodium: '200',
            calcium: '50',
            vitaminA: '0.1',
            vitaminB1: '0.05',
            vitaminB2: '0.03',
            vitaminB3: '0.04',
            vitaminB6: '0.02',
            vitaminB12: '0.001',
            vitaminC: '20',
            vitaminD: '0.002',
            vitaminE: '0.5',
            vitaminK: '0.01',
        };

        const result = transformProductFormData(formData);

        // Check that all numeric fields are properly converted
        expect(typeof result.barcode).toBe('number');
        expect(typeof result.package.amount).toBe('number');
        expect(typeof result.nutrients.referenceAmount.amount).toBe('number');
        expect(typeof result.nutrients.values.energy.kcal).toBe('number');
        expect(typeof result.nutrients.values.carbohydrates.total).toBe('number');
        expect(typeof result.nutrients.values.lipids.total).toBe('number');
        expect(typeof result.nutrients.values.protein).toBe('number');
        expect(typeof result.nutrients.values.minerals.salt).toBe('number');
        expect(typeof result.nutrients.values.vitamins.a).toBe('number');
    });
});
