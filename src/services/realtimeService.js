import { 
  ref, 
  set, 
  get, 
  push, 
  remove, 
  onValue, 
  off,
  query,
  orderByChild,
  equalTo,
  runTransaction
} from 'firebase/database';
import { db } from '../config/firebase';
import { generateSeatLayout, generateSleeperSeatLayout, SEAT_STATUS } from '../utils/seatLayout';
import { ROUTES } from '../utils/routeConfig';

// Helper functions for route-based database paths
const getBogiePath = (routeId, bogieId) => {
  const routeSuffix = routeId === 'delhi_shornur' ? 'return' : 'onward';
  return `${routeSuffix}_bogies/${bogieId}`;
};

const getBookingsPath = (routeId) => {
  const routeSuffix = routeId === 'delhi_shornur' ? 'return' : 'onward';
  return `${routeSuffix}_bookings`;
};

const getRouteFromBogieId = (bogieId) => {
  // Determine route based on bogie ID
  const returnBogies = ROUTES.DELHI_TO_SHORNUR.bogies;
  const onwardBogies = ROUTES.SHORNUR_TO_AGRA.bogies;
  
  if (returnBogies.includes(bogieId)) {
    return 'delhi_shornur';
  } else if (onwardBogies.includes(bogieId)) {
    return 'shornur_agra';
  }
  
  // Default fallback
  return 'shornur_agra';
};

// Initialize bogie data if it doesn't exist
export const initializeBogieData = async (bogieId, routeId = null) => {
  try {
    // Determine route if not provided
    if (!routeId) {
      routeId = getRouteFromBogieId(bogieId);
    }
    
    const bogiePath = getBogiePath(routeId, bogieId);
    console.log(`Initializing bogie ${bogieId} at path: ${bogiePath}`);
    
    const bogieRef = ref(db, bogiePath);
    const snapshot = await get(bogieRef);
    
    if (!snapshot.exists()) {
      console.log(`Creating new bogie ${bogieId} for route ${routeId}`);
      const seats = generateSleeperSeatLayout(); // Use sleeper layout
      const bogieData = {
        id: bogieId,
        name: bogieId.toUpperCase(),
        seats: seats,
        totalSeats: 80,
        bookedSeats: 0,
        reservedSeats: 0,
        routeId: routeId,
        layoutVersion: 'sleeper_v3',
        createdAt: Date.now()
      };
      
      await set(bogieRef, bogieData);
      console.log(`✅ Successfully initialized bogie ${bogieId} for route ${routeId} with 80 seats`);
      return seats;
    } else {
      console.log(`Bogie ${bogieId} already exists for route ${routeId}`);
      return snapshot.val().seats;
    }
  } catch (error) {
    console.error(`❌ Error initializing bogie ${bogieId} for route ${routeId}:`, error);
    console.error('Error details:', error.message);
    throw error;
  }
};

// Force reset bogie data to new sleeper layout (use this to migrate from old layout)
export const resetBogieToSleeperLayout = async (bogieId, routeId = null) => {
  try {
    // Determine route if not provided
    if (!routeId) {
      routeId = getRouteFromBogieId(bogieId);
    }
    
    const bogieRef = ref(db, getBogiePath(routeId, bogieId));
    
    // Delete existing data first
    await set(bogieRef, null);
    
    // Initialize with new sleeper layout
    const seats = generateSleeperSeatLayout();
    
    console.log(`Generated ${seats.length} seats for ${bogieId} on route ${routeId}`);
    console.log('First few seats:', seats.slice(0, 8).map(s => `${s.number}:${s.type}`));
    
    const bogieData = {
      id: bogieId,
      name: bogieId.toUpperCase(),
      seats: seats,
      totalSeats: 80,
      bookedSeats: 0,
      reservedSeats: 0,
      routeId: routeId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      layoutVersion: 'sleeper_v3' // Updated version marker
    };
    
    await set(bogieRef, bogieData);
    console.log(`Reset ${bogieId} to new sleeper layout with 80 seats on route ${routeId}`);
    return seats;
  } catch (error) {
    console.error('Error resetting bogie data:', error);
    throw error;
  }
};

// Force reset all bogies to new layout (for debugging)
export const resetAllBogiesToSleeperLayout = async () => {
  // Reset return route bogies
  const returnBogies = ['s2', 's3', 's4', 's5', 's6'];
  for (const bogieId of returnBogies) {
    await resetBogieToSleeperLayout(bogieId, 'delhi_shornur');
  }
  
  // Reset onward route bogies
  const onwardBogies = ['s3', 's5', 's7'];
  for (const bogieId of onwardBogies) {
    await resetBogieToSleeperLayout(bogieId, 'shornur_agra');
  }
  
  console.log('All bogies reset to new 80-seat sleeper layout for both routes');
};

