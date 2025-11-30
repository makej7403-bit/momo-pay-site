// pages/dashboard/index.js
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../lib/firebase';

export default function Dashboard({ user }) {
  const [orders, setOrders] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!user) return;
    (async () => {
      const q = query(collection(db, 'orders'), where('buyerUid','==', user.uid));
      const snap = await getDocs(q);
      setOrders(snap.docs.map(d=>({ id: d.id, ...d.data() })));
    })();
  }, [user]);

  async function uploadReceipt(orderId) {
    if (!selectedFile) return alert('Choose receipt file first');
    setMsg('Uploading...');
    try {
      const storageRef = ref(storage, `receipts/${orderId}/${selectedFile.name}`);
      await uploadBytes(storageRef, selectedFile);
      const url = await getDownloadURL(storageRef);
      await updateDoc(doc(db, 'orders', orderId), { receiptUrl: url });

      // Notify admin
      await fetch('/api/notify-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, receiptUrl: url, productTitle: 'Order receipt', buyerEmail: user.email })
      });

      setMsg('Receipt uploaded, admin will verify soon.');
    } catch (e) {
      console.error(e);
      setMsg('Upload failed.');
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Your Orders</h1>
      {!user && <p>Please sign in to see orders.</p>}
      {user && (
        <>
          <div className="mb-3">
            <label className="block">Choose receipt file to upload (then click Upload):</label>
            <input type="file" accept="image/*" onChange={(e)=>setSelectedFile(e.target.files[0])} />
          </div>
          {orders.length === 0 && <p>No orders yet.</p>}
          {orders.map(o => (
            <div key={o.id} className="p-3 border rounded mb-3">
              <div className="flex justify-between">
                <div><strong>{o.productTitle}</strong><div className="text-sm text-gray-600">{o.status}</div></div>
                <div>
                  {o.downloadUrl && <a className="text-blue-600" href={o.downloadUrl} target="_blank">Download</a>}
                </div>
              </div>
              <div>Receipt: {o.receiptUrl ? <a href={o.receiptUrl} target="_blank">view</a> : 'none'}</div>
              {o.status !== 'paid' && <button onClick={()=>uploadReceipt(o.id)} className="px-3 py-1 border rounded mt-2">Upload Receipt for this Order</button>}
            </div>
          ))}
          {msg && <p className="mt-3 text-sm text-green-700">{msg}</p>}
        </>
      )}
    </div>
  );
}
