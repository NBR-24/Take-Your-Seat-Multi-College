import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import RouteSelector from '../components/RouteSelector';
import BogieSelector from '../components/BogieSelector';
import SleeperSeatMap from '../components/SleeperSeatMap';
import BookingModal from '../components/BookingModal';
import { subscribeToBogieData, bookSeat } from '../services/realtimeService';
import { SEAT_STATUS } from '../utils/seatLayout';
import { ROUTES } from '../utils/routeConfig';

// Toast notification styles
import 'react-toastify/dist/ReactToastify.css';

const BookingPage = () => {
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [activeBogieId, setActiveBogieId] = useState(null);
  
  // Get bogies from selected route
  const bogies = selectedRoute ? selectedRoute.bogies : [];
  const [bogieData, setBogieData] = useState({});
  const [bogieStats, setBogieStats] = useState({});
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isBookingLoading, setIsBookingLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  // Subscribe to bogie data changes
  useEffect(() => {
    if (bogies.length === 0) {
      setLoading(false);
      return;
    }

    // Set first bogie as active if none selected
    if (!activeBogieId && bogies.length > 0) {
      setActiveBogieId(bogies[0]);
    }

    const unsubscribers = [];
    
    bogies.forEach(bogieId => {
      const unsubscribe = subscribeToBogieData(bogieId, (data) => {
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
        
        setLoading(false);
      });
      
      unsubscribers.push(unsubscribe);
    });
    
    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, [bogies]);

  const handleRouteChange = (route) => {
    setSelectedRoute(route);
    // Reset active bogie when route changes
    if (route && route.bogies.length > 0) {
      setActiveBogieId(route.bogies[0]);
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
    setSelectedSeat(null); // Clear selection when changing bogie
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
      // Include route information in booking
      const bookingDetails = {
        ...userDetails,
        route: selectedRoute
      };
      
      await bookSeat(activeBogieId, selectedSeat.id, bookingDetails);
      
      toast.success(`Seat ${selectedSeat.number} booked successfully!`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      setIsBookingModalOpen(false);
      setSelectedSeat(null);
    } catch (error) {
      console.error('Booking failed:', error);
      
      let errorMessage = 'Failed to book seat. Please try again.';
      if (error.message.includes('already has a booking')) {
        errorMessage = 'You already have a booking. Each person can book only one seat.';
      } else if (error.message.includes('not available')) {
        errorMessage = 'This seat is no longer available. Please select another seat.';
      }
      
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 7000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
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


  const currentBogieData = bogieData[activeBogieId];
  const seats = currentBogieData?.seats || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading seat information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
            Take Your Seat
          </h1>
          <p className="text-gray-600 text-lg">
            Industrial Visit Train Ticket Booking
          </p>
        </div>

        {/* Route Selector */}
        <RouteSelector
          selectedRoute={selectedRoute}
          onRouteChange={handleRouteChange}
        />

        {/* Bogie Selector - Only show if route is selected */}
        {selectedRoute && (
          <BogieSelector
            bogies={bogies}
            activeBogieId={activeBogieId}
            onBogieChange={handleBogieChange}
            bogieStats={bogieStats}
          />
        )}

        {/* Seat Map - Only show if route is selected */}
        {selectedRoute && (
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
            <li>Select your preferred bogie (S1, S2, or S3)</li>
            <li>Click on an available (green) seat</li>
            <li>Fill in your details in the booking form</li>
            <li>Confirm your booking</li>
          </ol>
          <p className="mt-4 text-sm text-blue-600">
            <strong>Note:</strong> Each person can book only one seat. Your email and phone number must be unique across all bookings.
          </p>
        </div>
      </div>

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

export default BookingPage;