// Initialize all bogies for both routes (call this once to set up the database)
export const initializeAllBogies = async () => {
  console.log('Initializing all bogies for both routes...');
  
  try {
    // Initialize return route bogies
    const returnBogies = ['s2', 's3', 's4', 's5', 's6'];
    for (const bogieId of returnBogies) {
      console.log(`Initializing return bogie ${bogieId}`);
      await initializeBogieData(bogieId, 'delhi_shornur');
    }
    
    // Initialize onward route bogies
    const onwardBogies = ['s3', 's5', 's7'];
    for (const bogieId of onwardBogies) {
      console.log(`Initializing onward bogie ${bogieId}`);
      await initializeBogieData(bogieId, 'shornur_agra');
    }
    
    console.log('All bogies initialized successfully!');
  } catch (error) {
    console.error('Error initializing bogies:', error);
  }
};

// Get bogie data with real-time updates
export const subscribeToBogieData = (bogieId, callback, routeId = null) => {
  // Determine route if not provided
  if (!routeId) {
    routeId = getRouteFromBogieId(bogieId);
  }
  
  const bogiePath = getBogiePath(routeId, bogieId);
  console.log(`Subscribing to bogie ${bogieId} at path: ${bogiePath}`);
  const bogieRef = ref(db, bogiePath);
  
  const unsubscribe = onValue(bogieRef, async (snapshot) => {
    console.log(`Bogie ${bogieId} snapshot exists:`, snapshot.exists());
    if (snapshot.exists()) {
      const data = snapshot.val();
      console.log(`Bogie ${bogieId} data:`, data);
      
      // Check if we need to migrate to new sleeper layout with correct berth pattern
      if (!data.layoutVersion || data.layoutVersion !== 'sleeper_v3') {
        console.log(`Migrating ${bogieId} from old layout to new sleeper layout...`);
        const seats = await resetBogieToSleeperLayout(bogieId, routeId);
        callback({
          id: bogieId,
          name: bogieId.toUpperCase(),
          seats: seats,
          totalSeats: 80,
          bookedSeats: 0,
          reservedSeats: 0,
          routeId: routeId,
          layoutVersion: 'sleeper_v3'
        });
      } else {
        callback(data);
      }
    } else {
      console.log(`Initializing bogie ${bogieId} for route ${routeId}`);
      // Initialize bogie if it doesn't exist
      const seats = await initializeBogieData(bogieId, routeId);
      callback({
        id: bogieId,
        name: bogieId.toUpperCase(),
        seats: seats,
        totalSeats: 80, // 80 seats for sleeper coach
        bookedSeats: 0,
        reservedSeats: 0,
        routeId: routeId
      });
    }
  }, (error) => {
    console.error(`Error subscribing to bogie ${bogieId} data:`, error);
  });

  return () => off(bogieRef, 'value', unsubscribe);
};

// Check if email/phone is already used for a specific route
export const checkUserExists = async (email, phone, routeId) => {
  try {
    const bookingsRef = ref(db, getBookingsPath(routeId));
    const snapshot = await get(bookingsRef);
    
    if (!snapshot.exists()) {
      return { emailExists: false, phoneExists: false, existingBooking: null };
    }
    
    const bookings = snapshot.val();
    const bookingsList = Object.values(bookings);
    
    const emailExists = bookingsList.some(booking => booking.email === email);
    const phoneExists = bookingsList.some(booking => booking.phone === phone);
    const existingBooking = bookingsList.find(booking => booking.email === email || booking.phone === phone);
    
    return { emailExists, phoneExists, existingBooking };
  } catch (error) {
    console.error('Error checking user existence:', error);
    throw error;
  }
};

