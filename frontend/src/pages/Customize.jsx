import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Plus, ArrowLeft } from 'lucide-react';

// Importing predefined avatar images
import avatar1 from "../assets/image.png";
import avatar2 from "../assets/image copy.png";
import avatar3 from "../assets/image copy 2.png";
import avatar4 from "../assets/image copy 3.png";
import avatar5 from "../assets/image copy 4.png";
import avatar6 from "../assets/bucky.jpg";
import avatar7 from "../assets/authBg.png";

const PREDEFINED_AVATARS = [
    { id: 1, src: avatar1 },
    { id: 2, src: avatar2 },
    { id: 3, src: avatar3 },
    { id: 4, src: avatar4 },
    { id: 5, src: avatar5 },
    { id: 6, src: avatar6 },
    { id: 7, src: avatar7 },
];

function Customize() {
    const navigate = useNavigate();
    const [name, setName] = useState(localStorage.getItem('assistantName') || 'Jarvis');
    const [selectedImage, setSelectedImage] = useState(localStorage.getItem('assistantImage') || PREDEFINED_AVATARS[0].src);
    const [error, setError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSelectAvatar = (src) => {
        setSelectedImage(src);
        setError('');
    };

    const handleCustomUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError('Image size must be less than 5MB');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result);
                setError('');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleStart = async () => {
        setIsProcessing(true);
        setError('');

        try {
            localStorage.setItem('assistantName', name);
            localStorage.setItem('assistantImage', selectedImage);
            navigate('/assistant');
        } catch (err) {
            console.error("Sync error:", err);
            setError('Failed to save settings');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#0a0a12] flex flex-col items-center justify-center px-4 font-sans relative overflow-hidden">
            
            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="absolute top-6 left-6 w-10 h-10 rounded-xl bg-white/[0.04] border border-white/5 hover:bg-white/10 transition-colors flex items-center justify-center text-white/50 hover:text-white cursor-pointer z-20"
                title="Go Back"
            >
                <ArrowLeft size={18} />
            </button>

            {/* Title */}
            <h1 className="text-[26px] text-white/90 mb-8 tracking-wide font-medium" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Select your <span className="font-bold text-violet-400">Assistant Image</span>
            </h1>

            {/* Floating Grid */}
            <div className="grid grid-cols-4 gap-4 mb-10 w-full max-w-[500px] justify-items-center">
                {PREDEFINED_AVATARS.map((avatar) => (
                    <div
                        key={avatar.id}
                        onClick={() => handleSelectAvatar(avatar.src)}
                        className={`relative w-[110px] h-[110px] rounded-[20px] overflow-hidden cursor-pointer transition-all duration-300 ${
                            selectedImage === avatar.src
                                ? 'border-[2px] border-violet-500 shadow-[0_0_25px_rgba(139,92,246,0.5)] scale-105 z-10 p-[3px]'
                                : 'border border-transparent opacity-80 hover:opacity-100 hover:scale-[1.02]'
                        }`}
                    >
                        <div className="w-full h-full rounded-[16px] overflow-hidden">
                            <img src={avatar.src} alt={`Avatar ${avatar.id}`} className="w-full h-full object-cover" />
                        </div>
                    </div>
                ))}

                {/* Upload Box */}
                <div className="relative w-[110px] h-[110px] rounded-[20px] overflow-hidden bg-transparent border border-dashed border-white/10 hover:border-white/30 transition-colors flex flex-col items-center justify-center cursor-pointer group">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleCustomUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />
                    <div className="flex flex-col items-center justify-center text-white/20 group-hover:text-white/50 transition-colors">
                        <Plus className="w-5 h-5 mb-1" />
                        <Upload className="w-5 h-5" />
                    </div>
                </div>
            </div>

            {/* Name Input Area */}
            <div className="flex flex-col items-center w-full max-w-[280px]">
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jarvis"
                    className="w-full text-center bg-transparent text-white text-[16px] font-medium placeholder:text-white/30 outline-none pb-3"
                    style={{ fontFamily: 'Outfit, sans-serif' }}
                />
                
                {/* Horizontal Divider Line */}
                <div className="w-[320px] h-[1px] bg-white/10 mb-8" />

                {/* Confirm Button - Pill Shaped */}
                <button
                    onClick={handleStart}
                    disabled={isProcessing}
                    className="px-10 py-3.5 rounded-full font-bold text-[13px] tracking-wider text-white transition-all disabled:opacity-50 border-none cursor-pointer shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] transform hover:-translate-y-0.5"
                    style={{ background: 'linear-gradient(to right, #8b5cf6, #3b82f6)', fontFamily: 'Outfit, sans-serif' }}
                >
                    {isProcessing ? 'SAVING...' : 'CONFIRM IDENTITY'}
                </button>
                
                {error && (
                    <p className="text-red-400 text-sm font-medium mt-4 text-center">{error}</p>
                )}
            </div>
        </div>
    );
}

export default Customize;
