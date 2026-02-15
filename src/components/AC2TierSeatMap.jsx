import React from 'react';
import AC2TierSeat from './AC2TierSeat';
import { useTheme } from '../contexts/ThemeContext';
import { getAC2SeatTypeDisplay } from '../utils/ac2TierLayout';

const AC2TierSeatMap = ({ seats, onSeatClick, selectedSeat, bogieNumber = "A1" }) => {
    const { isDark } = useTheme();

    const sortedSeats = [...seats].sort((a, b) => a.number - b.number);

    const containerBg = isDark ? 'bg-gray-900' : 'bg-gray-800';
    const legendBg = isDark ? 'bg-gray-800' : 'bg-gray-700';
    const labelColor = isDark ? 'text-gray-400' : 'text-gray-300';

    const renderCompartmentSeats = () => {
        const compartments = [];
        // 6 seats per compartment
        for (let i = 0; i < sortedSeats.length; i += 6) {
            compartments.push(sortedSeats.slice(i, i + 6));
        }

        return (
            <div className="p-4 space-y-8">
                {compartments.map((compartmentSeats, compartmentIndex) => {
                    if (compartmentSeats.length === 0) return null;

                    // Main berths (left): seats 0-3 (2 sets of LOWER+UPPER)
                    const leftSet1 = compartmentSeats.slice(0, 2); // LOWER, UPPER
                    const leftSet2 = compartmentSeats.slice(2, 4); // LOWER, UPPER
                    // Side berths (right): seats 4-5 (SIDE LOWER, SIDE UPPER)
                    const rightSeats = compartmentSeats.slice(4, 6);

                    return (
                        <div key={compartmentIndex} className="flex justify-center items-start gap-8">
                            {/* Main berths section */}
                            <div className="berth-compartment">
                                <div className="flex gap-6 justify-center items-center h-full">
                                    {/* First set: LOWER + UPPER */}
                                    <div className="flex flex-col gap-3">
                                        {leftSet1.map(seat => (
                                            <div key={seat.id} className="flex flex-col items-center">
                                                <AC2TierSeat seat={seat} onSeatClick={onSeatClick} selectedSeat={selectedSeat} />
                                                <div className={`text-xs ${labelColor} mt-1 font-medium`}>{getAC2SeatTypeDisplay(seat.type)}</div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Second set: LOWER + UPPER */}
                                    <div className="flex flex-col gap-3">
                                        {leftSet2.map(seat => (
                                            <div key={seat.id} className="flex flex-col items-center">
                                                <AC2TierSeat seat={seat} onSeatClick={onSeatClick} selectedSeat={selectedSeat} />
                                                <div className={`text-xs ${labelColor} mt-1 font-medium`}>{getAC2SeatTypeDisplay(seat.type)}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Aisle separator */}
                            <div className="w-px h-32 bg-gray-600/30"></div>

                            {/* Side berths section */}
                            <div className="berth-compartment">
                                <div className="flex flex-col gap-4 items-center justify-center h-full">
                                    {rightSeats.map(seat => (
                                        <div key={seat.id} className="flex flex-col items-center">
                                            <AC2TierSeat seat={seat} onSeatClick={onSeatClick} selectedSeat={selectedSeat} />
                                            <div className={`text-xs ${labelColor} mt-1 font-medium`}>{getAC2SeatTypeDisplay(seat.type)}</div>
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
            {/* Legend */}
            <div className={`px-4 py-3 ${legendBg}`}>
                <div className="flex flex-wrap gap-4 text-xs">
                    {[
                        { color: 'bg-blue-500 border-blue-400', label: 'Available' },
                        { color: 'bg-red-600 border-red-500', label: 'Booked' },
                        { color: 'bg-yellow-600 border-yellow-500', label: 'Reserved' },
                        { color: 'bg-gray-600 border-gray-500', label: 'Unavailable' },
                        { color: 'bg-accent border-accent', label: 'Selected' },
                    ].map(l => (
                        <div key={l.label} className="flex items-center gap-2">
                            <div className={`w-4 h-4 ${l.color} border rounded`}></div>
                            <span>{l.label}</span>
                        </div>
                    ))}
                </div>

                <div className="flex flex-wrap gap-4 text-xs mt-2 text-gray-300">
                    <span><strong>L:</strong> Lower Berth</span>
                    <span><strong>U:</strong> Upper Berth</span>
                    <span><strong>SL:</strong> Side Lower</span>
                    <span><strong>SU:</strong> Side Upper</span>
                </div>
            </div>

            {/* Seat layout */}
            <div className={`${containerBg} max-h-96 overflow-y-auto`}>
                {renderCompartmentSeats()}
            </div>

            {/* Footer */}
            <div className={`p-3 ${legendBg} text-center text-sm text-gray-400`}>
                🚂 Engine Direction
            </div>
        </div>
    );
};

export default AC2TierSeatMap;
