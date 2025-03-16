let coins = 0;
        let isMining = false;
        let cooldown = false;
        let cooldownTime = 0;

        function updateStatus(message, type = 'info') {
            const status = document.getElementById('status');
            status.className = `status-box ${type}`;
            status.innerHTML = `Status: ${message}`;
        }

        function startMining() {
            if (isMining || cooldown) return;

            const blocksInput = document.getElementById('blocks');
            const blocks = parseInt(blocksInput.value);

            if (!blocks || blocks < 1) {
                updateStatus('Ogiltigt antal blocks! Ange ett positivt tal', 'error');
                return;
            }

            isMining = true;
            updateStatus(`Startar mining av ${blocks} blocks...`, 'info');
            document.getElementById('mineButton').disabled = true;

            // Simulera mining-process
            setTimeout(() => {
                const success = Math.random() > 0.2; // 80% chans att lyckas
                const minedCoins = success ? blocks * 0.1 : 0;
                
                coins += minedCoins;
                document.getElementById('coins').textContent = coins.toFixed(2);
                
                if (success) {
                    updateStatus(`Lyckades mina ${blocks} blocks! Fick ${minedCoins.toFixed(2)} coins`, 'success');
                } else {
                    updateStatus('Mining misslyckades! Försök igen', 'error');
                }

                isMining = false;
                startCooldown(15); // 15 sekunders cooldown
            }, 2000);
        }

        function startCooldown(seconds) {
            cooldown = true;
            cooldownTime = seconds;
            const timerElement = document.getElementById('timer');
            const button = document.getElementById('mineButton');

            const interval = setInterval(() => {
                cooldownTime--;
                timerElement.textContent = `${cooldownTime}s`;
                
                if (cooldownTime <= 0) {
                    clearInterval(interval);
                    timerElement.textContent = 'Redo';
                    button.disabled = false;
                    cooldown = false;
                }
            }, 1000);
        }