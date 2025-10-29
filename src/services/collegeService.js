import { ref, set, get, push } from 'firebase/database';
import { db } from '../config/firebase';
import { generateSleeperSeatLayout } from '../utils/seatLayout';

// Generate a unique college code (6-character alphanumeric)
export const generateCollegeCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Check if college code already exists
export const checkCollegeCodeExists = async (code) => {
  try {
    const collegeRef = ref(db, `colleges/${code}`);
    const snapshot = await get(collegeRef);
    return snapshot.exists();
  } catch (error) {
    console.error('Error checking college code:', error);
    throw error;
  }
};

// Generate unique college code
export const generateUniqueCollegeCode = async () => {
  let code;
  let exists = true;
  let attempts = 0;
  const maxAttempts = 10;

  while (exists && attempts < maxAttempts) {
    code = generateCollegeCode();
    exists = await checkCollegeCodeExists(code);
    attempts++;
  }

  if (exists) {
    throw new Error('Failed to generate unique college code. Please try again.');
  }

  return code;
};

// Create a new college
export const createCollege = async (collegeData) => {
  try {
    const { name, bogies, seatsPerBogie, routes, adminPassword, logoUrl } = collegeData;
    
    // Generate unique college code
    const collegeCode = await generateUniqueCollegeCode();
    
    // Create college document
    const college = {
      id: collegeCode,
      name,
      logoUrl: logoUrl || null,
      adminPassword, // In production, this should be hashed
      createdAt: Date.now(),
      updatedAt: Date.now(),
      settings: {
        bogies: bogies || [],
        seatsPerBogie: seatsPerBogie || 80,
        routes: routes || []
      }
    };
    
    const collegeRef = ref(db, `colleges/${collegeCode}`);
    await set(collegeRef, college);
    
    // Initialize bogies for each route
    if (routes && routes.length > 0) {
      for (const route of routes) {
        for (const bogieId of bogies) {
          await initializeCollegeBogieData(collegeCode, route.id, bogieId, seatsPerBogie);
        }
      }
    }
    
    console.log(`✅ College created successfully with code: ${collegeCode}`);
    return { collegeCode, college };
  } catch (error) {
    console.error('Error creating college:', error);
    throw error;
  }
};

// Initialize bogie data for a college
export const initializeCollegeBogieData = async (collegeId, routeId, bogieId, seatsPerBogie = 80) => {
  try {
    const bogiePath = `colleges/${collegeId}/routes/${routeId}/bogies/${bogieId}`;
    const bogieRef = ref(db, bogiePath);
    const snapshot = await get(bogieRef);
    
    if (!snapshot.exists()) {
      const seats = generateSleeperSeatLayout(seatsPerBogie);
      const bogieData = {
        id: bogieId,
        name: bogieId.toUpperCase(),
        seats: seats,
        totalSeats: seatsPerBogie,
        bookedSeats: 0,
        reservedSeats: 0,
        layoutVersion: 'sleeper_v3',
        createdAt: Date.now()
      };
      
      await set(bogieRef, bogieData);
      console.log(`✅ Initialized bogie ${bogieId} for college ${collegeId}, route ${routeId}`);
      return seats;
    } else {
      console.log(`Bogie ${bogieId} already exists for college ${collegeId}, route ${routeId}`);
      return snapshot.val().seats;
    }
  } catch (error) {
    console.error(`Error initializing bogie ${bogieId}:`, error);
    throw error;
  }
};

// Get college data by code
export const getCollegeByCode = async (collegeCode) => {
  try {
    const collegeRef = ref(db, `colleges/${collegeCode}`);
    const snapshot = await get(collegeRef);
    
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      throw new Error('College not found');
    }
  } catch (error) {
    console.error('Error getting college:', error);
    throw error;
  }
};

// Update college settings
export const updateCollegeSettings = async (collegeId, settings) => {
  try {
    const settingsRef = ref(db, `colleges/${collegeId}/settings`);
    await set(settingsRef, {
      ...settings,
      updatedAt: Date.now()
    });
    
    console.log(`✅ College settings updated for ${collegeId}`);
    return true;
  } catch (error) {
    console.error('Error updating college settings:', error);
    throw error;
  }
};

// Add a route to college
export const addRouteToCollege = async (collegeId, routeData) => {
  try {
    const college = await getCollegeByCode(collegeId);
    const routes = college.settings.routes || [];
    
    // Check if route already exists
    const routeExists = routes.some(r => r.id === routeData.id);
    if (routeExists) {
      throw new Error('Route already exists');
    }
    
    routes.push(routeData);
    
    await updateCollegeSettings(collegeId, {
      ...college.settings,
      routes
    });
    
    // Initialize bogies for this route
    const bogies = college.settings.bogies || [];
    const seatsPerBogie = college.settings.seatsPerBogie || 80;
    
    for (const bogieId of bogies) {
      await initializeCollegeBogieData(collegeId, routeData.id, bogieId, seatsPerBogie);
    }
    
    console.log(`✅ Route ${routeData.id} added to college ${collegeId}`);
    return true;
  } catch (error) {
    console.error('Error adding route:', error);
    throw error;
  }
};

// Add a bogie to college
export const addBogieToCollege = async (collegeId, bogieId) => {
  try {
    const college = await getCollegeByCode(collegeId);
    const bogies = college.settings.bogies || [];
    
    // Check if bogie already exists
    if (bogies.includes(bogieId)) {
      throw new Error('Bogie already exists');
    }
    
    bogies.push(bogieId);
    
    await updateCollegeSettings(collegeId, {
      ...college.settings,
      bogies
    });
    
    // Initialize this bogie for all routes
    const routes = college.settings.routes || [];
    const seatsPerBogie = college.settings.seatsPerBogie || 80;
    
    for (const route of routes) {
      await initializeCollegeBogieData(collegeId, route.id, bogieId, seatsPerBogie);
    }
    
    console.log(`✅ Bogie ${bogieId} added to college ${collegeId}`);
    return true;
  } catch (error) {
    console.error('Error adding bogie:', error);
    throw error;
  }
};

// Verify admin password
export const verifyCollegeAdmin = async (collegeId, password) => {
  try {
    const college = await getCollegeByCode(collegeId);
    return college.adminPassword === password;
  } catch (error) {
    console.error('Error verifying admin:', error);
    return false;
  }
};
