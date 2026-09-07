import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, Lock, Laptop, Terminal, ArrowLeft, Check, Copy, WifiOff, Globe, AlertTriangle, Play } from 'lucide-react';
import { getAdminSecurityStatus, setDevPreviewUnlocked } from '../../utils/adminSecurity';
import { OrbitLogo } from '../OrbitLogo';
import { playSound } from '../../utils/soundEffects';

interface LocalAdminSecurityGateProps {
  onNavigateHome: () => void;
  onUnlocked?: () => void;
}

export const LocalAdminSecurityGate: React.FC<LocalAdminSecurityGateProps> = ({
  onNavigateHome,
  onUnlocked
}) => {
  const status = getAdminSecurityStatus();
  const [copiedCommand, setCopiedCommand] = useState(false);

  const localCommand = 'npm run admin:local';

  const handleCopyCommand = () => {
    playSound('pulse');
    navigator.clipboard.writeText(localCommand);
    setCopiedCommand(true);
    setTimeout(() => setCopiedCommand(false), 2000);
  };

  const handleUnlockDevPreview = () => {
    playSound('sparkle');
    setDevPreviewUnlocked(true);
    if (onUnlocked) {
      onUnlocked();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-[#100e17] text-[#e2e8f0] flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-red-950/20 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[300px] bg-purple-950/15 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-xl relative z-10">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-950/60 border border-red-800/40 text-red-300 text-xs font-mono mb-4">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <span>Security Boundary Active: 403 Forbidden</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-normal text-white font-serif tracking-tight mb-2">
            Localhost-Only Admin Console
          </h1>
          <p className="text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
            The Orbit Space Administrative Console and certificate issuance tools are strictly restricted to local execution on the authorized administrator laptop.
          </p>
        </div>

        {/* Security Diagnostic Card */}
        <div className="bg-[#181524]/90 border border-[#332d47] rounded-2xl p-5 sm:p-6 shadow-2xl backdrop-blur-md mb-6">
          <div className="flex items-start gap-4 mb-5 pb-5 border-b border-[#332d47]/70">
            <div className="p-2.5 rounded-xl bg-red-950/50 border border-red-800/30 text-red-400 shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white mb-1">
                Access Prohibited from Remote Hostname
              </h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                This request originated from <code className="px-1.5 py-0.5 rounded bg-black/40 text-amber-300 font-mono text-[11px]">{status.hostname || 'remote domain'}</code>. Public internet domains, remote cloud servers, and local Wi-Fi IP addresses cannot access administrative functions.
              </p>
            </div>
          </div>

          {/* Security Rules Checklist */}
          <div className="space-y-2.5 text-xs mb-6">
            <div className="flex items-center gap-2.5 text-zinc-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              <span>Loopback socket required: <strong className="text-white font-mono">127.0.0.1:3000</strong> or <strong className="text-white font-mono">localhost</strong></span>
            </div>
            <div className="flex items-center gap-2.5 text-zinc-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              <span>Binding to <code className="text-white font-mono">0.0.0.0</code> disabled for administrative operations</span>
            </div>
            <div className="flex items-center gap-2.5 text-zinc-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              <span>Public cloud deployment & Vercel edge routes automatically blocked</span>
            </div>
            <div className="flex items-center gap-2.5 text-zinc-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              <span>Wi-Fi / LAN IP connections rejected by application security guard</span>
            </div>
          </div>

          {/* Instructions to Run Locally */}
          <div className="bg-[#100e17] rounded-xl p-4 border border-[#332d47]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-mono flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-[#c084fc]" />
                How to launch locally on your laptop:
              </span>
              <button
                onClick={handleCopyCommand}
                className="text-[11px] font-mono text-[#c084fc] hover:text-white flex items-center gap-1 transition-colors"
                title="Copy command"
              >
                {copiedCommand ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <div className="font-mono text-xs text-amber-200 bg-black/50 p-2.5 rounded-lg border border-white/5 flex items-center justify-between">
              <code>{localCommand}</code>
              <span className="text-[10px] text-zinc-500">runs on 127.0.0.1:3000</span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-2">
              Then navigate to <code className="text-purple-300 font-mono">http://localhost:3000/admin</code> on your machine.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
          <button
            onClick={() => {
              playSound('pulse');
              onNavigateHome();
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-white text-[#100e17] font-semibold text-xs flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors cursor-pointer min-h-[44px]"
            id="btn-return-home-security"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Public Website</span>
          </button>

          {/* Dev Preview Unlock for AI Studio Session */}
          {status.isDevPreview && (
            <button
              onClick={handleUnlockDevPreview}
              className="w-full sm:w-auto px-4 py-2.5 rounded-full bg-[#1f1b2e] hover:bg-[#2b253f] border border-[#332d47] text-[#c084fc] font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-[44px]"
              title="Temporary preview unlock for this AI Studio developer session"
              id="btn-unlock-dev-preview"
            >
              <Play className="w-3.5 h-3.5 text-[#a855f7]" />
              <span>Unlock for AI Studio Testing</span>
            </button>
          )}
        </div>

        {/* Footer Note */}
        <div className="text-center mt-6">
          <p className="text-[11px] text-zinc-500 font-mono">
            Orbit Space Academia • Security Policy RFC-3986
          </p>
        </div>
      </div>
    </div>
  );
};
