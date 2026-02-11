import React from 'react';

const VoiceVisualizer = ({ isActive }) => {
    if (!isActive) return null;

    return (
        <div className="relative flex items-center justify-center w-32 h-32">
            {/* Outer pulsing rings */}
            <div className="absolute w-32 h-32 rounded-full bg-blue-500/20 animate-ping"></div>
            <div className="absolute w-24 h-24 rounded-full bg-blue-500/30 animate-pulse"></div>
            <div className="absolute w-16 h-16 rounded-full bg-blue-500/40 animate-pulse" style={{ animationDelay: '0.5s' }}></div>

            {/* Central glowing orb */}
            <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow-[0_0_30px_rgba(59,130,246,0.8)] flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-300 to-blue-500 shadow-[0_0_20px_rgba(96,165,250,0.6)] animate-pulse"></div>
            </div>
        </div>
    );
};

export default VoiceVisualizer;
