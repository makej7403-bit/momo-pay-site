"use client";
import { useState } from "react";

export default function Home() {
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("");

  const payNow = async () => {
    setStatus("Processing...");

    const res = await fetch("/api/momo-pay", {
      method: "POST",
      body: JSON.stringify({ phone, amount }),
    });

    const data = await res.json();
    setStatus(data.message);
  };

  return (
    <div style={{ padding: 30 }}>
      <h1>Pay with MTN MoMo</h1>

      <input
        placeholder="Customer Phone Number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        style={{ border: "1px solid #ccc", padding: 10, marginRight: 10 }}
      />

      <input
        placeholder="Amount (LRD)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        style={{ border: "1px solid #ccc", padding: 10 }}
      />

      <br /><br />
      <button
        onClick={payNow}
        style={{ padding: 10, backgroundColor: "black", color: "white" }}
      >
        Pay Now
      </button>

      <p style={{ marginTop: 20 }}>{status}</p>
    </div>
  );
}
