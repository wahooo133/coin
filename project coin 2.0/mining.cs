using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using System.Diagnostics;
using System.Threading.Tasks;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();

var app = builder.Build();

app.MapGet("/startMining", async (HttpContext context) =>
{
    Timcoin tm = new Timcoin();
    (string textResult, int coinsRecieved) miningResult = tm.MineCoin(1000000); // Get return value
    var jsonResponse = JsonSerializer.Serialize(new 
    { 
        textResult = miningResult.textResult, 
        coinsReceived = miningResult.coinsReceived 
    });

    context.Response.ContentType = "application/json"; // Tell browser it's JSON
    await context.Response.WriteAsync(jsonResponse);
});

app.Run();

public class Timcoin
{
    private readonly Random random = new Random();
    public (string, int) MineCoin(int blocks)
    {
        if (blocks <= 0)
            return ("Invalid block amount specified!", 0);

        double percentage = 2.88e-7; // For a 25% chance of getting at least one coin when mining 1,000,000 blocks, the probability per block should be approximately 2.88 × 10⁻⁷ (or 0.000000288).

        for (int i = 1; i <= blocks; i++)
        {

            double chance = random.NextDouble();

            if (chance <= percentage)
            {
                Console.WriteLine("CHANCE " + chance);
                return ("You mined and received 1 coin!", 1);
            }
        }
        return ("No coins found this time...", 0);
    }
} 