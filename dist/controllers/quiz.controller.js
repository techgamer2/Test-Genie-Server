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
exports.updateQuiz = exports.deleteQuiz = exports.generateBasicQuiz = exports.createQuiz = exports.getQuestionExplanation = exports.getUserQuizzes = exports.submitQuiz = exports.getQuizById = exports.generateQuizFromFile = exports.generateQuiz = void 0;
const fs_1 = __importDefault(require("fs"));
const quiz_model_1 = __importDefault(require("../models/quiz.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const groq_1 = require("../utils/groq");
const predefinedQuestions_1 = require("../utils/predefinedQuestions");
// Helper function for generating mock questions when OpenAI fails
const generateMockQuestions = (subject, numQuestions = 10, difficulty = 'medium') => {
    // First check if we have predefined questions for this subject
    if ((0, predefinedQuestions_1.hasQuestionsForSubject)(subject)) {
        const questions = (0, predefinedQuestions_1.getRandomQuestions)(subject, numQuestions, difficulty);
        if (questions.length === numQuestions) {
            return questions;
        }
    }
    // Sample questions by subject
    const questionsBySubject = {
        'Mathematics': [
            {
                text: 'What is 2 + 2?',
                options: [
                    { text: '3', isCorrect: false },
                    { text: '4', isCorrect: true },
                    { text: '5', isCorrect: false },
                    { text: '6', isCorrect: false }
                ],
                explanation: '2 + 2 equals 4 because when you add two units to another two units, you get four units.'
            },
            {
                text: 'What is the value of π (pi) to two decimal places?',
                options: [
                    { text: '3.14', isCorrect: true },
                    { text: '3.16', isCorrect: false },
                    { text: '3.12', isCorrect: false },
                    { text: '3.18', isCorrect: false }
                ]
            },
            {
                text: 'What is the square root of 144?',
                options: [
                    { text: '12', isCorrect: true },
                    { text: '14', isCorrect: false },
                    { text: '10', isCorrect: false },
                    { text: '16', isCorrect: false }
                ]
            },
            {
                text: 'What is the result of 7 × 8?',
                options: [
                    { text: '56', isCorrect: true },
                    { text: '54', isCorrect: false },
                    { text: '58', isCorrect: false },
                    { text: '62', isCorrect: false }
                ]
            },
            {
                text: 'What is the formula for the area of a circle?',
                options: [
                    { text: 'πr²', isCorrect: true },
                    { text: '2πr', isCorrect: false },
                    { text: 'πd', isCorrect: false },
                    { text: 'πr²/2', isCorrect: false }
                ]
            },
            {
                text: 'What is the sum of the angles in a triangle?',
                options: [
                    { text: '180 degrees', isCorrect: true },
                    { text: '90 degrees', isCorrect: false },
                    { text: '360 degrees', isCorrect: false },
                    { text: '270 degrees', isCorrect: false }
                ]
            }
        ],
        'Science': [
            {
                text: 'What is the chemical symbol for gold?',
                options: [
                    { text: 'Au', isCorrect: true },
                    { text: 'Ag', isCorrect: false },
                    { text: 'Fe', isCorrect: false },
                    { text: 'Cu', isCorrect: false }
                ]
            },
            {
                text: 'What is the largest planet in our solar system?',
                options: [
                    { text: 'Jupiter', isCorrect: true },
                    { text: 'Saturn', isCorrect: false },
                    { text: 'Neptune', isCorrect: false },
                    { text: 'Earth', isCorrect: false }
                ]
            },
            {
                text: 'What is the process by which plants make their own food called?',
                options: [
                    { text: 'Photosynthesis', isCorrect: true },
                    { text: 'Respiration', isCorrect: false },
                    { text: 'Digestion', isCorrect: false },
                    { text: 'Fermentation', isCorrect: false }
                ]
            },
            {
                text: 'Which subatomic particle has a positive charge?',
                options: [
                    { text: 'Proton', isCorrect: true },
                    { text: 'Electron', isCorrect: false },
                    { text: 'Neutron', isCorrect: false },
                    { text: 'Positron', isCorrect: false }
                ]
            },
            {
                text: 'What is the closest star to Earth?',
                options: [
                    { text: 'The Sun', isCorrect: true },
                    { text: 'Proxima Centauri', isCorrect: false },
                    { text: 'Alpha Centauri', isCorrect: false },
                    { text: 'Sirius', isCorrect: false }
                ]
            }
        ],
        'History': [
            {
                text: 'In which year did World War II end?',
                options: [
                    { text: '1945', isCorrect: true },
                    { text: '1939', isCorrect: false },
                    { text: '1944', isCorrect: false },
                    { text: '1947', isCorrect: false }
                ]
            },
            {
                text: 'Who was the first President of the United States?',
                options: [
                    { text: 'George Washington', isCorrect: true },
                    { text: 'Thomas Jefferson', isCorrect: false },
                    { text: 'Abraham Lincoln', isCorrect: false },
                    { text: 'John Adams', isCorrect: false }
                ]
            },
            {
                text: 'Which civilization built the Machu Picchu?',
                options: [
                    { text: 'Inca', isCorrect: true },
                    { text: 'Maya', isCorrect: false },
                    { text: 'Aztec', isCorrect: false },
                    { text: 'Egyptian', isCorrect: false }
                ]
            },
            {
                text: 'Which empire was ruled by Julius Caesar?',
                options: [
                    { text: 'Roman Empire', isCorrect: true },
                    { text: 'Greek Empire', isCorrect: false },
                    { text: 'Byzantine Empire', isCorrect: false },
                    { text: 'Ottoman Empire', isCorrect: false }
                ]
            },
            {
                text: 'Which event marked the beginning of World War I?',
                options: [
                    { text: 'Assassination of Archduke Franz Ferdinand', isCorrect: true },
                    { text: 'German invasion of Poland', isCorrect: false },
                    { text: 'The sinking of the Lusitania', isCorrect: false },
                    { text: 'Russian Revolution', isCorrect: false }
                ]
            }
        ],
        'Computer Science': [
            {
                text: 'What does CPU stand for?',
                options: [
                    { text: 'Central Processing Unit', isCorrect: true },
                    { text: 'Central Processing Update', isCorrect: false },
                    { text: 'Computer Personal Unit', isCorrect: false },
                    { text: 'Core Processing Unit', isCorrect: false }
                ]
            },
            {
                text: 'Which programming language is often used for web development?',
                options: [
                    { text: 'JavaScript', isCorrect: true },
                    { text: 'C++', isCorrect: false },
                    { text: 'Swift', isCorrect: false },
                    { text: 'Rust', isCorrect: false }
                ]
            },
            {
                text: 'What does HTML stand for?',
                options: [
                    { text: 'Hypertext Markup Language', isCorrect: true },
                    { text: 'Hyper Transfer Markup Language', isCorrect: false },
                    { text: 'High Text Machine Language', isCorrect: false },
                    { text: 'Hyperlink Text Markup Language', isCorrect: false }
                ]
            },
            {
                text: 'Which of these is not a database management system?',
                options: [
                    { text: 'Apache', isCorrect: true },
                    { text: 'MySQL', isCorrect: false },
                    { text: 'PostgreSQL', isCorrect: false },
                    { text: 'MongoDB', isCorrect: false }
                ]
            },
            {
                text: 'What is the binary code for the letter A in ASCII?',
                options: [
                    { text: '01000001', isCorrect: true },
                    { text: '01000010', isCorrect: false },
                    { text: '01000011', isCorrect: false },
                    { text: '01000100', isCorrect: false }
                ]
            }
        ]
    };
    // Default questions for subjects not in our predefined list
    const defaultQuestions = [
        {
            text: `What is the most important concept in ${subject}?`,
            options: [
                { text: 'Fundamental principles', isCorrect: true },
                { text: 'Historical development', isCorrect: false },
                { text: 'Modern applications', isCorrect: false },
                { text: 'Theoretical frameworks', isCorrect: false }
            ],
            explanation: 'Fundamental principles form the foundation of any subject and are essential for understanding its core concepts.'
        },
        {
            text: `Who is considered the founder of ${subject}?`,
            options: [
                { text: 'The pioneering researcher', isCorrect: true },
                { text: 'A contemporary scholar', isCorrect: false },
                { text: 'An ancient philosopher', isCorrect: false },
                { text: 'A collective group of thinkers', isCorrect: false }
            ]
        },
        {
            text: `What year was ${subject} formally established as a field of study?`,
            options: [
                { text: 'Early 20th century', isCorrect: true },
                { text: 'Late 19th century', isCorrect: false },
                { text: 'Mid 18th century', isCorrect: false },
                { text: 'Ancient times', isCorrect: false }
            ]
        },
        {
            text: `Which of these is NOT a common application of ${subject}?`,
            options: [
                { text: 'Underwater basket weaving', isCorrect: true },
                { text: 'Modern technology', isCorrect: false },
                { text: 'Education', isCorrect: false },
                { text: 'Business', isCorrect: false }
            ]
        },
        {
            text: `What is the most influential book on ${subject}?`,
            options: [
                { text: 'The definitive textbook', isCorrect: true },
                { text: 'An obscure manuscript', isCorrect: false },
                { text: 'A popular science book', isCorrect: false },
                { text: 'A recent publication', isCorrect: false }
            ]
        }
    ];
    // Choose the appropriate question set
    let baseQuestions = [];
    const normalizedSubject = subject.toLowerCase().trim();
    // Find the closest match from our predefined subjects
    for (const [key, questions] of Object.entries(questionsBySubject)) {
        if (key.toLowerCase().includes(normalizedSubject) || normalizedSubject.includes(key.toLowerCase())) {
            baseQuestions = questions;
            break;
        }
    }
    // If no matching subject found, use default questions
    if (baseQuestions.length === 0) {
        baseQuestions = defaultQuestions;
    }
    // Generate the requested number of questions
    const questions = [];
    // Add all base questions first
    questions.push(...baseQuestions);
    // If we need more questions than in our base set, start generating variations
    let i = 0;
    while (questions.length < numQuestions) {
        const baseQuestion = baseQuestions[i % baseQuestions.length];
        // Create a variation of the question
        const variation = Object.assign(Object.assign({}, baseQuestion), { text: `${baseQuestion.text} (variation ${Math.floor(i / baseQuestions.length) + 1})`, 
            // Shuffle the options
            options: [...baseQuestion.options].sort(() => Math.random() - 0.5) });
        questions.push(variation);
        i++;
    }
    // Trim to the exact number requested
    return questions.slice(0, numQuestions);
};
// Generate a quiz from a subject
const generateQuiz = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const { subject, numQuestions, difficulty } = req.body;
        if (!subject || !numQuestions) {
            return res.status(400).json({ error: 'Subject and number of questions are required' });
        }
        // Try to generate quiz using Groq
        try {
            // Request more questions than needed to ensure we have enough
            const bufferQuestions = Math.ceil(numQuestions * 1.2); // Request 20% more questions
            const generatedQuiz = yield (0, groq_1.generateQuizWithGroq)(subject, bufferQuestions, difficulty);
            // Trim to exactly the requested number of questions
            const trimmedQuestions = generatedQuiz.questions.slice(0, numQuestions);
            // Create new quiz with trimmed questions
            const newQuiz = new quiz_model_1.default({
                subject,
                difficulty,
                questions: trimmedQuestions,
                createdBy: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || null,
                isAI: true,
                title: `${subject} Quiz - ${difficulty}`,
                userId: ((_b = req.user) === null || _b === void 0 ? void 0 : _b.id) || null
            });
            yield newQuiz.save();
            return res.status(201).json({
                success: true,
                message: 'Quiz generated successfully',
                quiz: newQuiz
            });
        }
        catch (error) {
            console.error('Groq generation failed:', error);
            // Check if it's a rate limit error
            if ((error === null || error === void 0 ? void 0 : error.status) === 429) {
                console.log('Rate limit reached, falling back to predefined questions');
            }
            else {
                console.error('Error details:', error);
            }
            // Continue to fallback logic
        }
        // Fallback to predefined questions
        try {
            // Get more questions than needed
            const bufferQuestions = Math.ceil(numQuestions * 1.2);
            const questions = yield (0, predefinedQuestions_1.getRandomQuestions)(subject, bufferQuestions);
            if (questions.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No questions available for this subject'
                });
            }
            // Trim to exactly the requested number of questions
            const trimmedQuestions = questions.slice(0, numQuestions);
            const newQuiz = new quiz_model_1.default({
                subject,
                difficulty,
                questions: trimmedQuestions,
                createdBy: ((_c = req.user) === null || _c === void 0 ? void 0 : _c.id) || null,
                isAI: false,
                title: `${subject} Quiz - ${difficulty}`,
                userId: ((_d = req.user) === null || _d === void 0 ? void 0 : _d.id) || null
            });
            yield newQuiz.save();
            return res.status(201).json({
                success: true,
                message: 'Quiz generated successfully using predefined questions',
                quiz: newQuiz
            });
        }
        catch (error) {
            console.error('Error creating quiz with predefined questions:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to create quiz'
            });
        }
    }
    catch (error) {
        console.error('Error generating quiz:', error);
        return res.status(500).json({ error: 'Failed to generate quiz' });
    }
});
exports.generateQuiz = generateQuiz;
// Generate a quiz from an uploaded file
const generateQuizFromFile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }
        const { title, description, numQuestions = 10, difficulty = 'medium' } = req.body;
        const filePath = req.file.path;
        const fileSubject = req.file.originalname.split('.')[0] || 'Uploaded file';
        // Read file content
        const fileContent = fs_1.default.readFileSync(filePath, 'utf8');
        // Generate quiz questions using Groq based on file content
        try {
            const aiResponse = yield (0, groq_1.generateQuizFromTextWithGroq)(fileContent, numQuestions, difficulty);
            // Delete the file after processing
            fs_1.default.unlinkSync(filePath);
            // Create quiz in database
            const quiz = new quiz_model_1.default({
                title: title || `Quiz on ${fileSubject}`,
                subject: fileSubject,
                description: description || `A quiz generated from ${req.file.originalname}`,
                questions: aiResponse.questions,
                userId: req.user.id,
            });
            yield quiz.save();
            res.status(201).json({
                success: true,
                data: quiz
            });
        }
        catch (error) {
            console.error('Error generating quiz from file with AI:', error);
            // Fall back to predefined questions if AI fails
            const questions = (0, predefinedQuestions_1.getRandomQuestions)(fileSubject, numQuestions, difficulty);
            if (questions.length === 0) {
                const mockQuestions = generateMockQuestions(fileSubject, numQuestions, difficulty);
                const quiz = new quiz_model_1.default({
                    title: title || `Quiz on ${fileSubject}`,
                    subject: fileSubject,
                    description: description || `A quiz generated from ${req.file.originalname}`,
                    questions: mockQuestions,
                    userId: req.user.id,
                });
                yield quiz.save();
                const availableSubjects = (0, predefinedQuestions_1.getAvailableSubjects)();
                return res.status(201).json({
                    success: true,
                    message: 'Quiz created with mock questions',
                    data: quiz,
                    availableSubjects
                });
            }
            const quiz = new quiz_model_1.default({
                title: title || `Quiz on ${fileSubject}`,
                subject: fileSubject,
                description: description || `A quiz generated from ${req.file.originalname}`,
                questions,
                userId: req.user.id,
            });
            yield quiz.save();
            return res.status(201).json({
                success: true,
                message: 'Quiz created with predefined questions',
                data: quiz
            });
        }
    }
    catch (error) {
        console.error('Error in generateQuizFromFile:', error);
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'Failed to generate quiz from file'
        });
    }
});
exports.generateQuizFromFile = generateQuizFromFile;
// Get a specific quiz
const getQuizById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const quiz = yield quiz_model_1.default.findById(id);
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }
        // For incomplete quizzes, we want to keep the isCorrect property
        // but mark it as a practice attempt
        if (!quiz.isCompleted) {
            const practiceQuiz = JSON.parse(JSON.stringify(quiz));
            practiceQuiz.isPractice = true;
            // Keep the isCorrect property for all options
            practiceQuiz.questions = practiceQuiz.questions.map((question) => (Object.assign(Object.assign({}, question), { options: question.options.map((option) => (Object.assign(Object.assign({}, option), { isCorrect: option.isCorrect // Keep the original isCorrect value
                 }))) })));
            return res.json(practiceQuiz);
        }
        res.json(quiz);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getQuizById = getQuizById;
