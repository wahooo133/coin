let isMining = false;

// ✅ Connect to SignalR
const connection = new signalR.HubConnectionBuilder()
    .withUrl("http://localhost:5000/miningHub", {
    skipNegotiation: true,
    transport: signalR.HttpTransportType.WebSockets
    })
    .configureLogging(signalR.LogLevel.Information)
    .build();

connection.start().then(() => {
    console.log("Connected to mining server...");
}).catch(err => console.error(err));

// ✅ Show live mining progress
connection.on("UpdateMiningStatus", (message) => {
    updateStatus(message, 'info');
});

// ✅ Show mining result when finished
connection.on("MiningCanceled", (message) => {
    updateStatus(message, 'warning');
    isMining = false; // ✅ Reset state when canceled
});

// ✅ Show mining result when finished
connection.on("MiningCompleted", (message) => {
    updateStatus(message, 'success');
});

async function cancelMining()
{
    try {
        let cancelResponse = await fetch("http://localhost:5000/cancelMining", { method: "POST" });

        if (cancelResponse.ok) {
            let cancelData = await cancelResponse.json();
            updateStatus(cancelData.message, 'info');
        } else {
            let errorData = await cancelResponse.json();
            updateStatus(errorData.error, 'error');
        }
    } catch (error) {
        console.error("Error canceling mining:", error);
        updateStatus("Error canceling mining.", 'error');
    }
}


async function startMining()
{
    if (isMining) {
        updateStatus("Stopping current mining session...", 'warning');
        
        // ✅ Send a request to cancel the current mining session
        try {
            let cancelResponse = await fetch("http://localhost:5000/cancelMining", { method: "POST" });

            if (cancelResponse.ok) {
                let cancelData = await cancelResponse.json();
                updateStatus(cancelData.message, 'info');
            } else {
                let errorData = await cancelResponse.json();
                updateStatus(errorData.error, 'error');
            }
        } catch (error) {
            console.error("Error canceling mining:", error);
            updateStatus("Error canceling mining.", 'error');
        }

        isMining = false;
        return;
    }


    const blocksInput = document.getElementById('blocks');
    const blocksStr = blocksInput.value.trim(); // Get input as a string

    if (!blocksStr || !/^\d+$/.test(blocksStr)) {
        updateStatus("Number of blocks cannot be none or is an invalid input! Field can ONLY contain positive digits!", 'error');
        return;
    }

    const blocks = BigInt(blocksStr);

    if (blocks == 0) {
        updateStatus("Number of blocks cannot be 0!", 'error');
        return;
    } 
    else if (blocks > 1000000000){
        updateStatus("Number of blocks cannot be higher than 1,000,000,000!", 'error')
        return;
    }
        
    try {
        updateStatus("Mining started...", 'info');
        isMining = true;
        // Send `blocks` as a query parameter
        let response = await fetch("http://localhost:5000/startMining", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ blocks: blocks.toString() }) // Send BigInt as string
        });
        let data = await response.json(); // Parse JSON response

        console.log("Mining Result:", data.textResult);
        updateStatus(data.textResult, 'info');
        isMining = false;
    } catch (error) {
        console.error("Error fetching mining result:", error);
        updateStatus("Error connecting to mining service.", 'error');
        isMining = false;
    }
}

function updateStatus(message, type = 'info') {
    const status = document.getElementById('status');
    status.className = `status-box ${type}`;
    status.innerHTML = `Status: ${message}`;
}

function registerUser()
{
    const fullName = document.getElementById('signup-name');
    const email = document.getElementById('signup-email');
    const password = document.getElementById('signup-password');

    let response = fetch("http://localhost:5000/registerUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
            { 
                fullName: fullName.value, 
                email: email.value, 
                password: password.value 
            })
    });
}

function loginUser()
{
    const email = document.getElementById('login-email');
    const password = document.getElementById('login-password');

    let response = fetch("http://localhost:5000/loginUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
            { 
                email: email.value, 
                password: password.value 
            })
    });
}
