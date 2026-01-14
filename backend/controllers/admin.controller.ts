import crypto from 'crypto';
import axios from 'axios';
import mongoose, { FilterQuery } from 'mongoose';
import { Request, Response } from 'express';
import User, { IUser } from '../models/User.model';
import Job, { IJob } from '../models/Job.model';
import Match, { IMatch } from '../models/Match.model';
import Graduate, { IGraduate } from '../models/Graduate.model';
import Company from '../models/Company.model';
import Application, { IApplication } from '../models/Application.model';
import MessageModel from '../models/Message.model';
import Interview from '../models/Interview.model';
import Offer from '../models/Offer.model';
import {
  buildPaginationMeta,
  parsePaginationParams,
} from '../utils/pagination.utils';
import { calendlyConfig } from '../config/secrets';
import calendlyService from '../services/calendly.service';
import Token, { TOKEN_TYPES } from '../models/Token.model';
import { hashToken, calculateExpiryDate } from '../utils/security.utils';
import { createNotification } from '../services/notification.service';

const CLIENT_BASE_URL =
  process.env.CLIENT_URL || process.env.APP_URL || 'http://localhost:5174';

// Type definitions for populated data
interface PopulatedJob {
  _id: mongoose.Types.ObjectId;
  title: string;
  directContact: boolean;
  companyId: mongoose.Types.ObjectId | PopulatedCompany;
}

interface PopulatedCompany {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  companyName: string;
}

interface PopulatedGraduate {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
}

const sanitizeQueryString = (value: unknown): string | null => {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const mapUserResponse = (user: IUser) => ({
  id: user._id.toString(),
  email: user.email,
  role: user.role,
  emailVerified: user.emailVerified,
  emailVerifiedAt: user.emailVerifiedAt,
  lastLoginAt: user.lastLoginAt,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { page, limit, skip } = parsePaginationParams(req);
    const filters: FilterQuery<IUser> = {};

    const role = sanitizeQueryString(req.query.role);
    if (role) {
      filters.role = role as IUser['role'];
    }

    const emailVerifiedParam = sanitizeQueryString(req.query.emailVerified);
    if (emailVerifiedParam) {
      filters.emailVerified = emailVerifiedParam === 'true';
    }

    const search = sanitizeQueryString(req.query.q ?? req.query.search);
    if (search) {
      const regex = new RegExp(escapeRegExp(search), 'i');
      filters.$or = [{ email: regex }];
    }

    const [users, total] = await Promise.all([
      User.find(filters)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean<IUser[]>(),
      User.countDocuments(filters),
    ]);

    res.success(users.map(mapUserResponse), {
      pagination: buildPaginationMeta(page, limit, total),
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.fail('Internal server error', 500);
  }
};

export const searchUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  const search = sanitizeQueryString(req.query.q ?? req.query.search);
  if (!search) {
    res.fail('Query parameter "q" is required', 400);
    return;
  }

  await getAllUsers(req, res);
};

export const getUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.fail('Invalid userId', 400);
      return;
    }

    const user = await User.findById(userId)
      .select('-password')
      .lean<IUser | null>();
    if (!user) {
      res.fail('User not found', 404);
      return;
    }

    res.success(mapUserResponse(user));
  } catch (error) {
    console.error('Get user detail error:', error);
    res.fail('Internal server error', 500);
  }
};

export const updateUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.fail('Invalid userId', 400);
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.fail('User not found', 404);
      return;
    }

    const { role, email, emailVerified } = req.body as Partial<{
      role: IUser['role'];
      email: string;
      emailVerified: boolean;
    }>;

    let updated = false;

    if (role) {
      if (!['graduate', 'company', 'admin'].includes(role)) {
        res.fail('Invalid role supplied', 400);
        return;
      }
      if (user.role !== role) {
        user.role = role;
        updated = true;
      }
    }

    if (typeof email === 'string' && email.trim().length > 0) {
      const normalizedEmail = email.trim().toLowerCase();
      if (user.email !== normalizedEmail) {
        const existing = await User.findOne({
          _id: { $ne: user._id },
          email: normalizedEmail,
        }).lean();
        if (existing) {
          res.fail('Email already in use', 409);
          return;
        }
        user.email = normalizedEmail;
        updated = true;
      }
    }

    if (typeof emailVerified === 'boolean') {
      if (user.emailVerified !== emailVerified) {
        user.emailVerified = emailVerified;
        user.emailVerifiedAt = emailVerified ? new Date() : undefined;
        updated = true;
      }
    }

    if (!updated) {
      res.success({
        message: 'No changes applied',
        user: mapUserResponse(user.toObject()),
      });
      return;
    }

    await user.save();

    res.success({
      message: 'User updated successfully',
      user: mapUserResponse(user.toObject()),
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.fail('Internal server error', 500);
  }
};

export const deleteUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.fail('Invalid userId', 400);
      return;
    }

    const deleted = await User.findByIdAndDelete(userId);
    if (!deleted) {
      res.fail('User not found', 404);
      return;
    }

    res.success({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.fail('Internal server error', 500);
  }
};

export const getAllMatches = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { page, limit, skip } = parsePaginationParams(req);
    const filters: FilterQuery<IMatch> = {};

    const status = sanitizeQueryString(req.query.status);
    if (status) {
      filters.status = status as IMatch['status'];
    }

    const graduateId = sanitizeQueryString(req.query.graduateId);
    if (graduateId && mongoose.Types.ObjectId.isValid(graduateId)) {
      filters.graduateId = new mongoose.Types.ObjectId(graduateId);
    }

    const jobId = sanitizeQueryString(req.query.jobId);
    if (jobId && mongoose.Types.ObjectId.isValid(jobId)) {
      filters.jobId = new mongoose.Types.ObjectId(jobId);
    }

    const [matches, total] = await Promise.all([
      Match.find(filters)
        .populate('graduateId', 'firstName lastName userId')
        .populate('jobId', 'title companyId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Match.countDocuments(filters),
    ]);

    res.success(matches, {
      pagination: buildPaginationMeta(page, limit, total),
    });
  } catch (error) {
    console.error('Get matches error:', error);
    res.fail('Internal server error', 500);
  }
};

export const getAIStats = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const [
      totalMatches,
      averageMatchScoreAgg,
      totalEmbeddings,
      totalFeedback,
      activeJobs,
      closedJobs,
    ] = await Promise.all([
      Match.countDocuments(),
      Match.aggregate<{ averageScore: number }>([
        {
          $group: {
            _id: null,
            averageScore: { $avg: '$score' },
          },
        },
      ]),
      Graduate.countDocuments({
        'assessmentData.embedding.0': { $exists: true },
      }),
      Graduate.countDocuments({
        'assessmentData.feedback': { $exists: true, $nin: [null, ''] },
      }),
      Job.countDocuments({ status: 'active' }),
      Job.countDocuments({ status: 'closed' }),
    ]);

    const averageMatchScore = averageMatchScoreAgg[0]?.averageScore ?? 0;

    res.success({
      totalMatches,
      averageMatchScore,
      totalEmbeddings,
      totalFeedback,
      jobs: {
        active: activeJobs,
        closed: closedJobs,
      },
    });
  } catch (error) {
    console.error('Get AI stats error:', error);
    res.fail('Internal server error', 500);
  }
};

export const getSystemStats = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const [
      totalUsers,
      totalGraduates,
      totalCompanies,
      totalJobs,
      totalMatches,
      totalApplications,
    ] = await Promise.all([
      User.countDocuments(),
      Graduate.countDocuments(),
      Company.countDocuments(),
      Job.countDocuments(),
      Match.countDocuments(),
      Application.countDocuments(),
    ]);

    res.success({
      totals: {
        users: totalUsers,
        graduates: totalGraduates,
        companies: totalCompanies,
        jobs: totalJobs,
        matches: totalMatches,
        applications: totalApplications,
      },
      uptimeSeconds: process.uptime(),
      process: {
        pid: process.pid,
        memory: process.memoryUsage(),
      },
      database: {
        name: mongoose.connection.db?.databaseName ?? null,
        state: mongoose.connection.readyState,
      },
    });
  } catch (error) {
    console.error('Get system stats error:', error);
    res.fail('Internal server error', 500);
  }
};

