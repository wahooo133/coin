let isMining = false;

async function toggleMining() {
    const userId = localStorage.getItem('userId');
    if (!userId) return alert('Please login first');

    const blocks = document.getElementById('blocks').value || 1;
    
    if (!isMining) {
        await startMining(userId, blocks);
    } else {
        await stopMining(userId);
    }
}

async function startMining(userId, blocks) {
    try {
        isMining = true;
        updateMiningButton(true);
        
        const response = await fetch('http://localhost:5000/api/mining-toggle', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, action: 'start' })
        });
        
        if (!response.ok) throw new Error('Failed to start mining');
        
        document.getElementById('status').className = 'status-box info';
        document.getElementById('status').textContent = 'Mining started...';
        
    } catch (err) {
        console.error("Mining error:", err);
        isMining = false;
        updateMiningButton(false);
        document.getElementById('status').className = 'status-box error';
        document.getElementById('status').textContent = err.message;
    }
}

async function stopMining(userId) {
    try {
        const response = await fetch('http://localhost:5000/api/mining-toggle', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, action: 'stop' })
        });
        
        if (!response.ok) throw new Error('Failed to stop mining');
        
        isMining = false;
        updateMiningButton(false);
        document.getElementById('status').className = 'status-box success';
        document.getElementById('status').textContent = 'Mining stopped';
        
    } catch (err) {
        console.error("Stop mining error:", err);
    }
}

function updateMiningButton(mining) {
    const btn = document.getElementById('mineButton');
    btn.textContent = mining ? 'Stop Mining' : 'Start Mining';
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('mineButton').addEventListener('click', toggleMining);
    
    // Block input validation
    document.getElementById('blocks').addEventListener('input', (e) => {
        let value = parseInt(e.target.value) || 0;
        if (value > 1000) e.target.value = 1000;
    });
});