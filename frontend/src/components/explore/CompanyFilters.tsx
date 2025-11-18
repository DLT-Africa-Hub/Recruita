import { CompanyFilters as FilterType } from '../../types/explore';

interface CompanyFiltersProps {
  filters: FilterType;
  onFilterChange: (filters: Partial<FilterType>) => void;
}

const CompanyFilters: React.FC<CompanyFiltersProps> = ({
  filters,
  onFilterChange,
}) => {
  const industryOptions = [
    'Technology',
    'Finance',
    'Healthcare',
    'Education',
    'E-commerce',
    'Consulting',
    'Manufacturing',
    'Other',
  ];
  const sizeOptions = ['1-10', '11-50', '51-200', '201-500', '500+'];
  const locationOptions = [
    'Remote',
    'Lagos, NG',
    'Nairobi, KE',
    'Accra, GH',
    'Kigali, RW',
    'Cairo, EG',
  ];

  return (
    <div className="flex flex-wrap items-center gap-[12px] mb-[20px]">
      {/* Industry Filter (Multi-select) */}
      <div className="flex flex-wrap items-center gap-[8px]">
        <span className="text-[14px] font-medium text-[#1C1C1C] mr-2">
          Industry:
        </span>
        {industryOptions.map((industry) => {
          const isSelected = filters.industry?.includes(industry);
          return (
            <button
              key={industry}
              type="button"
              onClick={() => {
                const currentIndustries = filters.industry || [];
                const newIndustries = isSelected
                  ? currentIndustries.filter((i) => i !== industry)
                  : [...currentIndustries, industry];
                onFilterChange({
                  industry: newIndustries.length > 0 ? newIndustries : undefined,
                });
              }}
              className={`px-3 py-1 rounded-full text-[12px] font-medium transition ${
                isSelected
                  ? 'bg-button text-white'
                  : 'bg-[#F8F8F8] border border-fade text-[#1C1C1C]'
              }`}
            >
              {industry}
            </button>
          );
        })}
      </div>

      {/* Size Filter */}
      <select
        value={filters.size || ''}
        onChange={(e) => onFilterChange({ size: e.target.value || undefined })}
        className="px-4 py-2 border border-button rounded-[10px] text-[14px] outline-none focus:ring-2 focus:ring-button/20"
      >
        <option value="">All Sizes</option>
        {sizeOptions.map((size) => (
          <option key={size} value={size}>
            {size} employees
          </option>
        ))}
      </select>

      {/* Location Filter */}
      <select
        value={filters.location || ''}
        onChange={(e) =>
          onFilterChange({ location: e.target.value || undefined })
        }
        className="px-4 py-2 border border-button rounded-[10px] text-[14px] outline-none focus:ring-2 focus:ring-button/20"
      >
        <option value="">All Locations</option>
        {locationOptions.map((location) => (
          <option key={location} value={location}>
            {location}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CompanyFilters;

