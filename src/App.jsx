import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CollegeProvider } from './contexts/CollegeContext';
import LandingPage from './pages/LandingPage';
import CollegeSetupPage from './pages/CollegeSetupPage';
import CollegeBookingPage from './pages/CollegeBookingPage';
import CollegeAdminPage from './pages/CollegeAdminPage';
import BookingPage from './pages/BookingPage';
import AdminPage from './pages/AdminPage';

function App() {
  return (
    <Router>
      <CollegeProvider>
        <div className="min-h-screen bg-gray-50">
          {/* Routes */}
          <Routes>
            {/* New Multi-College Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/setup" element={<CollegeSetupPage />} />
            <Route path="/college/:collegeId" element={<CollegeBookingPage />} />
            <Route path="/college/:collegeId/admin" element={<CollegeAdminPage />} />
            
            {/* Legacy Routes (for backward compatibility) */}
            <Route path="/legacy" element={<BookingPage />} />
            <Route path="/legacy/admin" element={<AdminPage />} />
          </Routes>
        </div>
      </CollegeProvider>
    </Router>
  );
}

export default App;
