// AC 2-Tier Seat Layout Generator
// AC 2-Tier has NO middle berths - only LOWER, UPPER, SIDE LOWER, SIDE UPPER

export const AC2_SEAT_TYPES = {
    LOWER: 'LOWER',
    UPPER: 'UPPER',
    SIDE_LOWER: 'SIDE_LOWER',
    SIDE_UPPER: 'SIDE_UPPER'
};

export const SEAT_STATUS = {
    AVAILABLE: 'available',
    BOOKED: 'booked',
    RESERVED: 'reserved',
    UNAVAILABLE: 'unavailable',
    SELECTED: 'selected'
};

/**
 * Generate AC 2-Tier seat layout
 * Total: 48 seats (8 compartments × 6 seats each)
 * Each compartment has:
 * - Main berths (left): 2 sets of LOWER + UPPER (4 berths)
 * - Side berths (right): SIDE LOWER + SIDE UPPER (2 berths)
 */
export const generateAC2TierSeatLayout = () => {
    const seats = [];
    const totalCompartments = 8;
    const seatsPerCompartment = 6;

    for (let compartment = 0; compartment < totalCompartments; compartment++) {
        const baseNumber = compartment * seatsPerCompartment + 1;

        // Each compartment follows this pattern:
        // Main berths (left side):
        // 1: LOWER, 2: UPPER
        // 3: LOWER, 4: UPPER
        // Side berths (right side):
        // 5: SIDE LOWER, 6: SIDE UPPER

        // Seat 1: Lower (left, first set)
        seats.push({
            id: `${baseNumber}`,
            number: baseNumber,
            type: AC2_SEAT_TYPES.LOWER,
            compartment: compartment + 1,
            position: 'left',
            set: 1,
            status: SEAT_STATUS.AVAILABLE
        });

        // Seat 2: Upper (left, first set)
        seats.push({
            id: `${baseNumber + 1}`,
            number: baseNumber + 1,
            type: AC2_SEAT_TYPES.UPPER,
            compartment: compartment + 1,
            position: 'left',
            set: 1,
            status: SEAT_STATUS.AVAILABLE
        });

        // Seat 3: Lower (left, second set)
        seats.push({
            id: `${baseNumber + 2}`,
            number: baseNumber + 2,
            type: AC2_SEAT_TYPES.LOWER,
            compartment: compartment + 1,
            position: 'left',
            set: 2,
            status: SEAT_STATUS.AVAILABLE
        });

        // Seat 4: Upper (left, second set)
        seats.push({
            id: `${baseNumber + 3}`,
            number: baseNumber + 3,
            type: AC2_SEAT_TYPES.UPPER,
            compartment: compartment + 1,
            position: 'left',
            set: 2,
            status: SEAT_STATUS.AVAILABLE
        });

        // Seat 5: Side Lower (right)
        seats.push({
            id: `${baseNumber + 4}`,
            number: baseNumber + 4,
            type: AC2_SEAT_TYPES.SIDE_LOWER,
            compartment: compartment + 1,
            position: 'right',
            status: SEAT_STATUS.AVAILABLE
        });

        // Seat 6: Side Upper (right)
        seats.push({
            id: `${baseNumber + 5}`,
            number: baseNumber + 5,
            type: AC2_SEAT_TYPES.SIDE_UPPER,
            compartment: compartment + 1,
            position: 'right',
            status: SEAT_STATUS.AVAILABLE
        });
    }

    return seats;
};

// Get seat type display label
export const getAC2SeatTypeDisplay = (type) => {
    switch (type) {
        case AC2_SEAT_TYPES.LOWER:
            return 'L';
        case AC2_SEAT_TYPES.UPPER:
            return 'U';
        case AC2_SEAT_TYPES.SIDE_LOWER:
            return 'SL';
        case AC2_SEAT_TYPES.SIDE_UPPER:
            return 'SU';
        default:
            return '';
    }
};

// Get full seat type name
export const getAC2SeatTypeName = (type) => {
    switch (type) {
        case AC2_SEAT_TYPES.LOWER:
            return 'Lower Berth';
        case AC2_SEAT_TYPES.UPPER:
            return 'Upper Berth';
        case AC2_SEAT_TYPES.SIDE_LOWER:
            return 'Side Lower';
        case AC2_SEAT_TYPES.SIDE_UPPER:
            return 'Side Upper';
        default:
            return '';
    }
};
