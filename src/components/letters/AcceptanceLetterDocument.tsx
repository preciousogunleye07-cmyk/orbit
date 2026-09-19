import React, { useEffect, useState } from 'react';
import { AcceptanceLetterData } from '../../types/letterTypes';
import { generateQrCodeDataUrl } from '../../utils/qrCode';
import { Mail, Phone, MapPin, CheckCircle2 } from 'lucide-react';
import { OrbitLogo } from '../OrbitLogo';

interface AcceptanceLetterDocumentProps {
  letter: AcceptanceLetterData;
  showPrintStyle?: boolean;
}

export const AcceptanceLetterDocument: React.FC<AcceptanceLetterDocumentProps> = ({
  letter,
  showPrintStyle = false
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  useEffect(() => {
    const verifyUrl = `${window.location.origin}/verify?id=${encodeURIComponent(letter.verificationCode || letter.matricNumber)}`;
    generateQrCodeDataUrl(verifyUrl, 250)
      .then((url) => setQrCodeUrl(url))
      .catch((err) => console.warn('QR Code generation failed:', err));
  }, [letter.verificationCode, letter.matricNumber]);

  return (
    <div 
      className="acceptance-letter-paper relative bg-white text-[#1f1a29] font-sans mx-auto shadow-2xl overflow-hidden print:shadow-none print:m-0 print:w-full"
      style={{
        width: '100%',
        maxWidth: '794px', // Standard A4 ratio (794px x 1123px at 96 DPI)
        minHeight: '1123px',
        boxSizing: 'border-box'
      }}
      id="acceptance-letter-printable"
    >
      {/* Background Engineering Grid */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-50"
        style={{
          backgroundImage: 'radial-gradient(#cfc5de 0.75px, transparent 0.75px), linear-gradient(to right, #f2eff7 1px, transparent 1px), linear-gradient(to bottom, #f2eff7 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          top: '90px',
          bottom: '50px'
        }}
      />

      {/* Large Watermark - Official Orbit Space Logo */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 opacity-[0.07] overflow-hidden">
        <div className="transform -rotate-12 translate-y-12">
          <OrbitLogo size={520} color="#581c87" />
        </div>
      </div>

      {/* TOP HEADER SECTION (Orbit Space Official Letterhead) */}
      <header className="relative z-10 pt-7 px-8 pb-4 flex items-center justify-between">
        <div className="flex items-center">
          {/* Deep Purple Header Pill */}
          <div 
            className="flex items-center rounded-[22px] overflow-hidden shadow-sm"
            style={{
              background: 'linear-gradient(90deg, #2a0845 0%, #3d0d62 55%, #63238e 85%, #944ebb 98%)'
            }}
          >
            {/* Official Logo Emblem Box */}
            <div className="bg-[#220539] px-4 py-3 flex items-center justify-center border-r border-[#4c1678]">
              <OrbitLogo size={36} color="#ffffff" className="shrink-0 drop-shadow-sm" />
            </div>

            {/* Typography */}
            <div className="pl-4 pr-7 py-2.5">
              <h1 className="text-white font-bold text-lg sm:text-xl tracking-tight leading-tight">
                Orbit space
              </h1>
              <p className="text-[#e3d3f5] text-[11px] font-medium tracking-wide">
                Tech Academy &amp; Workspace
              </p>
            </div>
          </div>
        </div>

        {/* Official Letter Badge */}
        <div className="hidden sm:flex flex-col items-end text-right">
          <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded bg-[#f3edf8] text-[#561c80] font-semibold border border-[#e1d3ee]">
            Official Letter
          </span>
          <span className="text-[10px] text-gray-500 mt-1">SIWES / IT Unit</span>
        </div>
      </header>

      {/* MAIN LETTER CONTENT */}
      <main className="relative z-10 px-8 sm:px-12 pt-3 pb-24 text-[13px] leading-relaxed text-[#2d2538]">
        
        {/* Ref and Date Row */}
        <div className="flex items-center justify-between border-b border-[#e8e2f0] pb-2.5 mb-5 text-xs">
          <div>
            <span className="text-gray-500 font-medium">Ref No: </span>
            <span className="font-mono font-bold text-[#350a55]">{letter.refNumber}</span>
          </div>
          <div>
            <span className="text-gray-500 font-medium">Date: </span>
            <span className="font-semibold text-gray-800">{letter.issueDate}</span>
          </div>
        </div>

        {/* Addressee Block */}
        <div className="mb-5 space-y-0.5 text-xs text-gray-800">
          <p className="font-bold text-[#1f1330] text-[13px]">{letter.recipientTitle}</p>
          <p className="font-medium text-gray-700">{letter.department}</p>
          <p className="font-medium text-gray-700">{letter.institution}</p>
          {letter.institutionAddress && (
            <p className="text-gray-500 text-[11px]">{letter.institutionAddress}</p>
          )}
        </div>

        {/* Salutation */}
        <p className="font-semibold text-gray-800 mb-3 text-xs">
          Dear Sir/Madam,
        </p>

        {/* Subject Heading */}
        <div className="text-center my-4">
          <h2 className="text-sm sm:text-[15px] font-bold uppercase tracking-wide text-[#2d094a] inline-block border-b-2 border-[#5c1a85] pb-0.5">
            Letter of Acceptance for Industrial Training (SIWES) Placement
          </h2>
        </div>

        {/* Acceptance Notice */}
        <p className="mb-4 text-justify leading-relaxed text-gray-700">
          We are pleased to notify you that <strong className="text-[#1f1330] font-bold">{letter.studentName.toUpperCase()}</strong> with 
          Matriculation/Registration Number: <strong className="font-mono text-[#3d0f62] font-semibold">{letter.matricNumber}</strong>, a student of 
          your reputable institution in the <strong className="text-gray-900">{letter.department}</strong>, has been officially accepted for 
          their mandatory <strong className="text-[#2d094a] font-semibold">{letter.duration}</strong> Students Industrial Work Experience Scheme (SIWES) / Industrial Training (I.T) program at <strong>Orbit Space Tech Academy &amp; Workspace</strong>, Ilorin.
        </p>

        {/* Highlighted Placement Details Box */}
        <div className="my-4 p-4 rounded-xl bg-[#faf7fd] border border-[#d8c7ea] relative overflow-hidden shadow-xs">
          <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-[#4c1274]" />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-xs">
            <div>
              <span className="text-gray-500 block text-[10.5px]">Student Full Name</span>
              <span className="font-bold text-[#1f1330]">{letter.studentName}</span>
            </div>

            <div>
              <span className="text-gray-500 block text-[10.5px]">Matriculation / Level</span>
              <span className="font-semibold text-gray-800 font-mono">{letter.matricNumber} ({letter.academicLevel || 'Undergraduate'})</span>
            </div>

            <div>
              <span className="text-gray-500 block text-[10.5px]">Assigned Tech Track</span>
              <span className="font-bold text-[#551980]">{letter.programTrack}</span>
            </div>

            <div>
              <span className="text-gray-500 block text-[10.5px]">Attachment Duration</span>
              <span className="font-semibold text-gray-800">{letter.duration} ({letter.startDate} – {letter.endDate})</span>
            </div>

            <div className="sm:col-span-2">
              <span className="text-gray-500 block text-[10.5px]">Training Facility Venue &amp; Schedule</span>
              <span className="font-medium text-gray-800">
                Behind Armour, Off Fate Tank, GRA, Ilorin, Kwara State • <span className="text-[#551980]">{letter.schedule || 'Mon – Fri | 9:00 AM – 4:00 PM'}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Program Scope & Mentorship Commitment */}
        <div className="space-y-2.5 text-justify text-gray-700 leading-relaxed text-xs">
          <p>
            During this attachment period, the student will participate in hands-on software engineering workshops, active client software sprints, system architecture reviews, and team engineering projects. Our industry-experienced engineering supervisors will oversee the student's daily practical technical tasks to ensure adherence to professional software standards.
          </p>
          <p>
            Orbit Space assures full institutional collaboration, including periodic supervision facilitation for visiting university coordinators, comprehensive logbook reviews, and weekly technical progress verification.
          </p>
        </div>

        <p className="mt-4 mb-2 text-xs text-gray-700">
          We appreciate your institutional partnership and look forward to fostering exceptional technology talents together.
        </p>

        {/* Signatures, Official Stamp & QR Code Section */}
        <div className="mt-6 pt-2 flex items-end justify-between gap-4">
          {/* Signatory Block */}
          <div className="space-y-1">
            <p className="text-xs text-gray-600">Yours faithfully,</p>
            <p className="text-xs font-bold text-[#2d094a]">For: Orbit Space Tech Academy &amp; Workspace</p>

            {/* Stylized Digital Signature */}
            <div className="pt-2 pb-1">
              <span className="font-serif italic text-xl text-[#2d114c] tracking-wide select-none">
                Precious Ogunleye
              </span>
              <div className="w-48 h-[1.5px] bg-[#672793]" />
            </div>

            <div>
              <p className="font-bold text-[#1f1330] text-xs">{letter.signatoryName || 'Engr. Precious Ogunleye'}</p>
              <p className="text-[11px] text-gray-600">{letter.signatoryTitle || 'Academy Director & Technical Supervisor'}</p>
              <p className="text-[10px] text-gray-500">Orbit Space Tech Academy &amp; Workspace, Ilorin</p>
            </div>
          </div>

          {/* Official Purple Verified Stamp */}
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 rounded-full border-[2.5px] border-[#5a1b8a] p-1 flex items-center justify-center text-center rotate-[-6deg] shadow-xs bg-white/80">
              <div className="w-full h-full rounded-full border border-dashed border-[#5a1b8a] flex flex-col items-center justify-center p-1 text-[#5a1b8a]">
                <span className="text-[6.5px] font-bold uppercase tracking-tight">Orbit Space Tech Academy</span>
                <span className="text-[5.5px] font-mono tracking-widest my-0.5">• I.T / SIWES •</span>
                <span className="text-[8px] font-black uppercase tracking-wider bg-[#5a1b8a] text-white px-1 py-0.2 rounded-xs">
                  OFFICIALLY ACCEPTED
                </span>
                <span className="text-[6px] font-medium mt-0.5">ILORIN, KWARA</span>
              </div>
            </div>
          </div>

          {/* Verification QR Code */}
          <div className="flex flex-col items-center text-center">
            {qrCodeUrl ? (
              <img 
                src={qrCodeUrl} 
                alt="Verification QR Code" 
                className="w-18 h-18 rounded-lg border border-[#e1d5ee] p-1 bg-white shadow-xs" 
              />
            ) : (
              <div className="w-18 h-18 rounded-lg bg-gray-100 border border-gray-200 animate-pulse" />
            )}
            <span className="text-[9px] font-bold text-[#551980] mt-1">Scan to Verify</span>
            <span className="text-[8px] font-mono text-gray-500">{letter.verificationCode}</span>
          </div>
        </div>

      </main>

      {/* BOTTOM FOOTER BAR (Exact Orbit Space Letterhead Bottom Banner) */}
      <footer 
        className="absolute bottom-0 left-0 right-0 z-20 py-2.5 px-6 text-white text-[10.5px] flex flex-wrap items-center justify-between gap-2"
        style={{
          backgroundColor: '#2c094a'
        }}
      >
        {/* Email */}
        <div className="flex items-center gap-1.5">
          <Mail className="w-3.5 h-3.5 text-[#e5d4f7] shrink-0" />
          <span className="font-medium text-[#f6f2fa]">orditspace.ilorin@gmail.com</span>
        </div>

        {/* Phone */}
        <div className="flex items-center gap-1.5">
          <Phone className="w-3.5 h-3.5 text-[#e5d4f7] shrink-0" />
          <span className="font-medium text-[#f6f2fa]">0703 880 6474, 0806 762 7491</span>
        </div>

        {/* Address */}
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-[#e5d4f7] shrink-0" />
          <span className="text-[#f6f2fa] text-[10px]">Behind Armour, Off Fate Tank, GRA, Ilorin, Kwara State</span>
        </div>
      </footer>
    </div>
  );
};