// Book a seat with transaction for atomicity
export const bookSeat = async (bogieId, seatId, userDetails, routeId = null) => {
  try {
    // Determine route if not provided
    if (!routeId && userDetails.route) {
      routeId = userDetails.route.id;
    }
    if (!routeId) {
      routeId = getRouteFromBogieId(bogieId);
    }
    
    // Check if user already has a booking BEFORE the transaction
    const userCheck = await checkUserExists(userDetails.email, userDetails.phone, routeId);
    if (userCheck.emailExists || userCheck.phoneExists) {
      throw new Error('User already has a booking for this route');
    }

    const bogieRef = ref(db, getBogiePath(routeId, bogieId));
    
    return new Promise((resolve, reject) => {
      runTransaction(bogieRef, (currentData) => {
        if (!currentData) {
          throw new Error('Bogie not found');
        }
        
        const seatIndex = currentData.seats.findIndex(seat => seat.id === seatId);
        
        if (seatIndex === -1) {
          throw new Error('Seat not found');
        }
        
        const seat = currentData.seats[seatIndex];
        
        if (seat.status !== SEAT_STATUS.AVAILABLE) {
          throw new Error('Seat is not available');
        }
        
        // Update seat status
        currentData.seats[seatIndex] = {
          ...seat,
          status: SEAT_STATUS.BOOKED,
          bookedBy: userDetails.name,
          bookedAt: Date.now()
        };
        
        currentData.bookedSeats = (currentData.bookedSeats || 0) + 1;
        currentData.updatedAt = Date.now();
        
        console.log(`Booking seat ${seatId} for ${userDetails.name} on route ${routeId} - Status: ${SEAT_STATUS.BOOKED}`);
        
        return currentData;
      }).then(async (result) => {
        if (result.committed) {
          // Create booking document
          const bookingData = {
            bogieId,
            seatId,
            seatNumber: result.snapshot.val().seats.find(s => s.id === seatId).number,
            seatType: result.snapshot.val().seats.find(s => s.id === seatId).type,
            userName: userDetails.name,
            email: userDetails.email,
            phone: userDetails.phone,
            route: userDetails.route || null,
            routeId: routeId,
            bookedAt: Date.now(),
            status: 'confirmed'
          };
          
          const bookingsRef = ref(db, getBookingsPath(routeId));
          const newBookingRef = push(bookingsRef);
          await set(newBookingRef, { ...bookingData, id: newBookingRef.key });
          
          console.log(`Booking completed successfully for seat ${seatId} on route ${routeId}`);
          resolve({ ...bookingData, id: newBookingRef.key });
        } else {
          reject(new Error('Transaction failed'));
        }
      }).catch(reject);
    });
  } catch (error) {
    console.error('Error booking seat:', error);
    throw error;
  }
};

// Cancel a booking (admin function)
export const cancelBooking = async (bookingId, routeId = null) => {
  // Check if user is authenticated as admin
  const isAdminAuthenticated = localStorage.getItem('adminAuthenticated') === 'true';
  if (!isAdminAuthenticated) {
    throw new Error('Unauthorized: Admin access required to cancel bookings');
  }
  
  try {
    // If routeId not provided, try both routes
    let bookingRef, booking;
    
    if (routeId) {
      bookingRef = ref(db, `${getBookingsPath(routeId)}/${bookingId}`);
      const bookingSnapshot = await get(bookingRef);
      if (bookingSnapshot.exists()) {
        booking = bookingSnapshot.val();
      }
    } else {
      // Try both routes
      const routes = ['delhi_shornur', 'shornur_agra'];
      for (const route of routes) {
        const testRef = ref(db, `${getBookingsPath(route)}/${bookingId}`);
        const testSnapshot = await get(testRef);
        if (testSnapshot.exists()) {
          bookingRef = testRef;
          booking = testSnapshot.val();
          routeId = route;
          break;
        }
      }
    }
    
    if (!booking) {
      throw new Error('Booking not found');
    }
    
    const bogieRef = ref(db, getBogiePath(routeId, booking.bogieId));
    
    return new Promise((resolve, reject) => {
      runTransaction(bogieRef, (currentData) => {
        if (!currentData) {
          throw new Error('Bogie not found');
        }
        
        const seatIndex = currentData.seats.findIndex(seat => seat.id === booking.seatId);
        
        if (seatIndex !== -1) {
          currentData.seats[seatIndex] = {
            ...currentData.seats[seatIndex],
            status: SEAT_STATUS.AVAILABLE,
            bookedBy: null,
            bookedAt: null
          };
          
          currentData.bookedSeats = Math.max(0, (currentData.bookedSeats || 0) - 1);
          currentData.updatedAt = Date.now();
        }
        
        return currentData;
      }).then(async (result) => {
        if (result.committed) {
          await remove(bookingRef);
          resolve(booking);
        } else {
          reject(new Error('Transaction failed'));
        }
      }).catch(reject);
    });
  } catch (error) {
    console.error('Error canceling booking:', error);
    throw error;
  }
};

