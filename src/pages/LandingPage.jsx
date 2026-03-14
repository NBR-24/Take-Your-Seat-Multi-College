import React, { useState, useRef, useEffect, useCallback, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import { Train, Users, Shield, Zap, ArrowRight, Menu, X, Check, XCircle, Loader2 } from 'lucide-react';
import { getCollegeByCode } from '../services/collegeService';
import ThemeToggle from '../components/ThemeToggle';
import { useTheme } from '../contexts/ThemeContext';


const useInView = (options = {}) => {
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true);
        observer.unobserve(element);
      }
    }, { threshold: 0.15, ...options });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return [ref, isInView];
};

// ===== Animated Section Wrapper =====
const AnimatedSection = ({ children, className = '', delay = 0 }) => {
  const [ref, isInView] = useInView();

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${className}`}
      style={{
        transitionDelay: `${delay}ms`,
        opacity: isInView ? 1 : 0,
        transform: isInView ? 'translateY(0)' : 'translateY(40px)',
      }}
    >
      {children}
    </div>
  );
};

// ===== Typewriter Hook =====
const useTypewriter = (words, typingSpeed = 120, deletingSpeed = 80, pauseDuration = 2000) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const word = words[currentWordIndex];

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        setCurrentText(word.substring(0, currentText.length + 1));
        if (currentText === word) {
          setTimeout(() => setIsDeleting(true), pauseDuration);
          return;
        }
      } else {
        setCurrentText(word.substring(0, currentText.length - 1));
        if (currentText === '') {
          setIsDeleting(false);
          setCurrentWordIndex((prev) => (prev + 1) % words.length);
        }
      }
    }, isDeleting ? deletingSpeed : typingSpeed);

    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, currentWordIndex, words, typingSpeed, deletingSpeed, pauseDuration]);

  return currentText;
};

// ===== Glow Button Component =====
const GlowButton = ({ children, className = '', onClick, type = 'button' }) => {
  const btnRef = useRef(null);
  const [glowPos, setGlowPos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e) => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    setGlowPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, []);

  return (
    <button
      ref={btnRef}
      type={type}
      className={`relative overflow-hidden ${className}`}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Radial glow that follows cursor */}
      {isHovered && (
        <div
          className="absolute pointer-events-none rounded-full transition-opacity duration-300"
          style={{
            width: '200px',
            height: '200px',
            left: glowPos.x - 100,
            top: glowPos.y - 100,
            background: 'radial-gradient(circle, rgba(0,212,126,0.35) 0%, transparent 70%)',
            opacity: isHovered ? 1 : 0,
          }}
        />
      )}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </button>
  );
};


const FeaturesSection = React.memo(({ isDark }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
    {[
      { icon: Train, title: 'Real-Time Booking', desc: 'Live seat updates with instant booking confirmation and conflict prevention' },
      { icon: Users, title: 'Multi-College', desc: 'Each college gets its own isolated booking system with unique code' },
      { icon: Shield, title: 'Secure Admin', desc: 'Password-protected admin access with full booking management' },
      { icon: Zap, title: 'Easy Setup', desc: 'Get started in minutes with our simple onboarding process' },
    ].map(({ icon: Icon, title, desc }, i) => (
      <AnimatedSection key={title} delay={i * 120}>
        <div
          className={`landing-card-hover rounded-2xl p-6 group cursor-default h-full ${isDark
            ? 'bg-dark-500/60 backdrop-blur-sm border border-white/5 hover:border-accent/30 hover:shadow-accent/5'
            : 'bg-white border border-gray-100 hover:border-emerald-200 hover:shadow-emerald-100/50'
            }`}
        >
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-colors ${isDark
            ? 'bg-accent/10 group-hover:bg-accent/20'
            : 'bg-emerald-50 group-hover:bg-emerald-100'
            }`}>
            <Icon className="text-accent" size={26} />
          </div>
          <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
          <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{desc}</p>
        </div>
      </AnimatedSection>
    ))}
  </div>
));

