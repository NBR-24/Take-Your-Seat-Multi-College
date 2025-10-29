import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { Plus, Trash2, ArrowLeft, Loader } from 'lucide-react';
import { createCollege } from '../services/collegeService';
import 'react-toastify/dist/ReactToastify.css';

const CollegeSetupPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    name: '',
    adminPassword: '',
    confirmPassword: '',
    seatsPerBogie: 80,
    logoUrl: '',
    bogies: ['s1', 's2', 's3'],
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
  const [generatedCode, setGeneratedCode] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddBogie = () => {
    if (newBogie && !formData.bogies.includes(newBogie.toLowerCase())) {
      setFormData(prev => ({
        ...prev,
        bogies: [...prev.bogies, newBogie.toLowerCase()]
      }));
      setNewBogie('');
    }
  };

  const handleRemoveBogie = (bogieId) => {
    setFormData(prev => ({
      ...prev,
      bogies: prev.bogies.filter(b => b !== bogieId)
    }));
  };

  const handleRouteChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      routes: prev.routes.map((route, i) => 
        i === index ? { ...route, [field]: value } : route
      )
    }));
  };

  const handleAddRoute = () => {
    setFormData(prev => ({
      ...prev,
      routes: [...prev.routes, {
        id: `route${prev.routes.length + 1}`,
        name: `Route ${prev.routes.length + 1}`,
        trainNumber: '',
        trainName: '',
        from: '',
        to: '',
        bogies: formData.bogies
      }]
    }));
  };

  const handleRemoveRoute = (index) => {
    if (formData.routes.length > 1) {
      setFormData(prev => ({
        ...prev,
        routes: prev.routes.filter((_, i) => i !== index)
      }));
    }
  };

  const validateStep1 = () => {
    if (!formData.name.trim()) {
      toast.error('Please enter college name');
      return false;
    }
    if (!formData.adminPassword || formData.adminPassword.length < 6) {
      toast.error('Admin password must be at least 6 characters');
      return false;
    }
    if (formData.adminPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (formData.bogies.length === 0) {
      toast.error('Please add at least one bogie');
      return false;
    }
    if (formData.seatsPerBogie < 20 || formData.seatsPerBogie > 100) {
      toast.error('Seats per bogie must be between 20 and 100');
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    for (const route of formData.routes) {
      if (!route.name.trim() || !route.from.trim() || !route.to.trim()) {
        toast.error('Please fill all route details');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigate('/');
    }
  };

  const handleSubmit = async () => {
    if (!validateStep3()) return;

    setLoading(true);
    try {
      const { collegeCode, college } = await createCollege(formData);
      
      setGeneratedCode(collegeCode);
      toast.success('College created successfully!');
      
      // Store admin session
      localStorage.setItem(`college_${collegeCode}_admin`, 'true');
      
    } catch (error) {
      console.error('Error creating college:', error);
      toast.error(error.message || 'Failed to create college. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoToCollege = () => {
    navigate(`/college/${generatedCode}`);
  };

  if (generatedCode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-2xl w-full text-center">
          <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🎉</span>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            College Created Successfully!
          </h2>
          
          <p className="text-gray-600 mb-8">
            Your college has been set up. Share this code with your students:
          </p>
          
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-8 mb-8">
            <p className="text-sm text-gray-600 mb-2">College Code</p>
            <p className="text-5xl font-bold text-blue-600 tracking-wider">
              {generatedCode}
            </p>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <p className="text-sm text-yellow-800">
              <strong>Important:</strong> Save this code! Students will need it to access the booking system.
            </p>
          </div>
          
          <button
            onClick={handleGoToCollege}
            className="w-full px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
          >
            Go to Booking Page
          </button>
        </div>
        
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Create Your College
          </h1>
          <p className="text-gray-600">
            Step {step} of 3
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-medium ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              Basic Info
            </span>
            <span className={`text-sm font-medium ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              Bogies & Seats
            </span>
            <span className={`text-sm font-medium ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
              Routes
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  College Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., ABC Engineering College"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  College Logo URL (Optional)
                </label>
                <input
                  type="url"
                  name="logoUrl"
                  value={formData.logoUrl}
                  onChange={handleInputChange}
                  placeholder="https://example.com/logo.png"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Password *
                </label>
                <input
                  type="password"
                  name="adminPassword"
                  value={formData.adminPassword}
                  onChange={handleInputChange}
                  placeholder="Minimum 6 characters"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Re-enter password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Step 2: Bogies & Seats */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Seats Per Bogie *
                </label>
                <input
                  type="number"
                  name="seatsPerBogie"
                  value={formData.seatsPerBogie}
                  onChange={handleInputChange}
                  min="20"
                  max="100"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Recommended: 80 seats (standard sleeper coach)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bogies *
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newBogie}
                    onChange={(e) => setNewBogie(e.target.value.toLowerCase())}
                    placeholder="e.g., s1, s2, s3"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleAddBogie}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Plus size={20} />
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {formData.bogies.map(bogieId => (
                    <div
                      key={bogieId}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-lg"
                    >
                      <span className="font-medium uppercase">{bogieId}</span>
                      <button
                        onClick={() => handleRemoveBogie(bogieId)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Routes */}
          {step === 3 && (
            <div className="space-y-6">
              {formData.routes.map((route, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Route {index + 1}
                    </h3>
                    {formData.routes.length > 1 && (
                      <button
                        onClick={() => handleRemoveRoute(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Route Name *
                      </label>
                      <input
                        type="text"
                        value={route.name}
                        onChange={(e) => handleRouteChange(index, 'name', e.target.value)}
                        placeholder="e.g., Shornur to Agra"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Train Number
                      </label>
                      <input
                        type="text"
                        value={route.trainNumber}
                        onChange={(e) => handleRouteChange(index, 'trainNumber', e.target.value)}
                        placeholder="e.g., 12345"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Train Name
                      </label>
                      <input
                        type="text"
                        value={route.trainName}
                        onChange={(e) => handleRouteChange(index, 'trainName', e.target.value)}
                        placeholder="e.g., Express Train"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        From *
                      </label>
                      <input
                        type="text"
                        value={route.from}
                        onChange={(e) => handleRouteChange(index, 'from', e.target.value)}
                        placeholder="e.g., Shornur"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        To *
                      </label>
                      <input
                        type="text"
                        value={route.to}
                        onChange={(e) => handleRouteChange(index, 'to', e.target.value)}
                        placeholder="e.g., Agra"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={handleAddRoute}
                className="w-full px-4 py-3 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                Add Another Route
              </button>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 mt-8">
            <button
              onClick={handleBack}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft size={20} />
              Back
            </button>
            
            {step < 3 ? (
              <button
                onClick={handleNext}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="animate-spin" size={20} />
                    Creating...
                  </>
                ) : (
                  'Create College'
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};

export default CollegeSetupPage;
