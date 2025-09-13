import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['fill-in-the-blank', 'short-answer'],
    required: true
  },
  question: {
    type: String,
    required: true
  },
  answer: {
    type: String,
    // Not required for short-answer questions
  },
  originalSentence: {
    type: String,
    // Only for fill-in-the-blank questions
  },
  context: {
    type: String,
    // Only for short-answer questions
  },
  sourceText: {
    type: String,
    // Original text that was used to generate this question
  },
  sourceType: {
    type: String,
    enum: ['text', 'file'],
    required: true
  },
  sourceFileName: {
    type: String,
    // Only if sourceType is 'file'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Question = mongoose.model('Question', questionSchema);

export default Question;