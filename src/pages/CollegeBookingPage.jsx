import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { Settings, ArrowLeft, Train, ArrowRight, AlertCircle } from 'lucide-react';
import BogieSelector from '../components/BogieSelector';
import SleeperSeatMap from '../components/SleeperSeatMap';
import AC2TierSeatMap from '../components/AC2TierSeatMap';
import BookingModal from '../components/BookingModal';
import ThemeToggle from '../components/ThemeToggle';
import { useTheme } from '../contexts/ThemeContext';
import { subscribeToCollegeBogieData, bookCollegeSeat } from '../services/multiCollegeService';
import { getCollegeByCode } from '../services/collegeService';
import { SEAT_STATUS } from '../utils/seatLayout';
import { normalizeBogieData, BOGIE_TYPES } from '../utils/bogieTypes';
import { BookingPageSkeleton } from '../components/SkeletonLoaders';
import 'react-toastify/dist/ReactToastify.css';

const CollegeBookingPage = () => {
  const { collegeId } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();

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


  const bg = isDark ? 'bg-dark-700' : 'bg-gray-50';
  const headerBg = isDark ? 'bg-dark-500 border-dark-200' : 'bg-white border-gray-200';
  const heading = isDark ? 'text-white' : 'text-gray-900';
  const subtext = isDark ? 'text-gray-400' : 'text-gray-600';
  const cardBg = isDark ? 'glass-card' : 'bg-white rounded-2xl shadow-lg border border-gray-200';
  const footerBg = isDark ? 'bg-dark-500 border-dark-200' : 'bg-white border-gray-200';

  useEffect(() => {
    const loadCollege = async () => {
      try {
        setLoading(true);
        const collegeData = await getCollegeByCode(collegeId);
        setCollege(collegeData);
        if (collegeData.settings?.routes?.length > 0) setSelectedRoute(collegeData.settings.routes[0]);
        setError(null);
      } catch (err) {
        console.error('Error loading college:', err);
        setError('College not found. Please check your college code.');
      } finally {
        setLoading(false);
      }
    };
    if (collegeId) loadCollege();
  }, [collegeId]);

  useEffect(() => {
    if (!college || !selectedRoute) return;
    const rawBogies = college.settings.bogies || [];
    if (rawBogies.length === 0) return;

    // Normalize bogies and extract IDs
    const normalizedBogies = rawBogies.map(b => normalizeBogieData(b));
    const bogieIds = normalizedBogies.map(b => b.id);

    if (!activeBogieId && bogieIds.length > 0) setActiveBogieId(bogieIds[0]);

    const unsubscribers = [];
    bogieIds.forEach(bogieId => {
      const unsubscribe = subscribeToCollegeBogieData(collegeId, selectedRoute.id, bogieId, (data) => {
        if (data) {
          setBogieData(prev => ({ ...prev, [bogieId]: data }));
          const totalSeats = data.totalSeats || 80;
          const bookedSeats = data.bookedSeats || 0;
          const reservedSeats = data.reservedSeats || 0;
          const unavailableSeats = data.seats ? data.seats.filter(s => s.status === 'unavailable').length : 0;
          const availableSeats = data.seats ? data.seats.filter(s => s.status === 'available').length : (totalSeats - bookedSeats - reservedSeats - unavailableSeats);
          setBogieStats(prev => ({ ...prev, [bogieId]: { totalSeats, bookedSeats, reservedSeats, unavailableSeats, availableSeats } }));
        }
      });
      unsubscribers.push(unsubscribe);
    });
    return () => unsubscribers.forEach(u => u());
  }, [college, selectedRoute, collegeId]);

  const handleRouteChange = (route) => {
    setSelectedRoute(route);
    if (college?.settings?.bogies?.length > 0) {
      const firstBogie = normalizeBogieData(college.settings.bogies[0]);
      setActiveBogieId(firstBogie.id);
    } else {
      setActiveBogieId(null);
    }
    setBogieData({}); setBogieStats({}); setSelectedSeat(null);
  };
  const handleBogieChange = (bogieId) => { setActiveBogieId(bogieId); setSelectedSeat(null); };
  const handleSeatClick = (seat) => {
    if (!selectedRoute) { toast.warning('Please select a route first!'); return; }
    if (seat.status === SEAT_STATUS.AVAILABLE) { setSelectedSeat(seat); setIsBookingModalOpen(true); }
  };
  const handleConfirmBooking = async (userDetails) => {
    if (!selectedSeat || !selectedRoute) return;
    setIsBookingLoading(true);
    try {
      await bookCollegeSeat(collegeId, selectedRoute.id, activeBogieId, selectedSeat.id, { ...userDetails, route: selectedRoute });
      toast.success(`Seat ${selectedSeat.number} booked successfully!`);
      setIsBookingModalOpen(false); setSelectedSeat(null);
    } catch (error) {
      let msg = 'Failed to book seat. Please try again.';
      if (error.message.includes('already has a booking')) msg = 'You already have a booking for this route.';
      else if (error.message.includes('not available')) msg = 'This seat is no longer available.';
      toast.error(msg);
    } finally {
      setIsBookingLoading(false);
    }
  };
  const handleCloseModal = () => { if (!isBookingLoading) { setIsBookingModalOpen(false); setSelectedSeat(null); } };

  if (loading) {
    return <BookingPageSkeleton />;
  }

  if (error) {
    return (
      <div className={`min-h-screen ${bg} flex items-center justify-center p-4`}>
        <div className="text-center max-w-md">
          <div className={`${isDark ? 'bg-red-500/10 border border-red-500/20' : 'bg-[#FFF5F5] border border-[#FFE1E1]'} rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 shadow-sm`}>
            <AlertCircle className={`w-8 h-8 ${isDark ? 'text-[#FC8181]' : 'text-[#C53030]'}`} strokeWidth={2.5} />
          </div>
          <h2 className={`text-2xl font-bold ${heading} mb-2`}>College Not Found</h2>
          <p className={`${subtext} mb-6`}>{error}</p>
          <button onClick={() => navigate('/')} className="px-6 py-3 bg-accent text-dark-700 font-bold rounded-xl hover:bg-accent-light transition-all flex items-center gap-2 mx-auto"><ArrowLeft size={20} />Back to Home</button>
        </div>
      </div>
    );
  }

  const currentBogieData = bogieData[activeBogieId];
  const seats = currentBogieData?.seats || [];
  const rawBogies = college?.settings?.bogies || [];
  const bogies = rawBogies.map(b => normalizeBogieData(b));
  const routes = college?.settings?.routes || [];

  // Get current bogie type
  const currentBogie = bogies.find(b => b.id === activeBogieId);
  const currentBogieType = currentBogie?.type || BOGIE_TYPES.SLEEPER;

  return (
    <div className={`min-h-screen ${bg}`}>
      <div className={`${headerBg} border-b sticky top-0 z-40`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              {college?.logoUrl ? (
                <img src={college.logoUrl} alt={college.name} className="h-10 w-10 object-contain rounded-lg" />
              ) : (
                <div className="bg-accent/20 text-accent rounded-xl p-2">🚂</div>
              )}
              <div>
                <h1 className={`text-lg font-bold ${heading}`}>{college?.name}</h1>
                <p className={`text-xs ${subtext}`}>Code: <span className="text-accent font-mono">{collegeId}</span></p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button
                onClick={() => navigate(`/college/${collegeId}/admin`)}
                className={`flex items-center gap-2 px-3 py-2 border rounded-xl transition-all ${isDark ? 'text-gray-400 hover:text-accent border-dark-200 hover:border-accent/30' : 'text-gray-600 hover:text-accent border-gray-300 hover:border-accent/30'}`}
                title="Admin Panel"
              >
                <Settings size={20} />
                <span className="hidden sm:inline">Admin</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="text-center mb-8">
          <h2 className={`text-3xl sm:text-4xl font-bold ${heading} mb-2`}>Book Your <span className="text-accent">Seat</span></h2>
          <p className={`${subtext} text-lg`}>Industrial Visit Train Ticket Booking</p>
        </div>

        {routes.length > 1 && (
          <div className="mb-6">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Select Route</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {routes.map(route => (
                <button key={route.id} onClick={() => handleRouteChange(route)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${selectedRoute?.id === route.id
                    ? 'border-accent bg-accent/10'
                    : isDark ? 'border-dark-200 hover:border-accent/30 bg-dark-500' : 'border-gray-200 hover:border-accent/30 bg-white'
                    }`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${selectedRoute?.id === route.id ? 'bg-accent/20' : isDark ? 'bg-dark-400' : 'bg-gray-100'}`}>
                      <Train className={`${selectedRoute?.id === route.id ? 'text-accent' : isDark ? 'text-gray-400' : 'text-gray-500'}`} size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-semibold ${heading}`}>{route.name}</h3>
                      <div className={`flex items-center gap-2 text-sm mt-1 ${subtext}`}>
                        <span className="truncate">{route.from}</span>
                        <ArrowRight size={14} className="text-accent flex-shrink-0" />
                        <span className="truncate">{route.to}</span>
                      </div>
                      {route.trainNumber && (
                        <span className={`inline-block text-xs mt-2 px-2 py-0.5 rounded-full ${isDark ? 'bg-dark-400 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                          🚂 {route.trainNumber}{route.trainName ? ` — ${route.trainName}` : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedRoute && bogies.length > 0 && <BogieSelector bogies={bogies} activeBogieId={activeBogieId} onBogieChange={handleBogieChange} bogieStats={bogieStats} />}
        {selectedRoute && activeBogieId && (
          currentBogieType === BOGIE_TYPES.AC_2_TIER ? (
            <AC2TierSeatMap seats={seats} onSeatClick={handleSeatClick} selectedSeat={selectedSeat} bogieNumber={activeBogieId.toUpperCase()} />
          ) : (
            <SleeperSeatMap seats={seats} onSeatClick={handleSeatClick} selectedSeat={selectedSeat} bogieNumber={activeBogieId.toUpperCase()} />
          )
        )}
        <BookingModal isOpen={isBookingModalOpen} onClose={handleCloseModal} seat={selectedSeat} onConfirmBooking={handleConfirmBooking} isLoading={isBookingLoading} />

        <div className="mt-8 message-box-info items-start">
          <Info className="w-5 h-5 mt-0.5 shrink-0" />
          <div>
            <h3 className="font-semibold mb-3">How to Book:</h3>
            <ol className="list-decimal list-inside space-y-2 opacity-90">
              {routes.length > 1 && <li>Select your preferred route</li>}
              <li>Select your preferred bogie from available options</li>
              <li>Click on an available (green) seat</li>
              <li>Fill in your details in the booking form</li>
              <li>Confirm your booking</li>
            </ol>
            <p className="mt-4 text-sm opacity-75">
              <strong>Note:</strong> Each person can book only one seat per route.
            </p>
          </div>
        </div>
      </div>

      <footer className={`${footerBg} border-t mt-12`}>
        <div className={`container mx-auto px-4 py-6 text-center ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
          <p className="text-sm"><strong className={isDark ? 'text-gray-300' : 'text-gray-700'}>Powered by Take Your Seat</strong></p>
        </div>
      </footer>

      <ToastContainer theme={isDark ? 'dark' : 'light'} />
    </div>
  );
};

export default CollegeBookingPage;
