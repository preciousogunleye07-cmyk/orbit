import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, CheckCircle2, AlertOctagon, Copy, ExternalLink, Download, AlertTriangle, FileText, Calendar, User, BookOpen, Hash, Clock } from 'lucide-react';
import { CertificateRecord, getPublicAuthUrl, getActualBrowserAuthUrl } from '../../services/certificateService';
import { generateQrCodeDataUrl, downloadQrCode } from '../../utils/qrCode';

interface CertificateDetailsModalProps {
  certificate: CertificateRecord;
  onClose: () => void;
  onOpenPublicView: (id: string) => void;
  onRequestRevoke: (cert: CertificateRecord) => void;
}

export const CertificateDetailsModal: React.FC<CertificateDetailsModalProps> = ({
  certificate,
  onClose,
  onOpenPublicView,
  onRequestRevoke
}) => {
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const publicUrl = getPublicAuthUrl(certificate.id);
  const browserUrl = getActualBrowserAuthUrl(certificate.id);

  useEffect(() => {
    generateQrCodeDataUrl(browserUrl, 400)
      .then(url => setQrDataUrl(url))
      .catch(console.error);
  }, [browserUrl]);

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQr = () => {
    downloadQrCode(browserUrl, `Orbit_Space_Certificate_QR_${certificate.id}.png`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-[#181524] border border-[#332d47] rounded-[24px] max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative my-8"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-[#c4c7c8] hover:text-[#ffffff] rounded-xl bg-[#1f1b2e] border border-[#332d47] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#1f1b2e] border border-[#332d47] flex items-center justify-center text-[#a855f7]">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-serif text-[#ffffff] font-normal">Certificate Details</h2>
            <p className="text-xs text-[#c4c7c8] font-mono mt-0.5">{certificate.id}</p>
          </div>
        </div>

        {/* Status Banner */}
        <div className={`p-4 rounded-xl border mb-6 flex items-center justify-between ${
          certificate.status === 'valid'
            ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-300'
            : 'bg-rose-950/30 border-rose-800/50 text-rose-300'
        }`}>
          <div className="flex items-center gap-2.5">
            {certificate.status === 'valid' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <div>
              <span className="font-semibold text-xs uppercase tracking-wider block">
                {certificate.status === 'valid' ? 'Valid & Authenticated' : 'Revoked Certificate'}
              </span>
              <span className="text-[11px] opacity-80 font-light">
                {certificate.status === 'valid' 
                  ? 'Official Orbit Space record active.' 
                  : 'This record was revoked and is marked as invalid publicly.'}
              </span>
            </div>
          </div>
        </div>

        {/* Main Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-6">
          
          {/* Details Column */}
          <div className="md:col-span-7 space-y-4 text-xs">
            
            <div className="bg-[#100e17] p-3.5 rounded-xl border border-[#332d47] flex items-start gap-3">
              <User className="w-4 h-4 text-[#a855f7] shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] text-[#c4c7c8] uppercase font-mono block">Student Name</span>
                <span className="text-sm font-semibold text-[#ffffff]">{certificate.studentName}</span>
              </div>
            </div>

            <div className="bg-[#100e17] p-3.5 rounded-xl border border-[#332d47] flex items-start gap-3">
              <BookOpen className="w-4 h-4 text-[#a855f7] shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] text-[#c4c7c8] uppercase font-mono block">Course / Program</span>
                <span className="text-sm font-semibold text-[#ffffff]">{certificate.course}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#100e17] p-3 rounded-xl border border-[#332d47]">
                <span className="text-[10px] text-[#c4c7c8] uppercase font-mono block flex items-center gap-1">
                  <Hash className="w-3 h-3 text-[#a855f7]" /> Cert Number
                </span>
                <span className="text-xs font-mono font-medium text-[#ffffff] truncate block mt-0.5">
                  {certificate.certificateNumber}
                </span>
              </div>

              <div className="bg-[#100e17] p-3 rounded-xl border border-[#332d47]">
                <span className="text-[10px] text-[#c4c7c8] uppercase font-mono block flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#a855f7]" /> Issue Date
                </span>
                <span className="text-xs font-medium text-[#ffffff] truncate block mt-0.5">
                  {certificate.dateIssued}
                </span>
              </div>
            </div>

            {certificate.courseDuration && (
              <div className="bg-[#100e17] p-3 rounded-xl border border-[#332d47] flex items-center justify-between">
                <span className="text-[#c4c7c8] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#a855f7]" /> Course Duration:
                </span>
                <span className="text-[#ffffff] font-medium">{certificate.courseDuration}</span>
              </div>
            )}

            {certificate.additionalNotes && (
              <div className="bg-[#100e17] p-3.5 rounded-xl border border-[#332d47]">
                <span className="text-[10px] text-[#c4c7c8] uppercase font-mono block mb-1">Additional Notes</span>
                <p className="text-xs text-[#e2e8f0] font-light leading-relaxed">{certificate.additionalNotes}</p>
              </div>
            )}

            {certificate.fileName && (
              <div className="bg-[#100e17] p-3 rounded-xl border border-[#332d47] flex items-center justify-between">
                <div className="flex items-center gap-2 truncate pr-2">
                  <FileText className="w-4 h-4 text-[#a855f7] shrink-0" />
                  <span className="text-xs text-[#ffffff] truncate font-mono">{certificate.fileName}</span>
                </div>
                {certificate.documentUrl && (
                  <a
                    href={certificate.documentUrl}
                    download={certificate.fileName}
                    className="text-[11px] text-[#c084fc] hover:underline font-semibold shrink-0"
                  >
                    Download Doc
                  </a>
                )}
              </div>
            )}

          </div>

          {/* QR Code & URL Box */}
          <div className="md:col-span-5 bg-[#100e17] p-5 rounded-xl border border-[#332d47] flex flex-col items-center justify-between text-center">
            
            <span className="text-[10px] text-[#a855f7] font-mono uppercase tracking-widest block mb-2 font-semibold">
              Authentication QR Code
            </span>

            {qrDataUrl ? (
              <div className="bg-white p-3 rounded-xl shadow-lg my-2 inline-block">
                <img src={qrDataUrl} alt={`QR code for ${certificate.id}`} className="w-36 h-36 object-contain" />
              </div>
            ) : (
              <div className="w-36 h-36 bg-[#181524] rounded-xl animate-pulse my-2" />
            )}

            <p className="text-[11px] text-[#c4c7c8] font-mono bg-[#181524] px-3 py-1.5 rounded-lg border border-[#332d47] w-full truncate my-3">
              {publicUrl}
            </p>

            <button
              onClick={handleDownloadQr}
              className="w-full py-2 px-3 rounded-xl bg-[#1f1b2e] hover:bg-[#332d47] border border-[#332d47] text-xs text-[#ffffff] font-medium flex items-center justify-center gap-2 transition-all"
            >
              <Download className="w-3.5 h-3.5 text-[#a855f7]" />
              <span>Download QR Code</span>
            </button>
          </div>

        </div>

        {/* Action Toolbar */}
        <div className="pt-4 border-t border-[#332d47] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="py-2.5 px-4 rounded-full bg-[#100e17] hover:bg-[#1f1b2e] border border-[#332d47] text-xs font-semibold text-[#ffffff] flex items-center gap-2 transition-all"
            >
              <Copy className="w-3.5 h-3.5 text-[#a855f7]" />
              <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
            </button>

            <button
              onClick={() => onOpenPublicView(certificate.id)}
              className="py-2.5 px-4 rounded-full btn-purple text-xs font-semibold flex items-center gap-2 shadow-md transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open Public Page</span>
            </button>
          </div>

          {certificate.status === 'valid' && (
            <button
              onClick={() => {
                onClose();
                onRequestRevoke(certificate);
              }}
              className="py-2.5 px-4 rounded-full bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 text-rose-300 text-xs font-semibold flex items-center gap-2 transition-all"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>Revoke Certificate</span>
            </button>
          )}
        </div>

      </motion.div>
    </div>
  );
};
