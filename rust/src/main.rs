use axum::{routing::post, Json, Router};
use serde::{Deserialize, Serialize};
use std::{env, net::SocketAddr};
use sumup::{checkouts, Client, Currency};

#[derive(Deserialize)]
struct CreateCheckoutRequest {
    amount: f32,
}

#[derive(Serialize)]
struct ErrorResponse {
    error: String,
}

#[tokio::main]
async fn main() {
    let api_key = env::var("SUMUP_API_KEY").expect("Missing SUMUP_API_KEY env var.");
    let merchant_code = env::var("SUMUP_MERCHANT_CODE")
        .expect("Missing SUMUP_MERCHANT_CODE env var.");

    let client = Client::new().with_authorization(&api_key);

    let app = Router::new().route(
        "/checkouts",
        post(move |Json(payload): Json<CreateCheckoutRequest>| {
            let client = client.clone();
            let merchant_code = merchant_code.clone();
            async move {
                if !payload.amount.is_finite() || payload.amount <= 0.0 {
                    return Err((
                        axum::http::StatusCode::BAD_REQUEST,
                        Json(ErrorResponse {
                            error: "amount must be a positive number".to_string(),
                        }),
                    ));
                }

                let request = checkouts::CheckoutCreateRequest {
                    checkout_reference: format!("checkout-{}", uuid::Uuid::new_v4()),
                    amount: payload.amount,
                    currency: Currency::EUR,
                    merchant_code: merchant_code.clone(),
                    description: None,
                    return_url: None,
                    customer_id: None,
                    purpose: None,
                    id: None,
                    status: None,
                    date: None,
                    valid_until: None,
                    transactions: None,
                    redirect_url: None,
                };

                match client.checkouts().create(request).await {
                    Ok(checkout) => Ok((axum::http::StatusCode::CREATED, Json(checkout))),
                    Err(err) => {
                        eprintln!("Failed to create checkout: {err}");
                        Err((
                            axum::http::StatusCode::INTERNAL_SERVER_ERROR,
                            Json(ErrorResponse {
                                error: "failed to create checkout".to_string(),
                            }),
                        ))
                    }
                }
            }
        }),
    );

    let port: u16 = env::var("PORT")
        .unwrap_or_else(|_| "8080".to_string())
        .parse()
        .expect("PORT must be a valid number");

    let addr = SocketAddr::from(([127, 0, 0, 1], port));
    println!("Rust server listening on http://{addr}");

    axum::serve(tokio::net::TcpListener::bind(addr).await.unwrap(), app)
        .await
        .unwrap();
}
