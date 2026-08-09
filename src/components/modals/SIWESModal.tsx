import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, CheckCircle2, GraduationCap, ArrowRight, Loader2 } from 'lucide-react';
import { useForm, ValidationError } from '@formspree/react';

interface SIWESModalProps {
  onClose: () => void;
}

export const SIWESModal: React.FC<SIWESModalProps> = ({ onClose }) => {
  const [state, handleSubmit] = useForm('xzepdwwp');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    institution: 'University of Ilorin (UNILORIN)',
    department: '',
    siwesDuration: '6 Months',
    techTrack: 'Frontend Development',
    startMonth: 'Next Month'
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#100e17]/85 backdrop-blur-md"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="liquid-glass-card rounded-[24px] w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 relative shadow-2xl"
      >
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-[#201f1f] text-[#c4c7c8] hover:text-[#ffffff] hover:bg-[#353434] transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {!state.succeeded ? (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-[#201f1f] border border-[#353434] flex items-center justify-center text-[#ffffff]">
                <GraduationCap className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-mono tracking-widest text-[#c4c7c8] uppercase">
                SIWES Placement Application
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-serif text-[#ffffff] font-light mb-1">
              Apply for SIWES Placement
            </h3>
            <p className="text-xs text-[#c4c7c8] font-light mb-6">
              Turn your industrial training into practical skill development at Orbit Space Ilorin.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="hidden" name="_subject" value={`Orbit Space SIWES Application: ${formData.techTrack}`} />

              <div>
                <label className="block text-xs font-light text-[#c4c7c8] mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  id="siwes-fullname"
                  required
                  placeholder="e.g. Babatunde Lawal"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full bg-[#201f1f] border border-[#353434] rounded-full px-4 py-2.5 text-xs text-[#e5e2e1] placeholder-[#8e9192] focus:outline-none focus:border-[#8e9192]"
                />
                <ValidationError prefix="Full Name" field="fullName" errors={state.errors} className="text-xs text-rose-400 mt-1" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-light text-[#c4c7c8] mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="siwes-email"
                    required
                    placeholder="student@unilorin.edu.ng"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#201f1f] border border-[#353434] rounded-full px-4 py-2.5 text-xs text-[#e5e2e1] placeholder-[#8e9192] focus:outline-none focus:border-[#8e9192]"
                  />
                  <ValidationError prefix="Email" field="email" errors={state.errors} className="text-xs text-rose-400 mt-1" />
                </div>
                <div>
                  <label className="block text-xs font-light text-[#c4c7c8] mb-1.5">
                    Phone / WhatsApp
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    id="siwes-phone"
                    required
                    placeholder="08012345678"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-[#201f1f] border border-[#353434] rounded-full px-4 py-2.5 text-xs text-[#e5e2e1] placeholder-[#8e9192] focus:outline-none focus:border-[#8e9192]"
                  />
                  <ValidationError prefix="Phone" field="phone" errors={state.errors} className="text-xs text-rose-400 mt-1" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-light text-[#c4c7c8] mb-1.5">
                    Tertiary Institution
                  </label>
                  <input
                    type="text"
                    name="institution"
                    id="siwes-institution"
                    required
                    placeholder="e.g. UNILORIN, Kwara Poly, KWASU"
                    value={formData.institution}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                    className="w-full bg-[#201f1f] border border-[#353434] rounded-full px-4 py-2.5 text-xs text-[#e5e2e1] placeholder-[#8e9192] focus:outline-none focus:border-[#8e9192]"
                  />
                  <ValidationError prefix="Institution" field="institution" errors={state.errors} className="text-xs text-rose-400 mt-1" />
                </div>
                <div>
                  <label className="block text-xs font-light text-[#c4c7c8] mb-1.5">
                    Department / Course
                  </label>
                  <input
                    type="text"
                    name="department"
                    id="siwes-department"
                    required
                    placeholder="e.g. Computer Science"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full bg-[#201f1f] border border-[#353434] rounded-full px-4 py-2.5 text-xs text-[#e5e2e1] placeholder-[#8e9192] focus:outline-none focus:border-[#8e9192]"
                  />
                  <ValidationError prefix="Department" field="department" errors={state.errors} className="text-xs text-rose-400 mt-1" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-light text-[#c4c7c8] mb-1.5">
                    SIWES Duration
                  </label>
                  <select
                    name="siwesDuration"
                    id="siwes-duration"
                    value={formData.siwesDuration}
                    onChange={(e) => setFormData({ ...formData, siwesDuration: e.target.value })}
                    className="w-full bg-[#201f1f] border border-[#353434] rounded-full px-4 py-2.5 text-xs text-[#e5e2e1] focus:outline-none focus:border-[#8e9192]"
                  >
                    <option value="3 Months" className="bg-[#1c1b1b]">3 Months</option>
                    <option value="6 Months" className="bg-[#1c1b1b]">6 Months</option>
                    <option value="1 Year" className="bg-[#1c1b1b]">1 Year (IT)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-light text-[#c4c7c8] mb-1.5">
                    Preferred Tech Track
                  </label>
                  <select
                    name="techTrack"
                    id="siwes-track"
                    value={formData.techTrack}
                    onChange={(e) => setFormData({ ...formData, techTrack: e.target.value })}
                    className="w-full bg-[#201f1f] border border-[#353434] rounded-full px-4 py-2.5 text-xs text-[#e5e2e1] focus:outline-none focus:border-[#8e9192]"
                  >
                    <option value="Frontend Development" className="bg-[#1c1b1b]">Frontend Development</option>
                    <option value="Backend Development" className="bg-[#1c1b1b]">Backend Development</option>
                    <option value="Full Stack Development" className="bg-[#1c1b1b]">Full Stack Development</option>
                    <option value="Cybersecurity" className="bg-[#1c1b1b]">Cybersecurity</option>
                    <option value="Data Analysis" className="bg-[#1c1b1b]">Data Analysis</option>
                    <option value="UI/UX Design" className="bg-[#1c1b1b]">UI/UX Design</option>
                    <option value="AI Web Development" className="bg-[#1c1b1b]">AI Web Development</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={state.submitting}
                className="w-full py-3.5 rounded-full font-semibold text-xs bg-[#ffffff] hover:bg-[#e2e2e2] text-[#141313] shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {state.submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting Application...</span>
                  </>
                ) : (
                  <>
                    <span>Submit SIWES Application</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-serif text-[#ffffff] font-light mb-2">
              SIWES Application Received!
            </h3>
            <p className="text-xs text-[#c4c7c8] font-light mb-6 max-w-md mx-auto leading-relaxed">
              We have received your SIWES application for <strong className="text-[#ffffff]">{formData.techTrack}</strong> ({formData.siwesDuration}). Our SIWES coordinator will issue your acceptance letter after quick verification on WhatsApp.
            </p>
            <button
              onClick={onClose}
              className="px-8 py-3 rounded-full bg-[#ffffff] hover:bg-[#e2e2e2] text-[#141313] font-semibold text-xs"
            >
              Done
            </button>
          </div>
        )}

      </motion.div>
    </motion.div>
  );
};
