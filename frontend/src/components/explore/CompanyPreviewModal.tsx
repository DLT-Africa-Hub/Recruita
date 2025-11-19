import { useEffect } from 'react';
import { HiOutlineChatBubbleLeftRight } from 'react-icons/hi2';
import { PiBuildingApartmentLight } from 'react-icons/pi';
import { BsSend } from 'react-icons/bs';
import { Company } from './CompanyCard';

interface CompanyPreviewModalProps {
  isOpen: boolean;
  company: Company | null;
  onClose: () => void;
  onChat?: () => void;
  onApply?: () => void;
}

const CompanyPreviewModal: React.FC<CompanyPreviewModalProps> = ({
  isOpen,
  company,
  onClose,
  onChat,
  onApply,
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !company) return null;

  const jobDesc =
    'We are seeking a talented Frontend Developer to join our dynamic team. You will be responsible for building and maintaining user-facing features using React and modern JavaScript. You will work closely with our design team to implement responsive, accessible, and performant web applications. The ideal candidate has experience with React, JavaScript, CSS, and HTML, and is passionate about creating exceptional user experiences. You will collaborate with backend developers to integrate APIs and ensure seamless data flow.';

  const skills = ['React', 'TypeScript', 'JavaScript'];

  const handleChat = () => {
    onChat?.();
  };

  const handleApply = () => {
    onApply?.();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={(e) => {
        // Close when clicking backdrop
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="company-preview-title"
    >
      <div className="border flex flex-col gap-[20px] border-fade py-[45px] w-full max-w-[1058px] max-h-[90vh] lg:h-auto px-[15px] lg:px-[150px] rounded-[20px] bg-white relative overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 flex h-[32px] w-[32px] items-center justify-center rounded-full bg-[#F0F0F0] text-[#1C1C1C] transition hover:bg-[#E0E0E0] z-10"
          aria-label="Close preview"
        >
          <span className="text-[20px] font-bold">×</span>
        </button>

        {/* Company Image */}
        <div className="w-full h-[232px] relative">
          <img
            src={company.image}
            className="object-cover w-full h-full rounded-[10px]"
            alt={company.name}
          />
          <div className="absolute top-2 left-2 bg-white/20 backdrop-blur-xs text-[18px] border border-white/30 p-[12px] rounded-full shadow-lg">
            <PiBuildingApartmentLight className="text-[#F8F8F8]" />
          </div>
        </div>

        {/* Company and Job Details */}
        <div className="flex justify-between w-full">
          <div className="flex flex-col gap-[5px]">
            <p className="font-semibold text-[24px] max-w-[114px] text-[#1C1C1C]">
              {company.name}
            </p>
            <p className="font-sf font-normal text-[16px] max-w-[114px] text-[#1C1C1CBF]">
              {company.role}
            </p>
          </div>
          <div className="flex items-center h-[49px] bg-fade text-[#1C1C1CBF] text-[16px] py-[15px] px-6 rounded-[70px]">
            {company.match}% match
          </div>
        </div>

        {/* Job Description */}
        <div className="flex flex-col gap-5">
          <p className="font-semibold text-[20px] text-[#1C1C1C]">
            Job Description
          </p>
          <p className="text-[16px] font-normal text-[#1C1C1CBF] leading-relaxed">
            {jobDesc}
          </p>
        </div>

        {/* Skills */}
        <div className="flex flex-col gap-[27px]">
          <div className="flex items-center gap-[6px] flex-wrap">
            {skills.map((skill) => (
              <button
                key={skill}
                className="border border-button text-button rounded-[50px] py-[5px] px-2.5 text-[14px]"
              >
                {skill}
              </button>
            ))}
          </div>

          {/* Employment Information */}
          <div className="flex w-full items-center justify-between">
            <p className="text-center w-full font-semibold text-[16px]">
              {company.contract}
            </p>
            <div className="h-[20px] bg-black w-0.5" />
            <p className="text-center w-full font-semibold">{company.location}</p>
            <div className="h-[20px] bg-black w-0.5" />
            <p className="text-center w-full font-semibold">
              {company.wage} {company.wageType}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row w-full gap-[15px] items-center justify-center">
            <button
              type="button"
              onClick={handleChat}
              className="w-full flex items-center justify-center gap-[12px] border border-button py-[15px] rounded-[10px] text-button cursor-pointer transition hover:bg-[#F8F8F8]"
            >
              <HiOutlineChatBubbleLeftRight className="text-[24px]" />
              <p className="text-[16px] font-medium">Chat</p>
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="w-full flex items-center justify-center gap-[12px] bg-button py-[15px] rounded-[10px] text-[#F8F8F8] cursor-pointer transition hover:bg-[#176300]"
            >
              <BsSend className="text-[24px]" />
              <p className="text-[16px] font-medium">Apply</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyPreviewModal;

