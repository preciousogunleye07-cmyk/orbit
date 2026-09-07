import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, CheckCircle2, Orbit, ArrowRight, Loader2, CreditCard, ShieldCheck } from 'lucide-react';
import { useForm, ValidationError } from '@formspree/react';
import { Course, MoniepointPaymentRequest } from '../../types';
import { COURSES_DATA } from '../../data/coursesData';
import { playSound } from '../../utils/soundEffects';
import { MoniepointCheckoutModal } from './MoniepointCheckoutModal';

interface EnrollModalProps {
  course?: Course;
  onClose: () => void;
}

export const EnrollModal: React.FC<EnrollModalProps> = ({ course: initialCourse, onClose }) => {
  const [state, handleSubmit] = useForm('xzepdwwp');
  const [selectedCourseId, setSelectedCourseId] = useState<string>(initialCourse?.id || COURSES_DATA[0].id);
  const [paymentPlan, setPaymentPlan] = useState<'full' | 'deposit'>('full');
  const [showMoniepointCheckout, setShowMoniepointCheckout] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    learningMode: 'Physical Hub (Ilorin)',
    cohort: 'Upcoming Cohort (Next Month)'
  });

  const activeCourse = COURSES_DATA.find((c) => c.id === selectedCourseId) || COURSES_DATA[0];

  // Calculate numeric fee from string (e.g. "₦165,000" -> 165000)
  const fullAmountNumeric = parseInt(activeCourse.priceFormatted.replace(/\D/g, ''), 10) || 165000;
  const depositAmountNumeric = Math.round(fullAmountNumeric * 0.5);
  const payableAmount = paymentPlan === 'full' ? fullAmountNumeric : depositAmountNumeric;
  const formattedPayableAmount = `₦${payableAmount.toLocaleString()}`;

  useEffect(() => {
    if (state.succeeded) {
      playSound('success');
    }
  }, [state.succeeded]);

  const handleLaunchMoniepoint = () => {
    if (!formData.fullName.trim() || !formData.phone.trim()) {
      playSound('error');
      // Highlight required inputs or alert
      const nameInput = document.getElementById('enroll-fullname');
      if (nameInput) nameInput.focus();
      return;
    }
    playSound('toggle');
    setShowMoniepointCheckout(true);
  };

  const moniepointPaymentRequest: MoniepointPaymentRequest = {
    title: `${activeCourse.title} (${paymentPlan === 'full' ? 'Full Tuition' : '50% Initial Deposit'})`,
    subtitle: `${activeCourse.duration} · ${formData.learningMode}`,
    itemType: 'course',
    itemId: activeCourse.id,
    amount: payableAmount,
    formattedAmount: formattedPayableAmount,
    customerName: formData.fullName,
    customerEmail: formData.email,
    customerPhone: formData.phone,
    meta: {
      courseId: activeCourse.id,
      learningMode: formData.learningMode,
      paymentPlan
    }
  };

  if (showMoniepointCheckout) {
    return (
      <MoniepointCheckoutModal
        payment={moniepointPaymentRequest}
        onClose={() => setShowMoniepointCheckout(false)}
        onSuccess={() => {
          // Success handled in modal
        }}
      />
    );
  }

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
        className="bg-[#181524] border border-[#332d47] rounded-[24px] w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 relative shadow-2xl shadow-purple-950/40"
      >
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-[#1f1b2e] text-[#c4c7c8] hover:text-[#a855f7] hover:bg-[#332d47] transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {!state.succeeded ? (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#7c3aed] to-[#a855f7] flex items-center justify-center text-[#ffffff] shadow-sm">
                <Orbit className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-mono tracking-widest text-[#a855f7] uppercase font-semibold">
                Orbit Academy Enrollment
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-serif text-[#ffffff] font-normal mb-1">
              Enroll in Orbit Space
            </h3>
            <p className="text-xs text-[#c4c7c8] font-light mb-6">
              Start your practical tech journey at our Ilorin campus with Moniepoint payment or offline reservation.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="hidden" name="_subject" value={`Orbit Academy Enrollment: ${activeCourse.title}`} />
              <input type="hidden" name="learningMode" value={formData.learningMode} />
              <input type="hidden" name="paymentPlan" value={paymentPlan} />

              {/* Course Selector */}
              <div>
                <label className="block text-xs font-light text-[#c4c7c8] mb-1.5">
                  Select Program
                </label>
                <select
                  name="program"
                  id="enroll-program"
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full bg-[#1f1b2e] border border-[#332d47] rounded-full px-4 py-2.5 text-xs text-[#e2e8f0] focus:outline-none focus:border-[#8b5cf6]"
                >
                  {COURSES_DATA.map((c) => (
                    <option key={c.id} value={c.id} className="bg-[#181524]">
                      {c.title} — ({c.duration} | {c.priceFormatted})
                    </option>
                  ))}
                </select>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-light text-[#c4c7c8] mb-1.5">
                  Full Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  id="enroll-fullname"
                  required
                  placeholder="e.g. Amina Oladipo"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full bg-[#1f1b2e] border border-[#332d47] rounded-full px-4 py-2.5 text-xs text-[#e2e8f0] placeholder-[#8e9192] focus:outline-none focus:border-[#8b5cf6]"
                />
                <ValidationError prefix="Full Name" field="fullName" errors={state.errors} className="text-xs text-rose-400 mt-1" />
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-light text-[#c4c7c8] mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="enroll-email"
                    placeholder="amina@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#1f1b2e] border border-[#332d47] rounded-full px-4 py-2.5 text-xs text-[#e2e8f0] placeholder-[#8e9192] focus:outline-none focus:border-[#8b5cf6]"
                  />
                  <ValidationError prefix="Email" field="email" errors={state.errors} className="text-xs text-rose-400 mt-1" />
                </div>
                <div>
                  <label className="block text-xs font-light text-[#c4c7c8] mb-1.5">
                    Phone / WhatsApp Number <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    id="enroll-phone"
                    required
                    placeholder="08012345678"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-[#1f1b2e] border border-[#332d47] rounded-full px-4 py-2.5 text-xs text-[#e2e8f0] placeholder-[#8e9192] focus:outline-none focus:border-[#8b5cf6]"
                  />
                  <ValidationError prefix="Phone" field="phone" errors={state.errors} className="text-xs text-rose-400 mt-1" />
                </div>
              </div>

              {/* Learning Mode */}
              <div>
                <label className="block text-xs font-light text-[#c4c7c8] mb-1.5">
                  Learning Preference
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['Physical Hub (Ilorin)', 'Hybrid Mode'].map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setFormData({ ...formData, learningMode: mode })}
                      className={`py-2 px-3 rounded-full border text-xs font-medium text-center transition-all ${
                        formData.learningMode === mode
                          ? 'bg-[#8b5cf6] border-[#8b5cf6] text-[#ffffff] shadow-md'
                          : 'bg-[#1f1b2e] border-[#332d47] text-[#c4c7c8]'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Plan Selection */}
              <div>
                <label className="block text-xs font-light text-[#c4c7c8] mb-1.5">
                  Select Payment Option
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      playSound('toggle');
                      setPaymentPlan('full');
                    }}
                    className={`p-3 rounded-[16px] border text-left transition-all ${
                      paymentPlan === 'full'
                        ? 'bg-[#241f38] border-[#a855f7] ring-1 ring-[#a855f7]'
                        : 'bg-[#1f1b2e] border-[#332d47] hover:border-[#4b4366]'
                    }`}
                  >
                    <p className="text-[11px] font-semibold text-white">Full Payment</p>
                    <p className="text-sm font-serif text-[#a855f7] font-bold mt-0.5">{activeCourse.priceFormatted}</p>
                    <p className="text-[10px] text-emerald-400 mt-0.5">Instant Seat Confirmation</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      playSound('toggle');
                      setPaymentPlan('deposit');
                    }}
                    className={`p-3 rounded-[16px] border text-left transition-all ${
                      paymentPlan === 'deposit'
                        ? 'bg-[#241f38] border-[#a855f7] ring-1 ring-[#a855f7]'
                        : 'bg-[#1f1b2e] border-[#332d47] hover:border-[#4b4366]'
                    }`}
                  >
                    <p className="text-[11px] font-semibold text-white">50% Initial Deposit</p>
                    <p className="text-sm font-serif text-[#a855f7] font-bold mt-0.5">₦{depositAmountNumeric.toLocaleString()}</p>
                    <p className="text-[10px] text-[#c4c7c8] mt-0.5">Balance in 4 weeks</p>
                  </button>
                </div>
              </div>

              {/* Moniepoint Direct Pay CTA Banner */}
              <div className="p-4 bg-gradient-to-r from-[#172554]/30 via-[#1f1b2e] to-[#2e1065]/30 rounded-[18px] border border-[#3b82f6]/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#60a5fa]" />
                    <span className="text-xs font-semibold text-white">Pay via Moniepoint MFB</span>
                  </div>
                  <span className="text-xs font-serif font-bold text-[#60a5fa]">{formattedPayableAmount}</span>
                </div>
                <p className="text-[11px] text-[#9ca3af] font-light leading-relaxed">
                  Pay instantly with Debit Card, Direct Bank Transfer (Virtual Account), USSD (*5573#), or Moniepoint POS and receive an official verified receipt.
                </p>
                <button
                  type="button"
                  onClick={handleLaunchMoniepoint}
                  className="w-full py-3 rounded-full bg-gradient-to-r from-[#2563eb] to-[#7c3aed] hover:from-[#1d4ed8] hover:to-[#6d28d9] text-white font-semibold text-xs shadow-lg shadow-blue-900/30 transition-all flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Pay {formattedPayableAmount} with Moniepoint</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Secondary Submit Button */}
              <div className="pt-2 text-center">
                <button
                  type="submit"
                  disabled={state.submitting}
                  className="w-full py-3 rounded-full bg-[#1f1b2e] hover:bg-[#28233a] border border-[#332d47] text-[#c4c7c8] hover:text-white font-medium text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {state.submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting Offline Application...</span>
                    </>
                  ) : (
                    <span>Submit Application & Pay Later at Hub</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-purple-950/80 text-[#a855f7] border border-[#8b5cf6] flex items-center justify-center mx-auto mb-4 shadow-lg">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-serif text-[#ffffff] font-normal mb-2">
              Application Received!
            </h3>
            <p className="text-xs text-[#c4c7c8] font-light mb-6 max-w-md mx-auto leading-relaxed">
              Thank you <strong className="text-[#ffffff]">{formData.fullName || 'for enrolling'}</strong>. Our admissions coordinator at Orbit Space Ilorin will contact you via WhatsApp ({formData.phone && <strong className="text-[#a855f7]">{formData.phone}</strong>}) within 24 hours with schedule & payment instructions.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={handleLaunchMoniepoint}
                className="w-full sm:w-auto px-6 py-2.5 rounded-full btn-purple font-semibold text-xs flex items-center justify-center gap-1.5"
              >
                <CreditCard className="w-4 h-4" />
                <span>Pay Fee via Moniepoint</span>
              </button>
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#1f1b2e] hover:bg-[#332d47] text-[#c4c7c8] text-xs"
              >
                Done
              </button>
            </div>
          </div>
        )}

      </motion.div>
    </motion.div>
  );
};
