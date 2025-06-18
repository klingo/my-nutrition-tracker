export const GENDER = {
    MALE: 'male',
    FEMALE: 'female',
    OTHER: 'other',
    PREFER_NOT_TO_SAY: 'prefer_not_to_say',
};

export const ACTIVITY_LEVEL = {
    SEDENTARY: 'sedentary',
    LIGHTLY_ACTIVE: 'lightly_active',
    MODERATELY_ACTIVE: 'moderately_active',
    VERY_ACTIVE: 'very_active',
    EXTRA_ACTIVE: 'extra_active',
};

export const ACTIVITY_MULTIPLIERS = {
    [ACTIVITY_LEVEL.SEDENTARY]: 1.2, // Little or no exercise
    [ACTIVITY_LEVEL.LIGHTLY_ACTIVE]: 1.375, // Light exercise/sports 1-3 days/week
    [ACTIVITY_LEVEL.MODERATELY_ACTIVE]: 1.55, // Moderate exercise/sports 3-5 days/week
    [ACTIVITY_LEVEL.VERY_ACTIVE]: 1.725, // Hard exercise/sports 6-7 days/week
    [ACTIVITY_LEVEL.EXTRA_ACTIVE]: 1.9, // Very hard exercise/sports & physical job or training
};

export const MEAL_TYPE = {
    BREAKFAST: 'breakfast',
    MORNING_SNACK: 'morning_snack',
    LUNCH: 'lunch',
    AFTERNOON_SNACK: 'afternoon_snack',
    DINNER: 'dinner',
    EVENING_SNACK: 'evening_snack',
};

export const ALLERGENS = {
    MILK: 'milk',
    EGGS: 'eggs',
    FISH: 'fish',
    SHELLFISH: 'shellfish',
    TREE_NUTS: 'tree_nuts',
    PEANUTS: 'peanuts',
    WHEAT: 'wheat',
    SOY: 'soy',
    SESAME: 'sesame',
    CELERY: 'celery',
    MUSTARD: 'mustard',
    LUPIN: 'lupin',
    SULPHITES: 'sulphites',
    MOLLUSCS: 'molluscs',
};
