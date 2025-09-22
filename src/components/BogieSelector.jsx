import React from 'react';
import { Train } from 'lucide-react';

const BogieSelector = ({ bogies, activeBogieId, onBogieChange, bogieStats }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <Train className="text-blue-600" size={24} />
        <h2 className="text-xl font-semibold text-gray-800">Select Bogie</h2>
      </div>
      
      <div className="flex flex-wrap gap-3">
        {bogies.map(bogieId => {
          const stats = bogieStats[bogieId] || { 
            bookedSeats: 0, 
            reservedSeats: 0, 
            unavailableSeats: 0, 
            availableSeats: 0, 
            totalSeats: 80 
          };
          const isActive = activeBogieId === bogieId;
          
          return (
            <button
              key={bogieId}
              onClick={() => onBogieChange(bogieId)}
              className={`bogie-tab ${isActive ? 'bogie-tab-active' : 'bogie-tab-inactive'} min-w-[120px]`}
            >
              <div className="text-center">
                <div className="font-semibold text-lg">
                  {bogieId.toUpperCase()}
                </div>
                <div className="text-xs mt-1 opacity-90">
                  {stats.availableSeats} available
                </div>
              </div>
            </button>
          );
        })}
      </div>
      
      {/* Bogie Stats */}
      {activeBogieId && bogieStats[activeBogieId] && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-800 mb-2">
            {activeBogieId.toUpperCase()} Statistics
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-sm">
            <div className="text-center">
              <div className="font-semibold text-gray-800">
                {bogieStats[activeBogieId].availableSeats || 0}
              </div>
              <div className="text-green-600">Available</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-800">
                {bogieStats[activeBogieId].bookedSeats || 0}
              </div>
              <div className="text-red-600">Booked</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-800">
                {bogieStats[activeBogieId].reservedSeats || 0}
              </div>
              <div className="text-yellow-600">Reserved</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-800">
                {bogieStats[activeBogieId].unavailableSeats || 0}
              </div>
              <div className="text-gray-600">Unavailable</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-800">
                {bogieStats[activeBogieId].totalSeats || 80}
              </div>
              <div className="text-blue-600">Total</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BogieSelector;
