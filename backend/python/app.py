import os
import uuid

from flask import Flask, jsonify, request
from sumup import Sumup
from sumup.checkouts import CreateCheckoutBody

api_key = os.environ.get("SUMUP_API_KEY")
merchant_code = os.environ.get("SUMUP_MERCHANT_CODE")

if not api_key:
    raise SystemExit("Missing SUMUP_API_KEY env var.")

if not merchant_code:
    raise SystemExit("Missing SUMUP_MERCHANT_CODE env var.")

client = Sumup(api_key=api_key)

app = Flask(__name__)


@app.post("/checkouts")
def create_checkout():
    data = request.get_json(silent=True) or {}
    try:
        amount = float(data.get("amount", 0))
    except (TypeError, ValueError):
        amount = 0

    if amount <= 0:
        return jsonify({"error": "amount must be a positive number"}), 400

    checkout = client.checkouts.create(
        body=CreateCheckoutBody(
            amount=amount,
            currency="EUR",
            checkout_reference=f"checkout-{uuid.uuid4()}",
            merchant_code=merchant_code,
        )
    )

    if hasattr(checkout, "model_dump"):
        payload = checkout.model_dump()
    else:
        payload = checkout.dict()

    return jsonify(payload), 201


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "8080"))
    app.run(host="0.0.0.0", port=port)
