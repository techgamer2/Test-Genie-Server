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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordDirect = exports.resetPassword = exports.forgotPassword = exports.getCurrentUser = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = __importDefault(require("../models/user.model"));
const crypto_1 = __importDefault(require("crypto"));
// Register a new user
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password } = req.body;
        // Check if user already exists
        const existingUser = yield user_model_1.default.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }
        // Create new user
        const user = new user_model_1.default({
            name,
            email,
            password,
        });
        yield user.save();
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET || 'default_secret', { expiresIn: '7d' });
        res.status(201).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                quizzesTaken: user.quizzesTaken,
                averageScore: user.averageScore,
            },
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.register = register;
// Login user
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // Find user by email
        const user = yield user_model_1.default.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
        // Verify password
        const isMatch = yield user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET || 'default_secret', { expiresIn: '7d' });
        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                quizzesTaken: user.quizzesTaken,
                averageScore: user.averageScore,
            },
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.login = login;
// Get current user
const getCurrentUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
exports.getCurrentUser = getCurrentUser;
// Handle forgot password
const forgotPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        // Find user by email
        const user = yield user_model_1.default.findOne({ email });
        // Generate a reset token even if user doesn't exist (security measure)
        // This prevents attackers from determining if an email exists
        const token = crypto_1.default.randomBytes(20).toString('hex');
        const resetUrl = `${req.headers.origin || process.env.CLIENT_URL}/reset-password/${token}`;
        // If user exists, save the token to their account
        if (user) {
            // Save the token and expiry to the user's account
            user.resetPasswordToken = token;
            user.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiry
            yield user.save();
            console.log(`Reset token for ${email}: ${token}`);
            console.log(`Reset URL: ${resetUrl}`);
        }
        // Send a response with the token and URL for testing (in production, this would be emailed)
        res.json({
            success: true,
            message: 'If your email is registered with us, you will receive password reset instructions shortly.',
            resetToken: token, // Only for testing/development
            resetUrl: resetUrl // Only for testing/development
        });
    }
    catch (error) {
        console.error('Error in forgot password:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error processing request'
        });
    }
});
exports.forgotPassword = forgotPassword;
// Reset password
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token, password } = req.body;
        // Find user with valid reset token
        const user = yield user_model_1.default.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Password reset token is invalid or has expired.'
            });
        }
        // Update password (will be hashed by pre-save hook)
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        yield user.save();
        // Generate a JWT for auto-login
        const payload = {
            id: user._id,
            email: user.email
        };
        const jwtSecret = process.env.JWT_SECRET || 'default_secret';
        const tokenJWT = jsonwebtoken_1.default.sign(payload, jwtSecret, { expiresIn: '1d' });
        // Return a response with token and user info for auto-login
        res.json({
            success: true,
            message: 'Password has been reset successfully.',
            token: tokenJWT,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    }
    catch (error) {
        console.error('Error in reset password:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error resetting password'
        });
    }
});
exports.resetPassword = resetPassword;
// Reset password directly (without token)
const resetPasswordDirect = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // Find user by email
        const user = yield user_model_1.default.findOne({ email });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'No account found with this email address.'
            });
        }
        // Update password (will be hashed by pre-save hook)
        user.password = password;
        yield user.save();
        // Return success
        res.json({
            success: true,
            message: 'Password has been reset successfully.'
        });
    }
    catch (error) {
        console.error('Error in direct password reset:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error resetting password'
        });
    }
});
exports.resetPasswordDirect = resetPasswordDirect;
