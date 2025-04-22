let isMining = false;

async function toggleMining() {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        alert('Please login first');
        document.querySelector("#login-popup").classList.add("active");
        return;
    }

    const blocks = parseInt(document.getElementById('blocks').value) || 1;
    
    if (!isMining) {
        await startMining(userId, blocks);
    } else {
        await stopMining(userId);
    }
}

async function startMining(userId, blocks) {
    try {
        isMining = true;
        updateMiningUI(true);
        
        const response = await fetch('http://localhost:5000/api/start-mining', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, blocks })
        });

        if (!response.ok) throw new Error('Failed to start mining');

        document.getElementById('status').className = 'status-box info';
        document.getElementById('status').textContent = `Mining ${blocks} blocks...`;
    } catch (err) {
        console.error("Mining error:", err);
        isMining = false;
        updateMiningUI(false);
        document.getElementById('status').className = 'status-box error';
        document.getElementById('status').textContent = err.message;
    }
}

async function stopMining(userId) {
    try {
        const response = await fetch('http://localhost:5000/api/stop-mining', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId })
        });

        if (!response.ok) throw new Error('Failed to stop mining');

        isMining = false;
        updateMiningUI(false);
        document.getElementById('status').className = 'status-box success';
        document.getElementById('status').textContent = 'Mining stopped';
    } catch (err) {
        console.error("Stop mining error:", err);
    }
}

function updateMiningUI(isActive) {
    const btn = document.getElementById('mineButton');
    btn.textContent = isActive ? 'Stop Mining' : 'Start Mining';
    btn.className = isActive ? 'mining-active' : '';
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('mineButton').addEventListener('click', toggleMining);
    
    // Block input validation
    document.getElementById('blocks').addEventListener('input', (e) => {
        let value = parseInt(e.target.value) || 0;
        e.target.value = Math.min(1000, Math.max(1, value));
    });
});