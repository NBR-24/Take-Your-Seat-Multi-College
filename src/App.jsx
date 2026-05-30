import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Analytics } from "@vercel/analytics/react";
import { CollegeProvider } from './contexts/CollegeContext';
import { BookingPageSkeleton, SetupPageSkeleton } from './components/SkeletonLoaders';
import LandingPage from './pages/LandingPage';

// Lazy load heavy pages
const CollegeSetupPage = lazy(() => import('./pages/CollegeSetupPage'));
const CollegeBookingPage = lazy(() => import('./pages/CollegeBookingPage'));
const CollegeAdminPage = lazy(() => import('./pages/CollegeAdminPage'));
const AC2TierDemo = lazy(() => import('./pages/AC2TierDemo'));

function App() {
  return (
    <Router>
      <CollegeProvider>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<LandingPage />} />

            <Route
              path="/setup"
              element={
                <Suspense fallback={<SetupPageSkeleton />}>
                  <CollegeSetupPage />
                </Suspense>
              }
            />

            <Route
              path="/college/:collegeId"
              element={
                <Suspense fallback={<BookingPageSkeleton />}>
                  <CollegeBookingPage />
                </Suspense>
              }
            />

            <Route
              path="/college/:collegeId/admin"
              element={
                <Suspense fallback={<BookingPageSkeleton />}>
                  <CollegeAdminPage />
                </Suspense>
              }
            />

            <Route
              path="/ac2-demo"
              element={
                <Suspense fallback={<BookingPageSkeleton />}>
                  <AC2TierDemo />
                </Suspense>
              }
            />
          </Routes>
        </div>

        <Analytics />
      </CollegeProvider>
    </Router>
  );
}

export default App;
