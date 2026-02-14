import {
  ref,
  set,
  get,
  push,
  remove,
  onValue,
  runTransaction
} from 'firebase/database';
import { db } from '../config/firebase';
import { generateSleeperSeatLayout, SEAT_STATUS } from '../utils/seatLayout';

// Helper functions for college-based database paths
const getCollegeBogiePath = (collegeId, routeId, bogieId) => {
  return `colleges/${collegeId}/routes/${routeId}/bogies/${bogieId}`;
};

const getCollegeBookingsPath = (collegeId, routeId) => {
  return `colleges/${collegeId}/routes/${routeId}/bookings`;
};

// Subscribe to bogie data for a specific college
export const subscribeToCollegeBogieData = (collegeId, routeId, bogieId, callback) => {
  const bogiePath = getCollegeBogiePath(collegeId, routeId, bogieId);
  console.log(`Subscribing to college bogie at path: ${bogiePath}`);
  const bogieRef = ref(db, bogiePath);

  const unsubscribe = onValue(bogieRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      callback(data);
    } else {
      console.log(`Bogie ${bogieId} not found for college ${collegeId}, route ${routeId}`);
      callback(null);
    }
  }, (error) => {
    console.error(`Error subscribing to bogie ${bogieId}:`, error);
  });

  return unsubscribe;
};

// Check if user already has a booking in this college's route
export const checkCollegeUserExists = async (collegeId, routeId, email, phone) => {
  try {
    const bookingsRef = ref(db, getCollegeBookingsPath(collegeId, routeId));
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

// Book a seat in a college's route
export const bookCollegeSeat = async (collegeId, routeId, bogieId, seatId, userDetails) => {
  try {
    // Check if user already has a booking
    const userCheck = await checkCollegeUserExists(collegeId, routeId, userDetails.email, userDetails.phone);
    if (userCheck.emailExists || userCheck.phoneExists) {
      throw new Error('User already has a booking for this route');
    }

    const bogieRef = ref(db, getCollegeBogiePath(collegeId, routeId, bogieId));

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
            collegeId: collegeId,
            bookedAt: Date.now(),
            status: 'confirmed'
          };

          const bookingsRef = ref(db, getCollegeBookingsPath(collegeId, routeId));
          const newBookingRef = push(bookingsRef);
          await set(newBookingRef, { ...bookingData, id: newBookingRef.key });

          console.log(`Booking completed for college ${collegeId}, route ${routeId}`);
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
export const cancelCollegeBooking = async (collegeId, routeId, bookingId) => {
  const isAdminAuthenticated = (() => {
    try {
      const session = JSON.parse(localStorage.getItem(`college_${collegeId}_admin`));
      return session?.authenticated && (Date.now() - session.timestamp < 24 * 60 * 60 * 1000);
    } catch { return false; }
  })();
  if (!isAdminAuthenticated) {
    throw new Error('Unauthorized: Admin access required');
  }

  try {
    const bookingRef = ref(db, `${getCollegeBookingsPath(collegeId, routeId)}/${bookingId}`);
    const bookingSnapshot = await get(bookingRef);

    if (!bookingSnapshot.exists()) {
      throw new Error('Booking not found');
    }

    const booking = bookingSnapshot.val();
    const bogieRef = ref(db, getCollegeBogiePath(collegeId, routeId, booking.bogieId));

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
export const toggleCollegeSeatAvailability = async (collegeId, routeId, bogieId, seatId, currentStatus) => {
  const isAdminAuthenticated = (() => {
    try {
      const session = JSON.parse(localStorage.getItem(`college_${collegeId}_admin`));
      return session?.authenticated && (Date.now() - session.timestamp < 24 * 60 * 60 * 1000);
    } catch { return false; }
  })();
  if (!isAdminAuthenticated) {
    throw new Error('Unauthorized: Admin access required');
  }

  try {
    const bogieRef = ref(db, getCollegeBogiePath(collegeId, routeId, bogieId));

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

// Get all bookings for a college's route
export const getCollegeBookings = async (collegeId, routeId = null) => {
  try {
    if (routeId) {
      const bookingsRef = ref(db, getCollegeBookingsPath(collegeId, routeId));
      const snapshot = await get(bookingsRef);

      if (!snapshot.exists()) {
        return [];
      }

      const bookings = snapshot.val();
      return Object.values(bookings).sort((a, b) => b.bookedAt - a.bookedAt);
    } else {
      // Get bookings from all routes for this college
      const collegeRef = ref(db, `colleges/${collegeId}`);
      const collegeSnapshot = await get(collegeRef);

      if (!collegeSnapshot.exists()) {
        return [];
      }

      const college = collegeSnapshot.val();
      const routes = college.settings?.routes || [];
      const allBookings = [];

      for (const route of routes) {
        const bookingsRef = ref(db, getCollegeBookingsPath(collegeId, route.id));
        const snapshot = await get(bookingsRef);

        if (snapshot.exists()) {
          const bookings = snapshot.val();
          const bookingsWithRoute = Object.values(bookings).map(booking => ({
            ...booking,
            routeId: route.id
          }));
          allBookings.push(...bookingsWithRoute);
        }
      }

      return allBookings.sort((a, b) => b.bookedAt - a.bookedAt);
    }
  } catch (error) {
    console.error('Error getting bookings:', error);
    throw error;
  }
};

// Subscribe to all bookings for a college
export const subscribeToCollegeBookings = (collegeId, routeId, callback) => {
  const bookingsPath = getCollegeBookingsPath(collegeId, routeId);
  const bookingsRef = ref(db, bookingsPath);

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

  return unsubscribe;
};
