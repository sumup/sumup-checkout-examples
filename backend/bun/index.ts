import SumUp from "@sumup/sdk";

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

const port = Number(process.env.PORT) || 8080;

Bun.serve({
  port,
  async fetch(req) {
    const url = new URL(req.url);
    if (req.method !== "POST" || url.pathname !== "/checkouts") {
      return new Response("Not found", { status: 404 });
    }

    let payload: { amount?: number };
    try {
      payload = (await req.json()) as { amount?: number };
    } catch {
      return Response.json({ error: "invalid json" }, { status: 400 });
    }

    const amount = Number(payload.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return Response.json(
        { error: "amount must be a positive number" },
        { status: 400 },
      );
    }

    try {
      const checkout = await client.checkouts.create({
        amount,
        currency: "EUR",
        merchant_code: merchantCode,
        checkout_reference: `checkout-${crypto.randomUUID()}`,
      });

      return Response.json(checkout, { status: 201 });
    } catch (error) {
      console.error("Failed to create checkout:", error);
      return Response.json(
        { error: "failed to create checkout" },
        { status: 500 },
      );
    }
  },
});

console.log(`Bun server listening on http://localhost:${port}`);
