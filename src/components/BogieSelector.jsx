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
                <div className={`text-xs mt-1 px-2 py-0.5 rounded inline-block font-semibold ${isActive
                  ? 'bg-dark-700/30 text-white'
                  : bogieType === BOGIE_TYPES.AC_2_TIER
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'bg-green-500/20 text-green-400'
                  }`}>
                  {getBogieTypeDisplay(bogieType, true)}
                </div>
                <div className={`text-xs mt-1 ${isActive ? 'text-dark-700/80' : 'opacity-90'}`}>{stats.availableSeats} available</div>
              </div>
            </button>
          );
        })}
      </div>

      {activeBogieId && bogieStats[activeBogieId] && (() => {
        const stats = bogieStats[activeBogieId];
        const total = stats.totalSeats || 80;
        const radius = 30;
        const circumference = 2 * Math.PI * radius;
        const items = [
          { label: 'Available', value: stats.availableSeats || 0, stroke: '#00d47e' },
          { label: 'Booked', value: stats.bookedSeats || 0, stroke: '#f87171' },
          { label: 'Reserved', value: stats.reservedSeats || 0, stroke: '#facc15' },
          { label: 'Unavailable', value: stats.unavailableSeats || 0, stroke: '#9ca3af' },
          { label: 'Total', value: total, stroke: '#60a5fa' },
        ];
        return (
          <div className={`mt-4 p-5 rounded-xl border ${statsBg}`}>
            <h3 className={`font-medium ${heading} mb-4`}>{activeBogieId.toUpperCase()} Statistics</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-5">
              {items.map(s => {
                const pct = s.label === 'Total' ? 1 : (total > 0 ? s.value / total : 0);
                const dashLen = pct * circumference;
                return (
                  <div key={s.label} className="flex flex-col items-center gap-1">
                    <div className="relative w-[70px] h-[70px]">
                      <svg width="70" height="70" viewBox="0 0 70 70" className="-rotate-90">
                        <circle cx="35" cy="35" r={radius} fill="none"
                          stroke={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}
                          strokeWidth="6"
                        />
                        <circle cx="35" cy="35" r={radius} fill="none"
                          stroke={s.stroke}
                          strokeWidth="6"
                          strokeLinecap="round"
                          strokeDasharray={`${dashLen} ${circumference}`}
                          style={{ transition: 'stroke-dasharray 0.6s ease' }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`text-sm font-bold ${heading}`}>{s.value}</span>
                      </div>
                    </div>
                    <span className="text-xs font-medium" style={{ color: s.stroke }}>{s.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default BogieSelector;