const HowItWorksSection = React.memo(({ isDark }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
    <div className={`hidden md:block absolute top-8 left-[calc(16.67%+24px)] right-[calc(16.67%+24px)] h-0.5 ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
    {[
      { step: 1, title: 'Create Your College', desc: 'Set up your college profile with name, bogies, routes, and admin password' },
      { step: 2, title: 'Share Your Code', desc: 'Get a unique 6-digit code and share it with your students' },
      { step: 3, title: 'Start Booking', desc: 'Students book seats in real-time while you manage everything from admin panel' },
    ].map(({ step, title, desc }) => (
      <AnimatedSection key={step} delay={step * 150}>
        <div className="text-center relative">
          <div className={`relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-extrabold mx-auto mb-5 transition-all ${isDark
            ? 'bg-accent text-dark-700 shadow-lg shadow-accent/20'
            : 'bg-accent text-white shadow-lg shadow-accent/30'
            }`}>
            {step}
          </div>
          <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
          <p className={`text-sm leading-relaxed max-w-xs mx-auto ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{desc}</p>
        </div>
      </AnimatedSection>
    ))}
  </div>
));


const LazySection = ({ children, className = '' }) => {
  const [ref, isInView] = useInView({ threshold: 0.05 });

  return (
    <div ref={ref} className={className}>
      {isInView ? children : <div className="min-h-[200px]" />}
    </div>
  );
};


