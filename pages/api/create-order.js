// pages/api/create-order.js
import axios from 'axios';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { productId, productTitle, price } = req.body;

  try {
    const order = {
      productId,
      productTitle,
      price,
      status: 'pending_flutterwave',
      createdAt: new Date().toISOString()
    };
    const docRef = await addDoc(collection(db, 'orders'), order);

    const FLW_SECRET_KEY = process.env.FLW_SECRET_KEY;
    if (!FLW_SECRET_KEY) {
      return res.status(200).send(`Order created (${docRef.id}). Flutterwave not configured. Use manual MoMo to pay to ${process.env.MOMO_OWNER_NUMBER}`);
    }

    const payload = {
      tx_ref: `order_${docRef.id}`,
      amount: String(price),
      currency: "USD",
      redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`,
      customer: { email: "buyer@example.com", name: "Buyer" },
      customization: { title: productTitle }
    };

    const r = await axios.post('https://api.flutterwave.com/v3/payments', payload, {
      headers: { Authorization: `Bearer ${FLW_SECRET_KEY}` }
    });

    const checkout = r.data?.data?.link;
    return res.redirect(checkout);
  } catch (e) {
    console.error(e.response?.data || e.message);
    return res.status(500).json({ error: 'server error' });
  }
}
