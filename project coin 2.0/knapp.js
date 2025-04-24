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

async function startMining(blocks) {
    try {
        const response = await fetch('http://localhost:5002/startMining', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ blocks: blocks.toString() })
        });

        const data = await response.json();

        // 🛑 Om någon annan redan minar, visa alert
        if (response.status === 403) {
            alert(data.error || "Someone is already mining. Please wait.");
            return;
        }

        if (!response.ok) {
            throw new Error(data.error || 'Failed to start mining');
        }

        // ✅ Om mining lyckas
        isMining = true;
        updateMiningButton(true);
        document.getElementById('status').className = 'status-box info';
        document.getElementById('status').textContent = 'Mining started...';

    } catch (err) {
        console.error("Mining error:", err);
        isMining = false;
        updateMiningButton(false);
        alert(err.message || 'Something went wrong.');
    }
}


async function stopMining() {
    try {
        const response = await fetch('http://localhost:5002/cancelMining', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to stop mining');
        }

        // ✅ Om mining stoppas
        isMining = false;
        updateMiningButton(false);
        document.getElementById('status').className = 'status-box success';
        document.getElementById('status').textContent = 'Mining stopped';
        alert('Mining has been stopped.');

    } catch (err) {
        console.error("Stop mining error:", err);
        alert(err.message || 'Failed to stop mining');
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