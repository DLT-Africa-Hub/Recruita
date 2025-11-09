import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Login failed. Please try again.'
      );
    }
  };

  return (
    <div className="flex items-center justify-center h-screen w-full font-inter bg-[#FFFFFF]">
      <div className="flex flex-col  items-center justify-center gap-[20px] bg-[#F9F9F9] lg:pt-[124px] py-[45px] w-full h-full max-w-[1058px] lg:h-auto px-[15px] lg:px-[150px] rounded-[20px] ">
        <form className="flex flex-col gap-[24px] justify-between h-full  w-full max-w-[400px]">
          <div className="w-full flex flex-col text-left md:text-center">
            <p className="font-semibold text-[32px] text-[#1C1C1C]">
              Login
            </p>
            <p className="font-normal text-[18px] text-[#1C1C1CBF]">
              Welcome Back
            </p>
          </div>
          <div className='flex flex-col gap-[24px]'>
            <div className="w-full flex flex-col gap-[10px] max-w-[542px]">
              <label className="text-[#1C1C1CBF] text-[18px] font-normal">
                Email
              </label>
              <input
                type="email"
                placeholder="John@example.com"
                name="email"
                className="h-[62px] border border-[#C8D7EF] rounded-xl w-full px-5 bg-[#FFFFFF] placeholder:text-[#1C1C1C33]"
              />
            </div>
            <div className="w-full flex flex-col gap-[10px] max-w-[542px]">
              <label className="text-[#1C1C1CBF] text-[18px] font-normal">
                Password
              </label>
              <input
                type="password"
                placeholder="password"
                name="password"
                className="h-[62px] border border-[#C8D7EF] rounded-xl w-full px-5 bg-[#FFFFFF] placeholder:text-[#1C1C1C33]"
              />
            </div>
          </div>

          <div className='flex flex-col gap-[10px]'>
                <button type='submit' className='w-full  flex items-center justify-center gap-[12px] text-[16px] bg-button py-[15px] rounded-[10px] text-[#F8F8F8] cursor-pointer'>
                    Continue
                </button>
                <button className='w-full  flex items-center justify-center gap-[12px] text-[16px] border-2 border-button py-[15px] rounded-[10px] text-[#1C1C1C] cursor-pointer'>
                  <img src="/google.png" alt="google" />
                Continue with Google
                </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
