import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  ShieldCheck, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  KeyRound, 
  Sparkles, 
  ArrowLeft, 
  Info, 
  CheckCircle2, 
  BookOpen, 
  PenTool, 
  AlertCircle,
  GraduationCap,
  Shield,
  Layers,
  HelpCircle,
  User
} from 'lucide-react';
import { 
  loginSubAdmin, 
  SubAdminUser,
  getSubAdminSession
} from '../../services/subAdminService';
import { OrbitLogo } from '../../components/OrbitLogo';
import { playSound } from '../../utils/soundEffects';
import { getSubAdminRouteSlug } from '../../utils/subAdminRoute';

interface SubAdminLoginPageProps {
  onSuccess: (user: SubAdminUser) => void;
  onNavigateHome: () => void;
}

export const SubAdminLoginPage: React.FC<SubAdminLoginPageProps> = ({
  onSuccess,
  onNavigateHome
}) => {
  const [email, setEmail] = useState('editor@orbitspace.academy');
  const [passkey, setPasskey] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDemoHelp, setShowDemoHelp] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    playSound('pulse');

    try {
      const user = await loginSubAdmin(email, passkey);
      playSound('success');
      onSuccess(user);
    } catch (err: any) {
      playSound('error');
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090b10] text-[#e2e8f0] flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 relative overflow-hidden selection:bg-emerald-500/20 selection:text-emerald-300">
      
      {/* Ambient background glows */}
      <div className="absolute -top-32 left-1/4 w-[500px] h-[500px] bg-emerald-600/10 blur-[160px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-32 right-1/4 w-[600px] h-[500px] bg-cyan-600/10 blur-[180px] rounded-full pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-purple-900/10 blur-[190px] rounded-full pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-5xl relative z-10 my-8">
        
        {/* Top Header Navigation */}
        <div className="flex items-center justify-between mb-6 px-2">
          <button
            onClick={() => {
              playSound('release');
              onNavigateHome();
            }}
            className="inline-flex items-center gap-2 text-xs font-mono text-[#94a3b8] hover:text-white transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Return to Public Website</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/40 text-emerald-300 text-[10px] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Remote Faculty Node Active</span>
            </span>
          </div>
        </div>

        {/* Dual-Panel Card */}
        <div className="bg-[#0f1422]/95 border border-[#1f293d] rounded-[28px] shadow-2xl overflow-hidden backdrop-blur-md grid grid-cols-1 lg:grid-cols-12">
          
          {/* LEFT PANEL: Academic Editorial Showcase */}
          <div className="lg:col-span-5 bg-gradient-to-b from-[#131b2e] via-[#0f1626] to-[#0c101c] p-6 sm:p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-[#1e273d] flex flex-col justify-between relative overflow-hidden">
            
            {/* Background pattern */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-3xl pointer-events-none rounded-full" />

            <div className="space-y-6 relative z-10">
              {/* Brand Header */}
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#1a233a] border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-inner">
                  <OrbitLogo size={26} color="#38bdf8" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5 font-sans">
                    oRbit<span className="text-cyan-400 font-normal">.space</span>
                  </h3>
                  <span className="text-[10px] font-mono text-[#7dd3fc] tracking-wider uppercase">
                    Academic Editorial Board
                  </span>
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-2 pt-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-cyan-950/80 border border-cyan-800/50 text-cyan-300 text-[10px] font-mono">
                  <PenTool className="w-3 h-3 text-cyan-400" />
                  <span>Sub-Admin & Publishing Studio</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
                  Curate & Publish Student Technical Research
                </h1>
                <p className="text-xs text-[#94a3b8] font-light leading-relaxed">
                  Authorized editorial portal for faculty leads, project supervisors, and academic fellows to author whitepapers, review capstone architectures, and update class timetables.
                </p>
              </div>

              {/* Key Highlights */}
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3 bg-[#151d30]/60 p-3 rounded-xl border border-[#222e47]">
                  <div className="w-7 h-7 rounded-lg bg-emerald-950/80 border border-emerald-800/50 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white">Bi-Directional Credential Linking</h4>
                    <p className="text-[11px] text-[#94a3b8] font-light">
                      Published engineering articles automatically integrate into the student's authenticated certificate view.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-[#151d30]/60 p-3 rounded-xl border border-[#222e47]">
                  <div className="w-7 h-7 rounded-lg bg-cyan-950/80 border border-cyan-800/50 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                    <GraduationCap className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white">Faculty & Tutor Attribution</h4>
                    <p className="text-[11px] text-[#94a3b8] font-light">
                      Supervising tutors, lab instructors, and project guides are formally credited on every research paper.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-[#151d30]/60 p-3 rounded-xl border border-[#222e47]">
                  <div className="w-7 h-7 rounded-lg bg-purple-950/80 border border-purple-800/50 flex items-center justify-center text-purple-400 shrink-0 mt-0.5">
                    <Shield className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white">Role-Separated Safeguards</h4>
                    <p className="text-[11px] text-[#94a3b8] font-light">
                      Certificate revocations and deletions remain strictly quarantined to Super-Admin master authorization.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Confidentiality Indicator */}
            <div className="pt-6 mt-6 border-t border-[#1e273d] flex items-center justify-between text-[11px] text-[#64748b] font-mono">
              <span>Security Tier: Editorial Remote</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Encrypted Vault</span>
              </span>
            </div>
          </div>

          {/* RIGHT PANEL: Distinctive Sub-Admin Sign-In Form */}
          <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
            <div className="space-y-6">
              
              {/* Form Title */}
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                    Academic Staff Authentication
                  </h2>
                  <button
                    type="button"
                    onClick={() => setShowDemoHelp(!showDemoHelp)}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono transition-colors"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Credentials Help</span>
                  </button>
                </div>
                <p className="text-xs text-[#94a3b8] mt-1 font-light">
                  Sign in using your authorized Orbit Space staff passkey or institutional address.
                </p>
              </div>

              {/* Single Sub-Admin Account Indicator */}
              <div className="bg-[#131929] border border-[#1e273d] p-3.5 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">Sub-Administrator</div>
                    <div className="text-[11px] font-mono text-cyan-400">editor@orbitspace.academy</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                  Remote Access Permitted
                </span>
              </div>

              {/* Demo credentials helper alert */}
              <AnimatePresence>
                {showDemoHelp && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-[#131b2e] border border-cyan-800/50 p-3.5 rounded-xl text-xs space-y-1.5 text-[#94a3b8]">
                      <div className="flex items-center gap-2 text-cyan-300 font-semibold">
                        <Sparkles className="w-4 h-4 text-cyan-400" />
                        <span>Sub-Admin Credentials:</span>
                      </div>
                      <div className="font-mono text-[11px] space-y-1 text-slate-300">
                        <div>• Email: <span className="text-white">editor@orbitspace.academy</span></div>
                        <div>• Passkey: <span className="text-emerald-400 font-semibold">OrbitEditor2026!</span></div>
                        <div className="text-[10px] text-[#64748b] pt-1">
                          (Controlled remotely via this gateway URL. Super-Admin is managed natively inside AI Studio).
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error Alert */}
              {error && (
                <div className="bg-rose-950/70 border border-rose-800/80 p-3.5 rounded-xl flex items-start gap-2.5 text-xs text-rose-300">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                  <span className="leading-relaxed">{error}</span>
                </div>
              )}

              {/* Authentication Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Email input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-cyan-400" />
                      Institutional Staff Email
                    </span>
                    <span className="text-[10px] text-[#64748b] font-mono">domain: @orbitspace.academy</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. editor@orbitspace.academy"
                    className="w-full bg-[#0a0d14] border border-[#1e273d] focus:border-cyan-500 text-white text-xs rounded-xl px-4 py-3 outline-none font-mono transition-all"
                  />
                </div>

                {/* Passkey input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-cyan-400" />
                      Cryptographic Security Passkey
                    </span>
                    <span className="text-[10px] text-[#64748b] font-mono">SHA-256 Verified</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={passkey}
                      onChange={(e) => setPasskey(e.target.value)}
                      placeholder="Enter assigned editorial passkey..."
                      className="w-full bg-[#0a0d14] border border-[#1e273d] focus:border-cyan-500 text-white text-xs rounded-xl px-4 py-3 pr-11 outline-none font-mono transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Security Policy */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-[#94a3b8] hover:text-white">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-[#1e273d] bg-[#0a0d14] text-cyan-500 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                    />
                    <span>Persist session token on this terminal</span>
                  </label>

                  <span className="text-[10px] font-mono text-[#64748b]">
                    5 attempts / 15m lockout
                  </span>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 shadow-lg shadow-cyan-950/50 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  id="btn-subadmin-login-submit"
                >
                  <KeyRound className="w-4 h-4 text-cyan-200" />
                  <span>{loading ? 'Authenticating Staff Cryptographic Token...' : 'Authorize & Enter Editorial Studio'}</span>
                </button>
              </form>
            </div>

            {/* Secret Gateway Privacy Notice */}
            <div className="mt-6 pt-5 border-t border-[#1e273d] space-y-2">
              <div className="bg-[#0a0d14] rounded-xl p-3 border border-[#1e273d] flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-[10px] text-[#94a3b8] leading-relaxed">
                  <strong className="text-white">Obfuscated Gateway Notice</strong>: This extension path is private. Do not disclose this route in public communications or search index configurations.
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
