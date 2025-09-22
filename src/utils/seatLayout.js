// Seat types
export const SEAT_TYPES = {
  LOWER: 'LOWER',
  MIDDLE: 'MIDDLE', 
  UPPER: 'UPPER',
  SIDE_LOWER: 'SIDE_LOWER',
  SIDE_UPPER: 'SIDE_UPPER'
};

// Seat status
export const SEAT_STATUS = {
  AVAILABLE: 'available',
  BOOKED: 'booked',
  RESERVED: 'reserved',
  UNAVAILABLE: 'unavailable',
  SELECTED: 'selected'
};

// Generate seat layout for a bogie (80 seats total)
export const generateSeatLayout = () => {
  const seats = [];
  
  // Each row has 6 seats: 3 on left (Lower, Middle, Upper) + 1 aisle + 2 on right (Side Lower, Side Upper)
  // 80 seats total = approximately 16 rows with some variation
  
  for (let row = 1; row <= 20; row++) {
    // Left side - 3 seats per row (Lower, Middle, Upper)
    const seatNumber = (row - 1) * 4;
    
    if (seatNumber < 80) {
      // Lower berth
      seats.push({
        id: `${seatNumber + 1}`,
        number: seatNumber + 1,
        type: SEAT_TYPES.LOWER,
        row: row,
        position: 'left',
        status: SEAT_STATUS.AVAILABLE
      });
    }
    
    if (seatNumber + 1 < 80) {
      // Middle berth
      seats.push({
        id: `${seatNumber + 2}`,
        number: seatNumber + 2,
        type: SEAT_TYPES.MIDDLE,
        row: row,
        position: 'left',
        status: SEAT_STATUS.AVAILABLE
      });
    }
    
    if (seatNumber + 2 < 80) {
      // Upper berth
      seats.push({
        id: `${seatNumber + 3}`,
        number: seatNumber + 3,
        type: SEAT_TYPES.UPPER,
        row: row,
        position: 'left',
        status: SEAT_STATUS.AVAILABLE
      });
    }
    
    if (seatNumber + 3 < 80) {
      // Side berth (alternating between lower and upper)
      seats.push({
        id: `${seatNumber + 4}`,
        number: seatNumber + 4,
        type: row % 2 === 1 ? SEAT_TYPES.SIDE_LOWER : SEAT_TYPES.SIDE_UPPER,
        row: row,
        position: 'right',
        status: SEAT_STATUS.AVAILABLE
      });
    }
  }
  
  return seats.slice(0, 80); // Ensure exactly 80 seats
};

// Generate sleeper coach seat layout (80 seats total in compartments)
export const generateSleeperSeatLayout = () => {
  const seats = [];
  
  // Sleeper coach has compartments with 8 seats each
  // 10 compartments × 8 seats = 80 seats total
  for (let compartment = 0; compartment < 10; compartment++) {
    const baseNumber = compartment * 8 + 1;
    
    // Each compartment has the correct berth pattern:
    // 1: L (Lower), 2: M (Middle), 3: U (Upper)
    // 4: L (Lower), 5: M (Middle), 6: U (Upper)
    // 7: SL (Side Lower), 8: SU (Side Upper)
    
    // Seat 1: Lower
    seats.push({
      id: `${baseNumber}`,
      number: baseNumber,
      type: SEAT_TYPES.LOWER,
      compartment: compartment + 1,
      position: 'left',
      status: SEAT_STATUS.AVAILABLE
    });
    
    // Seat 2: Middle
    seats.push({
      id: `${baseNumber + 1}`,
      number: baseNumber + 1,
      type: SEAT_TYPES.MIDDLE,
      compartment: compartment + 1,
      position: 'left',
      status: SEAT_STATUS.AVAILABLE
    });
    
    // Seat 3: Upper
    seats.push({
      id: `${baseNumber + 2}`,
      number: baseNumber + 2,
      type: SEAT_TYPES.UPPER,
      compartment: compartment + 1,
      position: 'left',
      status: SEAT_STATUS.AVAILABLE
    });
    
    // Seat 4: Lower
    seats.push({
      id: `${baseNumber + 3}`,
      number: baseNumber + 3,
      type: SEAT_TYPES.LOWER,
      compartment: compartment + 1,
      position: 'left',
      status: SEAT_STATUS.AVAILABLE
    });
    
    // Seat 5: Middle
    seats.push({
      id: `${baseNumber + 4}`,
      number: baseNumber + 4,
      type: SEAT_TYPES.MIDDLE,
      compartment: compartment + 1,
      position: 'left',
      status: SEAT_STATUS.AVAILABLE
    });
    
    // Seat 6: Upper
    seats.push({
      id: `${baseNumber + 5}`,
      number: baseNumber + 5,
      type: SEAT_TYPES.UPPER,
      compartment: compartment + 1,
      position: 'left',
      status: SEAT_STATUS.AVAILABLE
    });
    
    // Seat 7: Side Lower
    seats.push({
      id: `${baseNumber + 6}`,
      number: baseNumber + 6,
      type: SEAT_TYPES.SIDE_LOWER,
      compartment: compartment + 1,
      position: 'right',
      status: SEAT_STATUS.AVAILABLE
    });
    
    // Seat 8: Side Upper
    seats.push({
      id: `${baseNumber + 7}`,
      number: baseNumber + 7,
      type: SEAT_TYPES.SIDE_UPPER,
      compartment: compartment + 1,
      position: 'right',
      status: SEAT_STATUS.AVAILABLE
    });
  }
  
  return seats;
};

// Get seat color based on status
export const getSeatColor = (status) => {
  switch (status) {
    case SEAT_STATUS.AVAILABLE:
      return 'seat-available';
    case SEAT_STATUS.BOOKED:
      return 'seat-booked';
    case SEAT_STATUS.RESERVED:
      return 'seat-reserved';
    case SEAT_STATUS.SELECTED:
      return 'seat-selected';
    default:
      return 'seat-available';
  }
};

// Get seat type display name
export const getSeatTypeDisplay = (type) => {
  switch (type) {
    case SEAT_TYPES.LOWER:
      return 'L';
    case SEAT_TYPES.MIDDLE:
      return 'M';
    case SEAT_TYPES.UPPER:
      return 'U';
    case SEAT_TYPES.SIDE_LOWER:
      return 'SL';
    case SEAT_TYPES.SIDE_UPPER:
      return 'SU';
    default:
      return '';
  }
};