export const getUserActivityLogs = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const [recentUsers, recentJobs, recentMatches, recentApplications] =
      await Promise.all([
        User.find().sort({ createdAt: -1 }).limit(5).lean<IUser[]>(),
        Job.find().sort({ createdAt: -1 }).limit(5).lean<IJob[]>(),
        Match.find().sort({ updatedAt: -1 }).limit(5).lean<IMatch[]>(),
        Application.find()
          .sort({ updatedAt: -1 })
          .limit(5)
          .lean<IApplication[]>(),
      ]);

    const logs = [
      ...recentUsers.map((user) => ({
        type: 'user',
        action: 'created',
        timestamp: user.createdAt,
        summary: `User ${user.email} (${user.role}) registered`,
        metadata: { userId: user._id },
      })),
      ...recentJobs.map((job) => ({
        type: 'job',
        action: 'created',
        timestamp: job.createdAt,
        summary: `Job "${job.title}" created`,
        metadata: { jobId: job._id, companyId: job.companyId },
      })),
      ...recentMatches.map((match) => ({
        type: 'match',
        action: 'updated',
        timestamp: match.updatedAt,
        summary: `Match ${match._id?.toString()} status ${match.status}`,
        metadata: {
          matchId: match._id,
          graduateId: match.graduateId,
          jobId: match.jobId,
        },
      })),
      ...recentApplications.map((application) => ({
        type: 'application',
        action: 'updated',
        timestamp: application.updatedAt ?? application.createdAt,
        summary: `Application ${application._id?.toString()} status ${application.status}`,
        metadata: {
          applicationId: application._id,
          graduateId: application.graduateId,
          jobId: application.jobId,
        },
      })),
    ]
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, 20);

    res.success(logs);
  } catch (error) {
    console.error('Get user activity logs error:', error);
    res.fail('Internal server error', 500);
  }
};

export const getHealthStatus = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const memory = process.memoryUsage();
    res.success({
      status: 'ok',
      timestamp: new Date(),
      uptimeSeconds: process.uptime(),
      memory: {
        rss: memory.rss,
        heapTotal: memory.heapTotal,
        heapUsed: memory.heapUsed,
      },
      database: {
        connected: mongoose.connection.readyState === 1,
        name: mongoose.connection.db?.databaseName ?? null,
      },
      versions: {
        node: process.version,
      },
    });
  } catch (error) {
    console.error('Admin health error:', error);
    res.fail('Internal server error', 500);
  }
};

/**
 * Get AI service health status
 * GET /api/admin/ai-health
 */
export const getAIHealthStatus = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const axios = (await import('axios')).default;
    const { aiConfig } = await import('../config/secrets');

    const startTime = Date.now();
    let responseTime: number | null = null;
    let status = 'error';
    let message = 'AI Service is unreachable';
    let openaiConfigured = false;

    try {
      const response = await axios.get(`${aiConfig.serviceUrl}/health`, {
        timeout: 5000, // 5 second timeout
      });

      responseTime = Date.now() - startTime;

      if (response.status === 200 && response.data) {
        status = response.data.status === 'ok' ? 'ok' : 'error';
        message = response.data.message || 'AI Service is running';
        openaiConfigured = response.data.openai_configured || false;
      }
    } catch (error: any) {
      responseTime = Date.now() - startTime;
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        message = 'AI Service connection failed';
      } else if (error.response) {
        status = 'error';
        message = `AI Service returned error: ${error.response.status}`;
      }
    }

    res.success({
      status,
      message,
      responseTime: responseTime !== null ? `${responseTime}ms` : null,
      openaiConfigured,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('AI health check error:', error);
    res.fail('Internal server error', 500);
  }
};

/**
 * Get rank statistics for all graduates
 * GET /api/admin/rank-statistics
 */
export const getRankStatistics = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    // Get rank distribution for statistics
    const rankDistribution = await Graduate.aggregate([
      { $match: { rank: { $exists: true, $ne: null } } },
      {
        $group: {
          _id: '$rank',
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const totalWithRank = rankDistribution.reduce(
      (sum, item) => sum + item.count,
      0
    );

    const rankStats = rankDistribution.reduce(
      (acc, item) => {
        acc[item._id] = {
          count: item.count,
          percentage:
            totalWithRank > 0
              ? Math.round((item.count / totalWithRank) * 100)
              : 0,
        };
        return acc;
      },
      {} as Record<string, { count: number; percentage: number }>
    );

    res.json({
      rankStatistics: rankStats,
      total: totalWithRank,
    });
  } catch (error) {
    console.error('Error fetching rank statistics:', error);
    res.status(500).json({ message: 'Failed to fetch rank statistics' });
  }
};

export const getDatabaseStats = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const db = mongoose.connection.db;
    if (!db) {
      res.fail('Database connection not initialized', 503);
      return;
    }

    const stats = await db.command({ dbStats: 1, scale: 1024 });
    res.success(stats);
  } catch (error) {
    console.error('Database stats error:', error);
    res.fail('Internal server error', 500);
  }
};

export const getGraduatesCount = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const total = await Graduate.countDocuments();

    res.success({
      total,
    });
  } catch (error) {
    console.error('Get all graduates error:', error);
    res.fail('Internal server error', 500);
  }
};

export const getCompanyCount = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const total = await Company.countDocuments();

    res.success({
      total,
    });
  } catch (error) {
    console.error('Get all graduates error:', error);
    res.fail('Internal server error', 500);
  }
};

export const getActiveJobsCount = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const total = await Job.countDocuments({ status: 'active' });

    res.success({
      total,
    });
  } catch (error) {
    console.error('Get active jobs count error:', error);
    res.fail('Internal server error', 500);
  }
};

export const getApplicationActivityDetail = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { jobId, graduateId } = req.query;

    if (!jobId || !graduateId) {
      res.fail('jobId and graduateId are required', 400);
      return;
    }

    const jobIdString = typeof jobId === 'string' ? jobId : String(jobId);
    const graduateIdString =
      typeof graduateId === 'string' ? graduateId : String(graduateId);

    if (!mongoose.Types.ObjectId.isValid(jobIdString)) {
      res.fail('Invalid jobId', 400);
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(graduateIdString)) {
      res.fail('Invalid graduateId', 400);
      return;
    }

    const graduate = await Graduate.findById(graduateIdString)
      .select('firstName lastName')
      .lean();

    if (!graduate) {
      res.fail('Graduate not found', 404);
      return;
    }

    const job = await Job.findById(jobIdString)
      .select('title companyId')
      .populate('companyId', 'companyName')
      .lean();

    if (!job) {
      res.fail('Job not found', 404);
      return;
    }

    const company = job.companyId as unknown as { companyName: string } | null;

    if (!company) {
      res.fail('Company not found', 404);
      return;
    }

    const graduateName = `${graduate.firstName} ${graduate.lastName}`;

    res.success({
      graduateName,
      jobTitle: job.title,
      companyName: company.companyName,
    });
  } catch (error) {
    console.error('Get application activity detail error:', error);
    res.fail('Internal server error', 500);
  }
};

export const getCompanyById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { companyId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(companyId)) {
      res.fail('Invalid companyId', 400);
      return;
    }

    const company = await Company.findById(companyId).lean();

    if (!company) {
      res.fail('Company not found', 404);
      return;
    }

    res.success(company);
  } catch (error) {
    console.error('Get company by id error:', error);
    res.fail('Internal server error', 500);
  }
};

export const companiesStatsProvider = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { page, limit, skip } = parsePaginationParams(req);

    const filters: FilterQuery<any> = {
      postedJobs: { $gte: 1 },
    };

    const [companies, total] = await Promise.all([
      Company.find(filters)
        .select('_id postedJobs hiredCandidates companyName')
        .sort({ postedJobs: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Company.countDocuments(filters),
    ]);

    res.success(companies, {
      pagination: buildPaginationMeta(page, limit, total),
    });
  } catch (error) {
    console.error('Companies stats provider error:', error);
    res.fail('Internal server error', 500);
  }
};

export const getAllGraduates = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { page, limit, skip } = parsePaginationParams(req);

    const filters: FilterQuery<IGraduate> = {};

    // ✅ Exact filters
    const rank = sanitizeQueryString(req.query.rank);
    if (rank) {
      filters.rank = rank;
    }

    const position = sanitizeQueryString(req.query.position);
    if (position) {
      // Position is now an array, use $elemMatch to search within it
      filters.position = { $elemMatch: { $eq: position } };
    }

    const location = sanitizeQueryString(req.query.location);
    if (location) {
      filters.location = location;
    }

    // ✅ Search (name, rank, position, location)
    const search = sanitizeQueryString(req.query.q ?? req.query.search);
    if (search) {
      const regex = new RegExp(escapeRegExp(search), 'i');

      filters.$or = [
        { firstName: regex },
        { lastName: regex },
        { rank: regex },
        { position: { $elemMatch: regex } }, // Search within position array
        { location: regex },
      ];
    }

    const [graduates, total] = await Promise.all([
      Graduate.find(filters)
        .select(
          '_id firstName lastName skills position rank expLevel profilePictureUrl location'
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean<IGraduate[]>(),
      Graduate.countDocuments(filters),
    ]);

    const formattedGraduates = graduates.map((graduate) => ({
      _id: graduate._id,
      name: `${graduate.firstName} ${graduate.lastName}`,
      skills: graduate.skills,
      position: graduate.position,
      rank: graduate.rank ?? null,
      expLevel: graduate.expLevel,
      profilePictureUrl: graduate.profilePictureUrl ?? null,
      location: graduate.location ?? null,
    }));

    res.success(formattedGraduates, {
      pagination: buildPaginationMeta(page, limit, total),
    });
  } catch (error) {
    console.error('Get all graduates error:', error);
    res.fail('Internal server error', 500);
  }
};

