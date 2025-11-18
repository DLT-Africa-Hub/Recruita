import { CandidateFilters as FilterType } from '../../types/explore';

interface CandidateFiltersProps {
  filters: FilterType;
  onFilterChange: (filters: Partial<FilterType>) => void;
}

const CandidateFilters: React.FC<CandidateFiltersProps> = ({
  filters,
  onFilterChange,
}) => {
  const experienceOptions = ['1-2 yrs', '3-5 yrs', '5+ yrs', '10+ yrs'];
  const availabilityOptions = ['Available', 'Not Available', 'Part-time'];
  const rankOptions: Array<'A' | 'B' | 'C' | 'D'> = ['A', 'B', 'C', 'D'];
  const commonSkills = [
    'React',
    'Node.js',
    'TypeScript',
    'JavaScript',
    'Python',
    'Java',
    'Vue.js',
    'Angular',
  ];

  return (
    <div className="flex flex-wrap items-center gap-[12px] mb-[20px]">
      {/* Experience Filter */}
      <select
        value={filters.experience || ''}
        onChange={(e) =>
          onFilterChange({ experience: e.target.value || undefined })
        }
        className="px-4 py-2 border border-button rounded-[10px] text-[14px] outline-none focus:ring-2 focus:ring-button/20"
      >
        <option value="">All Experience</option>
        {experienceOptions.map((exp) => (
          <option key={exp} value={exp}>
            {exp}
          </option>
        ))}
      </select>

      {/* Availability Filter */}
      <select
        value={filters.availability || ''}
        onChange={(e) =>
          onFilterChange({ availability: e.target.value || undefined })
        }
        className="px-4 py-2 border border-button rounded-[10px] text-[14px] outline-none focus:ring-2 focus:ring-button/20"
      >
        <option value="">All Availability</option>
        {availabilityOptions.map((avail) => (
          <option key={avail} value={avail}>
            {avail}
          </option>
        ))}
      </select>

      {/* Rank Filter */}
      <select
        value={filters.rank || ''}
        onChange={(e) =>
          onFilterChange({
            rank: (e.target.value as 'A' | 'B' | 'C' | 'D') || undefined,
          })
        }
        className="px-4 py-2 border border-button rounded-[10px] text-[14px] outline-none focus:ring-2 focus:ring-button/20"
      >
        <option value="">All Ranks</option>
        {rankOptions.map((rank) => (
          <option key={rank} value={rank}>
            Rank {rank}
          </option>
        ))}
      </select>

      {/* Skills Filter (Multi-select chips) */}
      <div className="flex flex-wrap items-center gap-[8px]">
        {commonSkills.map((skill) => {
          const isSelected = filters.skills?.includes(skill);
          return (
            <button
              key={skill}
              type="button"
              onClick={() => {
                const currentSkills = filters.skills || [];
                const newSkills = isSelected
                  ? currentSkills.filter((s) => s !== skill)
                  : [...currentSkills, skill];
                onFilterChange({ skills: newSkills.length > 0 ? newSkills : undefined });
              }}
              className={`px-3 py-1 rounded-full text-[12px] font-medium transition ${
                isSelected
                  ? 'bg-button text-white'
                  : 'bg-[#F8F8F8] border border-fade text-[#1C1C1C]'
              }`}
            >
              {skill}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CandidateFilters;

