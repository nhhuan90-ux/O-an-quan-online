import BoardRenderer from './board-renderer.js';

export default class TutorialController {
    constructor() {
        this.renderer = new BoardRenderer();
        this.currentStep = 0;
        this.gameState = null;
        this.isAnimating = false;

        // UI elements
        this.overlay = document.getElementById('tutorial-overlay');
        this.callout = document.getElementById('tutorial-callout');
        this.title = document.getElementById('tutorial-title');
        this.text = document.getElementById('tutorial-text');
        this.highlightBox = document.getElementById('tutorial-highlight-box');
        
        this.btnNext = document.getElementById('btn-tutorial-next');
        this.btnPrev = document.getElementById('btn-tutorial-prev');
        this.btnSkip = document.getElementById('btn-tutorial-skip');

        this.setupSteps();
        this.bindEvents();
    }

    showToast(msg) {
        if (window.currentGameController && window.currentGameController !== this) {
             // If there's a real GameController, use its toast container if shared
        }
        const container = document.getElementById('toast-container');
        if (!container) return;
        const div = document.createElement('div');
        div.className = 'toast-msg';
        div.innerText = msg;
        container.appendChild(div);
        setTimeout(() => div.remove(), 3000);
    }

    setupSteps() {
        this.steps = [
            {
                title: "Chào mừng bạn đến với Ô Ăn Quan!",
                text: "Trò chơi dân gian truyền thống Việt Nam. Hãy cùng học cách chơi cơ bản trong vài phút nhé.",
                highlight: null
            },
            {
                title: "Bảng điểm của bạn",
                text: "Đây là khu vực hiển thị Tên và Điểm số của bạn. Bạn cần tích lũy càng nhiều điểm (dân/quan) càng tốt.",
                highlight: "#player-a-panel"
            },
            {
                title: "Bảng điểm đối thủ",
                text: "Tương tự, đây là khu vực của đối thủ. Trong trò chơi này, điểm được tính bằng số quân bạn 'ăn' được.",
                highlight: "#player-b-panel"
            },
            {
                title: "Bàn cờ Ô Ăn Quan",
                text: "Bàn cờ hình chữ nhật được chia thành 10 ô Dân (hình vuông) và 2 ô Quan (hình bán nguyệt ở hai đầu).",
                highlight: "#board"
            },
            {
                title: "Ô Dân (Pits)",
                text: "Mỗi ô Dân ban đầu có 5 quân nhỏ. Mỗi quân tương ứng với 1 điểm.",
                highlight: ".dan-pit"
            },
            {
                title: "Ô Quan (Mandarin Squares)",
                text: "Hai ô lớn ở hai đầu là ô Quan. Quân Quan to hơn và có giá trị cao (5 điểm). Ăn được Quan là chìa khóa để thắng!",
                highlight: ".quan-pit"
            },
            {
                title: "Lượt chơi của bạn",
                text: "Bạn chỉ được phép chọn các ô Dân ở PHÍA BÊN MÌNH (dãy dưới) để bắt đầu lượt đi. Bạn không được bốc quân từ ô Quan.",
                highlight: ".board-row.bottom-row"
            },
            {
                title: "Cách di chuyển (Rải quân)",
                text: "Chọn một ô có quân, bốc hết quân trong đó và rải lần lượt vào các ô kế tiếp theo chiều trái hoặc phải.",
                highlight: "#pit-3",
                action: async () => {
                    const steps = [
                        { type: 'pickup', pitIndex: 3, stonesInHand: 5, redStonesInHand: 0 },
                        { type: 'drop', pitIndex: 4, stoneType: 'regular' },
                        { type: 'drop', pitIndex: 5, stoneType: 'regular' },
                        { type: 'drop', pitIndex: 6, stoneType: 'regular' },
                        { type: 'drop', pitIndex: 7, stoneType: 'regular' },
                        { type: 'drop', pitIndex: 8, stoneType: 'regular' }
                    ];
                    this.isAnimating = true;
                    await this.renderer.playAnimations(steps, this.getMockStateAfterMove1(), this.getInitialState());
                    this.isAnimating = false;
                }
            },
            {
                title: "Tiếp tục lượt đi",
                text: "Nếu ô cuối cùng bạn rải vào không phải là ô trống, và không phải ô Quan, bạn bốc tiếp toàn bộ quân trong ô đó để rải tiếp (gọi là 'đấm').",
                highlight: "#pit-8",
                action: async () => {
                    const steps = [
                        { type: 'pickup', pitIndex: 8, stonesInHand: 6, redStonesInHand: 0 },
                        { type: 'drop', pitIndex: 9, stoneType: 'regular' },
                        { type: 'drop', pitIndex: 10, stoneType: 'regular' },
                        { type: 'drop', pitIndex: 11, stoneType: 'regular' },
                        { type: 'drop', pitIndex: 0, stoneType: 'regular' },
                        { type: 'drop', pitIndex: 1, stoneType: 'regular' },
                        { type: 'drop', pitIndex: 2, stoneType: 'regular' }
                    ];
                    this.isAnimating = true;
                    await this.renderer.playAnimations(steps, this.getMockStateAfterMove2(), this.getMockStateAfterMove1());
                    this.isAnimating = false;
                }
            },
            {
                title: "Cách Ăn Quân (Ghi điểm)",
                text: "Nếu sau ô cuối cùng bạn rải là một Ô TRỐNG, và sau ô trống đó là một ô CÓ QUÂN, bạn sẽ được 'ăn' toàn bộ quân trong ô đó.",
                highlight: "#pit-4, #pit-5",
                action: async () => {
                    const state = this.getMockStateForEating();
                    this.renderer.render(state);
                    const eatSteps = [
                        { type: 'pickup', pitIndex: 2, stonesInHand: 1, redStonesInHand: 0 },
                        { type: 'drop', pitIndex: 3, stoneType: 'regular' },
                        { type: 'eat', pitIndex: 5, pointsGranted: 5 }
                    ];
                    this.isAnimating = true;
                    await this.renderer.playAnimations(eatSteps, this.getMockStateAfterEating(), state);
                    this.isAnimating = false;
                }
            },
            {
                title: "Ăn nối (Chain Capture)",
                text: "Sau khi ăn, nếu ô tiếp theo lại là ô trống và ô sau đó nữa có quân, bạn tiếp tục được ăn. Cứ thế có thể ăn nhiều ô cùng lúc!",
                highlight: "#pit-6, #pit-7, #pit-8",
                action: async () => {
                    const state = this.getMockStateForChainEating();
                    this.renderer.render(state);
                    const steps = [
                        { type: 'pickup', pitIndex: 3, stonesInHand: 1, redStonesInHand: 0 },
                        { type: 'drop', pitIndex: 4, stoneType: 'regular' },
                        { type: 'eat', pitIndex: 6, pointsGranted: 10 },
                        { type: 'eat', pitIndex: 8, pointsGranted: 5 }
                    ];
                    this.isAnimating = true;
                    await this.renderer.playAnimations(steps, this.getMockStateAfterChainEating(), state);
                    this.isAnimating = false;
                }
            },
            {
                title: "Mất lượt (Dừng chơi)",
                text: "Bạn mất lượt nếu: \n1. Rải quân kết thúc ngay trước ô Quan. \n2. Gặp 2 ô trống liên tiếp. \n3. Vừa ăn quân xong mà ô tiếp theo không thể ăn tiếp.",
                highlight: "#pit-0, #pit-6"
            },
            {
                title: "Kết thúc trò chơi",
                text: "Trò chơi kết thúc khi cả hai ô Quan đều bị ăn hết. Khi đó, ai có tổng điểm nhiều hơn sẽ giành chiến thắng cuối cùng!",
                highlight: null
            },
            {
                title: "Hệ thống Kế Sách (AP & Thẻ)",
                text: "Trong chế độ Chiến Thuật, bạn có AP để đi quân và có thể mua Thẻ Kế Sách để xoay chuyển tình thế. Đừng quên khám phá nhé!",
                highlight: ".ap-container, #central-deck"
            },
            {
                title: "Bạn đã sẵn sàng!",
                text: "Hãy bắt đầu trận đấu đầu tiên và trở thành cao thủ Ô Ăn Quan!",
                highlight: null
            }
        ];
    }