export const getGraduateById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { graduateId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(graduateId)) {
      res.fail('Invalid graduateId', 400);
      return;
    }

    const graduate = await Graduate.findById(graduateId).lean();

    if (!graduate) {
      res.fail('Graduate not found', 404);
      return;
    }

    res.success(graduate);
  } catch (error) {
    console.error('Get graduate by ID error:', error);
    res.fail('Internal server error', 500);
  }
};

export const getAllCompanies = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { page, limit, skip } = parsePaginationParams(req);
    const filters: FilterQuery<any> = {};

    // Filter by industry
    const industry = sanitizeQueryString(req.query.industry);
    if (industry) {
      filters.industry = industry;
    }

    // Filter by company size (range)
    const minSize = sanitizeQueryString(req.query.minSize);
    const maxSize = sanitizeQueryString(req.query.maxSize);
    if (minSize || maxSize) {
      filters.companySize = {};
      if (minSize) filters.companySize.$gte = parseInt(minSize);
      if (maxSize) filters.companySize.$lte = parseInt(maxSize);
    }

    // Filter by location
    const location = sanitizeQueryString(req.query.location);
    if (location) {
      const regex = new RegExp(escapeRegExp(location), 'i');
      filters.location = regex;
    }

    // Search by company name
    const search = sanitizeQueryString(req.query.q ?? req.query.search);
    if (search) {
      const regex = new RegExp(escapeRegExp(search), 'i');
      filters.companyName = regex;
    }

    // Get companies with their user status
    const [companies, total] = await Promise.all([
      Company.find(filters)
        .populate('userId', 'emailVerified createdAt')
        .select(
          '_id companyName industry companySize location postedJobs hiredCandidates userId createdAt'
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Company.countDocuments(filters),
    ]);

    // Format response with status derived from user emailVerified
    const formattedCompanies = companies.map((company) => {
      const user = company.userId;
      let status: 'Active' | 'Pending' | 'Suspended' = 'Pending';

      if (
        user &&
        typeof user === 'object' &&
        !(user instanceof mongoose.Types.ObjectId)
      ) {
        const userObj = user as { emailVerified?: boolean };
        if (userObj.emailVerified) {
          status = 'Active';
        }
      }

      return {
        id: company._id.toString(),
        name: company.companyName,
        industry: company.industry,
        size: company.companySize,
        location: company.location || 'Not specified',
        jobs: company.postedJobs || 0,
        candidates: Array.isArray(company.hiredCandidates)
          ? company.hiredCandidates.length
          : 0,
        status,
        joined: company.createdAt,
        userId: user?._id?.toString(),
      };
    });

    res.success(formattedCompanies, {
      pagination: buildPaginationMeta(page, limit, total),
    });
  } catch (error) {
    console.error('Get all companies error:', error);
    res.fail('Internal server error', 500);
  }
};

export const getCompanyDetails = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { companyId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(companyId)) {
      res.fail('Invalid companyId', 400);
      return;
    }

    // Get company with user info
    const company = await Company.findById(companyId)
      .populate('userId', 'email emailVerified createdAt lastLoginAt')
      .lean();

    if (!company) {
      res.fail('Company not found', 404);
      return;
    }

    // Get company's jobs
    const jobs = await Job.find({ companyId: company._id })
      .select('title status createdAt location salary')
      .sort({ createdAt: -1 })
      .lean();

    // Get applications for company's jobs
    const jobIds = jobs.map((job) => job._id);
    const applications = await Application.find({ jobId: { $in: jobIds } })
      .populate('graduateId', 'firstName lastName')
      .populate('jobId', 'title')
      .select('status createdAt updatedAt')
      .sort({ createdAt: -1 })
      .lean();

    const userId = company.userId;
    const user =
      userId &&
      typeof userId === 'object' &&
      !(userId instanceof mongoose.Types.ObjectId)
        ? (userId as {
            email?: string;
            emailVerified?: boolean;
            lastLoginAt?: Date;
          })
        : null;

    res.success({
      company: {
        id: company._id.toString(),
        name: company.companyName,
        industry: company.industry,
        size: company.companySize,
        description: company.description,
        website: company.website,
        location: company.location,
        postedJobs: company.postedJobs || 0,
        hiredCandidates: Array.isArray(company.hiredCandidates)
          ? company.hiredCandidates.length
          : 0,
        status: user?.emailVerified ? 'Active' : 'Pending',
        joined: company.createdAt,
        updatedAt: company.updatedAt,
      },
      user: user
        ? {
            email: user.email,
            emailVerified: user.emailVerified,
            lastLogin: user.lastLoginAt,
          }
        : null,
      jobs: jobs.map((job) => ({
        id: job._id.toString(),
        title: job.title,
        status: job.status,
        location: job.location,
        salary: job.salary,
        createdAt: job.createdAt,
      })),
      applications: applications.map((app: any) => ({
        id: app._id.toString(),
        jobTitle: app.jobId?.title,
        candidateName: app.graduateId
          ? `${app.graduateId.firstName} ${app.graduateId.lastName}`
          : 'Unknown',
        status: app.status,
        appliedAt: app.createdAt,
        updatedAt: app.updatedAt,
      })),
      stats: {
        totalJobs: jobs.length,
        activeJobs: jobs.filter((j) => j.status === 'active').length,
        totalApplications: applications.length,
        pendingApplications: applications.filter((a) => a.status === 'pending')
          .length,
      },
    });
  } catch (error) {
    console.error('Get company details error:', error);
    res.fail('Internal server error', 500);
  }
};

export const toggleCompanyStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { companyId } = req.params;
    const { active } = req.body as { active: boolean };

    if (!mongoose.Types.ObjectId.isValid(companyId)) {
      res.fail('Invalid companyId', 400);
      return;
    }

    const company = await Company.findById(companyId).populate('userId');
    if (!company) {
      res.fail('Company not found', 404);
      return;
    }

    const user = await User.findById(company.userId);
    if (!user) {
      res.fail('Associated user not found', 404);
      return;
    }

    // Update user email verification status to activate/deactivate
    user.emailVerified = active;
    user.emailVerifiedAt = active ? new Date() : undefined;
    await user.save();

    const companyIdString =
      company._id && company._id instanceof mongoose.Types.ObjectId
        ? company._id.toString()
        : String(company._id || companyId);

    res.success({
      message: `Company ${active ? 'activated' : 'deactivated'} successfully`,
      company: {
        id: companyIdString,
        name: company.companyName,
        status: active ? 'Active' : 'Suspended',
      },
    });
  } catch (error) {
    console.error('Toggle company status error:', error);
    res.fail('Internal server error', 500);
  }
};

export const getAllJobs = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { page, limit, skip } = parsePaginationParams(req);
    const filters: FilterQuery<IJob> = {};

    // Filter by status
    const status = sanitizeQueryString(req.query.status);
    if (status) {
      filters.status = status as IJob['status'];
    }

    // Filter by company
    const companyId = sanitizeQueryString(req.query.companyId);
    if (companyId && mongoose.Types.ObjectId.isValid(companyId)) {
      filters.companyId = new mongoose.Types.ObjectId(companyId);
    }

    // Filter by job type
    const jobType = sanitizeQueryString(req.query.jobType);
    if (jobType) {
      filters.jobType = jobType as IJob['jobType'];
    }

    // Filter by preferred rank
    const preferedRank = sanitizeQueryString(req.query.preferedRank);
    if (preferedRank) {
      filters.preferedRank = preferedRank as IJob['preferedRank'];
    }

    // Filter by location
    const location = sanitizeQueryString(req.query.location);
    if (location) {
      const regex = new RegExp(escapeRegExp(location), 'i');
      filters.location = regex;
    }

    // Search by title
    const search = sanitizeQueryString(req.query.q ?? req.query.search);
    if (search) {
      const regex = new RegExp(escapeRegExp(search), 'i');
      filters.title = regex;
    }

    const [jobs, total] = await Promise.all([
      Job.find(filters)
        .populate('companyId', 'companyName industry')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Job.countDocuments(filters),
    ]);

    // Get applicant counts for each job
    const jobIds = jobs.map((job) => job._id);
    const applicationCounts = await Application.aggregate([
      { $match: { jobId: { $in: jobIds } } },
      { $group: { _id: '$jobId', count: { $sum: 1 } } },
    ]);

    const countMap = new Map(
      applicationCounts.map((item) => [item._id.toString(), item.count])
    );

    const jobsWithCounts = jobs.map((job) => ({
      ...job,
      applicantsCount: countMap.get(job._id.toString()) || 0,
      views: (job as { views?: number }).views || 0,
    }));

    res.success(jobsWithCounts, {
      pagination: buildPaginationMeta(page, limit, total),
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.fail('Internal server error', 500);
  }
};

