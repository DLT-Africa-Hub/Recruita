import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import CompanyCard, {Company} from '../../components/explore/CompanyCard';
import CompanyPreviewModal from '../../components/explore/CompanyPreviewModal';
import { companies } from '../../data/companies';

const GraduateDashboard = () => {
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

  const getRandom = (arr: Company[], n: number) => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, n);
  };

  const availableCompanies = useMemo(() => getRandom(companies, 4), []);
  const contractCompanies = useMemo(() => getRandom(companies, 4), []);

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
    <div className='py-[20px] px-[20px] pb-[120px] lg:px-0 lg:pr-[20px] flex flex-col gap-[43px] items-start justify-center '>

      
    <div className='flex flex-col gap-[20px] w-full md:gap-[30px]'>
      <p className='font-medium text-[22px] text-[#1C1C1C]'>
          Available Opportunites
        </p>
     
      <div className='grid grid-cols-1    md:grid-cols-2 lg:grid-cols-4 flex-wrap gap-8  w-full'>
        {availableCompanies.map((company, index) => (
          <CompanyCard
            key={index}
            company={company}
            buttonText="Preview"
            onPreviewClick={handlePreviewClick}
          />
        ))}
      </div>
    </div>
    <div className='flex flex-col gap-[20px] w-full md:gap-[30px]'>
      <p className='font-medium text-[22px] text-[#1C1C1C]'>
          Contract offers
        </p>
     
      <div className='grid grid-cols-1    md:grid-cols-2 lg:grid-cols-4 flex-wrap gap-8  w-full'>
        {contractCompanies.map((company, index) => (
          <CompanyCard
            key={index}
            company={company}
            buttonText="Get in Touch"
          />
        ))}
      </div>
    </div>

    <CompanyPreviewModal
      isOpen={isModalOpen}
      company={selectedCompany}
      onClose={handleCloseModal}
      onChat={handleChat}
      onApply={handleApply}
    />
  </div>
  );
};

export default GraduateDashboard;
