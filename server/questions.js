// Questions data for The Floor: Christmas Edition
// Loads questions from trivia.js and converts them to the server format

// Load the trivia questions from the root trivia.js file
const path = require('path');
const fs = require('fs');

// Read and parse trivia.js
const triviaPath = path.join(__dirname, '..', 'trivia.js');
const triviaContent = fs.readFileSync(triviaPath, 'utf8');

// Extract the TRIVIA_QUESTIONS array from the file
// We need to evaluate just the array definition
const startMarker = 'const TRIVIA_QUESTIONS = [';
const startIndex = triviaContent.indexOf(startMarker);
let bracketCount = 0;
let endIndex = startIndex + startMarker.length - 1;
let foundStart = false;

for (let i = startIndex; i < triviaContent.length; i++) {
    if (triviaContent[i] === '[') {
        bracketCount++;
        foundStart = true;
    } else if (triviaContent[i] === ']') {
        bracketCount--;
        if (foundStart && bracketCount === 0) {
            endIndex = i + 1;
            break;
        }
    }
}

const arrayContent = triviaContent.substring(startIndex + 'const TRIVIA_QUESTIONS = '.length, endIndex);
const TRIVIA_QUESTIONS = eval(arrayContent);

// Convert category names to IDs (kebab-case)
function categoryToId(category) {
    return category.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

// Convert trivia.js format to server format
// trivia.js: { category, question, answers: [answer], correct: 0 }
// server: { question, answer }
const QUESTIONS = {};

TRIVIA_QUESTIONS.forEach(q => {
    const categoryId = categoryToId(q.category);
    if (!QUESTIONS[categoryId]) {
        QUESTIONS[categoryId] = [];
    }
    QUESTIONS[categoryId].push({
        question: q.question,
        answer: q.answers[q.correct]
    });
});

// Get questions for a category
function getQuestionsForCategory(categoryId) {
    return QUESTIONS[categoryId] || [];
}

// Get a specific question
function getQuestion(categoryId, index) {
    const questions = QUESTIONS[categoryId];
    if (!questions || index >= questions.length) {
        return null;
    }
    return questions[index];
}

// Get question count for a category
function getQuestionCount(categoryId) {
    const questions = QUESTIONS[categoryId];
    return questions ? questions.length : 0;
}

module.exports = {
    QUESTIONS,
    getQuestionsForCategory,
    getQuestion,
    getQuestionCount
};
