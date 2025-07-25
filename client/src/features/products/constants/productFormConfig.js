export const getGeneralEntries = ({ textAlignRight = true, compact = true } = {}) => [
    {
        name: 'Energy',
        unit: 'kcal',
        inputConfig: {
            name: 'calories',
            id: 'calories',
            type: 'number',
            icon: 'calories',
            required: true,
            numberConfig: { min: 0, max: 9999, step: 1, inputmode: 'numeric' },
            textAlignRight,
            compact,
        },
    },
];

export const getCarbohydratesEntries = ({ textAlignRight = true, compact = true } = {}) => [
    {
        name: 'Total Carbohydrates',
        unit: 'g',
        inputConfig: {
            name: 'carbs',
            id: 'carbs',
            type: 'number',
            icon: 'carbohydrates',
            required: true,
            numberConfig: { min: 0, max: 999, step: 1, inputmode: 'numeric' },
            textAlignRight,
            compact,
        },
        subEntries: [
            {
                name: 'Fiber',
                unit: 'g',
                inputConfig: {
                    name: 'fiber',
                    id: 'fiber',
                    type: 'number',
                    icon: 'fiber',
                    numberConfig: { min: 0, max: 999, step: 0.1, inputmode: 'decimal' },
                    textAlignRight,
                    compact,
                },
            },
            // Starch
            {
                name: 'Sugars',
                unit: 'g',
                inputConfig: {
                    name: 'sugars',
                    id: 'sugars',
                    type: 'number',
                    icon: 'sugars',
                    numberConfig: { min: 0, max: 999, step: 1, inputmode: 'numeric' },
                    textAlignRight,
                    compact,
                },
            },
            {
                name: 'Polyols',
                unit: 'g',
                inputConfig: {
                    name: 'polyols',
                    id: 'polyols',
                    type: 'number',
                    icon: 'polyols',
                    numberConfig: { min: 0, max: 999, step: 1, inputmode: 'numeric' },
                    textAlignRight,
                    compact,
                },
            },
        ],
    },
    {
        name: 'Net Carbohydrates',
        unit: 'g',
        labelConfig: {
            name: 'netCarbs',
            id: 'netCarbs',
            textAlignRight,
        },
    },
];

export const getLipidsEntries = ({ textAlignRight = true, compact = true } = {}) => [
    {
        name: 'Total Fat',
        unit: 'g',
        inputConfig: {
            name: 'fat',
            id: 'fat',
            type: 'number',
            icon: 'fat',
            required: true,
            numberConfig: { min: 0, max: 999, step: 0.1, inputmode: 'decimal' },
            textAlignRight,
            compact,
        },
        subEntries: [
            {
                name: 'Saturated',
                unit: 'g',
                inputConfig: {
                    name: 'saturatedFat',
                    id: 'saturatedFat',
                    type: 'number',
                    icon: 'saturated-fat',
                    numberConfig: { min: 0, max: 999, step: 0.1, inputmode: 'decimal' },
                    textAlignRight,
                    compact,
                },
            },
            {
                name: 'Monounsaturated',
                unit: 'g',
                inputConfig: {
                    name: 'monounsaturatedFat',
                    id: 'monounsaturatedFat',
                    type: 'number',
                    icon: 'monounsaturated-fat',
                    numberConfig: { min: 0, max: 999, step: 0.1, inputmode: 'decimal' },
                    textAlignRight,
                    compact,
                },
            },
            {
                name: 'Polyunsaturated',
                unit: 'g',
                inputConfig: {
                    name: 'polyunsaturatedFat',
                    id: 'polyunsaturatedFat',
                    type: 'number',
                    icon: 'polyunsaturated-fat',
                    numberConfig: { min: 0, max: 999, step: 0.1, inputmode: 'decimal' },
                    textAlignRight,
                    compact,
                },
                // Omega 3
                // Omega 6
            },
            // Trans Fat
        ],
    },
];

export const getProteinsEntries = ({ textAlignRight = true, compact = true } = {}) => [
    {
        name: 'Protein',
        unit: 'g',
        inputConfig: {
            name: 'protein',
            id: 'protein',
            type: 'number',
            icon: 'protein',
            required: true,
            numberConfig: { min: 0, max: 999, step: 0.1, inputmode: 'decimal' },
            textAlignRight,
            compact,
        },
    },
];

