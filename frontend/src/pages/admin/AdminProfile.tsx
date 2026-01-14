import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { HiShieldCheck, HiEnvelope } from 'react-icons/hi2';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../../index';
import ChangePassword from '../../components/ChangePassword';
import AdminCalendlyIntegration from '../../components/admin/AdminCalendlyIntegration';
import { useToastContext } from '../../context/ToastContext';

const AdminProfile = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { success, error: showError } = useToastContext();

  // Handle Calendly OAuth callback redirect
  useEffect(() => {
    const calendlyStatus = searchParams.get('calendly');

    if (calendlyStatus === 'connected') {
      success('Calendly account connected successfully!');
      // Invalidate Calendly status query to refresh the UI
      queryClient.invalidateQueries({ queryKey: ['adminCalendlyStatus'] });
      // Clean up URL
      searchParams.delete('calendly');
      setSearchParams(searchParams, { replace: true });
    } else if (calendlyStatus === 'error') {
      const errorMessage =
        searchParams.get('message') || 'Failed to connect Calendly account';
      showError(decodeURIComponent(errorMessage));
      // Clean up URL
      searchParams.delete('calendly');
      searchParams.delete('message');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams, success, showError, queryClient]);

  if (!user) {
    return <LoadingSpinner message="Loading profile..." fullPage />;
  }

  return (
    <div className="py-[24px] px-[24px] flex flex-col gap-[32px]">
      {/* Header Section */}
      <div className="flex flex-col gap-[24px]">
        <div>
          <h1 className="text-[28px] font-semibold text-[#1C1C1C] mb-[8px]">
            Admin Profile
          </h1>
          <p className="text-[14px] text-[#1C1C1C80]">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="rounded-[20px] border border-fade bg-white p-[32px] shadow-sm">
          <div className="flex flex-col md:flex-row gap-[24px] items-start md:items-center">
            <div className="w-[120px] h-[120px] rounded-[16px] overflow-hidden bg-gradient-to-br from-button/20 to-button/10 border-2 border-fade shrink-0 flex items-center justify-center">
              <HiShieldCheck className="text-[60px] text-button" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-[24px] font-semibold text-[#1C1C1C] mb-[8px]">
                Administrator
              </h2>
              <div className="flex items-center gap-[8px] text-[14px] text-[#1C1C1C80] mb-[12px]">
                <HiShieldCheck className="text-[16px]" />
                <span className="capitalize">Admin Account</span>
              </div>
              {user.email && (
                <div className="flex items-center gap-[8px] text-[14px] text-[#1C1C1C80]">
                  <HiEnvelope className="text-[16px]" />
                  <span>{user.email}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-[32px]">
        <div className="flex flex-col gap-[24px]">
          <div className="rounded-[20px] border border-fade bg-white p-[24px] shadow-sm">
            <h3 className="text-[18px] font-semibold text-[#1C1C1C] mb-[20px] flex items-center gap-[8px]">
              <HiShieldCheck className="text-[20px] text-button" />
              Account Information
            </h3>
            <div className="grid gap-[20px]">
              <ProfileField
                icon={<HiEnvelope />}
                label="Email"
                value={user.email}
              />
              <ProfileField
                icon={<HiShieldCheck />}
                label="Role"
                value={user.role}
              />
              {user.emailVerified !== undefined && (
                <ProfileField
                  label="Email Verified"
                  value={user.emailVerified ? 'Yes' : 'No'}
                />
              )}
            </div>
          </div>

          <AdminCalendlyIntegration />
        </div>

        <ChangePassword />
      </div>
    </div>
  );
};

interface ProfileFieldProps {
  label: string;
  value?: string | number | null;
  icon?: React.ReactNode;
}

const ProfileField = ({ label, value, icon }: ProfileFieldProps) => {
  const displayValue = value || 'Not specified';

  return (
    <div className="flex items-start gap-[12px] p-[16px] rounded-[12px] bg-[#F8F8F8] hover:bg-[#F0F0F0] transition-colors">
      {icon && <div className="text-button mt-[2px] shrink-0">{icon}</div>}
      <div className="flex-1 min-w-0">
        <p className="text-[12px] text-[#1C1C1C80] uppercase tracking-wide mb-[6px] font-medium">
          {label}
        </p>
        <p className="text-[15px] text-[#1C1C1C] font-medium">{displayValue}</p>
      </div>
    </div>
  );
};

export default AdminProfile;
