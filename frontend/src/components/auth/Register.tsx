import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from './AuthForm';
import Modal from './Modal';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';


const Register = () => {
  const [role, setRole] = useState<"graduate" | "company">("graduate");
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const {register} = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGoogleAuth, setIsGoogleAuth] = useState(false); 
  const navigate = useNavigate();

  // GOOGLE LOGIN
  const google = useGoogleLogin({
    flow: "auth-code",
    onSuccess: async (codeResponse) => {
      try {
        const res = await axios.post(
          `${import.meta.env.VITE_APP_API_URL}/auth/google/authcode`,
          {
            code: codeResponse.code,
            role,
          }
        );

        console.log(res.data);
        
        setIsGoogleAuth(true);
        
        setIsModalOpen(true);
      } catch (err) {
        console.error(err);
        setError("Google login failed");
      }
    },
    onError: (err) => {
      console.error('Google login error', err);
      setError('Google login failed');
    },
  });



  


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setError('');
  
    setIsModalOpen(true);
    setIsGoogleAuth(false); 
  };


  const handleModalProceed = async () => {
    setIsModalOpen(false);


    if (isGoogleAuth) {
  
      if (role === 'graduate') {
        navigate('/onboarding');
      } else {
        navigate('/company/onboarding');
      }
      return;
    }


    setIsLoading(true);
    setError('');
    try {
     
      const backendRole = role === 'graduate' ? 'graduate' : 'company';

      await register(email, password, backendRole);

     
      if (backendRole === 'graduate') {
        navigate('/onboarding');
      } else {
        navigate('/company/onboarding');
      }


      setEmail('');
      setPassword('');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AuthForm
        mode="register"
        role={role}
        setRole={setRole}
        title={`Create ${role === "graduate" ? "Graduate" : "Company"} Account`}
        subtitle={
          role === "graduate"
            ? "Join our talent marketplace as a graduate"
            : "Register your company to hire top talents"
        }
        buttonText={isLoading ? 'Processing...' : 'Continue'}
        linkText="Already have an account? Login"
        linkPath="/login"
        onGoogleClick={google}
        fields={[
          {
            label: 'Email',
            name: 'email',
            type: 'email',
            placeholder: role === 'company' ? 'company@example.com' : 'john@example.com',
            value: email,
            onChange: (e: any) => setEmail(e.target.value),
          },
          {
            label: 'Password',
            name: 'password',
            type: 'password',
            placeholder: 'password',
            value: password,
            onChange: (e: any) => setPassword(e.target.value),
          },
        ]}
        error={error}
        onSubmit={handleSubmit}
      />

      {/* MODAL */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="pt-[40px] flex flex-col items-center gap-[30px] font-inter">
          <img src="/proceed.png" alt="proceed" className="w-[156px]" />

          <p className="text-[32px] font-semibold text-[#1C1C1C]">
            Before you Proceed
          </p>

          <p className="text-[#1C1C1CBF] text-[18px] text-center">
            Do you consent to us using your data to better serve you?
          </p>

          <button
            onClick={handleModalProceed}
            className="w-full bg-button text-white py-4 rounded-[10px]"
            disabled={isLoading}
          >
            {isLoading ? 'Please wait...' : 'Yes, proceed'}
          </button>
        </div>
      </Modal>
    </>
  );
};

export default Register;