export const getMineralsEntries = ({ textAlignRight = true, compact = true } = {}) => [
    {
        name: 'Salt',
        unit: 'g',
        inputConfig: {
            name: 'salt',
            id: 'salt',
            type: 'number',
            icon: 'salt',
            numberConfig: { min: 0, max: 999, step: 0.1, inputmode: 'decimal' },
            textAlignRight,
            compact,
        },
    },
    {
        name: 'Magnesium',
        unit: 'g',
        inputConfig: {
            name: 'magnesium',
            id: 'magnesium',
            type: 'number',
            icon: 'magnesium',
            numberConfig: { min: 0, max: 999, step: 0.1, inputmode: 'decimal' },
            textAlignRight,
            compact,
        },
    },
    {
        name: 'Potassium',
        unit: 'g',
        inputConfig: {
            name: 'potassium',
            id: 'potassium',
            type: 'number',
            icon: 'potassium',
            numberConfig: { min: 0, max: 999, step: 0.1, inputmode: 'decimal' },
            textAlignRight,
            compact,
        },
    },
    {
        name: 'Sodium',
        unit: 'g',
        inputConfig: {
            name: 'sodium',
            id: 'sodium',
            type: 'number',
            icon: 'sodium',
            numberConfig: { min: 0, max: 999, step: 0.1, inputmode: 'decimal' },
            textAlignRight,
            compact,
        },
    },
    {
        name: 'Calcium',
        unit: 'g',
        inputConfig: {
            name: 'calcium',
            id: 'calcium',
            type: 'number',
            icon: 'calcium',
            numberConfig: { min: 0, max: 9999, step: 0.1, inputmode: 'decimal' },
            textAlignRight,
            compact,
        },
    },
    // { name: 'iron', label: 'Iron (mg)', type: 'number', numberConfig: { min: 0, max: 9999, step: 0.1 } },
    // { name: 'zinc', label: 'Zinc (mg)', type: 'number', numberConfig: { min: 0, max: 9999, step: 0.1 } },
];

export const getVitaminsEntries = ({ textAlignRight = true, compact = true } = {}) => [
    {
        name: 'Vitamin A',
        unit: 'IU',
        inputConfig: {
            name: 'vitaminA',
            id: 'vitaminA',
            type: 'number',
            numberConfig: { min: 0, max: 9999, step: 0.1, inputmode: 'decimal' },
            textAlignRight,
            compact,
        },
    },
    {
        name: 'B1 (Thiamin)',
        unit: 'mg',
        inputConfig: {
            name: 'vitaminB1',
            id: 'vitaminB1',
            type: 'number',
            numberConfig: { min: 0, max: 9999, step: 0.1, inputmode: 'decimal' },
            textAlignRight,
            compact,
        },
    },
    {
        name: 'B2 (Riboflavin)',
        unit: 'mg',
        inputConfig: {
            name: 'vitaminB2',
            id: 'vitaminB2',
            type: 'number',
            numberConfig: { min: 0, max: 9999, step: 0.1, inputmode: 'decimal' },
            textAlignRight,
            compact,
        },
    },
    {
        name: 'B3 (Niacin)',
        unit: 'mg',
        inputConfig: {
            name: 'vitaminB3',
            id: 'vitaminB3',
            type: 'number',
            numberConfig: { min: 0, max: 9999, step: 0.1, inputmode: 'decimal' },
            textAlignRight,
            compact,
        },
    },
    // name: 'B5 (Pantothenic acid)',
    {
        name: 'B6 (Pyridoxine)',
        unit: 'mg',
        inputConfig: {
            name: 'vitaminB6',
            id: 'vitaminB6',
            type: 'number',
            numberConfig: { min: 0, max: 9999, step: 0.1, inputmode: 'decimal' },
            textAlignRight,
            compact,
        },
    },
    {
        name: 'B12 (Cobalamin)',
        unit: 'mcg',
        inputConfig: {
            name: 'vitaminB12',
            id: 'vitaminB12',
            type: 'number',
            numberConfig: { min: 0, max: 9999, step: 0.1, inputmode: 'decimal' },
            textAlignRight,
            compact,
        },
    },
    {
        name: 'Vitamin C',
        unit: 'mg',
        inputConfig: {
            name: 'viatminC',
            id: 'vitaminC',
            type: 'number',
            numberConfig: { min: 0, max: 9999, step: 0.1, inputmode: 'decimal' },
            textAlignRight,
            compact,
        },
    },
    {
        name: 'Vitamin D',
        unit: 'IU',
        inputConfig: {
            name: 'vitaminD',
            id: 'vitaminD',
            type: 'number',
            numberConfig: { min: 0, max: 9999, step: 0.1, inputmode: 'decimal' },
            textAlignRight,
            compact,
        },
    },
    {
        name: 'Vitamin E',
        unit: 'IU',
        inputConfig: {
            name: 'vitaminE',
            id: 'vitaminE',
            type: 'number',
            numberConfig: { min: 0, max: 9999, step: 0.1, inputmode: 'decimal' },
            textAlignRight,
            compact,
        },
    },
    {
        name: 'Vitamin K',
        unit: 'mcg',
        inputConfig: {
            name: 'vitaminK',
            id: 'vitaminK',
            type: 'number',
            numberConfig: { min: 0, max: 9999, step: 0.1, inputmode: 'decimal' },
            textAlignRight,
            compact,
        },
    },
];
