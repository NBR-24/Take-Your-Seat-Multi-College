// Bogie Type Constants and Configuration

export const BOGIE_TYPES = {
    SLEEPER: 'sleeper',
    AC_2_TIER: 'ac2tier'
};

export const BOGIE_TYPE_CONFIG = {
    [BOGIE_TYPES.SLEEPER]: {
        name: 'Sleeper',
        shortName: 'SL',
        seatCount: 80,
        description: 'Standard sleeper coach with 80 seats',
        color: 'green'
    },
    [BOGIE_TYPES.AC_2_TIER]: {
        name: 'AC 2-Tier',
        shortName: 'AC 2T',
        seatCount: 48,
        description: 'AC 2-Tier coach with 48 seats (no middle berths)',
        color: 'blue'
    }
};

/**
 * Get configuration for a bogie type
 * @param {string} type - Bogie type (sleeper or ac2tier)
 * @returns {object} Configuration object
 */
export const getBogieConfig = (type) => {
    return BOGIE_TYPE_CONFIG[type] || BOGIE_TYPE_CONFIG[BOGIE_TYPES.SLEEPER];
};

/**
 * Get display name for a bogie type
 * @param {string} type - Bogie type
 * @param {boolean} short - Return short name if true
 * @returns {string} Display name
 */
export const getBogieTypeDisplay = (type, short = false) => {
    const config = getBogieConfig(type);
    return short ? config.shortName : config.name;
};

/**
 * Get seat count for a bogie type
 * @param {string} type - Bogie type
 * @returns {number} Number of seats
 */
export const getBogieSeatCount = (type) => {
    return getBogieConfig(type).seatCount;
};

/**
 * Normalize bogie data - converts old string format to new object format
 * @param {string|object} bogie - Bogie data (string or object)
 * @returns {object} Normalized bogie object
 */
export const normalizeBogieData = (bogie) => {
    // If it's already an object with id and type, return as is
    if (typeof bogie === 'object' && bogie.id && bogie.type) {
        return bogie;
    }

    // If it's a string, convert to object with default sleeper type
    if (typeof bogie === 'string') {
        return {
            id: bogie,
            type: BOGIE_TYPES.SLEEPER,
            name: bogie.toUpperCase()
        };
    }

    // Fallback
    return {
        id: bogie.id || 'unknown',
        type: bogie.type || BOGIE_TYPES.SLEEPER,
        name: bogie.name || (bogie.id || 'unknown').toUpperCase()
    };
};
