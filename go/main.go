package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"

	"github.com/google/uuid"
	"github.com/sumup/sumup-go"
	sumupclient "github.com/sumup/sumup-go/client"
	"github.com/sumup/sumup-go/checkouts"
	"github.com/sumup/sumup-go/shared"
)

type createCheckoutRequest struct {
	Amount float32 `json:"amount"`
}

func main() {
	apiKey := os.Getenv("SUMUP_API_KEY")
	merchantCode := os.Getenv("SUMUP_MERCHANT_CODE")
	if apiKey == "" {
		log.Fatal("Missing SUMUP_API_KEY env var.")
	}
	if merchantCode == "" {
		log.Fatal("Missing SUMUP_MERCHANT_CODE env var.")
	}

	client := sumup.NewClient(sumupclient.WithAPIKey(apiKey))

	http.HandleFunc("/checkouts", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			w.WriteHeader(http.StatusNotFound)
			return
		}

		var payload createCheckoutRequest
		if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid json"})
			return
		}

		if payload.Amount <= 0 {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "amount must be a positive number"})
			return
		}

		checkout, err := client.Checkouts.Create(r.Context(), checkouts.Create{
			Amount:            payload.Amount,
			Currency:          shared.CurrencyEUR,
			MerchantCode:      merchantCode,
			CheckoutReference: "checkout-" + uuid.NewString(),
		})
		if err != nil {
			log.Printf("[ERROR] create checkout: %v", err)
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to create checkout"})
			return
		}

		writeJSON(w, http.StatusCreated, checkout)
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Go server listening on http://localhost:%s", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}

func writeJSON(w http.ResponseWriter, status int, payload interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}
