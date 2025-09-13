import express from 'express';
import {
  saveQuestions,
  getQuestions,
  deleteQuestion,
  getQuestionsBySource,
  batchSaveQuestions,
} from '../controllers/questionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/')
  .get(getQuestions)
  .post(saveQuestions);

router.route('/:id').delete(deleteQuestion);

router.route('/source/:sourceType').get(getQuestionsBySource);

router.route('/batch').post(batchSaveQuestions);

export default router;