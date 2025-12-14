import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Etkinlikler from './pages/Etkinlikler';
import Kategoriler from './pages/Kategoriler';
import Katilimcilar from './pages/Katilimcilar';
import Mekanlar from './pages/Mekanlar';
import Sponsorlar from './pages/Sponsorlar';
import Kayitlar from './pages/Kayitlar';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Yükleniyor...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Public Route - redirects to home if already logged in
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Yükleniyor...</span>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Main App Layout
const AppLayout = () => {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/etkinlikler" element={<ProtectedRoute><Etkinlikler /></ProtectedRoute>} />
        <Route path="/kategoriler" element={<ProtectedRoute><Kategoriler /></ProtectedRoute>} />
        <Route path="/katilimcilar" element={<ProtectedRoute><Katilimcilar /></ProtectedRoute>} />
        <Route path="/mekanlar" element={<ProtectedRoute><Mekanlar /></ProtectedRoute>} />
        <Route path="/sponsorlar" element={<ProtectedRoute><Sponsorlar /></ProtectedRoute>} />
        <Route path="/kayitlar" element={<ProtectedRoute><Kayitlar /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </Router>
  );
}

export default App;
