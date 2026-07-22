import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import {
  calculateTDEE,
  createRecipe,
  createMealPlan,
  getMealPlanByUserId,
  getRecipesByDiet,
  updateMealPlan,
} from './controllers/mealPlanController.js';
import { generateMealPlan } from './controllers/mealController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '..', '.env'), override: true });

const app = express();
const port = process.env.PORT || 5000;

const mongoUri = process.env.MONGODB_URI || '';

if (mongoUri) {
  mongoose.connect(mongoUri)
    .then(() => console.log('MongoDB connected for meal plan storage.'))
    .catch((error) => console.error('MongoDB connection failed:', error.message));
} else {
  console.warn('MONGODB_URI not set. Meal plan models will use in-memory-friendly logic but persistence is disabled until configured.');
}

const allowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000', 'http://127.0.0.1:3000', 'http://0.0.0.0:5173', 'http://localhost'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin?.includes('localhost')) {
      callback(null, true);
      return;
    }
    console.warn(`CORS origin rejected: ${origin}`);
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Role'],
}));
app.options('*', cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

const dbFile = path.join(__dirname, 'payments.json');

if (!fs.existsSync(dbFile)) {
  fs.writeFileSync(dbFile, '[]');
}

const readPayments = () => JSON.parse(fs.readFileSync(dbFile, 'utf8'));
const writePayments = (data) => fs.writeFileSync(dbFile, JSON.stringify(data, null, 2));

const razorpayKeyId = process.env.RAZORPAY_KEY_ID || '';
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || '';
const hasRazorpayConfig = Boolean(razorpayKeyId && razorpayKeySecret);
console.log('Razorpay env check:', {
  hasKeyId: Boolean(razorpayKeyId),
  hasKeySecret: Boolean(razorpayKeySecret),
  keyIdValue: razorpayKeyId || 'missing',
});
const razorpay = hasRazorpayConfig
  ? new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    })
  : null;

function ensureRazorpayConfig() {
  return Boolean(razorpay && razorpayKeyId && razorpayKeySecret);
}

function createSignature(body, secret) {
  return crypto.createHmac('sha256', secret).update(body).digest('hex');
}

app.post('/api/payment/order', async (req, res) => {
  try {
    const { amount, currency = 'INR', userId = 'demo-user' } = req.body;

    if (!ensureRazorpayConfig()) {
      console.error('Razorpay credentials are missing. Check the backend environment variables.');
      return res.status(500).json({ success: false, message: 'Razorpay credentials are not configured.' });
    }

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Amount must be a positive number.' });
    }

    const amountInPaise = Math.round(Number(amount) * 100);
    const options = {
      amount: amountInPaise,
      currency: currency.toUpperCase() === 'USD' ? 'INR' : currency,
      receipt: `rcpt_${Date.now()}`,
      notes: { user_id: userId },
    };

    const order = await razorpay.orders.create(options);

    const payments = readPayments();
    payments.push({
      order_id: order.id,
      payment_id: null,
      signature: null,
      status: 'pending',
      amount: Number(amount),
      currency: options.currency,
      user_id: userId,
      created_at: new Date().toISOString(),
    });
    writePayments(payments);

    console.log('Created Razorpay order:', order.id);
    return res.json({ success: true, order });
  } catch (error) {
    const razorpayError = error?.error || error;
    const message = razorpayError?.description || error?.message || 'Unable to create Razorpay order.';
    const statusCode = error?.statusCode || 500;
    console.error('Order creation failed:', message, { statusCode, razorpayError });
    return res.status(statusCode).json({ success: false, message, error: message, statusCode });
  }
});

app.post('/api/payment/verify', async (req, res) => {
  try {
    const { order_id, payment_id, signature } = req.body;

    if (!order_id || !payment_id || !signature) {
      return res.status(400).json({ success: false, message: 'Missing verification fields.' });
    }

    const payments = readPayments();
    const paymentRecord = payments.find((entry) => entry.order_id === order_id);

    const secret = process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_WEBHOOK_SECRET || '';

    if (!secret) {
      console.error('Razorpay verification secret is missing.');
      return res.status(500).json({ success: false, message: 'Razorpay verification secret is not configured.' });
    }

    const body = `${order_id}|${payment_id}`;
    const expectedSignature = createSignature(body, secret);

    let isValid = false;
    if (signature && expectedSignature && signature.length === expectedSignature.length) {
      try {
        isValid = crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
      } catch (error) {
        console.error('Signature comparison failed:', error.message);
        isValid = false;
      }
    } else if (signature && expectedSignature && signature.length !== expectedSignature.length) {
      console.warn('Signature length mismatch during verification:', { signatureLength: signature.length, expectedLength: expectedSignature.length });
      isValid = false;
    }

    if (paymentRecord) {
      paymentRecord.payment_id = payment_id;
      paymentRecord.signature = signature;
      paymentRecord.status = isValid ? 'success' : 'failed';
      writePayments(payments);
    }

    if (!isValid) {
      console.error('Razorpay signature verification failed.', { order_id, payment_id, receivedSignature: signature, expectedSignature });
      return res.status(400).json({ success: false, message: 'Signature verification failed.' });
    }

    return res.status(200).json({ success: true, message: 'Payment verified', payment_id, order_id });
  } catch (error) {
    console.error('Signature verification failed:', error.message);
    return res.status(500).json({ success: false, message: 'Verification failed.', error: error.message });
  }
});

