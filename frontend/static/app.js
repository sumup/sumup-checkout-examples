const payButton = document.getElementById("pay-button");
const amountInput = document.getElementById("amount");
const backendInput = document.getElementById("backend-url");
const sumupCard = document.getElementById("sumup-card");
const messageDiv = document.getElementById("message");
const loadingDiv = document.getElementById("loading");
const formPanel = document.getElementById("form-panel");
const widgetPanel = document.getElementById("widget-panel");
const startOverButton = document.getElementById("start-over");
const DEFAULT_BACKEND_URL = "http://localhost:8080";

const backendFromQuery = new URLSearchParams(window.location.search).get(
  "backend",
);
if (backendFromQuery) {
  backendInput.value = backendFromQuery;
} else {
  backendInput.value = DEFAULT_BACKEND_URL;
}

function showMessage(text, type) {
  messageDiv.textContent = text;
  messageDiv.className = `message ${type}`;
  messageDiv.style.display = "block";
}

function hideMessage() {
  messageDiv.style.display = "none";
  messageDiv.textContent = "";
  messageDiv.className = "message";
}

function setLoading(isLoading) {
  loadingDiv.style.display = isLoading ? "block" : "none";
  payButton.disabled = isLoading;
}

function showWidget() {
  formPanel.style.display = "none";
  widgetPanel.style.display = "block";
}

function showForm() {
  widgetPanel.style.display = "none";
  formPanel.style.display = "block";
}

function resolveCheckoutId(payload) {
  return payload?.id || payload?.checkout_id || payload?.checkoutId;
}

payButton.addEventListener("click", async () => {
  const amount = Number.parseFloat(amountInput.value);

  if (!Number.isFinite(amount) || amount <= 0) {
    showMessage("Please enter a valid amount.", "error");
    return;
  }

  hideMessage();
  setLoading(true);
  showWidget();

  const backendUrl = backendInput.value.trim();
  const endpoint = new URL(
    "/checkouts",
    backendUrl || DEFAULT_BACKEND_URL,
  ).toString();

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount }),
    });

    let payload = null;
    try {
      payload = await response.json();
    } catch (error) {
      payload = null;
    }

    if (!response.ok) {
      const message = payload?.error || "Failed to create checkout";
      throw new Error(message);
    }

    const checkoutId = resolveCheckoutId(payload);
    if (!checkoutId) {
      throw new Error("Missing checkout ID in response");
    }

    setLoading(false);

    if (window.SumUpCard?.unmount) {
      window.SumUpCard.unmount("sumup-card");
    }

    window.SumUpCard.mount({
      id: "sumup-card",
      checkoutId,
      onResponse: (type, body) => {
        if (type === "success") {
          showMessage(
            `Payment successful! Transaction ID: ${body.transaction_id || "N/A"}`,
            "success",
          );
          setLoading(false);
        } else if (type === "error") {
          showMessage(
            `Payment failed: ${body.message || "Unknown error"}`,
            "error",
          );
          setLoading(false);
        }
      },
    });
  } catch (error) {
    setLoading(false);
    showMessage(`Error: ${error.message}`, "error");
    showForm();
  }
});

startOverButton.addEventListener("click", () => {
  if (window.SumUpCard?.unmount) {
    window.SumUpCard.unmount("sumup-card");
  }
  hideMessage();
  setLoading(false);
  showForm();
});
