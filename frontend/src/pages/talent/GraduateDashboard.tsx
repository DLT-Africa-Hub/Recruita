import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import CompanyCard, { Company } from '../../components/explore/CompanyCard';
import CompanyFlatCard from '../../components/explore/CompanyFlatCard';
import { graduateApi } from '../../api/graduate';
import { JobPreviewModal } from '../../index';
import ApplicationFormModal from '../../components/jobs/ApplicationFormModal';
import { PageLoader, ErrorState, SectionHeader, Button, EmptyState, BaseModal } from '../../components/ui';
import {
  DEFAULT_JOB_IMAGE,
  formatSalaryRange,
  formatJobType,
  getSalaryType,
} from '../../utils/job.utils';

interface Match {
  id: string;
  score: number;
  status: string;
  job: {
    id: string;
    title?: string;
    companyId?: string;
    companyName?: string;
    location?: string;
    jobType?: string;
    description?: string;
    requirements?: {
      skills?: string[];
      extraRequirements?: Array<{
        label: string;
        type: 'text' | 'url' | 'textarea';
        required: boolean;
        placeholder?: string;
      }>;
    };
    salary?: {
      min?: number;
      max?: number;
      currency?: string;
    };
  };
}

const normalizeMatchScore = (score: number | undefined): number => {
  if (typeof score !== 'number' || Number.isNaN(score)) {
    return 0;
  }
  if (score > 1) {
    return Math.min(100, Math.round(score));
  }
  return Math.min(100, Math.round(score * 100));
};

