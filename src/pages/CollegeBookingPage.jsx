import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { Settings, ArrowLeft } from 'lucide-react';
import BogieSelector from '../components/BogieSelector';
import SleeperSeatMap from '../components/SleeperSeatMap';
import BookingModal from '../components/BookingModal';
import { subscribeToCollegeBogieData, bookCollegeSeat } from '../services/multiCollegeService';
import { getCollegeByCode } from '../services/collegeService';
import { SEAT_STATUS } from '../utils/seatLayout';
import 'react-toastify/dist/ReactToastify.css';

const CollegeBookingPage = () => {
  const { collegeId } = useParams();
  const navigate = useNavigate();
  
  const [college, setCollege] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [activeBogieId, setActiveBogieId] = useState(null);
  const [bogieData, setBogieData] = useState({});
  const [bogieStats, setBogieStats] = useState({});
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isBookingLoading, setIsBookingLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load college data
  useEffect(() => {
    const loadCollege = async () => {
      try {
        setLoading(true);
        const collegeData = await getCollegeByCode(collegeId);
        setCollege(collegeData);
        
        // Set first route as default
        if (collegeData.settings?.routes?.length > 0) {
          setSelectedRoute(collegeData.settings.routes[0]);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error loading college:', err);
        setError('College not found. Please check your college code.');
      } finally {
        setLoading(false);
      }
    };

    if (collegeId) {
      loadCollege();
    }
  }, [collegeId]);

  // Subscribe to bogie data when route changes
  useEffect(() => {
    if (!college || !selectedRoute) {
      return;
    }

    const bogies = college.settings.bogies || [];
    
    if (bogies.length === 0) {
      return;
    }

    // Set first bogie as active if none selected
    if (!activeBogieId && bogies.length > 0) {
      setActiveBogieId(bogies[0]);
    }

    const unsubscribers = [];
    
    bogies.forEach(bogieId => {
      const unsubscribe = subscribeToCollegeBogieData(
        collegeId,
        selectedRoute.id,
        bogieId,
        (data) => {
          if (data) {
            setBogieData(prev => ({
              ...prev,
              [bogieId]: data
            }));
            
            // Update stats
            const totalSeats = data.totalSeats || 80;
            const bookedSeats = data.bookedSeats || 0;
            const reservedSeats = data.reservedSeats || 0;
            const unavailableSeats = data.seats ? data.seats.filter(seat => seat.status === 'unavailable').length : 0;
            const availableSeats = data.seats ? data.seats.filter(seat => seat.status === 'available').length : (totalSeats - bookedSeats - reservedSeats - unavailableSeats);
            
            setBogieStats(prev => ({
              ...prev,
              [bogieId]: {
                totalSeats,
                bookedSeats,
                reservedSeats,
                unavailableSeats,
                availableSeats
              }
            }));
          }
        }
      );
      
      unsubscribers.push(unsubscribe);
    });
    
    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, [college, selectedRoute, collegeId]);

  const handleRouteChange = (route) => {
    setSelectedRoute(route);
    // Reset active bogie when route changes
    if (college?.settings?.bogies?.length > 0) {
      setActiveBogieId(college.settings.bogies[0]);
    } else {
      setActiveBogieId(null);
    }
    // Clear previous data
    setBogieData({});
    setBogieStats({});
    setSelectedSeat(null);
  };

  const handleBogieChange = (bogieId) => {
    setActiveBogieId(bogieId);
    setSelectedSeat(null);
  };

  const handleSeatClick = (seat) => {
    if (!selectedRoute) {
      toast.warning('Please select a route first!', {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }
    
    if (seat.status === SEAT_STATUS.AVAILABLE) {
      setSelectedSeat(seat);
      setIsBookingModalOpen(true);
    }
  };

  const handleConfirmBooking = async (userDetails) => {
    if (!selectedSeat || !selectedRoute) return;
    
    setIsBookingLoading(true);
    
    try {
      const bookingDetails = {
        ...userDetails,
        route: selectedRoute
      };
      
      await bookCollegeSeat(
        collegeId,
        selectedRoute.id,
        activeBogieId,
        selectedSeat.id,
        bookingDetails
      );
      
      toast.success(`Seat ${selectedSeat.number} booked successfully!`, {
        position: "top-right",
        autoClose: 5000,
      });
      
      setIsBookingModalOpen(false);
      setSelectedSeat(null);
    } catch (error) {
      console.error('Booking failed:', error);
      
      let errorMessage = 'Failed to book seat. Please try again.';
      if (error.message.includes('already has a booking')) {
        errorMessage = 'You already have a booking for this route. Each person can book only one seat per route.';
      } else if (error.message.includes('not available')) {
        errorMessage = 'This seat is no longer available. Please select another seat.';
      }
      
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 7000,
      });
    } finally {
      setIsBookingLoading(false);
    }
  };

  const handleCloseModal = () => {
    if (!isBookingLoading) {
      setIsBookingModalOpen(false);
      setSelectedSeat(null);
    }
  };

  const handleAdminClick = () => {
    navigate(`/college/${collegeId}/admin`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading college information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">❌</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">College Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
          >
            <ArrowLeft size={20} />
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const currentBogieData = bogieData[activeBogieId];
  const seats = currentBogieData?.seats || [];
  const bogies = college?.settings?.bogies || [];
  const routes = college?.settings?.routes || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              {college?.logoUrl ? (
                <img src={college.logoUrl} alt={college.name} className="h-10 w-10 object-contain" />
              ) : (
                <div className="bg-blue-600 text-white rounded-lg p-2">
                  🚂
                </div>
              )}
              <div>
                <h1 className="text-lg font-bold text-gray-800">{college?.name}</h1>
                <p className="text-xs text-gray-600">Code: {collegeId}</p>
              </div>
            </div>
            
            <button
              onClick={handleAdminClick}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              title="Admin Panel"
            >
              <Settings size={20} />
              <span className="hidden sm:inline">Admin</span>
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
            Book Your Seat
          </h2>
          <p className="text-gray-600 text-lg">
            Industrial Visit Train Ticket Booking
          </p>
        </div>

        {/* Route Selector */}
        {routes.length > 1 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Route
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {routes.map(route => (
                <button
                  key={route.id}
                  onClick={() => handleRouteChange(route)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedRoute?.id === route.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <h3 className="font-semibold text-gray-800">{route.name}</h3>
                  <p className="text-sm text-gray-600">{route.from} → {route.to}</p>
                  {route.trainNumber && (
                    <p className="text-xs text-gray-500 mt-1">
                      {route.trainNumber} - {route.trainName}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Bogie Selector */}
        {selectedRoute && bogies.length > 0 && (
          <BogieSelector
            bogies={bogies}
            activeBogieId={activeBogieId}
            onBogieChange={handleBogieChange}
            bogieStats={bogieStats}
          />
        )}

        {/* Seat Map */}
        {selectedRoute && activeBogieId && (
          <SleeperSeatMap
            seats={seats}
            onSeatClick={handleSeatClick}
            selectedSeat={selectedSeat}
            bogieNumber={activeBogieId.toUpperCase()}
          />
        )}

        {/* Booking Modal */}
        <BookingModal
          isOpen={isBookingModalOpen}
          onClose={handleCloseModal}
          seat={selectedSeat}
          onConfirmBooking={handleConfirmBooking}
          isLoading={isBookingLoading}
        />

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-800 mb-3">How to Book:</h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-700">
            {routes.length > 1 && <li>Select your preferred route</li>}
            <li>Select your preferred bogie from available options</li>
            <li>Click on an available (green) seat</li>
            <li>Fill in your details in the booking form</li>
            <li>Confirm your booking</li>
          </ol>
          <p className="mt-4 text-sm text-blue-600">
            <strong>Note:</strong> Each person can book only one seat per route. Your email and phone number must be unique for each route.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-gray-600">
          <p className="text-sm">
            <strong>Powered by Take Your Seat</strong>
          </p>
        </div>
      </footer>

      <ToastContainer />
    </div>
  );
};

export default CollegeBookingPage;
