import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle = ({ className = '' }) => {
    const { isDark, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className={`relative flex items-center w-16 h-8 rounded-full transition-all duration-500 ${isDark
                ? 'bg-dark-400 border border-dark-200 shadow-inner shadow-dark-700'
                : 'bg-[#E3EDF7] border border-blue-100 shadow-[inset_2px_2px_5px_rgba(200,210,230,0.5),inset_-3px_-3px_7px_rgba(255,255,255,0.7)]'
                } ${className}`}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
        >
            {/* Sliding circle */}
            <span
                className={`absolute top-0.5 flex items-center justify-center w-7 h-7 rounded-full transition-all duration-500 ${isDark
                    ? 'left-[calc(100%-30px)] bg-dark-200 text-yellow-400 shadow-md'
                    : 'left-0.5 bg-white text-amber-500 shadow-[2px_2px_5px_rgba(180,195,220,0.5),-2px_-2px_5px_rgba(255,255,255,0.8)]'
                    }`}
            >
                {isDark ? <Moon size={14} /> : <Sun size={14} />}
            </span>

            {/* Background icons */}
            <Sun size={12} className={`absolute left-2 transition-opacity duration-300 ${isDark ? 'opacity-30 text-gray-500' : 'opacity-0'}`} />
            <Moon size={12} className={`absolute right-2 transition-opacity duration-300 ${isDark ? 'opacity-0' : 'opacity-30 text-blue-400'}`} />
        </button>
    );
};

export default ThemeToggle;
