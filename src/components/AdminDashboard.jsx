import React, { useState, useEffect } from 'react';
import { 
  LogOut, 
  Users, 
  Train, 
  Download, 
  Search, 
  Filter,
  ToggleLeft,
  ToggleRight,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { toast } from 'react-toastify';
import { 
  subscribeToAllBookings, 
  subscribeToBogieData, 
  toggleSeatReservation, 
  toggleSeatAvailability,
  cancelBooking,
  bookSeat,
  initializeAllBogies
} from '../services/realtimeService';
import { ref, set, get } from 'firebase/database';
import { db } from '../config/firebase';
import { SEAT_STATUS, getSeatTypeDisplay } from '../utils/seatLayout';

const AdminDashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [bogieData, setBogieData] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBogie, setSelectedBogie] = useState('all');
  const [selectedRoute, setSelectedRoute] = useState('all'); // Add route filter
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    name: '',
    email: '',
    phone: ''
  });

  // All bogies from both routes
  const allBogies = ['s2', 's3', 's4', 's5', 's6', 's7'];
  const returnBogies = ['s2', 's3', 's4', 's5', 's6'];
  const onwardBogies = ['s3', 's5', 's7'];

  // Subscribe to bookings and bogie data
  useEffect(() => {
    const unsubscribers = [];
    let loadedCount = 0;
    const totalExpected = returnBogies.length + onwardBogies.length + 1; // +1 for bookings

    const checkAllLoaded = () => {
      loadedCount++;
      console.log(`Loaded ${loadedCount}/${totalExpected} data sources`);
      if (loadedCount >= totalExpected) {
        setLoading(false);
      }
    };

    // Subscribe to bookings from both routes
    const bookingsUnsubscribe = subscribeToAllBookings((bookingsData) => {
      console.log('Bookings loaded:', bookingsData.length);
      setBookings(bookingsData);
      checkAllLoaded();
    });
    unsubscribers.push(bookingsUnsubscribe);

    // Subscribe to bogie data from both routes
    // Return route bogies
    returnBogies.forEach(bogieId => {
      const bogieUnsubscribe = subscribeToBogieData(bogieId, (data) => {
        console.log(`Return bogie ${bogieId} loaded:`, data.seats?.length || 0, 'seats');
        setBogieData(prev => ({
          ...prev,
          [bogieId]: { ...data, routeId: 'delhi_shornur' }
        }));
        checkAllLoaded();
      }, 'delhi_shornur');
      unsubscribers.push(bogieUnsubscribe);
    });
    
    // Onward route bogies
    onwardBogies.forEach(bogieId => {
      const bogieUnsubscribe = subscribeToBogieData(bogieId, (data) => {
        console.log(`Onward bogie ${bogieId} loaded:`, data.seats?.length || 0, 'seats');
        setBogieData(prev => ({
          ...prev,
          [`${bogieId}_onward`]: { ...data, routeId: 'shornur_agra', id: bogieId }
        }));
        checkAllLoaded();
      }, 'shornur_agra');
      unsubscribers.push(bogieUnsubscribe);
    });

    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.log('Loading timeout reached, forcing load completion');
      setLoading(false);
    }, 10000);

    return () => {
      clearTimeout(timeoutId);
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminAuthenticated');
    onLogout();
  };

  const handleToggleReservation = async (bogieId, seatId, currentStatus, routeId) => {
    try {
      const isReserved = currentStatus === SEAT_STATUS.RESERVED;
      await toggleSeatReservation(bogieId, seatId, !isReserved, routeId);
      
      toast.success(
        `Seat ${isReserved ? 'unreserved' : 'reserved'} successfully!`,
        { position: "top-right", autoClose: 3000 }
      );
    } catch (error) {
      console.error('Error toggling reservation:', error);
      toast.error(error.message || 'Failed to update seat reservation', {
        position: "top-right",
        autoClose: 5000
      });
    }
  };

  const handleCancelBooking = async (bookingId, routeId) => {
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      await cancelBooking(bookingId, routeId);
      toast.success('Booking cancelled successfully!', {
        position: "top-right",
        autoClose: 3000
      });
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error(error.message || 'Failed to cancel booking', {
        position: "top-right",
        autoClose: 5000
      });
    }
  };

  // Manual booking handlers
  const handleSeatClick = (seat, bogieId, routeId) => {
    if (seat.status === SEAT_STATUS.AVAILABLE) {
      setSelectedSeat({ ...seat, bogieId, routeId });
      setShowBookingModal(true);
    }
  };

  const handleManualBooking = async () => {
    if (!selectedSeat || !bookingForm.name || !bookingForm.email || !bookingForm.phone) {
      toast.error('Please fill all fields', {
        position: "top-right",
        autoClose: 3000
      });
      return;
    }

    try {
      await bookSeat(selectedSeat.bogieId, selectedSeat.id, {
        name: bookingForm.name.trim(),
        email: bookingForm.email.trim().toLowerCase(),
        phone: bookingForm.phone.replace(/\D/g, '')
      }, selectedSeat.routeId);

      toast.success(`Seat ${selectedSeat.number} booked successfully for ${bookingForm.name}!`, {
        position: "top-right",
        autoClose: 3000
      });

      // Reset form and close modal
      setBookingForm({ name: '', email: '', phone: '' });
      setShowBookingModal(false);
      setSelectedSeat(null);
    } catch (error) {
      console.error('Error booking seat:', error);
      toast.error(error.message || 'Failed to book seat', {
        position: "top-right",
        autoClose: 5000
      });
    }
  };

  // Toggle seat availability handler
  const handleToggleAvailability = async (bogieId, seatId, currentStatus, routeId) => {
    try {
      const updatedSeat = await toggleSeatAvailability(bogieId, seatId, currentStatus, routeId);
      
      const statusNames = {
        [SEAT_STATUS.AVAILABLE]: 'Available',
        [SEAT_STATUS.RESERVED]: 'Reserved',
        [SEAT_STATUS.UNAVAILABLE]: 'Unavailable'
      };
      
      toast.success(`Seat ${updatedSeat.number} status changed to ${statusNames[updatedSeat.status]}`, {
        position: "top-right",
        autoClose: 2000
      });
    } catch (error) {
      console.error('Error toggling seat availability:', error);
      toast.error(error.message || 'Failed to update seat status', {
        position: "top-right",
        autoClose: 5000
      });
    }
  };

  // Initialize all bogies
  const handleInitializeAllBogies = async () => {
    if (!confirm('This will initialize all bogies with fresh seat data. Continue?')) {
      return;
    }

    try {
      console.log('Starting bogie initialization...');
      await initializeAllBogies();
      toast.success('All bogies initialized successfully!', {
        position: "top-right",
        autoClose: 3000
      });
    } catch (error) {
      console.error('Error initializing bogies:', error);
      toast.error(`Failed to initialize bogies: ${error.message}`, {
        position: "top-right",
        autoClose: 5000
      });
    }
  };

  // Test Firebase connection
  const handleTestFirebase = async () => {
    try {
      console.log('Testing Firebase connection...');
      const testRef = ref(db, 'test');
      await set(testRef, { timestamp: Date.now(), message: 'Firebase test' });
      console.log('✅ Firebase write test successful');
      
      const snapshot = await get(testRef);
      if (snapshot.exists()) {
        console.log('✅ Firebase read test successful:', snapshot.val());
        toast.success('Firebase connection working!', {
          position: "top-right",
          autoClose: 3000
        });
      }
      
      // Clean up test data
      await set(testRef, null);
    } catch (error) {
      console.error('❌ Firebase test failed:', error);
      toast.error(`Firebase connection failed: ${error.message}`, {
        position: "top-right",
        autoClose: 5000
      });
    }
  };

  const exportToCSV = () => {
    const filteredBookings = getFilteredBookings();
    
    if (filteredBookings.length === 0) {
      toast.warning('No bookings to export', {
        position: "top-right",
        autoClose: 3000
      });
      return;
    }

    const csvContent = [
      ['Name', 'Email', 'Phone', 'Route', 'Train', 'Bogie', 'Seat Number', 'Seat Type', 'Booking Date'].join(','),
      ...filteredBookings.map(booking => [
        booking.userName,
        booking.email,
        booking.phone,
        booking.route ? booking.route.name : 'No route',
        booking.route ? `${booking.route.trainNumber} - ${booking.route.trainName}` : 'No train info',
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
    a.download = `bookings_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success('Bookings exported successfully!', {
      position: "top-right",
      autoClose: 3000
    });
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

  const stats = getTotalStats();
  const filteredBookings = getFilteredBookings();

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
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
                <p className="text-sm text-gray-600">Unavailable Seats</p>
                <p className="text-2xl font-semibold text-gray-800">{stats.unavailableSeats}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('bookings')}
                className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'bookings'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Bookings Management
              </button>
              <button
                onClick={() => setActiveTab('seats')}
                className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'seats'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Seat Reservations
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'bookings' && (
              <div>
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
                    <option value="delhi_shornur">Delhi to Shornur</option>
                    <option value="shornur_agra">Shornur to Agra</option>
                  </select>
                  
                  <select
                    value={selectedBogie}
                    onChange={(e) => setSelectedBogie(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Bogies</option>
                    {allBogies.map(bogieId => (
                      <option key={bogieId} value={bogieId}>
                        {bogieId.toUpperCase()}
                      </option>
                    ))}
                  </select>
                  
                  <button
                    onClick={handleTestFirebase}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <RefreshCw size={20} />
                    Test Firebase
                  </button>
                  
                  <button
                    onClick={handleInitializeAllBogies}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <RefreshCw size={20} />
                    Initialize Bogies
                  </button>
                  
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
                                <div className="font-medium text-gray-800">
                                  {booking.route.name}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {booking.route.trainNumber} - {booking.route.trainName}
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
            )}

            {activeTab === 'seats' && (
              <div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-blue-800 mb-2">Seat Management Instructions:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• <strong>Left Click:</strong> Book seat manually (available seats only)</li>
                    <li>• <strong>Right Click:</strong> Cycle status: Available → Reserved → Unavailable → Available</li>
                    <li>• <strong>Green:</strong> Available | <strong>Red:</strong> Booked | <strong>Yellow:</strong> Reserved | <strong>Gray:</strong> Unavailable</li>
                  </ul>
                </div>
                
                {/* Return Route Bogies */}
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Delhi to Shornur Route</h2>
                  {returnBogies.map(bogieId => (
                    <div key={bogieId} className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        {bogieId.toUpperCase()} (Return)
                      </h3>
                      
                      {bogieData[bogieId]?.seats && (
                        <div className="grid grid-cols-8 sm:grid-cols-10 lg:grid-cols-16 gap-2">
                          {bogieData[bogieId].seats.map(seat => (
                            <div key={seat.id} className="text-center">
                              <button
                                onClick={() => handleSeatClick(seat, bogieId, 'delhi_shornur')}
                                onContextMenu={(e) => {
                                  e.preventDefault();
                                  if (seat.status !== SEAT_STATUS.BOOKED) {
                                    handleToggleAvailability(bogieId, seat.id, seat.status, 'delhi_shornur');
                                  }
                                }}
                                className={`w-8 h-8 rounded text-xs font-semibold transition-colors ${
                                  seat.status === SEAT_STATUS.BOOKED
                                    ? 'bg-red-100 text-red-800 cursor-not-allowed'
                                    : seat.status === SEAT_STATUS.RESERVED
                                    ? 'bg-yellow-200 text-yellow-800 hover:bg-yellow-300'
                                    : seat.status === SEAT_STATUS.UNAVAILABLE
                                    ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                    : 'bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer'
                                }`}
                                title={`Seat ${seat.number} - ${
                                  seat.status === SEAT_STATUS.BOOKED 
                                    ? `Booked by ${seat.bookedBy || 'passenger'}` 
                                    : seat.status === SEAT_STATUS.RESERVED 
                                    ? 'Reserved - Right click to cycle status' 
                                    : seat.status === SEAT_STATUS.UNAVAILABLE
                                    ? 'Unavailable (occupied by others) - Right click to cycle status'
                                    : 'Available - Click to book, Right click to cycle status'
                                }`}
                              >
                                {seat.number}
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Onward Route Bogies */}
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Shornur to Agra Route</h2>
                  {onwardBogies.map(bogieId => (
                    <div key={`${bogieId}_onward`} className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        {bogieId.toUpperCase()} (Onward)
                      </h3>
                      
                      {bogieData[`${bogieId}_onward`]?.seats && (
                        <div className="grid grid-cols-8 sm:grid-cols-10 lg:grid-cols-16 gap-2">
                          {bogieData[`${bogieId}_onward`].seats.map(seat => (
                            <div key={seat.id} className="text-center">
                              <button
                                onClick={() => handleSeatClick(seat, bogieId, 'shornur_agra')}
                                onContextMenu={(e) => {
                                  e.preventDefault();
                                  if (seat.status !== SEAT_STATUS.BOOKED) {
                                    handleToggleAvailability(bogieId, seat.id, seat.status, 'shornur_agra');
                                  }
                                }}
                                className={`w-8 h-8 rounded text-xs font-semibold transition-colors ${
                                  seat.status === SEAT_STATUS.BOOKED
                                    ? 'bg-red-100 text-red-800 cursor-not-allowed'
                                    : seat.status === SEAT_STATUS.RESERVED
                                    ? 'bg-yellow-200 text-yellow-800 hover:bg-yellow-300'
                                    : seat.status === SEAT_STATUS.UNAVAILABLE
                                    ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                    : 'bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer'
                                }`}
                                title={`Seat ${seat.number} - ${
                                  seat.status === SEAT_STATUS.BOOKED 
                                    ? `Booked by ${seat.bookedBy || 'passenger'}` 
                                    : seat.status === SEAT_STATUS.RESERVED 
                                    ? 'Reserved - Right click to cycle status' 
                                    : seat.status === SEAT_STATUS.UNAVAILABLE
                                    ? 'Unavailable (occupied by others) - Right click to cycle status'
                                    : 'Available - Click to book, Right click to cycle status'
                                }`}
                              >
                                {seat.number}
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Manual Booking Modal */}
            {showBookingModal && selectedSeat && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Book Seat {selectedSeat.number} ({selectedSeat.bogieId.toUpperCase()})
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Passenger Name
                        </label>
                        <input
                          type="text"
                          value={bookingForm.name}
                          onChange={(e) => setBookingForm(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter passenger name"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={bookingForm.email}
                          onChange={(e) => setBookingForm(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter email address"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={bookingForm.phone}
                          onChange={(e) => setBookingForm(prev => ({ ...prev, phone: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter 10-digit phone number"
                        />
                      </div>
                    </div>
                    
                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={() => {
                          setShowBookingModal(false);
                          setSelectedSeat(null);
                          setBookingForm({ name: '', email: '', phone: '' });
                        }}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleManualBooking}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Book Seat
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
