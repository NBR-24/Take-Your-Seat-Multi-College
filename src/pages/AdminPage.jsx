import React, { useState, useEffect } from 'react';
import AdminLogin from '../components/AdminLogin';
import AdminDashboard from '../components/AdminDashboard';

const AdminPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if admin is already authenticated
    const adminAuth = localStorage.getItem('adminAuthenticated');
    if (adminAuth === 'true') {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (authenticated) => {
    setIsAuthenticated(authenticated);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? (
    <AdminDashboard onLogout={handleLogout} />
  ) : (
    <AdminLogin onLogin={handleLogin} />
  );
};

export default AdminPage;
