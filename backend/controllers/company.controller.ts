import { Request, Response } from 'express';
import Company from '../models/Company.model';
import Job from '../models/Job.model';
import Match from '../models/Match.model';
import { generateEmbedding, findMatches } from '../services/aiService';

/**
 * Get company profile
 * GET /api/companies/profile
 */
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const company = await Company.findOne({ userId }).populate('userId', 'email');
    
    if (!company) {
      res.status(404).json({ message: 'Profile not found' });
      return;
    }

    res.json(company);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Create or update company profile
 * POST /api/companies/profile
 */
export const createOrUpdateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { companyName, industry, description, website } = req.body;

    // TODO: Validate input data

    const company = await Company.findOneAndUpdate(
      { userId },
      {
        companyName,
        industry,
        description,
        website,
      },
      { new: true, upsert: true }
    );

    res.json({
      message: 'Profile updated successfully',
      company,
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Create a new job posting
 * POST /api/companies/jobs
 */
export const createJob = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const company = await Company.findOne({ userId });
    if (!company) {
      res.status(404).json({ message: 'Company profile not found' });
      return;
    }

    const { title, description, requirements, location, salary } = req.body;

    // TODO: Validate input data

    // Generate embedding for job description
    const jobText = `
      Title: ${title}
      Description: ${description}
      Required Skills: ${requirements.skills?.join(', ') || ''}
      Education: ${requirements.education || ''}
      Experience: ${requirements.experience || ''}
    `;

    const embedding = await generateEmbedding(jobText);

    const job = new Job({
      companyId: company._id,
      title,
      description,
      requirements,
      location,
      salary,
      embedding,
    });

    await job.save();

    // TODO: Trigger matching process with all graduates who have submitted assessments

    res.status(201).json({
      message: 'Job created successfully',
      job,
    });
  } catch (error) {
    console.error('Job creation error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get all jobs for company
 * GET /api/companies/jobs
 */
export const getJobs = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const company = await Company.findOne({ userId });
    if (!company) {
      res.status(404).json({ message: 'Company profile not found' });
      return;
    }

    const jobs = await Job.find({ companyId: company._id }).sort({ createdAt: -1 });

    res.json({ jobs });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get matches for a specific job
 * GET /api/companies/jobs/:jobId/matches
 */
export const getJobMatches = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { jobId } = req.params;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // TODO: Verify job belongs to company

    const matches = await Match.find({ jobId })
      .populate('graduateId')
      .sort({ score: -1 });

    res.json({ matches });
  } catch (error) {
    console.error('Get job matches error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Accept or reject a match
 * PUT /api/companies/jobs/:jobId/matches/:matchId
 */
export const updateMatchStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { matchId } = req.params;
    const { status } = req.body; // 'accepted' or 'rejected'

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    if (!['accepted', 'rejected'].includes(status)) {
      res.status(400).json({ message: 'Invalid status' });
      return;
    }

    const match = await Match.findByIdAndUpdate(
      matchId,
      { status },
      { new: true }
    );

    if (!match) {
      res.status(404).json({ message: 'Match not found' });
      return;
    }

    // TODO: If rejected, trigger auto-rematch logic
    // If accepted, notify graduate

    res.json({
      message: `Match ${status} successfully`,
      match,
    });
  } catch (error) {
    console.error('Update match status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

