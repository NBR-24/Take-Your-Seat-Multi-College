import React from 'react';
import SleeperSeat from './SleeperSeat';
import { useTheme } from '../contexts/ThemeContext';

const SleeperSeatMap = ({ seats, onSeatClick, selectedSeat, bogieNumber = "S1" }) => {
  const { isDark } = useTheme();

  const sortedSeats = [...seats].sort((a, b) => a.number - b.number);

  const getSeatTypeLabel = (seat) => {
    const position = ((seat.number - 1) % 8) + 1;
    switch (position) {
      case 1: case 4: return 'L';
      case 2: case 5: return 'M';
      case 3: case 6: return 'U';
      case 7: return 'SL';
      case 8: return 'SU';
      default: return '';
    }
  };

  const containerBg = isDark ? 'bg-gray-900' : 'bg-gray-800';
  const legendBg = isDark ? 'bg-gray-800' : 'bg-gray-700';
  const labelColor = isDark ? 'text-gray-400' : 'text-gray-300';

  const renderCompartmentSeats = () => {
    const compartments = [];
    for (let i = 0; i < sortedSeats.length; i += 8) {
      compartments.push(sortedSeats.slice(i, i + 8));
    }

    return (
      <div className="p-4 space-y-8">
        {compartments.map((compartmentSeats, compartmentIndex) => {
          if (compartmentSeats.length === 0) return null;
          const leftTopSeats = compartmentSeats.slice(0, 3);
          const leftBottomSeats = compartmentSeats.slice(3, 6);
          const rightSeats = compartmentSeats.slice(6, 8);

          return (
            <div key={compartmentIndex} className="flex justify-center items-start gap-8">
              <div className="berth-compartment">
                <div className="flex gap-3 justify-center mb-4">
                  {leftTopSeats.map(seat => (
                    <div key={seat.id} className="flex flex-col items-center">
                      <SleeperSeat seat={seat} onSeatClick={onSeatClick} selectedSeat={selectedSeat} />
                      <div className={`text-xs ${labelColor} mt-1 font-medium`}>{getSeatTypeLabel(seat)}</div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 justify-center">
                  {leftBottomSeats.map(seat => (
                    <div key={seat.id} className="flex flex-col items-center">
                      <SleeperSeat seat={seat} onSeatClick={onSeatClick} selectedSeat={selectedSeat} />
                      <div className={`text-xs ${labelColor} mt-1 font-medium`}>{getSeatTypeLabel(seat)}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="berth-compartment">
                <div className="flex flex-col gap-4 items-center justify-center h-full">
                  {rightSeats.map(seat => (
                    <div key={seat.id} className="flex flex-col items-center">
                      <SleeperSeat seat={seat} onSeatClick={onSeatClick} selectedSeat={selectedSeat} />
                      <div className={`text-xs ${labelColor} mt-1 font-medium`}>{getSeatTypeLabel(seat)}</div>
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
    <div className={`${containerBg} text-white rounded-2xl shadow-lg overflow-hidden`}>
      <div className={`px-4 py-3 ${legendBg}`}>
        <div className="flex flex-wrap gap-4 text-xs">
          {[
            { color: 'bg-green-600 border-green-500', label: 'Available' },
            { color: 'bg-red-600 border-red-500', label: 'Booked' },
            { color: 'bg-yellow-600 border-yellow-500', label: 'Reserved' },
            { color: 'bg-gray-600 border-gray-500', label: 'Unavailable' },
            { color: 'bg-blue-500 border-blue-400', label: 'Selected' },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-2">
              <div className={`w-4 h-4 ${l.color} border rounded`}></div>
              <span>{l.label}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-4 text-xs mt-2 text-gray-300">
          <span><strong>LOWER:</strong> Lower Berth</span>
          <span><strong>MIDDLE:</strong> Middle Berth</span>
          <span><strong>UPPER:</strong> Upper Berth</span>
          <span><strong>S.LOWER:</strong> Side Lower</span>
          <span><strong>S.UPPER:</strong> Side Upper</span>
        </div>
      </div>

      <div className={`${containerBg} max-h-96 overflow-y-auto`}>
        {renderCompartmentSeats()}
      </div>

      <div className={`p-3 ${legendBg} text-center text-sm text-gray-400`}>
        🚂 Engine Direction
      </div>
    </div>
  );
};

export default SleeperSeatMap;
