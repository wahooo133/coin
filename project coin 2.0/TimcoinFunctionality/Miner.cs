using Microsoft.AspNetCore.SignalR;
using System;
using System.Numerics;
using System.Threading;
using System.Threading.Tasks;

public class MinerHub : Hub { }

public class Miner
{
    private readonly Random random = new Random();
    private readonly IHubContext<MinerHub> _hubContext;
    private Task? _miningTask; // ✅ Store reference to the running task
    private CancellationTokenSource? _cts; // ✅ Store cancellation token

    public bool IsMining => _miningTask != null && !_miningTask.IsCompleted; // ✅ Track mining state

    public Miner(IHubContext<MinerHub> hubContext)
    {
        _hubContext = hubContext;
    }

    // ✅ Start mining and store the task reference
    public async Task StartMining(BigInteger blocks, CancellationTokenSource cts)
    {
        if (IsMining)
        {
            await _hubContext.Clients.All.SendAsync("MiningCanceled", "Mining is already in progress.");
            return;
        }

        _cts = cts;
        _miningTask = MineCoin(blocks, cts.Token);
    }

    // ✅ Async mining loop
    public async Task<(string, int)> MineCoin(BigInteger blocks, CancellationToken cancellationToken)
    {
        double percentage = 2.88e-7; // ✅ Probability per block

        for (BigInteger i = 1; i <= blocks; i++)
        {
            if (cancellationToken.IsCancellationRequested)
            {
                await _hubContext.Clients.All.SendAsync("MiningCanceled", "Mining was canceled.");
                return ("Mining was canceled.", 0);
            }

            await _hubContext.Clients.All.SendAsync("UpdateMiningStatus", $"Currently mining block: {i}");

            double chance = random.NextDouble();
            if (chance <= percentage)
            {
                await _hubContext.Clients.All.SendAsync("MiningCompleted", "You mined and received 1 coin!");
                return ("You mined and received 1 coin!", 1);
            }

            try
            {
                await Task.Delay(100, cancellationToken); // Allow cancellation to be detected
            }
            catch (TaskCanceledException)
            {
                return ("Mining was canceled.", 0);
            }
        }

        await _hubContext.Clients.All.SendAsync("MiningCompleted", "No coins found this time...");
        return ("No coins found this time...", 0);
    }

    // ✅ Cancel ongoing mining session
    public void CancelMining()
    {
        if (_cts != null)
        {
            _cts.Cancel();
            _cts = null;
        }
    }
}
