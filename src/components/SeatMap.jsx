import React from 'react';
import Seat from './Seat';
import { SEAT_TYPES } from '../utils/seatLayout';

const SeatMap = ({ seats, onSeatClick, selectedSeat }) => {
  // Group seats by row for better layout
  const seatsByRow = seats.reduce((acc, seat) => {
    if (!acc[seat.row]) {
      acc[seat.row] = [];
    }
    acc[seat.row].push(seat);
    return acc;
  }, {});

  const sortedRows = Object.keys(seatsByRow).sort((a, b) => parseInt(a) - parseInt(b));

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Seat Layout</h3>
        
        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-xs sm:text-sm mb-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 border-2 border-green-300 rounded"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 border-2 border-red-300 rounded"></div>
            <span>Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-100 border-2 border-yellow-300 rounded"></div>
            <span>Reserved</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-200 border-2 border-blue-400 rounded"></div>
            <span>Selected</span>
          </div>
        </div>

        {/* Seat Type Legend */}
        <div className="flex flex-wrap gap-4 text-xs sm:text-sm mb-6 text-gray-600">
          <span><strong>L:</strong> Lower</span>
          <span><strong>M:</strong> Middle</span>
          <span><strong>U:</strong> Upper</span>
          <span><strong>SL:</strong> Side Lower</span>
          <span><strong>SU:</strong> Side Upper</span>
        </div>
      </div>

      {/* Seat Map */}
      <div className="overflow-x-auto">
        <div className="min-w-max">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="text-sm font-medium text-gray-600">Window</div>
            <div className="text-sm font-medium text-gray-600">Aisle</div>
            <div className="text-sm font-medium text-gray-600">Window</div>
          </div>

          {/* Seat Rows */}
          <div className="space-y-2">
            {sortedRows.map(rowNum => {
              const rowSeats = seatsByRow[rowNum];
              const leftSeats = rowSeats.filter(seat => seat.position === 'left').sort((a, b) => {
                const typeOrder = { [SEAT_TYPES.LOWER]: 1, [SEAT_TYPES.MIDDLE]: 2, [SEAT_TYPES.UPPER]: 3 };
                return typeOrder[a.type] - typeOrder[b.type];
              });
              const rightSeats = rowSeats.filter(seat => seat.position === 'right');

              return (
                <div key={rowNum} className="flex items-center justify-between gap-4 px-2">
                  {/* Left side seats (3 seats: L, M, U) */}
                  <div className="flex gap-1">
                    {leftSeats.map(seat => (
                      <Seat
                        key={seat.id}
                        seat={seat}
                        onSeatClick={onSeatClick}
                        selectedSeat={selectedSeat}
                      />
                    ))}
                  </div>

                  {/* Row number */}
                  <div className="text-xs text-gray-500 font-medium min-w-[2rem] text-center">
                    Row {rowNum}
                  </div>

                  {/* Right side seats (1 seat: SL or SU) */}
                  <div className="flex gap-1">
                    {rightSeats.map(seat => (
                      <Seat
                        key={seat.id}
                        seat={seat}
                        onSeatClick={onSeatClick}
                        selectedSeat={selectedSeat}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-center mt-6 text-sm text-gray-600">
            <div className="bg-gray-100 px-4 py-2 rounded-lg">
              🚂 Engine Direction
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatMap;
