import mongoose from 'mongoose';
import { GENDER, ACTIVITY_LEVEL, ACTIVITY_MULTIPLIERS } from '../constants/enums.js';
import { HEIGHT_UNITS, WEIGHT_UNITS } from '../constants/units.js';
import { convertWeight } from '../../utils/weightConversions.js';
import { convertHeight } from '../../utils/heightConversions.js';
import bcrypt from 'bcrypt';
import config from '../../config/app.config.js';

const UserSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            minLength: 3,
        },
        password: { type: String, required: true },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            validate: {
                validator: (v) => /\S+@\S+\.\S+/.test(v),
                message: 'Invalid email format',
            },
        },
        accessLevel: {
            type: Number,
            required: true,
            default: 1,
            min: 0,
            max: 6,
        },
        isBlocked: {
            type: Boolean,
            default: false,
        },
        loginAttempts: {
            count: { type: Number, default: 0 },
            lastAttempt: { type: Date, default: null },
            lockedUntil: { type: Date, default: null },
        },
        profile: {
            firstName: { type: String, trim: true },
            lastName: { type: String, trim: true },
            dateOfBirth: {
                type: Date,
                validate: {
                    validator: (v) => v <= new Date(),
                    message: 'Date of birth cannot be in the future',
                },
            },
            height: {
                value: { type: Number, min: 1, max: 300 },
                unit: { type: String, enum: HEIGHT_UNITS },
            },
            weight: {
                value: { type: Number, min: 0, max: 1000 },
                unit: { type: String, enum: WEIGHT_UNITS },
            },
            gender: {
                type: String,
                enum: Object.values(GENDER),
            },
            activityLevel: {
                type: String,
                enum: Object.values(ACTIVITY_LEVEL),
            },
            calculations: {
                bmi: { type: Number },
                bmr: { type: Number },
                tdee: { type: Number },
                calculatedAt: { type: Date },
            },
        },
    },
    { timestamps: true },
);

// Pre-save hook to hash password
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(config.security.saltRounds);
        this.password = await bcrypt.hash(this.password + config.security.pepper, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Instance method to compare password
UserSchema.methods.comparePassword = async function (password) {
    try {
        return await bcrypt.compare(password + config.security.pepper, this.password);
    } catch {
        return false;
    }
};

// Pre-save hook to update calculations
UserSchema.methods.updateCalculations = async function () {
    let isUpdated = false;
    if (
        this.isModified('profile.height.unit') ||
        this.isModified('profile.height.value') ||
        this.isModified('profile.weight.unit') ||
        this.isModified('profile.weight.value')
    ) {
        this.profile.calculations.bmi = this.calculateBMI();
        isUpdated = true;
        if (this.isModified('profile.dateOfBirth') || this.isModified('profile.gender')) {
            this.profile.calculations.bmr = this.calculateBMR();
            isUpdated = true;
        }
    }
    if (this.isModified('profile.activityLevel')) {
        this.profile.calculations.tdee = this.calculateTDEE();
        isUpdated = true;
    }
    if (isUpdated) this.profile.calculations.calculatedAt = new Date();
};
UserSchema.pre('save', async function (next) {
    try {
        await this.updateCalculations();
        next();
    } catch (error) {
        next(error);
    }
});

// Instance method to calculate BMI
UserSchema.methods.calculateBMI = function () {
    const profile = this.profile;

    // Check if we have all required data
    if (!profile.height?.value || !profile.weight?.value) {
        return null;
    }

    // Convert weight to kg if needed
    const weightInKg = convertWeight.toKg(profile.weight.value, profile.weight.unit);
    // Convert height to m if needed
    const heightInCm = convertHeight.toCm(profile.height.value, profile.height.unit);

    const bmi = weightInKg / Math.pow(heightInCm / 100, 2);
    return Math.round(bmi * 10) / 10;
};

// Instance method to calculate BMR using Mifflin-St Jeor Equation
UserSchema.methods.calculateBMR = function () {
    const profile = this.profile;

    // Check if we have all required data
    if (!profile.height?.value || !profile.weight?.value || !profile.dateOfBirth || !profile.gender) {
        return null;
    }

    // Convert weight to kg if needed
    const weightInKg = convertWeight.toKg(profile.weight.value, profile.weight.unit);
    // Convert height to cm if needed
    const heightInCm = convertHeight.toCm(profile.height.value, profile.height.unit);
    // Calculate age
    const age = Math.floor((new Date() - new Date(profile.dateOfBirth)) / (1000 * 60 * 60 * 24 * 365));
    // Mifflin-St Jeor Equation
    let bmr = 10 * weightInKg + 6.25 * heightInCm - 5 * age;
    if (profile.gender === GENDER.FEMALE) {
        bmr -= 161;
    } else if (profile.gender === GENDER.MALE) {
        bmr += 5;
    } else {
        // For other/prefer_not_to_say, use average of male and female
        bmr -= 78;
    }
    return Math.round(bmr);
};

// Instance method to calculate TDEE
UserSchema.methods.calculateTDEE = function () {
    const profile = this.profile;

    const bmr = profile.calculations.bmr;
    if (!bmr || !profile.activityLevel) {
        return null;
    }

    const tdee = bmr * ACTIVITY_MULTIPLIERS[profile.activityLevel];
    return Math.round(tdee);
};

// Instance method to check if account is locked
UserSchema.methods.isAccountLocked = function () {
    return this.loginAttempts.lockedUntil > new Date();
};

// Instance method to handle failed login
UserSchema.methods.handleFailedLogin = async function () {
    const MAX_ATTEMPTS = 5;
    const LOCK_TIME = 15 * 60 * 1000; // 15 minutes

    this.loginAttempts.count += 1;
    this.loginAttempts.lastAttempt = new Date();

    if (this.loginAttempts.count >= MAX_ATTEMPTS) {
        this.loginAttempts.lockedUntil = new Date(Date.now() + LOCK_TIME);
    }

    await this.save();
};

// Instance method to handle successful login
UserSchema.methods.handleSuccessfulLogin = async function () {
    if (this.loginAttempts.count > 0 || this.loginAttempts.lockedUntil > new Date()) {
        this.loginAttempts = {
            count: 0,
            lastAttempt: null,
            lockedUntil: null,
        };
        await this.save();
    }
};

// Method to get user data
UserSchema.methods.getUserData = () => {
    const user = this.toObject();
    delete user.password;
    delete user.__v;
    return user;
};

export default mongoose.model('User', UserSchema);
