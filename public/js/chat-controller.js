const QUICK_PHRASES = [
    { text: "Chào bạn! 👋", icon: "fa-hand-wave" },
    { text: "Hay quá! 👏", icon: "fa-thumbs-up" },
    { text: "Hên xui thôi... 😅", icon: "fa-dice" },
    { text: "Wow! 😮", icon: "fa-surprise" },
    { text: "Hahaha 😂", icon: "fa-laugh-squint" },
    { text: "Chúc mừng! 🎉", icon: "fa-party-horn" },
    { text: "Đợi tí nhé... ⏳", icon: "fa-hourglass-half" }
];

export default class ChatController {
    constructor(socketClient) {
        this.socket = socketClient;
        
        this.chatBtnA = document.querySelector('#chat-wrapper-a .player-chat-btn');
        this.chatBtnB = document.querySelector('#chat-wrapper-b .player-chat-btn');
        this.popupA = document.getElementById('phrase-popup-a');
        this.popupB = document.getElementById('phrase-popup-b');
        this.globalContainer = document.getElementById('global-chat-container');
        this._justOpened = false;

        this.initPopups();
        this.setupEventListeners();
        this.setupSocketListeners();
    }

    initPopups() {
        [this.popupA, this.popupB].forEach(popup => {
            if (!popup) return;
            popup.innerHTML = QUICK_PHRASES.map(p => `
                <div class="phrase-item" data-text="${p.text}">
                    <i class="fas ${p.icon}"></i>
                    <span>${p.text}</span>
                </div>
            `).join('');

            // Stop clicks inside popup from bubbling to document
            popup.addEventListener('click', e => e.stopPropagation());

            popup.querySelectorAll('.phrase-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const text = item.getAttribute('data-text');
                    this.sendPhrase(text, popup === this.popupA ? 'a' : 'b');
                    this.hideAllPopups();
                });
            });
        });
    }

    setupEventListeners() {
        if (this.chatBtnA) {
            this.chatBtnA.addEventListener('click', (e) => {
                e.stopPropagation();
                if (this.canIControl('a')) {
                    this.togglePopup('a');
                }
            });
        }

        if (this.chatBtnB) {
            this.chatBtnB.addEventListener('click', (e) => {
                e.stopPropagation();
                if (this.canIControl('b')) {
                    this.togglePopup('b');
                }
            });
        }

        // Close popups when clicking anywhere else
        document.addEventListener('click', () => {
            if (this._justOpened) {
                this._justOpened = false;
                return;
            }
            this.hideAllPopups();
        });

        window.addEventListener('resize', () => this.hideAllPopups());
    }

    togglePopup(side) {
        const popup = side === 'a' ? this.popupA : this.popupB;
        const btn = side === 'a' ? this.chatBtnA : this.chatBtnB;
        const otherPopup = side === 'a' ? this.popupB : this.popupA;

        otherPopup.classList.add('hidden');

        if (popup.classList.contains('hidden')) {
            this.positionPopup(popup, btn, side);
            popup.classList.remove('hidden');
            this._justOpened = true;
        } else {
            popup.classList.add('hidden');
        }
    }

    positionPopup(popup, btn, side) {
        const rect = btn.getBoundingClientRect();
        const popupWidth = 130; 
        
        // Initial positioning: Left of button
        let left = rect.left - popupWidth - 8;
        
        // If it goes off-screen to the left, flip to the right
        if (left < 4) {
            left = rect.right + 8;
        }
        
        // If it still goes off-screen to the right, clamp it
        if (left + popupWidth > window.innerWidth - 4) {
            left = window.innerWidth - popupWidth - 4;
        }
        
        // Final clamp for safety
        left = Math.max(4, left);

        popup.style.position = 'fixed';
        popup.style.left = left + 'px';

        if (side === 'a') {
            // Bottom player: anchor bottom edge to button top
            popup.style.top = 'auto';
            popup.style.bottom = (window.innerHeight - rect.top + 4) + 'px';
            
            // Safety check: if button is too high, popup might go off top
            // Since we use fixed positioning, we might need to adjust top if bottom is too large
        } else {
            // Top player: anchor top edge to button bottom
            popup.style.bottom = 'auto';
            popup.style.top = (rect.bottom + 4) + 'px';
        }
        
        // Add a small delay then check if offscreen vertically (since fixed pos)
        requestAnimationFrame(() => {
            const pRect = popup.getBoundingClientRect();
            if (pRect.top < 4) {
                popup.style.top = '4px';
                popup.style.bottom = 'auto';
            } else if (pRect.bottom > window.innerHeight - 4) {
                popup.style.bottom = '4px';
                popup.style.top = 'auto';
            }
        });
    }

    hideAllPopups() {
        if (this.popupA) this.popupA.classList.add('hidden');
        if (this.popupB) this.popupB.classList.add('hidden');
    }

    canIControl(side) {
        if (!window.currentGameController) return true;
        const gc = window.currentGameController;
        if (gc.gameState.isLocalMatch) return true;
        const myIndex = gc.myPlayerIndex;
        return (side === 'a' && myIndex === 0) || (side === 'b' && myIndex === 1);
    }

    sendPhrase(text, popupSide) {
        let side = popupSide;
        if (window.currentGameController) {
            const gc = window.currentGameController;
            if (!gc.gameState.isLocalMatch) {
                side = gc.myPlayerIndex === 0 ? 'a' : 'b';
            }
        }

        this.socket.emit('chat-message', { text, type: 'phrase', side });
        this.showBubble(side, text);
    }

    setupSocketListeners() {
        this.socket.on('chat-message', (data) => {
            if (data.playerId !== this.socket.getId()) {
                const gc = window.currentGameController;
                if (!gc) return;

                let side = 'b';
                if (gc.gameState.isLocalMatch) {
                    side = data.side || 'b';
                } else {
                    const senderIndex = gc.gameState.players[0].id === data.playerId ? 0 : 1;
                    side = senderIndex === 0 ? 'a' : 'b';
                }

                this.showBubble(side, data.text);
                if (window.soundManager) window.soundManager.play('message');
            }
        });
    }

    showBubble(side, text) {
        if (!this.globalContainer) return;

        // 1. Existing Floating Bubble
        const bubble = document.createElement('div');
        bubble.className = `chat-bubble-mini ${side === 'a' ? 'friendly' : 'enemy'}`;
        bubble.innerText = text;

        const panel = document.getElementById(side === 'a' ? 'player-a-panel' : 'player-b-panel');
        if (!panel) return;

        const rect = panel.getBoundingClientRect();
        bubble.style.position = 'fixed';
        bubble.style.left = (rect.left + rect.width / 2) + 'px';

        if (side === 'a') {
            bubble.style.bottom = (window.innerHeight - rect.top + 10) + 'px';
        } else {
            bubble.style.top = (rect.bottom + 10) + 'px';
        }

        this.globalContainer.appendChild(bubble);

        setTimeout(() => {
            bubble.classList.add('fade-out');
            setTimeout(() => bubble.remove(), 400);
        }, 1200);

        // 3. NEW: Shaking Notification Toast
        const toastContainer = document.getElementById('toast-container');
        if (toastContainer) {
            const toast = document.createElement('div');
            toast.className = 'toast-chat';
            toast.innerText = text;
            toastContainer.appendChild(toast);
            setTimeout(() => toast.remove(), 3000);
        }
    }
}
