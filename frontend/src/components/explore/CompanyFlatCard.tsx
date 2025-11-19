import React from 'react';
import { CiMail } from 'react-icons/ci';
import { PiBuildingApartmentLight } from 'react-icons/pi';
import { useNavigate } from 'react-router-dom';
import { Company } from './CompanyCard';

interface CompanyCardProps {
  company: Company;
  buttonText?: string;
  onButtonClick?: () => void;
  onPreviewClick?: (companyId: number) => void;
}

const CompanyFlatCard: React.FC<CompanyCardProps> = ({
  company,
  buttonText = 'Preview',
  onPreviewClick,
}) => {
  const navigate = useNavigate();

  const handleButtonClick = (companyId: number, buttonText: string) => {
    if (buttonText === 'Preview') {
      // Use modal callback if provided, otherwise navigate
      if (onPreviewClick) {
        onPreviewClick(companyId);
      } else {
        navigate(`/explore-preview/${companyId}`);
      }
    }
    if (buttonText === 'Get in Touch') {
      navigate(`/contactCompany/${companyId}`);
    }
  };
  return (
    <div className="flex items-center gap-[26px] max-w-[878px] py-[18px] px-[17px] border border-fade rounded-[10px] bg-white hover:border-button/30 hover:shadow-md transition-all duration-200 group">
      <div className="w-[126px] aspect-square relative overflow-hidden rounded-[10px] ">
        <img
          src={company.image}
          alt={company.name}
          className="object-cover w-full h-full"
        />
        <div className="absolute top-2 left-2 bg-white/20 backdrop-blur-sm text-[18px] border border-white/30 p-[8px] rounded-full shadow-lg">
          <PiBuildingApartmentLight className="text-white" />
        </div>
      </div>

      <div className='flex flex-col flex-grow'>
      <div className="flex   gap-[81.5px]">
        <div className="flex flex-col gap-[5px]">
          <p className="font-semibold text-[24px] max-w-[114px] text-[#1C1C1C]">
            {company.name}
          </p>
          <p className="font-sf font-normal text-[16px]   text-[#1C1C1CBF]">
            {company.role}
          </p>
        </div>
        <div className="flex items-center h-[49px] bg-gradient-to-r from-button/10 to-button/5 border border-button/20 text-[#1C1C1C] text-[16px] font-semibold py-[15px] px-6 rounded-[70px] shadow-sm">
          <span className="text-button mr-1">●</span>
          {company.match}% match
        </div>
      </div>

      <div className='flex items-center justify-center gap-[47px]'>
        <div className="flex w-full items-center justify-between">
          <p className="text-left w-full font-semibold text-[16px]">
            {company.contract}
          </p>
          <div className="h-[20px] bg-black w-0.5" />
          <p className="text-center  font-semibold w-full mx-2">
            {company.location}
          </p>
          <div className="h-[20px] bg-black w-0.5" />
          <p className="text-center font-semibold w-full">
            {company.wage} {company.wageType}
          </p>
        </div>
        <button
          onClick={() =>
            handleButtonClick(
              company.id,
              buttonText === 'Preview' ? 'Preview' : 'Get in Touch'
            )
          }
          className="h-[55px] cursor-pointer bg-button w-full rounded-[10px] text-[#F8F8F8] flex items-center justify-center gap-2.5 font-medium transition-all duration-200 hover:bg-[#176300] hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg"
        >
          <CiMail
            className={`text-[24px] ${buttonText === 'Preview' && 'hidden'}`}
          />
          {buttonText}
        </button>
      </div>
      </div>
    </div>
  );
};

export default CompanyFlatCard;
