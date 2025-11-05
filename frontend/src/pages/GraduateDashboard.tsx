import { useState, useEffect } from 'react';
import api from '../api/auth';

const GraduateDashboard = () => {
  const [profile, setProfile] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch graduate profile and matches
    // const fetchData = async () => {
    //   try {
    //     const profileRes = await api.get('/graduates/profile');
    //     const matchesRes = await api.get('/graduates/matches');
    //     setProfile(profileRes.data);
    //     setMatches(matchesRes.data.matches);
    //   } catch (error) {
    //     console.error('Error fetching data:', error);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    // fetchData();
    setLoading(false);
  }, []);

  if (loading) {
    return <div style={containerStyle}>Loading...</div>;
  }

  return (
    <div style={containerStyle}>
      <h1>Graduate Dashboard</h1>
      <p>TODO: Implement profile management, assessment submission, and match viewing</p>
      
      {/* TODO: Profile Section */}
      {/* TODO: Assessment Submission */}
      {/* TODO: Matches List */}
    </div>
  );
};

const containerStyle: React.CSSProperties = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '2rem',
};

export default GraduateDashboard;

