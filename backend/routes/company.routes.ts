import { Router } from 'express';
import {
  getProfile,
  createOrUpdateProfile,
  createJob,
  getJobs,
  getJobMatches,
  updateMatchStatus,
} from '../controllers/company.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);
router.use(authorize('company'));

router.get('/profile', getProfile);
router.post('/profile', createOrUpdateProfile);
router.post('/jobs', createJob);
router.get('/jobs', getJobs);
router.get('/jobs/:jobId/matches', getJobMatches);
router.put('/jobs/:jobId/matches/:matchId', updateMatchStatus);

export default router;

