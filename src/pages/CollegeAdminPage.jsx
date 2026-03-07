import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { LogOut, Users, Train, Download, Search, Trash2, ArrowLeft, Eye, EyeOff, Settings as SettingsIcon, Lock, Clock, Ban, ChevronDown } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import { useTheme } from '../contexts/ThemeContext';
import {
  subscribeToCollegeBookings,
  subscribeToCollegeBogieData,
  cancelCollegeBooking,
  toggleCollegeSeatAvailability,
} from '../services/multiCollegeService';
import { getCollegeByCode, verifyCollegeAdmin } from '../services/collegeService';
import { SEAT_STATUS } from '../utils/seatLayout';
import { normalizeBogieData } from '../utils/bogieTypes';
import 'react-toastify/dist/ReactToastify.css';

const CollegeAdminPage = () => {
  const { collegeId } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [college, setCollege] = useState(null);
  const [activeTab, setActiveTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [bogieData, setBogieData] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBogie, setSelectedBogie] = useState('all');
  const [selectedRoute, setSelectedRoute] = useState('all');
  const [loading, setLoading] = useState(true);

  const SESSION_DURATION_MS = 24 * 60 * 60 * 1000;


  const bg = isDark ? 'bg-dark-700' : 'bg-gray-50';
  const headerBg = isDark ? 'bg-dark-500 border-dark-200' : 'bg-white border-gray-200';
  const heading = isDark ? 'text-white' : 'text-gray-900';
  const subtext = isDark ? 'text-gray-400' : 'text-gray-600';
  const cardBg = isDark ? 'glass-card' : 'bg-white rounded-2xl shadow-lg border border-gray-200';
  const inputCls = isDark
    ? 'bg-dark-400 border-dark-200 text-white placeholder-gray-500'
    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400';
  const secondaryBtn = isDark
    ? 'border-dark-200 text-gray-300 hover:bg-dark-400'
    : 'border-gray-300 text-gray-700 hover:bg-gray-100';
  const tableBorder = isDark ? 'border-dark-200' : 'border-gray-200';
  const tableHover = isDark ? 'hover:bg-dark-400/50' : 'hover:bg-gray-50';
  const selectCls = `px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent ${inputCls}`;

  useEffect(() => {
    const sessionKey = `college_${collegeId}_admin`;
    const sessionData = localStorage.getItem(sessionKey);
    if (sessionData) {
      try {
        const session = JSON.parse(sessionData);
        if (session.authenticated && Date.now() - session.timestamp <= SESSION_DURATION_MS) {
          setIsAuthenticated(true); loadCollegeData();
        } else { localStorage.removeItem(sessionKey); setLoading(false); }
      } catch { localStorage.removeItem(sessionKey); setLoading(false); }
    } else { setLoading(false); }
  }, [collegeId]);

  const loadCollegeData = async () => {
    try {
      const data = await getCollegeByCode(collegeId);
      setCollege(data);
      if (data.settings?.routes?.length > 0) setSelectedRoute(data.settings.routes[0].id);
      if (data.settings?.bogies?.length > 0) {
        const firstBogie = normalizeBogieData(data.settings.bogies[0]);
        setSelectedBogie(firstBogie.id);
      }
    } catch (error) { toast.error('Failed to load college data'); }
    finally { setLoading(false); }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!password.trim()) {
      setLoginError('* Please enter admin password');
      return;
    }
    setLoginError('');
    try {
      const isValid = await verifyCollegeAdmin(collegeId, password);
      if (isValid) {
        localStorage.setItem(`college_${collegeId}_admin`, JSON.stringify({ authenticated: true, timestamp: Date.now() }));
        setIsAuthenticated(true); await loadCollegeData(); toast.success('Login successful!');
      } else { setLoginError('* Invalid password'); }
    } catch { setLoginError('* Login failed. Please try again.'); }
  };

  const handleLogout = () => { localStorage.removeItem(`college_${collegeId}_admin`); setIsAuthenticated(false); navigate(`/college/${collegeId}`); };

  useEffect(() => {
    if (!isAuthenticated || !college) return;
    const unsubscribers = [];
    const routes = college.settings?.routes || [];
    const rawBogies = college.settings?.bogies || [];
    const normalizedBogies = rawBogies.map(b => normalizeBogieData(b));
    const bogieIds = normalizedBogies.map(b => b.id);

    if (selectedRoute && selectedRoute !== 'all') {
      unsubscribers.push(subscribeToCollegeBookings(collegeId, selectedRoute, (data) => setBookings(data)));
    } else {
      routes.forEach(route => {
        unsubscribers.push(subscribeToCollegeBookings(collegeId, route.id, (data) => {
          setBookings(prev => {
            const filtered = prev.filter(b => b.routeId !== route.id);
            return [...filtered, ...data].sort((a, b) => b.bookedAt - a.bookedAt);
          });
        }));
      });
    }

    routes.forEach(route => {
      bogieIds.forEach(bogieId => {
        unsubscribers.push(subscribeToCollegeBogieData(collegeId, route.id, bogieId, (data) => {
          if (data) setBogieData(prev => ({ ...prev, [`${route.id}_${bogieId}`]: data }));
        }));
      });
    });

    return () => unsubscribers.forEach(u => u());
  }, [isAuthenticated, college, selectedRoute, collegeId]);

  const handleCancelBooking = async (bookingId, routeId) => {
    if (!confirm('Cancel this booking?')) return;
    try { await cancelCollegeBooking(collegeId, routeId, bookingId); toast.success('Booking cancelled!'); }
    catch (e) { toast.error(e.message || 'Failed to cancel'); }
  };

  const handleToggleSeatStatus = async (routeId, bogieId, seatId, currentStatus) => {
    try { await toggleCollegeSeatAvailability(collegeId, routeId, bogieId, seatId, currentStatus); toast.success('Seat status updated!'); }
    catch (e) { toast.error(e.message || 'Failed to update'); }
  };

  const exportToCSV = () => {
    const filtered = getFilteredBookings();
    if (filtered.length === 0) { toast.warning('No bookings to export'); return; }
    const csv = [
      ['Name', 'Email', 'Phone', 'Route', 'Bogie', 'Seat Number', 'Seat Type', 'Booking Date'].join(','),
      ...filtered.map(b => [b.userName, b.email, b.phone, b.route?.name || 'N/A', b.bogieId.toUpperCase(), b.seatNumber, b.seatType, new Date(b.bookedAt).toLocaleDateString()].join(','))
    ].join('\n');
    const url = window.URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a'); a.href = url; a.download = `${college?.name}_bookings.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); window.URL.revokeObjectURL(url);
    toast.success('Exported!');
  };

  const getFilteredBookings = () => bookings.filter(b => {
    const s = searchTerm.toLowerCase();
    return (b.userName.toLowerCase().includes(s) || b.email.toLowerCase().includes(s) || b.phone.includes(searchTerm) || b.seatNumber.toString().includes(searchTerm))
      && (selectedBogie === 'all' || b.bogieId === selectedBogie)
      && (selectedRoute === 'all' || b.routeId === selectedRoute);
  });

  const getTotalStats = () => {
    const stats = { totalBookings: bookings.length, totalSeats: 0, bookedSeats: 0, reservedSeats: 0, unavailableSeats: 0, availableSeats: 0 };
    Object.values(bogieData).forEach(bogie => {
      if (bogie.seats) {
        stats.totalSeats += bogie.seats.length;
        stats.bookedSeats += bogie.seats.filter(s => s.status === SEAT_STATUS.BOOKED).length;
        stats.reservedSeats += bogie.seats.filter(s => s.status === SEAT_STATUS.RESERVED).length;
        stats.unavailableSeats += bogie.seats.filter(s => s.status === SEAT_STATUS.UNAVAILABLE).length;
        stats.availableSeats += bogie.seats.filter(s => s.status === SEAT_STATUS.AVAILABLE).length;
      }
    });
    return stats;
  };


  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen ${bg} flex items-center justify-center p-4`}>
        <div className="absolute top-4 right-4 z-50"><ThemeToggle /></div>
        <div className={`${cardBg} p-8 max-w-md w-full`}>
          <div className="text-center mb-8">
            <div className="bg-accent/20 text-accent rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">🔐</div>
            <h2 className={`text-2xl font-bold ${heading} mb-2`}>Admin Login</h2>
            <p className={subtext}>Enter admin password to continue</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => { setPassword(e.target.value); setLoginError(''); }}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent pr-12 ${loginError ? 'border-red-500' : ''} ${inputCls}`} placeholder="Enter admin password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}>
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {loginError && <p className="text-red-500 text-sm font-medium mt-2">{loginError}</p>}
            </div>
            <button type="submit" className="w-full px-6 py-3 bg-accent text-dark-700 font-bold rounded-xl hover:bg-accent-light transition-all">Login</button>
            <button type="button" onClick={() => navigate(`/college/${collegeId}`)} className={`w-full px-6 py-3 border rounded-xl transition-all flex items-center justify-center gap-2 ${secondaryBtn}`}>
              <ArrowLeft size={20} />Back to Booking Page
            </button>
          </form>
        </div>
        <ToastContainer theme={isDark ? 'dark' : 'light'} />
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`min-h-screen ${bg} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent mx-auto mb-4"></div>
          <p className={subtext}>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = getTotalStats();
  const filteredBookings = getFilteredBookings();
  const routes = college?.settings?.routes || [];
  const rawBogies = college?.settings?.bogies || [];
  const bogies = rawBogies.map(b => normalizeBogieData(b));

  return (
    <div className={`min-h-screen ${bg}`}>
      <div className={`${headerBg} border-b`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-2xl font-bold ${heading}`}>{college?.name} — <span className="text-accent">Admin</span></h1>
              <p className={`text-sm ${subtext}`}>College Code: <span className="text-accent font-mono">{collegeId}</span></p>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button onClick={handleLogout} className={`flex items-center gap-2 px-4 py-2 border rounded-xl transition-all ${secondaryBtn}`}>
                <LogOut size={20} />Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {[
            { icon: <Users className="text-accent" size={24} />, label: 'Total Bookings', value: stats.totalBookings, bg: 'bg-accent/10' },
            { icon: <Train className="text-green-400" size={24} />, label: 'Available', value: stats.availableSeats, bg: 'bg-green-500/10' },
            { icon: <Lock className="text-red-500" size={24} />, label: 'Booked', value: stats.bookedSeats, bg: 'bg-red-500/10' },
            { icon: <Clock className="text-yellow-500" size={24} />, label: 'Reserved', value: stats.reservedSeats, bg: 'bg-yellow-500/10' },
            { icon: <Ban className="text-gray-500" size={24} />, label: 'Unavailable', value: stats.unavailableSeats, bg: 'bg-gray-500/10' },
          ].map(stat => (
            <div key={stat.label} className={`${cardBg} p-5 hover:-translate-y-1 hover:shadow-lg transition-all duration-300`}>
              <div className="flex items-center">
                <div className={`${stat.bg} p-3 rounded-xl`}>{stat.icon}</div>
                <div className="ml-4">
                  <p className={`text-sm ${subtext}`}>{stat.label}</p>
                  <p className={`text-2xl font-bold ${heading}`}>{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={`${cardBg} mb-6`}>
          <div className={`border-b ${tableBorder}`}>
            <div className="flex">
              {[
                { id: 'bookings', icon: <Users size={20} />, label: 'Bookings Management' },
                { id: 'seats', icon: <SettingsIcon size={20} />, label: 'Seat Management' },
              ].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 font-medium transition-all ${activeTab === tab.id ? 'text-accent border-b-2 border-accent' : `${subtext} hover:${heading}`}`}>
                  <div className="flex items-center gap-2">{tab.icon}{tab.label}</div>
                </button>
              ))}
            </div>
          </div>
        </div>


        {activeTab === 'bookings' && (
          <div className={cardBg}>
            <div className="p-6">
              <h2 className={`text-xl font-bold ${heading} mb-6`}>Bookings Management</h2>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} size={20} />
                  <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-accent ${inputCls}`} />
                </div>
                <div className="relative">
                  <ChevronDown size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <select value={selectedRoute} onChange={(e) => setSelectedRoute(e.target.value)} className={`appearance-none !pl-10 pr-4 ${selectCls}`}>
                    <option value="all">All Routes</option>
                    {routes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>
                <div className="relative">
                  <ChevronDown size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <select value={selectedBogie} onChange={(e) => setSelectedBogie(e.target.value)} className={`appearance-none !pl-10 pr-4 ${selectCls}`}>
                    <option value="all">All Bogies</option>
                    {bogies.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <button onClick={exportToCSV} className="flex items-center gap-2 px-4 py-2 bg-accent text-dark-700 font-semibold rounded-xl hover:bg-accent-light transition-all">
                  <Download size={20} />Export CSV
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className={`border-b ${tableBorder}`}>
                      {['Name', 'Contact', 'Route', 'Seat', 'Booked At', 'Actions'].map(h => (
                        <th key={h} className={`text-left py-3 px-4 font-medium ${subtext}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map(b => (
                      <tr key={b.id} className={`border-b ${tableBorder}/50 ${tableHover} transition-colors`}>
                        <td className={`py-3 px-4 font-medium ${heading}`}>{b.userName}</td>
                        <td className={`py-3 px-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          <div>{b.email}</div>
                          <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{b.phone}</div>
                        </td>
                        <td className="py-3 px-4">
                          {b.route ? (
                            <div>
                              <div className={`font-medium ${heading}`}>{b.route.name}</div>
                              <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{b.route.from} → {b.route.to}</div>
                            </div>
                          ) : <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>N/A</span>}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-accent">{b.bogieId.toUpperCase()} - Seat {b.seatNumber}</div>
                          <div className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{b.seatType.replace('_', ' ')}</div>
                        </td>
                        <td className={`py-3 px-4 ${subtext}`}>{new Date(b.bookedAt).toLocaleDateString()}</td>
                        <td className="py-3 px-4">
                          <button onClick={() => handleCancelBooking(b.id, b.routeId)} className="flex items-center gap-1 px-3 py-1 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                            <Trash2 size={16} />Cancel
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredBookings.length === 0 && <div className={`text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>No bookings found.</div>}
              </div>
            </div>
          </div>
        )}


        {activeTab === 'seats' && (
          <div className={cardBg}>
            <div className="p-6">
              <h2 className={`text-xl font-bold ${heading} mb-6`}>Seat Management</h2>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative">
                  <ChevronDown size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <select value={selectedRoute} onChange={(e) => setSelectedRoute(e.target.value)} className={`appearance-none !pl-10 pr-4 ${selectCls}`}>
                    {routes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>
                <div className="relative">
                  <ChevronDown size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <select value={selectedBogie} onChange={(e) => setSelectedBogie(e.target.value)} className={`appearance-none !pl-10 pr-4 ${selectCls}`}>
                    {bogies.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
              </div>

              <div className={`flex flex-wrap gap-4 mb-6 p-4 rounded-xl border ${isDark ? 'bg-dark-400/50 border-dark-200' : 'bg-gray-50 border-gray-200'}`}>
                {[
                  { color: 'bg-accent', label: 'Available' },
                  { color: 'bg-red-500', label: 'Booked' },
                  { color: 'bg-yellow-500', label: 'Reserved' },
                  { color: 'bg-gray-600', label: 'Unavailable' },
                ].map(l => (
                  <div key={l.label} className="flex items-center gap-2">
                    <div className={`w-8 h-8 ${l.color} rounded-lg`}></div>
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{l.label}</span>
                  </div>
                ))}
              </div>

              {selectedRoute && selectedRoute !== 'all' && selectedBogie && selectedBogie !== 'all' && (
                <div className="overflow-x-auto">
                  {bogieData[`${selectedRoute}_${selectedBogie}`]?.seats ? (
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                      {bogieData[`${selectedRoute}_${selectedBogie}`].seats.map(seat => (
                        <button key={seat.id} onClick={() => handleToggleSeatStatus(selectedRoute, selectedBogie, seat.id, seat.status)}
                          disabled={seat.status === SEAT_STATUS.BOOKED}
                          className={`p-3 rounded-xl font-medium text-sm transition-all ${seat.status === SEAT_STATUS.AVAILABLE ? 'bg-accent/80 text-dark-700 hover:bg-accent'
                            : seat.status === SEAT_STATUS.BOOKED ? 'bg-red-500/80 text-white cursor-not-allowed'
                              : seat.status === SEAT_STATUS.RESERVED ? 'bg-yellow-500/80 text-dark-700 hover:bg-yellow-500'
                                : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                            }`}
                          title={`Seat ${seat.number} - ${seat.status}${seat.bookedBy ? ` (${seat.bookedBy})` : ''}`}>
                          {seat.number}
                        </button>
                      ))}
                    </div>
                  ) : <div className={`text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>No seats data.</div>}
                </div>
              )}

              {(selectedRoute === 'all' || selectedBogie === 'all') && (
                <div className={`text-center py-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Select a specific route and bogie.</div>
              )}

              <div className="mt-6 p-4 bg-accent/5 border border-accent/20 rounded-xl">
                <h3 className="font-semibold text-accent mb-2">How to Manage Seats:</h3>
                <ul className={`list-disc list-inside space-y-1 text-sm ${subtext}`}>
                  <li>Click a seat to cycle: Available → Reserved → Unavailable → Available</li>
                  <li>Booked seats cannot be changed (cancel the booking first)</li>
                  <li>Reserved seats are for faculty or special allocations</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      <ToastContainer theme={isDark ? 'dark' : 'light'} />
    </div>
  );
};

export default CollegeAdminPage;
