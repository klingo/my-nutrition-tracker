export const getProductInfoEntries = ({ compact = true } = {}) => [
    {
        labelText: 'Product Name',
        inputConfig: {
            name: 'name',
            type: 'text',
            required: true,
            minLength: 5,
            compact,
        },
    },
    {
        labelText: 'Brand',
        inputConfig: {
            name: 'brand',
            type: 'text',
            compact,
        },
    },
    {
        labelText: 'Package size',
        unit: 'g',
        inputConfig: {
            name: 'packageAmount',
            type: 'number',
            icon: 'package-size',
            required: true,
            numberConfig: { min: 0, max: 9999, step: 1 },
            compact,
        },
    },
    {
        labelText: 'Reference amount',
        unit: 'g',
        inputConfig: {
            name: 'referenceAmount',
            type: 'number',
            icon: 'serving-size',
            required: true,
            value: 100,
            numberConfig: { min: 0, max: 9999, step: 1 },
            compact,
        },
    },
];

export const getProductAdvancedInfoEntries = ({ compact = true } = {}) => [
    {
        labelText: 'Barcode',
        inputConfig: {
            name: 'barcode',
            type: 'text',
            icon: 'barcode',
            compact,
        },
    },
    // { name: 'category', label: 'Category', type: 'text' },
];

export const getGeneralEntries = ({ compact = true } = {}) => [
    {
        labelText: 'Energy',
        unit: 'kcal',
        inputConfig: {
            name: 'calories',
            id: 'calories',
            type: 'number',
            icon: 'calories',
            required: true,
            numberConfig: { min: 0, max: 9999, step: 1, inputmode: 'numeric' },
            compact,
        },
    },
];

export const getCarbohydratesEntries = ({ compact = true } = {}) => [
    {
        labelText: 'Total Carbohydrates',
        unit: 'g',
        inputConfig: {
            name: 'carbs',
            id: 'carbs',
            type: 'number',
            icon: 'carbohydrates',
            required: true,
            numberConfig: { min: 0, max: 999, step: 1, inputmode: 'numeric' },
            compact,
        },
        subEntries: [
            {
                labelText: 'Sugars',
                unit: 'g',
                inputConfig: {
                    name: 'sugars',
                    id: 'sugars',
                    type: 'number',
                    icon: 'sugars',
                    numberConfig: { min: 0, max: 999, step: 1, inputmode: 'numeric' },
                    compact,
                },
            },
            {
                labelText: 'Polyols',
                unit: 'g',
                inputConfig: {
                    name: 'polyols',
                    id: 'polyols',
                    type: 'number',
                    icon: 'polyols',
                    numberConfig: { min: 0, max: 999, step: 1, inputmode: 'numeric' },
                    compact,
                },
            },
        ],
    },
    {
        labelText: 'Fiber',
        unit: 'g',
        inputConfig: {
            name: 'fiber',
            id: 'fiber',
            type: 'number',
            icon: 'fiber',
            numberConfig: { min: 0, max: 999, step: 0.1, inputmode: 'decimal' },
            compact,
        },
    },
    // Starch
    {
        labelText: 'Net Carbohydrates',
        unit: 'g',
        labelConfig: {
            name: 'netCarbs',
            id: 'netCarbs',
        },
    },
];

export const getLipidsEntries = ({ compact = true } = {}) => [
    {
        labelText: 'Total Fat',
        unit: 'g',
        inputConfig: {
            name: 'fat',
            id: 'fat',
            type: 'number',
            icon: 'fat',
            required: true,
            numberConfig: { min: 0, max: 999, step: 0.1, inputmode: 'decimal' },
            compact,
        },
        subEntries: [
            {
                labelText: 'Saturated',
                unit: 'g',
                inputConfig: {
                    name: 'saturatedFat',
                    id: 'saturatedFat',
                    type: 'number',
                    icon: 'saturated-fat',
                    numberConfig: { min: 0, max: 999, step: 0.1, inputmode: 'decimal' },
                    compact,
                },
            },
            {
                labelText: 'Monounsaturated',
                unit: 'g',
                inputConfig: {
                    name: 'monounsaturatedFat',
                    id: 'monounsaturatedFat',
                    type: 'number',
                    icon: 'monounsaturated-fat',
                    numberConfig: { min: 0, max: 999, step: 0.1, inputmode: 'decimal' },
                    compact,
                },
            },
            {
                labelText: 'Polyunsaturated',
                unit: 'g',
                inputConfig: {
                    name: 'polyunsaturatedFat',
                    id: 'polyunsaturatedFat',
                    type: 'number',
                    icon: 'polyunsaturated-fat',
                    numberConfig: { min: 0, max: 999, step: 0.1, inputmode: 'decimal' },
                    compact,
                },
                // Omega 3
                // Omega 6
            },
            // Trans Fat
        ],
    },
];

export const getProteinsEntries = ({ compact = true } = {}) => [
    {
        labelText: 'Protein',
        unit: 'g',
        inputConfig: {
            name: 'protein',
            id: 'protein',
            type: 'number',
            icon: 'protein',
            required: true,
            numberConfig: { min: 0, max: 999, step: 0.1, inputmode: 'decimal' },
            compact,
        },
    },
];

