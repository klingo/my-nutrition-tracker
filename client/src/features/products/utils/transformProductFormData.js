/**
 * Transforms flat form data into the structured object expected by the server
 * @param {Object} formData - The flat form data from the product form
 * @returns {Object} The structured product data for the API
 */
export default function transformProductFormData(formData) {
    // Convert string values to numbers where needed
    const numericFields = [
        /* Info */
        'packageAmount',
        'referenceAmount',
        'barcode',
        /* General */
        'calories',
        /* Carbohydrates */
        'carbs',
        'sugars',
        'polyols',
        'fiber',
        /* Lipids */
        'fat',
        'saturatedFat',
        'monounsaturatedFat',
        'polyunsaturatedFat',
        /* Proteins */
        'protein',
        /* Minerals */
        'salt',
        'magnesium',
        'potassium',
        'sodium',
        'calcium',
        /* Vitamins */
        'vitaminA',
        'vitaminB1',
        'vitaminB2',
        'vitaminB3',
        'vitaminB6',
        'vitaminB12',
        'vitaminC',
        'vitaminD',
        'vitaminE',
        'vitaminK',
    ];

    const processedData = Object.entries(formData).reduce((acc, [key, value]) => {
        acc[key] = numericFields.includes(key) ? (value ? parseFloat(value) : 0) : value;
        return acc;
    }, {});

    // Transform to the structure expected by the server
    const transformedData = {
        name: processedData.name,
        category: 'other', // Default category, can be changed later
        barcode: processedData.barcode || undefined,
        package: {
            amount: processedData.packageAmount,
            unit: 'g', // Default to grams
        },
        nutrients: {
            referenceAmount: {
                amount: processedData.referenceAmount,
                unit: 'g', // Default to grams
            },
            values: {
                energy: {
                    kcal: processedData.calories,
                },
                carbohydrates: {
                    total: processedData.carbs,
                    sugars: processedData.sugars,
                    polyols: {
                        total: processedData.polyols,
                        erythritol: undefined,
                        sorbitol: undefined,
                        xylitol: undefined,
                        maltitol: undefined,
                    },
                    starches: undefined,
                    fiber: processedData.fiber,
                },
                lipids: {
                    total: processedData.fat,
                    saturated: processedData.saturatedFat,
                    monounsaturated: processedData.monounsaturatedFat,
                    polyunsaturated: processedData.polyunsaturatedFat,
                },
                protein: processedData.protein,
                minerals: {
                    salt: processedData.salt,
                    magnesium: processedData.magnesium,
                    potassium: processedData.potassium,
                    sodium: processedData.sodium,
                    calcium: processedData.calcium,
                    iron: undefined,
                    zinc: undefined,
                },
                vitamins: {
                    a: processedData.vitaminA,
                    b1: processedData.vitaminB1,
                    b2: processedData.vitaminB2,
                    b3: processedData.vitaminB3,
                    b6: processedData.vitaminB6,
                    b12: processedData.vitaminB12,
                    c: processedData.vitaminC,
                    d: processedData.vitaminD,
                    e: processedData.vitaminE,
                    k: processedData.vitaminK,
                },
            },
        },
    };

    return transformedData;
}
