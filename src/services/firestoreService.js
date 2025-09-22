import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  onSnapshot,
  runTransaction,
  orderBy
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { generateSeatLayout, SEAT_STATUS } from '../utils/seatLayout';

// Collection names
const COLLECTIONS = {
  BOOKINGS: 'bookings',
  BOGIES: 'bogies',
  ADMIN_SETTINGS: 'adminSettings'
};

// Initialize bogie data if it doesn't exist
export const initializeBogieData = async (bogieId) => {
  try {
    const bogieRef = doc(db, COLLECTIONS.BOGIES, bogieId);
    const seats = generateSeatLayout();
    
    await setDoc(bogieRef, {
      id: bogieId,
      name: bogieId.toUpperCase(),
      seats: seats,
      totalSeats: 80,
      bookedSeats: 0,
      reservedSeats: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    return seats;
  } catch (error) {
    console.error('Error initializing bogie data:', error);
    throw error;
  }
};

// Get bogie data with real-time updates
export const subscribeToBogieData = (bogieId, callback) => {
  const bogieRef = doc(db, COLLECTIONS.BOGIES, bogieId);
  
  return onSnapshot(bogieRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data());
    } else {
      // Initialize bogie if it doesn't exist
      initializeBogieData(bogieId).then(callback);
    }
  }, (error) => {
    console.error('Error subscribing to bogie data:', error);
  });
};

// Check if email/phone is already used
export const checkUserExists = async (email, phone) => {
  try {
    const bookingsRef = collection(db, COLLECTIONS.BOOKINGS);
    const emailQuery = query(bookingsRef, where('email', '==', email));
    const phoneQuery = query(bookingsRef, where('phone', '==', phone));
    
    const [emailSnapshot, phoneSnapshot] = await Promise.all([
      getDocs(emailQuery),
      getDocs(phoneQuery)
    ]);
    
    return {
      emailExists: !emailSnapshot.empty,
      phoneExists: !phoneSnapshot.empty,
      existingBooking: emailSnapshot.empty ? 
        (phoneSnapshot.empty ? null : phoneSnapshot.docs[0].data()) :
        emailSnapshot.docs[0].data()
    };
  } catch (error) {
    console.error('Error checking user existence:', error);
    throw error;
  }
};

// Book a seat with transaction for atomicity
export const bookSeat = async (bogieId, seatId, userDetails) => {
  try {
    return await runTransaction(db, async (transaction) => {
      const bogieRef = doc(db, COLLECTIONS.BOGIES, bogieId);
      const bogieDoc = await transaction.get(bogieRef);
      
      if (!bogieDoc.exists()) {
        throw new Error('Bogie not found');
      }
      
      const bogieData = bogieDoc.data();
      const seatIndex = bogieData.seats.findIndex(seat => seat.id === seatId);
      
      if (seatIndex === -1) {
        throw new Error('Seat not found');
      }
      
      const seat = bogieData.seats[seatIndex];
      
      if (seat.status !== SEAT_STATUS.AVAILABLE) {
        throw new Error('Seat is not available');
      }
      
      // Check if user already has a booking
      const userCheck = await checkUserExists(userDetails.email, userDetails.phone);
      if (userCheck.emailExists || userCheck.phoneExists) {
        throw new Error('User already has a booking');
      }
      
      // Create booking document
      const bookingId = `${bogieId}_${seatId}_${Date.now()}`;
      const bookingRef = doc(db, COLLECTIONS.BOOKINGS, bookingId);
      
      const bookingData = {
        id: bookingId,
        bogieId,
        seatId,
        seatNumber: seat.number,
        seatType: seat.type,
        userName: userDetails.name,
        email: userDetails.email,
        phone: userDetails.phone,
        bookedAt: new Date(),
        status: 'confirmed'
      };
      
      // Update seat status
      const updatedSeats = [...bogieData.seats];
      updatedSeats[seatIndex] = {
        ...seat,
        status: SEAT_STATUS.BOOKED,
        bookedBy: userDetails.name,
        bookedAt: new Date()
      };
      
      // Update bogie document
      transaction.update(bogieRef, {
        seats: updatedSeats,
        bookedSeats: bogieData.bookedSeats + 1,
        updatedAt: new Date()
      });
      
      // Create booking document
      transaction.set(bookingRef, bookingData);
      
      return bookingData;
    });
  } catch (error) {
    console.error('Error booking seat:', error);
    throw error;
  }
};

