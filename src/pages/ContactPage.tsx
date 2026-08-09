import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, Loader2 } from 'lucide-react';
import { useForm, ValidationError } from '@formspree/react';

export const ContactPage: React.FC = () => {
  const [state, handleSubmit] = useForm('xzepdwwp');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Course Inquiry',
    message: '',
  });

  const openWhatsApp = () => {
    const text = encodeURIComponent(`Hello Orbit Space! My name is ${formData.name || 'a visitor'}. ${formData.message || 'I have an inquiry about Orbit Space Ilorin.'}`);
    window.open(`https://wa.me/2348123456789?text=${text}`, '_blank');
  };

  return (
    <div className="py-20 max-w-[1200px] mx-auto px-6 bg-[#141313] min-h-screen">
      {/* Header */}
      <div className="max-w-3xl mb-12">
        <span className="text-xs font-semibold text-[#c4c7c8] tracking-[0.2em] uppercase mb-2 block">
          Get in Touch
        </span>
        <h1 className="text-4xl md:text-5xl font-light text-[#ffffff] font-serif leading-tight mb-4">
          Visit Us or Send an Inquiry
        </h1>
        <p className="text-base text-[#c4c7c8] font-light leading-relaxed">
          Have questions about courses, SIWES placements, or booking a desk pass? We are located in the heart of Ilorin and always ready to help.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Contact Details & Info */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#1c1b1b] rounded-[20px] p-6 sm:p-8 border border-[#353434] shadow-2xl space-y-6">
            <h2 className="text-xl font-serif text-[#ffffff] font-light">
              Campus & Contact Information
            </h2>

            <div className="flex items-start gap-4 text-xs text-[#c4c7c8] font-light">
              <div className="p-2.5 rounded-full bg-[#201f1f] border border-[#353434] text-[#ffffff] shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <span className="font-medium text-[#ffffff] block mb-0.5">Physical Campus Address</span>
                <p className="leading-relaxed">
                  Orbit Space, After Tanke Junction, behind Armour House, Ilorin, Kwara State.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 text-xs text-[#c4c7c8] font-light">
              <div className="p-2.5 rounded-full bg-[#201f1f] border border-[#353434] text-[#ffffff] shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <span className="font-medium text-[#ffffff] block mb-0.5">Phone & WhatsApp Support</span>
                <p>+234 812 345 6789 / +234 803 123 4567</p>
              </div>
            </div>

            <div className="flex items-start gap-4 text-xs text-[#c4c7c8] font-light">
              <div className="p-2.5 rounded-full bg-[#201f1f] border border-[#353434] text-[#ffffff] shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <span className="font-medium text-[#ffffff] block mb-0.5">Email Address</span>
                <p>admissions@orbitspace.ng / hello@orbitspace.ng</p>
              </div>
            </div>

            <div className="flex items-start gap-4 text-xs text-[#c4c7c8] font-light">
              <div className="p-2.5 rounded-full bg-[#201f1f] border border-[#353434] text-[#ffffff] shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span className="font-medium text-[#ffffff] block mb-0.5">Operating Hours</span>
                <p>Academy & Desk Pass: Monday – Saturday (8:00 AM – 8:00 PM)</p>
                <p className="font-mono text-[10px] tracking-wider uppercase text-emerald-400 mt-1">24/7 Access available for Monthly Workspace Pass Holders</p>
              </div>
            </div>

            <div className="pt-4 border-t border-[#353434]">
              <button
                onClick={openWhatsApp}
                className="w-full py-3.5 rounded-full bg-emerald-700 hover:bg-emerald-600 text-[#ffffff] font-medium text-xs flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.99c-.002 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c-.001 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662a11.87 11.87 0 005.707 1.456h.005c6.554 0 11.89-5.335 11.893-11.893 0-3.177-1.238-6.163-3.498-8.414" />
                </svg>
                <span>Chat Directly on WhatsApp</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Form */}
        <div className="lg:col-span-7 bg-[#1c1b1b] rounded-[20px] p-6 sm:p-8 border border-[#353434] shadow-2xl">
          {state.succeeded ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-serif text-[#ffffff]">Message Received!</h3>
              <p className="text-xs text-[#c4c7c8] font-light max-w-md mx-auto leading-relaxed">
                Thank you for reaching out to Orbit Space Ilorin. Our admissions team will contact you shortly via email or WhatsApp.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="text-xl font-serif text-[#ffffff] font-light mb-4">
                Send Us a Message
              </h2>

              <input type="hidden" name="_subject" value={`Orbit Space Contact: ${formData.subject}`} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-light text-[#c4c7c8] mb-1">Your Name *</label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    placeholder="e.g., Segun Adebayo"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#201f1f] border border-[#353434] rounded-full px-4 py-2 text-xs text-[#e5e2e1] focus:outline-none focus:border-[#8e9192]"
                  />
                  <ValidationError prefix="Name" field="name" errors={state.errors} className="text-xs text-rose-400 mt-1" />
                </div>

                <div>
                  <label className="block text-xs font-light text-[#c4c7c8] mb-1">Phone / WhatsApp Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    required
                    placeholder="e.g., 08123456789"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-[#201f1f] border border-[#353434] rounded-full px-4 py-2 text-xs text-[#e5e2e1] focus:outline-none focus:border-[#8e9192]"
                  />
                  <ValidationError prefix="Phone" field="phone" errors={state.errors} className="text-xs text-rose-400 mt-1" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-light text-[#c4c7c8] mb-1">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  required
                  placeholder="e.g., segun@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-[#201f1f] border border-[#353434] rounded-full px-4 py-2 text-xs text-[#e5e2e1] focus:outline-none focus:border-[#8e9192]"
                />
                <ValidationError prefix="Email" field="email" errors={state.errors} className="text-xs text-rose-400 mt-1" />
              </div>

              <div>
                <label className="block text-xs font-light text-[#c4c7c8] mb-1">Inquiry Subject</label>
                <select
                  name="subject"
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full bg-[#201f1f] border border-[#353434] rounded-full px-4 py-2 text-xs text-[#e5e2e1] focus:outline-none focus:border-[#8e9192]"
                >
                  <option value="Course Inquiry">Course / Academy Enrollment</option>
                  <option value="SIWES Placement">SIWES Industrial Training Placement</option>
                  <option value="Workspace Booking">Workspace / Coworking Desk Pass</option>
                  <option value="General Inquiry">General Question / Campus Tour</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-light text-[#c4c7c8] mb-1">Your Message or Question *</label>
                <textarea
                  name="message"
                  id="message"
                  required
                  rows={4}
                  placeholder="Tell us what you would like to know..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-[#201f1f] border border-[#353434] rounded-[16px] p-4 text-xs text-[#e5e2e1] focus:outline-none focus:border-[#8e9192]"
                ></textarea>
                <ValidationError prefix="Message" field="message" errors={state.errors} className="text-xs text-rose-400 mt-1" />
              </div>

              <button
                type="submit"
                disabled={state.submitting}
                className="w-full py-3.5 rounded-full bg-[#ffffff] hover:bg-[#e2e2e2] text-[#141313] font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50"
              >
                {state.submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting to Formspree...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Inquiry</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
