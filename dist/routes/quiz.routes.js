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
const express_1 = __importDefault(require("express"));
const quiz_controller_1 = require("../controllers/quiz.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const multer_1 = __importDefault(require("multer"));
const router = express_1.default.Router();
// Set up multer for file uploads
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const upload = (0, multer_1.default)({ storage });
// Create a quiz manually
router.post('/', auth_middleware_1.authenticateToken, quiz_controller_1.createQuiz);
// Generate a quiz from a subject
router.post('/generate', auth_middleware_1.authenticateToken, ((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, quiz_controller_1.generateQuiz)(req, res);
    }
    catch (error) {
        next(error);
    }
})));
// Generate a basic quiz without using AI
router.post('/generate-basic', auth_middleware_1.authenticateToken, ((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, quiz_controller_1.generateBasicQuiz)(req, res);
    }
    catch (error) {
        next(error);
    }
})));
// Generate a quiz from an uploaded file
router.post('/generate-from-file', auth_middleware_1.authenticateToken, upload.single('file'), quiz_controller_1.generateQuizFromFile);
// Get a specific quiz
router.get('/:id', auth_middleware_1.authenticateToken, quiz_controller_1.getQuizById);
// Delete a quiz
router.delete('/:id', auth_middleware_1.authenticateToken, quiz_controller_1.deleteQuiz);
// Update a quiz
router.put('/:id', auth_middleware_1.authenticateToken, quiz_controller_1.updateQuiz);
// Submit a quiz (with answers)
router.post('/:id/submit', auth_middleware_1.authenticateToken, quiz_controller_1.submitQuiz);
// Get all quizzes for a user
router.get('/user/quizzes', auth_middleware_1.authenticateToken, quiz_controller_1.getUserQuizzes);
// Get AI-generated explanation for a question
router.get('/question/:questionId/explanation', auth_middleware_1.authenticateToken, quiz_controller_1.getQuestionExplanation);
exports.default = router;