/**
 * Get job details by ID
 * GET /api/admin/jobs/:jobId
 */
export const getJobById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { jobId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      res.fail('Invalid jobId', 400);
      return;
    }

    const job = await Job.findById(jobId)
      .populate('companyId', 'companyName industry website location')
      .lean();

    if (!job) {
      res.fail('Job not found', 404);
      return;
    }

    // Get applications for this job
    const applications = await Application.find({ jobId: job._id })
      .populate({
        path: 'graduateId',
        select: 'firstName lastName profilePictureUrl userId',
        populate: {
          path: 'userId',
          select: 'email',
        },
      })
      .populate({
        path: 'interviewId',
        select: 'status scheduledAt durationMinutes',
      })
      .select('status createdAt updatedAt interviewId')
      .sort({ createdAt: -1 })
      .lean();

    const applicationStats = {
      total: applications.length,
      pending: applications.filter((a) => a.status === 'pending').length,
      reviewed: applications.filter((a) => a.status === 'reviewed').length,
      shortlisted: applications.filter((a) => a.status === 'shortlisted')
        .length,
      rejected: applications.filter((a) => a.status === 'rejected').length,
      hired: applications.filter((a) => a.status === 'hired').length,
    };

    res.success({
      job,
      applications: applications.map((app: any) => {
        const graduate = app.graduateId;
        const user = graduate?.userId;
        const email =
          user && typeof user === 'object' && 'email' in user
            ? user.email
            : null;

        const interview = app.interviewId as
          | {
              _id?: mongoose.Types.ObjectId;
              status?: string;
              scheduledAt?: Date;
              durationMinutes?: number;
            }
          | mongoose.Types.ObjectId
          | null
          | undefined;

        const interviewStatus =
          interview &&
          typeof interview === 'object' &&
          !(interview instanceof mongoose.Types.ObjectId) &&
          'status' in interview
            ? interview.status
            : null;

        return {
          id: app._id.toString(),
          candidate: graduate
            ? {
                id: graduate._id.toString(),
                name: `${graduate.firstName} ${graduate.lastName}`,
                email: email || 'No email',
                profilePicture: graduate.profilePictureUrl,
              }
            : null,
          status: app.status,
          interviewStatus: interviewStatus,
          appliedAt: app.createdAt,
          updatedAt: app.updatedAt,
        };
      }),
      stats: applicationStats,
    });
  } catch (error) {
    console.error('Get job by ID error:', error);
    res.fail('Internal server error', 500);
  }
};

/**
 * Update job status (activate/deactivate)
 * PUT /api/admin/jobs/:jobId/status
 */
export const updateJobStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { jobId } = req.params;
    const { status } = req.body as { status: IJob['status'] };

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      res.fail('Invalid jobId', 400);
      return;
    }

    if (
      typeof status !== 'string' ||
      !['active', 'closed', 'draft'].includes(status)
    ) {
      res.fail('Invalid status. Must be active, closed, or draft', 400);
      return;
    }

    const job = await Job.findByIdAndUpdate(
      jobId,
      { status },
      { new: true, runValidators: true }
    )
      .populate('companyId', 'companyName')
      .lean();

    if (!job) {
      res.fail('Job not found', 404);
      return;
    }

    const companyId = job.companyId;
    const companyName =
      companyId &&
      typeof companyId === 'object' &&
      !(companyId instanceof mongoose.Types.ObjectId)
        ? (companyId as { companyName: string }).companyName
        : 'Unknown';

    res.success({
      message: `Job status updated to ${status} successfully`,
      job: {
        id: job._id.toString(),
        title: job.title,
        company: companyName,
        status: job.status,
      },
    });
  } catch (error) {
    console.error('Update job status error:', error);
    res.fail('Internal server error', 500);
  }
};

/**
 * Update job details
 * PUT /api/admin/jobs/:jobId
 */
export const updateJob = async (req: Request, res: Response): Promise<void> => {
  try {
    const { jobId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      res.fail('Invalid jobId', 400);
      return;
    }

    const job = await Job.findById(jobId);
    if (!job) {
      res.fail('Job not found', 404);
      return;
    }

    const {
      title,
      jobType,
      description,
      requirements,
      location,
      salary,
      preferedRank,
      status,
      directContact,
    } = req.body as Partial<IJob>;

    let updated = false;

    if (title && title.trim()) {
      job.title = title.trim();
      updated = true;
    }

    if (jobType) {
      if (
        !['Full time', 'Part time', 'Contract', 'Internship'].includes(jobType)
      ) {
        res.fail('Invalid job type', 400);
        return;
      }
      job.jobType = jobType;
      updated = true;
    }

    if (description) {
      job.description = description;
      updated = true;
    }

    if (requirements) {
      job.requirements = requirements;
      updated = true;
    }

    if (location !== undefined) {
      job.location = location;
      updated = true;
    }

    if (salary !== undefined) {
      job.salary = salary;
      updated = true;
    }

    if (preferedRank) {
      if (
        !['A', 'B', 'C', 'D', 'A and B', 'B and C', 'C and D'].includes(
          preferedRank
        )
      ) {
        res.fail('Invalid preferred rank', 400);
        return;
      }
      job.preferedRank = preferedRank;
      updated = true;
    }

    if (status) {
      if (!['active', 'closed', 'draft'].includes(status)) {
        res.fail('Invalid status', 400);
        return;
      }
      job.status = status;
      updated = true;
    }

    if (typeof directContact === 'boolean') {
      job.directContact = directContact;
      updated = true;
    }

    if (!updated) {
      res.success({
        message: 'No changes applied',
        job: job.toObject(),
      });
      return;
    }

    await job.save();

    res.success({
      message: 'Job updated successfully',
      job: job.toObject(),
    });
  } catch (error) {
    console.error('Update job error:', error);
    res.fail('Internal server error', 500);
  }
};

/**
 * Delete a job
 * DELETE /api/admin/jobs/:jobId
 */
export const deleteJob = async (req: Request, res: Response): Promise<void> => {
  try {
    const { jobId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      res.fail('Invalid jobId', 400);
      return;
    }

    // Check if job has applications
    const applicationCount = await Application.countDocuments({ jobId });
    if (applicationCount > 0) {
      res.fail(
        'Cannot delete job with existing applications. Please close the job instead.',
        400
      );
      return;
    }

    const deleted = await Job.findByIdAndDelete(jobId);
    if (!deleted) {
      res.fail('Job not found', 404);
      return;
    }

    res.success({ message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Delete job error:', error);
    res.fail('Internal server error', 500);
  }
};

/**
 * Get job statistics
 * GET /api/admin/jobs/statistics
 */
export const getJobStatistics = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const [
      totalJobs,
      activeJobs,
      closedJobs,
      draftJobs,
      jobsByType,
      jobsByRank,
      topCompaniesByJobs,
    ] = await Promise.all([
      Job.countDocuments(),
      Job.countDocuments({ status: 'active' }),
      Job.countDocuments({ status: 'closed' }),
      Job.countDocuments({ status: 'draft' }),
      Job.aggregate([
        {
          $group: {
            _id: '$jobType',
            count: { $sum: 1 },
          },
        },
      ]),
      Job.aggregate([
        {
          $group: {
            _id: '$preferedRank',
            count: { $sum: 1 },
          },
        },
      ]),
      Job.aggregate([
        {
          $group: {
            _id: '$companyId',
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'companies',
            localField: '_id',
            foreignField: '_id',
            as: 'company',
          },
        },
        { $unwind: '$company' },
        {
          $project: {
            companyName: '$company.companyName',
            jobCount: '$count',
          },
        },
      ]),
    ]);

    res.success({
      totals: {
        all: totalJobs,
        active: activeJobs,
        closed: closedJobs,
        draft: draftJobs,
      },
      byType: jobsByType.reduce(
        (acc, item) => {
          acc[item._id] = item.count;
          return acc;
        },
        {} as Record<string, number>
      ),
      byRank: jobsByRank.reduce(
        (acc, item) => {
          acc[item._id] = item.count;
          return acc;
        },
        {} as Record<string, number>
      ),
      topCompanies: topCompaniesByJobs,
    });
  } catch (error) {
    console.error('Get job statistics error:', error);
    res.fail('Internal server error', 500);
  }
};

/**
 * Get applications for a specific job
 * GET /api/admin/jobs/:jobId/applications
 */
