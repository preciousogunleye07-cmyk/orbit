import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Lock, 
  Mail, 
  ArrowLeft, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck, 
  UserCheck, 
  Key,
  BookOpen
} from 'lucide-react';
import { TutorAuthService } from '../../services/tutorAuthService';
import { TutorProfile } from '../../services/tutorService';
import { OrbitLogo } from '../../components/OrbitLogo';
import { playSound } from '../../utils/soundEffects';

interface TeacherLoginPageProps {
  onLoginSuccess: (tutor: TutorProfile) => void;
  onNavigateHome: () => void;
}

export const TeacherLoginPage: React.FC<TeacherLoginPageProps> = ({
  onLoginSuccess,
  onNavigateHome
}) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [rateLimitInfo, setRateLimitInfo] = useState<{ isLocked: boolean; remainingSeconds: number }>({
    isLocked: false,
    remainingSeconds: 0
  });

  useEffect(() => {
    document.title = 'Faculty & Teacher Portal Sign In | Orbit Space';
    const info = TutorAuthService.getRateLimitInfo();
    setRateLimitInfo(info);

    if (info.isLocked) {
      const interval = setInterval(() => {
        const fresh = TutorAuthService.getRateLimitInfo();
        setRateLimitInfo(fresh);
        if (!fresh.isLocked) clearInterval(interval);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!identifier.trim() || !password.trim()) {
      setErrorMessage('Please enter both your email or username and password.');
      playSound('error');
      return;
    }

    setIsLoading(true);
    playSound('click');

    try {
      const tutor = await TutorAuthService.loginTeacher(identifier, password);
      playSound('success');
      onLoginSuccess(tutor);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Authentication failed. Please verify your credentials.');
      playSound('error');
      const freshRateLimit = TutorAuthService.getRateLimitInfo();
      setRateLimitInfo(freshRateLimit);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0b14] text-white flex flex-col justify-between py-10 px-4 relative overflow-hidden">
      {/* Background glowing effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-purple-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Bar with Brand and Back Link */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between z-10">
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-2 text-xs font-mono text-[#a49faf] hover:text-white transition cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Orbit Space</span>
        </button>

        <div className="flex items-center gap-2">
          <OrbitLogo size={24} color="#a855f7" />
          <span className="text-xs font-bold font-sans tracking-tight text-white">
            oRbit<span className="text-purple-400 font-light">.faculty</span>
          </span>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto my-auto z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="bg-[#141120] border border-[#2e2842] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6"
        >
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-300 mx-auto shadow-inner">
              <UserCheck className="w-7 h-7" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Teacher & Faculty Portal
            </h1>
            <p className="text-xs text-[#a49faf] leading-relaxed">
              Sign in with your assigned faculty credentials to view courses, teaching hours, students, and supervision records.
            </p>
          </div>

          {/* Rate Limit Warning */}
          {rateLimitInfo.isLocked && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                Security Lockout: Too many failed attempts. Please retry in {rateLimitInfo.remainingSeconds} seconds.
              </span>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && !rateLimitInfo.isLocked && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#c4c0d4] flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-purple-400" />
                <span>Email or Login Identifier</span>
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. lawal@orbitspace.academy"
                disabled={rateLimitInfo.isLocked || isLoading}
                className="w-full px-4 py-2.5 rounded-xl bg-[#1b172a] border border-[#342d4a] text-sm text-white placeholder-[#78728a] focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition disabled:opacity-50"
                autoComplete="username"
                required
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium text-[#c4c0d4] flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-purple-400" />
                  <span>Password</span>
                </label>
                <span className="text-[10px] text-purple-400 font-mono">
                  Assigned by Admin
                </span>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                disabled={rateLimitInfo.isLocked || isLoading}
                className="w-full px-4 py-2.5 rounded-xl bg-[#1b172a] border border-[#342d4a] text-sm text-white placeholder-[#78728a] focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition disabled:opacity-50 font-mono"
                autoComplete="current-password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || rateLimitInfo.isLocked}
              className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-950/50 transition cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <Key className="w-4 h-4" />
                  <span>Sign In as Faculty</span>
                </>
              )}
            </button>
          </form>

          {/* Admin Notice */}
          <div className="pt-4 border-t border-[#251f38] text-center space-y-1">
            <p className="text-[11px] text-[#8e8a9f]">
              Need access or forgot your credentials?
            </p>
            <p className="text-[11px] text-purple-300 font-mono">
              Teacher accounts are administered by Orbit Space Academic Administration.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Footer Info */}
      <div className="text-center text-[11px] text-[#6d687c] font-mono z-10">
        Orbit Space Academy • Faculty Data Management System
      </div>
    </div>
  );
};
