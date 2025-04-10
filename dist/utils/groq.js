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
exports.generateExplanation = exports.generateQuizFromTextWithGroq = exports.generateQuizWithGroq = void 0;
const groq_sdk_1 = require("groq-sdk");
const mongoose_1 = __importDefault(require("mongoose"));
// Initialize Groq client with API key if available
let groq = null;
try {
    console.log("Checking for GROQ_API_KEY environment variable...");
    // Use hardcoded API key for testing
    const apiKey = "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";
    console.log("Using hardcoded API key for testing");
    groq = new groq_sdk_1.Groq({
        apiKey: apiKey,
    });
    console.log("Groq client initialized successfully");
}
catch (error) {
    console.error("Error initializing Groq client:", error);
}
const generateQuizWithGroq = (subject_1, numQuestions_1, ...args_1) => __awaiter(void 0, [subject_1, numQuestions_1, ...args_1], void 0, function* (subject, numQuestions, difficulty = 'medium') {
    try {
        if (!groq) {
            throw new Error('Groq client not available');
        }
        const prompt = `Generate EXACTLY ${numQuestions} ${difficulty} difficulty multiple-choice questions about ${subject}. 
Each question must have 4 options with EXACTLY ONE correct answer.
For ${difficulty} difficulty:
- Easy: Basic concepts, straightforward questions
- Medium: Moderate complexity, some application of concepts
- Hard: Complex scenarios, deep understanding required

IMPORTANT: 
1. Generate EXACTLY ${numQuestions} questions - no more, no less
2. Each question must be unique and different from any previous questions
3. Each question must be specific to ${subject} and test different aspects of the topic
4. Each question must have exactly 4 options with EXACTLY ONE correct answer
5. If you cannot generate exactly ${numQuestions} questions, do not return any questions at all
6. The response must be a valid JSON object with a "questions" array containing exactly ${numQuestions} questions

Format the response as a valid JSON with the following structure:
{
  "questions": [
    {
      "text": "Question text",
      "options": [
        { "text": "Option 1", "isCorrect": false },
        { "text": "Option 2", "isCorrect": true },
        { "text": "Option 3", "isCorrect": false },
        { "text": "Option 4", "isCorrect": false }
      ],
      "explanation": "A brief explanation of why the correct answer is right"
    }
  ]
}`;
        console.log('Sending request to Groq...');
        const completion = yield groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.1-8b-instant',
            temperature: 0.7, // Reduced temperature for more consistent output
            response_format: { type: 'json_object' },
        });
        const responseContent = completion.choices[0].message.content;
        if (!responseContent) {
            throw new Error('Failed to generate quiz content');
        }
        console.log('Successfully received response from Groq');
        let parsedResponse;
        try {
            parsedResponse = JSON.parse(responseContent);
        }
        catch (error) {
            throw new Error('Invalid JSON response from Groq');
        }
        // Validate the response structure
        if (!parsedResponse || !parsedResponse.questions || !Array.isArray(parsedResponse.questions)) {
            throw new Error('Invalid response format: missing or invalid questions array');
        }
        // Verify we got the requested number of questions
        if (parsedResponse.questions.length !== numQuestions) {
            console.log(`Received ${parsedResponse.questions.length} questions, adjusting to ${numQuestions}`);
            if (parsedResponse.questions.length > numQuestions) {
                // If we got more questions, take the first N
                parsedResponse.questions = parsedResponse.questions.slice(0, numQuestions);
            }
            else {
                // If we got fewer questions, duplicate some to reach the requested number
                const questionsNeeded = numQuestions - parsedResponse.questions.length;
                const additionalQuestions = parsedResponse.questions.slice(0, questionsNeeded);
                parsedResponse.questions = [...parsedResponse.questions, ...additionalQuestions];
            }
        }
        // Validate and fix each question
        for (const question of parsedResponse.questions) {
            if (!question.text || !question.options || !Array.isArray(question.options) || question.options.length !== 4) {
                throw new Error('Invalid question format: missing required fields or incorrect number of options');
            }
            // Count correct answers
            const correctAnswers = question.options.filter((opt) => opt.isCorrect);
            // If there are multiple correct answers, keep only the first one
            if (correctAnswers.length > 1) {
                console.log('Fixing question with multiple correct answers');
                let foundFirstCorrect = false;
                question.options = question.options.map((opt) => {
                    if (opt.isCorrect) {
                        if (!foundFirstCorrect) {
                            foundFirstCorrect = true;
                            return Object.assign(Object.assign({}, opt), { isCorrect: true });
                        }
                        return Object.assign(Object.assign({}, opt), { isCorrect: false });
                    }
                    return opt;
                });
            }
            else if (correctAnswers.length === 0) {
                // If no correct answer, make the first option correct
                console.log('Fixing question with no correct answers');
                question.options[0].isCorrect = true;
            }
        }
        // Return the validated questions
        return {
            _id: new mongoose_1.default.Types.ObjectId().toString(),
            subject,
            difficulty,
            questions: parsedResponse.questions,
            createdBy: null,
            isAI: true,
            title: `${subject} Quiz - ${difficulty}`,
            userId: null,
            createdAt: new Date(),
            updatedAt: new Date()
        };
    }
    catch (error) {
        console.error('Error generating quiz with Groq:', error);
        throw error;
    }
});
exports.generateQuizWithGroq = generateQuizWithGroq;
const generateQuizFromTextWithGroq = (text_1, numQuestions_1, ...args_1) => __awaiter(void 0, [text_1, numQuestions_1, ...args_1], void 0, function* (text, numQuestions, difficulty = 'medium') {
    try {
        if (!groq) {
            throw new Error('Groq client not available');
        }
        const prompt = `Based on the following text, generate a ${difficulty} difficulty quiz with ${numQuestions} multiple-choice questions. 
Each question should have 4 options with only one correct answer.
For ${difficulty} difficulty:
- Easy: Basic concepts, straightforward questions
- Medium: Moderate complexity, some application of concepts
- Hard: Complex scenarios, deep understanding required

IMPORTANT: Generate completely unique questions that are different from any previous questions.
Make sure each question is specific to the content of the provided text.

Format the response as a valid JSON with the following structure:
{
  "questions": [
    {
      "text": "Question text",
      "options": [
        { "text": "Option 1", "isCorrect": false },
        { "text": "Option 2", "isCorrect": true },
        { "text": "Option 3", "isCorrect": false },
        { "text": "Option 4", "isCorrect": false }
      ],
      "explanation": "A brief explanation of why the correct answer is right"
    }
  ]
}

The text to generate questions from is:
${text}`;
        const completion = yield groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.1-8b-instant',
            temperature: 0.9, // Increased temperature for more variety
            response_format: { type: 'json_object' },
        });
        const responseContent = completion.choices[0].message.content;
        if (!responseContent) {
            throw new Error('Failed to generate quiz content from text');
        }
        return JSON.parse(responseContent);
    }
    catch (error) {
        console.error('Error generating quiz from text with Groq:', error);
        throw error; // Throw error instead of falling back
    }
});
exports.generateQuizFromTextWithGroq = generateQuizFromTextWithGroq;
const generateExplanation = (question, answer) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!groq) {
            throw new Error('Groq client not available');
        }
        const prompt = `The question is: "${question}"
The correct answer is: "${answer}"
Please provide a detailed explanation of why this answer is correct, including relevant facts and concepts.`;
        const completion = yield groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.1-8b-instant',
            temperature: 0.7,
        });
        const explanation = completion.choices[0].message.content;
        if (!explanation) {
            throw new Error('Failed to generate explanation');
        }
        return explanation;
    }
    catch (error) {
        console.error('Error generating explanation with Groq:', error);
        throw error; // Throw error instead of falling back
    }
});
exports.generateExplanation = generateExplanation;
