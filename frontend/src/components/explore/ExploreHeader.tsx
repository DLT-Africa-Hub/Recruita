import { BsSearch } from 'react-icons/bs';

interface ExploreHeaderProps {
  role: 'graduate' | 'company' | 'admin' | null;
  searchValue: string;
  onSearchChange: (value: string) => void;
}

const ExploreHeader: React.FC<ExploreHeaderProps> = ({
  role,
  searchValue,
  onSearchChange,
}) => {
  const title =
    role === 'company'
      ? 'Browse Candidates'
      : role === 'graduate'
        ? 'Available Opportunities'
        : 'Explore';

  const placeholder =
    role === 'company'
      ? 'Search candidates by name, skills...'
      : 'Search companies...';

  return (
    <div className="flex flex-col-reverse gap-[43px] lg:flex-row justify-between items-start lg:items-center">
      <p className="font-medium text-[22px] text-[#1C1C1C]">{title}</p>

      <div className="flex gap-2.5 items-center self-end text-fade px-5 py-[13.5px] border border-button rounded-[10px] w-full max-w-[708px]">
        <BsSearch />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full placeholder:text-fade text-[#1c1c1c] outline-none"
          placeholder={placeholder}
        />
      </div>
    </div>
  );
};

export default ExploreHeader;

