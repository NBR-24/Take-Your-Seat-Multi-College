import React, { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';

const AdminLogin = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Admin password - change this to your secure password
  const ADMIN_PASSWORD = 'NASA2025!';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate API call delay
    setTimeout(() => {
      if (password === ADMIN_PASSWORD) {
        onLogin(true);
        localStorage.setItem('adminAuthenticated', 'true');
      } else {
        setError('Invalid password');
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8">
        <div className="text-center mb-8">
          <div className="bg-blue-600 text-white rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Lock size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Admin Access</h1>
          <p className="text-gray-600 mt-2">Enter password to access admin panel</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className={`w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                  error ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter admin password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || !password}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Verifying...
              </>
            ) : (
              'Access Admin Panel'
            )}
          </button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Only authorized administrators can access this panel.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
