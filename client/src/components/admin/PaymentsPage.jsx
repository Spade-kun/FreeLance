import { useState } from "react";

export default function PaymentsPage() {
  const [payerName, setPayerName] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");

  const processPayment = () => {
    if (!payerName.trim() || !amount || Number(amount) <= 0) {
      alert("Please enter payer name and amount.");
      return;
    }

    setMessage("Processing...");

    setTimeout(() => {
      const txID = "TX" + (Date.now() + Math.floor(Math.random() * 999));
      setMessage(`✅ Payment successful for ₱${Number(amount).toFixed(2)} — ${txID}`);
      
      // Reset fields
      setPayerName("");
      setAmount("");
    }, 700);
  };

  return (
    <div className="card">
      <h2>Payment</h2>

      <div className="form-row">
        <input
          type="text"
          placeholder="Payer Name"
          value={payerName}
          onChange={(e) => setPayerName(e.target.value)}
        />
      </div>

      <div className="form-row">
        <input
          type="number"
          placeholder="Amount (PHP)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      <div className="form-row">
        <button className="btn" onClick={processPayment}>
          Process Payment
        </button>
      </div>

      <p className="muted small">{message}</p>
    </div>
  );
}
