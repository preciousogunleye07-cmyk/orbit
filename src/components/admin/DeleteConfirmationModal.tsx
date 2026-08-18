import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Trash2, X, Loader2, AlertCircle } from 'lucide-react';
import { CertificateRecord, deleteCertificateAsync } from '../../services/certificateService';
import { playSound } from '../../utils/soundEffects';

interface DeleteConfirmationModalProps {
  certificate: CertificateRecord;
  onClose: () => void;
  onDeleted: () => void;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  certificate,
  onClose,
  onDeleted
}) => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleClose = () => {
    playSound('release');
    onClose();
  };

  const handleConfirm = async () => {
    setLoading(true);
    setErrorMessage(null);

    const result = await deleteCertificateAsync(certificate.id);
    
    if (result && !result.success && result.error) {
      setErrorMessage(result.error);
      setLoading(false);
      return;
    }

    playSound('error');
    setLoading(false);
    onDeleted();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-[#181524] border border-rose-900/50 rounded-[24px] max-w-md w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden"
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-[#c4c7c8] hover:text-[#ffffff] rounded-lg bg-[#1f1b2e] border border-[#332d47] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-950/80 border border-rose-700/60 flex items-center justify-center text-rose-400 shrink-0">
            <Trash2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-serif text-[#ffffff] font-normal">Permanently Delete?</h3>
            <p className="text-xs text-rose-400 font-mono mt-0.5 font-semibold">{certificate.id}</p>
          </div>
        </div>

        <div className="bg-[#100e17] p-4 rounded-xl border border-[#332d47] space-y-2 mb-4">
          <div className="flex justify-between text-xs">
            <span className="text-[#c4c7c8]">Student:</span>
            <span className="text-[#ffffff] font-medium">{certificate.studentName}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-[#c4c7c8]">Course:</span>
            <span className="text-[#ffffff] font-medium">{certificate.course}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-[#c4c7c8]">Certificate No:</span>
            <span className="text-[#ffffff] font-mono">{certificate.certificateNumber}</span>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-950 border border-rose-600 text-rose-200 text-xs mb-4">
            <strong>Supabase Notice:</strong> {errorMessage}. Make sure your Supabase project allows DELETE operations in Row Level Security policies.
          </div>
        )}

        <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-800/40 flex items-start gap-2.5 mb-6">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-rose-300 font-light leading-relaxed">
            This will <strong>permanently purge</strong> this certificate record from both your Supabase database and local storage. Public authentication for this ID will no longer exist. This action cannot be undone.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#332d47]">
          <button
            onClick={handleClose}
            disabled={loading}
            className="py-2.5 px-5 rounded-full bg-[#1f1b2e] border border-[#332d47] text-xs font-medium text-[#e2e8f0] hover:bg-[#332d47] transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="py-2.5 px-5 rounded-full bg-rose-700 hover:bg-rose-600 text-white text-xs font-semibold flex items-center gap-2 shadow-lg transition-all disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Permanently</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
