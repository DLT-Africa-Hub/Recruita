import { CandidateProfile } from '../../data/candidates';
import CandidateCard from '../company/CandidateCard';

interface CandidateGridProps {
  candidates: CandidateProfile[];
  loading?: boolean;
  onPreview: (candidate: CandidateProfile) => void;
}

const CandidateGrid: React.FC<CandidateGridProps> = ({
  candidates,
  loading = false,
  onPreview,
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="h-[400px] bg-gray-200 animate-pulse rounded-[20px]"
          />
        ))}
      </div>
    );
  }

  if (candidates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-[60px] w-full">
        <p className="text-[20px] font-semibold text-[#1C1C1C] mb-2">
          No candidates found
        </p>
        <p className="text-[16px] text-[#1C1C1CBF]">
          Try adjusting your filters to see more results.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
      {candidates.map((candidate) => (
        <CandidateCard
          key={candidate.id}
          candidate={candidate}
          onPreview={onPreview}
        />
      ))}
    </div>
  );
};

export default CandidateGrid;

