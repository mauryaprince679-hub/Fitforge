export const razorpayConfig = {
  keyId: import.meta.env.VITE_RAZORPAY_KEY_ID || '',
  backendUrl: import.meta.env.VITE_PAYMENT_BACKEND_URL || 'http://localhost:5000',
};
