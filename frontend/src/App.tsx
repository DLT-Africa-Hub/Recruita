import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import GraduateDashboard from './pages/talent/GraduateDashboard';
import CompanyDashboard from './pages/company/CompanyDashboard';
import CompanyCandidates from './pages/company/CompanyCandidates';
import CompanyJobs from './pages/company/CompanyJobs';
import CompanyJobForm from './pages/company/CompanyJobForm';
import CompanyOnboarding from './pages/company/CompanyOnboarding';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import AssessmentGuard from './components/AssessmentGuard';
import AccountType from './pages/AccountType';
import Layout from './components/layout/Layout';
import ExploreCompany from './pages/talent/ExploreCompany';
import GraduateApplications from './pages/talent/GraduateApplications';
import CompanyPreview from './pages/talent/CompanyPreview';
import CandidatePreview from './pages/company/CandidatePreview';
import ExplorePreview from './pages/ExplorePreview';
import AuthPage from './pages/AuthPage';
import Messages from './pages/Messages';
import Notifications from './pages/Notifications';
import GraduateOnboarding from './pages/talent/GraduateOnboarding';
import SkillAssessment from './pages/talent/SkillAssessment';

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/register" element={<AuthPage mode="register" />} />
          <Route
            path="/graduate/*"
            element={
              <ProtectedRoute allowedRoles={['graduate']}>
                <AssessmentGuard>
                  <Layout>
                    <GraduateDashboard />
                  </Layout>
                </AssessmentGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/company/*"
            element={
              <ProtectedRoute allowedRoles={['company']}>
                <CompanyDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/role" element={<AccountType />} />
          <Route path="/onboarding" element={<GraduateOnboarding />} />

          <Route
            path="/assessment"
            element={
              <ProtectedRoute allowedRoles={['graduate']}>
                <SkillAssessment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/company-preview/:id"
            element={<CompanyPreview mode="application" />}
          />
          <Route
            path="/contactCompany/:id"
            element={<CompanyPreview mode="contact" />}
          />
          <Route
            path="/explore"
            element={
              <ProtectedRoute allowedRoles={['graduate']}>
                <AssessmentGuard>
                  <Layout>
                    <ExploreCompany />
                  </Layout>
                </AssessmentGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/applications"
            element={
              <ProtectedRoute allowedRoles={['graduate']}>
                <AssessmentGuard>
                  <Layout>
                    <GraduateApplications />
                  </Layout>
                </AssessmentGuard>
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages/:id"
            element={
              <Layout>
                <Messages />
                </Layout>
              }
              />
          <Route path="/company/onboarding" element={<CompanyOnboarding />} />
         
       
          <Route
            path="/candidates"
            element={
              <Layout>
                <CompanyCandidates />

              </Layout>
            }
          />
          <Route

            path="/messages"
            element={
              <Layout>
                <Messages />
              </Layout>
              }/>

            <Route

            path="/candidate-preview/:id"
            element={
              <Layout>
                <CandidatePreview />

              </Layout>
            }
          />
          <Route

            path="/notifications"
            element={
              <Layout>
                <Notifications />
              </Layout>
            }
          />

          <Route

            path="/jobs"
            element={
              <Layout>
                <CompanyJobs />
              </Layout>
            }
          />
          <Route
            path="/jobs/new"
            element={
              <Layout>
                <CompanyJobForm />
              </Layout>
            }
          />
          <Route
            path="/explore-preview/:id"
            element={
              <Layout>
                <ExplorePreview />
              </Layout>
            }
          />
        
          
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