// Submit a quiz with answers
const submitQuiz = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authenticated' });
        }
        const { id } = req.params;
        const { answers, completionTime } = req.body;
        if (!answers || !Array.isArray(answers)) {
            return res.status(400).json({ message: 'Answers are required' });
        }
        // Validate completion time if provided
        if (completionTime !== undefined && (!Number.isInteger(completionTime) || completionTime <= 0)) {
            return res.status(400).json({ message: 'Completion time must be a positive integer' });
        }
        const quiz = yield quiz_model_1.default.findById(id);
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }
        // Check if this is a retake attempt
        const isRetake = req.query.retake === 'true';
        // If it's a retake, we don't check if the quiz is already completed
        if (!isRetake && quiz.isCompleted) {
            return res.status(400).json({ message: 'Quiz already completed' });
        }
        if (quiz.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to submit this quiz' });
        }
        // Calculate score
        let correctAnswers = 0;
        quiz.questions.forEach((question, index) => {
            var _a;
            const selectedOption = answers[index];
            const correctOption = question.options.find(option => option.isCorrect);
            if (correctOption && selectedOption === ((_a = correctOption._id) === null || _a === void 0 ? void 0 : _a.toString())) {
                correctAnswers++;
            }
        });
        const score = (correctAnswers / quiz.questions.length) * 100;
        // Update quiz
        quiz.isCompleted = true;
        quiz.score = score;
        quiz.userAnswers = answers;
        // Increment attempts counter
        quiz.attempts = (quiz.attempts || 0) + 1;
        // Save completion time if provided
        if (completionTime) {
            quiz.completionTime = completionTime;
        }
        yield quiz.save();
        // Update user stats
        const user = yield user_model_1.default.findById(req.user.id);
        if (user) {
            user.quizzesTaken += 1;
            user.totalScore += score;
            user.averageScore = user.totalScore / user.quizzesTaken;
            // Update time statistics if completion time is provided
            if (completionTime) {
                // Make sure totalCompletionTime is initialized if it doesn't exist
                if (!user.totalCompletionTime) {
                    user.totalCompletionTime = 0;
                }
                user.totalCompletionTime += completionTime;
                user.avgCompletionTime = user.totalCompletionTime / user.quizzesTaken;
                console.log(`User ${user._id} updated: quizzesTaken=${user.quizzesTaken}, totalScore=${user.totalScore}, avgScore=${user.averageScore}, totalTime=${user.totalCompletionTime}, avgTime=${user.avgCompletionTime}`);
            }
            yield user.save();
        }
        res.json({
            quiz,
            score,
            correctAnswers,
            totalQuestions: quiz.questions.length,
            timeTaken: completionTime || undefined
        });
    }
    catch (error) {
        console.error('Error submitting quiz:', error);
        res.status(500).json({ message: error.message });
    }
});
exports.submitQuiz = submitQuiz;
// Get quizzes for a user
const getUserQuizzes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authenticated' });
        }
        const quizzes = yield quiz_model_1.default.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json({
            success: true,
            data: quizzes
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});
exports.getUserQuizzes = getUserQuizzes;
// Get AI-generated explanation for a question
const getQuestionExplanation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { questionId } = req.params;
        const { quizId } = req.query;
        if (!quizId) {
            return res.status(400).json({ message: 'Quiz ID is required' });
        }
        const quiz = yield quiz_model_1.default.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }
        const question = quiz.questions.find(q => { var _a; return ((_a = q._id) === null || _a === void 0 ? void 0 : _a.toString()) === questionId; });
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }
        // If explanation already exists, return it
        if (question.explanation) {
            return res.json({ explanation: question.explanation });
        }
        // Find the correct answer
        const correctOption = question.options.find(o => o.isCorrect);
        if (!correctOption) {
            return res.status(400).json({ message: 'No correct answer found for this question' });
        }
        // Generate explanation with AI
        const explanation = yield (0, groq_1.generateExplanation)(question.text, correctOption.text);
        // Update the quiz with the explanation
        yield quiz_model_1.default.updateOne({ _id: quizId, 'questions._id': questionId }, { $set: { 'questions.$.explanation': explanation } });
        res.json({ explanation });
    }
    catch (error) {
        console.error('Error generating explanation:', error);
        res.status(500).json({ message: error.message || 'Failed to generate explanation' });
    }
});
exports.getQuestionExplanation = getQuestionExplanation;
// Create a quiz manually (without AI generation)
const createQuiz = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }
        const { title, subject, description, questions } = req.body;
        if (!title || !subject || !Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Required fields missing: title, subject, and questions are required'
            });
        }
        // Validate questions structure
        if (!questions.every(q => q.text &&
            Array.isArray(q.options) &&
            q.options.length >= 2 &&
            q.options.some((o) => o.isCorrect))) {
            return res.status(400).json({
                success: false,
                message: 'Questions must have text, at least 2 options, and at least 1 correct option'
            });
        }
        // Create quiz in database
        const quiz = new quiz_model_1.default({
            title,
            subject,
            description: description || `A quiz about ${subject}`,
            questions,
            userId: req.user.id,
        });
        const savedQuiz = yield quiz.save();
        res.status(201).json({
            success: true,
            message: 'Quiz created successfully',
            data: savedQuiz
        });
    }
    catch (error) {
        console.error('Error creating quiz:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create quiz'
        });
    }
});
exports.createQuiz = createQuiz;
// Generate a quiz with pre-defined questions (no AI needed)
const generateBasicQuiz = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authenticated' });
        }
        const { title, subject, numQuestions = 10, difficulty = 'medium' } = req.body;
        if (!subject) {
            return res.status(400).json({ message: 'Subject is required' });
        }
        console.log(`Quiz generation started for subject: ${subject}, numQuestions: ${numQuestions}, difficulty: ${difficulty}`);
        try {
            // Generate questions using Groq
            const response = yield (0, groq_1.generateQuizWithGroq)(subject, numQuestions, difficulty);
            if (!response.questions || response.questions.length === 0) {
                throw new Error('No questions generated');
            }
            // Create the quiz with AI-generated questions
            const quiz = new quiz_model_1.default({
                title: title || `${subject} Quiz`,
                subject,
                description: `A quiz about ${subject}`,
                questions: response.questions,
                userId: req.user.id
            });
            yield quiz.save();
            console.log(`Quiz saved to database with ID: ${quiz._id}`);
            res.status(201).json({
                success: true,
                message: 'Quiz created successfully with AI-generated questions',
                data: quiz
            });
        }
        catch (error) {
            console.error('Error generating quiz with AI:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to generate quiz with AI. Please try again later.',
                error: error.message
            });
        }
    }
    catch (error) {
        console.error('Error creating basic quiz:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});
exports.generateBasicQuiz = generateBasicQuiz;
// Delete a quiz
const deleteQuiz = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }
        const quizId = req.params.id;
        // Check if quiz exists
        const quiz = yield quiz_model_1.default.findById(quizId);
        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: 'Quiz not found'
            });
        }
        // Check if user owns the quiz
        if (quiz.userId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to delete this quiz'
            });
        }
        // Delete the quiz
        yield quiz_model_1.default.findByIdAndDelete(quizId);
        res.json({
            success: true,
            message: 'Quiz deleted successfully'
        });
    }
    catch (error) {
        console.error('Error deleting quiz:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});
exports.deleteQuiz = deleteQuiz;
// Update a quiz
const updateQuiz = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
        }
        const quizId = req.params.id;
        const { title, subject, description, questions } = req.body;
        // Check if quiz exists
        const quiz = yield quiz_model_1.default.findById(quizId);
        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: 'Quiz not found'
            });
        }
        // Check if user owns the quiz
        if (quiz.userId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to update this quiz'
            });
        }
        // Prepare update data
        const updateData = {};
        if (title)
            updateData.title = title;
        if (subject)
            updateData.subject = subject;
        if (description)
            updateData.description = description;
        if (questions)
            updateData.questions = questions;
        // Update the quiz
        const updatedQuiz = yield quiz_model_1.default.findByIdAndUpdate(quizId, { $set: updateData }, { new: true });
        res.json({
            success: true,
            message: 'Quiz updated successfully',
            data: updatedQuiz
        });
    }
    catch (error) {
        console.error('Error updating quiz:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});
exports.updateQuiz = updateQuiz;
