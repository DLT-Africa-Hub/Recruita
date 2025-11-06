import { Router } from 'express';
import {
  getProfile,
  createProfile,
  updateProfile,
  createJob,
  getJobs,
  getJob,
  updateJob,
  deleteJob,
  getJobMatches,
  updateMatchStatus,
  getApplications,
} from '../controllers/company.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { strictLimiter, veryStrictLimiter } from '../middleware/rateLimit.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);
router.use(authorize('company'));

// Apply rate limiting based on operation type
// GET operations (database queries) - strict limiter
router.get('/profile', strictLimiter, getProfile);
router.get('/jobs', strictLimiter, getJobs);
router.get('/jobs/:jobId', strictLimiter, getJob);
router.get('/jobs/:jobId/matches', strictLimiter, getJobMatches);
router.get('/applications', strictLimiter, getApplications);

// Write operations (POST/PUT/DELETE) - very strict limiter
router.post('/profile', veryStrictLimiter, createProfile);
router.put('/profile', veryStrictLimiter, updateProfile);
router.post('/jobs', veryStrictLimiter, createJob);
router.put('/jobs/:jobId', veryStrictLimiter, updateJob);
router.delete('/jobs/:jobId', veryStrictLimiter, deleteJob);
router.put('/jobs/:jobId/matches/:matchId', veryStrictLimiter, updateMatchStatus);

export default router;

