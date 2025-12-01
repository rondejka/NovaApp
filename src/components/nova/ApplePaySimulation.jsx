import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Smartphone, ScanFace } from 'lucide-react';

export default function ApplePaySimulation({ isOpen, onClose, amount, merchantName = "NOVA Robotics", onComplete }) {
    const [status, setStatus] = useState('processing'); // processing, success
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (isOpen) {
            setStatus('processing');
            // Simulate face id / processing
            const timer = setTimeout(() => {
                setStatus('success');
                // Close after success
                const closeTimer = setTimeout(() => {
                    onComplete && onComplete();
                    onClose();
                }, 1500);
                return () => clearTimeout(closeTimer);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [isOpen, onComplete, onClose]);

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-[9999] flex items-end sm:items-center justify-center"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="w-full max-w-sm bg-[#F5F5F7] rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl border border-gray-200 mb-0 sm:mb-8"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Apple Pay Header */}
                        <div className="p-5 bg-white border-b border-gray-100 flex justify-between items-start">
                            <div className="flex gap-3">
                                 <div className="w-10 h-6 bg-gradient-to-r from-gray-700 to-gray-900 rounded border border-gray-600 shadow-sm flex items-center justify-center">
                                    <div className="w-6 h-4 bg-white/20 rounded-sm" />
                                 </div>
                                 <div>
                                     <h3 className="text-xs font-semibold text-gray-900">NOVA Card</h3>
                                     <p className="text-[10px] text-gray-500">MasterCard •••• 8842</p>
                                 </div>
                            </div>
                            <div className="text-right">
                                 <p className="text-[10px] font-semibold text-gray-400 uppercase">PAY</p>
                                 <p className="text-lg font-bold text-gray-900">{amount ? `€${amount.toFixed(2)}` : '€0.00'}</p>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="h-48 flex flex-col items-center justify-center relative">
                            {status === 'processing' && (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex flex-col items-center gap-4"
                                >
                                    <div className="relative">
                                        <ScanFace className="w-12 h-12 text-gray-400" />
                                        <motion.div 
                                            className="absolute inset-0 border-2 border-blue-500 rounded-lg"
                                            animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
                                            transition={{ repeat: Infinity, duration: 1.5 }}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 font-medium">Face ID</p>
                                </motion.div>
                            )}

                            {status === 'success' && (
                                <motion.div 
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="flex flex-col items-center gap-2"
                                >
                                    <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-200">
                                        <Check className="w-8 h-8" strokeWidth={3} />
                                    </div>
                                    <p className="text-sm font-semibold text-gray-900 mt-2">Done</p>
                                </motion.div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="bg-white p-4 border-t border-gray-100 flex justify-between items-center">
                            <div className="flex flex-col">
                                 <span className="text-[10px] text-gray-400 font-medium">PAY TO</span>
                                 <span className="text-xs font-semibold text-gray-800">{merchantName}</span>
                            </div>
                            <Smartphone className="w-6 h-6 text-gray-300" />
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
}