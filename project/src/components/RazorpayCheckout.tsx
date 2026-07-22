import { useState } from 'react';
import { CheckCircle2, ShieldCheck, Sparkles, Loader, CreditCard } from 'lucide-react';
import { razorpayConfig } from '../lib/razorpay';
import type { PricingPlan } from '../types';

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => void;
  prefill?: { name: string; email: string };
  theme?: { color: string };
  modal?: { ondismiss: () => void };
}

interface RazorpayInstance {
  open: () => void;
  close: () => void;
}

export default function RazorpayCheckout({ plan, onSuccess }: { plan: PricingPlan; onSuccess?: (tier: 'monthly' | 'quarterly' | 'annual') => void }) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handlePayNow = async () => {
    setLoading(true);
    setStatus('loading');
    setMessage('Creating order...');

    try {
      let data: { success?: boolean; order?: { id?: string }; message?: string; error?: string; statusCode?: number } = {};

      try {
        const res = await fetch(`${razorpayConfig.backendUrl}/api/payment/order`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: plan.price, currency: 'INR', userId: 'demo-user' }),
        });

        const responseText = await res.text();
        try {
          data = responseText ? JSON.parse(responseText) : {};
        } catch (parseError) {
          console.error('Failed to parse order response:', parseError, responseText);
          data = { success: false, message: responseText || 'Unable to create order.' };
        }

        if (!res.ok || !data.success || !data.order?.id) {
          throw new Error(data.error || data.message || 'Unable to create order.');
        }
      } catch (error) {
        console.warn('Razorpay order creation failed, falling back to local demo checkout:', error);
        data = {
          success: true,
          order: { id: `demo-order-${Date.now()}` },
        };
      }

      const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (existingScript) {
        (existingScript as HTMLScriptElement).remove();
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        const orderId = data.order?.id ?? `demo-order-${Date.now()}`;
        const options: RazorpayOptions = {
          key: razorpayConfig.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_demo',
          amount: Math.round(plan.price * 100),
          currency: 'INR',
          name: 'FitForge',
          description: `${plan.name} Plan Payment`,
          order_id: orderId,
          handler: async (response) => {
            console.log('Razorpay payment success callback received:', response);

            try {
              const verifyRes = await fetch(`${razorpayConfig.backendUrl}/api/payment/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  order_id: response.razorpay_order_id,
                  payment_id: response.razorpay_payment_id,
                  signature: response.razorpay_signature,
                }),
              });

              const responseText = await verifyRes.text();
              console.log('Verification status:', verifyRes.status);
              console.log('Verification response body:', responseText);

              let verifyData: { success?: boolean; message?: string; error?: string } = {};
              try {
                verifyData = responseText ? JSON.parse(responseText) : {};
              } catch (parseError) {
                console.error('Failed to parse verification response:', parseError, responseText);
                verifyData = { success: false, message: responseText || 'Verification response was not valid JSON.' };
              }

              if (verifyRes.ok && verifyData.success) {
                setStatus('success');
                setMessage('Payment successful.');
                onSuccess?.(plan.id);
              } else {
                throw new Error(verifyData.message || verifyData.error || 'Verification failed.');
              }
            } catch (error) {
              console.error('Razorpay verification failed:', error);
              setStatus('error');
              setMessage(error instanceof Error ? error.message : 'Verification failed.');
            } finally {
              setLoading(false);
            }
          },
          prefill: { name: 'Demo User', email: 'demo@example.com' },
          theme: { color: '#10B981' },
          modal: {
            ondismiss: () => {
              setLoading(false);
              setStatus('error');
              setMessage('Payment cancelled.');
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      };
      script.onerror = () => {
        setLoading(false);
        setStatus('error');
        setMessage('Razorpay checkout script could not be loaded.');
      };
      document.body.appendChild(script);
    } catch (error) {
      setLoading(false);
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Unable to start payment.');
    }
  };

  return (
    <div className="overflow-hidden rounded-[1.4rem] border border-emerald-500/20 bg-[#091124]/90 p-5 text-slate-100 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-emerald-400/80">
            <Sparkles size={12} /> Premium checkout
          </div>
          <h3 className="mt-2 text-lg font-semibold text-white">Unlock the next level</h3>
          <p className="mt-1 text-sm leading-6 text-slate-400">Secure, fast, and fully integrated with Razorpay for one-tap upgrades.</p>
        </div>
        <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-sm font-semibold text-emerald-300">
          ${plan.price}
        </div>
      </div>

      <div className="mt-4 grid gap-2 rounded-2xl border border-emerald-500/10 bg-[#030712]/70 p-3 text-sm text-slate-300 sm:grid-cols-3">
        <div className="flex items-center gap-2">
          <ShieldCheck size={15} className="text-emerald-400" />
          <span>Secure payments</span>
        </div>
        <div className="flex items-center gap-2">
          <CreditCard size={15} className="text-emerald-400" />
          <span>Instant confirmation</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 size={15} className="text-emerald-400" />
          <span>Webhook ready</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handlePayNow}
        disabled={loading}
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-lime-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? (
          <>
            <Loader size={15} className="animate-spin" />
            Processing...
          </>
        ) : (
          <>Pay Now</>
        )}
      </button>

      {status !== 'idle' && (
        <div className={`mt-4 rounded-xl border px-3 py-2 text-sm ${status === 'success' ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300' : status === 'error' ? 'border-rose-500/20 bg-rose-500/10 text-rose-300' : 'border-slate-700 bg-slate-800/60 text-slate-300'}`}>
          {message}
        </div>
      )}
    </div>
  );
}
