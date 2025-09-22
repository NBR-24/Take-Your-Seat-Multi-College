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

// Initialize bogie data if it doesn't exist
export const initializeBogieData = async (bogieId) => {
  try {
    const bogieRef = ref(db, `bogies/${bogieId}`);
    const seats = generateSleeperSeatLayout(); // Use sleeper layout
    
    const bogieData = {
      id: bogieId,
      name: bogieId.toUpperCase(),
      seats: seats,
      totalSeats: 80, // 80 seats for sleeper coach (10 compartments × 8 seats)
      bookedSeats: 0,
      reservedSeats: 0,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    await set(bogieRef, bogieData);
    return seats;
  } catch (error) {
    console.error('Error initializing bogie data:', error);
    throw error;
  }
};

// Force reset bogie data to new sleeper layout (use this to migrate from old layout)
export const resetBogieToSleeperLayout = async (bogieId) => {
  try {
    const bogieRef = ref(db, `bogies/${bogieId}`);
    
    // Delete existing data first
    await set(bogieRef, null);
    
    // Initialize with new sleeper layout
    const seats = generateSleeperSeatLayout();
    
    console.log(`Generated ${seats.length} seats for ${bogieId}`);
    console.log('First few seats:', seats.slice(0, 8).map(s => `${s.number}:${s.type}`));
    
    const bogieData = {
      id: bogieId,
      name: bogieId.toUpperCase(),
      seats: seats,
      totalSeats: 80,
      bookedSeats: 0,
      reservedSeats: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      layoutVersion: 'sleeper_v3' // Updated version marker
    };
    
    await set(bogieRef, bogieData);
    console.log(`Reset ${bogieId} to new sleeper layout with 80 seats`);
    return seats;
  } catch (error) {
    console.error('Error resetting bogie data:', error);
    throw error;
  }
};

// Force reset all bogies to new layout (for debugging)
export const resetAllBogiesToSleeperLayout = async () => {
  const bogies = ['s3', 's5', 's7'];
  for (const bogieId of bogies) {
    await resetBogieToSleeperLayout(bogieId);
  }
  console.log('All bogies reset to new 80-seat sleeper layout');
};

// Get bogie data with real-time updates
export const subscribeToBogieData = (bogieId, callback) => {
  const bogieRef = ref(db, `bogies/${bogieId}`);
  
  const unsubscribe = onValue(bogieRef, async (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      
      // Check if we need to migrate to new sleeper layout with correct berth pattern
      if (!data.layoutVersion || data.layoutVersion !== 'sleeper_v3') {
        console.log(`Migrating ${bogieId} from old layout to new sleeper layout...`);
        const seats = await resetBogieToSleeperLayout(bogieId);
        callback({
          id: bogieId,
          name: bogieId.toUpperCase(),
          seats: seats,
          totalSeats: 80,
          bookedSeats: 0,
          reservedSeats: 0,
          layoutVersion: 'sleeper_v3'
        });
      } else {
        callback(data);
      }
    } else {
      // Initialize bogie if it doesn't exist
      const seats = await initializeBogieData(bogieId);
      callback({
        id: bogieId,
        name: bogieId.toUpperCase(),
        seats: seats,
        totalSeats: 80, // 80 seats for sleeper coach
        bookedSeats: 0,
        reservedSeats: 0
      });
    }
  }, (error) => {
    console.error('Error subscribing to bogie data:', error);
  });

  return () => off(bogieRef, 'value', unsubscribe);
};

// Check if email/phone is already used
export const checkUserExists = async (email, phone) => {
  try {
    const bookingsRef = ref(db, 'bookings');
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
export const bookSeat = async (bogieId, seatId, userDetails) => {
  try {
    // Check if user already has a booking BEFORE the transaction
    const userCheck = await checkUserExists(userDetails.email, userDetails.phone);
    if (userCheck.emailExists || userCheck.phoneExists) {
      throw new Error('User already has a booking');
    }

    const bogieRef = ref(db, `bogies/${bogieId}`);
    
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
        
        console.log(`Booking seat ${seatId} for ${userDetails.name} - Status: ${SEAT_STATUS.BOOKED}`);
        
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
            bookedAt: Date.now(),
            status: 'confirmed'
          };
          
          const bookingsRef = ref(db, 'bookings');
          const newBookingRef = push(bookingsRef);
          await set(newBookingRef, { ...bookingData, id: newBookingRef.key });
          
          console.log(`Booking completed successfully for seat ${seatId}`);
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
export const cancelBooking = async (bookingId) => {
  // Check if user is authenticated as admin
  const isAdminAuthenticated = localStorage.getItem('adminAuthenticated') === 'true';
  if (!isAdminAuthenticated) {
    throw new Error('Unauthorized: Admin access required to cancel bookings');
  }
  
  try {
    const bookingRef = ref(db, `bookings/${bookingId}`);
    const bookingSnapshot = await get(bookingRef);
    
    if (!bookingSnapshot.exists()) {
      throw new Error('Booking not found');
    }
    
    const booking = bookingSnapshot.val();
    const bogieRef = ref(db, `bogies/${booking.bogieId}`);
    
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
export const toggleSeatAvailability = async (bogieId, seatId, currentStatus) => {
  try {
    const bogieRef = ref(db, `bogies/${bogieId}`);
    
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
export const toggleSeatReservation = async (bogieId, seatId, isReserved) => {
  // Check if user is authenticated as admin
  const isAdminAuthenticated = localStorage.getItem('adminAuthenticated') === 'true';
  if (!isAdminAuthenticated) {
    throw new Error('Unauthorized: Admin access required to reserve seats');
  }
  
  try {
    const bogieRef = ref(db, `bogies/${bogieId}`);
    
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

// Get all bookings for admin
export const getAllBookings = async () => {
  try {
    const bookingsRef = ref(db, 'bookings');
    const snapshot = await get(bookingsRef);
    
    if (!snapshot.exists()) {
      return [];
    }
    
    const bookings = snapshot.val();
    return Object.values(bookings).sort((a, b) => b.bookedAt - a.bookedAt);
  } catch (error) {
    console.error('Error getting all bookings:', error);
    throw error;
  }
};

// Subscribe to all bookings for admin
export const subscribeToAllBookings = (callback) => {
  const bookingsRef = ref(db, 'bookings');
  
  const unsubscribe = onValue(bookingsRef, (snapshot) => {
    if (snapshot.exists()) {
      const bookings = snapshot.val();
      const bookingsList = Object.values(bookings).sort((a, b) => b.bookedAt - a.bookedAt);
      callback(bookingsList);
    } else {
      callback([]);
    }
  }, (error) => {
    console.error('Error subscribing to bookings:', error);
  });

  return () => off(bookingsRef, 'value', unsubscribe);
};