const LandingPage = () => {
  const navigate = useNavigate();
  const [collegeCode, setCollegeCode] = useState('');
  const [error, setError] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [codeStatus, setCodeStatus] = useState('idle'); // 'idle' | 'checking' | 'valid' | 'invalid'
  const { isDark } = useTheme();

  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const howItWorksRef = useRef(null);


  const typedWord = useTypewriter(['Seat', 'Trip', 'Ride', 'Seat'], 130, 90, 1800);

  const isCodeComplete = collegeCode.trim().length === 6;


  useEffect(() => {
    if (!isCodeComplete) {
      setCodeStatus('idle');
      return;
    }
    let cancelled = false;
    setCodeStatus('checking');
    const timer = setTimeout(async () => {
      try {
        await getCollegeByCode(collegeCode.trim().toUpperCase());
        if (!cancelled) setCodeStatus('valid');
      } catch {
        if (!cancelled) setCodeStatus('invalid');
      }
    }, 400); // debounce
    return () => { cancelled = true; clearTimeout(timer); };
  }, [collegeCode, isCodeComplete]);

  const scrollToSection = useCallback((ref) => {
    setMobileMenuOpen(false);
    setTimeout(() => {
      ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }, []);

  const handleJoinCollege = (e) => {
    e.preventDefault();
    if (!collegeCode.trim()) {
      setError('* Please enter a college code');
      return;
    }
    if (codeStatus === 'invalid') {
      setError('* College not found. Check your code.');
      return;
    }
    setError('');
    navigate(`/college/${collegeCode.trim().toUpperCase()}`);
  };

  const handleGetStarted = () => {
    navigate('/setup');
  };

  const navLinks = [
    { label: 'Home', ref: heroRef },
    { label: 'Features', ref: featuresRef },
    { label: 'How It Works', ref: howItWorksRef },
  ];

  return (
    <div className={`min-h-screen relative overflow-hidden ${isDark ? 'bg-[#080c0e]' : 'bg-[#f8f9fb]'}`}>
      {/* ===== BACKGROUND LAYERS ===== */}
      {isDark ? (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a1a1f] via-[#0c1f1a] to-[#060e0e]" />
          <div className="hero-shape top-[-200px] left-[-150px] w-[600px] h-[600px] bg-emerald-500/15 animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="hero-shape top-[20%] right-[-100px] w-[500px] h-[500px] bg-teal-500/10 animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
          <div className="hero-shape bottom-[-150px] left-[20%] w-[700px] h-[700px] bg-cyan-500/8 animate-pulse" style={{ animationDuration: '12s', animationDelay: '4s' }} />
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }} />
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-white via-[#f0fdf4] to-[#ecfdf5]" />
          <div className="hero-shape top-[-200px] right-[-100px] w-[600px] h-[600px] bg-emerald-200/40" />
          <div className="hero-shape top-[30%] left-[-150px] w-[500px] h-[500px] bg-teal-100/50" />
          <div className="hero-shape bottom-[-100px] right-[20%] w-[500px] h-[500px] bg-green-100/40" />
          <div className="absolute inset-0 opacity-[0.02]" style={{
            backgroundImage: 'linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }} />
        </>
      )}

      {/* ===== NAVBAR ===== */}
      <nav className={`landing-navbar ${isDark ? 'bg-[#0a1a1f]/80 border-white/5' : 'bg-white/70 border-gray-200/50'}`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent/20 flex items-center justify-center">
              <Train className="text-accent" size={20} />
            </div>
            <span className={`text-lg font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Take Your Seat
            </span>
          </div>

          <div className="flex items-center gap-6">
            <div className={`hidden md:flex items-center gap-6 text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {navLinks.map(({ label, ref }) => (
                <button key={label} onClick={() => scrollToSection(ref)} className="hover:text-accent transition-colors cursor-pointer">
                  {label}
                </button>
              ))}
            </div>
            <ThemeToggle />
            <button
              className={`md:hidden p-2 rounded-lg transition-colors ${isDark ? 'text-gray-300 hover:bg-white/10' : 'text-gray-600 hover:bg-gray-100'}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className={`px-6 pb-4 pt-2 space-y-1 border-t ${isDark ? 'border-white/5 bg-[#0a1a1f]/95' : 'border-gray-100 bg-white/95'}`}>
            {navLinks.map(({ label, ref }) => (
              <button
                key={label}
                onClick={() => scrollToSection(ref)}
                className={`block w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isDark
                  ? 'text-gray-300 hover:text-accent hover:bg-white/5'
                  : 'text-gray-600 hover:text-accent hover:bg-gray-50'
                  }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* ===== MAIN CONTENT ===== */}
      <div className="relative z-10 pt-24">

        {/* ===== HERO SECTION ===== */}
        <section ref={heroRef} className="max-w-7xl mx-auto px-6 pt-12 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[500px]">

            {/* Left - Text Content */}
            <div className="animate-slideInLeft">
              <div className={`inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full mb-8 ${isDark
                ? 'bg-accent/10 border border-accent/20 text-accent'
                : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                }`}>
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                Now Open for Registrations
              </div>

              {/* ===== TYPEWRITER HEADLINE ===== */}
              <h1 className={`text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.1] mb-6 tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Take Your{' '}
                <span className="gradient-text inline-block min-w-[180px]">
                  {typedWord}
                  <span className={`inline-block w-[3px] h-[0.85em] ml-1 align-middle animate-pulse ${isDark ? 'bg-accent' : 'bg-emerald-500'}`} />
                </span>
              </h1>

              <p className={`text-xl sm:text-2xl font-light mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Seat Booking & Allocation Platform
              </p>

              <p className={`text-base leading-relaxed mb-10 max-w-lg ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                Manage industrial visits, field trips, and group travel with ease.
                Real-time seat booking, multi-route support, and powerful admin controls.
              </p>

              {/* Animated Train */}
              <div className={`relative w-full max-w-lg h-20 rounded-2xl overflow-hidden mb-8 ${isDark ? 'bg-dark-500/50 border border-white/5' : 'bg-gray-50 border border-gray-200'}`}>
                <div className={`absolute bottom-5 left-0 right-0 h-[2px] ${isDark ? 'bg-white/10' : 'bg-gray-300'}`} />
                <div className="absolute bottom-3 left-0 right-0 flex">
                  {Array.from({ length: 30 }).map((_, i) => (
                    <div key={i} className={`w-1 h-3 mx-[14px] ${isDark ? 'bg-white/5' : 'bg-gray-200'}`} />
                  ))}
                </div>
                <div className="absolute bottom-6 animate-[trainRun_6s_linear_infinite]">
                  <div className="flex items-end gap-0.5">
                    <div className="relative w-14 h-10 rounded-t-lg bg-accent">
                      <div className="absolute top-1 left-1 w-3 h-3 rounded-full bg-white/30" />
                      <div className="absolute top-1 right-1 w-3 h-3 rounded-full bg-white/30" />
                      <div className={`absolute -right-2 bottom-0 w-3 h-6 rounded-t ${isDark ? 'bg-accent-dark' : 'bg-emerald-600'}`} />
                      <div className="absolute -top-3 left-2 w-2 h-2 rounded-full bg-gray-400/40 animate-pulse" />
                      <div className="absolute -top-5 left-4 w-1.5 h-1.5 rounded-full bg-gray-400/30 animate-pulse" style={{ animationDelay: '0.3s' }} />
                    </div>
                    {[1, 2, 3].map((c) => (
                      <div key={c} className={`w-10 h-8 rounded-t-md ${isDark ? 'bg-emerald-700' : 'bg-emerald-400'} border-b-2 border-emerald-500`}>
                        <div className="flex gap-1 justify-center mt-1.5">
                          <div className="w-1.5 h-2 rounded-sm bg-white/40" />
                          <div className="w-1.5 h-2 rounded-sm bg-white/40" />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-[5px] absolute -bottom-[4px] left-1">
                    {[0, 1, 2, 3, 4, 5].map((w) => (
                      <div key={w} className={`w-2.5 h-2.5 rounded-full ${isDark ? 'bg-gray-300' : 'bg-gray-600'} border ${isDark ? 'border-gray-500' : 'border-gray-700'}`} />
                    ))}
                  </div>
                </div>
                <div className="absolute top-3 left-[15%] flex gap-1">
                  <div className={`w-1 h-1 rounded-full ${isDark ? 'bg-accent/30' : 'bg-emerald-300'} animate-pulse`} />
                  <div className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-accent/20' : 'bg-emerald-200'} animate-pulse`} style={{ animationDelay: '1s' }} />
                </div>
                <div className="absolute top-4 right-[25%] flex gap-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-emerald-400/20' : 'bg-green-300'} animate-pulse`} style={{ animationDelay: '0.5s' }} />
                  <div className={`w-1 h-1 rounded-full ${isDark ? 'bg-teal-400/25' : 'bg-teal-300'} animate-pulse`} style={{ animationDelay: '1.5s' }} />
                </div>
              </div>
            </div>

            {/* Right - College Code Card */}
            <div className="animate-slideInRight">
              <div className={`relative rounded-3xl p-8 sm:p-10 ${isDark
                ? 'bg-gradient-to-br from-dark-500/90 to-dark-600/90 backdrop-blur-xl border border-white/10 shadow-2xl shadow-accent/5'
                : 'bg-white/80 backdrop-blur-xl border border-gray-200 shadow-2xl shadow-gray-200/50'
                }`}>
                <div className="absolute top-0 left-8 right-8 h-1 rounded-full bg-gradient-to-r from-accent via-emerald-400 to-teal-400" />

                <h3 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Already have a college code?
                </h3>

                <form onSubmit={handleJoinCollege} className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    {/* ===== INPUT WITH LIVE VALIDATION ===== */}
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={collegeCode}
                        onChange={(e) => { setCollegeCode(e.target.value.toUpperCase()); setError(''); }}
                        placeholder="Enter 6-digit college code"
                        maxLength={6}
                        className={`w-full px-5 py-4 text-lg rounded-xl border-2 focus:outline-none focus:ring-2 uppercase tracking-widest transition-all pr-14 ${error || codeStatus === 'invalid' ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500'
                          : codeStatus === 'valid' ? 'border-accent focus:ring-accent/50 focus:border-accent'
                            : 'focus:ring-accent/50 focus:border-accent'
                          } ${isDark
                            ? 'bg-dark-400/80 border-white/10 text-white placeholder-gray-600'
                            : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                          }`}
                      />
                      {/* Validation icon: spinner / check / cross */}
                      <div className={`absolute right-4 top-1/2 -translate-y-1/2 transition-all duration-300 ${codeStatus !== 'idle' ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
                        {codeStatus === 'checking' && (
                          <div className="w-8 h-8 flex items-center justify-center">
                            <Loader2 size={20} className="text-accent animate-spin" />
                          </div>
                        )}
                        {codeStatus === 'valid' && (
                          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center shadow-md shadow-accent/30">
                            <Check size={18} className="text-dark-700" strokeWidth={3} />
                          </div>
                        )}
                        {codeStatus === 'invalid' && (
                          <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center shadow-md shadow-red-500/30">
                            <X size={18} className="text-white" strokeWidth={3} />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ===== JOIN NOW GLOW BUTTON ===== */}
                    <GlowButton
                      type="submit"
                      className="px-8 py-4 bg-accent text-dark-700 font-bold rounded-xl hover:bg-accent-light transition-all hover:scale-105 hover:shadow-lg hover:shadow-accent/25 active:scale-100"
                    >
                      Join Now
                      <ArrowRight size={20} />
                    </GlowButton>
                  </div>
                  {/* Error message below input */}
                  {error && <p className="text-red-500 text-sm font-medium mt-1">{error}</p>}
                  {codeStatus === 'invalid' && !error && (
                    <p className="text-red-500 text-sm font-medium mt-1">College not found. Please check your code.</p>
                  )}
                </form>

                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className={`w-full h-px ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
                  </div>
                  <div className="relative flex justify-center">
                    <span className={`px-4 text-sm font-medium ${isDark ? 'bg-dark-500 text-gray-500' : 'bg-white text-gray-400'}`}>or</span>
                  </div>
                </div>


                <GlowButton
                  onClick={handleGetStarted}
                  className={`w-full px-8 py-4 text-lg font-bold rounded-xl transition-all transform hover:scale-[1.02] active:scale-100 ${isDark
                    ? 'bg-white text-dark-700 hover:bg-gray-100 shadow-lg shadow-white/5'
                    : 'bg-gray-900 text-white hover:bg-gray-800 shadow-lg shadow-gray-900/20'
                    }`}
                >
                  Get Started — Create Your College
                  <ArrowRight size={22} />
                </GlowButton>
              </div>
            </div>
          </div>
        </section>


        <LazySection>
          <section ref={featuresRef} className="max-w-7xl mx-auto px-6 py-20">
            <FeaturesSection isDark={isDark} />
          </section>
        </LazySection>


        <LazySection>
          <AnimatedSection>
            <section ref={howItWorksRef} className="max-w-7xl mx-auto px-6 py-20">
              <div className={`rounded-3xl p-10 sm:p-14 ${isDark
                ? 'bg-dark-500/50 backdrop-blur-sm border border-white/5'
                : 'bg-white border border-gray-100 shadow-xl shadow-gray-100/50'
                }`}>
                <div className="text-center mb-14">
                  <p className={`text-sm font-semibold uppercase tracking-widest mb-3 ${isDark ? 'text-accent/80' : 'text-emerald-600'}`}>
                    Simple Process
                  </p>
                  <h2 className={`text-3xl sm:text-4xl font-extrabold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    How It <span className="gradient-text">Works</span>
                  </h2>
                </div>
                <HowItWorksSection isDark={isDark} />
              </div>
            </section>
          </AnimatedSection>
        </LazySection>

        {/* ===== FOOTER — Lazy loaded ===== */}
        <LazySection>
          <AnimatedSection>
            <footer className="max-w-7xl mx-auto px-6 py-12">
              <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t ${isDark ? 'border-white/5' : 'border-gray-200'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
                    <Train className="text-accent" size={16} />
                  </div>
                  <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Powered by Take Your Seat
                  </span>
                </div>
                <p className={`text-sm ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                  Built with ❤️ LH
                </p>
              </div>
            </footer>
          </AnimatedSection>
        </LazySection>

      </div>
    </div>
  );
};

export default LandingPage;
