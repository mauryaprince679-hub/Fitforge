import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Razorpay from 'razorpay';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const rzp = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

try {
  const order = await rzp.orders.create({ amount: 1000, currency: 'INR', receipt: 'rcpt_test' });
  console.log(JSON.stringify(order));
} catch (error) {
  console.error('STATUS', error?.statusCode);
  console.error('DESCRIPTION', error?.error?.description || error?.message);
}
