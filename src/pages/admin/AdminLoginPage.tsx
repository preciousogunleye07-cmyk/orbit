import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Eye, EyeOff, Lock, Mail, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { loginAdmin } from '../../services/certificateService';
import { OrbitLogo } from '../../components/OrbitLogo';
import { playSound } from '../../utils/soundEffects';

interface AdminLoginPageProps {
  onSuccess: () => void;
  onNavigateHome: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onSuccess, onNavigateHome }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await loginAdmin(email, password);
      playSound('ready');
      onSuccess();
    } catch (err: any) {
      playSound('error');
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#100e17] flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background glow accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-purple-900/20 blur-[130px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <button
            onClick={() => {
              playSound('pulse');
              onNavigateHome();
            }}
            className="inline-flex items-center gap-3 group cursor-pointer text-left mb-6 transition-transform hover:scale-105"
            title="Return to Orbit Space Homepage"
          >
            <OrbitLogo size={36} color="#c084fc" className="shrink-0" />
            <div className="flex flex-col">
              <span className="text-xl font-semibold text-[#ffffff] tracking-tight font-sans">
                oRbit<span className="text-[#a855f7] font-light">.space</span>
              </span>
              <span className="text-[10px] text-[#a855f7] font-mono tracking-widest uppercase">
                Academia Portal
              </span>
            </div>
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1f1b2e] border border-[#332d47] text-[#c084fc] text-xs font-mono mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-[#a855f7]" />
            <span>Admin Portal</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-serif text-[#ffffff] font-normal tracking-tight">
            Certificate Authentication
          </h1>
          <p className="text-xs sm:text-sm text-[#c4c7c8] font-light mt-2 max-w-xs mx-auto leading-relaxed">
            Sign in to manage and verify official certificates issued by Orbit Space.
          </p>
        </div>

        {/* Login Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-[#181524] rounded-[24px] p-6 sm:p-8 border border-[#332d47] shadow-2xl shadow-purple-950/30"
        >
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-200 text-xs flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-medium text-[#e2e8f0] mb-2">
                Administrator Email / Username
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#a855f7] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@orbitspace.academy"
                  className="w-full bg-[#100e17] border border-[#332d47] focus:border-[#a855f7] focus:ring-1 focus:ring-[#a855f7] text-[#ffffff] text-sm rounded-xl pl-10 pr-4 py-3 transition-colors outline-none font-sans"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-medium text-[#e2e8f0]">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#a855f7] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-[#100e17] border border-[#332d47] focus:border-[#a855f7] focus:ring-1 focus:ring-[#a855f7] text-[#ffffff] text-sm rounded-xl pl-10 pr-11 py-3 transition-colors outline-none font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#c4c7c8] hover:text-[#ffffff] p-1 rounded-md transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-[#c4c7c8] hover:text-[#ffffff]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded bg-[#100e17] border-[#332d47] text-[#a855f7] focus:ring-[#a855f7] accent-[#a855f7]"
                />
                <span>Remember session</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-purple py-3.5 px-6 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-lg disabled:opacity-60 transition-all min-h-[48px]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Admin Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Back to main site link */}
        <div className="text-center mt-6">
          <button
            onClick={onNavigateHome}
            className="text-xs text-[#c4c7c8] hover:text-[#a855f7] transition-colors"
          >
            ← Back to Orbit Space Main Site
          </button>
        </div>

      </div>
    </div>
  );
};
