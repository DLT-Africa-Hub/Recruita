import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthForm from './AuthForm';

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
    <AuthForm
      title="Login"
      subtitle="Welcome Back"
      buttonText="Continue"
      linkText="Don't have an account? Please register here"
      linkPath="/register"
      onSubmit={handleSubmit}
      fields={[
        {
          label: 'Email',
          name: 'email',
          type: 'email',
          placeholder: 'John@example.com',
          value: email,
          onChange: (e) => setEmail(e.target.value),
        },
        {
          label: 'Password',
          name: 'password',
          type: 'password',
          placeholder: 'password',
          value: password,
          onChange: (e) => setPassword(e.target.value),
        },
      ]}
      error={error}
    />
  );
};

export default Login;
