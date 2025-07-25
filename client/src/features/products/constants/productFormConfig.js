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
            numberConfig: { min: 0, max: 9999, step: 1, inputmode: 'numeric', suffix: 'g' },
            compact,
        },
    },
    {
        labelText: 'Reference amount',
        inputConfig: {
            name: 'referenceAmount',
            type: 'number',
            icon: 'serving-size',
            required: true,
            value: 100,
            numberConfig: { min: 0, max: 9999, step: 1, inputmode: 'numeric', suffix: 'g' },
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
        inputConfig: {
            name: 'calories',
            id: 'calories',
            type: 'number',
            icon: 'calories',
            required: true,
            numberConfig: { min: 0, max: 9999, step: 1, inputmode: 'numeric', suffix: 'kcal' },
            compact,
        },
    },
];

export const getCarbohydratesEntries = ({ compact = true } = {}) => [
    {
        labelText: 'Total Carbohydrates',
        inputConfig: {
            name: 'carbs',
            id: 'carbs',
            type: 'number',
            icon: 'carbohydrates',
            required: true,
            numberConfig: { min: 0, max: 999, step: 1, inputmode: 'numeric', suffix: 'g' },
            compact,
        },
        subEntries: [
            {
                labelText: 'Sugars',
                inputConfig: {
                    name: 'sugars',
                    id: 'sugars',
                    type: 'number',
                    icon: 'sugars',
                    numberConfig: { min: 0, max: 999, step: 1, inputmode: 'numeric', suffix: 'g' },
                    compact,
                },
            },
            {
                labelText: 'Polyols',
                inputConfig: {
                    name: 'polyols',
                    id: 'polyols',
                    type: 'number',
                    icon: 'polyols',
                    numberConfig: { min: 0, max: 999, step: 1, inputmode: 'numeric', suffix: 'g' },
                    compact,
                },
            },
        ],
    },
    {
        labelText: 'Fiber',
        inputConfig: {
            name: 'fiber',
            id: 'fiber',
            type: 'number',
            icon: 'fiber',
            numberConfig: { min: 0, max: 999, step: 0.1, inputmode: 'decimal', suffix: 'g' },
            compact,
        },
    },
    // Starch
    {
        labelText: 'Net Carbohydrates',
        labelConfig: {
            name: 'netCarbs',
            id: 'netCarbs',
        },
    },
];

