import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, CheckCircle2, Building, ArrowRight, Loader2 } from 'lucide-react';
import { useForm, ValidationError } from '@formspree/react';
import { WORKSPACE_PLANS } from '../../data/workspaceData';

interface WorkspaceModalProps {
  planId?: string;
  onClose: () => void;
}

export const WorkspaceModal: React.FC<WorkspaceModalProps> = ({ planId: initialPlanId, onClose }) => {
  const [state, handleSubmit] = useForm('xzepdwwp');
  const [selectedPlanId, setSelectedPlanId] = useState<string>(initialPlanId || WORKSPACE_PLANS[0].id);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    startDate: new Date().toISOString().split('T')[0],
    deskPreference: 'Hot Desk (Standard)'
  });

  const activePlan = WORKSPACE_PLANS.find((p) => p.id === selectedPlanId) || WORKSPACE_PLANS[0];

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
                <Building className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-mono tracking-widest text-[#c4c7c8] uppercase">
                Orbit Workspace Pass
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-serif text-[#ffffff] font-light mb-1">
              Reserve Your Workspace Desk
            </h3>
            <p className="text-xs text-[#c4c7c8] font-light mb-6">
              A space built for work in Ilorin with reliable power & high-speed internet.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="hidden" name="_subject" value={`Orbit Space Workspace Pass: ${activePlan.name}`} />
              <input type="hidden" name="passDuration" value={activePlan.name} />

              {/* Pass Plan Selector */}
              <div>
                <label className="block text-xs font-light text-[#c4c7c8] mb-2">
                  Select Workspace Pass Duration
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {WORKSPACE_PLANS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedPlanId(p.id)}
                      className={`p-3 rounded-[12px] border text-center transition-all ${
                        selectedPlanId === p.id
                          ? 'bg-[#ffffff] border-[#ffffff] text-[#141313]'
                          : 'bg-[#201f1f] border-[#353434] text-[#c4c7c8] hover:border-[#8e9192]'
                      }`}
                    >
                      <p className="text-xs font-medium">{p.name}</p>
                      <p className={`text-sm font-serif mt-1 ${selectedPlanId === p.id ? 'text-[#141313]' : 'text-[#ffffff]'}`}>{p.formattedPrice}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-light text-[#c4c7c8] mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  id="workspace-fullname"
                  required
                  placeholder="e.g. Kayode Adebayo"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full bg-[#201f1f] border border-[#353434] rounded-full px-4 py-2.5 text-xs text-[#e5e2e1] placeholder-[#8e9192] focus:outline-none focus:border-[#8e9192]"
                />
                <ValidationError prefix="Full Name" field="fullName" errors={state.errors} className="text-xs text-rose-400 mt-1" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-light text-[#c4c7c8] mb-1.5">
                    Phone / WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    id="workspace-phone"
                    required
                    placeholder="08012345678"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-[#201f1f] border border-[#353434] rounded-full px-4 py-2.5 text-xs text-[#e5e2e1] placeholder-[#8e9192] focus:outline-none focus:border-[#8e9192]"
                  />
                  <ValidationError prefix="Phone" field="phone" errors={state.errors} className="text-xs text-rose-400 mt-1" />
                </div>

                <div>
                  <label className="block text-xs font-light text-[#c4c7c8] mb-1.5">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    id="workspace-startdate"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full bg-[#201f1f] border border-[#353434] rounded-full px-4 py-2.5 text-xs text-[#e5e2e1] focus:outline-none focus:border-[#8e9192]"
                  />
                  <ValidationError prefix="Start Date" field="startDate" errors={state.errors} className="text-xs text-rose-400 mt-1" />
                </div>
              </div>

              <div className="p-4 bg-[#201f1f] rounded-[16px] border border-[#353434] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#c4c7c8] font-light">Selected Pass:</span>
                  <span className="font-medium text-[#ffffff]">{activePlan.name}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#c4c7c8] font-light">Included Amenities:</span>
                  <span className="text-emerald-400 font-medium">24/7 Power, Fiber Wifi, AC</span>
                </div>
                <div className="flex items-center justify-between text-xs pt-2 border-t border-[#353434]">
                  <span className="font-light text-[#c4c7c8]">Total Price:</span>
                  <span className="text-base font-serif text-[#ffffff]">{activePlan.formattedPrice}</span>
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
                    <span>Reserving Pass...</span>
                  </>
                ) : (
                  <>
                    <span>Reserve Pass Now</span>
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
              Workspace Pass Reserved!
            </h3>
            <p className="text-xs text-[#c4c7c8] font-light mb-6 max-w-md mx-auto leading-relaxed">
              Your <strong className="text-[#ffffff]">{activePlan.name}</strong> ({activePlan.formattedPrice}) reservation has been logged for <strong className="text-[#ffffff]">{formData.startDate}</strong>. Show up at Orbit Space Ilorin and pay at front desk or via transfer!
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
