import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from './AuthForm';

const Register = () => {
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      navigate('/role');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <AuthForm
      title="Create Account"
      subtitle="Join our talent marketplace"
      buttonText="Continue"
      linkText="Already have an account? Login"
      linkPath="/login"
      onSubmit={handleSubmit}
      fields={[
        { label: 'First Name', name: 'firstName', type: 'text', placeholder: 'John', value: firstName, onChange: e => setFirstName(e.target.value) },
        { label: 'Email', name: 'email', type: 'email', placeholder: 'John@example.com', value: email, onChange: e => setEmail(e.target.value) },
        { label: 'Password', name: 'password', type: 'password', placeholder: 'password', value: password, onChange: e => setPassword(e.target.value) },
      ]}
      error={error}
    />
  );
};

export default Register;
