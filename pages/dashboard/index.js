// pages/dashboard/index.js (only the important parts)
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../lib/firebase';

export default function Dashboard({ user }) {
  const [orders, setOrders] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!user) return;
    (async function load() {
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
      setMsg('Receipt uploaded, admin will verify soon.');
    } catch (e) {
      console.error(e);
      setMsg('Upload failed.');
    }
  }

  return (
    <div>
      <h1>Your Orders</h1>
      <input type="file" accept="image/*" onChange={(e)=>setSelectedFile(e.target.files[0])} />
      {orders.map(o => (
        <div key={o.id}>
          <div><strong>{o.productTitle}</strong> — {o.status}</div>
          <div>Receipt: {o.receiptUrl ? <a href={o.receiptUrl} target="_blank">view</a> : 'none'}</div>
          {o.status !== 'paid' && <button onClick={()=>uploadReceipt(o.id)}>Upload Receipt for this Order</button>}
        </div>
      ))}
      <div>{msg}</div>
    </div>
  );
}