const GraduateDashboard = () => {
  const navigate = useNavigate();
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedMatchScore, setSelectedMatchScore] = useState<number | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isApplicationFormOpen, setIsApplicationFormOpen] = useState(false);
  const [showProfileIncompleteModal, setShowProfileIncompleteModal] = useState(false);
  const [profileMissingFields, setProfileMissingFields] = useState<string[]>([]);
  const [showAlreadyAppliedModal, setShowAlreadyAppliedModal] = useState(false);

  // Fetch graduate profile to check completeness
  const { data: profileData } = useQuery({
    queryKey: ['graduateProfile'],
    queryFn: async () => {
      const response = await graduateApi.getProfile();
      return response.graduate || response;
    },
  });

  const {
    data: matchesData,
    isLoading: loading,
    error: queryError,
  } = useQuery({
    queryKey: ['graduateMatches'],
    queryFn: async () => {
      const response = await graduateApi.getMatches({ page: 1, limit: 100 });
      return response.matches || [];
    },
  });

  const { data: applicationsData } = useQuery({
    queryKey: ['graduateApplications', 'dashboard'],
    queryFn: async () => {
      const response = await graduateApi.getApplications({ page: 1, limit: 100 });
      return response.applications || [];
    },
  });

  const appliedJobIds = useMemo(() => {
    if (!applicationsData || applicationsData.length === 0) {
      return new Set<string>();
    }

    const ids = applicationsData
      .map((application: any) => {
        if (application.job?.id) {
          return application.job.id;
        }
        if (typeof application.jobId === 'string') {
          return application.jobId;
        }
        if (application.jobId?._id) {
          return application.jobId._id.toString();
        }
        return null;
      })
      .filter((value: string | null): value is string => Boolean(value));

    return new Set(ids);
  }, [applicationsData]);

  const transformMatchToCompany = useCallback(
    (match: Match, index: number): Company & { jobId: string } => {
      const job = match.job;
      const matchScore = normalizeMatchScore(match.score);
      const jobType = job.jobType || 'Full time';
      const salaryRange = formatSalaryRange(job.salary);
      const salaryType = getSalaryType(jobType);
      const formattedJobType = formatJobType(jobType);

      let contractString = formattedJobType;
      if (jobType === 'Contract') {
        contractString = 'Contract';
      } else if (jobType === 'Internship') {
        contractString = 'Internship';
      }

      const companyName = job.companyName || 'Company';

      const cardId =
        parseInt(job.id?.slice(-8) || match.id.slice(-8), 16) || index + 1;

      return {
        id: cardId,
        name: companyName,
        role: job.title || 'Position',
        match: matchScore,
        contract: contractString,
        location: job.location || 'Location not specified',
        wageType: salaryType,
        wage:
          salaryRange === 'Not specified'
            ? '—'
            : `${salaryRange} ${salaryType}`,
        image: DEFAULT_JOB_IMAGE,
        jobId: job.id,
      };
    },
    []
  );

  const { availableOpportunities, companyOffers }: {
    availableOpportunities: (Company & { jobId: string })[];
    companyOffers: (Company & { jobId: string })[];
  } = useMemo(() => {
    if (!matchesData || matchesData.length === 0) {
      return {
        availableOpportunities: [],
        companyOffers: [],
      };
    }

    const standardMatches: (Company & { jobId: string })[] = [];
    matchesData.forEach((match: Match, index: number) => {
      standardMatches.push(transformMatchToCompany(match, index));
    });

    const sortedStandard = [...standardMatches].sort((a, b) => b.match - a.match);

    return {
      availableOpportunities: sortedStandard.slice(0, 4),
      companyOffers: [],
    };
  }, [matchesData, transformMatchToCompany]);

  const error = useMemo(() => {
    if (!queryError) return null;
    const err = queryError as any;
    return (
      err.response?.data?.message || 'Failed to load matches. Please try again.'
    );
  }, [queryError]);

  // Get selected job data from matches
  const selectedJobData = useMemo(() => {
    if (!selectedJobId || !matchesData) return null;
    const match = matchesData.find((m: Match) => m.job?.id === selectedJobId);
    return match?.job || null;
  }, [selectedJobId, matchesData]);

  const handleButtonClick = (
    company: Company & { jobId?: string },
    buttonText: string
  ) => {
    const jobId = (company as Company & { jobId: string }).jobId;
    if (jobId) {
      if (buttonText === 'Preview') {
        // Find the match to get the score
        const match = matchesData?.find((m: Match) => m.job?.id === jobId);
        setSelectedMatchScore(match?.score);
        setSelectedJobId(jobId);
        setIsModalOpen(true);
      } else if (buttonText === 'Get in Touch') {
        // TODO: Handle contact action
        console.log('Get in Touch clicked for job:', jobId);
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedJobId(null);
    setSelectedMatchScore(undefined);
  };

  const handleChat = () => {
    // TODO: Navigate to chat
    console.log('Chat clicked for job:', selectedJobId);
  };

  const handleApply = () => {
    if (!selectedJobId) return;

    if (appliedJobIds.has(selectedJobId)) {
      setShowAlreadyAppliedModal(true);
      setIsModalOpen(false);
      return;
    }

    // Check profile completeness (only for location, CV can be uploaded in form)
    const missingFields: string[] = [];
    if (!profileData?.location || profileData.location.trim() === '') {
      missingFields.push('location');
    }

    if (missingFields.length > 0) {
      setProfileMissingFields(missingFields);
      setShowProfileIncompleteModal(true);
      setIsModalOpen(false);
      return;
    }

    // Proceed with application (CV can be uploaded in the form if missing)
    setIsApplicationFormOpen(true);
    setIsModalOpen(false);
  };

  return (
    <div className="py-[20px] px-[20px]  lg:px-0 lg:pr-[20px] flex flex-col gap-[43px] items-start justify-center overflow-y-auto h-full">
      {error && (
        <ErrorState
          message={error}
          variant="inline"
        />
      )}

      {loading && (
        <PageLoader message="Loading opportunities..." />
      )}

      {!loading && (
        <>
        
          <div className="flex flex-col gap-[20px] w-full md:gap-[30px] mt-50">
            <SectionHeader title="AI Matched Opportunities" />

            {availableOpportunities.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 w-full">
                {availableOpportunities.map((company) => (
                  <CompanyCard
                    key={company.id}
                    company={company}
                    buttonText="Preview"
                    onButtonClick={() => handleButtonClick(company, 'Preview')}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No opportunities yet"
                description="Full-time and part-time opportunities will appear here once you're matched with jobs."
              />
            )}
          </div>

          <div className="flex flex-col gap-[20px] w-full md:gap-[30px]">
            <SectionHeader title="Contract offers" />

            {companyOffers.length > 0 ? (
              <div className="flex flex-col gap-4">
                {companyOffers.map((company) => (
                  <CompanyFlatCard
                    key={company.id}
                    company={company}
                    buttonText="Preview"
                    onButtonClick={() =>
                      handleButtonClick(company, 'Preview')
                    }
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No contract offers yet"
                description="Contract and internship opportunities will appear here once you're matched with jobs."
              />
            )}
          </div>
        </>
      )}

      <JobPreviewModal
        isOpen={isModalOpen}
        jobId={selectedJobId}
        jobData={selectedJobData}
        matchScore={selectedMatchScore}
        hasApplied={selectedJobId ? appliedJobIds.has(selectedJobId) : false}
        onClose={handleCloseModal}
        onChat={handleChat}
        onApply={handleApply}
      />

      {selectedJobId && selectedJobData && (
        <ApplicationFormModal
          isOpen={isApplicationFormOpen}
          jobId={selectedJobId}
          jobTitle={selectedJobData.title || 'Position'}
          extraRequirements={selectedJobData.requirements?.extraRequirements}
          onClose={() => {
            setIsApplicationFormOpen(false);
          }}
          onSuccess={() => {
            // Optionally show success message
          }}
        />
      )}

      {/* Profile Incomplete Modal */}
      <BaseModal
        isOpen={showProfileIncompleteModal}
        onClose={() => setShowProfileIncompleteModal(false)}
        size="md"
      >
        <div className="flex flex-col gap-6">
          <div>
            <h2 className="text-[24px] font-semibold text-[#1C1C1C]">
              Complete Your Profile
            </h2>
            <p className="text-[14px] text-[#1C1C1C80] mt-2">
              Please complete your profile before applying for jobs.
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-[14px] font-medium text-yellow-800 mb-2">
              Missing required fields:
            </p>
            <ul className="list-disc list-inside text-[14px] text-yellow-700 space-y-1">
              {profileMissingFields.map((field) => (
                <li key={field} className="capitalize">
                  {field === 'CV' ? 'CV/Resume' : field}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setShowProfileIncompleteModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setShowProfileIncompleteModal(false);
                navigate('/graduate/profile');
              }}
              className="flex-1"
            >
              Update Profile
            </Button>
          </div>
        </div>
      </BaseModal>

      <BaseModal
        isOpen={showAlreadyAppliedModal}
        onClose={() => setShowAlreadyAppliedModal(false)}
        size="sm"
      >
        <div className="flex flex-col gap-6">
          <div>
            <h2 className="text-[24px] font-semibold text-[#1C1C1C]">
              Already Applied
            </h2>
            <p className="text-[14px] text-[#1C1C1C80] mt-2">
              You have already submitted an application for this role. We will notify you once there is an update.
            </p>
          </div>
          <Button variant="primary" onClick={() => setShowAlreadyAppliedModal(false)}>
            Got it
          </Button>
        </div>
      </BaseModal>
    </div>
  );
};

export default GraduateDashboard;
