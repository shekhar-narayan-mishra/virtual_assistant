import React from 'react';

const VoiceVisualizer = ({ isActive }) => {
    if (!isActive) return null;

    return (
        <div className="flex items-center justify-center gap-1 h-10">
            <div className="w-1 bg-cyan-400 h-full animate-[wave_1s_ease-in-out_infinite] delay-0"></div>
            <div className="w-1 bg-cyan-400 h-full animate-[wave_1s_ease-in-out_infinite] delay-100"></div>
            <div className="w-1 bg-cyan-400 h-full animate-[wave_1s_ease-in-out_infinite] delay-200"></div>
            <div className="w-1 bg-cyan-400 h-full animate-[wave_1s_ease-in-out_infinite] delay-100"></div>
            <div className="w-1 bg-cyan-400 h-full animate-[wave_1s_ease-in-out_infinite] delay-0"></div>
        </div>
    );
};

export default VoiceVisualizer;