export const getJobApplications = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { jobId } = req.params;
    const { page, limit, skip } = parsePaginationParams(req);

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      res.fail('Invalid jobId', 400);
      return;
    }

    const filters: FilterQuery<any> = { jobId };

    // Filter by status
    const status = sanitizeQueryString(req.query.status);
    if (status) {
      filters.status = status;
    }

    const [applications, total] = await Promise.all([
      Application.find(filters)
        .populate(
          'graduateId',
          'firstName lastName email profilePictureUrl rank position userId'
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Application.countDocuments(filters),
    ]);

    res.success(
      applications.map((app) => {
        const graduateId = app.graduateId;
        const graduateData =
          graduateId &&
          typeof graduateId === 'object' &&
          !(graduateId instanceof mongoose.Types.ObjectId)
            ? (graduateId as {
                _id: mongoose.Types.ObjectId;
                firstName: string;
                lastName: string;
                email: string;
                profilePictureUrl?: string;
                rank?: string;
                position?: string;
              })
            : null;

        return {
          id: app._id.toString(),
          candidate: graduateData
            ? {
                id: graduateData._id.toString(),
                name: `${graduateData.firstName} ${graduateData.lastName}`,
                email: graduateData.email,
                profilePicture: graduateData.profilePictureUrl,
                rank: graduateData.rank,
                position: graduateData.position,
              }
            : null,
          status: app.status,
          resume: app.resume || null,
          appliedAt: app.createdAt,
          updatedAt: app.updatedAt,
        };
      }),
      {
        pagination: buildPaginationMeta(page, limit, total),
      }
    );
  } catch (error) {
    console.error('Get job applications error:', error);
    res.fail('Internal server error', 500);
  }
};

/**
 * Send a message from admin to an applicant
 * POST /api/admin/applications/:applicationId/message
 */
export const sendMessageToApplicant = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.fail('Unauthorized', 401);
      return;
    }

    const { applicationId } = req.params;
    const { message } = req.body;

    if (!mongoose.Types.ObjectId.isValid(applicationId)) {
      res.fail('Invalid application ID', 400);
      return;
    }

    if (!message || typeof message !== 'string' || !message.trim()) {
      res.fail('Message is required', 400);
      return;
    }

    // Get application with graduate info
    const application = await Application.findById(applicationId)
      .populate({
        path: 'graduateId',
        select: 'userId firstName lastName',
      })
      .populate({
        path: 'jobId',
        select: 'title directContact companyId',
      })
      .lean();

    if (!application) {
      res.fail('Application not found', 404);
      return;
    }

    // Verify job is handled by admin (directContact is false)
    const job = application.jobId as PopulatedJob | mongoose.Types.ObjectId;
    const jobData =
      typeof job === 'object' &&
      job &&
      !(job instanceof mongoose.Types.ObjectId)
        ? job
        : null;

    if (!jobData || jobData.directContact !== false) {
      res.fail(
        'This job is not managed by DLT Africa. Only jobs with admin handling can be messaged by admins.',
        403
      );
      return;
    }

    const graduate = application.graduateId as
      | PopulatedGraduate
      | mongoose.Types.ObjectId;
    const graduateData =
      typeof graduate === 'object' &&
      graduate &&
      !(graduate instanceof mongoose.Types.ObjectId)
        ? graduate
        : null;
    if (!graduateData?.userId) {
      res.fail('Graduate profile is missing a linked user account', 400);
      return;
    }

    const graduateUserId =
      graduateData.userId instanceof mongoose.Types.ObjectId
        ? graduateData.userId
        : new mongoose.Types.ObjectId(String(graduateData.userId));

    const adminUserId = new mongoose.Types.ObjectId(userId);

    // Create message from admin to graduate
    const newMessage = await MessageModel.create({
      senderId: adminUserId,
      receiverId: graduateUserId,
      message: message.trim(),
      type: 'text',
      applicationId: new mongoose.Types.ObjectId(applicationId),
    });

    res.success(newMessage, { message: 'Message sent successfully' });
  } catch (error) {
    console.error('Send message to applicant error:', error);
    res.fail('Internal server error', 500);
  }
};

/**
 * Get Calendly OAuth authorization URL (Admin)
 * GET /api/admin/calendly/connect
 */