// Cancel a booking
export const cancelBooking = async (bookingId) => {
  try {
    return await runTransaction(db, async (transaction) => {
      const bookingRef = doc(db, COLLECTIONS.BOOKINGS, bookingId);
      const bookingDoc = await transaction.get(bookingRef);
      
      if (!bookingDoc.exists()) {
        throw new Error('Booking not found');
      }
      
      const booking = bookingDoc.data();
      const bogieRef = doc(db, COLLECTIONS.BOGIES, booking.bogieId);
      const bogieDoc = await transaction.get(bogieRef);
      
      if (!bogieDoc.exists()) {
        throw new Error('Bogie not found');
      }
      
      const bogieData = bogieDoc.data();
      const seatIndex = bogieData.seats.findIndex(seat => seat.id === booking.seatId);
      
      if (seatIndex !== -1) {
        const updatedSeats = [...bogieData.seats];
        updatedSeats[seatIndex] = {
          ...updatedSeats[seatIndex],
          status: SEAT_STATUS.AVAILABLE,
          bookedBy: null,
          bookedAt: null
        };
        
        transaction.update(bogieRef, {
          seats: updatedSeats,
          bookedSeats: Math.max(0, bogieData.bookedSeats - 1),
          updatedAt: new Date()
        });
      }
      
      transaction.delete(bookingRef);
      
      return booking;
    });
  } catch (error) {
    console.error('Error canceling booking:', error);
    throw error;
  }
};

// Reserve/unreserve seat (admin function)
export const toggleSeatReservation = async (bogieId, seatId, isReserved) => {
  try {
    return await runTransaction(db, async (transaction) => {
      const bogieRef = doc(db, COLLECTIONS.BOGIES, bogieId);
      const bogieDoc = await transaction.get(bogieRef);
      
      if (!bogieDoc.exists()) {
        throw new Error('Bogie not found');
      }
      
      const bogieData = bogieDoc.data();
      const seatIndex = bogieData.seats.findIndex(seat => seat.id === seatId);
      
      if (seatIndex === -1) {
        throw new Error('Seat not found');
      }
      
      const seat = bogieData.seats[seatIndex];
      const updatedSeats = [...bogieData.seats];
      
      if (isReserved) {
        if (seat.status === SEAT_STATUS.BOOKED) {
          throw new Error('Cannot reserve a booked seat');
        }
        updatedSeats[seatIndex] = {
          ...seat,
          status: SEAT_STATUS.RESERVED,
          reservedAt: new Date()
        };
      } else {
        updatedSeats[seatIndex] = {
          ...seat,
          status: SEAT_STATUS.AVAILABLE,
          reservedAt: null
        };
      }
      
      const reservedCount = updatedSeats.filter(s => s.status === SEAT_STATUS.RESERVED).length;
      
      transaction.update(bogieRef, {
        seats: updatedSeats,
        reservedSeats: reservedCount,
        updatedAt: new Date()
      });
      
      return updatedSeats[seatIndex];
    });
  } catch (error) {
    console.error('Error toggling seat reservation:', error);
    throw error;
  }
};

// Get all bookings for admin
export const getAllBookings = async () => {
  try {
    const bookingsRef = collection(db, COLLECTIONS.BOOKINGS);
    const q = query(bookingsRef, orderBy('bookedAt', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => doc.data());
  } catch (error) {
    console.error('Error getting all bookings:', error);
    throw error;
  }
};

// Subscribe to all bookings for admin
export const subscribeToAllBookings = (callback) => {
  const bookingsRef = collection(db, COLLECTIONS.BOOKINGS);
  const q = query(bookingsRef, orderBy('bookedAt', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const bookings = snapshot.docs.map(doc => doc.data());
    callback(bookings);
  }, (error) => {
    console.error('Error subscribing to bookings:', error);
  });
};
