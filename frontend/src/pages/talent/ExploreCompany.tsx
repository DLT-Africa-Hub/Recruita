import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { BsSearch } from 'react-icons/bs';

import CompanyFlatCard from '../../components/explore/CompanyFlatCard';
import CompanyCard from '../../components/explore/CompanyCard';
import CompanyPreviewModal from '../../components/explore/CompanyPreviewModal';
import { companies } from '../../data/companies';

const ExploreCompany = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const previewId = searchParams.get('preview');
  const [selectedCompany, setSelectedCompany] = useState(
    previewId ? companies.find((c) => c.id === Number(previewId)) || null : null
  );
  const [isModalOpen, setIsModalOpen] = useState(!!previewId);

  // Handle query param changes (e.g., browser back button)
  useEffect(() => {
    const newPreviewId = searchParams.get('preview');
    if (newPreviewId) {
      const company = companies.find((c) => c.id === Number(newPreviewId));
      setSelectedCompany(company || null);
      setIsModalOpen(!!company);
    } else {
      setSelectedCompany(null);
      setIsModalOpen(false);
    }
  }, [searchParams]);

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const previewId = new URLSearchParams(window.location.search).get('preview');
      if (!previewId) {
        setIsModalOpen(false);
        setSelectedCompany(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handlePreviewClick = (companyId: number) => {
    const company = companies.find((c) => c.id === companyId);
    if (company) {
      setSelectedCompany(company);
      setIsModalOpen(true);
      // Update URL with query param on current pathname
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set('preview', companyId.toString());
      const currentPath = window.location.pathname;
      navigate(`${currentPath}?${newSearchParams.toString()}`, { replace: false });
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCompany(null);
    // Remove preview param from URL, stay on current pathname
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete('preview');
    const currentPath = window.location.pathname;
    const newSearch = newSearchParams.toString();
    navigate(newSearch ? `${currentPath}?${newSearch}` : currentPath, {
      replace: true,
    });
  };

  const handleChat = () => {
    // TODO: Navigate to chat
  };

  const handleApply = () => {
    // TODO: Handle application
  };

  return (
    <>
      <div className="py-[20px] px-[20px] pb-[120px] lg:px-0 lg:pr-[20px] flex flex-col gap-[43px] items-start justify-center ">
        <div className="flex flex-col gap-[20px] w-full md:gap-[30px]">
          <div className=" flex flex-col-reverse gap-[43px] lg:flex-row justify-between items-start lg:items-center">
            <p className="font-medium text-[22px] text-[#1C1C1C]">
              Available Opportunites
            </p>

            <div className="flex gap-2.5 items-center self-end text-fade px-5 py-[13.5px] border border-button rounded-[10px] w-full max-w-[708px]">
              <BsSearch />
              <input
                type="text"
                className="w-full placeholder:text-fade text-[#1c1c1c] outline-none"
                placeholder="Search"
              />
            </div>
          </div>
          <div className=" hidden  lg:grid md:grid-cols-2 lg:grid-cols-1 gap-8   w-full">
            {companies.map((company, index) => (
              <CompanyFlatCard
                key={index}
                company={company}
                buttonText="Preview"
                onPreviewClick={handlePreviewClick}
              />
            ))}
          </div>
          <div className="grid grid-cols-1  md:grid-cols-2  gap-8  lg:hidden w-full">
            {companies.map((company, index) => (
              <CompanyCard
                key={index}
                company={company}
                buttonText="Preview"
                onPreviewClick={handlePreviewClick}
              />
            ))}
          </div>
        </div>
      </div>

      <CompanyPreviewModal
        isOpen={isModalOpen}
        company={selectedCompany}
        onClose={handleCloseModal}
        onChat={handleChat}
        onApply={handleApply}
      />
    </>
  );
};

export default ExploreCompany;
