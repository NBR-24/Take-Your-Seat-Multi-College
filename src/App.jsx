import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Settings } from 'lucide-react';
import BookingPage from './pages/BookingPage';
import AdminPage from './pages/AdminPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow-sm border-b sticky top-0 z-40">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <Link to="/" className="flex items-center space-x-3">
                <div className="bg-blue-600 text-white rounded-lg p-2">
                  🚂
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-800">Take Your Seat</h1>
                  <p className="text-xs text-gray-600">Train Booking Platform</p>
                </div>
              </Link>
              
              <Link
                to="/admin"
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                title="Admin Panel"
              >
                <Settings size={20} />
                <span className="hidden sm:inline">Admin</span>
              </Link>
            </div>
          </div>
        </nav>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<BookingPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>

        {/* Footer */}
        <footer className="bg-white border-t mt-12">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center text-gray-600">
              <p className="mb-2">
                © 2025 Take Your Seat - Industrial Visit Train Booking Platform
              </p>
              <p className="text-sm">
                Built with ❤️ LH
              </p>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
