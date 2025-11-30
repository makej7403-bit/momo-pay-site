// pages/index.js
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function Home() {
  const [products, setProducts] = useState([]);
  useEffect(() => {
    async function load() {
      try {
        const snap = await getDocs(collection(db, 'products'));
        setProducts(snap.docs.map(d=>({ id:d.id, ...d.data() })));
      } catch(e) { console.error(e); }
    }
    load();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Products</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {products.length === 0 && <p>No products found. Seed the Firestore `products` collection.</p>}
        {products.map(p => (
          <div key={p.id} className="p-4 border rounded">
            <h2 className="font-semibold">{p.title}</h2>
            <p className="text-sm">{p.description}</p>
            <div className="mt-2 flex justify-between items-center">
              <span className="font-bold">{p.price} USD</span>
              <Link href={`/product/${p.id}`}><a className="px-3 py-1 border rounded">Buy</a></Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