export const getMineralsEntries = ({ compact = true } = {}) => [
    {
        labelText: 'Salt',
        unit: 'g',
        inputConfig: {
            name: 'salt',
            id: 'salt',
            type: 'number',
            icon: 'salt',
            numberConfig: { min: 0, max: 999, step: 0.1, inputmode: 'decimal' },
            compact,
        },
    },
    {
        labelText: 'Magnesium',
        unit: 'g',
        inputConfig: {
            name: 'magnesium',
            id: 'magnesium',
            type: 'number',
            icon: 'magnesium',
            numberConfig: { min: 0, max: 999, step: 0.1, inputmode: 'decimal' },
            compact,
        },
    },
    {
        labelText: 'Potassium',
        unit: 'g',
        inputConfig: {
            name: 'potassium',
            id: 'potassium',
            type: 'number',
            icon: 'potassium',
            numberConfig: { min: 0, max: 999, step: 0.1, inputmode: 'decimal' },
            compact,
        },
    },
    {
        labelText: 'Sodium',
        unit: 'g',
        inputConfig: {
            name: 'sodium',
            id: 'sodium',
            type: 'number',
            icon: 'sodium',
            numberConfig: { min: 0, max: 999, step: 0.1, inputmode: 'decimal' },
            compact,
        },
    },
    {
        labelText: 'Calcium',
        unit: 'g',
        inputConfig: {
            name: 'calcium',
            id: 'calcium',
            type: 'number',
            icon: 'calcium',
            numberConfig: { min: 0, max: 9999, step: 0.1, inputmode: 'decimal' },
            compact,
        },
    },
    // { name: 'iron', label: 'Iron (mg)', type: 'number', numberConfig: { min: 0, max: 9999, step: 0.1 } },
    // { name: 'zinc', label: 'Zinc (mg)', type: 'number', numberConfig: { min: 0, max: 9999, step: 0.1 } },
];

export const getVitaminsEntries = ({ compact = true } = {}) => [
    {
        labelText: 'Vitamin A',
        unit: 'IU',
        inputConfig: {
            name: 'vitaminA',
            id: 'vitaminA',
            type: 'number',
            numberConfig: { min: 0, max: 9999, step: 0.1, inputmode: 'decimal' },
            compact,
        },
    },
    {
        labelText: 'B1 (Thiamin)',
        unit: 'mg',
        inputConfig: {
            name: 'vitaminB1',
            id: 'vitaminB1',
            type: 'number',
            numberConfig: { min: 0, max: 9999, step: 0.1, inputmode: 'decimal' },
            compact,
        },
    },
    {
        labelText: 'B2 (Riboflavin)',
        unit: 'mg',
        inputConfig: {
            name: 'vitaminB2',
            id: 'vitaminB2',
            type: 'number',
            numberConfig: { min: 0, max: 9999, step: 0.1, inputmode: 'decimal' },
            compact,
        },
    },
    {
        labelText: 'B3 (Niacin)',
        unit: 'mg',
        inputConfig: {
            name: 'vitaminB3',
            id: 'vitaminB3',
            type: 'number',
            numberConfig: { min: 0, max: 9999, step: 0.1, inputmode: 'decimal' },
            compact,
        },
    },
    // name: 'B5 (Pantothenic acid)',
    {
        labelText: 'B6 (Pyridoxine)',
        unit: 'mg',
        inputConfig: {
            name: 'vitaminB6',
            id: 'vitaminB6',
            type: 'number',
            numberConfig: { min: 0, max: 9999, step: 0.1, inputmode: 'decimal' },
            compact,
        },
    },
    {
        labelText: 'B12 (Cobalamin)',
        unit: 'mcg',
        inputConfig: {
            name: 'vitaminB12',
            id: 'vitaminB12',
            type: 'number',
            numberConfig: { min: 0, max: 9999, step: 0.1, inputmode: 'decimal' },
            compact,
        },
    },
    {
        labelText: 'Vitamin C',
        unit: 'mg',
        inputConfig: {
            name: 'viatminC',
            id: 'vitaminC',
            type: 'number',
            numberConfig: { min: 0, max: 9999, step: 0.1, inputmode: 'decimal' },
            compact,
        },
    },
    {
        labelText: 'Vitamin D',
        unit: 'IU',
        inputConfig: {
            name: 'vitaminD',
            id: 'vitaminD',
            type: 'number',
            numberConfig: { min: 0, max: 9999, step: 0.1, inputmode: 'decimal' },
            compact,
        },
    },
    {
        labelText: 'Vitamin E',
        unit: 'IU',
        inputConfig: {
            name: 'vitaminE',
            id: 'vitaminE',
            type: 'number',
            numberConfig: { min: 0, max: 9999, step: 0.1, inputmode: 'decimal' },
            compact,
        },
    },
    {
        labelText: 'Vitamin K',
        unit: 'mcg',
        inputConfig: {
            name: 'vitaminK',
            id: 'vitaminK',
            type: 'number',
            numberConfig: { min: 0, max: 9999, step: 0.1, inputmode: 'decimal' },
            compact,
        },
    },
];