// Toggle seat availability (admin function)
export const toggleSeatAvailability = async (bogieId, seatId, currentStatus, routeId = null) => {
  try {
    // Determine route if not provided
    if (!routeId) {
      routeId = getRouteFromBogieId(bogieId);
    }
    
    const bogieRef = ref(db, getBogiePath(routeId, bogieId));
    
    return new Promise((resolve, reject) => {
      runTransaction(bogieRef, (currentData) => {
        if (!currentData) {
          throw new Error('Bogie not found');
        }
        
        const seatIndex = currentData.seats.findIndex(seat => seat.id === seatId);
        
        if (seatIndex === -1) {
          throw new Error('Seat not found');
        }
        
        const seat = currentData.seats[seatIndex];
        
        if (seat.status === SEAT_STATUS.BOOKED) {
          throw new Error('Cannot change status of booked seat');
        }
        
        // Cycle through: Available → Reserved → Unavailable → Available
        let newStatus;
        switch (currentStatus) {
          case SEAT_STATUS.AVAILABLE:
            newStatus = SEAT_STATUS.RESERVED;
            break;
          case SEAT_STATUS.RESERVED:
            newStatus = SEAT_STATUS.UNAVAILABLE;
            break;
          case SEAT_STATUS.UNAVAILABLE:
            newStatus = SEAT_STATUS.AVAILABLE;
            break;
          default:
            newStatus = SEAT_STATUS.AVAILABLE;
        }
        
        currentData.seats[seatIndex] = {
          ...seat,
          status: newStatus,
          reservedAt: newStatus === SEAT_STATUS.RESERVED ? Date.now() : null,
          unavailableAt: newStatus === SEAT_STATUS.UNAVAILABLE ? Date.now() : null
        };
        
        const reservedCount = currentData.seats.filter(s => s.status === SEAT_STATUS.RESERVED).length;
        currentData.reservedSeats = reservedCount;
        currentData.updatedAt = Date.now();
        
        return currentData;
      }).then((result) => {
        if (result.committed) {
          const updatedSeat = result.snapshot.val().seats.find(s => s.id === seatId);
          resolve(updatedSeat);
        } else {
          reject(new Error('Transaction failed'));
        }
      }).catch(reject);
    });
  } catch (error) {
    console.error('Error toggling seat availability:', error);
    throw error;
  }
};

// Reserve/unreserve seat (admin function)
export const toggleSeatReservation = async (bogieId, seatId, isReserved, routeId = null) => {
  // Check if user is authenticated as admin
  const isAdminAuthenticated = localStorage.getItem('adminAuthenticated') === 'true';
  if (!isAdminAuthenticated) {
    throw new Error('Unauthorized: Admin access required to reserve seats');
  }
  
  try {
    // Determine route if not provided
    if (!routeId) {
      routeId = getRouteFromBogieId(bogieId);
    }
    
    const bogieRef = ref(db, getBogiePath(routeId, bogieId));
    
    return new Promise((resolve, reject) => {
      runTransaction(bogieRef, (currentData) => {
        if (!currentData) {
          throw new Error('Bogie not found');
        }
        
        const seatIndex = currentData.seats.findIndex(seat => seat.id === seatId);
        
        if (seatIndex === -1) {
          throw new Error('Seat not found');
        }
        
        const seat = currentData.seats[seatIndex];
        
        if (isReserved) {
          if (seat.status === SEAT_STATUS.BOOKED) {
            throw new Error('Cannot reserve a booked seat');
          }
          currentData.seats[seatIndex] = {
            ...seat,
            status: SEAT_STATUS.RESERVED,
            reservedAt: Date.now()
          };
        } else {
          currentData.seats[seatIndex] = {
            ...seat,
            status: SEAT_STATUS.AVAILABLE,
            reservedAt: null
          };
        }
        
        const reservedCount = currentData.seats.filter(s => s.status === SEAT_STATUS.RESERVED).length;
        currentData.reservedSeats = reservedCount;
        currentData.updatedAt = Date.now();
        
        return currentData;
      }).then((result) => {
        if (result.committed) {
          const updatedSeat = result.snapshot.val().seats.find(s => s.id === seatId);
          resolve(updatedSeat);
        } else {
          reject(new Error('Transaction failed'));
        }
      }).catch(reject);
    });
  } catch (error) {
    console.error('Error toggling seat reservation:', error);
    throw error;
  }
};

