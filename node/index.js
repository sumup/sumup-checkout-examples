import crypto from "node:crypto";
import SumUp from "@sumup/sdk";
import express from "express";

const apiKey = process.env.SUMUP_API_KEY;
const merchantCode = process.env.SUMUP_MERCHANT_CODE;

if (!apiKey) {
  console.error("Missing SUMUP_API_KEY env var.");
  process.exit(1);
}

if (!merchantCode) {
  console.error("Missing SUMUP_MERCHANT_CODE env var.");
  process.exit(1);
}

const client = new SumUp({ apiKey });

const app = express();
app.use(express.json());

app.post("/checkouts", async (req, res) => {
  const amount = Number(req.body?.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return res.status(400).json({ error: "amount must be a positive number" });
  }

  try {
    const checkout = await client.checkouts.create({
      amount,
      currency: "EUR",
      merchant_code: merchantCode,
      checkout_reference: `checkout-${crypto.randomUUID()}`,
    });

    return res.status(201).json(checkout);
  } catch (error) {
    console.error("Failed to create checkout:", error);
    return res.status(500).json({ error: "failed to create checkout" });
  }
});

const port = Number(process.env.PORT) || 8080;
app.listen(port, () => {
  console.log(`Node server listening on http://localhost:${port}`);
});