    bindEvents() {
        this.btnNext.onclick = () => this.nextStep();
        this.btnPrev.onclick = () => this.prevStep();
        this.btnSkip.onclick = () => this.endTutorial();
    }

    startTutorial() {
        this.currentStep = 0;
        this.gameState = this.getInitialState();
        window.currentGameController = this; // Hook for BoardRenderer
        
        this.overlay.classList.remove('hidden');
        document.getElementById('main-menu').classList.add('hidden');
        document.getElementById('game-view').classList.remove('hidden');
        document.getElementById('game-view').classList.add('active');
        
        // Hide game-specific UI that might interfere
        document.getElementById('turn-timer-container').classList.add('hidden');
        
        this.renderer.render(this.gameState);
        this.showStep(0);
    }

    endTutorial() {
        this.overlay.classList.add('hidden');
        location.reload(); // Simplest way to reset everything
    }

    showStep(index) {
        if (index < 0 || index >= this.steps.length) return;
        this.currentStep = index;
        const step = this.steps[index];

        this.title.innerText = step.title;
        this.text.innerText = step.text;

        this.btnPrev.style.visibility = index === 0 ? 'hidden' : 'visible';
        this.btnNext.innerText = index === this.steps.length - 1 ? 'Bắt đầu chơi' : 'Tiếp theo';

        if (step.highlight) {
            this.highlightElement(step.highlight);
        } else {
            this.highlightBox.classList.add('hidden');
        }

        if (step.action) {
            step.action();
        }
        
        this.updateCalloutPosition(step.highlight);
    }

