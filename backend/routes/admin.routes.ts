import { Router } from 'express';
import {
  getAllUsers,
  getAllJobs,
  getAllMatches,
  getAIStats,
  deleteUser,
} from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

router.get('/users', getAllUsers);
router.delete('/users/:userId', deleteUser);
router.get('/jobs', getAllJobs);
router.get('/matches', getAllMatches);
router.get('/ai-stats', getAIStats);

export default router;

