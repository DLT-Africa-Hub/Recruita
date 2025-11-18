import { Company } from './CompanyCard';
import CompanyCard from './CompanyCard';
import CompanyFlatCard from './CompanyFlatCard';

interface CompanyGridProps {
  companies: Company[];
  loading?: boolean;
  onPreviewClick: (companyId: number) => void;
}

const CompanyGrid: React.FC<CompanyGridProps> = ({
  companies,
  loading = false,
  onPreviewClick,
}) => {
  if (loading) {
    return (
      <>
        <div className="hidden lg:grid md:grid-cols-2 lg:grid-cols-1 gap-8 w-full">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-[200px] bg-gray-200 animate-pulse rounded-[10px]"
            />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:hidden w-full">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-[400px] bg-gray-200 animate-pulse rounded-[10px]"
            />
          ))}
        </div>
      </>
    );
  }

  if (companies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-[60px] w-full">
        <p className="text-[20px] font-semibold text-[#1C1C1C] mb-2">
          No companies found
        </p>
        <p className="text-[16px] text-[#1C1C1CBF]">
          Try adjusting your filters to see more results.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop: Flat Cards */}
      <div className="hidden lg:grid md:grid-cols-2 lg:grid-cols-1 gap-8 w-full">
        {companies.map((company) => (
          <CompanyFlatCard
            key={company.id}
            company={company}
            buttonText="Preview"
            onPreviewClick={onPreviewClick}
          />
        ))}
      </div>

      {/* Mobile/Tablet: Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:hidden w-full">
        {companies.map((company) => (
          <CompanyCard
            key={company.id}
            company={company}
            buttonText="Preview"
            onPreviewClick={onPreviewClick}
          />
        ))}
      </div>
    </>
  );
};

export default CompanyGrid;

