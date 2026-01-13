<div align="center">

# SumUp Checkout Examples

[![Documentation][docs-badge]](https://developer.sumup.com)
[![License](https://img.shields.io/github/license/sumup/sumup-checkout-examples)](./LICENSE)

</div>

Learn how to quickly collect payments with SumUp checkouts. In this repository you will find backend examples for all our SDKs and a few sample frontends to get you started with accepting your first online payment.

All you need to get started is an API key (if you don't have one yet, create it in the [SumUp Dashboard](https://me.sumup.com/settings/api-keys)) and your merchant code (which you can find in the [settings](https://me.sumup.com/settings)). We recommend starting with a Sandbox account that you can create in [the dashboard](https://me.sumup.com/settings/developer) to be able to test as many payments as you want without processing real money.

Set your environment:

```sh
export SUMUP_API_KEY="your_api_key"
export SUMUP_MERCHANT_CODE="your_merchant_code"
```

## Backend Examples

Minimal servers that expose `POST /checkouts` and use the SumUp SDKs, plus front-end examples that mount the card widget.

- **Node.js SDK** (https://github.com/sumup/sumup-ts)
  - Runtime: [Node.js](./backend/node/)
    ```sh
    cd backend/node
    npm install
    npm start
    ```
  - Runtime: [Bun](./backend/bun/)
    ```sh
    cd backend/bun
    bun install
    bun run index.ts
    ```
  - Runtime: [Deno](./backend/deno/)
    ```sh
    cd backend/deno
    deno run --allow-env --allow-net main.ts
    ```

- **Python SDK** (https://github.com/sumup/sumup-py)
  ```sh
  cd backend/python
  uv run app.py
  ```

- **Java SDK** (https://github.com/sumup/sumup-java)
  ```sh
  cd backend/java
  gradle run
  ```

- **Go SDK** (https://github.com/sumup/sumup-go)
  ```sh
  cd backend/go
  go run .
  ```

- **Rust SDK** (https://github.com/sumup/sumup-rs)
  ```sh
  cd backend/rust
  cargo run
  ```

- **.NET SDK** (https://github.com/sumup/sumup-dotnet)
  ```sh
  cd backend/dotnet
  dotnet run
  ```

## Frontend Examples

Both front-ends create a checkout via `POST /checkouts` and mount the SumUp card widget for a one-time payment.

- [Static](./frontend/static/)
- [React](./frontend/react/)

## Environment

All backend examples use:

```sh
export SUMUP_API_KEY="your_api_key"
export SUMUP_MERCHANT_CODE="your_merchant_code"
```

If the front-end is served from another origin, enable CORS on the backend or use a proxy.

[docs-badge]: https://img.shields.io/badge/SumUp-documentation-white.svg?logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgY29sb3I9IndoaXRlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogICAgPHBhdGggZD0iTTIyLjI5IDBIMS43Qy43NyAwIDAgLjc3IDAgMS43MVYyMi4zYzAgLjkzLjc3IDEuNyAxLjcxIDEuN0gyMi4zYy45NCAwIDEuNzEtLjc3IDEuNzEtMS43MVYxLjdDMjQgLjc3IDIzLjIzIDAgMjIuMjkgMFptLTcuMjIgMTguMDdhNS42MiA1LjYyIDAgMCAxLTcuNjguMjQuMzYuMzYgMCAwIDEtLjAxLS40OWw3LjQ0LTcuNDRhLjM1LjM1IDAgMCAxIC40OSAwIDUuNiA1LjYgMCAwIDEtLjI0IDcuNjlabTEuNTUtMTEuOS03LjQ0IDcuNDVhLjM1LjM1IDAgMCAxLS41IDAgNS42MSA1LjYxIDAgMCAxIDcuOS03Ljk2bC4wMy4wM2MuMTMuMTMuMTQuMzUuMDEuNDlaIiBmaWxsPSJjdXJyZW50Q29sb3IiLz4KPC9zdmc+
