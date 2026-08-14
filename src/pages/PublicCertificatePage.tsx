import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertOctagon, 
  Search, 
  Copy, 
  Download, 
  Printer, 
  FileText, 
  Calendar, 
  User, 
  BookOpen, 
  Hash, 
  Clock, 
  Award,
  ExternalLink,
  Lock,
  ArrowRight
} from 'lucide-react';
import { 
  CertificateRecord, 
  getCertificateById, 
  getPublicAuthUrl, 
  getActualBrowserAuthUrl 
} from '../services/certificateService';
import { generateQrCodeDataUrl, downloadQrCode } from '../utils/qrCode';
import { OrbitLogo } from '../components/OrbitLogo';

interface PublicCertificatePageProps {
  authId: string;
  onNavigateHome: () => void;
  onSearchNewId: (newId: string) => void;
  onNavigateAdminLogin: () => void;
}

export const PublicCertificatePage: React.FC<PublicCertificatePageProps> = ({
  authId,
  onNavigateHome,
  onSearchNewId,
  onNavigateAdminLogin
}) => {
  const [certificate, setCertificate] = useState<CertificateRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [lookupInput, setLookupInput] = useState('');

  const publicUrl = getPublicAuthUrl(authId);
  const browserUrl = getActualBrowserAuthUrl(authId);

  useEffect(() => {
    setLoading(true);
    // Simulate lightweight lookup
    const record = getCertificateById(authId);
    setCertificate(record);
    setLoading(false);

    if (record) {
      generateQrCodeDataUrl(browserUrl, 500)
        .then(url => setQrDataUrl(url))
        .catch(console.error);
    }
  }, [authId, browserUrl]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQr = () => {
    downloadQrCode(browserUrl, `Orbit_Space_Certificate_QR_${authId.toUpperCase()}.png`);
  };

  const handleLookupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (lookupInput.trim()) {
      onSearchNewId(lookupInput.trim().toUpperCase());
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#100e17] flex items-center justify-center p-6 text-[#ffffff]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-[#a855f7] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono text-[#c4c7c8]">Authenticating Certificate ID...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#100e17] text-[#e5e2e1] flex flex-col justify-between pt-24 pb-16 px-4 sm:px-6 relative overflow-hidden">
      
      {/* Background radial atmosphere */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-purple-900/15 blur-[160px] rounded-full pointer-events-none" />

      <div className="max-w-3xl mx-auto w-full relative z-10 flex-1 space-y-8">
        
        {/* Brand Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-[#332d47]">
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-3 group cursor-pointer text-left transition-transform hover:scale-105"
            title="Return to Orbit Space Homepage"
          >
            <OrbitLogo size={36} color="#c084fc" className="shrink-0" />
            <div className="flex flex-col">
              <span className="text-xl font-semibold text-[#ffffff] tracking-tight font-sans">
                oRbit<span className="text-[#a855f7] font-light">.space</span>
              </span>
              <span className="text-[10px] text-[#a855f7] font-mono tracking-widest uppercase">
                Official Credential Verification
              </span>
            </div>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onNavigateAdminLogin}
              className="text-xs font-mono text-[#c4c7c8] hover:text-[#c084fc] px-3 py-1.5 rounded-full bg-[#181524] border border-[#332d47] transition-colors flex items-center gap-1.5"
            >
              <Lock className="w-3 h-3 text-[#a855f7]" />
              <span>Admin Portal</span>
            </button>
          </div>
        </div>

        {/* 1. STATE A: VALID CERTIFICATE */}
        {certificate && certificate.status === 'valid' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#181524] rounded-[28px] p-6 sm:p-10 border border-[#332d47] shadow-2xl relative overflow-hidden space-y-8 print:bg-white print:text-black print:border-none print:shadow-none"
          >
            {/* Top Verification Header */}
            <div className="text-center space-y-3 pb-8 border-b border-[#332d47] print:border-gray-200">
              
              <div className="w-16 h-16 rounded-full bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 flex items-center justify-center mx-auto shadow-2xl shadow-emerald-950/50">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-mono font-bold uppercase tracking-widest">
                ✓ AUTHENTICATED
              </span>

              <h1 className="text-2xl sm:text-3xl font-serif text-[#ffffff] font-normal tracking-tight print:text-black">
                Official Certificate Authentication
              </h1>

              <p className="text-xs sm:text-sm text-[#e2e8f0] font-light max-w-lg mx-auto leading-relaxed print:text-gray-700">
                This certificate has been successfully authenticated as an official certificate issued by <strong className="text-[#ffffff] font-semibold print:text-black">Orbit Space</strong>.
              </p>
            </div>

            {/* Certificate Record Metadata Box */}
            <div className="bg-[#100e17] rounded-2xl p-6 border border-[#332d47] space-y-6 print:bg-gray-50 print:border-gray-200">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Holder Name */}
                <div className="space-y-1">
                  <span className="text-[10px] text-[#c4c7c8] font-mono uppercase tracking-wider block flex items-center gap-1.5 print:text-gray-500">
                    <User className="w-3.5 h-3.5 text-[#a855f7]" /> Certificate Holder
                  </span>
                  <p className="text-lg font-serif text-[#ffffff] font-normal print:text-black">
                    {certificate.studentName}
                  </p>
                </div>

                {/* Course / Program */}
                <div className="space-y-1">
                  <span className="text-[10px] text-[#c4c7c8] font-mono uppercase tracking-wider block flex items-center gap-1.5 print:text-gray-500">
                    <BookOpen className="w-3.5 h-3.5 text-[#a855f7]" /> Program / Track
                  </span>
                  <p className="text-base font-semibold text-[#a855f7] print:text-purple-700">
                    {certificate.course}
                  </p>
                </div>

                {/* Certificate ID */}
                <div className="space-y-1">
                  <span className="text-[10px] text-[#c4c7c8] font-mono uppercase tracking-wider block flex items-center gap-1.5 print:text-gray-500">
                    <Hash className="w-3.5 h-3.5 text-[#a855f7]" /> Certificate ID
                  </span>
                  <p className="text-sm font-mono font-bold text-[#c084fc] print:text-purple-900">
                    {certificate.id}
                  </p>
                </div>

                {/* Date Issued */}
                <div className="space-y-1">
                  <span className="text-[10px] text-[#c4c7c8] font-mono uppercase tracking-wider block flex items-center gap-1.5 print:text-gray-500">
                    <Calendar className="w-3.5 h-3.5 text-[#a855f7]" /> Date Issued
                  </span>
                  <p className="text-sm font-medium text-[#ffffff] print:text-black">
                    {certificate.dateIssued}
                  </p>
                </div>

                {/* Certificate Number */}
                <div className="space-y-1">
                  <span className="text-[10px] text-[#c4c7c8] font-mono uppercase tracking-wider block flex items-center gap-1.5 print:text-gray-500">
                    <FileText className="w-3.5 h-3.5 text-[#a855f7]" /> Registration Number
                  </span>
                  <p className="text-xs font-mono text-[#e2e8f0] print:text-gray-800">
                    {certificate.certificateNumber}
                  </p>
                </div>

                {/* Status */}
                <div className="space-y-1">
                  <span className="text-[10px] text-[#c4c7c8] font-mono uppercase tracking-wider block print:text-gray-500">
                    Record Status
                  </span>
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 text-xs font-mono font-medium">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Valid & Verified
                    </span>
                  </div>
                </div>

              </div>

              {/* Optional Fields */}
              {(certificate.courseDuration || certificate.certificateType || certificate.additionalNotes) && (
                <div className="pt-4 border-t border-[#332d47] grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs print:border-gray-200">
                  {certificate.courseDuration && (
                    <div>
                      <span className="text-[#c4c7c8] text-[10px] font-mono uppercase block">Duration</span>
                      <span className="text-[#ffffff] font-medium print:text-black">{certificate.courseDuration}</span>
                    </div>
                  )}
                  {certificate.certificateType && (
                    <div>
                      <span className="text-[#c4c7c8] text-[10px] font-mono uppercase block">Credential Type</span>
                      <span className="text-[#ffffff] font-medium print:text-black">{certificate.certificateType}</span>
                    </div>
                  )}
                  {certificate.additionalNotes && (
                    <div className="sm:col-span-2 pt-1">
                      <span className="text-[#c4c7c8] text-[10px] font-mono uppercase block">Honors / Notes</span>
                      <p className="text-[#e2e8f0] font-light leading-relaxed print:text-gray-800">{certificate.additionalNotes}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Uploaded Certificate Document Preview if attached */}
              {certificate.fileName && (
                <div className="pt-4 border-t border-[#332d47] flex items-center justify-between gap-3 print:border-gray-200">
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-4 h-4 text-[#a855f7] shrink-0" />
                    <span className="text-xs text-[#ffffff] font-mono truncate print:text-black">
                      {certificate.fileName}
                    </span>
                  </div>

                  {certificate.documentUrl && (
                    <a
                      href={certificate.documentUrl}
                      download={certificate.fileName}
                      className="text-xs text-[#c084fc] hover:underline font-semibold shrink-0 print:hidden"
                    >
                      Download Document
                    </a>
                  )}
                </div>
              )}

            </div>

            {/* QR Code & Direct Link Row */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center bg-[#100e17] p-5 rounded-2xl border border-[#332d47] print:hidden">
              <div className="sm:col-span-8 space-y-2">
                <span className="text-[10px] text-[#a855f7] font-mono uppercase tracking-widest font-semibold block">
                  Public Authentication Link
                </span>
                <div className="bg-[#181524] px-3.5 py-2.5 rounded-xl border border-[#332d47] text-xs font-mono text-[#ffffff] truncate">
                  {publicUrl}
                </div>
                <p className="text-[11px] text-[#c4c7c8] font-light">
                  Scan the QR code or visit this link anytime to verify this credential's official status.
                </p>
              </div>

              <div className="sm:col-span-4 flex flex-col items-center justify-center">
                {qrDataUrl && (
                  <div className="bg-white p-2.5 rounded-xl shadow-lg">
                    <img src={qrDataUrl} alt={`QR Code for ${certificate.id}`} className="w-28 h-28 object-contain" />
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#332d47] print:hidden">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyLink}
                  className="py-3 px-5 rounded-full bg-[#100e17] hover:bg-[#1f1b2e] border border-[#332d47] text-xs font-semibold text-[#ffffff] flex items-center gap-2 transition-all"
                >
                  <Copy className="w-4 h-4 text-[#a855f7]" />
                  <span>{copied ? '✓ Link Copied!' : 'Copy Authentication URL'}</span>
                </button>

                <button
                  onClick={handleDownloadQr}
                  className="py-3 px-5 rounded-full btn-purple text-xs font-semibold flex items-center gap-2 shadow-lg transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Download QR Code</span>
                </button>
              </div>

              <button
                onClick={handlePrint}
                className="py-3 px-5 rounded-full bg-[#1f1b2e] hover:bg-[#332d47] border border-[#332d47] text-xs font-semibold text-[#e2e8f0] flex items-center gap-2 transition-all"
              >
                <Printer className="w-4 h-4 text-[#a855f7]" />
                <span>Print Statement</span>
              </button>
            </div>

          </motion.div>
        )}

        {/* 2. STATE B: REVOKED CERTIFICATE */}
        {certificate && certificate.status === 'revoked' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#181524] rounded-[28px] p-6 sm:p-10 border border-rose-800/60 shadow-2xl relative overflow-hidden space-y-8"
          >
            <div className="text-center space-y-3 pb-8 border-b border-[#332d47]">
              <div className="w-16 h-16 rounded-full bg-rose-950/80 border border-rose-800/60 text-rose-400 flex items-center justify-center mx-auto shadow-2xl shadow-rose-950/50">
                <AlertOctagon className="w-9 h-9" />
              </div>

              <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-950/80 border border-rose-800/60 text-rose-400 text-xs font-mono font-bold uppercase tracking-widest">
                ✕ CERTIFICATE REVOKED
              </span>

              <h1 className="text-2xl sm:text-3xl font-serif text-[#ffffff] font-normal tracking-tight">
                Certificate Revoked
              </h1>

              <p className="text-xs sm:text-sm text-rose-200 font-light max-w-lg mx-auto leading-relaxed">
                This certificate was previously issued by Orbit Space but is <strong className="text-rose-400">no longer considered valid</strong>.
              </p>
            </div>

            {/* Revoked Record Summary */}
            <div className="bg-[#100e17] rounded-2xl p-6 border border-rose-900/40 space-y-4 text-xs">
              <div className="flex justify-between border-b border-[#332d47] pb-3">
                <span className="text-[#c4c7c8]">Certificate Holder:</span>
                <span className="text-[#ffffff] font-semibold">{certificate.studentName}</span>
              </div>
              <div className="flex justify-between border-b border-[#332d47] pb-3">
                <span className="text-[#c4c7c8]">Course / Program:</span>
                <span className="text-[#ffffff] font-semibold">{certificate.course}</span>
              </div>
              <div className="flex justify-between border-b border-[#332d47] pb-3">
                <span className="text-[#c4c7c8]">Certificate ID:</span>
                <span className="text-rose-400 font-mono font-bold">{certificate.id}</span>
              </div>
              <div className="flex justify-between border-b border-[#332d47] pb-3">
                <span className="text-[#c4c7c8]">Date Issued:</span>
                <span className="text-[#ffffff]">{certificate.dateIssued}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#c4c7c8]">Status:</span>
                <span className="text-rose-400 font-bold uppercase font-mono">Revoked</span>
              </div>
            </div>

            {/* Lookup Another Form */}
            <div className="pt-4 border-t border-[#332d47]">
              <span className="text-xs text-[#c4c7c8] block mb-2 font-mono">Verify Another Certificate ID:</span>
              <form onSubmit={handleLookupSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={lookupInput}
                  onChange={(e) => setLookupInput(e.target.value)}
                  placeholder="e.g. ORB-8F29K2"
                  className="flex-1 bg-[#100e17] border border-[#332d47] focus:border-[#a855f7] text-white text-xs rounded-xl px-4 py-2.5 outline-none font-mono"
                />
                <button
                  type="submit"
                  className="btn-purple px-5 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                >
                  <span>Verify</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {/* 3. STATE C: INVALID / NOT FOUND */}
        {!certificate && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#181524] rounded-[28px] p-6 sm:p-10 border border-[#332d47] shadow-2xl relative overflow-hidden space-y-8 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-[#1f1b2e] border border-[#332d47] text-[#a855f7] flex items-center justify-center mx-auto shadow-xl">
              <Search className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono text-[#a855f7] uppercase tracking-widest font-semibold block">
                Verification System
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif text-[#ffffff] font-normal">
                Certificate Not Found
              </h1>
              <p className="text-xs sm:text-sm text-[#c4c7c8] font-light max-w-md mx-auto leading-relaxed">
                We couldn't find an official certificate associated with authentication ID <span className="font-mono text-[#ffffff] font-semibold">{authId}</span>.
              </p>
            </div>

            {/* Check Authentication ID Form */}
            <div className="max-w-md mx-auto bg-[#100e17] p-6 rounded-2xl border border-[#332d47] space-y-4 text-left">
              <label className="block text-xs font-medium text-[#e2e8f0]">
                Check Authentication ID
              </label>
              <form onSubmit={handleLookupSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={lookupInput}
                  onChange={(e) => setLookupInput(e.target.value)}
                  placeholder="Enter ID e.g. ORB-8F29K2"
                  className="flex-1 bg-[#181524] border border-[#332d47] focus:border-[#a855f7] text-white text-xs rounded-xl px-4 py-3 outline-none font-mono"
                />
                <button
                  type="submit"
                  className="btn-purple px-6 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                >
                  <span>Verify</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

            <div className="pt-4 border-t border-[#332d47]">
              <button
                onClick={onNavigateHome}
                className="text-xs text-[#c4c7c8] hover:text-[#a855f7] transition-colors"
              >
                ← Return to Orbit Space Main Page
              </button>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
};
