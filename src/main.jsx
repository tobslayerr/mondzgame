// frontend/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import "react-datepicker/dist/react-datepicker.css";
import AuthPage from './pages/AuthPage.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import GachaPage from './pages/GachaPage.jsx';
import UserDashboardPage from './pages/UserDashboardPage.jsx';
import useAuth from './hooks/useAuth.js';

// Import komponen-komponen halaman admin
import AddAccountPage from './pages/admin/AddAccountPage.jsx';
import ListAccountPage from './pages/admin/ListAccountPage.jsx';
import InvoicePage from './pages/admin/InvoicePage.jsx';
import AdminPaymentSettings from './pages/admin/AdminPaymentSettings.jsx';
import AdminPlayerConfigs from './pages/admin/AdminPlayerConfigs.jsx';
import AdminPackageConfigs from './pages/admin/AdminPackageConfigs.jsx'; // <-- 1. Import halaman pengaturan probabilitas paket

// Component for private routes
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
      return (
        <div className="min-h-screen bg-primary-dark flex items-center justify-center">
            <p className="text-text-light">Loading authentication...</p>
        </div>
      );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route path="/gacha/:token" element={<GachaPage />} />
        <Route path="/user/dashboard" element={<UserDashboardPage />} />

        {/* --- Nested Routes for Admin Dashboard --- */}
        <Route 
          path="/admin/dashboard" 
          element={
            <PrivateRoute>
              <AdminDashboard />
            </PrivateRoute>
          }
        >
          {/* Default child route for /admin/dashboard */}
          <Route index element={<Navigate to="accounts/list" replace />} />
          <Route path="accounts/add" element={<AddAccountPage />} />
          <Route path="accounts/list" element={<ListAccountPage />} />
          <Route path="invoices" element={<InvoicePage />} />
          <Route path="payment-settings" element={<AdminPaymentSettings />} />
          <Route path="player-configs" element={<AdminPlayerConfigs />} />
          <Route path="package-configs" element={<AdminPackageConfigs />} /> {/* <-- 2. Daftarkan rute ke sini */}
          
          {/* Catch-all route untuk 404 dalam dashboard */}
          <Route path="*" element={<Navigate to="accounts/list" replace />} />
        </Route>
        {/* --- End Nested Routes --- */}

        {/* Default catch-all route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  </React.StrictMode>,
);