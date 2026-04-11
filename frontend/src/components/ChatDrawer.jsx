import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const ChatDrawer = ({ isOpen, onClose, history }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-full max-w-sm bg-slate-900 border-l border-white/10 shadow-2xl z-50 flex flex-col pt-8"
                    >
                        <div className="flex items-center justify-between px-6 mb-8">
                            <h2 className="text-2xl font-semibold text-blue-400">History</h2>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-6 pb-8 flex flex-col gap-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                            {history.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-4">
                                    <div className="w-12 h-12 rounded-full border-2 border-slate-800 flex items-center justify-center opacity-50">
                                        <div className="w-1.5 h-1.5 bg-slate-700 rounded-full" />
                                    </div>
                                    <p className="text-sm tracking-wider uppercase">No messages yet</p>
                                </div>
                            ) : (
                                history.map((msg, idx) => (
                                    <div
                                        key={idx}
                                        className={`flex flex-col ${msg.type === 'user' ? 'items-end' : 'items-start'}`}
                                    >
                                        <span className="text-[10px] uppercase tracking-widest text-slate-500 mb-2 px-1">
                                            {msg.type}
                                        </span>
                                        <div
                                            className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-lg ${msg.type === 'user'
                                                    ? 'bg-blue-600/20 text-blue-100 border border-blue-500/30'
                                                    : 'bg-slate-800 text-slate-200 border border-white/5'
                                                }`}
                                        >
                                            {msg.text}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ChatDrawer;
