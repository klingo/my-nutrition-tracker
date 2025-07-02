export const ACCESS_LEVELS = {
    NO_ACCESS: 0, // No access to any functionality
    TRIAL_USER: 1, // Trial access with limited features (NYI)
    REGULAR_USER: 3, // Regular user can create and update their own products
    EDITOR: 4, // Can create and update products
    MODERATOR: 5, // Full access except to other moderators, and the admin
    ADMIN: 6, // Full access to all functionality
};
