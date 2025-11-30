// pages/product/[id].js
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { doc, getDoc, addDoc, collection, updateDoc } from "firebase/firestore";
import { db, storage } from '../../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth } from 'firebase/auth';

export default function ProductPage({ user }) {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState(null);
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [momoNumber, setMomoNumber] = useState(null);

  useEffect(() => {
    async function loadProduct() {
      if (!id) return;
      const d = await getDoc(doc(db, 'products', id));
      if (d.exists()) setProduct({ id: d.id, ...d.data() });
    }
    loadProduct();
  }, [id]);

  useEffect(() => {
    async function loadMomo() {
      try {
        const r = await fetch('/api/get-momo');
        const j = await r.json();
        setMomoNumber(j.momo);
      } catch (e) {
        console.warn('no momo configured', e);
      }
    }
    loadMomo();
  }, []);

  async function handleCreateOrder(e) {
    e.preventDefault();
    if (!user) return alert('Please sign in to buy.');
    if (!product) return;

    setStatus('Creating order...');

    const order = {
      productId: product.id,
      productTitle: product.title,
      price: product.price || 0,
      buyerUid: user.uid,
      buyerEmail: user.email || null,
      phone,
      note,
      status: 'pending_manual',
      createdAt: new Date().toISOString(),
      receiptUrl: null
    };

    try {
      const docRef = await addDoc(collection(db, 'orders'), order);
      setStatus('Order created. Please send payment to the MoMo number and upload the receipt below.');

      // Optionally upload file immediately if user attached screenshot before submitting
      if (file) {
        setStatus('Uploading receipt...');
        const storageRef = ref(storage, `receipts/${docRef.id}/${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        await updateDoc(doc(db, 'orders', docRef.id), { receiptUrl: url });
        setStatus('Receipt uploaded. Admin will verify and mark order paid.');
      }
    } catch (err) {
      console.error(err);
      setStatus('Error creating order.');
    }
  }

  async function handleUploadReceiptToOrder(orderId) {
    if (!file) return alert('Choose a file first.');
    setStatus('Uploading receipt...');
    try {
      const storageRef = ref(storage, `receipts/${orderId}/${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await updateDoc(doc(db, 'orders', orderId), { receiptUrl: url });
      setStatus('Receipt uploaded. Admin will verify.');
    } catch (e) {
      console.error(e);
      setStatus('Upload failed.');
    }
  }

  return (
    <div>
      {!product && <p>Loading product...</p>}
      {product && (
        <>
          <h1 className="text-2xl font-bold mb-2">{product.title}</h1>
          <p className="mb-2">{product.description}</p>
          <p className="mb-4 font-bold">Price: {product.price} USD</p>

          <div className="p-4 border rounded mb-4">
            <h3>Manual MoMo Payment</h3>
            <p>Send payment to: <strong>{momoNumber || 'Loading...'}</strong></p>
            <p>Network: MTN MoMo / Orange Money (customer selects their own network)</p>
            <form onSubmit={handleCreateOrder} className="mt-3 grid gap-2">
              <input required placeholder="Your phone number used for MoMo" value={phone} onChange={e=>setPhone(e.target.value)} className="p-2 border rounded"/>
              <input placeholder="Note (optional)" value={note} onChange={e=>setNote(e.target.value)} className="p-2 border rounded"/>
              <label className="text-sm mt-2">Attach receipt screenshot (optional now or upload in Dashboard):</label>
              <input type="file" accept="image/*" onChange={(e)=>setFile(e.target.files[0])} />
              <button className="px-4 py-2 border rounded mt-2">Create Order (Manual MoMo)</button>
            </form>
            <p className="text-sm mt-2 text-gray-600">After you send the money to our MoMo number above, upload the receipt (or attach here) so admin can verify and mark the order as paid.</p>
            <p className="text-sm mt-2 text-red-600">Important: Do not share PIN or sensitive info — only share the transaction ID or screenshot.</p>
            <p className="mt-2 text-sm">{status}</p>
          </div>

          <div className="p-4 border rounded">
            <h3>Optional - Pay with Flutterwave (cards) </h3>
            <p className="text-sm mb-2">If you want to pay by card, click below (requires Flutterwave setup).</p>
            <form method="POST" action="/api/create-order">
              <input type="hidden" name="productId" value={product.id} />
              <input type="hidden" name="productTitle" value={product.title} />
              <input type="hidden" name="price" value={product.price} />
              <button type="submit" className="px-4 py-2 border rounded">Pay with Card (Flutterwave)</button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
