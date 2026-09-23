import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download, Printer, ShieldCheck, Check } from 'lucide-react';
import { AcceptanceLetterDocument } from '../letters/AcceptanceLetterDocument';
import { DEFAULT_ACCEPTANCE_LETTER } from '../../types/letterTypes';
import { generateAcceptanceLetterPdf } from '../../utils/acceptanceLetterPdf';
import { playSound } from '../../utils/soundEffects';

interface AcceptanceLetterPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AcceptanceLetterPreviewModalContent: React.FC<AcceptanceLetterPreviewModalProps> = ({
  isOpen,
  onClose
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      playSound('pulse');
      await generateAcceptanceLetterPdf(DEFAULT_ACCEPTANCE_LETTER);
      playSound('success');
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    playSound('droplet');
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/85 backdrop-blur-md">
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-4xl bg-[#181326] border border-[#3b2d5a] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[#31254a] flex items-center justify-between bg-[#120e1e]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-purple-900/60 border border-purple-500/50 flex items-center justify-center text-purple-300">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white leading-tight">
                  Official Letter of Acceptance Preview
                </h3>
                <p className="text-[11px] text-[#94a3b8]">
                  Orbit Space Tech Academy &amp; Workspace letterhead template for SIWES &amp; I.T students
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="px-3 py-1.5 rounded-xl bg-[#a855f7] hover:bg-[#9333ea] text-white text-xs font-semibold flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
              >
                {isDownloading ? (
                  <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                <span className="hidden sm:inline">Download Sample PDF</span>
              </button>

              <button
                onClick={handlePrint}
                className="p-2 rounded-xl bg-[#231a38] hover:bg-[#322550] text-[#c4c7c8] hover:text-white border border-[#3f2e60] cursor-pointer"
                title="Print Document"
              >
                <Printer className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  playSound('release');
                  onClose();
                }}
                className="p-2 rounded-xl bg-[#231a38] hover:bg-rose-950/60 text-[#c4c7c8] hover:text-rose-300 border border-[#3f2e60] cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body: Letterhead Preview Document */}
          <div className="p-4 sm:p-6 overflow-y-auto bg-[#0d0a15] flex justify-center">
            <div className="w-full max-w-[794px] rounded-xl overflow-hidden shadow-2xl border border-gray-300">
              <AcceptanceLetterDocument letter={DEFAULT_ACCEPTANCE_LETTER} />
            </div>
          </div>

          {/* Footer note */}
          <div className="p-3 bg-[#120e1e] border-t border-[#291e3e] flex items-center justify-between text-xs text-[#94a3b8] px-6">
            <span>Accepted by University of Ilorin, KWASU, Kwara Poly, Federal Poly Offa &amp; others</span>
            <span className="font-mono text-[11px] text-[#c084fc]">Format: Verified A4 Letterhead</span>
          </div>
        </motion.div>

      </div>
    </AnimatePresence>
  );
};

export const AcceptanceLetterPreviewModal: React.FC<AcceptanceLetterPreviewModalProps> = (props) => {
  if (!props.isOpen) return null;
  return <AcceptanceLetterPreviewModalContent {...props} />;
};