// Get all bookings for admin (from both routes)
export const getAllBookings = async (routeId = null) => {
  try {
    if (routeId) {
      // Get bookings for specific route
      const bookingsRef = ref(db, getBookingsPath(routeId));
      const snapshot = await get(bookingsRef);
      
      if (!snapshot.exists()) {
        return [];
      }
      
      const bookings = snapshot.val();
      return Object.values(bookings).sort((a, b) => b.bookedAt - a.bookedAt);
    } else {
      // Get bookings from both routes
      const allBookings = [];
      const routes = ['delhi_shornur', 'shornur_agra'];
      
      for (const route of routes) {
        const bookingsRef = ref(db, getBookingsPath(route));
        const snapshot = await get(bookingsRef);
        
        if (snapshot.exists()) {
          const bookings = snapshot.val();
          const bookingsWithRoute = Object.values(bookings).map(booking => ({
            ...booking,
            routeId: route
          }));
          allBookings.push(...bookingsWithRoute);
        }
      }
      
      return allBookings.sort((a, b) => b.bookedAt - a.bookedAt);
    }
  } catch (error) {
    console.error('Error getting all bookings:', error);
    throw error;
  }
};

// Subscribe to all bookings for admin (from both routes)
export const subscribeToAllBookings = (callback, routeId = null) => {
  console.log('Subscribing to bookings, routeId:', routeId);
  
  if (routeId) {
    // Subscribe to specific route
    const bookingsPath = getBookingsPath(routeId);
    console.log(`Subscribing to bookings at path: ${bookingsPath}`);
    const bookingsRef = ref(db, bookingsPath);
    
    const unsubscribe = onValue(bookingsRef, (snapshot) => {
      console.log(`Bookings snapshot exists for ${routeId}:`, snapshot.exists());
      if (snapshot.exists()) {
        const bookings = snapshot.val();
        const bookingsList = Object.values(bookings).sort((a, b) => b.bookedAt - a.bookedAt);
        console.log(`Found ${bookingsList.length} bookings for ${routeId}`);
        callback(bookingsList);
      } else {
        console.log(`No bookings found for ${routeId}`);
        callback([]);
      }
    }, (error) => {
      console.error(`Error subscribing to ${routeId} bookings:`, error);
    });

    return () => off(bookingsRef, 'value', unsubscribe);
  } else {
    // Subscribe to both routes
    const unsubscribers = [];
    const allBookings = { delhi_shornur: [], shornur_agra: [] };
    
    const updateCallback = () => {
      const combined = [...allBookings.delhi_shornur, ...allBookings.shornur_agra]
        .sort((a, b) => b.bookedAt - a.bookedAt);
      console.log(`Total combined bookings: ${combined.length}`);
      callback(combined);
    };
    
    // Subscribe to return route bookings
    const returnPath = getBookingsPath('delhi_shornur');
    console.log(`Subscribing to return bookings at: ${returnPath}`);
    const returnRef = ref(db, returnPath);
    const returnUnsubscribe = onValue(returnRef, (snapshot) => {
      console.log('Return bookings snapshot exists:', snapshot.exists());
      if (snapshot.exists()) {
        const bookings = snapshot.val();
        allBookings.delhi_shornur = Object.values(bookings).map(booking => ({
          ...booking,
          routeId: 'delhi_shornur'
        }));
        console.log(`Return bookings: ${allBookings.delhi_shornur.length}`);
      } else {
        allBookings.delhi_shornur = [];
        console.log('No return bookings found');
      }
      updateCallback();
    });
    unsubscribers.push(() => off(returnRef, 'value', returnUnsubscribe));
    
    // Subscribe to onward route bookings
    const onwardPath = getBookingsPath('shornur_agra');
    console.log(`Subscribing to onward bookings at: ${onwardPath}`);
    const onwardRef = ref(db, onwardPath);
    const onwardUnsubscribe = onValue(onwardRef, (snapshot) => {
      console.log('Onward bookings snapshot exists:', snapshot.exists());
      if (snapshot.exists()) {
        const bookings = snapshot.val();
        allBookings.shornur_agra = Object.values(bookings).map(booking => ({
          ...booking,
          routeId: 'shornur_agra'
        }));
        console.log(`Onward bookings: ${allBookings.shornur_agra.length}`);
      } else {
        allBookings.shornur_agra = [];
        console.log('No onward bookings found');
      }
      updateCallback();
    });
    unsubscribers.push(() => off(onwardRef, 'value', onwardUnsubscribe));
    
    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }
};
