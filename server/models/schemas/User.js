import mongoose from 'mongoose';
import { HEIGHT_CONVERSIONS, UNITS, WEIGHT_CONVERSIONS } from '../constants/units';
import { GENDER, ACTIVITY_LEVEL, ACTIVITY_MULTIPLIERS } from '../constants/enums';
import { convertWeight } from '../../utils/weightConversions';
import { convertHeight } from '../../utils/heightConversions';

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
        profile: {
            firstName: { type: String, required: true, trim: true },
            lastName: { type: String, required: true, trim: true },
            dateOfBirth: { type: Date },
            height: {
                value: { type: Number, min: 0 },
                unit: { type: String, enum: UNITS.HEIGHT },
            },
            weight: {
                value: { type: Number, min: 0 },
                unit: { type: String, enum: UNITS.PERSON_WEIGHT },
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
                bmr: {
                    value: { type: Number },
                    calculatedAt: { type: Date },
                },
                tdee: {
                    value: { type: Number },
                    calculatedAt: { type: Date },
                },
                lastWeightUsed: { type: Number },
                lastActivityLevelUsed: { type: String },
            },
        },
    },
    { timestamps: true },
);

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
    const age = Math.floor(new Date() - new Date(profile.dateOfBirth) / (1000 * 60 * 60 * 24 * 365));
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
    const bmr = this.calculateBMR();
    if (!bmr || !this.profile.activityLevel) {
        return null;
    }

    const tdee = bmr * ACTIVITY_MULTIPLIERS[this.profile.activityLevel];
    return Math.round(tdee);
};

// Method to update cached calculations
UserSchema.methods.updateEnergyCalculations = async function () {
    const bmr = this.calculateBMR();
    const tdee = this.calculateTDEE();
    const now = new Date();

    this.profile.calculations = {
        bmr: {
            value: bmr,
            calculatedAt: now,
        },
        tdee: {
            value: tdee,
            calculatedAt: now,
        },
        lastWeightUsed: this.profile.weight.value,
        lastActivityLevelUsed: this.profile.activityLevel,
    };

    await this.save();
    return { bmr, tdee };
};

// Static method to get energy calculations
UserSchema.methods.getEnergyCalculations = async function () {
    // Check if we need to recalculate
    const needsUpdate =
        !this.profile.calculations?.bmr?.value ||
        this.profile.calculations.lastWeightUsed !== this.profile.weight.value ||
        this.profile.calculations.lastActivityLevelUsed !== this.profile.activityLevel;

    if (needsUpdate) {
        return await this.updateEnergyCalculations();
    }

    return {
        bmr: this.profile.calculations.bmr.value,
        tdee: this.profile.calculations.tdee.value,
    };
};

export default mongoose.model('User', UserSchema);
