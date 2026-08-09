import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, MapPin, Phone, CheckCircle2, Mail, Send, Loader2 } from 'lucide-react';
import { useForm, ValidationError } from '@formspree/react';

interface ContactModalProps {
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ onClose }) => {
  const [state, handleSubmit] = useForm('xzepdwwp');
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const openWhatsApp = () => {
    const text = encodeURIComponent("Hello Orbit Space! I have a question regarding courses/workspace.");
    window.open(`https://wa.me/2348123456789?text=${text}`, '_blank');
  };

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
        className="bg-[#181524] border border-[#332d47] text-[#e2e8f0] rounded-[24px] w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 sm:p-8 relative shadow-2xl shadow-purple-950/40"
      >
        
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-5 right-5 p-2 rounded-full bg-[#1f1b2e] text-[#c4c7c8] hover:text-[#a855f7] hover:bg-[#332d47] transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {!state.succeeded ? (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-[#1f1b2e] border border-[#332d47] flex items-center justify-center text-[#a855f7]">
                <Mail className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-mono tracking-widest text-[#a855f7] uppercase font-semibold">
                Get In Touch
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-serif text-[#ffffff] font-normal mb-1">
              Contact Orbit Space
            </h3>
            <p className="text-xs text-[#c4c7c8] font-light mb-6">
              Get in touch with our team in Ilorin for inquiries, campus visits, or support.
            </p>

            <div className="space-y-3 mb-6 p-4 bg-[#1f1b2e] rounded-[16px] border border-[#332d47] text-xs">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#a855f7] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-[#ffffff]">Campus Address</p>
                  <p className="text-[#c4c7c8] font-light">Orbit Space, After Tanke Junction, behind Armour House, Ilorin, Kwara State.</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 pt-2 border-t border-[#332d47]">
                <Phone className="w-4 h-4 text-[#a855f7] shrink-0" />
                <div>
                  <p className="font-semibold text-[#ffffff]">Phone & WhatsApp</p>
                  <p className="text-[#c4c7c8] font-light">+234 812 345 6789</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="hidden" name="_subject" value="Orbit Space Modal Contact Inquiry" />
              <div>
                <label className="block text-xs font-light text-[#c4c7c8] mb-1.5">
                  Your Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="modal-name"
                  required
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#1f1b2e] border border-[#332d47] rounded-full px-4 py-2.5 text-xs text-[#e2e8f0] placeholder-[#8e9192] focus:outline-none focus:border-[#8b5cf6]"
                />
                <ValidationError prefix="Name" field="name" errors={state.errors} className="text-xs text-rose-400 mt-1" />
              </div>

              <div>
                <label className="block text-xs font-light text-[#c4c7c8] mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  id="modal-email"
                  required
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-[#1f1b2e] border border-[#332d47] rounded-full px-4 py-2.5 text-xs text-[#e2e8f0] placeholder-[#8e9192] focus:outline-none focus:border-[#8b5cf6]"
                />
                <ValidationError prefix="Email" field="email" errors={state.errors} className="text-xs text-rose-400 mt-1" />
              </div>

              <div>
                <label className="block text-xs font-light text-[#c4c7c8] mb-1.5">
                  Message
                </label>
                <textarea
                  name="message"
                  id="modal-message"
                  rows={3}
                  required
                  placeholder="How can we help you?"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-[#1f1b2e] border border-[#332d47] rounded-2xl px-4 py-2.5 text-xs text-[#e2e8f0] placeholder-[#8e9192] focus:outline-none focus:border-[#8b5cf6]"
                />
                <ValidationError prefix="Message" field="message" errors={state.errors} className="text-xs text-rose-400 mt-1" />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={state.submitting}
                  className="flex-1 py-3 rounded-full font-semibold text-xs btn-purple shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {state.submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={openWhatsApp}
                  className="py-3 px-4 rounded-full font-semibold text-xs bg-[#1f1b2e] hover:bg-[#332d47] border border-[#332d47] text-[#e2e8f0] hover:text-[#a855f7] flex items-center gap-1.5 transition-all"
                >
                  <svg className="w-4 h-4 fill-current text-emerald-400 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.99c-.002 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c-.001 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662a11.87 11.87 0 005.707 1.456h.005c6.554 0 11.89-5.335 11.893-11.893 0-3.177-1.238-6.163-3.498-8.414" />
                  </svg>
                  <span>WhatsApp</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-serif text-[#ffffff] font-normal mb-2">Message Sent!</h3>
            <p className="text-xs text-[#c4c7c8] font-light mb-6">
              Thank you {formData.name || 'for contacting us'}. We will get back to you shortly.
            </p>
            <button
              onClick={onClose}
              className="btn-purple px-8 py-3 rounded-full text-xs font-semibold"
            >
              Close
            </button>
          </div>
        )}

      </motion.div>
    </motion.div>
  );
};

