import React from 'react';
import { MapPin, Clock, Route, Train } from 'lucide-react';
import { ROUTES } from '../utils/routeConfig';

const RouteSelector = ({ selectedRoute, onRouteChange }) => {
  const routes = Object.values(ROUTES);

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <Route className="text-blue-600" size={24} />
        <h2 className="text-xl font-semibold text-gray-800">Select Route</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {routes.map(route => {
          const isSelected = selectedRoute?.id === route.id;
          
          return (
            <button
              key={route.id}
              onClick={() => onRouteChange(route)}
              className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                isSelected 
                  ? 'border-blue-500 bg-blue-50 shadow-md' 
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className={`font-semibold text-lg ${
                    isSelected ? 'text-blue-800' : 'text-gray-800'
                  }`}>
                    {route.name}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                    <Train size={16} />
                    <span>{route.trainNumber} - {route.trainName}</span>
                  </div>
                </div>
                {isSelected && (
                  <div className="bg-blue-600 text-white rounded-full p-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin size={16} className="text-green-600" />
                  <span className="text-gray-700">
                    <strong>{route.from}</strong> → <strong>{route.to}</strong>
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Clock size={16} />
                    <span>Departs: {route.departureTime}</span>
                  </div>
                  <span>{route.duration} • {route.distance}</span>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Available Bogies: {route.bogies.map(b => b.toUpperCase()).join(', ')}
                </div>
              </div>
            </button>
          );
        })}
      </div>
      
      {selectedRoute && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-green-800">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">
              Route Selected: {selectedRoute.name}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default RouteSelector;
