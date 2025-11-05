import { Router } from 'express';
import {
  getProfile,
  createOrUpdateProfile,
  submitAssessment,
  getMatches,
} from '../controllers/graduate.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);
router.use(authorize('graduate'));

router.get('/profile', getProfile);
router.post('/profile', createOrUpdateProfile);
router.post('/assessment', submitAssessment);
router.get('/matches', getMatches);

export default router;

