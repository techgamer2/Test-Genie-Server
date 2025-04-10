"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
// Register user
router.post('/register', auth_controller_1.register);
// Login user
router.post('/login', auth_controller_1.login);
// Get current user
router.get('/me', auth_middleware_1.authenticateToken, auth_controller_1.getCurrentUser);
// Forgot password
router.post('/forgot-password', auth_controller_1.forgotPassword);
// Reset password
router.post('/reset-password', auth_controller_1.resetPassword);
// Direct password reset (without token)
router.post('/reset-password-direct', auth_controller_1.resetPasswordDirect);
exports.default = router;
