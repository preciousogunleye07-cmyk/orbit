import React, { useState, useEffect, useRef } from 'react';
import { 
  AcceptanceLetterData, 
  DEFAULT_ACCEPTANCE_LETTER 
} from '../../types/letterTypes';
import { 
  getStoredAcceptanceLetters, 
  saveAcceptanceLetter, 
  deleteAcceptanceLetter, 
  generateLetterRefNumber, 
  generateVerificationCode,
  createLetterFromStudent 
} from '../../services/acceptanceLetterService';
import { getCachedStudents, SheetDBStudent } from '../../services/sheetdbService';
import { generateAcceptanceLetterPdf } from '../../utils/acceptanceLetterPdf';
import { AcceptanceLetterDocument } from '../letters/AcceptanceLetterDocument';
import { playSound } from '../../utils/soundEffects';
import { 
  Download, 
  Printer, 
  Plus, 
  FileText, 
  Trash2, 
  Check, 
  Copy, 
  Eye, 
  Sparkles, 
  UserCheck, 
  Search,
  School,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

const COMMON_INSTITUTIONS = [
  'University of Ilorin (UNILORIN)',
  'Kwara State University (KWASU)',
  'Kwara State Polytechnic, Ilorin',
  'Federal Polytechnic Offa',
  'Al-Hikmah University, Ilorin',
  'Landmark University, Omu-Aran',
  'Summit University, Offa'
];

const COMMON_DEPARTMENTS = [
  'Department of Computer Science',
  'Department of Computer Engineering',
  'Department of Information & Communication Science',
  'Department of Cyber Security',
  'Department of Software Engineering',
  'Department of Electrical & Electronics Engineering',
  'Department of Statistics & Data Science'
];

const TECH_TRACKS = [
  'Full Stack Web Development & Cloud Systems',
  'Frontend Web Engineering (React & Modern Web)',
  'Backend Development & RESTful APIs',
  'Cybersecurity & Network Defense',
  'Data Analysis & Machine Learning Fundamentals',
  'UI/UX Product Design & User Experience',
  'AI Web Development & Workflow Automation'
];

export const AdminAcceptanceLettersManager: React.FC = () => {
  const [letters, setLetters] = useState<AcceptanceLetterData[]>(() => getStoredAcceptanceLetters());
  const [activeLetter, setActiveLetter] = useState<AcceptanceLetterData>(() => letters[0] || DEFAULT_ACCEPTANCE_LETTER);
  const [cachedStudents, setCachedStudents] = useState<SheetDBStudent[]>([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'history'>('editor');

  useEffect(() => {
    setCachedStudents(getCachedStudents());
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleFieldChange = (field: keyof AcceptanceLetterData, value: string) => {
    setActiveLetter(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    playSound('success');
    const saved = saveAcceptanceLetter(activeLetter);
    setLetters(getStoredAcceptanceLetters());
    showToast(`Acceptance letter saved for ${saved.studentName}.`);
  };

  const handleCreateNew = () => {
    playSound('pulse');
    const today = new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const newLetter: AcceptanceLetterData = {
      id: `letter-${Date.now()}`,
      refNumber: generateLetterRefNumber(),
      issueDate: today,
      recipientTitle: 'The SIWES Coordinator / Head of Department',
      institution: 'University of Ilorin (UNILORIN)',
      department: 'Department of Computer Science',
      institutionAddress: 'Faculty of CIS, P.M.B. 1515, Ilorin, Kwara State',
      studentName: '',
      matricNumber: '',
      academicLevel: '300 Level',
      programTrack: 'Full Stack Web Development & Cloud Systems',
      duration: '6 Months',
      startDate: 'Next Cohort Intake',
      endDate: '6 Months Subsequent',
      schedule: 'Monday – Friday | 9:00 AM – 4:00 PM',
      signatoryName: 'Engr. Precious Ogunleye',
      signatoryTitle: 'Academy Director & Technical Supervisor',
      verificationCode: generateVerificationCode(),
      createdAt: new Date().toISOString()
    };

    setActiveLetter(newLetter);
    setActiveTab('editor');
    showToast('New blank acceptance letter initialized.');
  };

  const handleSelectStudent = (student: SheetDBStudent) => {
    playSound('droplet');
    const letter = createLetterFromStudent(student);
    setActiveLetter(letter);
    showToast(`Loaded details for ${student.fullName}.`);
  };

  const handleDownloadPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      playSound('pulse');
      await generateAcceptanceLetterPdf(activeLetter);
      playSound('success');
      showToast(`Downloaded acceptance letter PDF for ${activeLetter.studentName}.`);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      showToast('Error exporting PDF. Please check console.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrint = () => {
    playSound('droplet');
    window.print();
  };

  const handleDeleteLetter = (id: string, name: string) => {
    if (!confirm(`Delete acceptance letter record for ${name}?`)) return;
    playSound('trash');
    deleteAcceptanceLetter(id);
    const updated = getStoredAcceptanceLetters();
    setLetters(updated);
    if (activeLetter.id === id && updated.length > 0) {
      setActiveLetter(updated[0]);
    }
    showToast(`Deleted acceptance letter.`);
  };

  const filteredStudents = cachedStudents.filter(s => 
    s.fullName.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.matricNumber.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.institution.toLowerCase().includes(studentSearch.toLowerCase())
  ).slice(0, 5);

  return (
    <div className="space-y-6">
      
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#1e1730] border border-purple-500/80 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="bg-[#181326] border border-[#3b2d5a] rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono uppercase tracking-widest text-[#c084fc]">
              Letterhead Generator
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
              SIWES &amp; Industrial Training
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Official Acceptance Letters
          </h2>
          <p className="text-xs text-[#94a3b8] mt-1 max-w-xl">
            Generate and export official Orbit Space acceptance letters formatted on the official purple letterhead background.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleCreateNew}
            className="px-3.5 py-2 rounded-xl bg-[#2a1d47] hover:bg-[#3d2c64] text-[#c084fc] border border-[#523d7a] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Letter</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf || !activeLetter.studentName}
            className="btn-purple px-4 py-2 rounded-xl text-xs font-semibold text-white flex items-center gap-1.5 shadow-lg disabled:opacity-50 cursor-pointer"
          >
            {isGeneratingPdf ? (
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>Download Official PDF</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-[#140f22] hover:bg-[#251b3c] border border-[#3d2e5e] text-xs text-white flex items-center gap-1.5 transition-all cursor-pointer"
            title="Print Letterhead Document"
          >
            <Printer className="w-3.5 h-3.5 text-[#c084fc]" />
            <span className="hidden sm:inline">Print</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Form on Left, Live Letterhead Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Form & Student Picker (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Quick Student Auto-Fill from SheetDB */}
          {cachedStudents.length > 0 && (
            <div className="bg-[#181326] border border-[#382b54] rounded-2xl p-4 shadow-md">
              <label className="block text-xs font-semibold text-white mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-[#a855f7]" />
                  <span>Auto-fill from Student Directory</span>
                </span>
                <span className="text-[10px] text-[#94a3b8] font-normal">
                  {cachedStudents.length} students loaded
                </span>
              </label>

              <div className="relative mb-2">
                <Search className="w-3.5 h-3.5 text-[#94a3b8] absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search student by name or matric..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full bg-[#120e1e] border border-[#342750] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-[#716a82] focus:outline-none focus:border-[#a855f7]"
                />
              </div>

              {studentSearch.trim() && (
                <div className="space-y-1 mt-2 max-h-36 overflow-y-auto">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((s) => (
                      <button
                        key={s.studentId}
                        onClick={() => {
                          handleSelectStudent(s);
                          setStudentSearch('');
                        }}
                        className="w-full text-left p-2 rounded-lg bg-[#201736] hover:bg-[#2f224e] border border-[#3c2a5e] text-xs text-white flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <div>
                          <p className="font-semibold text-white text-[11px]">{s.fullName}</p>
                          <p className="text-[10px] text-[#94a3b8]">{s.institution} • {s.program}</p>
                        </div>
                        <span className="text-[10px] font-mono text-[#c084fc] bg-[#120e1e] px-1.5 py-0.5 rounded">
                          {s.matricNumber || 'Select'}
                        </span>
                      </button>
                    ))
                  ) : (
                    <p className="text-[11px] text-[#94a3b8] py-1 text-center">No student matched</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Letter Editor Form */}
          <div className="bg-[#181326] border border-[#382b54] rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#2d2244] pb-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#a855f7]" />
                <span>Letter Information &amp; Variables</span>
              </h3>
              <button
                onClick={handleSave}
                className="px-3 py-1 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 text-xs font-medium cursor-pointer"
              >
                Save Changes
              </button>
            </div>

            {/* Student Name */}
            <div>
              <label className="block text-[11px] font-medium text-[#c4c7c8] mb-1">
                Student Full Name *
              </label>
              <input
                type="text"
                value={activeLetter.studentName}
                onChange={(e) => handleFieldChange('studentName', e.target.value)}
                placeholder="e.g. Babatunde Lawal"
                className="w-full bg-[#120e1e] border border-[#342750] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#a855f7]"
              />
            </div>

            {/* Matric & Academic Level */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-[#c4c7c8] mb-1">
                  Matric / Reg No *
                </label>
                <input
                  type="text"
                  value={activeLetter.matricNumber}
                  onChange={(e) => handleFieldChange('matricNumber', e.target.value)}
                  placeholder="e.g. 20/52HA045"
                  className="w-full bg-[#120e1e] border border-[#342750] rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#a855f7]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#c4c7c8] mb-1">
                  Academic Level
                </label>
                <input
                  type="text"
                  value={activeLetter.academicLevel}
                  onChange={(e) => handleFieldChange('academicLevel', e.target.value)}
                  placeholder="e.g. 300 Level / ND II"
                  className="w-full bg-[#120e1e] border border-[#342750] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#a855f7]"
                />
              </div>
            </div>

            {/* Institution */}
            <div>
              <label className="block text-[11px] font-medium text-[#c4c7c8] mb-1">
                Tertiary Institution *
              </label>
              <input
                type="text"
                list="institutions-list"
                value={activeLetter.institution}
                onChange={(e) => handleFieldChange('institution', e.target.value)}
                placeholder="e.g. University of Ilorin (UNILORIN)"
                className="w-full bg-[#120e1e] border border-[#342750] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#a855f7]"
              />
              <datalist id="institutions-list">
                {COMMON_INSTITUTIONS.map((inst, i) => (
                  <option key={i} value={inst} />
                ))}
              </datalist>
            </div>

            {/* Department */}
            <div>
              <label className="block text-[11px] font-medium text-[#c4c7c8] mb-1">
                Department *
              </label>
              <input
                type="text"
                list="departments-list"
                value={activeLetter.department}
                onChange={(e) => handleFieldChange('department', e.target.value)}
                placeholder="e.g. Department of Computer Science"
                className="w-full bg-[#120e1e] border border-[#342750] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#a855f7]"
              />
              <datalist id="departments-list">
                {COMMON_DEPARTMENTS.map((dept, i) => (
                  <option key={i} value={dept} />
                ))}
              </datalist>
            </div>

            {/* Assigned Tech Track */}
            <div>
              <label className="block text-[11px] font-medium text-[#c4c7c8] mb-1">
                Assigned Tech Track / Placement Role *
              </label>
              <select
                value={activeLetter.programTrack}
                onChange={(e) => handleFieldChange('programTrack', e.target.value)}
                className="w-full bg-[#120e1e] border border-[#342750] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#a855f7]"
              >
                {TECH_TRACKS.map((track, i) => (
                  <option key={i} value={track}>{track}</option>
                ))}
              </select>
            </div>

            {/* Duration & Start Date */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-[#c4c7c8] mb-1">
                  Attachment Duration
                </label>
                <select
                  value={activeLetter.duration}
                  onChange={(e) => handleFieldChange('duration', e.target.value)}
                  className="w-full bg-[#120e1e] border border-[#342750] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#a855f7]"
                >
                  <option value="6 Months">6 Months</option>
                  <option value="3 Months">3 Months</option>
                  <option value="4 Months">4 Months</option>
                  <option value="1 Year">1 Year</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#c4c7c8] mb-1">
                  Commencement Date
                </label>
                <input
                  type="text"
                  value={activeLetter.startDate}
                  onChange={(e) => handleFieldChange('startDate', e.target.value)}
                  placeholder="e.g. Monday, 6th Oct, 2026"
                  className="w-full bg-[#120e1e] border border-[#342750] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#a855f7]"
                />
              </div>
            </div>

            {/* Ref Number & Issue Date */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-medium text-[#c4c7c8] mb-1">
                  Official Ref Number
                </label>
                <input
                  type="text"
                  value={activeLetter.refNumber}
                  onChange={(e) => handleFieldChange('refNumber', e.target.value)}
                  className="w-full bg-[#120e1e] border border-[#342750] rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#a855f7]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#c4c7c8] mb-1">
                  Date Issued
                </label>
                <input
                  type="text"
                  value={activeLetter.issueDate}
                  onChange={(e) => handleFieldChange('issueDate', e.target.value)}
                  className="w-full bg-[#120e1e] border border-[#342750] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#a855f7]"
                />
              </div>
            </div>

          </div>

          {/* Recently Issued Letters History */}
          <div className="bg-[#181326] border border-[#382b54] rounded-2xl p-4 shadow-md">
            <h4 className="text-xs font-semibold text-white mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#a855f7]" />
                <span>Saved Letters Archive ({letters.length})</span>
              </span>
            </h4>

            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {letters.map((letItem) => {
                const isCurrent = letItem.id === activeLetter.id;
                return (
                  <div
                    key={letItem.id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                      isCurrent 
                        ? 'bg-[#291d44] border-[#a855f7]/60 text-white' 
                        : 'bg-[#120e1e] border-[#2c2242] text-[#c4c7c8] hover:bg-[#1a142b]'
                    }`}
                  >
                    <button
                      onClick={() => {
                        playSound('droplet');
                        setActiveLetter(letItem);
                      }}
                      className="text-left flex-1 cursor-pointer"
                    >
                      <p className="font-semibold text-xs text-white">{letItem.studentName || 'Untitled Student'}</p>
                      <p className="text-[10px] text-[#94a3b8]">{letItem.institution} • {letItem.refNumber}</p>
                    </button>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => {
                          setActiveLetter(letItem);
                          handleDownloadPdf();
                        }}
                        className="p-1 rounded bg-[#1e1533] hover:bg-[#342456] text-[#c084fc] cursor-pointer"
                        title="Download PDF"
                      >
                        <Download className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteLetter(letItem.id, letItem.studentName)}
                        className="p-1 rounded bg-[#1e1533] hover:bg-rose-950 text-rose-400 cursor-pointer"
                        title="Delete record"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column: High-Fidelity Letterhead Preview (7 cols on lg) */}
        <div className="lg:col-span-7">
          <div className="sticky top-6 space-y-3">
            
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-white">Live Official Letterhead Preview</span>
                <span className="text-[10px] font-mono bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded">
                  A4 Ratio
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadPdf}
                  disabled={isGeneratingPdf || !activeLetter.studentName}
                  className="px-3 py-1 rounded-lg bg-[#a855f7] hover:bg-[#9333ea] text-white text-xs font-semibold flex items-center gap-1 shadow-md cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-3 h-3" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>

            {/* Document Container with zoom / shadow */}
            <div className="rounded-2xl border border-[#3b2d5a] p-3 sm:p-5 bg-[#0e0c15] shadow-2xl overflow-x-auto">
              <div className="min-w-[580px] max-w-[794px] mx-auto rounded-lg overflow-hidden border border-gray-300 shadow-md">
                <AcceptanceLetterDocument letter={activeLetter} />
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
