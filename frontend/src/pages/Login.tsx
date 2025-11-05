import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={titleStyle}>Login</h2>
        {error && <div style={errorStyle}>{error}</div>}
        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
            />
          </div>
          <div style={inputGroupStyle}>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={inputStyle}
            />
          </div>
          <button type="submit" style={buttonStyle}>
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

// TODO: Move styles to CSS module or styled-components
const containerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: 'calc(100vh - 200px)',
  padding: '2rem',
};

const cardStyle: React.CSSProperties = {
  backgroundColor: 'white',
  padding: '2rem',
  borderRadius: '8px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  width: '100%',
  maxWidth: '400px',
};

const titleStyle: React.CSSProperties = {
  fontSize: '2rem',
  marginBottom: '1.5rem',
  textAlign: 'center',
  color: '#1f2937',
};

const formStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
};

const inputGroupStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
};

const labelStyle: React.CSSProperties = {
  fontSize: '0.9rem',
  fontWeight: '500',
  color: '#374151',
};

const inputStyle: React.CSSProperties = {
  padding: '0.75rem',
  border: '1px solid #d1d5db',
  borderRadius: '4px',
  fontSize: '1rem',
};

const buttonStyle: React.CSSProperties = {
  backgroundColor: '#2563eb',
  color: 'white',
  padding: '0.75rem',
  border: 'none',
  borderRadius: '4px',
  fontSize: '1rem',
  fontWeight: '600',
  cursor: 'pointer',
  marginTop: '0.5rem',
};

const errorStyle: React.CSSProperties = {
  backgroundColor: '#fee2e2',
  color: '#dc2626',
  padding: '0.75rem',
  borderRadius: '4px',
  marginBottom: '1rem',
};

export default Login;

