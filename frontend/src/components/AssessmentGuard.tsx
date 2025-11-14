import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { graduateApi } from '../api/graduate';
import { ReactNode } from 'react';

interface AssessmentGuardProps {
  children: ReactNode;
}

const AssessmentGuard: React.FC<AssessmentGuardProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const [hasCompletedAssessment, setHasCompletedAssessment] = useState(false);

  useEffect(() => {
    const checkAssessmentStatus = async () => {
      // Check authentication from context or localStorage
      const token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      const isAuth = isAuthenticated || (token && storedUser);
      const currentUser = user || (storedUser ? JSON.parse(storedUser) : null);

      if (!isAuth || currentUser?.role !== 'graduate') {
        setIsChecking(false);
        return;
      }

      try {
        const response = await graduateApi.getProfile();
        const assessmentData = response.graduate?.assessmentData;
        
        // Check if assessment has been submitted
        const completed = assessmentData?.submittedAt != null;
        setHasCompletedAssessment(completed);
      } catch (error: any) {
        // If profile doesn't exist (404), they need onboarding
        if (error.response?.status === 404) {
          setHasCompletedAssessment(false);
        } else {
          // For other errors, assume they need assessment
          setHasCompletedAssessment(false);
        }
      } finally {
        setIsChecking(false);
      }
    };

    checkAssessmentStatus();
  }, [isAuthenticated, user]);

  // Check authentication from context or localStorage
  const token = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');
  const isAuth = isAuthenticated || (token && storedUser);
  const currentUser = user || (storedUser ? JSON.parse(storedUser) : null);

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  if (currentUser?.role !== 'graduate') {
    return <>{children}</>;
  }

  if (isChecking) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-[18px] text-[#1C1C1CBF]">Loading...</p>
      </div>
    );
  }

  if (!hasCompletedAssessment) {
    return <Navigate to="/assessment" replace />;
  }

  return <>{children}</>;
};

export default AssessmentGuard;