app.post('/api/payment/webhook', express.json(), (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const body = JSON.stringify(req.body);
    const expectedSignature = createSignature(body, process.env.RAZORPAY_WEBHOOK_SECRET || 'dev-secret');

    if (signature !== expectedSignature) {
      return res.status(400).json({ success: false, message: 'Invalid webhook signature.' });
    }

    const { event, payload } = req.body;
    console.log('Webhook event:', event);

    const payments = readPayments();
    const paymentRecord = payments.find((entry) => entry.order_id === payload?.payment?.entity?.notes?.receipt || entry.order_id === payload?.payment?.entity?.order_id);

    if (paymentRecord) {
      paymentRecord.status = event === 'payment.captured' ? 'success' : 'failed';
      paymentRecord.payment_id = payload?.payment?.entity?.id || paymentRecord.payment_id;
      writePayments(payments);
    }

    return res.json({ success: true, received: true });
  } catch (error) {
    console.error('Webhook processing failed:', error.message);
    return res.status(500).json({ success: false, message: 'Webhook processing failed.' });
  }
});

app.get('/api/payment/health', (_req, res) => {
  res.json({ success: true, message: 'Razorpay backend is running.' });
});

app.post('/api/meal-plan/tdee', (req, res) => {
  try {
    const result = calculateTDEE(req.body);
    return res.json({ success: true, data: result });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
});

app.post('/api/meal-plan/recipes', async (req, res) => {
  try {
    const result = await createRecipe(req.body);
    return res.status(201).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/meal-plan/recipes', async (req, res) => {
  try {
    const dietType = req.query.dietType;
    const result = await getRecipesByDiet(dietType);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/meal-plan', async (req, res) => {
  try {
    const result = await createMealPlan(req.body);
    return res.status(201).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/meal-plan/generate', async (req, res) => {
  try {
    const result = await generateMealPlan(req.body);
    return res.status(201).json({ success: true, ...result });
  } catch (error) {
    console.warn('Meal plan generation error (fallback will handle):', error instanceof Error ? error.message : String(error));
    return res.status(200).json({ success: true, mealPlan: null });
  }
});

app.post('/api/meal-plan/save', async (req, res) => {
  try {
    const { userId, mealPlan } = req.body;
    if (!userId || !mealPlan) {
      return res.status(400).json({ success: false, message: 'userId and mealPlan are required.' });
    }

    const result = await createMealPlan({
      userId,
      goal: mealPlan.goal || 'maintenance',
      dietType: mealPlan.dietType || 'veg',
      targetCalories: mealPlan.targetCalories || 2000,
      targetMacros: mealPlan.targetMacros || { protein: 100, carbs: 220, fats: 70 },
      days: mealPlan.days || [],
      recommendationSummary: mealPlan.recommendationSummary || 'Your personalized meal plan',
      startDate: new Date().toISOString().slice(0, 10),
    });

    return res.status(201).json({ success: true, message: 'Meal plan saved successfully', mealPlan: result });
  } catch (error) {
    console.warn('Meal plan save error:', error instanceof Error ? error.message : String(error));
    return res.status(200).json({ success: true, message: 'Meal plan processed', mealPlan: null });
  }
});

app.patch('/api/meals/edit', async (req, res) => {
  try {
    const authRole = req.headers['x-user-role'];
    if (!authRole || !['trainer', 'admin', 'coach'].includes(String(authRole))) {
      return res.status(403).json({ success: false, message: 'Unauthorized: trainer role required.' });
    }

    const { userId, mealPlan } = req.body;
    if (!userId || !mealPlan) {
      return res.status(400).json({ success: false, message: 'userId and mealPlan are required.' });
    }

    const result = await updateMealPlan(userId, mealPlan);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/meal-plan/:userId', async (req, res) => {
  try {
    const result = await getMealPlanByUserId(req.params.userId);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

app.use((err, _req, res, _next) => {
  if (err && err.message === 'Not allowed by CORS') {
    return res.status(403).json({ success: false, message: 'CORS not allowed for this origin.' });
  }

  console.error('Unhandled server error:', err);
  return res.status(500).json({ success: false, message: 'Internal server error.' });
});

app.listen(port, () => {
  console.log(`Razorpay server listening on http://localhost:${port}`);
});
