"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTotalQuestionCount = exports.getQuestionCountForSubject = exports.getRandomQuestions = exports.hasQuestionsForSubject = exports.getAvailableSubjects = exports.predefinedQuestions = void 0;
const programming_1 = require("./programming");
const dataStructures_1 = require("./dataStructures");
const database_1 = require("./database");
const webdev_1 = require("./webdev");
const networks_1 = require("./networks");
// Export all question sets
exports.predefinedQuestions = {
    'Programming Languages': programming_1.programmingQuestions,
    'Data Structures & Algorithms': dataStructures_1.dataStructuresQuestions,
    'Database Systems': database_1.databaseQuestions,
    'Web Development': webdev_1.webdevQuestions,
    'Computer Networks': networks_1.networksQuestions
};
// Helper function to get available subjects
const getAvailableSubjects = () => {
    return Object.keys(exports.predefinedQuestions);
};
exports.getAvailableSubjects = getAvailableSubjects;
// Helper function to check if a subject has predefined questions
const hasQuestionsForSubject = (subject) => {
    return Object.keys(exports.predefinedQuestions).includes(subject);
};
exports.hasQuestionsForSubject = hasQuestionsForSubject;
// Helper function to get random questions for a subject with specific count and difficulty
const getRandomQuestions = (subject, count = 10, difficulty = 'medium') => {
    if (!(0, exports.hasQuestionsForSubject)(subject)) {
        return [];
    }
    const allQuestions = exports.predefinedQuestions[subject];
    // Shuffle questions
    const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
    // Take requested count
    return shuffled.slice(0, Math.min(count, shuffled.length));
};
exports.getRandomQuestions = getRandomQuestions;
// Helper function to get question count for a subject
const getQuestionCountForSubject = (subject) => {
    if (!(0, exports.hasQuestionsForSubject)(subject)) {
        return 0;
    }
    return exports.predefinedQuestions[subject].length;
};
exports.getQuestionCountForSubject = getQuestionCountForSubject;
// Helper function to get total question count across all subjects
const getTotalQuestionCount = () => {
    return Object.values(exports.predefinedQuestions)
        .reduce((total, questions) => total + questions.length, 0);
};
exports.getTotalQuestionCount = getTotalQuestionCount;
