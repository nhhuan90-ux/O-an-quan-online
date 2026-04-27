import SocketClient from './socket-client.js';
import GameController from './game-controller.js';

document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const btnPvE = document.getElementById('btn-pve');
    const btnPvP = document.getElementById('btn-pvp');
    const btnCancelMatch = document.getElementById('btn-cancel-match');
    
    // Views
    const mainMenu = document.getElementById('main-menu');
    const matchOverlay = document.getElementById('matchmaking-overlay');
    const gameView = document.getElementById('game-view');
    
    // Sub-systems
    const socketClient = new SocketClient();
    const gameController = new GameController(socketClient);

    // Menu logic
    btnPvP.addEventListener('click', () => {
        matchOverlay.classList.remove('hidden');
        socketClient.joinQueue(document.getElementById('game-mode-selector').value);
    });

    const localSetupModal = document.getElementById('local-setup-modal');
    document.getElementById('btn-local').addEventListener('click', () => {
        localSetupModal.classList.remove('hidden');
    });

    document.getElementById('btn-close-local-setup').addEventListener('click', () => {
        localSetupModal.classList.add('hidden');
    });

    document.getElementById('btn-start-local-final').addEventListener('click', () => {
        const input1 = document.getElementById('local-name-1');
        const input2 = document.getElementById('local-name-2');
        
        const name1 = (input1.value || '').trim() || 'Người chơi 1';
        const name2 = (input2.value || '').trim() || 'Người chơi 2';
        
        localSetupModal.classList.add('hidden');
        showCoinFlip(name1, name2);
    });

    function showCoinFlip(p1, p2) {
        const overlay = document.getElementById('coin-flip-overlay');
        const coin = document.getElementById('coin');
        const status = document.getElementById('coin-status');
        const resultDiv = document.getElementById('coin-result');
        
        overlay.classList.remove('hidden');
        coin.className = 'coin'; // reset
        resultDiv.classList.add('hidden');
        status.innerText = 'Xác định lượt đi...';

        setTimeout(() => {
            const goesFirst = Math.random() < 0.5 ? 0 : 1;
            const winnerName = goesFirst === 0 ? p1 : p2;
            
            coin.classList.add(goesFirst === 0 ? 'flip-heads' : 'flip-tails');
            
            setTimeout(() => {
                status.innerText = 'KẾT QUẢ';
                resultDiv.innerText = `${winnerName} đi trước!`;
                resultDiv.classList.remove('hidden');
                
                // Show confetti
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 }
                });

                setTimeout(() => {
                    overlay.classList.add('hidden');
                    socketClient.startLocalMatch(
                        document.getElementById('game-mode-selector').value,
                        [p1, p2],
                        goesFirst
                    );
                }, 2000);
            }, 3000);
        }, 500);
    }

    btnCancelMatch.addEventListener('click', () => {
        matchOverlay.classList.add('hidden');
        socketClient.leaveQueue();
    });
    
    btnPvE.addEventListener('click', () => {
        // Start bot match immediately
        socketClient.startBotMatch(document.getElementById('game-mode-selector').value);
    });

    const rulesModal = document.getElementById('rules-modal');
    document.getElementById('btn-rules').addEventListener('click', () => {
        rulesModal.classList.remove('hidden');
    });
    document.getElementById('btn-close-rules').addEventListener('click', () => {
        rulesModal.classList.add('hidden');
    });

    // Prevent accidental page leave
    window.addEventListener('beforeunload', (e) => {
        if (gameView.classList.contains('active')) {
             e.preventDefault();
             e.returnValue = ''; // Standard for showing confirmation
        }
    });

    // Listen to socket events
    socketClient.on('game-start', (data) => {
        matchOverlay.classList.add('hidden');
        mainMenu.classList.remove('active');
        gameView.classList.remove('hidden');
        gameView.classList.add('active');
        
        // Pass captured names as a fallback
        const name1 = document.getElementById('local-name-1').value.trim();
        const name2 = document.getElementById('local-name-2').value.trim();
        
        gameController.initGame(data.state, data.roomId, [name1, name2]);
    });
    
    socketClient.on('opponent-disconnected', () => {
        alert("Đối thủ đã thoát. Kết thúc game.");
        location.reload();
    });
});