    nextStep() {
        if (this.isAnimating) return;
        if (this.currentStep === this.steps.length - 1) {
            this.endTutorial();
        } else {
            this.showStep(this.currentStep + 1);
        }
    }

    prevStep() {
        if (this.isAnimating) return;
        this.showStep(this.currentStep - 1);
    }

    highlightElement(selector) {
        const els = document.querySelectorAll(selector);
        if (els.length === 0) {
            this.highlightBox.classList.add('hidden');
            return;
        }

        let minTop = Infinity, minLeft = Infinity, maxBottom = 0, maxRight = 0;
        els.forEach(el => {
            const rect = el.getBoundingClientRect();
            minTop = Math.min(minTop, rect.top);
            minLeft = Math.min(minLeft, rect.left);
            maxBottom = Math.max(maxBottom, rect.bottom);
            maxRight = Math.max(maxRight, rect.right);
        });

        const padding = 10;
        this.highlightBox.style.top = (minTop - padding) + 'px';
        this.highlightBox.style.left = (minLeft - padding) + 'px';
        this.highlightBox.style.width = (maxRight - minLeft + padding * 2) + 'px';
        this.highlightBox.style.height = (maxBottom - minTop + padding * 2) + 'px';
        this.highlightBox.classList.remove('hidden');
    }

    updateCalloutPosition(highlightSelector) {
        const rect = this.highlightBox.classList.contains('hidden') ? null : this.highlightBox.getBoundingClientRect();
        
        if (!rect) {
            // Center callout
            this.callout.style.top = '50%';
            this.callout.style.left = '50%';
            this.callout.style.transform = 'translate(-50%, -50%)';
            return;
        }

        // Try to place callout near the highlight
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        
        this.callout.style.transform = 'none';
        this.callout.style.left = Math.max(20, Math.min(window.innerWidth - 340, rect.left + rect.width / 2 - 160)) + 'px';

        if (spaceBelow > 250) {
            this.callout.style.top = (rect.bottom + 20) + 'px';
        } else if (spaceAbove > 250) {
            this.callout.style.top = (rect.top - this.callout.offsetHeight - 20) + 'px';
        } else {
            // Side placement if top/bottom tight
            this.callout.style.top = '50%';
            this.callout.style.transform = 'translateY(-50%)';
            if (rect.left > 350) {
                this.callout.style.left = (rect.left - 340) + 'px';
            } else {
                this.callout.style.left = (rect.right + 20) + 'px';
            }
        }
    }

    // Mock States for Tutorial
    getInitialState() {
        return {
            mode: 'classic',
            turn: 0,
            board: Array.from({length: 12}, (_, i) => ({
                type: (i === 0 || i === 6) ? 'quan' : 'dan',
                regularStones: (i === 0 || i === 6) ? 0 : 5,
                redStones: 0,
                quanStone: (i === 0 || i === 6)
            })),
            players: [
                { id: 'p1', name: 'Bạn', score: 0, ap: 3, inventory: [], activeBuffs: {} },
                { id: 'p2', name: 'Đối thủ', score: 0, ap: 3, inventory: [], activeBuffs: {} }
            ],
            status: 'playing',
            isLocalMatch: true
        };
    }

    getMockStateAfterMove1() {
        const s = this.getInitialState();
        s.board[3].regularStones = 0;
        [4, 5, 6, 7, 8].forEach(i => s.board[i].regularStones++);
        return s;
    }

    getMockStateAfterMove2() {
        const s = this.getMockStateAfterMove1();
        s.board[8].regularStones = 0;
        [9, 10, 11, 0, 1, 2].forEach(i => s.board[i].regularStones++);
        return s;
    }

    getMockStateForEating() {
        const s = this.getInitialState();
        s.board[2].regularStones = 1;
        s.board[3].regularStones = 0;
        s.board[4].regularStones = 0;
        s.board[5].regularStones = 5;
        return s;
    }

    getMockStateAfterEating() {
        const s = this.getMockStateForEating();
        s.board[2].regularStones = 0;
        s.board[3].regularStones = 1;
        s.board[5].regularStones = 0;
        s.players[0].score = 5;
        return s;
    }

    getMockStateForChainEating() {
        const s = this.getInitialState();
        s.board[3].regularStones = 1;
        s.board[4].regularStones = 0; // Drop here
        s.board[5].regularStones = 0; // Empty
        s.board[6].quanStone = true; // Eat this (Quan = 10 pts)
        s.board[7].regularStones = 0; // Empty
        s.board[8].regularStones = 5; // Eat this
        return s;
    }

    getMockStateAfterChainEating() {
        const s = this.getMockStateForChainEating();
        s.board[3].regularStones = 0;
        s.board[4].regularStones = 1;
        s.board[6].quanStone = false;
        s.board[8].regularStones = 0;
        s.players[0].score = 15;
        return s;
    }
}
