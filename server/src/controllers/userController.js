import User from '../models/schemas/User.js';
import { convertWeight } from '../utils/weightConversions.js';
import { convertHeight } from '../utils/heightConversions.js';
import { GENDER, ACTIVITY_LEVEL } from '../models/constants/enums.js';
import { ACCESS_LEVELS } from '../models/constants/accessLevels.js';

const genderMap = {
    [GENDER.MALE]: 'Male',
    [GENDER.FEMALE]: 'Female',
    [GENDER.OTHER]: 'Other',
};

const accessLevelMap = {
    [ACCESS_LEVELS.NO_ACCESS]: 'No access',
    [ACCESS_LEVELS.TRIAL_USER]: 'Trial User',
    [ACCESS_LEVELS.REGULAR_USER]: 'Regular User',
    [ACCESS_LEVELS.MODERATOR]: 'Moderator',
    [ACCESS_LEVELS.ADMIN]: 'Administrator',
};

const activityLevelMap = {
    [ACTIVITY_LEVEL.SEDENTARY]: 'Sedentary',
    [ACTIVITY_LEVEL.LIGHTLY_ACTIVE]: 'Lightly Active',
    [ACTIVITY_LEVEL.MODERATELY_ACTIVE]: 'Moderately Active',
    [ACTIVITY_LEVEL.VERY_ACTIVE]: 'Very Active',
    [ACTIVITY_LEVEL.EXTRA_ACTIVE]: 'Extra Active',
};

// Function to transform user data for presentation
const transformUser = (user) => {
    const transformedUser = {
        id: user._id,
        username: user.username,
        email: user.email,
        accessLevel: accessLevelMap[user.accessLevel],
        status: user.isBlocked ? 'Blocked' : 'Active',
        profile: {
            firstName: user.profile.firstName,
            lastName: user.profile.lastName,
            dateOfBirth: user.profile.dateOfBirth.toISOString().split('T')[0],
            age: Math.floor((new Date() - new Date(user.profile.dateOfBirth)) / (1000 * 60 * 60 * 24 * 365)),
            height: {
                value: convertHeight.toCm(user.profile.height.value, user.profile.height.unit),
                unit: user.profile.height.unit,
            },
            weight: {
                value: convertWeight.toKg(user.profile.weight.value, user.profile.weight.unit),
                unit: user.profile.weight.unit,
            },
            gender: genderMap[user.profile.gender],
            activityLevel: activityLevelMap[user.profile.activityLevel],
            calculations: {
                bmi: {
                    value: user.profile.calculations.bmi.value,
                    calculatedAt: user.profile.calculations.bmi.calculatedAt
                        ? user.profile.calculations.bmi.calculatedAt.toISOString().split('T')[0]
                        : null,
                },
                bmr: {
                    value: user.profile.calculations.bmr.value,
                    calculatedAt: user.profile.calculations.bmr.calculatedAt
                        ? user.profile.calculations.bmr.calculatedAt.toISOString().split('T')[0]
                        : null,
                },
                tdee: {
                    value: user.profile.calculations.tdee.value,
                    calculatedAt: user.profile.calculations.tdee.calculatedAt
                        ? user.profile.calculations.tdee.calculatedAt.toISOString().split('T')[0]
                        : null,
                },
                lastWeightUsed: user.profile.calculations.lastWeightUsed,
                lastActivityLevelUsed: user.profile.calculations.lastActivityLevelUsed,
            },
        },
    };

    return transformedUser;
};

// Controller function to get a user by ID
export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        // const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).send({ message: 'User not found' });

        // Get calculations
        const calculations = await user.getCalculations();

        // Transform data for presentation
        const transformedUser = transformUser(user);

        res.json({
            _embedded: {
                user: {
                    ...transformedUser,
                    calculations,
                },
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Controller function to update a user by ID
export const updateUserById = async (req, res) => {
    try {
        // const { password, profile, ...otherFields } = req.body;
        const { profile, ...otherFields } = req.body;

        // Create update object
        const updateData = {};

        // Handle profile updates if provided
        if (profile) {
            updateData.profile = {};

            // Allow updating specific profile fields
            const allowedProfileFields = [
                'firstName',
                'lastName',
                'dateOfBirth',
                'height',
                'weight',
                'gender',
                'activityLevel',
            ];

            allowedProfileFields.forEach((field) => {
                if (profile[field] !== undefined) {
                    updateData.profile[field] = profile[field];
                }
            });
        }

        // Ensure restricted fields cannot be updated
        delete otherFields.isBlocked;
        delete otherFields.accessLevel;
        delete otherFields.username;
        delete otherFields.email;

        // Add remaining allowed fields to update object
        Object.keys(otherFields).forEach((key) => {
            updateData[key] = otherFields[key];
        });

        // Update user with new data
        const user = await User.findByIdAndUpdate(
            req.user.userId,
            { $set: updateData },
            { new: true, runValidators: true },
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            _embedded: {
                user: transformUser(user),
            },
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Controller function to get an active user count
export const getActiveUserCount = async (req, res) => {
    try {
        const count = await User.countDocuments({ isBlocked: false });
        res.json({
            _embedded: {
                count: {
                    activeUsers: count,
                },
            },
        });
    } catch (error) {
        console.error('Get user count error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Controller function to get all blocked users
export const getBlockedUsers = async () => {
    // TODO: not yet implemented
};

// Controller function to get all users
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json({
            _embedded: {
                users: users.map((user) => transformUser(user)),
            },
        });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Controller function to update calculations for a user by ID
export const updateCalculations = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const calculations = await user.updateCalculations();

        res.json({
            _embedded: {
                calculations,
            },
        });
    } catch (error) {
        console.error('Update calculations error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Controller function to delete a user by ID
export const deleteUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);

        if (!user) return res.status(404).send({ message: 'User not found' });

        if (user.accessLevel >= ACCESS_LEVELS.ADMIN) {
            return res.status(403).send({ message: 'Admin cannot be deleted' });
        }

        await User.findByIdAndDelete(id);

        res.json({
            message: 'User deleted successfully',
            _embedded: {
                user: {
                    id: user.id,
                    username: user.username,
                },
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
