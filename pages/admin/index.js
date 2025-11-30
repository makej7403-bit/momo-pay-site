// pages/admin/index.js
import { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default function Admin({ user }) {
  const [orders, setOrders] = useState([]);
  useEffect(() => {
    if (!user) return;
    // quick guard by email (replace with proper Firestore isAdmin check in production)
    if (user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      setOrders([]);
      return;
    }
    (async () => {
      const snap = await getDocs(collection(db, 'orders'));
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    })();
  }, [user]);

  async function markPaid(orderId) {
    await updateDoc(doc(db, 'orders', orderId), { status: 'paid', paidAt: new Date().toISOString() });
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'paid' } : o));
  }

  async function attachDownload(orderId) {
    const url = prompt('Enter download URL (public or signed):');
    if (!url) return;
    await updateDoc(doc(db, 'orders', orderId), { downloadUrl: url });
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, downloadUrl: url } : o));
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Admin - Orders</h1>
      {user?.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL && <p>Not authorized. Set NEXT_PUBLIC_ADMIN_EMAIL to your admin email in env.</p>}
      {orders.map(o => (
        <div key={o.id} className="p-3 border mb-2 rounded">
          <div className="flex justify-between items-center">
            <div>
              <div><strong>{o.productTitle}</strong></div>
              <div className="text-sm">{o.status} • {o.phone || ''}</div>
              <div className="text-sm">Receipt: {o.receiptUrl ? <a href={o.receiptUrl} target="_blank">view</a> : 'none'}</div>
            </div>
            <div className="flex gap-2">
              {o.status !== 'paid' && <button onClick={() => markPaid(o.id)} className="px-2 py-1 border rounded">Mark paid</button>}
              <button onClick={() => attachDownload(o.id)} className="px-2 py-1 border rounded">Attach file</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
