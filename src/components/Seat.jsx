import React from 'react';
import { getSeatColor, getSeatTypeDisplay, SEAT_STATUS } from '../utils/seatLayout';

const Seat = ({ seat, onSeatClick, selectedSeat }) => {
  const isSelected = selectedSeat?.id === seat.id;
  const isClickable = seat.status === SEAT_STATUS.AVAILABLE || isSelected;
  
  const handleClick = () => {
    if (isClickable) {
      onSeatClick(seat);
    }
  };

  const getSeatStatus = () => {
    if (isSelected) return SEAT_STATUS.SELECTED;
    return seat.status;
  };

  const getTooltipContent = () => {
    let content = `Seat ${seat.number} (${getSeatTypeDisplay(seat.type)})`;
    
    if (seat.status === SEAT_STATUS.BOOKED && seat.bookedBy) {
      content += `\nBooked by: ${seat.bookedBy}`;
    } else if (seat.status === SEAT_STATUS.RESERVED) {
      content += '\nReserved for Faculty';
    } else if (seat.status === SEAT_STATUS.AVAILABLE) {
      content += '\nAvailable';
    }
    
    return content;
  };

  return (
    <div className="relative group">
      <button
        onClick={handleClick}
        disabled={!isClickable}
        className={`seat-button ${getSeatColor(getSeatStatus())}`}
        title={getTooltipContent()}
        aria-label={`Seat ${seat.number}, ${seat.type}, ${seat.status}`}
      >
        {seat.number}
      </button>
      
      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
        {getTooltipContent().split('\n').map((line, index) => (
          <div key={index}>{line}</div>
        ))}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
      </div>
    </div>
  );
};

export default Seat;