export const getAdminCalendlyAuthUrl = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    if (!calendlyConfig.enabled) {
      res.status(503).json({
        message: 'Calendly integration is not configured',
      });
      return;
    }

    if (!calendlyConfig.clientId || !calendlyConfig.redirectUri) {
      res.status(500).json({
        message: 'Calendly OAuth configuration is incomplete',
      });
      return;
    }

    // Generate state parameter for CSRF protection
    const state = crypto.randomBytes(32).toString('hex');
    const stateHash = hashToken(state);

    // Store state with user ID for callback verification (expires in 10 minutes)
    await Token.create({
      user: userId,
      tokenHash: stateHash,
      type: TOKEN_TYPES.CALENDLY_OAUTH_STATE,
      expiresAt: calculateExpiryDate(10 * 60 * 1000), // 10 minutes
      metadata: { userId: userId.toString() },
    });

    // Use admin-specific redirect URI (replace /companies/ with /admin/ if present, or append /admin/)
    let adminRedirectUri = calendlyConfig.redirectUri;
    if (adminRedirectUri.includes('/companies/')) {
      adminRedirectUri = adminRedirectUri.replace('/companies/', '/admin/');
    } else {
      // If redirect URI doesn't have /companies/, append /admin/ before the last segment
      const lastSlashIndex = adminRedirectUri.lastIndexOf('/');
      if (lastSlashIndex > 0) {
        adminRedirectUri =
          adminRedirectUri.substring(0, lastSlashIndex) +
          '/admin' +
          adminRedirectUri.substring(lastSlashIndex);
      }
    }

    const authUrl = new URL('https://auth.calendly.com/oauth/authorize');
    authUrl.searchParams.append('client_id', calendlyConfig.clientId);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('redirect_uri', adminRedirectUri);
    authUrl.searchParams.append('state', state);
    authUrl.searchParams.append('scope', 'default');

    res.json({
      authUrl: authUrl.toString(),
      state,
    });
  } catch (error) {
    console.error('Get Admin Calendly auth URL error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Handle Calendly OAuth callback (Admin)
 * GET /api/admin/calendly/callback
 */
export const adminCalendlyOAuthCallback = async (
  req: Request,
  res: Response
): Promise<void> => {
  const redirectToProfile = (success: boolean, message?: string) => {
    const trimmedBase = CLIENT_BASE_URL.replace(/\/+$/, '');
    const params = new URLSearchParams();

    if (success) {
      params.append('calendly', 'connected');
    } else {
      params.append('calendly', 'error');
      if (message) {
        params.append('message', encodeURIComponent(message));
      }
    }

    const redirectUrl = `${trimmedBase}/admin/profile?${params.toString()}`;
    res.redirect(redirectUrl);
  };

  try {
    const { code, state } = req.query;

    if (!state || typeof state !== 'string') {
      redirectToProfile(false, 'Missing state parameter');
      return;
    }

    // Look up user by state token
    const stateHash = hashToken(state);
    const stateToken = await Token.findOne({
      tokenHash: stateHash,
      type: TOKEN_TYPES.CALENDLY_OAUTH_STATE,
      consumedAt: { $exists: false },
      expiresAt: { $gt: new Date() },
    });

    if (!stateToken || !stateToken.isActive()) {
      redirectToProfile(false, 'Invalid or expired state parameter');
      return;
    }

    const userId = stateToken.user;

    // Consume the state token
    stateToken.consumedAt = new Date();
    await stateToken.save();

    if (!code || typeof code !== 'string') {
      redirectToProfile(false, 'Authorization code is required');
      return;
    }

    if (
      !calendlyConfig.clientId ||
      !calendlyConfig.clientSecret ||
      !calendlyConfig.redirectUri
    ) {
      redirectToProfile(false, 'Calendly OAuth configuration is incomplete');
      return;
    }

    // Exchange authorization code for access token
    // Use the same redirect URI format as in getAdminCalendlyAuthUrl
    let adminRedirectUri = calendlyConfig.redirectUri;
    if (adminRedirectUri.includes('/companies/')) {
      adminRedirectUri = adminRedirectUri.replace('/companies/', '/admin/');
    } else {
      const lastSlashIndex = adminRedirectUri.lastIndexOf('/');
      if (lastSlashIndex > 0) {
        adminRedirectUri =
          adminRedirectUri.substring(0, lastSlashIndex) +
          '/admin' +
          adminRedirectUri.substring(lastSlashIndex);
      }
    }

    const tokenResponse = await axios.post(
      'https://auth.calendly.com/oauth/token',
      {
        grant_type: 'authorization_code',
        client_id: calendlyConfig.clientId,
        client_secret: calendlyConfig.clientSecret,
        code,
        redirect_uri: adminRedirectUri,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const { access_token, refresh_token, expires_in } = tokenResponse.data;

    if (!access_token) {
      redirectToProfile(false, 'Failed to obtain access token');
      return;
    }

    // Get user information from Calendly
    const userInfo = await calendlyService.getCurrentUser(
      calendlyService.encryptToken(access_token)
    );

    // Find admin user
    const user = await User.findById(userId);
    if (!user || user.role !== 'admin') {
      redirectToProfile(false, 'Admin user not found');
      return;
    }

    const encryptedAccessToken =
      calendlyService.encryptToken(access_token) || access_token;
    const encryptedRefreshToken = refresh_token
      ? calendlyService.encryptToken(refresh_token) || refresh_token
      : undefined;

    const tokenExpiresAt = expires_in
      ? new Date(Date.now() + expires_in * 1000)
      : undefined;

    const userDoc = await User.findById(user._id).select(
      '+calendly.accessToken +calendly.refreshToken'
    );
    if (!userDoc) {
      redirectToProfile(false, 'Admin user not found');
      return;
    }

    // Initialize calendly object if it doesn't exist
    if (!userDoc.calendly) {
      userDoc.calendly = {
        enabled: false,
      };
    }

    // Set all calendly fields directly on the document
    userDoc.calendly.userUri = userInfo.uri;
    userDoc.calendly.accessToken = encryptedAccessToken;
    userDoc.calendly.tokenExpiresAt = tokenExpiresAt;
    userDoc.calendly.connectedAt = new Date();
    userDoc.calendly.enabled = true;

    if (encryptedRefreshToken) {
      userDoc.calendly.refreshToken = encryptedRefreshToken;
    }

    // Mark the nested calendly object as modified
    userDoc.markModified('calendly');

    // Save the document
    await userDoc.save();

    redirectToProfile(true);
  } catch (error) {
    console.error('Admin Calendly OAuth callback error:', error);
    let errorMessage = 'Internal server error';

    if (axios.isAxiosError(error)) {
      errorMessage =
        error.response?.data?.message || error.message || errorMessage;
    }

    redirectToProfile(false, errorMessage);
  }
};

/**
 * Get Calendly connection status (Admin)
 * GET /api/admin/calendly/status
 */
export const getAdminCalendlyStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Explicitly select calendly fields including accessToken (which has select: false)
    const user = await User.findById(userId).select(
      '+calendly.accessToken +calendly.refreshToken'
    );
    if (!user || user.role !== 'admin') {
      res.status(404).json({ message: 'Admin user not found' });
      return;
    }

    if (!user.calendly?.enabled) {
      res.json({
        connected: false,
        enabled: false,
      });
      return;
    }

    // Try to get user info to verify connection is still valid
    let userInfo = null;
    if (!user.calendly.accessToken) {
      res.json({
        connected: !!user.calendly.userUri,
        enabled: user.calendly.enabled,
        userUri: user.calendly.userUri,
        publicLink: user.calendly.publicLink,
        connectedAt: user.calendly.connectedAt,
        userInfo: null,
      });
      return;
    }

    try {
      // Check if token is expired and refresh if needed
      let accessTokenToUse = user.calendly.accessToken;

      if (
        user.calendly.tokenExpiresAt &&
        user.calendly.tokenExpiresAt < new Date() &&
        user.calendly.refreshToken
      ) {
        try {
          const refreshResult = await calendlyService.refreshAccessToken(
            user.calendly.refreshToken
          );

          // Update user with new tokens
          user.calendly.accessToken = refreshResult.accessToken;
          if (refreshResult.refreshToken) {
            user.calendly.refreshToken = refreshResult.refreshToken;
          }
          if (refreshResult.expiresIn) {
            user.calendly.tokenExpiresAt = new Date(
              Date.now() + refreshResult.expiresIn * 1000
            );
          }
          await user.save();

          accessTokenToUse = refreshResult.accessToken;
        } catch (refreshError) {
          console.warn('Calendly token refresh failed:', refreshError);
          // Continue with original token - it might still work
        }
      }

      userInfo = await calendlyService.getCurrentUser(accessTokenToUse);
    } catch (error) {
      console.warn('Calendly token validation failed:', error);
      // If token is invalid and we have a refresh token, try to refresh
      if (
        error instanceof Error &&
        error.message.includes('authentication failed') &&
        user.calendly.refreshToken
      ) {
        try {
          const refreshResult = await calendlyService.refreshAccessToken(
            user.calendly.refreshToken
          );

          // Update user with new tokens
          user.calendly.accessToken = refreshResult.accessToken;
          if (refreshResult.refreshToken) {
            user.calendly.refreshToken = refreshResult.refreshToken;
          }
          if (refreshResult.expiresIn) {
            user.calendly.tokenExpiresAt = new Date(
              Date.now() + refreshResult.expiresIn * 1000
            );
          }
          await user.save();

          // Retry with new token
          userInfo = await calendlyService.getCurrentUser(
            refreshResult.accessToken
          );
        } catch (refreshError) {
          console.warn(
            'Calendly token refresh failed after validation error:',
            refreshError
          );
        }
      }
    }

    res.json({
      connected: !!user.calendly.userUri,
      enabled: user.calendly.enabled,
      userUri: user.calendly.userUri,
      publicLink: user.calendly.publicLink,
      connectedAt: user.calendly.connectedAt,
      userInfo: userInfo
        ? {
            name: userInfo.name,
            email: userInfo.email,
            schedulingUrl: userInfo.scheduling_url,
          }
        : null,
    });
  } catch (error) {
    console.error('Get Admin Calendly status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Set public Calendly link (alternative to OAuth) (Admin)
 * POST /api/admin/calendly/public-link
 */
export const setAdminCalendlyPublicLink = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { publicLink } = req.body;

    if (!publicLink || typeof publicLink !== 'string') {
      res.status(400).json({ message: 'Public Calendly link is required' });
      return;
    }

    // Validate that it's a Calendly URL
    let url: URL;
    try {
      url = new URL(publicLink);
    } catch {
      res.status(400).json({ message: 'Invalid URL format' });
      return;
    }

    // Security: Validate hostname to prevent SSRF attacks
    const hostname = url.hostname.toLowerCase();
    if (!hostname.includes('calendly.com')) {
      res.status(400).json({
        message: 'Invalid Calendly link. Must be a calendly.com URL',
      });
      return;
    }

    // Security: Only allow HTTPS URLs
    if (url.protocol !== 'https:') {
      res.status(400).json({
        message: 'Calendly link must use HTTPS protocol',
      });
      return;
    }

    const user = await User.findById(userId);
    if (!user || user.role !== 'admin') {
      res.status(404).json({ message: 'Admin user not found' });
      return;
    }

    if (!user.calendly) {
      user.calendly = {
        enabled: false,
      };
    }

    user.calendly.publicLink = publicLink.trim();
    user.calendly.enabled = true;
    user.calendly.connectedAt = new Date();

    await user.save();

    res.json({
      message: 'Public Calendly link set successfully',
      calendly: {
        publicLink: user.calendly.publicLink,
        enabled: user.calendly.enabled,
      },
    });
  } catch (error) {
    console.error('Set Admin Calendly public link error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Disconnect Calendly account (Admin)
 * DELETE /api/admin/calendly/disconnect
 */
export const disconnectAdminCalendly = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const user = await User.findById(userId);
    if (!user || user.role !== 'admin') {
      res.status(404).json({ message: 'Admin user not found' });
      return;
    }

    if (!user.calendly) {
      res.json({
        message: 'Calendly account disconnected successfully',
      });
      return;
    }

    user.calendly.enabled = false;
    user.calendly.accessToken = undefined;
    user.calendly.refreshToken = undefined;
    user.calendly.tokenExpiresAt = undefined;
    // Keep userUri and publicLink in case user wants to reconnect

    await user.save();

    res.json({
      message: 'Calendly account disconnected successfully',
    });
  } catch (error) {
    console.error('Disconnect Admin Calendly error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getTotalPostedJobs = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const result = await Company.aggregate<{ totalPostedJobs: number }>([
      {
        $group: {
          _id: null,
          totalPostedJobs: { $sum: '$postedJobs' },
        },
      },
    ]);

    const totalPostedJobs = result[0]?.totalPostedJobs ?? 0;

    res.success({
      total: totalPostedJobs,
    });
  } catch (error) {
    console.error('Get total posted jobs error:', error);
    res.fail('Internal server error', 500);
  }
};

/**
 * Get all interviews for admin-managed jobs
 * GET /api/admin/interviews
 */

/**
 * Update application status (accept/reject) - Admin
 * PUT /api/admin/applications/:applicationId/status
 */
export const updateApplicationStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.fail('Unauthorized', 401);
      return;
    }

    const { applicationId } = req.params;
    const { status, notes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(applicationId)) {
      res.fail('Invalid application ID', 400);
      return;
    }

    const validStatuses = [
      'accepted',
      'rejected',
      'reviewed',
      'shortlisted',
      'interviewed',
      'offer_sent',
      'hired',
    ] as const;

    if (!status || !validStatuses.includes(status as any)) {
      res.fail(
        `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        400
      );
      return;
    }

    // Runtime check: ensure status is strictly a string
    if (typeof status !== 'string') {
      res.fail('Status must be a string', 400);
      return;
    }

    const validatedStatus = status as (typeof validStatuses)[number];

    // Get application with job info
    const application = await Application.findById(applicationId)
      .populate({
        path: 'jobId',
        select: 'title directContact companyId',
        populate: {
          path: 'companyId',
          select: 'userId companyName',
        },
      })
      .populate({
        path: 'graduateId',
        select: 'firstName lastName userId',
      })
      .lean();

    if (!application) {
      res.fail('Application not found', 404);
      return;
    }

    // Verify job is admin-managed (directContact is false)
    const job = application.jobId as PopulatedJob | mongoose.Types.ObjectId;
    const jobData =
      typeof job === 'object' &&
      job &&
      !(job instanceof mongoose.Types.ObjectId)
        ? job
        : null;

    if (!jobData || jobData.directContact !== false) {
      res.fail(
        'This job is not managed by DLT Africa. Only jobs with admin handling can have applications updated by admins.',
        403
      );
      return;
    }

    // Runtime check: if notes is provided, it must be a string
    if (notes !== undefined && typeof notes !== 'string') {
      res.fail('Notes must be a string if provided', 400);
      return;
    }

    // Update application status
    const updatedApplication = await Application.findByIdAndUpdate(
      applicationId,
      {
        status: validatedStatus,
        reviewedAt: new Date(),
        ...(notes !== undefined && {
          notes: notes.trim(),
        }),
      },
      { new: true }
    ).lean();

    // If status is 'accepted', create and send offer
    if (validatedStatus === 'accepted') {
      try {
        const { createAndSendOffer } = await import(
          '../services/offer.service'
        );
        await createAndSendOffer(applicationId, userId);
        // Reload to get updated status (offer service sets it to 'offer_sent')
        const reloaded = await Application.findById(applicationId).lean();
        if (reloaded) {
          Object.assign(updatedApplication || {}, reloaded);
        }
      } catch (error) {
        console.error('Failed to create offer:', error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Failed to create and send offer';
        res.fail(errorMessage, 500);
        return;
      }
    } else if (validatedStatus === 'hired') {
      // Use transaction to ensure atomicity of offer, job, and company updates
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const offer = await Offer.findOne({
          applicationId: new mongoose.Types.ObjectId(applicationId),
        }).session(session);

        if (offer) {
          offer.status = 'accepted';
          offer.acceptedAt = new Date();
          offer.updatedBy = new mongoose.Types.ObjectId(userId);
          await offer.save({ session });
        }

        const job = await Job.findById(
          jobData?._id || application.jobId
        ).session(session);
        if (job) {
          job.status = 'closed';
          await job.save({ session });
        }

        interface PopulatedCompany {
          _id?: mongoose.Types.ObjectId;
          userId?: mongoose.Types.ObjectId;
          companyName?: string;
        }
        const companyFromJob =
          jobData?.companyId &&
          typeof jobData.companyId === 'object' &&
          !(jobData.companyId instanceof mongoose.Types.ObjectId)
            ? (jobData.companyId as PopulatedCompany)
            : null;

        let companyData: PopulatedCompany | null = companyFromJob;

        if (!companyData && jobData?.companyId) {
          const companyId =
            jobData.companyId instanceof mongoose.Types.ObjectId
              ? jobData.companyId
              : typeof jobData.companyId === 'object' && jobData.companyId
                ? (jobData.companyId as { _id?: mongoose.Types.ObjectId })._id
                : null;
          if (companyId) {
            const company = await Company.findById(companyId)
              .select('userId companyName')
              .lean();
            companyData = company as PopulatedCompany | null;
          }
        }

        if (companyData?._id) {
          const graduateObjectId =
            typeof application.graduateId === 'object' &&
            application.graduateId instanceof mongoose.Types.ObjectId
              ? application.graduateId
              : new mongoose.Types.ObjectId(String(application.graduateId));

          await Company.findByIdAndUpdate(
            companyData._id,
            {
              $addToSet: { hiredCandidates: graduateObjectId },
            },
            { new: true, session }
          );
        }

        // Notify graduate
        interface PopulatedGraduate {
          userId?: mongoose.Types.ObjectId;
          firstName?: string;
          lastName?: string;
        }
        const graduate = application.graduateId as
          | PopulatedGraduate
          | mongoose.Types.ObjectId;
        const graduateData =
          typeof graduate === 'object' &&
          graduate &&
          !(graduate instanceof mongoose.Types.ObjectId)
            ? graduate
            : null;

        if (graduateData?.userId) {
          const graduateUserIdString =
            graduateData.userId instanceof mongoose.Types.ObjectId
              ? graduateData.userId.toString()
              : String(graduateData.userId);
          await createNotification({
            userId: graduateUserIdString,
            type: 'application',
            title: 'Hire Confirmed',
            message: `Congratulations! You have been hired for "${jobData?.title || 'the position'}" by ${companyData?.companyName || 'DLT Africa'}. Welcome to the team!`,
            relatedId:
              application._id instanceof mongoose.Types.ObjectId
                ? application._id.toString()
                : String(application._id),
            relatedType: 'application',
            email: {
              subject: `Hire Confirmed: ${jobData?.title || 'Position'}`,
              text: `Congratulations! You have been hired for "${jobData?.title || 'the position'}" by ${companyData?.companyName || 'DLT Africa'}. Welcome to the team!`,
            },
          });
        }

        // Notify company
        if (companyData?.userId) {
          const companyUserIdString =
            companyData.userId instanceof mongoose.Types.ObjectId
              ? companyData.userId.toString()
              : String(companyData.userId);
          const graduateName = graduateData
            ? `${graduateData.firstName || ''} ${graduateData.lastName || ''}`.trim() ||
              'A candidate'
            : 'A candidate';
          await createNotification({
            userId: companyUserIdString,
            type: 'application',
            title: 'Candidate Hired',
            message: `${graduateName} has been marked as hired for "${jobData?.title || 'the position'}" by DLT Africa.`,
            relatedId:
              application._id instanceof mongoose.Types.ObjectId
                ? application._id.toString()
                : String(application._id),
            relatedType: 'application',
            email: {
              subject: `Candidate Hired: ${jobData?.title || 'Position'}`,
              text: `${graduateName} has been marked as hired for "${jobData?.title || 'the position'}" by DLT Africa.`,
            },
          });
        }
      } catch (error) {
        console.error('Failed to process hire confirmation:', error);
        // Don't fail the request, just log the error
      }
    } else {
      // Send notification for other statuses
      try {
        interface PopulatedGraduate {
          userId?: mongoose.Types.ObjectId;
        }
        const graduate = application.graduateId as
          | PopulatedGraduate
          | mongoose.Types.ObjectId;
        const graduateData =
          typeof graduate === 'object' &&
          graduate &&
          !(graduate instanceof mongoose.Types.ObjectId)
            ? graduate
            : null;
        if (graduateData?.userId) {
          const graduateUserIdString =
            graduateData.userId instanceof mongoose.Types.ObjectId
              ? graduateData.userId.toString()
              : String(graduateData.userId);
          await createNotification({
            userId: graduateUserIdString,
            type: 'application',
            title: `Application ${validatedStatus === 'rejected' ? 'Rejected' : 'Updated'}`,
            message: `Your application for "${jobData?.title || 'the position'}" has been ${validatedStatus}.`,
            relatedId:
              application._id instanceof mongoose.Types.ObjectId
                ? application._id.toString()
                : String(application._id),
            relatedType: 'application',
            email: {
              subject: `Application Update: ${jobData?.title || 'Position'}`,
              text: `Your application for "${jobData?.title || 'the position'}" has been ${validatedStatus}.`,
            },
          });
        }
      } catch (error) {
        console.error('Failed to send application status notification:', error);
      }
    }

    res.success(updatedApplication || application, {
      message:
        validatedStatus === 'accepted'
          ? 'Application accepted and offer sent successfully'
          : 'Application status updated successfully',
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.fail('Internal server error', 500);
  }
};

/**
 * Send message to graduate (with or without application) - Admin
 * POST /api/admin/graduates/:graduateId/message
 */
export const sendMessageToGraduate = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.fail('Unauthorized', 401);
      return;
    }

    const { graduateId } = req.params;
    const { message, jobId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(graduateId)) {
      res.fail('Invalid graduate ID', 400);
      return;
    }

    if (!message || typeof message !== 'string' || !message.trim()) {
      res.fail('Message is required', 400);
      return;
    }

    // Get graduate with user info
    const graduate = await Graduate.findById(graduateId)
      .select('userId firstName lastName')
      .lean();

    if (!graduate) {
      res.fail('Graduate not found', 404);
      return;
    }

    if (!graduate.userId) {
      res.fail('Graduate profile is missing a linked user account', 400);
      return;
    }

    const graduateUserId =
      graduate.userId instanceof mongoose.Types.ObjectId
        ? graduate.userId
        : new mongoose.Types.ObjectId(String(graduate.userId));

    const adminUserId = new mongoose.Types.ObjectId(userId);

    // If jobId is provided, verify it's admin-managed and optionally get applicationId
    let applicationId: mongoose.Types.ObjectId | undefined;
    if (jobId && mongoose.Types.ObjectId.isValid(jobId)) {
      const job = await Job.findById(jobId).select('directContact').lean();
      if (!job || job.directContact !== false) {
        res.fail(
          'This job is not managed by DLT Africa. Only admin-managed jobs can be used for messaging.',
          403
        );
        return;
      }

      // Try to find application for this job and graduate
      const application = await Application.findOne({
        jobId: new mongoose.Types.ObjectId(jobId),
        graduateId: new mongoose.Types.ObjectId(graduateId),
      }).lean();

      if (application) {
        applicationId = application._id as mongoose.Types.ObjectId;
      }
    }

    // Create message from admin to graduate
    const newMessage = await MessageModel.create({
      senderId: adminUserId,
      receiverId: graduateUserId,
      message: message.trim(),
      type: 'text',
      ...(applicationId && { applicationId }),
    });

    res.success(newMessage, { message: 'Message sent successfully' });
  } catch (error) {
    console.error('Send message to graduate error:', error);
    res.fail('Internal server error', 500);
  }
};

/**
 * Get offer by offer ID (for admins)
 * GET /api/admin/offers/:offerId
 */
export const getOfferById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.fail('Unauthorized', 401);
      return;
    }

    const { offerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(offerId)) {
      res.fail('Invalid offer ID', 400);
      return;
    }

    const offer = await Offer.findOne({
      _id: new mongoose.Types.ObjectId(offerId),
    })
      .populate({
        path: 'jobId',
        select: 'title location jobType directContact companyId',
        populate: {
          path: 'companyId',
          select: 'companyName',
        },
      })
      .populate({
        path: 'graduateId',
        select: 'firstName lastName',
      })
      .lean();

    if (!offer) {
      res.fail('Offer not found', 404);
      return;
    }

    // Verify the job is admin-managed (directContact is false)
    const job = offer.jobId as PopulatedJob | mongoose.Types.ObjectId;
    const jobData =
      typeof job === 'object' &&
      job &&
      !(job instanceof mongoose.Types.ObjectId)
        ? job
        : null;

    if (!jobData || jobData.directContact !== false) {
      res.fail(
        'This offer is not for an admin-managed job. Only offers for admin-managed jobs can be accessed by admins.',
        403
      );
      return;
    }

    res.success(offer);
  } catch (error) {
    console.error('Get offer by ID error:', error);
    res.fail('Internal server error', 500);
  }
};

export const getAdminInterviews = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { status, page = '1', limit = '10', upcoming } = req.query;

    const pagination = {
      page: Math.max(1, Number.parseInt(page as string, 10) || 1),
      limit: Math.min(
        50,
        Math.max(1, Number.parseInt(limit as string, 10) || 10)
      ),
    };

    const validatedStatus = status
      ? (
          [
            'pending_selection',
            'scheduled',
            'in_progress',
            'completed',
            'cancelled',
          ] as const
        ).includes(status as any)
        ? (status as
            | 'pending_selection'
            | 'scheduled'
            | 'in_progress'
            | 'completed'
            | 'cancelled')
        : null
      : null;

    if (status && validatedStatus === null) {
      res.fail('Invalid status filter', 400);
      return;
    }

    // First, get all admin-managed jobs (directContact: false)
    const adminJobs = await Job.find({ directContact: false })
      .select('_id')
      .lean();
    const adminJobIds = adminJobs.map((job) => job._id);

    if (adminJobIds.length === 0) {
      res.success({
        interviews: [],
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total: 0,
          pages: 0,
        },
      });
      return;
    }

    const query: Record<string, unknown> = {
      jobId: { $in: adminJobIds },
    };

    if (typeof upcoming === 'string') {
      if (upcoming === 'true') {
        // For upcoming, include:
        // 1. Interviews with scheduledAt in the future (or within last 6 hours)
        // 2. Interviews in pending_selection status (waiting for candidate to pick)
        // Only apply this filter if status is not explicitly set
        if (!validatedStatus) {
          query.$or = [
            {
              scheduledAt: { $gte: new Date(Date.now() - 6 * 60 * 60 * 1000) },
            },
            { status: 'pending_selection' },
          ];
        } else if (validatedStatus === 'pending_selection') {
          // If specifically filtering for pending_selection, just use status
          query.status = validatedStatus;
        } else {
          // For other statuses with upcoming=true, require scheduledAt
          query.status = validatedStatus;
          query.scheduledAt = {
            $gte: new Date(Date.now() - 6 * 60 * 60 * 1000),
          };
        }
      } else if (upcoming === 'false') {
        // For past, only include interviews that have a scheduledAt in the past
        // and are not in pending_selection
        query.scheduledAt = { $lt: new Date() };
        if (!validatedStatus) {
          query.status = { $ne: 'pending_selection' };
        } else {
          query.status = validatedStatus;
        }
      }
    } else if (validatedStatus) {
      // If no upcoming filter but status is set, use it
      query.status = validatedStatus;
    }

    const skip = (pagination.page - 1) * pagination.limit;

    // First, update any interviews that have passed their end time to 'completed'
    const now = new Date();
    await Interview.updateMany(
      {
        jobId: { $in: adminJobIds },
        status: { $in: ['scheduled', 'in_progress'] },
        $expr: {
          $lte: [
            {
              $add: [
                '$scheduledAt',
                { $multiply: ['$durationMinutes', 60 * 1000] },
              ],
            },
            now,
          ],
        },
      },
      {
        $set: {
          status: 'completed',
          endedAt: now,
        },
      }
    );

    const [interviews, total] = await Promise.all([
      Interview.find(query)
        .populate({
          path: 'graduateId',
          select: 'firstName lastName profilePictureUrl rank position',
        })
        .populate({
          path: 'jobId',
          select: 'title location jobType companyId',
          populate: {
            path: 'companyId',
            select: 'companyName',
          },
        })
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(pagination.limit)
        .lean(),
      Interview.countDocuments(query),
    ]);

    const serializeAdminInterview = (interview: any) => {
      const graduate =
        typeof interview.graduateId === 'object' &&
        interview.graduateId &&
        !(interview.graduateId instanceof mongoose.Types.ObjectId)
          ? interview.graduateId
          : {};
      const job =
        typeof interview.jobId === 'object' &&
        interview.jobId &&
        !(interview.jobId instanceof mongoose.Types.ObjectId)
          ? interview.jobId
          : {};
      const companyInfo =
        job.companyId &&
        typeof job.companyId === 'object' &&
        !(job.companyId instanceof mongoose.Types.ObjectId) &&
        'companyName' in job.companyId
          ? job.companyId
          : null;

      const rawApplicationId = interview.applicationId;
      const applicationId =
        rawApplicationId instanceof mongoose.Types.ObjectId
          ? rawApplicationId.toString()
          : typeof rawApplicationId === 'string'
            ? rawApplicationId
            : undefined;

      // For pending_selection interviews, use the first suggested slot date if scheduledAt is not available
      let scheduledAt = interview.scheduledAt;
      if (
        !scheduledAt &&
        interview.status === 'pending_selection' &&
        interview.suggestedTimeSlots &&
        interview.suggestedTimeSlots.length > 0
      ) {
        scheduledAt = interview.suggestedTimeSlots[0].date;
      }

      return {
        id: interview._id?.toString?.() ?? '',
        applicationId,
        scheduledAt: scheduledAt,
        status: interview.status,
        durationMinutes:
          interview.durationMinutes ||
          (interview.suggestedTimeSlots &&
            interview.suggestedTimeSlots[0]?.duration) ||
          30,
        roomSlug: interview.roomSlug,
        roomUrl: interview.roomUrl,
        job: {
          id: job._id?.toString?.(),
          title: job.title,
          location: job.location,
          jobType: job.jobType,
          companyName: companyInfo?.companyName,
        },
        participant: {
          name: `${graduate.firstName || ''} ${graduate.lastName || ''}`.trim(),
          role: graduate.position,
          rank: graduate.rank,
          avatar: graduate.profilePictureUrl,
        },
      };
    };

    // Return in the same format as company/graduate endpoints for consistency
    res.json({
      interviews: interviews.map(serializeAdminInterview),
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        pages: Math.ceil(total / pagination.limit),
      },
    });
  } catch (error) {
    console.error('Get admin interviews error:', error);
    res.fail('Internal server error', 500);
  }
};
