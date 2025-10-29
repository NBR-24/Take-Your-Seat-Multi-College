import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { LogOut, Users, Train, Download, Search, Trash2, ArrowLeft, Eye, EyeOff, Settings as SettingsIcon } from 'lucide-react';
import { 
  subscribeToCollegeBookings,
  subscribeToCollegeBogieData,
  cancelCollegeBooking,
  toggleCollegeSeatAvailability,
  bookCollegeSeat
} from '../services/multiCollegeService';
import { getCollegeByCode, verifyCollegeAdmin } from '../services/collegeService';
import { SEAT_STATUS } from '../utils/seatLayout';
import 'react-toastify/dist/ReactToastify.css';

const CollegeAdminPage = () => {
  const { collegeId } = useParams();
  const navigate = useNavigate();
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [college, setCollege] = useState(null);
  const [activeTab, setActiveTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [bogieData, setBogieData] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBogie, setSelectedBogie] = useState('all');
  const [selectedRoute, setSelectedRoute] = useState('all');
  const [loading, setLoading] = useState(true);

  // Check if already authenticated
  useEffect(() => {
    const isAdmin = localStorage.getItem(`college_${collegeId}_admin`) === 'true';
    if (isAdmin) {
      setIsAuthenticated(true);
      loadCollegeData();
    } else {
      setLoading(false);
    }
  }, [collegeId]);

  const loadCollegeData = async () => {
    try {
      const collegeData = await getCollegeByCode(collegeId);
      setCollege(collegeData);
      
      // Set first route as default
      if (collegeData.settings?.routes?.length > 0) {
        setSelectedRoute(collegeData.settings.routes[0].id);
      }
      
      // Set first bogie as default
      if (collegeData.settings?.bogies?.length > 0) {
        setSelectedBogie(collegeData.settings.bogies[0]);
      }
    } catch (error) {
      console.error('Error loading college:', error);
      toast.error('Failed to load college data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      const isValid = await verifyCollegeAdmin(collegeId, password);
      
      if (isValid) {
        localStorage.setItem(`college_${collegeId}_admin`, 'true');
        setIsAuthenticated(true);
        await loadCollegeData();
        toast.success('Login successful!');
      } else {
        toast.error('Invalid password');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(`college_${collegeId}_admin`);
    setIsAuthenticated(false);
    navigate(`/college/${collegeId}`);
  };

  // Subscribe to bookings and bogie data
  useEffect(() => {
    if (!isAuthenticated || !college) return;

    const unsubscribers = [];
    const routes = college.settings?.routes || [];
    const bogies = college.settings?.bogies || [];

    // Subscribe to bookings for selected route
    if (selectedRoute && selectedRoute !== 'all') {
      const bookingsUnsubscribe = subscribeToCollegeBookings(
        collegeId,
        selectedRoute,
        (bookingsData) => {
          setBookings(bookingsData);
        }
      );
      unsubscribers.push(bookingsUnsubscribe);
    } else {
      // Subscribe to all routes
      routes.forEach(route => {
        const bookingsUnsubscribe = subscribeToCollegeBookings(
          collegeId,
          route.id,
          (bookingsData) => {
            setBookings(prev => {
              const filtered = prev.filter(b => b.routeId !== route.id);
              return [...filtered, ...bookingsData].sort((a, b) => b.bookedAt - a.bookedAt);
            });
          }
        );
        unsubscribers.push(bookingsUnsubscribe);
      });
    }

    // Subscribe to bogie data
    routes.forEach(route => {
      bogies.forEach(bogieId => {
        const bogieUnsubscribe = subscribeToCollegeBogieData(
          collegeId,
          route.id,
          bogieId,
          (data) => {
            if (data) {
              setBogieData(prev => ({
                ...prev,
                [`${route.id}_${bogieId}`]: data
              }));
            }
          }
        );
        unsubscribers.push(bogieUnsubscribe);
      });
    });

    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, [isAuthenticated, college, selectedRoute, collegeId]);

  const handleCancelBooking = async (bookingId, routeId) => {
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      await cancelCollegeBooking(collegeId, routeId, bookingId);
      toast.success('Booking cancelled successfully!');
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error(error.message || 'Failed to cancel booking');
    }
  };

  const handleToggleSeatStatus = async (routeId, bogieId, seatId, currentStatus) => {
    try {
      await toggleCollegeSeatAvailability(collegeId, routeId, bogieId, seatId, currentStatus);
      toast.success('Seat status updated successfully!');
    } catch (error) {
      console.error('Error toggling seat status:', error);
      toast.error(error.message || 'Failed to update seat status');
    }
  };

  const exportToCSV = () => {
    const filteredBookings = getFilteredBookings();
    
    if (filteredBookings.length === 0) {
      toast.warning('No bookings to export');
      return;
    }

    const csvContent = [
      ['Name', 'Email', 'Phone', 'Route', 'Bogie', 'Seat Number', 'Seat Type', 'Booking Date'].join(','),
      ...filteredBookings.map(booking => [
        booking.userName,
        booking.email,
        booking.phone,
        booking.route?.name || 'N/A',
        booking.bogieId.toUpperCase(),
        booking.seatNumber,
        booking.seatType,
        new Date(booking.bookedAt).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${college?.name}_bookings_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success('Bookings exported successfully!');
  };

  const getFilteredBookings = () => {
    return bookings.filter(booking => {
      const matchesSearch = 
        booking.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.phone.includes(searchTerm) ||
        booking.seatNumber.toString().includes(searchTerm);
      
      const matchesBogie = selectedBogie === 'all' || booking.bogieId === selectedBogie;
      const matchesRoute = selectedRoute === 'all' || booking.routeId === selectedRoute;
      
      return matchesSearch && matchesBogie && matchesRoute;
    });
  };

  const getTotalStats = () => {
    const stats = {
      totalBookings: bookings.length,
      totalSeats: 0,
      bookedSeats: 0,
      reservedSeats: 0,
      unavailableSeats: 0,
      availableSeats: 0
    };

    Object.values(bogieData).forEach(bogie => {
      if (bogie.seats) {
        stats.totalSeats += bogie.seats.length;
        stats.bookedSeats += bogie.seats.filter(seat => seat.status === SEAT_STATUS.BOOKED).length;
        stats.reservedSeats += bogie.seats.filter(seat => seat.status === SEAT_STATUS.RESERVED).length;
        stats.unavailableSeats += bogie.seats.filter(seat => seat.status === SEAT_STATUS.UNAVAILABLE).length;
        stats.availableSeats += bogie.seats.filter(seat => seat.status === SEAT_STATUS.AVAILABLE).length;
      }
    });

    return stats;
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              🔐
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Login</h2>
            <p className="text-gray-600">Enter admin password to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                  placeholder="Enter admin password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Login
            </button>

            <button
              type="button"
              onClick={() => navigate(`/college/${collegeId}`)}
              className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft size={20} />
              Back to Booking Page
            </button>
          </form>
        </div>

        <ToastContainer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = getTotalStats();
  const filteredBookings = getFilteredBookings();
  const routes = college?.settings?.routes || [];
  const bogies = college?.settings?.bogies || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{college?.name} - Admin</h1>
              <p className="text-sm text-gray-600">College Code: {collegeId}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="text-blue-600" size={24} />
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Bookings</p>
                <p className="text-2xl font-semibold text-gray-800">{stats.totalBookings}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Train className="text-green-600" size={24} />
              <div className="ml-4">
                <p className="text-sm text-gray-600">Available Seats</p>
                <p className="text-2xl font-semibold text-gray-800">{stats.availableSeats}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-red-500 rounded"></div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Booked Seats</p>
                <p className="text-2xl font-semibold text-gray-800">{stats.bookedSeats}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-yellow-500 rounded"></div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Reserved Seats</p>
                <p className="text-2xl font-semibold text-gray-800">{stats.reservedSeats}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-gray-500 rounded"></div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Unavailable</p>
                <p className="text-2xl font-semibold text-gray-800">{stats.unavailableSeats}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b">
            <div className="flex">
              <button
                onClick={() => setActiveTab('bookings')}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === 'bookings'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Users size={20} />
                  Bookings Management
                </div>
              </button>
              <button
                onClick={() => setActiveTab('seats')}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === 'seats'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <SettingsIcon size={20} />
                  Seat Management
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Bookings Management Tab */}
        {activeTab === 'bookings' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Bookings Management</h2>
            
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by name, email, phone, or seat number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <select
                value={selectedRoute}
                onChange={(e) => setSelectedRoute(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Routes</option>
                {routes.map(route => (
                  <option key={route.id} value={route.id}>{route.name}</option>
                ))}
              </select>
              
              <select
                value={selectedBogie}
                onChange={(e) => setSelectedBogie(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Bogies</option>
                {bogies.map(bogieId => (
                  <option key={bogieId} value={bogieId}>
                    {bogieId.toUpperCase()}
                  </option>
                ))}
              </select>
              
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download size={20} />
                Export CSV
              </button>
            </div>

            {/* Bookings Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Contact</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Route</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Seat</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Booked At</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map(booking => (
                    <tr key={booking.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-800">
                        {booking.userName}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        <div>{booking.email}</div>
                        <div className="text-sm">{booking.phone}</div>
                      </td>
                      <td className="py-3 px-4">
                        {booking.route ? (
                          <div>
                            <div className="font-medium text-gray-800">{booking.route.name}</div>
                            <div className="text-sm text-gray-600">
                              {booking.route.from} → {booking.route.to}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">No route info</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium">
                          {booking.bogieId.toUpperCase()} - Seat {booking.seatNumber}
                        </div>
                        <div className="text-sm text-gray-600">
                          {booking.seatType.replace('_', ' ')}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {new Date(booking.bookedAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleCancelBooking(booking.id, booking.routeId)}
                          className="flex items-center gap-1 px-3 py-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 size={16} />
                          Cancel
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredBookings.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No bookings found matching your criteria.
                </div>
              )}
            </div>
          </div>
        </div>
        )}

        {/* Seat Management Tab */}
        {activeTab === 'seats' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Seat Management</h2>
              
              {/* Route and Bogie Selection */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <select
                  value={selectedRoute}
                  onChange={(e) => setSelectedRoute(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {routes.map(route => (
                    <option key={route.id} value={route.id}>{route.name}</option>
                  ))}
                </select>
                
                <select
                  value={selectedBogie}
                  onChange={(e) => setSelectedBogie(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {bogies.map(bogieId => (
                    <option key={bogieId} value={bogieId}>
                      {bogieId.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-500 rounded"></div>
                  <span className="text-sm text-gray-700">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-red-500 rounded"></div>
                  <span className="text-sm text-gray-700">Booked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-yellow-500 rounded"></div>
                  <span className="text-sm text-gray-700">Reserved</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-500 rounded"></div>
                  <span className="text-sm text-gray-700">Unavailable</span>
                </div>
              </div>

              {/* Seats Grid */}
              {selectedRoute && selectedRoute !== 'all' && selectedBogie && selectedBogie !== 'all' && (
                <div className="overflow-x-auto">
                  {bogieData[`${selectedRoute}_${selectedBogie}`]?.seats ? (
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                      {bogieData[`${selectedRoute}_${selectedBogie}`].seats.map(seat => (
                        <button
                          key={seat.id}
                          onClick={() => handleToggleSeatStatus(selectedRoute, selectedBogie, seat.id, seat.status)}
                          disabled={seat.status === SEAT_STATUS.BOOKED}
                          className={`p-3 rounded-lg font-medium text-sm transition-all ${
                            seat.status === SEAT_STATUS.AVAILABLE
                              ? 'bg-green-500 text-white hover:bg-green-600'
                              : seat.status === SEAT_STATUS.BOOKED
                              ? 'bg-red-500 text-white cursor-not-allowed'
                              : seat.status === SEAT_STATUS.RESERVED
                              ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                              : 'bg-gray-500 text-white hover:bg-gray-600'
                          }`}
                          title={`Seat ${seat.number} - ${seat.status}${seat.bookedBy ? ` (${seat.bookedBy})` : ''}`}
                        >
                          {seat.number}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No seats data available for this bogie.
                    </div>
                  )}
                </div>
              )}

              {(selectedRoute === 'all' || selectedBogie === 'all') && (
                <div className="text-center py-8 text-gray-500">
                  Please select a specific route and bogie to manage seats.
                </div>
              )}

              {/* Instructions */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">How to Manage Seats:</h3>
                <ul className="list-disc list-inside space-y-1 text-blue-700 text-sm">
                  <li>Click on a seat to cycle through: Available → Reserved → Unavailable → Available</li>
                  <li>Booked seats cannot be changed (cancel the booking first)</li>
                  <li>Reserved seats are for faculty or special allocations</li>
                  <li>Unavailable seats are blocked from booking</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      <ToastContainer />
    </div>
  );
};

export default CollegeAdminPage;
