import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Train, Users, Shield, Zap, ArrowRight, Code } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();
  const [collegeCode, setCollegeCode] = useState('');

  const handleJoinCollege = (e) => {
    e.preventDefault();
    if (collegeCode.trim()) {
      navigate(`/college/${collegeCode.trim().toUpperCase()}`);
    }
  };

  const handleGetStarted = () => {
    navigate('/setup');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-600 text-white rounded-2xl p-6 text-6xl">
              🚂
            </div>
          </div>
          
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6">
            Take Your Seat
          </h1>
          
          <p className="text-xl sm:text-2xl text-gray-600 mb-8">
            The Ultimate Train Ticket Booking Platform for Educational Institutions
          </p>
          
          <p className="text-lg text-gray-500 mb-12">
            Manage industrial visits, field trips, and group travel with ease. 
            Real-time seat booking, multi-route support, and powerful admin controls.
          </p>

          {/* Join with Code */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">
              Already have a college code?
            </h3>
            <form onSubmit={handleJoinCollege} className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                value={collegeCode}
                onChange={(e) => setCollegeCode(e.target.value.toUpperCase())}
                placeholder="Enter 6-digit college code"
                maxLength={6}
                className="flex-1 px-6 py-4 text-lg border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
              />
              <button
                type="submit"
                className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                Join Now
                <ArrowRight size={20} />
              </button>
            </form>
          </div>

          {/* Get Started Button */}
          <button
            onClick={handleGetStarted}
            className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xl font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
          >
            Get Started - Create Your College
            <ArrowRight size={24} />
          </button>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Train className="text-blue-600" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Real-Time Booking
            </h3>
            <p className="text-gray-600">
              Live seat updates with instant booking confirmation and conflict prevention
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
            <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Users className="text-green-600" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Multi-College Support
            </h3>
            <p className="text-gray-600">
              Each college gets its own isolated booking system with unique code
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
            <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Shield className="text-purple-600" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Secure Admin Panel
            </h3>
            <p className="text-gray-600">
              Password-protected admin access with full booking management
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
            <div className="bg-yellow-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Zap className="text-yellow-600" size={32} />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Easy Setup
            </h3>
            <p className="text-gray-600">
              Get started in minutes with our simple onboarding process
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-2xl shadow-xl p-12 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            How It Works
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Create Your College
              </h3>
              <p className="text-gray-600">
                Set up your college profile with name, bogies, routes, and admin password
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Share Your Code
              </h3>
              <p className="text-gray-600">
                Get a unique 6-digit code and share it with your students
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Start Booking
              </h3>
              <p className="text-gray-600">
                Students book seats in real-time while you manage everything from admin panel
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-600">
          <p className="mb-2">
            <strong>Powered by Take Your Seat</strong>
          </p>
          <p className="text-sm">
            Built with ❤️ for educational institutions
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
