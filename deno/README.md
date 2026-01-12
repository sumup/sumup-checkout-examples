# Deno example

## Run

```sh
export SUMUP_API_KEY="your_api_key"
export SUMUP_MERCHANT_CODE="your_merchant_code"

deno run --allow-env --allow-net main.ts
```

## Test

```sh
curl -X POST http://localhost:8080/checkouts \
  -H "Content-Type: application/json" \
  -d '{"amount": 10.0}'
```
