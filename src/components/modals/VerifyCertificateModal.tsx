import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, ShieldCheck, ArrowRight, Search, AlertCircle } from 'lucide-react';
import { playSound } from '../../utils/soundEffects';

interface VerifyCertificateModalProps {
  onClose: () => void;
  onVerify?: (certificateId: string) => void;
}

export const VerifyCertificateModal: React.FC<VerifyCertificateModalProps> = ({ onClose, onVerify }) => {
  const [certId, setCertId] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = certId.trim().toUpperCase();
    if (!cleanId) {
      setError('Please enter a Certificate ID or Authentication Code.');
      playSound('error');
      return;
    }

    playSound('scan');
    if (onVerify) {
      onVerify(cleanId);
    } else {
      window.history.pushState({}, '', `/${cleanId}`);
      window.dispatchEvent(new Event('popstate'));
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#100e17]/85 backdrop-blur-md"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="bg-[#181524] border border-[#332d47] rounded-[24px] w-full max-w-md p-6 sm:p-8 relative shadow-2xl shadow-purple-950/40"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-[#1f1b2e] text-[#c4c7c8] hover:text-[#a855f7] hover:bg-[#332d47] transition-all cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#7c3aed] to-[#a855f7] flex items-center justify-center text-[#ffffff] shadow-md shadow-purple-900/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-mono tracking-widest text-[#a855f7] uppercase font-semibold">
            Credential Authentication
          </span>
        </div>

        <h3 className="text-2xl font-serif text-[#ffffff] font-normal mb-1.5">
          Verify Certificate
        </h3>
        <p className="text-xs text-[#c4c7c8] font-light mb-6 leading-relaxed">
          Input the unique Certificate ID printed on the physical credential or digital statement to verify its authenticity.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="certificate-verify-input" className="block text-xs font-light text-[#c4c7c8] mb-2">
              Certificate ID / Auth Code
            </label>
            <div className="relative">
              <input
                id="certificate-verify-input"
                type="text"
                autoFocus
                value={certId}
                onChange={(e) => {
                  setCertId(e.target.value.toUpperCase());
                  if (error) setError('');
                }}
                placeholder="e.g. ORB-8F29K2"
                className="w-full bg-[#1f1b2e] border border-[#332d47] focus:border-[#a855f7] focus:ring-1 focus:ring-[#a855f7] rounded-xl px-4 py-3 pl-11 text-sm font-mono text-white placeholder-[#64748b] transition-all outline-none"
              />
              <Search className="w-4 h-4 text-[#a855f7] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {error && (
              <div className="flex items-center gap-1.5 mt-2 text-rose-400 text-xs">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="pt-3 flex items-center gap-3">
            <button
              type="submit"
              className="flex-1 py-3 px-5 rounded-full btn-purple font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-900/30 transition-all cursor-pointer"
            >
              <span>Verify Credential</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-5 rounded-full bg-[#1f1b2e] hover:bg-[#332d47] text-[#c4c7c8] hover:text-white text-xs font-medium border border-[#332d47] transition-all cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};
