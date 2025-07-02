import User from '../models/schemas/User.js';
import { convertWeight } from '../utils/weightConversions.js';
import { convertHeight } from '../utils/heightConversions.js';
import { GENDER } from '../models/constants/enums.js';
import bcrypt from 'bcrypt';
import { ACCESS_LEVELS } from '../models/constants/accessLevels.js';

const salt = process.env.PASSWORD_SALT || 10;
const pepper = process.env.PASSWORD_PEPPER || '';

const genderMap = {
    [GENDER.MALE]: 'Male',
    [GENDER.FEMALE]: 'Female',
    [GENDER.OTHER]: 'Other',
    [GENDER.PREFER_NOT_TO_SAY]: 'Prefer not to say',
};

// Function to transform user data for presentation
const transformUser = (user) => {
    const transformedUser = {
        id: user._id,
        username: user.username,
        email: user.email,
        accessLevel: user.accessLevel,
        isBlocked: user.isBlocked,
        profile: {
            firstName: user.profile.firstName,
            lastName: user.profile.lastName,
            dateOfBirth: user.profile.dateOfBirth.toISOString().split('T')[0],
            height: {
                value: convertHeight.toCm(user.profile.height.value, user.profile.height.unit),
                unit: user.profile.height.unit,
            },
            weight: {
                value: convertWeight.toKg(user.profile.weight.value, user.profile.weight.unit),
                unit: user.profile.weight.unit,
            },
            gender: genderMap[user.profile.gender] || 'Not specified',
            activityLevel: user.profile.activityLevel,
            calculations: {
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
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        // const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).send({ message: 'User not found' });

        // Get energy calculations
        const energyCalculations = await user.getEnergyCalculations();

        // Transform data for presentation
        const transformedUser = transformUser(user);

        res.json({ ...transformedUser, energyCalculations });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Server error' });
    }
};

// Controller function to update a user by ID
const updateUserById = async (req, res) => {
    try {
        const { password, profile, ...otherFields } = req.body;

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

        // Handle password update if provided
        if (password) {
            updateData.password = await bcrypt.hash(password + pepper, salt);
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

        res.json(user);
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).send('Server error');
    }
};

// Controller function to get an active user count
const getActiveUserCount = async (req, res) => {
    try {
        const count = await User.countDocuments({ isBlocked: false });
        res.json({ count });
    } catch (error) {
        console.error('Get user count error:', error);
        res.status(500).send('Server error');
    }
};

// Controller function to get all blocked users
const getBlockedUsers = async () => {
    // TODO: not yet implemented
};

// Controller function to get all users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).send('Server error');
    }
};

// Controller function to update energy calculations for a user by ID
const updateEnergyCalculations = async (req, res) => {
    try {
        console.log(req);
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const calculations = await user.updateEnergyCalculations();
        res.json(calculations);
    } catch (error) {
        console.error('Update energy calculations error:', error);
        res.status(500).send('Server error');
    }
};

// Controller function to delete a user by ID
const deleteUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) return res.status(404).send({ message: 'User not found' });

        if (user.accessLevel >= ACCESS_LEVELS.ADMIN)
            return res.status(403).send({ message: 'Admin cannot be deleted' });

        await User.findByIdAndDelete(id);

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Server error' });
    }
};

export {
    transformUser,
    getUserById,
    updateUserById,
    getActiveUserCount,
    getBlockedUsers,
    getAllUsers,
    updateEnergyCalculations,
    deleteUserById,
};
