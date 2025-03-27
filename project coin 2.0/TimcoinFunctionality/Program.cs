using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.DependencyInjection;
using System.Numerics;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddSignalR();
builder.Services.AddSingleton<Miner>();
builder.Services.AddControllers();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllOrigins", builder =>
    {
        builder.WithOrigins("http://127.0.0.1:5500")
               .AllowAnyMethod()
               .AllowAnyHeader()
               .AllowCredentials();
    });
});

var app = builder.Build();
app.UseRouting();
app.UseCors("AllowAllOrigins");
app.MapHub<MinerHub>("/miningHub");

using var scope = app.Services.CreateScope();
var hubContext = scope.ServiceProvider.GetRequiredService<IHubContext<MinerHub>>();

Miner miner = new Miner(hubContext);
CancellationTokenSource? currentCts = null;

app.MapPost("/startMining", async (HttpContext context, IHubContext<MinerHub> hubContext) =>
{
    var requestBody = await new StreamReader(context.Request.Body).ReadToEndAsync();
    var requestData = JsonSerializer.Deserialize<Dictionary<string, string>>(requestBody);

    if (requestData == null || !requestData.TryGetValue("blocks", out string? blocksStr) || !BigInteger.TryParse(blocksStr, out BigInteger blocks))
    {
        context.Response.StatusCode = 400;
        await context.Response.WriteAsync(JsonSerializer.Serialize(new { error = "Invalid block value!" }));
        return;
    }

    if (currentCts != null)
    {
        currentCts.Cancel(); // ✅ Cancel previous mining session
        await hubContext.Clients.All.SendAsync("MiningCanceled", "Mining was canceled.");
    }

    currentCts = new CancellationTokenSource();
    try
    {
        (string textResult, int coinsReceived) miningResult = await miner.MineCoin(blocks, currentCts.Token);

        var jsonResponse = JsonSerializer.Serialize(new
        {
            textResult = miningResult.textResult,
            coinsReceived = miningResult.coinsReceived,
        });

        context.Response.ContentType = "application/json; charset=utf-8";
        await context.Response.WriteAsync(jsonResponse);
    }
    catch (Exception ex)
    {
        context.Response.StatusCode = 500;
        await context.Response.WriteAsync(JsonSerializer.Serialize(new { error = "Mining process failed", details = ex.Message }));
    }
});

app.MapPost("/cancelMining", async (HttpContext context) =>
{
    if (currentCts != null)
    {
        currentCts.Cancel(); // ✅ Stop mining
        currentCts = null; // ✅ Reset for new requests
        context.Response.StatusCode = 200;
        await context.Response.WriteAsync(JsonSerializer.Serialize(new { message = "Mining canceled successfully." }));
    }
    else
    {
        context.Response.StatusCode = 400;
        await context.Response.WriteAsync(JsonSerializer.Serialize(new { error = "No active mining session." }));
    }
});

// Ensure the server runs on port 5000
app.Run("http://localhost:5000");