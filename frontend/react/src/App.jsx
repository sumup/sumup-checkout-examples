import { useEffect, useMemo, useState } from "react";

const DEFAULT_AMOUNT = "10.00";
const DEFAULT_BACKEND_URL = "http://localhost:8080";

function resolveCheckoutId(payload) {
  return payload?.id || payload?.checkout_id || payload?.checkoutId;
}

export default function App() {
  const [amount, setAmount] = useState(DEFAULT_AMOUNT);
  const [backendUrl, setBackendUrl] = useState(DEFAULT_BACKEND_URL);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [checkoutId, setCheckoutId] = useState(null);

  const endpoint = useMemo(() => {
    const trimmed = backendUrl.trim();
    return new URL("/checkouts", trimmed || DEFAULT_BACKEND_URL).toString();
  }, [backendUrl]);

  useEffect(() => {
    if (!checkoutId || !window.SumUpCard) {
      return;
    }

    if (window.SumUpCard.unmount) {
      window.SumUpCard.unmount("sumup-card");
    }

    window.SumUpCard.mount({
      id: "sumup-card",
      checkoutId,
      onResponse: (type, body) => {
        if (type === "success") {
          setMessage({
            type: "success",
            text: `Payment successful! Transaction ID: ${body.transaction_id || "N/A"}`,
          });
          setLoading(false);
        } else if (type === "error") {
          setMessage({
            type: "error",
            text: `Payment failed: ${body.message || "Unknown error"}`,
          });
          setLoading(false);
        }
      },
    });
  }, [checkoutId]);

  const handleStartOver = () => {
    if (window.SumUpCard?.unmount) {
      window.SumUpCard.unmount("sumup-card");
    }
    setCheckoutId(null);
    setMessage(null);
    setLoading(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const parsed = Number.parseFloat(amount);

    if (!Number.isFinite(parsed) || parsed <= 0) {
      setMessage({ type: "error", text: "Please enter a valid amount." });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: parsed }),
      });

      let payload = null;
      try {
        payload = await response.json();
      } catch (error) {
        payload = null;
      }

      if (!response.ok) {
        const errorMessage = payload?.error || "Failed to create checkout";
        throw new Error(errorMessage);
      }

      const id = resolveCheckoutId(payload);
      if (!id) {
        throw new Error("Missing checkout ID in response");
      }

      setCheckoutId(id);
    } catch (error) {
      setMessage({ type: "error", text: `Error: ${error.message}` });
      setLoading(false);
    }
  };

  return (
    <main className="page">
      <section className="card">
        <header className="header">
          <p className="eyebrow">SumUp Card Widget</p>
          <h1>React Checkout Starter</h1>
          <p className="subtitle">
            This UI creates a checkout via any backend example and renders the card widget.
          </p>
        </header>

        {checkoutId ? (
          <div className="panel">
            <div id="sumup-card" className="widget" />
            <button type="button" onClick={handleStartOver}>
              Start over
            </button>
          </div>
        ) : (
          <form className="panel" onSubmit={handleSubmit}>
            <label className="field">
              <span>Backend base URL</span>
              <input
                type="url"
                placeholder="http://localhost:8080"
                value={backendUrl}
                onChange={(event) => setBackendUrl(event.target.value)}
              />
            </label>

            <label className="field">
              <span>Amount (EUR)</span>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
              />
            </label>

            <button type="submit" disabled={loading}>
              {loading ? "Creating checkout..." : "Create checkout"}
            </button>
            <p className="hint">Defaults to http://localhost:8080.</p>
          </form>
        )}

        {message ? (
          <div className={`message ${message.type}`}>{message.text}</div>
        ) : null}
      </section>
    </main>
  );
}
