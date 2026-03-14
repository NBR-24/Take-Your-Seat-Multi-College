import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { Plus, Trash2, ArrowLeft, Loader, Copy, Check, Train, AlertTriangle } from 'lucide-react';
import { createCollege } from '../services/collegeService';
import ThemeToggle from '../components/ThemeToggle';
import { useTheme } from '../contexts/ThemeContext';
import { BOGIE_TYPES, getBogieTypeDisplay, BOGIE_TYPE_CONFIG } from '../utils/bogieTypes';
import 'react-toastify/dist/ReactToastify.css';

const CollegeSetupPage = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [fieldErrors, setFieldErrors] = useState({});
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    adminPassword: '',
    confirmPassword: '',
    logoUrl: '',
    bogies: [
      { id: 's1', type: BOGIE_TYPES.SLEEPER, name: 'S1' },
      { id: 's2', type: BOGIE_TYPES.SLEEPER, name: 'S2' },
      { id: 's3', type: BOGIE_TYPES.SLEEPER, name: 'S3' }
    ],
    routes: [
      {
        id: 'route1',
        name: 'Route 1',
        trainNumber: '',
        trainName: '',
        from: '',
        to: '',
        bogies: ['s1', 's2', 's3']
      }
    ]
  });

  const [newBogie, setNewBogie] = useState('');
  const [newBogieType, setNewBogieType] = useState(BOGIE_TYPES.SLEEPER);
  const [generatedCode, setGeneratedCode] = useState(null);


  const bg = isDark ? 'bg-dark-700' : 'bg-gray-50';
  const cardBg = isDark ? 'glass-card' : 'bg-white rounded-2xl shadow-xl border border-gray-200';
  const heading = isDark ? 'text-white' : 'text-gray-900';
  const label = isDark ? 'text-gray-300' : 'text-gray-700';
  const subtext = isDark ? 'text-gray-400' : 'text-gray-600';
  const mutedText = isDark ? 'text-gray-500' : 'text-gray-500';
  const inputCls = isDark
    ? 'bg-dark-400 border-dark-200 text-white placeholder-gray-500'
    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400';
  const secondaryBtn = isDark
    ? 'border-dark-200 text-gray-300 hover:bg-dark-400'
    : 'border-gray-300 text-gray-700 hover:bg-gray-50';

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user types
    setFieldErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleAddBogie = () => {
    if (newBogie && !formData.bogies.some(b => b.id === newBogie.toLowerCase())) {
      const newBogieObj = {
        id: newBogie.toLowerCase(),
        type: newBogieType,
        name: newBogie.toUpperCase()
      };
      setFormData(prev => ({ ...prev, bogies: [...prev.bogies, newBogieObj] }));
      setNewBogie('');
      setNewBogieType(BOGIE_TYPES.SLEEPER);
    }
  };

  const handleRemoveBogie = (bogieId) => {
    setFormData(prev => ({ ...prev, bogies: prev.bogies.filter(b => b.id !== bogieId) }));
  };

  const handleRouteChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      routes: prev.routes.map((route, i) => i === index ? { ...route, [field]: value } : route)
    }));
  };

  const handleAddRoute = () => {
    setFormData(prev => ({
      ...prev,
      routes: [...prev.routes, { id: `route${prev.routes.length + 1}`, name: `Route ${prev.routes.length + 1}`, trainNumber: '', trainName: '', from: '', to: '', bogies: formData.bogies }]
    }));
  };

  const handleRemoveRoute = (index) => {
    if (formData.routes.length > 1) {
      setFormData(prev => ({ ...prev, routes: prev.routes.filter((_, i) => i !== index) }));
    }
  };

  const validateStep1 = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Please enter college name';
    if (!formData.adminPassword || formData.adminPassword.length < 6) errors.adminPassword = 'Password must be at least 6 characters';
    if (formData.adminPassword !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = () => {
    if (formData.bogies.length === 0) {
      setFieldErrors({ bogies: 'Please add at least one bogie' });
      return false;
    }
    setFieldErrors({});
    return true;
  };

  const validateStep3 = () => {
    const errors = {};
    formData.routes.forEach((route, i) => {
      if (!route.name.trim()) errors[`route_${i}_name`] = 'Route name is required';
      if (!route.from.trim()) errors[`route_${i}_from`] = 'From is required';
      if (!route.to.trim()) errors[`route_${i}_to`] = 'To is required';
    });
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
  };

  const handleBack = () => { step > 1 ? setStep(step - 1) : navigate('/'); };

  const handleSubmit = async () => {
    if (!validateStep3()) return;
    setLoading(true);
    try {
      const { collegeCode } = await createCollege(formData);
      setGeneratedCode(collegeCode);
      toast.success('College created successfully!');
      localStorage.setItem(`college_${collegeCode}_admin`, JSON.stringify({ authenticated: true, timestamp: Date.now() }));
    } catch (error) {
      console.error('Error creating college:', error);
      toast.error(error.message || 'Failed to create college. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  if (generatedCode) {
    return (
      <div className={`min-h-screen ${bg} flex items-center justify-center p-4`}>
        <div className="absolute top-4 right-4 z-50"><ThemeToggle /></div>
        {/* Updated Container to match the new screenshots exactly */}
        <div className={`${isDark ? 'bg-[#1C1C1E] border border-[#2C2C2E]' : 'bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)]'} rounded-[20px] p-8 sm:p-12 max-w-2xl w-full text-center relative transition-all duration-300`}>

          {/* Central Circular Icon */}
          <div className="bg-[#EAF6ED] rounded-full w-[72px] h-[72px] flex items-center justify-center mx-auto mb-6">
            <Train className="w-8 h-8 text-[#62D283]" strokeWidth={2.5} />
          </div>

          <h2 className={`text-[28px] font-bold ${isDark ? 'text-white' : 'text-[#1A1A1A]'} mb-2 tracking-tight`}>College Created Successfully!</h2>
          <p className={`${isDark ? 'text-[#A1A1AA]' : 'text-[#71717A]'} mb-8 text-[15px]`}>Your college has been set up. Share this code with your students:</p>

          {/* Inner Code Box */}
          <div className={`${isDark ? 'bg-[#2C2C2E]' : 'bg-[#3A3D40]'} rounded-xl p-8 mb-6 relative`}>
            <p className={`text-[13px] text-gray-400 mb-2 font-medium`}>College Code</p>
            <div className="flex items-center justify-center gap-3">
              <p className="text-[42px] font-bold text-[#62D283] tracking-widest">{generatedCode}</p>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedCode);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className={`p-2.5 rounded-lg transition-all duration-300 relative ${copied
                  ? 'bg-[#62D283]/20 text-[#62D283] scale-110'
                  : 'bg-black/20 text-gray-400 hover:text-white hover:bg-black/40'
                  }`}
                title={copied ? 'Copied!' : 'Copy code'}
              >
                {copied ? <Check size={20} strokeWidth={3} /> : <Copy size={20} />}
              </button>
            </div>
          </div>

          {/* Warning Box */}
          <div className="message-box-warning mb-8 items-center justify-center text-center mx-auto">
            <AlertTriangle className="w-[18px] h-[18px] shrink-0" />
            <p><strong className="font-semibold">Important:</strong> Save this code! Students will need it to access the booking system.</p>
          </div>

          {/* Primary Action Button */}
          <button onClick={() => navigate(`/college/${generatedCode}`)} className="w-full h-14 bg-[#62D283] text-[#1A1A1A] font-bold text-[15px] rounded-xl hover:bg-[#52C071] transition-all">Go to Booking Page</button>
        </div>
        <ToastContainer theme={isDark ? 'dark' : 'light'} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bg} py-12 px-4`}>
      <div className="absolute top-4 right-4 z-50"><ThemeToggle /></div>
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-8">
          <h1 className={`text-4xl font-bold ${heading} mb-2`}>Create Your <span className="text-accent">College</span></h1>
          <p className={subtext}>Step {step} of 3</p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {['Basic Info', 'Bogies & Seats', 'Routes'].map((name, i) => (
              <span key={name} className={`text-sm font-medium ${step >= i + 1 ? 'text-accent' : mutedText}`}>{name}</span>
            ))}
          </div>
          <div className={`w-full rounded-full h-2 ${isDark ? 'bg-dark-400' : 'bg-gray-200'}`}>
            <div className="bg-accent h-2 rounded-full transition-all duration-300" style={{ width: `${(step / 3) * 100}%` }}></div>
          </div>
        </div>

        <div className={`${cardBg} p-8`}>
          {step === 1 && (
            <div className="space-y-6">
              {[
                { label: 'College Name *', name: 'name', type: 'text', placeholder: 'e.g., ABC Engineering College' },
                { label: 'College Logo URL (Optional)', name: 'logoUrl', type: 'url', placeholder: 'https://example.com/logo.png' },
                { label: 'Admin Password *', name: 'adminPassword', type: 'password', placeholder: 'Minimum 6 characters' },
                { label: 'Confirm Password *', name: 'confirmPassword', type: 'password', placeholder: 'Re-enter password' },
              ].map(field => (
                <div key={field.name}>
                  <label className={`block text-sm font-medium ${label} mb-2`}>{field.label}</label>
                  <input type={field.type} name={field.name} value={formData[field.name]} onChange={handleInputChange} placeholder={field.placeholder} className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent ${fieldErrors[field.name] ? 'border-red-500' : ''} ${inputCls}`} />
                  {fieldErrors[field.name] && <p className="text-red-500 text-sm mt-1">{fieldErrors[field.name]}</p>}
                </div>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className={`block text-sm font-medium ${label} mb-2`}>Add Bogies *</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                  <input
                    type="text"
                    value={newBogie}
                    onChange={(e) => setNewBogie(e.target.value.toLowerCase())}
                    placeholder="Bogie ID (e.g., s1, a1)"
                    className={`px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent ${inputCls}`}
                  />
                  <select
                    value={newBogieType}
                    onChange={(e) => setNewBogieType(e.target.value)}
                    className={`px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent ${inputCls}`}
                  >
                    {Object.entries(BOGIE_TYPE_CONFIG).map(([key, config]) => (
                      <option key={key} value={key}>
                        {config.name} ({config.seatCount} seats)
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleAddBogie}
                    className="px-6 py-3 bg-accent text-dark-700 font-semibold rounded-xl hover:bg-accent-light transition-all flex items-center justify-center gap-2"
                  >
                    <Plus size={20} />Add
                  </button>
                </div>
                <p className={`text-sm ${mutedText} mb-3`}>Choose bogie type: Sleeper (80 seats) or AC 2-Tier (48 seats)</p>
                {fieldErrors.bogies && <p className="text-red-500 text-sm mb-3">{fieldErrors.bogies}</p>}
                <div className="flex flex-wrap gap-2">
                  {formData.bogies.map(bogie => (
                    <div
                      key={bogie.id}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 ${bogie.type === BOGIE_TYPES.AC_2_TIER
                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                        : 'bg-accent/10 text-accent border-accent/20'
                        }`}
                    >
                      <div className="flex flex-col">
                        <span className="font-bold uppercase">{bogie.name}</span>
                        <span className="text-xs opacity-75">{getBogieTypeDisplay(bogie.type, true)}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveBogie(bogie.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              {formData.routes.map((route, index) => (
                <div key={index} className={`border rounded-xl p-6 ${isDark ? 'border-dark-200 bg-dark-400/50' : 'border-gray-200 bg-gray-50'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-lg font-semibold ${heading}`}>Route {index + 1}</h3>
                    {formData.routes.length > 1 && <button onClick={() => handleRemoveRoute(index)} className="text-red-400 hover:text-red-300"><Trash2 size={20} /></button>}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: 'Route Name *', field: 'name', placeholder: 'e.g., Shornur to Agra' },
                      { label: 'Train Number', field: 'trainNumber', placeholder: 'e.g., 12345' },
                      { label: 'Train Name', field: 'trainName', placeholder: 'e.g., Express Train' },
                      { label: 'From *', field: 'from', placeholder: 'e.g., Shornur' },
                    ].map(f => (
                      <div key={f.field}>
                        <label className={`block text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>{f.label}</label>
                        <input type="text" value={route[f.field]} onChange={(e) => { handleRouteChange(index, f.field, e.target.value); setFieldErrors(prev => ({ ...prev, [`route_${index}_${f.field}`]: '' })); }} placeholder={f.placeholder} className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent ${fieldErrors[`route_${index}_${f.field}`] ? 'border-red-500' : ''} ${inputCls}`} />
                        {fieldErrors[`route_${index}_${f.field}`] && <p className="text-red-500 text-sm mt-1">{fieldErrors[`route_${index}_${f.field}`]}</p>}
                      </div>
                    ))}
                    <div className="md:col-span-2">
                      <label className={`block text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>To *</label>
                      <input type="text" value={route.to} onChange={(e) => { handleRouteChange(index, 'to', e.target.value); setFieldErrors(prev => ({ ...prev, [`route_${index}_to`]: '' })); }} placeholder="e.g., Agra" className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent ${fieldErrors[`route_${index}_to`] ? 'border-red-500' : ''} ${inputCls}`} />
                      {fieldErrors[`route_${index}_to`] && <p className="text-red-500 text-sm mt-1">{fieldErrors[`route_${index}_to`]}</p>}
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={handleAddRoute} className={`w-full px-4 py-3 border-2 border-dashed rounded-xl flex items-center justify-center gap-2 transition-colors ${isDark ? 'border-dark-200 text-gray-400 hover:border-accent/50 hover:text-accent' : 'border-gray-300 text-gray-500 hover:border-accent hover:text-accent'}`}>
                <Plus size={20} />Add Another Route
              </button>
            </div>
          )}

          <div className="flex gap-4 mt-8">
            <button onClick={handleBack} className={`flex-1 px-6 py-3 border rounded-xl transition-all flex items-center justify-center gap-2 ${secondaryBtn}`}>
              <ArrowLeft size={20} />Back
            </button>
            {step < 3 ? (
              <button onClick={handleNext} className="flex-1 px-6 py-3 bg-accent text-dark-700 font-bold rounded-xl hover:bg-accent-light transition-all">Next</button>
            ) : (
              <button onClick={handleSubmit} disabled={loading} className="flex-1 px-6 py-3 bg-accent text-dark-700 font-bold rounded-xl hover:bg-accent-light transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {loading ? <><Loader className="animate-spin" size={20} />Creating...</> : 'Create College'}
              </button>
            )}
          </div>
        </div>
      </div>
      <ToastContainer theme={isDark ? 'dark' : 'light'} />
    </div>
  );
};

export default CollegeSetupPage;
