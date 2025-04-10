"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserProfile = exports.getProfile = exports.getLeaderboard = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
// Get leaderboard (top users by average score)
const getLeaderboard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const leaderboard = yield user_model_1.default.find({ quizzesTaken: { $gt: 0 } })
            .select('name email quizzesTaken totalScore averageScore avgCompletionTime')
            .sort({ averageScore: -1 }) // Sort by highest score first
            .limit(100);
        // Format the data for the frontend
        const formattedLeaderboard = leaderboard.map((user, index) => ({
            _id: user._id,
            userName: user.name,
            userEmail: user.email,
            quizCount: user.quizzesTaken,
            totalScore: user.totalScore,
            averageScore: user.averageScore,
            avgCompletionTime: user.avgCompletionTime || 0,
            rank: index + 1 // Add rank based on sorted position
        }));
        res.status(200).json({
            success: true,
            data: formattedLeaderboard
        });
    }
    catch (error) {
        console.error('Leaderboard error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error fetching leaderboard data'
        });
    }
});
exports.getLeaderboard = getLeaderboard;
// Get user profile
const getProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authenticated' });
        }
        const user = yield user_model_1.default.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getProfile = getProfile;
// Update user profile
const updateUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authenticated' });
        }
        const { name, email, currentPassword, newPassword } = req.body;
        // Get user with password for validation
        const user = yield user_model_1.default.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Validation
        if (email) {
            const existingUser = yield user_model_1.default.findOne({ email, _id: { $ne: req.user.id } });
            if (existingUser) {
                return res.status(400).json({ message: 'Email already in use' });
            }
        }
        // Prepare update data
        const updateData = {};
        if (name)
            updateData.name = name;
        if (email)
            updateData.email = email;
        // Handle password change
        if (currentPassword && newPassword) {
            // Verify current password
            const isPasswordValid = yield user.comparePassword(currentPassword);
            if (!isPasswordValid) {
                return res.status(400).json({ message: 'Current password is incorrect' });
            }
            // Set new password - this will be hashed automatically by the User model pre-save hook
            user.password = newPassword;
            yield user.save();
            // Update other fields if needed
            if (Object.keys(updateData).length > 0) {
                Object.assign(user, updateData);
                yield user.save();
            }
            // Return updated user without password
            const userToReturn = user.toObject();
            const { password } = userToReturn, userWithoutPassword = __rest(userToReturn, ["password"]);
            return res.json(userWithoutPassword);
        }
        // If no password change, just update other fields
        if (Object.keys(updateData).length > 0) {
            const updatedUser = yield user_model_1.default.findByIdAndUpdate(req.user.id, { $set: updateData }, { new: true }).select('-password');
            return res.json(updatedUser);
        }
        // If nothing to update
        return res.status(400).json({ message: 'No changes to update' });
    }
    catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: error.message });
    }
});
exports.updateUserProfile = updateUserProfile;
