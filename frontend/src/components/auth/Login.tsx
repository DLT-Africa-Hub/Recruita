import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { graduateApi } from '../../api/graduate';
import { companyApi } from '../../api/company';
import AuthForm from './AuthForm';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [role, setRole] = useState('graduate');
  const { login } = useAuth();
  const navigate = useNavigate();

 
  const handlePostLoginNavigation = async (userRole) => {
    if (userRole === 'graduate') {
      try {
    
        const profileResponse = await graduateApi.getProfile();
        const graduate = profileResponse.graduate;
        
       
        if (graduate) {
          const assessmentData = graduate.assessmentData;
          const hasCompletedAssessment = assessmentData?.submittedAt != null;

          if (!hasCompletedAssessment) {
    
            navigate('/assessment', { replace: true });
            return;
          }

    
          navigate('/graduate', { replace: true });
          return;
        }
      } catch (profileError) {
    
        if (profileError.response?.status === 404) {
          navigate('/onboarding', { replace: true });
          return;
        }

       
        if (profileError.response?.status === 401) {
          setError('Session expired. Please log in again.');
          return;
        }

        
        console.error('Profile check error:', profileError);
        navigate('/onboarding', { replace: true });
        return;
      }
    }

    if (userRole === 'company') {
      try {
        
        await companyApi.getProfile();
        
 
        navigate('/company', { replace: true });
        return;
      } catch (profileError) {
     
        if (profileError.response?.status === 404) {
          navigate('/company/onboarding', { replace: true });
          return;
        }

     
        if (profileError.response?.status === 401) {
          setError('Session expired. Please log in again.');
          return;
        }

     
        console.error('Company profile check error:', profileError);
        navigate('/company/onboarding', { replace: true });
        return;
      }
    }

    // Default redirect based on role
    if (userRole === 'admin') {
      navigate('/admin', { replace: true });
    } else {
      navigate('/graduate', { replace: true });
    }
  };

  const onSuccess = async (data) => {
    console.log('Logged in user:', data);
    
 
    localStorage.setItem('refreshToken', data.refreshToken);
    if (data.accessToken) {
      localStorage.setItem('token', data.accessToken);
    }
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
    }

  
    await new Promise((resolve) => setTimeout(resolve, 100));

    const loggedInUser = data.user || JSON.parse(localStorage.getItem('user') || '{}');
    

    await handlePostLoginNavigation(loggedInUser.role);
  };

  const onError = (error) => {
    console.error('Google login error:', error);
    setError('Google login failed. Please try again.');
  };

  const googleSubmit = useGoogleLogin({
    flow: 'auth-code',
    onSuccess: async (codeResponse) => {
      try {
        const res = await axios.post(
          `${import.meta.env.VITE_APP_API_URL}/auth/google/authcode`,
          {
            code: codeResponse.code,
            role: role, 
          }
        );
        await onSuccess(res.data);
      } catch (error) {
        onError(error);
        console.error('Google auth error:', error);
      }
    },
    onError: (error) => {
      onError(error);
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);

      
      await new Promise((resolve) => setTimeout(resolve, 100));

      const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');

    
      await handlePostLoginNavigation(loggedInUser.role);
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.message || 'Login failed. Please try again.'
      );
    }
  };

  return (
    <>
    

      {/* Auth Form */}
      <AuthForm
        title="Login"
        subtitle={`Welcome Back ${role === 'graduate' ? 'Graduate' : 'Company'}`}
        buttonText="Continue"
        linkText="Don't have an account? Please register here"
        linkPath="/register"
        onSubmit={handleSubmit}
        onGoogleClick={googleSubmit}
        fields={[
          {
            label: 'Email',
            name: 'email',
            type: 'email',
            placeholder: role === 'company' ? 'company@example.com' : 'john@example.com',
            value: email,
            onChange: (e) => {
              setEmail(e.target.value);
              if (error) setError('');
            },
          },
          {
            label: 'Password',
            name: 'password',
            type: 'password',
            placeholder: 'password',
            value: password,
            onChange: (e) => {
              setPassword(e.target.value);
              if (error) setError('');
            },
          },
        ]}
        error={error}
      />
    </>
  );
};

export default Login;