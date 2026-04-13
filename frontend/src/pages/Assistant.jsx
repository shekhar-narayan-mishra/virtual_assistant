import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, MessageSquare, LogOut, Settings, Trash2, X, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useVoice } from '../hooks/useVoice';

function Assistant() {
    const navigate = useNavigate();
    const assistantName = localStorage.getItem('assistantName') || 'Jarvis';
    const assistantImage = localStorage.getItem('assistantImage');
    const [isChatOpen, setIsChatOpen] = useState(false);
    const chatEndRef = useRef(null);

    const {
        transcript,
        listening,
        isProcessing,
        history,
        isAiSpeaking,
        startListening,
        stopListening,
        cancelSpeech,
        clearHistory,
        browserSupportsSpeechRecognition
    } = useVoice(assistantName);

    // Auto-scroll chat to bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history]);

    const toggleListening = () => {
        if (listening) {
            stopListening();
        } else {
            startListening();
        }
    };

    const handleLogout = () => {
        cancelSpeech();
        localStorage.removeItem('assistantName');
        localStorage.removeItem('assistantImage');
        navigate('/signin');
    };

    if (!browserSupportsSpeechRecognition) {
        return (
            <div className="flex h-screen items-center justify-center text-red-400 bg-[#0a0a1a] px-6 text-center">
                Your browser does not support speech recognition. Please try Chrome or Edge.
            </div>
        );
    }

    return (
        <div className="flex h-screen w-full bg-[#0a0a1a] text-white font-sans overflow-hidden">

            {/* Main Assistant Area */}
            <div className="flex-1 relative flex flex-col items-center justify-center p-8">

                {/* Background Glow */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#1a103d_0%,_#0a0a1a_70%)] pointer-events-none" />
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />

                {/* Top Navigation */}
                <div className="absolute top-4 right-6 flex items-center gap-3 z-20">
                    <button
                        onClick={() => { cancelSpeech(); navigate('/customize'); }}
                        className="p-2.5 rounded-xl bg-[#16161e] border border-white/5 hover:bg-white/5 transition-colors flex items-center justify-center text-white/50 hover:text-white cursor-pointer"
                        title="Settings"
                    >
                        <Settings size={18} />
                    </button>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#16161e] border border-white/5 hover:bg-red-500/10 hover:border-red-500/30 transition-colors text-white/50 hover:text-red-400 font-medium text-xs tracking-wider cursor-pointer"
                        style={{ fontFamily: 'Outfit, sans-serif' }}
                    >
                        <LogOut size={16} />
                        <span className="uppercase">Logout</span>
                    </button>
                </div>

                {/* Central Avatar & Status */}
                <div className="relative z-10 flex flex-col items-center">
                    {/* Outer glow ring */}
                    <motion.div
                        animate={listening || isAiSpeaking || isProcessing ? {
                            boxShadow: [
                                "0 0 30px rgba(139,92,246,0.15), 0 0 60px rgba(59,130,246,0.1)",
                                "0 0 50px rgba(139,92,246,0.4), 0 0 100px rgba(59,130,246,0.25)",
                                "0 0 30px rgba(139,92,246,0.15), 0 0 60px rgba(59,130,246,0.1)"
                            ]
                        } : {
                            boxShadow: "0 0 30px rgba(139,92,246,0.08), 0 0 60px rgba(59,130,246,0.05)"
                        }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                        className="w-48 h-48 md:w-56 md:h-56 rounded-full p-1 mb-6"
                        style={{
                            background: 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(59,130,246,0.3), rgba(139,92,246,0.3))',
                        }}
                    >
                        <div className="w-full h-full rounded-full p-1 bg-[#0a0a1a]">
                            <div className="w-full h-full rounded-full overflow-hidden relative border border-white/10">
                                {assistantImage ? (
                                    <img src={assistantImage} alt="Assistant" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-violet-900/50 to-blue-900/50 flex items-center justify-center">
                                        <Sparkles className="text-violet-400/60 w-12 h-12" />
                                    </div>
                                )}
                                {(listening || isAiSpeaking || isProcessing) && (
                                    <motion.div
                                        animate={{ opacity: [0.05, 0.15, 0.05] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                        className="absolute inset-0 bg-violet-500 pointer-events-none"
                                    />
                                )}
                            </div>
                        </div>
                    </motion.div>

                    <h2 className="text-xl md:text-2xl font-light tracking-wide text-white/90 mb-2">
                        Say "<span className="text-violet-400 font-medium">Hi {assistantName}</span>"
                    </h2>

                    <div className="h-5">
                        <AnimatePresence mode="wait">
                            {(isProcessing || isAiSpeaking || listening) && (
                                <motion.span
                                    key={isProcessing ? 'proc' : isAiSpeaking ? 'speak' : 'listen'}
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -6 }}
                                    className={`text-sm tracking-[0.2em] uppercase font-medium ${isProcessing ? 'text-amber-400' : isAiSpeaking ? 'text-emerald-400' : 'text-violet-400'
                                        }`}
                                >
                                    {isProcessing ? "Processing..." : isAiSpeaking ? "Speaking..." : "Listening..."}
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Live transcript */}
                    {transcript && listening && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mt-4 text-white/40 text-sm italic max-w-md text-center truncate"
                        >
                            "{transcript}"
                        </motion.p>
                    )}
                </div>

                {/* Bottom Controls */}
                <div className="absolute bottom-10 flex items-center gap-6 z-20">
                    <motion.button
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.92 }}
                        onClick={toggleListening}
                        className={`w-[72px] h-[72px] rounded-full flex items-center justify-center transition-all duration-300 ${listening
                            ? 'bg-gradient-to-br from-violet-600 to-blue-600 shadow-[0_0_35px_rgba(139,92,246,0.5)]'
                            : 'bg-white/[0.06] border border-white/10 hover:border-violet-500/40 hover:bg-white/10'
                            }`}
                    >
                        {listening ? <Mic size={28} className="text-white" /> : <MicOff size={28} className="text-white/60" />}
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.92 }}
                        onClick={() => setIsChatOpen(!isChatOpen)}
                        className={`w-[72px] h-[72px] rounded-full flex items-center justify-center transition-all duration-300 relative ${isChatOpen
                            ? 'bg-gradient-to-br from-blue-600 to-cyan-600 shadow-[0_0_25px_rgba(59,130,246,0.4)]'
                            : 'bg-white/[0.06] border border-white/10 hover:border-blue-500/40 hover:bg-white/10'
                            }`}
                    >
                        <MessageSquare size={28} className={isChatOpen ? 'text-white' : 'text-white/60'} />
                        {history.length > 0 && !isChatOpen && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-violet-500 rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-[#0a0a1a]">
                                {history.filter(m => m.type === 'assistant').length}
                            </span>
                        )}
                    </motion.button>
                </div>
            </div>

            {/* Chat Sidebar — Toggleable */}
            <AnimatePresence>
                {isChatOpen && (
                    <motion.div
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 420, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                        className="h-full flex flex-col border-l border-white/10 z-30 overflow-hidden"
                        style={{
                            background: 'linear-gradient(180deg, #1a1040 0%, #0f0a2a 100%)',
                        }}
                    >
                        {/* Chat Header */}
                        <div className="p-5 border-b border-white/10 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-2">
                                <MessageSquare size={18} className="text-violet-400" />
                                <h1 className="text-lg font-semibold tracking-tight">Chat</h1>
                            </div>
                            <div className="flex items-center gap-1">
                                {history.length > 0 && (
                                    <button
                                        onClick={clearHistory}
                                        className="p-2 rounded-lg hover:bg-red-500/15 transition-colors group"
                                        title="Delete all messages"
                                    >
                                        <Trash2 size={16} className="text-white/40 group-hover:text-red-400 transition-colors" />
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsChatOpen(false)}
                                    className="p-2 rounded-lg hover:bg-white/10 transition-colors group"
                                    title="Close chat"
                                >
                                    <X size={16} className="text-white/40 group-hover:text-white transition-colors" />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 scrollbar-hide">
                            {history.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-white/25 gap-3">
                                    <MessageSquare size={40} className="text-white/10" />
                                    <p className="text-sm italic">Start a conversation...</p>
                                </div>
                            ) : (
                                history.map((msg, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.05 }}
                                        className={`flex flex-col ${msg.type === 'user' ? 'items-end' : 'items-start'}`}
                                    >
                                        <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.type === 'user'
                                            ? 'bg-violet-600/30 text-white/90 rounded-br-md'
                                            : 'bg-white/[0.07] text-white/80 rounded-bl-md border border-white/5'
                                            }`}>
                                            {msg.text}
                                        </div>
                                    </motion.div>
                                ))
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Live transcript */}
                        <AnimatePresence>
                            {transcript && listening && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="px-5 py-3 bg-violet-500/5 border-t border-white/5 text-xs text-violet-300/60 italic overflow-hidden"
                                >
                                    "{transcript}"
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default Assistant;
