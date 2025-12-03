import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { StreamChat } from 'stream-chat';
import Interview from '../models/Interview.model';

export const getInterviewBySlug = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.user?.userId;

  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const { slug } = req.params;

  if (!slug || typeof slug !== 'string') {
    res.status(400).json({ message: 'Interview link is required' });
    return;
  }

  const interview = await Interview.findOne({ roomSlug: slug })
    .populate({
      path: 'jobId',
      select: 'title location jobType companyId',
      populate: {
        path: 'companyId',
        select: 'companyName',
      },
    })
    .populate({
      path: 'companyId',
      select: 'companyName',
    })
    .populate({
      path: 'graduateId',
      select: 'firstName lastName profilePictureUrl rank position',
    })
    .lean();

  if (!interview) {
    res.status(404).json({ message: 'Interview not found' });
    return;
  }

  const companyUserId =
    interview.companyUserId instanceof mongoose.Types.ObjectId
      ? interview.companyUserId.toString()
      : interview.companyUserId;
  const graduateUserId =
    interview.graduateUserId instanceof mongoose.Types.ObjectId
      ? interview.graduateUserId.toString()
      : interview.graduateUserId;

  const isCompanyParticipant = companyUserId === userId;
  const isGraduateParticipant = graduateUserId === userId;

  if (!isCompanyParticipant && !isGraduateParticipant) {
    res.status(403).json({ message: 'You do not have access to this interview' });
    return;
  }

  const interviewData = interview as Record<string, any>;
  const job = (interviewData.jobId as Record<string, any>) || {};
  const companyInfo =
    (job.companyId &&
      typeof job.companyId === 'object' &&
      'companyName' in job.companyId &&
      job.companyId) ||
    (interviewData.companyId &&
      typeof interviewData.companyId === 'object' &&
      'companyName' in interviewData.companyId &&
      interviewData.companyId) ||
    null;
  const graduate = (interviewData.graduateId as Record<string, any>) || {};

  const graduateName = `${graduate.firstName || ''} ${
    graduate.lastName || ''
  }`.trim();

  const participantRole = isCompanyParticipant ? 'company' : 'graduate';
  const participantDisplayName =
    participantRole === 'company'
      ? companyInfo?.companyName || 'Company'
      : graduateName || 'Candidate';

  const joinWindowStartsAt = new Date(
    new Date(interview.scheduledAt).getTime() - 10 * 60 * 1000
  );

  res.json({
    interview: {
      id: interviewData._id?.toString?.() ?? '',
      applicationId: interviewData.applicationId
        ? interviewData.applicationId.toString()
        : undefined,
      scheduledAt: interviewData.scheduledAt,
      status: interviewData.status,
      durationMinutes: interviewData.durationMinutes,
      roomSlug: interviewData.roomSlug,
      roomUrl: interviewData.roomUrl,
      provider: interviewData.provider,
      job: {
        id: job._id?.toString?.(),
        title: job.title,
        location: job.location,
        jobType: job.jobType,
      },
      company: {
        id: interview.companyId?._id?.toString?.() ?? companyInfo?._id?.toString?.(),
        name: companyInfo?.companyName,
      },
      graduate: {
        id: graduate._id?.toString?.(),
        name: graduateName,
        avatar: graduate.profilePictureUrl,
        rank: graduate.rank,
        role: graduate.position,
      },
      participant: {
        role: participantRole,
        name: participantDisplayName,
        counterpartName: participantRole === 'company' ? graduateName : companyInfo?.companyName,
      },
      joinWindowStartsAt,
    },
  });
};

/**
 * Generate Stream.io token for video call
 * GET /api/interviews/:slug/token
 */
export const getStreamToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.user?.userId;

  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const { slug } = req.params;

  if (!slug || typeof slug !== 'string') {
    res.status(400).json({ message: 'Interview link is required' });
    return;
  }

  const interview = await Interview.findOne({ roomSlug: slug })
    .populate({
      path: 'graduateId',
      select: 'firstName lastName profilePictureUrl',
    })
    .populate({
      path: 'companyId',
      select: 'companyName',
    })
    .lean();

  if (!interview) {
    res.status(404).json({ message: 'Interview not found' });
    return;
  }

  const companyUserId =
    interview.companyUserId instanceof mongoose.Types.ObjectId
      ? interview.companyUserId.toString()
      : interview.companyUserId;
  const graduateUserId =
    interview.graduateUserId instanceof mongoose.Types.ObjectId
      ? interview.graduateUserId.toString()
      : interview.graduateUserId;

  const isCompanyParticipant = companyUserId === userId;
  const isGraduateParticipant = graduateUserId === userId;

  if (!isCompanyParticipant && !isGraduateParticipant) {
    res.status(403).json({ message: 'You do not have access to this interview' });
    return;
  }

  const streamApiKey = process.env.STREAM_API_KEY;
  const streamApiSecret = process.env.STREAM_API_SECRET;

  if (!streamApiKey || !streamApiSecret) {
    res.status(500).json({ message: 'Stream.io configuration is missing' });
    return;
  }

  try {
    const streamClient = StreamChat.getInstance(streamApiKey, streamApiSecret);

    const interviewData = interview as Record<string, any>;
    const graduate = (interviewData.graduateId as Record<string, any>) || {};
    const company = (interviewData.companyId as Record<string, any>) || {};

    const graduateName = `${graduate.firstName || ''} ${graduate.lastName || ''}`.trim();
    const participantRole = isCompanyParticipant ? 'company' : 'graduate';
    const participantName =
      participantRole === 'company'
        ? company?.companyName || 'Company'
        : graduateName || 'Candidate';

    // Generate token for the user
    // Token expires in 1 hour
    const token = streamClient.createToken(userId);

    // Use the room slug as the call ID
    const callId = `interview-${interview.roomSlug}`;

    res.json({
      token,
      apiKey: streamApiKey,
      callId,
      userId,
      userName: participantName,
    });
  } catch (error) {
    console.error('Error generating Stream.io token:', error);
    res.status(500).json({ message: 'Failed to generate video call token' });
  }
};

