// pages/api/flutterwave-webhook.js
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default async function handler(req, res) {
  const event = req.body;
  try {
    const tx_ref = event.data?.tx_ref;
    const status = event.data?.status;
    if (!tx_ref) return res.status(400).send('no tx_ref');

    // tx_ref format: order_<docId>
    const parts = tx_ref.split('_');
    const orderId = parts.slice(1).join('_');

    // Update order doc if exists
    const snap = await getDocs(collection(db, 'orders'));
    snap.forEach(async (d) => {
      if (d.id === orderId) {
        await updateDoc(doc(db, 'orders', d.id), { status: status === 'successful' ? 'paid' : 'failed', flutterwaveData: event.data });
      }
    });

    return res.status(200).send('ok');
  } catch (e) {
    console.error(e);
    return res.status(500).send('error');
  }
}
