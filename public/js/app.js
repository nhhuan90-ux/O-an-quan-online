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

    // Load stats
    function loadStats() {
        const stats = JSON.parse(localStorage.getItem('oanquan_stats')) || { played: 0, won: 0, streak: 0 };
        const winrate = stats.played > 0 ? ((stats.won / stats.played) * 100).toFixed(1) : 0;
        const ePlayed = document.getElementById('stat-played');
        if(ePlayed) {
            ePlayed.innerText = stats.played;
            document.getElementById('stat-won').innerText = stats.won;
            document.getElementById('stat-winrate').innerText = winrate + '%';
            document.getElementById('stat-streak').innerText = stats.streak;
        }
    }
    loadStats();

    // Menu logic
    const onlineSetupModal = document.getElementById('online-setup-modal');
    btnPvP.addEventListener('click', () => {
        onlineSetupModal.classList.remove('hidden');
        // Reset UI
        document.getElementById('online-mode-buttons').style.display = 'flex';
        document.getElementById('private-room-section').style.display = 'none';
        document.getElementById('join-room-buttons').style.display = 'none';
        document.getElementById('room-code-input').value = '';
    });

    document.getElementById('btn-close-online-setup').addEventListener('click', () => {
        onlineSetupModal.classList.add('hidden');
    });

    document.getElementById('btn-random-match').addEventListener('click', () => {
        const input = document.getElementById('online-name');
        const myName = (input.value || '').trim() || 'Vô Danh';
        
        onlineSetupModal.classList.add('hidden');
        matchOverlay.classList.remove('hidden');
        document.getElementById('matchmaking-status').innerText = 'Đang tìm đối thủ...';
        document.getElementById('room-code-display').classList.add('hidden');
        socketClient.joinQueue(document.getElementById('game-mode-selector').value, myName);
    });

    document.getElementById('btn-create-room').addEventListener('click', () => {
        const input = document.getElementById('online-name');
        const myName = (input.value || '').trim() || 'Vô Danh';
        
        onlineSetupModal.classList.add('hidden');
        matchOverlay.classList.remove('hidden');
        document.getElementById('matchmaking-status').innerText = 'Đang tạo phòng...';
        document.getElementById('room-code-display').classList.add('hidden');
        socketClient.createPrivateRoom(document.getElementById('game-mode-selector').value, myName);
    });

    document.getElementById('btn-show-join').addEventListener('click', () => {
        document.getElementById('online-mode-buttons').style.display = 'none';
        document.getElementById('private-room-section').style.display = 'block';
        document.getElementById('join-room-buttons').style.display = 'flex';
    });

    document.getElementById('btn-cancel-join').addEventListener('click', () => {
        document.getElementById('online-mode-buttons').style.display = 'flex';
        document.getElementById('private-room-section').style.display = 'none';
        document.getElementById('join-room-buttons').style.display = 'none';
    });

    document.getElementById('btn-join-room-final').addEventListener('click', () => {
        const input = document.getElementById('online-name');
        const myName = (input.value || '').trim() || 'Vô Danh';
        const codeInput = document.getElementById('room-code-input').value.trim().toUpperCase();

        if (!codeInput || codeInput.length !== 5) {
            alert('Vui lòng nhập đúng 5 số mã phòng.');
            return;
        }
        
        onlineSetupModal.classList.add('hidden');
        matchOverlay.classList.remove('hidden');
        document.getElementById('matchmaking-status').innerText = 'Đang vào phòng...';
        document.getElementById('room-code-display').classList.add('hidden');
        socketClient.joinPrivateRoom(codeInput, myName);
    });

    // Fullscreen logic
    const btnFullscreen = document.getElementById('btn-fullscreen');
    btnFullscreen.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log(`Lỗi khi vào toàn màn hình: ${err.message}`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    });

    document.addEventListener('fullscreenchange', () => {
        const iconExpand = btnFullscreen.querySelector('.icon-expand');
        const iconCompress = btnFullscreen.querySelector('.icon-compress');
        if (document.fullscreenElement) {
            iconExpand.classList.add('hidden');
            iconCompress.classList.remove('hidden');
        } else {
            iconExpand.classList.remove('hidden');
            iconCompress.classList.add('hidden');
        }
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
        
        // Reset overlay state
        document.getElementById('matchmaking-status').innerText = 'Đang tìm đối thủ...';
        document.getElementById('room-code-display').classList.add('hidden');
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
        
        const isBot = data.state.players[1].isBot;
        const isLocal = data.state.isLocalMatch;

        if (!isBot && !isLocal) {
            // Online PvP
            const p1Name = data.state.players[0].name;
            const p2Name = data.state.players[1].name;
            const goesFirst = data.state.turn;
            
            const overlay = document.getElementById('coin-flip-overlay');
            const coin = document.getElementById('coin');
            const status = document.getElementById('coin-status');
            const resultDiv = document.getElementById('coin-result');
            
            overlay.classList.remove('hidden');
            coin.className = 'coin';
            resultDiv.classList.add('hidden');
            status.innerText = 'Xác định lượt đi...';

            setTimeout(() => {
                const winnerName = goesFirst === 0 ? p1Name : p2Name;
                coin.classList.add(goesFirst === 0 ? 'flip-heads' : 'flip-tails');
                
                setTimeout(() => {
                    status.innerText = 'KẾT QUẢ';
                    resultDiv.innerText = `${winnerName} đi trước!`;
                    resultDiv.classList.remove('hidden');
                    
                    if (typeof confetti === 'function') {
                        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
                    }

                    setTimeout(() => {
                        overlay.classList.add('hidden');
                        mainMenu.classList.remove('active');
                        gameView.classList.remove('hidden');
                        gameView.classList.add('active');
                        gameController.initGame(data.state, data.roomId, [p1Name, p2Name]);
                    }, 2000);
                }, 3000);
            }, 500);
        } else {
            mainMenu.classList.remove('active');
            gameView.classList.remove('hidden');
            gameView.classList.add('active');
            
            // Pass captured names as a fallback
            const name1 = document.getElementById('local-name-1').value.trim();
            const name2 = document.getElementById('local-name-2').value.trim();
            
            gameController.initGame(data.state, data.roomId, [name1, name2]);
        }
    });
    
    socketClient.on('opponent-disconnected', () => {
        alert("Đối thủ đã thoát. Kết thúc game.");
        location.reload();
    });

    socketClient.on('private-room-created', (data) => {
        document.getElementById('matchmaking-status').innerText = 'Chờ bạn bè tham gia...';
        document.getElementById('room-code-display').classList.remove('hidden');
        document.getElementById('the-room-code').innerText = data.code;
        
        document.getElementById('btn-copy-code').onclick = () => {
            navigator.clipboard.writeText(data.code).then(() => {
                alert("Đã copy mã phòng: " + data.code);
            }).catch(err => {
                console.error("Lỗi copy: ", err);
            });
        };
    });
});
