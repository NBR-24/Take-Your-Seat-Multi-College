// Route configuration for train booking
export const ROUTES = {
  SHORNUR_TO_AGRA: {
    id: 'shornur_agra',
    name: 'Shornur Junction to Agra Railway Station',
    from: 'Shornur Junction',
    to: 'Agra Railway Station',
    trainNumber: '12617',
    trainName: 'Mangala Lakshadweep Express',
    departureTime: '1:00 PM',
    duration: '44h 55m',
    distance: '2,467 km',
    bogies: ['s3', 's5', 's7']
  },
  DELHI_TO_SHORNUR: {
    id: 'delhi_shornur',
    name: 'Delhi to Shornur Junction',
    from: 'Delhi',
    to: 'Shornur',
    trainNumber: '12618',
    trainName: 'Mangala Lakshadweep Express',
    departureTime: '5:35 AM',
    duration: '47h 50m',
    distance: '2,654 km',
    bogies: ['s2', 's3', 's4', 's5', 's6']
  }
};

export const getRouteById = (routeId) => {
  return Object.values(ROUTES).find(route => route.id === routeId);
};

export const getAllRoutes = () => {
  return Object.values(ROUTES);
};
