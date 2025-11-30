// components/Nav.js
import Link from 'next/link';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';

export default function Nav() {
  const [user, setUser] = useState(null);
  useEffect(() => onAuthStateChanged(auth, u => setUser(u)), []);

  return (
    <nav className="bg-gray-100 py-3 mb-6">
      <div className="container flex justify-between items-center">
        <div>
          <Link href="/"><a className="font-bold text-xl">MoMoStore</a></Link>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/"><a>Shop</a></Link>
          <Link href="/dashboard"><a>Dashboard</a></Link>
          <Link href="/admin"><a>Admin</a></Link>
          {user ? (
            <>
              <span className="text-sm">Hi, {user.displayName || user.email}</span>
              <button onClick={() => signOut(auth)} className="px-3 py-1 border rounded">Sign out</button>
            </>
          ) : (
            <Link href="/"><a className="px-3 py-1 border rounded">Sign in</a></Link>
          )}
        </div>
      </div>
    </nav>
  );
}
