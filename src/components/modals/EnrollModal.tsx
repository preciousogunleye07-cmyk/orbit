import React, { useState } from 'react';
import { X, CheckCircle2, Orbit, ArrowRight, Loader2 } from 'lucide-react';
import { useForm, ValidationError } from '@formspree/react';
import { Course } from '../../types';
import { COURSES_DATA } from '../../data/coursesData';

interface EnrollModalProps {
  course?: Course;
  onClose: () => void;
}

export const EnrollModal: React.FC<EnrollModalProps> = ({ course: initialCourse, onClose }) => {
  const [state, handleSubmit] = useForm('xzepdwwp');
  const [selectedCourseId, setSelectedCourseId] = useState<string>(initialCourse?.id || COURSES_DATA[0].id);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    learningMode: 'Physical Hub (Ilorin)',
    cohort: 'Upcoming Cohort (Next Month)',
    paymentPlan: 'Full Payment (5% Discount)'
  });

  const activeCourse = COURSES_DATA.find((c) => c.id === selectedCourseId) || COURSES_DATA[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#100e17]/85 backdrop-blur-md animate-fade-in">
      <div className="bg-[#181524] border border-[#332d47] rounded-[24px] w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 relative shadow-2xl shadow-purple-950/40">
        
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
              Start your practical tech journey at our Ilorin campus or hybrid track.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="hidden" name="_subject" value={`Orbit Academy Enrollment: ${activeCourse.title}`} />
              <input type="hidden" name="learningMode" value={formData.learningMode} />

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
                    <option key={c.id} value={c.title} className="bg-[#181524]">
                      {c.title} — ({c.duration} | {c.priceFormatted})
                    </option>
                  ))}
                </select>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-light text-[#c4c7c8] mb-1.5">
                  Full Name
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
                    required
                    placeholder="amina@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#1f1b2e] border border-[#332d47] rounded-full px-4 py-2.5 text-xs text-[#e2e8f0] placeholder-[#8e9192] focus:outline-none focus:border-[#8b5cf6]"
                  />
                  <ValidationError prefix="Email" field="email" errors={state.errors} className="text-xs text-rose-400 mt-1" />
                </div>
                <div>
                  <label className="block text-xs font-light text-[#c4c7c8] mb-1.5">
                    Phone / WhatsApp Number
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

              {/* Course Price Summary Card */}
              <div className="p-4 bg-[#1f1b2e] rounded-[16px] border border-[#332d47] flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-[#a855f7] font-semibold">Selected Course Fee</p>
                  <p className="text-sm font-serif font-normal text-[#ffffff]">{activeCourse.title}</p>
                </div>
                <p className="text-base font-serif text-[#a855f7] font-semibold">{activeCourse.priceFormatted}</p>
              </div>

              <button
                type="submit"
                disabled={state.submitting}
                className="w-full py-3.5 rounded-full btn-purple font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {state.submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting Application...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Enrollment Application</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
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
            <button
              onClick={onClose}
              className="btn-purple px-8 py-3 rounded-full font-semibold text-xs"
            >
              Done
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
