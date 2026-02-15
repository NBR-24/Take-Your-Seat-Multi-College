import React from 'react';
import { Train } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { getBogieTypeDisplay, BOGIE_TYPES } from '../utils/bogieTypes';

const BogieSelector = ({ bogies, activeBogieId, onBogieChange, bogieStats }) => {
  const { isDark } = useTheme();

  const cardBg = isDark ? 'glass-card' : 'bg-white rounded-2xl shadow-lg border border-gray-200';
  const heading = isDark ? 'text-white' : 'text-gray-900';
  const statsBg = isDark ? 'bg-dark-400/50 border-dark-200' : 'bg-gray-50 border-gray-200';

  return (
    <div className={`${cardBg} p-4 sm:p-6 mb-6`}>
      <div className="flex items-center gap-3 mb-4">
        <Train className="text-accent" size={24} />
        <h2 className={`text-xl font-semibold ${heading}`}>Select Bogie</h2>
      </div>

      <div className="flex flex-wrap gap-3">
        {bogies.map(bogie => {
          const bogieId = bogie.id || bogie;
          const bogieType = bogie.type || BOGIE_TYPES.SLEEPER;
          const bogieName = bogie.name || bogieId.toUpperCase();
          const stats = bogieStats[bogieId] || { bookedSeats: 0, reservedSeats: 0, unavailableSeats: 0, availableSeats: 0, totalSeats: 80 };
          const isActive = activeBogieId === bogieId;

          return (
            <button
              key={bogieId}
              onClick={() => onBogieChange(bogieId)}
              className={`min-w-[120px] px-4 py-3 rounded-xl font-medium transition-all ${isActive
                ? 'bg-accent text-dark-700 shadow-lg shadow-accent/20'
                : isDark
                  ? 'bg-dark-400 text-gray-300 hover:bg-dark-300 border border-dark-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                }`}
            >
              <div className="text-center">
                <div className="font-semibold text-lg">{bogieName}</div>
                <div className={`text-xs mt-1 px-2 py-0.5 rounded inline-block ${bogieType === BOGIE_TYPES.AC_2_TIER
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'bg-green-500/20 text-green-400'
                  }`}>
                  {getBogieTypeDisplay(bogieType, true)}
                </div>
                <div className="text-xs mt-1 opacity-90">{stats.availableSeats} available</div>
              </div>
            </button>
          );
        })}
      </div>

      {activeBogieId && bogieStats[activeBogieId] && (
        <div className={`mt-4 p-4 rounded-xl border ${statsBg}`}>
          <h3 className={`font-medium ${heading} mb-2`}>{activeBogieId.toUpperCase()} Statistics</h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-sm">
            {[
              { label: 'Available', value: bogieStats[activeBogieId].availableSeats || 0, color: 'text-accent' },
              { label: 'Booked', value: bogieStats[activeBogieId].bookedSeats || 0, color: 'text-red-400' },
              { label: 'Reserved', value: bogieStats[activeBogieId].reservedSeats || 0, color: 'text-yellow-400' },
              { label: 'Unavailable', value: bogieStats[activeBogieId].unavailableSeats || 0, color: 'text-gray-400' },
              { label: 'Total', value: bogieStats[activeBogieId].totalSeats || 80, color: 'text-blue-400' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className={`font-semibold ${heading}`}>{s.value}</div>
                <div className={s.color}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BogieSelector;
