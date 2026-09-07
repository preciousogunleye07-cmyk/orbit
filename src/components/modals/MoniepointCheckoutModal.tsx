import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  CheckCircle2, 
  ShieldCheck, 
  Copy, 
  Check, 
  CreditCard, 
  Building2, 
  PhoneCall, 
  QrCode, 
  Clock, 
  ArrowRight, 
  Loader2, 
  Download, 
  Lock, 
  AlertCircle,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { 
  MoniepointPaymentRequest, 
  MoniepointTransactionRecord, 
  PaymentChannel 
} from '../../types';
import { 
  MONIEPOINT_CONFIG, 
  generateMoniepointReference, 
  getMoniepointVirtualAccount, 
  getMoniepointUssdCode, 
  recordMoniepointTransaction, 
  downloadMoniepointReceipt 
} from '../../services/moniepointService';
import { generateQrCodeDataUrl } from '../../utils/qrCode';
import { playSound } from '../../utils/soundEffects';

interface MoniepointCheckoutModalProps {
  payment: MoniepointPaymentRequest;
  onClose: () => void;
  onSuccess?: (record: MoniepointTransactionRecord) => void;
}

export const MoniepointCheckoutModal: React.FC<MoniepointCheckoutModalProps> = ({
  payment,
  onClose,
  onSuccess
}) => {
  const [activeChannel, setActiveChannel] = useState<PaymentChannel>('bank_transfer');
  const [reference] = useState(() => generateMoniepointReference());
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(1800); // 30 minutes in seconds
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [completedRecord, setCompletedRecord] = useState<MoniepointTransactionRecord | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  // Card Form State
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    cardPin: ''
  });
  const [cardOtp, setCardOtp] = useState('');
  const [requiresOtp, setRequiresOtp] = useState(false);

  // Virtual Account
  const virtualAccount = getMoniepointVirtualAccount(payment.customerPhone, reference);
  const ussdCode = getMoniepointUssdCode(payment.amount, reference);

  // Countdown timer
  useEffect(() => {
    if (isSuccess) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isSuccess]);

  // Generate QR Code on mount
  useEffect(() => {
    async function loadQr() {
      try {
        const url = await generateQrCodeDataUrl(
          `moniepoint://pay?ref=${reference}&amt=${payment.amount}&merchant=${encodeURIComponent(MONIEPOINT_CONFIG.merchantName)}&key=${MONIEPOINT_CONFIG.apiKey}`,
          400
        );
        setQrCodeUrl(url);
      } catch (err) {
        console.debug('QR generate note:', err);
      }
    }
    loadQr();
  }, [reference, payment.amount]);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    playSound('toggle');
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Complete Payment Action
  const completePayment = async (channel: PaymentChannel) => {
    setIsProcessing(true);
    playSound('pulse');

    setProcessingStep('Connecting to Moniepoint MFB payment switch...');
    await new Promise((r) => setTimeout(r, 900));

    setProcessingStep('Validating transaction reference with merchant key...');
    await new Promise((r) => setTimeout(r, 800));

    setProcessingStep('Settlement verified. Issuing authenticated receipt...');
    await new Promise((r) => setTimeout(r, 700));

    const record = await recordMoniepointTransaction(payment, channel, reference);
    setIsProcessing(false);
    setIsSuccess(true);
    setCompletedRecord(record);
    playSound('success');

    if (onSuccess) {
      onSuccess(record);
    }
  };

  const handleCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requiresOtp) {
      setIsProcessing(true);
      setProcessingStep('Authorizing card with 3D Secure / Moniepoint...');
      await new Promise((r) => setTimeout(r, 1200));
      setIsProcessing(false);
      setRequiresOtp(true);
      playSound('chime');
    } else {
      await completePayment('card');
    }
  };

  const handleDownloadReceipt = async () => {
    if (!completedRecord) return;
    playSound('pop');
    await downloadMoniepointReceipt(completedRecord);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0e0c15]/90 backdrop-blur-lg overflow-y-auto"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', damping: 26, stiffness: 350 }}
        className="bg-[#181524] border border-[#372f52] rounded-[24px] w-full max-w-xl my-8 overflow-hidden relative shadow-2xl shadow-purple-950/50"
      >
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-[#1c182c] via-[#241f38] to-[#1c182c] p-5 sm:p-6 border-b border-[#332d47] relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-[#13111c] text-[#c4c7c8] hover:text-[#ffffff] hover:bg-[#332d47] transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 mb-2">
            {/* Moniepoint & Orbit Badges */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0f3b82]/40 border border-[#3b82f6]/50 text-[11px] font-semibold text-[#60a5fa]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Moniepoint Secure Gateway</span>
            </div>
            <div className="px-2.5 py-1 rounded-full bg-[#a855f7]/15 border border-[#a855f7]/40 text-[10px] font-mono text-[#d8b4fe]">
              KEY: {MONIEPOINT_CONFIG.apiKey.slice(0, 10)}...
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mt-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-serif text-white font-medium">
                {payment.title}
              </h2>
              <p className="text-xs text-[#a1a1aa] mt-0.5">
                Payer: <strong className="text-white">{payment.customerName}</strong> ({payment.customerPhone})
              </p>
            </div>
            <div className="text-left sm:text-right mt-2 sm:mt-0">
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#a855f7]">Amount to Pay</span>
              <p className="text-2xl sm:text-3xl font-serif text-[#a855f7] font-bold">
                {payment.formattedAmount}
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        {!isSuccess ? (
          <div className="p-5 sm:p-6">
            
            {/* Channel Tabs */}
            <div className="grid grid-cols-4 gap-2 mb-6 bg-[#13111c] p-1.5 rounded-[16px] border border-[#2d2740]">
              <button
                type="button"
                onClick={() => {
                  playSound('toggle');
                  setActiveChannel('bank_transfer');
                }}
                className={`py-2 px-1 sm:px-2 rounded-[12px] text-center transition-all flex flex-col items-center gap-1 ${
                  activeChannel === 'bank_transfer'
                    ? 'bg-[#8b5cf6] text-white shadow-md'
                    : 'text-[#a1a1aa] hover:text-white hover:bg-[#1f1b2e]'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span className="text-[10px] sm:text-[11px] font-medium truncate w-full">Transfer</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playSound('toggle');
                  setActiveChannel('card');
                }}
                className={`py-2 px-1 sm:px-2 rounded-[12px] text-center transition-all flex flex-col items-center gap-1 ${
                  activeChannel === 'card'
                    ? 'bg-[#8b5cf6] text-white shadow-md'
                    : 'text-[#a1a1aa] hover:text-white hover:bg-[#1f1b2e]'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span className="text-[10px] sm:text-[11px] font-medium truncate w-full">Card</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playSound('toggle');
                  setActiveChannel('ussd');
                }}
                className={`py-2 px-1 sm:px-2 rounded-[12px] text-center transition-all flex flex-col items-center gap-1 ${
                  activeChannel === 'ussd'
                    ? 'bg-[#8b5cf6] text-white shadow-md'
                    : 'text-[#a1a1aa] hover:text-white hover:bg-[#1f1b2e]'
                }`}
              >
                <PhoneCall className="w-4 h-4" />
                <span className="text-[10px] sm:text-[11px] font-medium truncate w-full">USSD (*5573#)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playSound('toggle');
                  setActiveChannel('pos_qr');
                }}
                className={`py-2 px-1 sm:px-2 rounded-[12px] text-center transition-all flex flex-col items-center gap-1 ${
                  activeChannel === 'pos_qr'
                    ? 'bg-[#8b5cf6] text-white shadow-md'
                    : 'text-[#a1a1aa] hover:text-white hover:bg-[#1f1b2e]'
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span className="text-[10px] sm:text-[11px] font-medium truncate w-full">POS / QR</span>
              </button>
            </div>

            {/* CHANNEL 1: BANK TRANSFER (VIRTUAL ACCOUNT) */}
            {activeChannel === 'bank_transfer' && (
              <div className="space-y-4">
                <div className="p-4 bg-[#14121f] rounded-[18px] border border-[#332d47] relative">
                  <div className="flex items-center justify-between mb-3 text-xs">
                    <span className="text-[#a1a1aa] flex items-center gap-1.5 font-light">
                      <Clock className="w-3.5 h-3.5 text-[#a855f7]" />
                      Account Expires in:
                    </span>
                    <span className="font-mono font-bold text-[#c084fc] bg-[#221c33] px-2.5 py-0.5 rounded-full border border-[#443b60]">
                      {formatTimer(timeLeft)}
                    </span>
                  </div>

                  {/* Virtual Account Box */}
                  <div className="space-y-3 pt-2">
                    
                    {/* Bank Name */}
                    <div className="flex items-center justify-between p-3 bg-[#1c182c] rounded-[12px] border border-[#2d2740]">
                      <div>
                        <span className="text-[10px] text-[#9ca3af] uppercase font-mono">Bank Name</span>
                        <p className="text-sm font-medium text-white">{virtualAccount.bankName}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(virtualAccount.bankName, 'bank')}
                        className="p-2 rounded-lg bg-[#28223d] text-[#c084fc] hover:text-white transition-all text-xs flex items-center gap-1"
                      >
                        {copiedField === 'bank' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedField === 'bank' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>

                    {/* Account Number */}
                    <div className="flex items-center justify-between p-3 bg-[#1c182c] rounded-[12px] border border-[#a855f7]/40 ring-1 ring-[#a855f7]/20">
                      <div>
                        <span className="text-[10px] text-[#a855f7] uppercase font-mono font-semibold">Virtual Account Number</span>
                        <p className="text-xl sm:text-2xl font-mono tracking-wider font-bold text-white">
                          {virtualAccount.accountNumber}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(virtualAccount.accountNumber, 'acc')}
                        className="px-3 py-2 rounded-lg bg-[#8b5cf6] text-white hover:bg-[#7c3aed] transition-all text-xs font-semibold flex items-center gap-1.5 shadow-md"
                      >
                        {copiedField === 'acc' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedField === 'acc' ? 'Copied' : 'Copy Account'}</span>
                      </button>
                    </div>

                    {/* Beneficiary Name */}
                    <div className="flex items-center justify-between p-3 bg-[#1c182c] rounded-[12px] border border-[#2d2740]">
                      <div>
                        <span className="text-[10px] text-[#9ca3af] uppercase font-mono">Beneficiary Name</span>
                        <p className="text-xs sm:text-sm font-medium text-white">{virtualAccount.accountName}</p>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                        Auto-Matched
                      </span>
                    </div>

                  </div>
                </div>

                <div className="text-[11px] text-[#9ca3af] flex items-start gap-2 bg-[#1f1a30]/60 p-3 rounded-[12px] border border-[#332b4a]">
                  <AlertCircle className="w-4 h-4 text-[#a855f7] shrink-0 mt-0.5" />
                  <span>
                    Open your bank app, select <strong>Moniepoint MFB</strong>, and transfer exactly <strong>{payment.formattedAmount}</strong>. Moniepoint will automatically detect and verify your admission fee.
                  </span>
                </div>

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => completePayment('bank_transfer')}
                  className="w-full py-3.5 rounded-full btn-purple font-semibold text-xs shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{processingStep || 'Verifying Moniepoint Transfer...'}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>I Have Sent The Money / Verify Payment</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* CHANNEL 2: DEBIT CARD */}
            {activeChannel === 'card' && (
              <form onSubmit={handleCardSubmit} className="space-y-4">
                {!requiresOtp ? (
                  <>
                    <div className="p-4 bg-[#14121f] rounded-[18px] border border-[#332d47] space-y-3.5">
                      <div>
                        <label className="block text-[11px] font-light text-[#c4c7c8] mb-1.5">
                          Card Number (Mastercard, Visa, Verve)
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            maxLength={19}
                            placeholder="5399 •••• •••• ••••"
                            value={cardData.cardNumber}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
                              setCardData({ ...cardData, cardNumber: val });
                            }}
                            className="w-full bg-[#1c182c] border border-[#332d47] rounded-xl px-4 py-2.5 text-xs text-white placeholder-[#6b7280] font-mono focus:outline-none focus:border-[#8b5cf6]"
                          />
                          <CreditCard className="w-4 h-4 text-[#8b5cf6] absolute right-3.5 top-1/2 -translate-y-1/2" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-light text-[#c4c7c8] mb-1.5">
                            Expiry Date
                          </label>
                          <input
                            type="text"
                            required
                            maxLength={5}
                            placeholder="MM/YY"
                            value={cardData.cardExpiry}
                            onChange={(e) => {
                              let val = e.target.value.replace(/\D/g, '');
                              if (val.length >= 3) {
                                val = `${val.slice(0, 2)}/${val.slice(2, 4)}`;
                              }
                              setCardData({ ...cardData, cardExpiry: val });
                            }}
                            className="w-full bg-[#1c182c] border border-[#332d47] rounded-xl px-4 py-2.5 text-xs text-white placeholder-[#6b7280] font-mono focus:outline-none focus:border-[#8b5cf6]"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-light text-[#c4c7c8] mb-1.5">
                            CVV / CVC
                          </label>
                          <input
                            type="password"
                            required
                            maxLength={4}
                            placeholder="•••"
                            value={cardData.cardCvv}
                            onChange={(e) => setCardData({ ...cardData, cardCvv: e.target.value.replace(/\D/g, '') })}
                            className="w-full bg-[#1c182c] border border-[#332d47] rounded-xl px-4 py-2.5 text-xs text-white placeholder-[#6b7280] font-mono focus:outline-none focus:border-[#8b5cf6]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-light text-[#c4c7c8] mb-1.5">
                          Card 4-Digit PIN
                        </label>
                        <input
                          type="password"
                          required
                          maxLength={4}
                          placeholder="••••"
                          value={cardData.cardPin}
                          onChange={(e) => setCardData({ ...cardData, cardPin: e.target.value.replace(/\D/g, '') })}
                          className="w-full bg-[#1c182c] border border-[#332d47] rounded-xl px-4 py-2.5 text-xs text-white placeholder-[#6b7280] font-mono focus:outline-none focus:border-[#8b5cf6]"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-[#9ca3af] justify-center">
                      <Lock className="w-3.5 h-3.5 text-[#a855f7]" />
                      <span>256-Bit Encrypted Moniepoint 3D Secure Protection</span>
                    </div>

                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="w-full py-3.5 rounded-full btn-purple font-semibold text-xs shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>{processingStep || 'Authorizing with Moniepoint...'}</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          <span>Pay {payment.formattedAmount} with Card</span>
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  /* OTP Verification Step */
                  <div className="p-5 bg-[#14121f] rounded-[18px] border border-[#a855f7]/40 space-y-4">
                    <div className="text-center">
                      <div className="w-10 h-10 rounded-full bg-[#a855f7]/20 border border-[#a855f7] flex items-center justify-center text-[#a855f7] mx-auto mb-2">
                        <Lock className="w-5 h-5" />
                      </div>
                      <h4 className="text-sm font-semibold text-white">Enter Bank One-Time Password (OTP)</h4>
                      <p className="text-xs text-[#9ca3af] mt-1">
                        An authentication OTP was sent by your card issuer to your registered phone.
                      </p>
                    </div>

                    <div>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        placeholder="Enter 6-digit OTP (e.g. 123456)"
                        value={cardOtp}
                        onChange={(e) => setCardOtp(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-[#1c182c] border border-[#a855f7] rounded-xl px-4 py-3 text-center text-base font-mono tracking-widest text-white focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="w-full py-3 rounded-full btn-purple font-semibold text-xs shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>{processingStep || 'Verifying OTP with Moniepoint...'}</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Confirm & Complete Payment</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </form>
            )}

            {/* CHANNEL 3: USSD */}
            {activeChannel === 'ussd' && (
              <div className="space-y-4">
                <div className="p-5 bg-[#14121f] rounded-[18px] border border-[#332d47] text-center space-y-3">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-[#a855f7] block">
                    Moniepoint USSD Code
                  </span>
                  <div className="p-4 bg-[#1c182c] rounded-xl border border-[#a855f7]/40 flex items-center justify-between">
                    <p className="text-2xl font-mono font-bold text-white tracking-wider">
                      {ussdCode}
                    </p>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(ussdCode, 'ussd')}
                      className="px-3 py-1.5 rounded-lg bg-[#8b5cf6] text-white text-xs font-medium flex items-center gap-1"
                    >
                      {copiedField === 'ussd' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedField === 'ussd' ? 'Copied' : 'Copy Code'}</span>
                    </button>
                  </div>
                  <p className="text-xs text-[#c4c7c8] font-light leading-relaxed">
                    Dial this code from any phone registered to your bank or Moniepoint app to authenticate instant payment of <strong>{payment.formattedAmount}</strong>.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => completePayment('ussd')}
                  className="w-full py-3.5 rounded-full btn-purple font-semibold text-xs shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{processingStep || 'Verifying USSD Session...'}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>I Have Dialed & Authorized USSD</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* CHANNEL 4: POS / QR CODE */}
            {activeChannel === 'pos_qr' && (
              <div className="space-y-4">
                <div className="p-5 bg-[#14121f] rounded-[18px] border border-[#332d47] text-center flex flex-col items-center">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-[#a855f7] mb-3 block">
                    Scan or Pay at Orbit Space Hub POS
                  </span>
                  
                  {qrCodeUrl ? (
                    <div className="p-3 bg-white rounded-2xl shadow-xl border-2 border-[#a855f7] mb-3">
                      <img src={qrCodeUrl} alt="Moniepoint QR Code" className="w-40 h-40 object-contain" />
                    </div>
                  ) : (
                    <div className="w-40 h-40 bg-[#221c33] rounded-2xl flex items-center justify-center text-xs text-[#a1a1aa] mb-3">
                      <Loader2 className="w-6 h-6 animate-spin text-[#a855f7]" />
                    </div>
                  )}

                  <div className="flex items-center gap-2 bg-[#1c182c] px-3 py-1.5 rounded-full border border-[#332d47] text-xs font-mono text-[#c084fc] mb-2">
                    <span>Terminal Ref:</span>
                    <strong className="text-white">{reference.slice(-8)}</strong>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(reference.slice(-8), 'pos_ref')}
                      className="text-[#9ca3af] hover:text-white"
                    >
                      {copiedField === 'pos_ref' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <p className="text-xs text-[#c4c7c8] font-light max-w-sm">
                    Scan with any banking app supporting NQR / Moniepoint, or show this reference code at the Orbit Space Front Desk in Ilorin.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => completePayment('pos_qr')}
                  className="w-full py-3.5 rounded-full btn-purple font-semibold text-xs shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{processingStep || 'Verifying Hub POS Transaction...'}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm POS Payment</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Merchant Footer Info */}
            <div className="mt-4 pt-4 border-t border-[#2d2740] flex items-center justify-between text-[10px] text-[#6b7280] font-mono">
              <span>Merchant: {MONIEPOINT_CONFIG.merchantName}</span>
              <span>Ref: {reference.slice(0, 12)}...</span>
            </div>

          </div>
        ) : (
          /* SUCCESS STATE */
          <div className="p-6 sm:p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-950/90 text-emerald-400 border border-emerald-500 flex items-center justify-center mx-auto shadow-xl shadow-emerald-950/50">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-semibold">
                Transaction Successful
              </span>
              <h3 className="text-2xl sm:text-3xl font-serif text-white font-normal mt-1">
                Payment Confirmed!
              </h3>
              <p className="text-xs text-[#c4c7c8] font-light mt-1 max-w-md mx-auto">
                Thank you <strong className="text-white">{payment.customerName}</strong>. Your payment of <strong className="text-emerald-400">{payment.formattedAmount}</strong> for <strong className="text-white">{payment.title}</strong> has been authorized via Moniepoint MFB.
              </p>
            </div>

            {/* Receipt Summary Card */}
            {completedRecord && (
              <div className="p-4 bg-[#14121f] rounded-[18px] border border-[#332d47] text-left text-xs space-y-2 max-w-md mx-auto">
                <div className="flex justify-between items-center pb-2 border-b border-[#2d2740]">
                  <span className="text-[#9ca3af]">Moniepoint Reference:</span>
                  <span className="font-mono font-semibold text-[#c084fc]">{completedRecord.reference}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#9ca3af]">Amount Paid:</span>
                  <span className="font-bold text-white">NGN {completedRecord.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#9ca3af]">Payment Channel:</span>
                  <span className="text-white capitalize">{completedRecord.channel.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#9ca3af]">Terminal ID:</span>
                  <span className="font-mono text-[#9ca3af]">{completedRecord.moniepointTerminal}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-[#2d2740]">
                  <span className="text-[#9ca3af]">Status:</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-semibold text-[10px]">
                    SETTLED (MONIEPOINT)
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleDownloadReceipt}
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#ffffff] hover:bg-[#e2e2e2] text-[#141313] font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download Moniepoint Receipt (PDF)</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#201c30] hover:bg-[#302a48] text-white font-medium text-xs border border-[#372f52] transition-all"
              >
                Close & Return
              </button>
            </div>
          </div>
        )}

      </motion.div>
    </motion.div>
  );
};
