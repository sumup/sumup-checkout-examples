using SumUp;

var apiKey = Environment.GetEnvironmentVariable("SUMUP_API_KEY");
var merchantCode = Environment.GetEnvironmentVariable("SUMUP_MERCHANT_CODE");

if (string.IsNullOrWhiteSpace(apiKey))
{
    throw new InvalidOperationException("Missing SUMUP_API_KEY env var.");
}

if (string.IsNullOrWhiteSpace(merchantCode))
{
    throw new InvalidOperationException("Missing SUMUP_MERCHANT_CODE env var.");
}

using var client = new SumUpClient(new SumUpClientOptions
{
    AccessToken = apiKey,
});

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapPost("/checkouts", async (CreateCheckoutRequest request) =>
{
    if (request.Amount <= 0)
    {
        return Results.BadRequest(new { error = "amount must be a positive number" });
    }

    var checkoutResponse = await client.Checkouts.CreateAsync(new CheckoutCreateRequest
    {
        Amount = request.Amount,
        Currency = Currency.Eur,
        CheckoutReference = $"checkout-{Guid.NewGuid():N}",
        MerchantCode = merchantCode,
    });

    return Results.Created($"/checkouts/{checkoutResponse.Data?.Id}", checkoutResponse.Data);
});

var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
app.Urls.Add($"http://localhost:{port}");

app.Run();

internal sealed record CreateCheckoutRequest(float Amount);