export const getLipidsEntries = ({ compact = true } = {}) => [
    {
        labelText: 'Total Fat',
        inputConfig: {
            name: 'fat',
            id: 'fat',
            type: 'number',
            icon: 'fat',
            required: true,
            numberConfig: { min: 0, max: 999, step: 0.1, inputmode: 'decimal', suffix: 'g' },
            compact,
        },
        subEntries: [
            {
                labelText: 'Saturated',
                inputConfig: {
                    name: 'saturatedFat',
                    id: 'saturatedFat',
                    type: 'number',
                    icon: 'saturated-fat',
                    numberConfig: { min: 0, max: 999, step: 0.1, inputmode: 'decimal', suffix: 'g' },
                    compact,
                },
            },
            {
                labelText: 'Monounsaturated',
                inputConfig: {
                    name: 'monounsaturatedFat',
                    id: 'monounsaturatedFat',
                    type: 'number',
                    icon: 'monounsaturated-fat',
                    numberConfig: { min: 0, max: 999, step: 0.1, inputmode: 'decimal', suffix: 'g' },
                    compact,
                },
            },
            {
                labelText: 'Polyunsaturated',
                inputConfig: {
                    name: 'polyunsaturatedFat',
                    id: 'polyunsaturatedFat',
                    type: 'number',
                    icon: 'polyunsaturated-fat',
                    numberConfig: { min: 0, max: 999, step: 0.1, inputmode: 'decimal', suffix: 'g' },
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
        inputConfig: {
            name: 'protein',
            id: 'protein',
            type: 'number',
            icon: 'protein',
            required: true,
            numberConfig: { min: 0, max: 999, step: 0.1, inputmode: 'decimal', suffix: 'g' },
            compact,
        },
    },
];

export const getMineralsEntries = ({ compact = true } = {}) => [
    {
        labelText: 'Salt',
        inputConfig: {
            name: 'salt',
            id: 'salt',
            type: 'number',
            icon: 'salt',
            numberConfig: { min: 0, max: 999, step: 0.1, inputmode: 'decimal', suffix: 'g' },
            compact,
        },
    },
    {
        labelText: 'Magnesium',
        inputConfig: {
            name: 'magnesium',
            id: 'magnesium',
            type: 'number',
            icon: 'magnesium',
            numberConfig: { min: 0, max: 999, step: 0.1, inputmode: 'decimal', suffix: 'g' },
            compact,
        },
    },
    {
        labelText: 'Potassium',
        inputConfig: {
            name: 'potassium',
            id: 'potassium',
            type: 'number',
            icon: 'potassium',
            numberConfig: { min: 0, max: 999, step: 0.1, inputmode: 'decimal', suffix: 'g' },
            compact,
        },
    },
    {
        labelText: 'Sodium',
        inputConfig: {
            name: 'sodium',
            id: 'sodium',
            type: 'number',
            icon: 'sodium',
            numberConfig: { min: 0, max: 999, step: 0.1, inputmode: 'decimal', suffix: 'g' },
            compact,
        },
    },
    {
        labelText: 'Calcium',
        inputConfig: {
            name: 'calcium',
            id: 'calcium',
            type: 'number',
            icon: 'calcium',
            numberConfig: { min: 0, max: 9999, step: 0.1, inputmode: 'decimal', suffix: 'g' },
            compact,
        },
    },
    // { name: 'iron', label: 'Iron (mg)', type: 'number', numberConfig: { min: 0, max: 9999, step: 0.1 } },
    // { name: 'zinc', label: 'Zinc (mg)', type: 'number', numberConfig: { min: 0, max: 9999, step: 0.1 } },
];

export const getVitaminsEntries = ({ compact = true } = {}) => [
    {
        labelText: 'Vitamin A',
        inputConfig: {
            name: 'vitaminA',
            id: 'vitaminA',
            type: 'number',
            numberConfig: { min: 0, max: 9999, step: 0.1, inputmode: 'decimal', suffix: 'IU' },
            compact,
        },
    },
    {
        labelText: 'B1 (Thiamin)',
        inputConfig: {
            name: 'vitaminB1',
            id: 'vitaminB1',
            type: 'number',
            numberConfig: { min: 0, max: 9999, step: 0.1, inputmode: 'decimal', suffix: 'mg' },
            compact,
        },
    },
    {
        labelText: 'B2 (Riboflavin)',
        inputConfig: {
            name: 'vitaminB2',
            id: 'vitaminB2',
            type: 'number',
            numberConfig: { min: 0, max: 9999, step: 0.1, inputmode: 'decimal', suffix: 'mg' },
            compact,
        },
    },
    {
        labelText: 'B3 (Niacin)',
        inputConfig: {
            name: 'vitaminB3',
            id: 'vitaminB3',
            type: 'number',
            numberConfig: { min: 0, max: 9999, step: 0.1, inputmode: 'decimal', suffix: 'mg' },
            compact,
        },
    },
    // name: 'B5 (Pantothenic acid)',
    {
        labelText: 'B6 (Pyridoxine)',
        inputConfig: {
            name: 'vitaminB6',
            id: 'vitaminB6',
            type: 'number',
            numberConfig: { min: 0, max: 9999, step: 0.1, inputmode: 'decimal', suffix: 'mg' },
            compact,
        },
    },
    {
        labelText: 'B12 (Cobalamin)',
        inputConfig: {
            name: 'vitaminB12',
            id: 'vitaminB12',
            type: 'number',
            numberConfig: { min: 0, max: 9999, step: 0.1, inputmode: 'decimal', suffix: 'mcg' },
            compact,
        },
    },
    {
        labelText: 'Vitamin C',
        inputConfig: {
            name: 'viatminC',
            id: 'vitaminC',
            type: 'number',
            numberConfig: { min: 0, max: 9999, step: 0.1, inputmode: 'decimal', suffix: 'mg' },
            compact,
        },
    },
    {
        labelText: 'Vitamin D',
        inputConfig: {
            name: 'vitaminD',
            id: 'vitaminD',
            type: 'number',
            numberConfig: { min: 0, max: 9999, step: 0.1, inputmode: 'decimal', suffix: 'IU' },
            compact,
        },
    },
    {
        labelText: 'Vitamin E',
        inputConfig: {
            name: 'vitaminE',
            id: 'vitaminE',
            type: 'number',
            numberConfig: { min: 0, max: 9999, step: 0.1, inputmode: 'decimal', suffix: 'IU' },
            compact,
        },
    },
    {
        labelText: 'Vitamin K',
        inputConfig: {
            name: 'vitaminK',
            id: 'vitaminK',
            type: 'number',
            numberConfig: { min: 0, max: 9999, step: 0.1, inputmode: 'decimal', suffix: 'mcg' },
            compact,
        },
    },
];
