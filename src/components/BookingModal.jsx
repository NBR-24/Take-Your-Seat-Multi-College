import React, { useState } from 'react';
import { X, User, Mail, Phone, MapPin } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const BookingModal = ({ isOpen, onClose, seat, onConfirmBooking, isLoading }) => {
  const { isDark } = useTheme();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [errors, setErrors] = useState({});

  const modalBg = isDark ? 'glass-card' : 'bg-white rounded-2xl shadow-2xl';
  const headerBorder = isDark ? 'border-dark-200' : 'border-gray-200';
  const label = isDark ? 'text-gray-300' : 'text-gray-700';
  const heading = isDark ? 'text-white' : 'text-gray-900';
  const subtext = isDark ? 'text-gray-400' : 'text-gray-600';

  const inputCls = (hasError) =>
    `w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${isDark ? 'bg-dark-400 text-white placeholder-gray-500' : 'bg-white text-gray-900 placeholder-gray-400'
    } ${hasError ? 'border-red-500' : isDark ? 'border-dark-200' : 'border-gray-300'}`;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    else if (formData.name.trim().length < 2) newErrors.name = 'Name must be at least 2 characters';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    else if (!/^[6-9]\d{9}$/.test(formData.phone.replace(/\D/g, ''))) newErrors.phone = 'Invalid phone number';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      await onConfirmBooking({ name: formData.name.trim(), email: formData.email.trim().toLowerCase(), phone: formData.phone.replace(/\D/g, '') });
      setFormData({ name: '', email: '', phone: '' }); setErrors({});
    } catch (error) { console.error('Booking error:', error); }
  };

  const handleClose = () => {
    if (!isLoading) { setFormData({ name: '', email: '', phone: '' }); setErrors({}); onClose(); }
  };

  if (!isOpen || !seat) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className={`${modalBg} max-w-md w-full max-h-[90vh] overflow-y-auto`}>
        <div className={`flex items-center justify-between p-6 border-b ${headerBorder}`}>
          <h2 className={`text-xl font-semibold ${heading}`}>Book Your Seat</h2>
          <button onClick={handleClose} disabled={isLoading}
            className={`${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-gray-600'} transition-colors disabled:opacity-50`}>
            <X size={24} />
          </button>
        </div>

        <div className={`p-6 border-b ${headerBorder} bg-accent/5`}>
          <div className="flex items-center gap-3">
            <div className="bg-accent text-dark-700 rounded-xl p-3"><MapPin size={20} /></div>
            <div>
              <h3 className={`font-semibold ${heading}`}>Seat {seat.number}</h3>
              <p className={`text-sm ${subtext}`}>{seat.type.replace('_', ' ')} • Row {seat.row}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {[
            { id: 'name', label: 'Full Name', icon: User, type: 'text', placeholder: 'Enter your full name' },
            { id: 'email', label: 'Email Address', icon: Mail, type: 'email', placeholder: 'Enter your email' },
            { id: 'phone', label: 'Phone Number', icon: Phone, type: 'tel', placeholder: '10-digit phone number' },
          ].map(field => (
            <div key={field.id}>
              <label htmlFor={field.id} className={`block text-sm font-medium ${label} mb-2`}>
                <field.icon size={16} className="inline mr-2" />{field.label}
              </label>
              <input type={field.type} id={field.id} name={field.id} value={formData[field.id]}
                onChange={handleInputChange} disabled={isLoading} className={inputCls(errors[field.id])} placeholder={field.placeholder} />
              {errors[field.id] && <p className="mt-1 text-sm text-red-400">{errors[field.id]}</p>}
            </div>
          ))}

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
            <p className="text-sm text-yellow-500"><strong>Important:</strong> Each person can book only one seat per route.</p>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={handleClose} disabled={isLoading}
              className={`flex-1 px-4 py-3 border rounded-xl transition-all disabled:opacity-50 ${isDark ? 'border-dark-200 text-gray-300 hover:bg-dark-400' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
              Cancel
            </button>
            <button type="submit" disabled={isLoading}
              className="flex-1 px-4 py-3 bg-accent text-dark-700 font-bold rounded-xl hover:bg-accent-light transition-all disabled:opacity-50 flex items-center justify-center">
              {isLoading ? <><div className="animate-spin rounded-full h-4 w-4 border-2 border-dark-700 border-t-transparent mr-2"></div>Booking...</> : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
