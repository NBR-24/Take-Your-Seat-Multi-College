import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Train, Users, Shield, Zap, ArrowRight } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import { useTheme } from '../contexts/ThemeContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const [collegeCode, setCollegeCode] = useState('');
  const [error, setError] = useState('');
  const { isDark } = useTheme();

  const handleJoinCollege = (e) => {
    e.preventDefault();
    if (!collegeCode.trim()) {
      setError('* Please enter a college code');
      return;
    }
    setError('');
    navigate(`/college/${collegeCode.trim().toUpperCase()}`);
  };

  const handleGetStarted = () => {
    navigate('/setup');
  };


  const bg = isDark ? 'bg-dark-700' : 'bg-gray-50';
  const cardBg = isDark ? 'glass-card' : 'bg-white rounded-2xl shadow-lg border border-gray-200';
  const heading = isDark ? 'text-white' : 'text-gray-900';
  const subtext = isDark ? 'text-gray-400' : 'text-gray-600';
  const mutedText = isDark ? 'text-gray-500' : 'text-gray-500';
  const inputBg = isDark
    ? 'bg-dark-400 border-dark-200 text-white placeholder-gray-500'
    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400';

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Gradient Background */}
      <div className={`absolute inset-0 ${isDark
        ? 'bg-gradient-to-br from-[#0a1f1f] via-[#0d2626] to-[#050f0f]'
        : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'}`}>
      </div>

      {/* Organic Flowing Shapes */}
      {isDark ? (
        <>
          {/* Dark Mode Glows */}
          {/* Top Left Glow */}
          <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-teal-500/20 rounded-full blur-[120px] animate-pulse"
            style={{ animationDuration: '8s' }}></div>

          {/* Center Right Glow */}
          <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-emerald-600/15 rounded-full blur-[100px] animate-pulse"
            style={{ animationDuration: '10s', animationDelay: '2s' }}></div>

          {/* Bottom Center Glow */}
          <div className="absolute bottom-0 left-1/4 w-[700px] h-[700px] bg-cyan-500/10 rounded-full blur-[130px] animate-pulse"
            style={{ animationDuration: '12s', animationDelay: '4s' }}></div>

          {/* Additional ambient glow */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-teal-400/5 rounded-full blur-[150px]"></div>
        </>
      ) : (
        <>
          {/* Light Mode Glows */}
          {/* Top Right Glow - Soft Blue */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-300/30 rounded-full blur-[100px] animate-pulse"
            style={{ animationDuration: '9s' }}></div>

          {/* Center Left Glow - Soft Purple */}
          <div className="absolute top-1/3 left-0 w-[600px] h-[600px] bg-purple-300/25 rounded-full blur-[120px] animate-pulse"
            style={{ animationDuration: '11s', animationDelay: '3s' }}></div>

          {/* Bottom Right Glow - Soft Pink */}
          <div className="absolute bottom-0 right-1/4 w-[550px] h-[550px] bg-pink-300/20 rounded-full blur-[110px] animate-pulse"
            style={{ animationDuration: '10s', animationDelay: '1s' }}></div>

          {/* Center Ambient - Soft Cyan */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-cyan-200/15 rounded-full blur-[140px]"></div>
        </>
      )}

      {/* Content Layer */}
      <div className="relative z-10">
        <div className="absolute top-4 right-4 z-50">
          <ThemeToggle />
        </div>

        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 text-accent text-sm font-medium px-4 py-2 rounded-full mb-8">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
              Now Open for Registrations
            </div>

            <h1 className={`text-5xl sm:text-7xl font-bold ${heading} mb-6 tracking-tight`}>
              Take Your <span className="text-accent">Seat</span>
            </h1>

            <p className={`text-xl sm:text-2xl ${subtext} mb-4 font-light`}>
              Seat Booking & Allocation Platform
            </p>

            <p className={`text-lg ${mutedText} mb-12 max-w-2xl mx-auto`}>
              Manage industrial visits, field trips, and group travel with ease. <br></br>
              Real-time seat booking, multi-route support, and powerful admin controls.
            </p>

            <div className={`${cardBg} p-8 mb-8 max-w-2xl mx-auto`}>
              <h3 className={`text-xl font-semibold ${heading} mb-4`}>
                Already have a college code?
              </h3>
              <form onSubmit={handleJoinCollege} className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <input
                    type="text"
                    value={collegeCode}
                    onChange={(e) => { setCollegeCode(e.target.value.toUpperCase()); setError(''); }}
                    placeholder="Enter 6-digit college code"
                    maxLength={6}
                    className={`flex-1 px-6 py-4 text-lg border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent uppercase ${error ? 'border-red-500' : ''} ${inputBg}`}
                  />
                  <button
                    type="submit"
                    className="px-8 py-4 bg-accent text-dark-700 font-bold rounded-xl hover:bg-accent-light transition-all flex items-center justify-center gap-2 hover:scale-105"
                  >
                    Join Now
                    <ArrowRight size={20} />
                  </button>
                </div>
                {error && <p className="text-red-500 text-sm font-medium text-left">{error}</p>}
              </form>
            </div>

            <button
              onClick={handleGetStarted}
              className={`inline-flex items-center gap-3 px-10 py-5 text-xl font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg ${isDark
                ? 'bg-white text-dark-700 hover:bg-gray-100 shadow-white/10'
                : 'bg-accent text-dark-700 hover:bg-accent-light shadow-accent/20'
                }`}
            >
              Get Started — Create Your College
              <ArrowRight size={24} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {[
              { icon: Train, title: 'Real-Time Booking', desc: 'Live seat updates with instant booking confirmation and conflict prevention' },
              { icon: Users, title: 'Multi-College', desc: 'Each college gets its own isolated booking system with unique code' },
              { icon: Shield, title: 'Secure Admin', desc: 'Password-protected admin access with full booking management' },
              { icon: Zap, title: 'Easy Setup', desc: 'Get started in minutes with our simple onboarding process' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className={`${cardBg} p-6 text-center hover:border-accent/30 transition-all group`}>
                <div className="bg-accent/10 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:bg-accent/20 transition-colors">
                  <Icon className="text-accent" size={32} />
                </div>
                <h3 className={`text-lg font-semibold ${heading} mb-2`}>{title}</h3>
                <p className={`${subtext} text-sm`}>{desc}</p>
              </div>
            ))}
          </div>

          <div className={`${cardBg} p-12 mb-16`}>
            <h2 className={`text-3xl font-bold ${heading} text-center mb-12`}>
              How It <span className="text-accent">Works</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { step: 1, title: 'Create Your College', desc: 'Set up your college profile with name, bogies, routes, and admin password' },
                { step: 2, title: 'Share Your Code', desc: 'Get a unique 6-digit code and share it with your students' },
                { step: 3, title: 'Start Booking', desc: 'Students book seats in real-time while you manage everything from admin panel' },
              ].map(({ step, title, desc }) => (
                <div key={step} className="text-center">
                  <div className="bg-accent text-dark-700 rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    {step}
                  </div>
                  <h3 className={`text-lg font-semibold ${heading} mb-2`}>{title}</h3>
                  <p className={`${subtext} text-sm`}>{desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={`text-center ${mutedText}`}>
            <p className="mb-2">
              <strong className={isDark ? 'text-gray-300' : 'text-gray-700'}>Powered by Take Your Seat</strong>
            </p>
            <p className="text-sm">Built with ❤️ LH</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
