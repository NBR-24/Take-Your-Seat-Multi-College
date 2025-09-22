import React from 'react';
import SleeperSeat from './SleeperSeat';
import { ArrowLeft, Share, MoreVertical } from 'lucide-react';

const SleeperSeatMap = ({ seats, onSeatClick, selectedSeat, bogieNumber = "S1" }) => {
  console.log('SleeperSeatMap rendering with compartment layout');
  // Sort seats by number for linear display
  const sortedSeats = [...seats].sort((a, b) => a.number - b.number);

  const getSeatTypeLabel = (seat) => {
    const seatNum = seat.number;
    const position = ((seatNum - 1) % 8) + 1;
    
    switch (position) {
      case 1: case 4: return 'L';
      case 2: case 5: return 'M';
      case 3: case 6: return 'U';
      case 7: return 'SL';
      case 8: return 'SU';
      default: return '';
    }
  };

  const renderCompartmentSeats = () => {
    // Group seats into compartments of 8 seats each (10 compartments for 80 seats)
    const compartments = [];
    for (let i = 0; i < sortedSeats.length; i += 8) {
      compartments.push(sortedSeats.slice(i, i + 8));
    }

    return (
      <div className="p-4 space-y-8">
        {compartments.map((compartmentSeats, compartmentIndex) => {
          if (compartmentSeats.length === 0) return null;

          // Arrange seats in compartment layout:
          // Left compartment: seats 1,2,3 (top) and 4,5,6 (bottom)
          // Right compartment: seats 7,8 (vertically)
          const leftTopSeats = compartmentSeats.slice(0, 3); // 1,2,3
          const leftBottomSeats = compartmentSeats.slice(3, 6); // 4,5,6
          const rightSeats = compartmentSeats.slice(6, 8); // 7,8

          return (
            <div key={compartmentIndex} className="flex justify-center items-start gap-8">
              {/* Left Compartment - 6 berths in 2 rows */}
              <div className="berth-compartment">
                {/* Top row - seats 1, 2, 3 */}
                <div className="flex gap-3 justify-center mb-4">
                  {leftTopSeats.map(seat => (
                    <div key={seat.id} className="flex flex-col items-center">
                      <SleeperSeat
                        seat={seat}
                        onSeatClick={onSeatClick}
                        selectedSeat={selectedSeat}
                      />
                      <div className="text-xs text-gray-400 mt-1 font-medium">
                        {getSeatTypeLabel(seat)}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Bottom row - seats 4, 5, 6 */}
                <div className="flex gap-3 justify-center">
                  {leftBottomSeats.map(seat => (
                    <div key={seat.id} className="flex flex-col items-center">
                      <SleeperSeat
                        seat={seat}
                        onSeatClick={onSeatClick}
                        selectedSeat={selectedSeat}
                      />
                      <div className="text-xs text-gray-400 mt-1 font-medium">
                        {getSeatTypeLabel(seat)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Compartment - 2 side berths */}
              <div className="berth-compartment">
                <div className="flex flex-col gap-4 items-center justify-center h-full">
                  {rightSeats.map(seat => (
                    <div key={seat.id} className="flex flex-col items-center">
                      <SleeperSeat
                        seat={seat}
                        onSeatClick={onSeatClick}
                        selectedSeat={selectedSeat}
                      />
                      <div className="text-xs text-gray-400 mt-1 font-medium">
                        {getSeatTypeLabel(seat)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-gray-900 text-white rounded-lg shadow-lg overflow-hidden">

      {/* Legend */}
      <div className="px-4 py-3 bg-gray-800">
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-600 border border-green-500 rounded"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-600 border border-red-500 rounded"></div>
            <span>Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-600 border border-yellow-500 rounded"></div>
            <span>Reserved</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-600 border border-gray-500 rounded"></div>
            <span>Unavailable</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 border border-blue-400 rounded"></div>
            <span>Selected</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4 text-xs mt-2 text-gray-300">
          <span><strong>LOWER:</strong> Lower Berth</span>
          <span><strong>MIDDLE:</strong> Middle Berth</span>
          <span><strong>UPPER:</strong> Upper Berth</span>
          <span><strong>S.LOWER:</strong> Side Lower</span>
          <span><strong>S.UPPER:</strong> Side Upper</span>
        </div>
      </div>

      {/* Seat Map */}
      <div className="bg-gray-900 max-h-96 overflow-y-auto">
        {renderCompartmentSeats()}
      </div>

      {/* Footer */}
      <div className="p-3 bg-gray-800 text-center text-sm text-gray-400">
        🚂 Engine Direction
      </div>
    </div>
  );
};

export default SleeperSeatMap;
