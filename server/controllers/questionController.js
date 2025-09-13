import Question from '../models/Question.js';

// @desc    Save generated questions
// @route   POST /api/questions
// @access  Private
export const saveQuestions = async (req, res) => {
  try {
    const { questions, sourceText, sourceType, sourceFileName } = req.body;

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: 'No questions provided' });
    }

    // Create questions with user reference
    const savedQuestions = await Promise.all(
      questions.map(async (q) => {
        const questionData = {
          user: req.user._id,
          type: q.type,
          question: q.question,
          sourceText,
          sourceType,
          ...q.answer && { answer: q.answer },
          ...q.originalSentence && { originalSentence: q.originalSentence },
          ...q.context && { context: q.context },
          ...sourceFileName && { sourceFileName }
        };

        return await Question.create(questionData);
      })
    );

    res.status(201).json({
      success: true,
      count: savedQuestions.length,
      data: savedQuestions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Get all questions for a user
// @route   GET /api/questions
// @access  Private
export const getQuestions = async (req, res) => {
  try {
    const questions = await Question.find({ user: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: questions.length,
      data: questions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Delete a question
// @route   DELETE /api/questions/:id
// @access  Private
export const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    // Make sure user owns the question
    if (question.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    await question.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Get questions by source
// @route   GET /api/questions/source/:sourceType
// @access  Private
export const getQuestionsBySource = async (req, res) => {
  try {
    const { sourceType } = req.params;
    
    if (!['text', 'file'].includes(sourceType)) {
      return res.status(400).json({ error: 'Invalid source type' });
    }

    const questions = await Question.find({ 
      user: req.user._id,
      sourceType
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: questions.length,
      data: questions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Batch save multiple questions
// @route   POST /api/questions/batch
// @access  Private
export const batchSaveQuestions = async (req, res) => {
  try {
    const { questions, sourceText, sourceType, sourceFileName } = req.body;

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: 'No questions provided' });
    }

    // Create questions with user reference
    const savedQuestions = await Promise.all(
      questions.map(async (q) => {
        const questionData = {
          user: req.user._id,
          type: q.type,
          question: q.question,
          sourceText: sourceText || 'Text input',
          sourceType: sourceType || 'text',
          ...q.answer && { answer: q.answer },
          ...q.originalSentence && { originalSentence: q.originalSentence },
          ...q.context && { context: q.context },
          ...sourceFileName && { sourceFileName }
        };

        return await Question.create(questionData);
      })
    );

    res.status(201).json({
      success: true,
      count: savedQuestions.length,
      data: savedQuestions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};