import React, { useState } from 'react';
import AC2TierSeatMap from '../components/AC2TierSeatMap';
import { generateAC2TierSeatLayout, SEAT_STATUS } from '../utils/ac2TierLayout';
import { useTheme } from '../contexts/ThemeContext';
import { Train, Users, CheckCircle, XCircle } from 'lucide-react';

const AC2TierDemo = () => {
    const { isDark } = useTheme();
    const [seats, setSeats] = useState(() => {
        const initialSeats = generateAC2TierSeatLayout();
        // Set some example bookings for demonstration
        return initialSeats.map(seat => {
            if ([2, 5, 8, 15, 22, 30, 35].includes(seat.number)) {
                return { ...seat, status: SEAT_STATUS.BOOKED, bookedBy: 'Student Name' };
            }
            if ([10, 20, 40].includes(seat.number)) {
                return { ...seat, status: SEAT_STATUS.RESERVED };
            }
            if ([12, 25].includes(seat.number)) {
                return { ...seat, status: SEAT_STATUS.UNAVAILABLE };
            }
            return seat;
        });
    });
    const [selectedSeat, setSelectedSeat] = useState(null);

    const handleSeatClick = (seat) => {
        if (selectedSeat?.id === seat.id) {
            setSelectedSeat(null);
        } else {
            setSelectedSeat(seat);
        }
    };

    const cardBg = isDark ? 'glass-card' : 'bg-white rounded-2xl shadow-lg border border-gray-200';
    const heading = isDark ? 'text-white' : 'text-gray-900';
    const subheading = isDark ? 'text-gray-300' : 'text-gray-600';
    const statsBg = isDark ? 'bg-dark-400/50 border-dark-200' : 'bg-gray-50 border-gray-200';

    // Calculate statistics
    const stats = seats.reduce(
        (acc, seat) => {
            if (seat.status === SEAT_STATUS.AVAILABLE) acc.available++;
            else if (seat.status === SEAT_STATUS.BOOKED) acc.booked++;
            else if (seat.status === SEAT_STATUS.RESERVED) acc.reserved++;
            else if (seat.status === SEAT_STATUS.UNAVAILABLE) acc.unavailable++;
            return acc;
        },
        { available: 0, booked: 0, reserved: 0, unavailable: 0, total: 48 }
    );

    return (
        <div className="min-h-screen p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className={`${cardBg} p-6 mb-6`}>
                    <div className="flex items-center gap-3 mb-2">
                        <Train className="text-accent" size={32} />
                        <h1 className={`text-3xl font-bold ${heading}`}>AC 2-Tier Coach Layout</h1>
                    </div>
                    <p className={`${subheading} text-sm`}>
                        Clean, modern seat booking interface for Indian Railways AC 2-Tier coaches
                    </p>
                </div>

                {/* Statistics */}
                <div className={`${cardBg} p-6 mb-6`}>
                    <div className="flex items-center gap-3 mb-4">
                        <Users className="text-accent" size={24} />
                        <h2 className={`text-xl font-semibold ${heading}`}>Coach A1 Statistics</h2>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                        {[
                            { label: 'Available', value: stats.available, color: 'text-blue-400', icon: CheckCircle },
                            { label: 'Booked', value: stats.booked, color: 'text-red-400', icon: XCircle },
                            { label: 'Reserved', value: stats.reserved, color: 'text-yellow-400', icon: Users },
                            { label: 'Unavailable', value: stats.unavailable, color: 'text-gray-400', icon: XCircle },
                            { label: 'Total Seats', value: stats.total, color: 'text-accent', icon: Train },
                        ].map(s => (
                            <div key={s.label} className={`${statsBg} p-4 rounded-xl border text-center`}>
                                <div className="flex justify-center mb-2">
                                    <s.icon className={s.color} size={20} />
                                </div>
                                <div className={`text-2xl font-bold ${heading}`}>{s.value}</div>
                                <div className={`text-xs ${s.color} mt-1`}>{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Selected Seat Info */}
                {selectedSeat && (
                    <div className={`${cardBg} p-6 mb-6 border-2 border-accent`}>
                        <h3 className={`text-lg font-semibold ${heading} mb-2`}>Selected Seat</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className={subheading}>Seat Number:</span>
                                <span className={`ml-2 font-semibold ${heading}`}>{selectedSeat.number}</span>
                            </div>
                            <div>
                                <span className={subheading}>Berth Type:</span>
                                <span className={`ml-2 font-semibold ${heading}`}>{selectedSeat.type}</span>
                            </div>
                            <div>
                                <span className={subheading}>Compartment:</span>
                                <span className={`ml-2 font-semibold ${heading}`}>{selectedSeat.compartment}</span>
                            </div>
                            <div>
                                <span className={subheading}>Status:</span>
                                <span className={`ml-2 font-semibold ${heading} capitalize`}>{selectedSeat.status}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Seat Map */}
                <AC2TierSeatMap
                    seats={seats}
                    onSeatClick={handleSeatClick}
                    selectedSeat={selectedSeat}
                    bogieNumber="A1"
                />

                {/* Info Section */}
                <div className={`${cardBg} p-6 mt-6`}>
                    <h3 className={`text-lg font-semibold ${heading} mb-3`}>About AC 2-Tier Layout</h3>
                    <div className={`${subheading} space-y-2 text-sm`}>
                        <p>✓ <strong>Total Seats:</strong> 48 berths (8 compartments × 6 berths each)</p>
                        <p>✓ <strong>Berth Types:</strong> Lower, Upper, Side Lower, Side Upper (NO middle berths)</p>
                        <p>✓ <strong>Layout:</strong> Main berths on left (2 sets of LOWER+UPPER), Side berths on right (SIDE LOWER+SIDE UPPER)</p>
                        <p>✓ <strong>Design:</strong> Clean, minimal, modern SaaS-style interface with dark theme</p>
                        <p>✓ <strong>Features:</strong> Hover tooltips, status indicators, responsive design</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AC2TierDemo;
