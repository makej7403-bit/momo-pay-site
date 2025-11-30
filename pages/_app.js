// pages/_app.js
import '../styles/globals.css'
import Nav from '../components/Nav';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';

function MyApp({ Component, pageProps }) {
  const [user, setUser] = useState(null);
  useEffect(() => onAuthStateChanged(auth, u => setUser(u)), []);
  return (
    <>
      <Nav />
      <main className="container">
        <Component {...pageProps} user={user} />
      </main>
    </>
  );
}
export default MyApp;
