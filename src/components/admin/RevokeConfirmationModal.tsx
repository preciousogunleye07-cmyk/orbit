import React, { useState } from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, X, Loader2 } from 'lucide-react';
import { CertificateRecord, revokeCertificate } from '../../services/certificateService';
import { playSound } from '../../utils/soundEffects';

interface RevokeConfirmationModalProps {
  certificate: CertificateRecord;
  onClose: () => void;
  onRevoked: () => void;
}

export const RevokeConfirmationModal: React.FC<RevokeConfirmationModalProps> = ({
  certificate,
  onClose,
  onRevoked
}) => {
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    playSound('release');
    onClose();
  };

  const handleConfirm = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    revokeCertificate(certificate.id);
    playSound('error');
    setLoading(false);
    onRevoked();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-[#181524] border border-[#332d47] rounded-[24px] max-w-md w-full p-6 shadow-2xl relative overflow-hidden"
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-[#c4c7c8] hover:text-[#ffffff] rounded-lg bg-[#1f1b2e] border border-[#332d47] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-rose-950/60 border border-rose-800/50 flex items-center justify-center text-rose-400 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-serif text-[#ffffff] font-normal">Revoke Certificate?</h3>
            <p className="text-xs text-rose-300 font-mono mt-0.5">{certificate.id}</p>
          </div>
        </div>

        <div className="bg-[#100e17] p-4 rounded-xl border border-[#332d47] space-y-2 mb-5">
          <div className="flex justify-between text-xs">
            <span className="text-[#c4c7c8]">Student:</span>
            <span className="text-[#ffffff] font-medium">{certificate.studentName}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-[#c4c7c8]">Course:</span>
            <span className="text-[#ffffff] font-medium">{certificate.course}</span>
          </div>
        </div>

        <p className="text-xs text-[#c4c7c8] font-light leading-relaxed mb-6">
          This certificate will no longer be considered valid when someone visits its public authentication link (<span className="font-mono text-[#ffffff]">{certificate.id}</span>). The record will be kept for administrative history, but marked as <strong className="text-rose-400">Revoked</strong>.
        </p>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#332d47]">
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
            className="py-2.5 px-5 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg transition-all disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Revoking...</span>
              </>
            ) : (
              <span>Revoke Certificate</span>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
