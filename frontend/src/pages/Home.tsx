import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div style={containerStyle}>
      <div style={heroStyle}>
        <h1 style={titleStyle}>Talent Hub</h1>
        <p style={subtitleStyle}>
          AI-Driven Job Matching Platform connecting graduates with companies
        </p>
        {!isAuthenticated ? (
          <div style={buttonGroupStyle}>
            <Link to="/register" style={primaryButtonStyle}>
              Get Started
            </Link>
            <Link to="/login" style={secondaryButtonStyle}>
              Login
            </Link>
          </div>
        ) : (
          <div style={buttonGroupStyle}>
            {user?.role === 'graduate' && (
              <Link to="/graduate" style={primaryButtonStyle}>
                Go to Dashboard
              </Link>
            )}
            {user?.role === 'company' && (
              <Link to="/company" style={primaryButtonStyle}>
                Go to Dashboard
              </Link>
            )}
            {user?.role === 'admin' && (
              <Link to="/admin" style={primaryButtonStyle}>
                Go to Admin Panel
              </Link>
            )}
          </div>
        )}
      </div>

      <div style={featuresStyle}>
        <div style={featureCardStyle}>
          <h3>For Graduates</h3>
          <p>
            Complete your profile, take AI assessments, and get matched with
            relevant job opportunities.
          </p>
        </div>
        <div style={featureCardStyle}>
          <h3>For Companies</h3>
          <p>
            Post job openings and let AI automatically match you with the best
            candidates.
          </p>
        </div>
        <div style={featureCardStyle}>
          <h3>AI-Powered Matching</h3>
          <p>
            Advanced algorithms analyze skills and requirements to find the
            perfect match.
          </p>
        </div>
      </div>
    </div>
  );
};

// TODO: Move styles to CSS module or styled-components
const containerStyle: React.CSSProperties = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '2rem',
};

const heroStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: '4rem 0',
};

const titleStyle: React.CSSProperties = {
  fontSize: '3rem',
  marginBottom: '1rem',
  color: '#1f2937',
};

const subtitleStyle: React.CSSProperties = {
  fontSize: '1.25rem',
  color: '#6b7280',
  marginBottom: '2rem',
};

const buttonGroupStyle: React.CSSProperties = {
  display: 'flex',
  gap: '1rem',
  justifyContent: 'center',
};

const primaryButtonStyle: React.CSSProperties = {
  backgroundColor: '#2563eb',
  color: 'white',
  padding: '0.75rem 2rem',
  borderRadius: '6px',
  textDecoration: 'none',
  fontSize: '1rem',
  fontWeight: '600',
};

const secondaryButtonStyle: React.CSSProperties = {
  backgroundColor: 'transparent',
  color: '#2563eb',
  padding: '0.75rem 2rem',
  borderRadius: '6px',
  textDecoration: 'none',
  fontSize: '1rem',
  fontWeight: '600',
  border: '2px solid #2563eb',
};

const featuresStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: '2rem',
  marginTop: '4rem',
};

const featureCardStyle: React.CSSProperties = {
  backgroundColor: 'white',
  padding: '2rem',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
};

export default Home;
