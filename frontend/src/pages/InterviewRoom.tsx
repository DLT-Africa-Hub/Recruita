import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import interviewApi from '../api/interview';
import { Button, PageLoader } from '../components/ui';
import ErrorState from '../components/ui/ErrorState';
import { useAuth } from '../context/AuthContext';
import StreamVideoCall from '../components/interview/StreamVideoCall';

const InterviewRoom = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['interviewRoom', slug],
    enabled: Boolean(slug),
    queryFn: async () => {
      if (!slug) return null;
      return interviewApi.getInterviewBySlug(slug);
    },
  });

  const {
    data: tokenData,
    isLoading: tokenLoading,
    error: tokenError,
  } = useQuery({
    queryKey: ['streamToken', slug],
    enabled: Boolean(slug) && Boolean(data?.interview),
    queryFn: async () => {
      if (!slug) return null;
      return interviewApi.getStreamToken(slug);
    },
  });

  const interview = data?.interview;

  const formattedDate = useMemo(() => {
    if (!interview?.scheduledAt) return '';
    const date = new Date(interview.scheduledAt);
    if (Number.isNaN(date.getTime())) return interview.scheduledAt;
    return date.toLocaleString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [interview?.scheduledAt]);

  if (isLoading || tokenLoading) {
    return <PageLoader message="Preparing interview room..." />;
  }

  if (error || !interview) {
    const fallbackDestination =
      user?.role === 'company' ? '/company' : '/graduate';
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 gap-4">
        <ErrorState
          title="Unable to load interview"
          message={
            (error as any)?.response?.data?.message ||
            (error as Error)?.message ||
            'Please check the link and try again.'
          }
          variant="fullPage"
        />
        <Button onClick={() => navigate(fallbackDestination)}>
          Back to dashboard
        </Button>
      </div>
    );
  }

  if (tokenError || !tokenData) {
    const fallbackDestination =
      user?.role === 'company' ? '/company' : '/graduate';
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 gap-4">
        <ErrorState
          title="Unable to connect to video call"
          message={
            (tokenError as any)?.response?.data?.message ||
            (tokenError as Error)?.message ||
            'Failed to initialize video call. Please try again.'
          }
          variant="fullPage"
        />
        <Button onClick={() => navigate(fallbackDestination)}>
          Back to dashboard
        </Button>
      </div>
    );
  }

  const counterpartLabel =
    interview.participant?.role === 'company' ? 'Candidate' : 'Company';
  const counterpartName =
    interview.participant?.role === 'company'
      ? interview.graduate?.name || 'Candidate'
      : interview.company?.name || 'Company';

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#F8F8F8]">
      <div className="w-full lg:w-2/3 bg-black min-h-[50vh]">
        <StreamVideoCall
          apiKey={tokenData.apiKey}
          token={tokenData.token}
          callId={tokenData.callId}
          userName={tokenData.userName}
          userId={tokenData.userId}
        />
      </div>
      <div className="w-full lg:w-1/3 bg-white border-l border-fade flex flex-col gap-6 p-6">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-[#1C1C1C80]">{counterpartLabel}</p>
          <h2 className="text-2xl font-semibold text-[#1C1C1C]">
            {counterpartName}
          </h2>
          {interview.job?.title && (
            <p className="text-sm text-[#1C1C1C80]">{interview.job.title}</p>
          )}
        </div>

        <div className="flex flex-col gap-3 text-sm text-[#1C1C1C80]">
          <div className="flex items-center justify-between">
            <span>Date</span>
            <span className="font-medium text-[#1C1C1C]">
              {formattedDate}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Duration</span>
            <span className="font-medium text-[#1C1C1C]">
              {interview.durationMinutes || 30} mins
            </span>
          </div>
          {interview.job?.location && (
            <div className="flex items-center justify-between">
              <span>Location</span>
              <span className="font-medium text-[#1C1C1C]">
                {interview.job.location}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <Button
            variant="secondary"
            onClick={() => navigate(-1)}
            className="w-full"
          >
            Back to dashboard
          </Button>
          <Button
            onClick={() => {
              if (interview.roomUrl && navigator?.clipboard?.writeText) {
                navigator.clipboard.writeText(interview.roomUrl);
              }
            }}
            className="w-full"
          >
            Copy interview link
          </Button>
        </div>

        <p className="text-xs text-[#1C1C1C80]">
          Grant your browser permission to use your microphone and camera so
          participants can see and hear you clearly.
        </p>
      </div>
    </div>
  );
};

export default InterviewRoom;
