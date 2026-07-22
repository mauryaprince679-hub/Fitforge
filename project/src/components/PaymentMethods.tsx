import { useMemo, useState } from 'react';
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CreditCard,
  Landmark,
  ShieldCheck,
  Wallet,
} from 'lucide-react';

type PaymentMethod = 'upi' | 'card' | 'netbanking';
type UpiProvider = 'gpay' | 'phonepe' | 'paytm';
type BankName = 'HDFC' | 'ICICI' | 'SBI' | 'Axis' | 'Kotak' | 'Canara';

interface PaymentMethodsProps {
  onPay?: (details: string) => void;
  compact?: boolean;
}

const upiOptions: Array<{ id: UpiProvider; label: string; accent: string }> = [
  { id: 'gpay', label: 'Google Pay', accent: 'from-cyan-400 to-sky-500' },
  { id: 'phonepe', label: 'PhonePe', accent: 'from-violet-400 to-fuchsia-500' },
  { id: 'paytm', label: 'Paytm', accent: 'from-blue-400 to-indigo-500' },
];

const bankOptions: BankName[] = ['HDFC', 'ICICI', 'SBI', 'Axis', 'Kotak', 'Canara'];

function normalizeText(value: string) {
  return value.replace(/\s+/g, '').trim();
}

export default function PaymentMethods({ onPay, compact = false }: PaymentMethodsProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('upi');
  const [selectedUpi, setSelectedUpi] = useState<UpiProvider>('gpay');
  const [upiId, setUpiId] = useState('alex@oksbi');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [selectedBank, setSelectedBank] = useState<BankName | null>(null);

  const cardNumberValid = cardNumber.replace(/\s+/g, '').length === 16;
  const expiryValid = /^(0[1-9]|1[0-2])\/(\d{2})$/.test(expiry);
  const cvvValid = /^(\d{3}|\d{4})$/.test(cvv);
  const upiValid = upiId.includes('@') && upiId.length > 3;
  const bankValid = selectedBank !== null;

  const isValid = useMemo(() => {
    if (selectedMethod === 'upi') return upiValid;
    if (selectedMethod === 'card') return cardNumberValid && expiryValid && cvvValid;
    return bankValid;
  }, [bankValid, cardNumberValid, cvvValid, expiryValid, selectedMethod, upiValid]);

  const handleSubmit = () => {
    if (!isValid) return;

    const summary =
      selectedMethod === 'upi'
        ? `UPI via ${upiOptions.find(option => option.id === selectedUpi)?.label} • ${upiId}`
        : selectedMethod === 'card'
          ? `Card ending • ${cardNumber.slice(-4)}`
          : `Net banking via ${selectedBank}`;

    onPay?.(summary);
  };

  return (
    <div className={`${compact ? 'w-full' : 'min-h-screen'} bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),_transparent_30%),linear-gradient(135deg,_#020617_0%,_#0B1528_45%,_#11213E_100%)] px-3 py-4 text-slate-100 sm:px-4 sm:py-6 lg:px-8 ${compact ? 'rounded-2xl' : 'lg:px-8'}`}>
      <div className={`mx-auto flex flex-col gap-4 ${compact ? 'max-w-none' : 'max-w-6xl gap-6'}`}>
        <header className={`rounded-[24px] border border-cyan-400/20 bg-slate-950/60 p-4 shadow-[0_0_60px_rgba(34,211,238,0.12)] backdrop-blur-xl ${compact ? 'sm:p-5' : 'sm:p-8'}`}>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-cyan-200 sm:text-[11px]">
                <ShieldCheck className="h-3.5 w-3.5" />
                Secure checkout
              </div>
              <h1 className={`font-bold text-white ${compact ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl'}`}>Payment methods</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                Choose a trusted payment option and complete your FitForge plan in seconds.
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
              <div className="flex items-center gap-2 font-semibold">
                <BadgeCheck className="h-4 w-4" />
                Encrypted & PCI compliant
              </div>
            </div>
          </div>
        </header>

        <div className={`grid gap-4 ${compact ? 'lg:grid-cols-1' : 'lg:grid-cols-[1.05fr_0.95fr]'}`}>
          <section className={`rounded-[24px] border border-slate-800/80 bg-slate-950/60 p-3 shadow-[0_0_50px_rgba(2,8,23,0.35)] backdrop-blur-xl sm:p-4 ${compact ? '' : 'sm:p-6'}`}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Select a payment option</h2>
              <span className="text-sm text-slate-500">Fast, secure, simple</span>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                {
                  key: 'upi' as PaymentMethod,
                  title: 'UPI',
                  subtitle: 'Google Pay / PhonePe / Paytm',
                  icon: <Wallet className="h-5 w-5" />,
                },
                {
                  key: 'card' as PaymentMethod,
                  title: 'Cards',
                  subtitle: 'Visa, Mastercard, RuPay',
                  icon: <CreditCard className="h-5 w-5" />,
                },
                {
                  key: 'netbanking' as PaymentMethod,
                  title: 'Net Banking',
                  subtitle: 'Top banks in minutes',
                  icon: <Landmark className="h-5 w-5" />,
                },
              ].map(option => {
                const active = selectedMethod === option.key;
                return (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setSelectedMethod(option.key)}
                    className={`rounded-2xl border p-4 text-left transition-all duration-200 ${
                      active
                        ? 'border-cyan-400/60 bg-cyan-400/10 shadow-[0_0_25px_rgba(34,211,238,0.18)]'
                        : 'border-slate-800 bg-slate-900/70 hover:border-cyan-400/30 hover:bg-slate-800/70'
                    }`}
                  >
                    <div className={`mb-3 inline-flex rounded-xl border border-white/10 ${active ? 'bg-cyan-400/20 text-cyan-200' : 'bg-slate-800 text-slate-400'} p-2`}>
                      {option.icon}
                    </div>
                    <div className="text-sm font-semibold text-white">{option.title}</div>
                    <div className="mt-1 text-xs text-slate-500">{option.subtitle}</div>
                  </button>
                );
              })}
            </div>

            {selectedMethod === 'upi' && (
              <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                <div className="mb-3 text-sm font-semibold text-slate-200">Choose your UPI app</div>
                <div className="grid gap-2 sm:grid-cols-3">
                  {upiOptions.map(option => {
                    const active = selectedUpi === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setSelectedUpi(option.id)}
                        className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all ${
                          active
                            ? 'border-cyan-400/50 bg-cyan-400/10 text-cyan-100'
                            : 'border-slate-700 bg-slate-800/70 text-slate-300 hover:border-cyan-400/30'
                        }`}
                      >
                        <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br ${option.accent} text-[11px] font-bold text-white`}>
                          {option.label.slice(0, 2).toUpperCase()}
                        </span>
                        {option.label}
                      </button>
                    );
                  })}
                </div>

                <label className="mt-4 block text-sm font-medium text-slate-300">
                  UPI ID
                  <input
                    type="text"
                    value={upiId}
                    onChange={event => setUpiId(event.target.value.toLowerCase())}
                    placeholder="yourname@okicici"
                    className={`mt-2 w-full rounded-xl border bg-slate-950/80 px-3 py-3 text-sm outline-none transition-all ${
                      upiValid ? 'border-cyan-400/40 ring-1 ring-cyan-400/20' : 'border-slate-700 focus:border-cyan-400/60'
                    }`}
                  />
                </label>
                <p className="mt-2 text-xs text-slate-500">Use the same ID linked to your preferred UPI app.</p>
              </div>
            )}

            {selectedMethod === 'card' && (
              <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                <div className="grid gap-4">
                  <label className="block text-sm font-medium text-slate-300">
                    Card number
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={19}
                      value={cardNumber}
                      onChange={event => {
                        const next = normalizeText(event.target.value);
                        const spaced = next.match(/.{1,4}/g)?.join(' ') ?? next;
                        setCardNumber(spaced.slice(0, 19));
                      }}
                      placeholder="4242 4242 4242 4242"
                      className={`mt-2 w-full rounded-xl border bg-slate-950/80 px-3 py-3 text-sm outline-none transition-all ${
                        cardNumberValid ? 'border-cyan-400/40 ring-1 ring-cyan-400/20' : 'border-slate-700 focus:border-cyan-400/60'
                      }`}
                    />
                  </label>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block text-sm font-medium text-slate-300">
                      Expiry
                      <input
                        type="text"
                        maxLength={5}
                        value={expiry}
                        onChange={event => setExpiry(event.target.value)}
                        placeholder="MM/YY"
                        className={`mt-2 w-full rounded-xl border bg-slate-950/80 px-3 py-3 text-sm outline-none transition-all ${
                          expiryValid ? 'border-cyan-400/40 ring-1 ring-cyan-400/20' : 'border-slate-700 focus:border-cyan-400/60'
                        }`}
                      />
                    </label>
                    <label className="block text-sm font-medium text-slate-300">
                      CVV
                      <input
                        type="password"
                        maxLength={4}
                        inputMode="numeric"
                        value={cvv}
                        onChange={event => setCvv(event.target.value.replace(/\D/g, ''))}
                        placeholder="***"
                        className={`mt-2 w-full rounded-xl border bg-slate-950/80 px-3 py-3 text-sm outline-none transition-all ${
                          cvvValid ? 'border-cyan-400/40 ring-1 ring-cyan-400/20' : 'border-slate-700 focus:border-cyan-400/60'
                        }`}
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {selectedMethod === 'netbanking' && (
              <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                <div className="mb-3 text-sm font-semibold text-slate-200">Quick-select your bank</div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {bankOptions.map(bank => {
                    const active = selectedBank === bank;
                    return (
                      <button
                        key={bank}
                        type="button"
                        onClick={() => setSelectedBank(bank)}
                        className={`rounded-xl border px-3 py-3 text-left text-sm font-medium transition-all ${
                          active
                            ? 'border-cyan-400/50 bg-cyan-400/10 text-cyan-100'
                            : 'border-slate-700 bg-slate-800/70 text-slate-300 hover:border-cyan-400/30'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" /> {bank}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </section>

          {!compact && (
            <aside className="rounded-[28px] border border-slate-800/80 bg-slate-950/60 p-5 shadow-[0_0_50px_rgba(2,8,23,0.35)] backdrop-blur-xl sm:p-6">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Order total</p>
                    <p className="mt-1 text-2xl font-semibold text-white">₹2,499</p>
                  </div>
                  <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-200">
                    Premium
                  </div>
                </div>

                <div className="mt-5 space-y-3 text-sm text-slate-400">
                  <div className="flex items-center justify-between rounded-xl bg-slate-800/70 px-3 py-2">
                    <span>Plan</span>
                    <span className="font-medium text-slate-200">FitForge Pro</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-slate-800/70 px-3 py-2">
                    <span>Billing</span>
                    <span className="font-medium text-slate-200">One-time</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-slate-800/70 px-3 py-2">
                    <span>Support</span>
                    <span className="font-medium text-slate-200">24/7 priority</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={!isValid}
                className={`mt-6 flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-semibold transition-all duration-200 ${
                  isValid
                    ? 'bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 text-slate-950 shadow-[0_0_28px_rgba(34,211,238,0.3)] hover:scale-[1.01]'
                    : 'cursor-not-allowed bg-slate-800 text-slate-500'
                }`}
              >
                Proceed to Pay
                <ArrowRight className="h-4 w-4" />
              </button>

              <div className="mt-4 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-3 text-sm text-cyan-100">
                {isValid ? 'Your selection is ready — complete the payment securely.' : 'Select a payment method and fill in the details to unlock checkout.'}
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
