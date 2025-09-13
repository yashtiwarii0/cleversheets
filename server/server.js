import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import natural from 'natural';
import pdfParse from 'pdf-parse';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import questionRoutes from './routes/questionRoutes.js';

// Load env vars
dotenv.config();

// ES module fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Accept only text files, PDFs, and Word documents
    if (
      file.mimetype === 'text/plain' ||
      file.mimetype === 'application/pdf' ||
      file.mimetype === 'application/msword' ||
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file format. Please upload TXT, PDF, or DOC files.'));
    }
  }
});

// Helper function to extract text from PDF
async function extractTextFromPDF(filePath) {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  } catch (error) {
    console.error('Error parsing PDF:', error.message);
    throw new Error('Failed to parse PDF file');
  }
}

// Helper function to extract text from file based on type
async function extractTextFromFile(filePath, mimeType) {
  if (mimeType === 'text/plain') {
    return fs.readFileSync(filePath, 'utf8');
  } else if (mimeType === 'application/pdf') {
    return await extractTextFromPDF(filePath);
  } else {
    // For Word documents, we'd need additional libraries
    // This is a placeholder - in a real app, you'd use a library like mammoth.js
    throw new Error('Word document processing not implemented yet');
  }
}

// Helper function to generate questions from text
function generateQuestionsFromText(text) {
  // Tokenize the text into sentences
  const tokenizer = new natural.SentenceTokenizer();
  const sentences = tokenizer.tokenize(text);
  
  // Extract keywords using TF-IDF
  const TfIdf = natural.TfIdf;
  const tfidf = new TfIdf();
  
  // Add each sentence as a document
  sentences.forEach(sentence => {
    tfidf.addDocument(sentence);
  });
  
  // Find important sentences based on keyword density
  const importantSentences = [];
  const keywordScores = {};
  
  sentences.forEach((sentence, i) => {
    let score = 0;
    const words = sentence.split(/\s+/);
    
    // Calculate sentence importance based on TF-IDF scores
    words.forEach(word => {
      if (word.length > 3) { // Ignore short words
        tfidf.tfidfs(word, function(j, measure) {
          if (i === j) {
            score += measure;
            if (!keywordScores[word]) keywordScores[word] = 0;
            keywordScores[word] += measure;
          }
        });
      }
    });
    
    if (score > 0) {
      importantSentences.push({ sentence, score });
    }
  });
  
  // Sort sentences by importance score
  importantSentences.sort((a, b) => b.score - a.score);
  
  // Get top keywords
  const sortedKeywords = Object.entries(keywordScores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(entry => entry[0]);
  
  // Generate different types of questions
  const questions = [];
  
  // Take top 30% of important sentences for question generation
  const topSentences = importantSentences.slice(0, Math.ceil(importantSentences.length * 0.3));
  
  topSentences.forEach(({ sentence }) => {
    // Generate fill-in-the-blank questions
    sortedKeywords.forEach(keyword => {
      if (sentence.toLowerCase().includes(keyword.toLowerCase())) {
        const regex = new RegExp(`\\b${keyword}\\b`, 'i');
        const blankQuestion = sentence.replace(regex, '________');
        
        if (blankQuestion !== sentence) {
          questions.push({
            type: 'fill-in-the-blank',
            question: blankQuestion,
            answer: keyword,
            originalSentence: sentence
          });
        }
      }
    });
    
    // Generate short answer questions
    if (sentence.length > 20 && !sentence.includes('?')) {
      const questionText = `Explain the concept: "${sentence}"`;
      questions.push({
        type: 'short-answer',
        question: questionText,
        context: sentence
      });
    }
  });
  
  // Remove duplicate questions
  const uniqueQuestions = [];
  const seen = new Set();
  
  questions.forEach(q => {
    const key = q.question + (q.answer || '');
    if (!seen.has(key)) {
      seen.add(key);
      uniqueQuestions.push(q);
    }
  });
  
  // Return top 20 questions or all if less than 20
  return uniqueQuestions.slice(0, 20);
}

// API endpoint to process text input directly
app.post('/api/process-text', (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'No text provided' });
    }
    
    const questions = generateQuestionsFromText(text);
    
    // Add source information to each question
    const questionsWithSource = questions.map(question => ({
      ...question,
      sourceType: 'text',
      sourceText: text.substring(0, 1000), // Store first 1000 chars of source text
      sourceFileName: null
    }));
    
    res.json({ questions: questionsWithSource });
  } catch (error) {
    console.error('Error processing text:', error);
    res.status(500).json({ error: 'Failed to process text' });
  }
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);

// API endpoint to process uploaded files
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const filePath = req.file.path;
    const mimeType = req.file.mimetype;
    
    // Extract text from the uploaded file
    const text = await extractTextFromFile(filePath, mimeType);
    
    // Generate questions from the extracted text
    const questions = generateQuestionsFromText(text);
    
    // Add source information to each question
    const questionsWithSource = questions.map(question => ({
      ...question,
      sourceType: 'file',
      sourceText: text.substring(0, 1000), // Store first 1000 chars of source text
      sourceFileName: req.file.originalname
    }));
    
    // Clean up - delete the uploaded file after processing
    fs.unlinkSync(filePath);
    
    res.json({ questions: questionsWithSource });
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).json({ error: 'Failed to process file: ' + error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});