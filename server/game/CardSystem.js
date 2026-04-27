const CARDS = [
    { id: 'doi_chieu', name: 'Đổi Chiều', rarity: 'common', desc: 'Đổi hướng rải quân giữa lượt.' },
    { id: 'tiep_te', name: 'Tiếp Tế', rarity: 'common', desc: 'Nhận 3 quân từ Bank vào 1 ô Dân.' },
    { id: 'la_chan', name: 'Lá Chắn', rarity: 'common', desc: 'Khóa 1 ô (tốn 3 AP).' },
    { id: 'thue_than', name: 'Thuế Thân', rarity: 'common', desc: 'Trừ 2 điểm đối thủ vào Bank.' },
    { id: 'x2_thua_thang', name: 'X2 Thừa Thắng', rarity: 'rare', desc: 'Kích hoạt X2 lượt này.' },
    { id: 'lien_hoan', name: 'Liên Hoàn', rarity: 'rare', desc: 'Được rải tiếp 1 lượt sau khi ăn.' },
    { id: 'muon_gio', name: 'Mượn Gió', rarity: 'rare', desc: 'Rải từ ô đối phương.' },
    { id: 'su_gia', name: 'Sứ Giả', rarity: 'rare', desc: 'Biến 1 ô Dân thành Quan hoặc ngược lại.' },
    { id: 'can_quet', name: 'Càn Quét', rarity: 'ultimate', desc: 'Cứ gặp ô có quân là ăn, bỏ qua quy tắc ô trống.' },
    { id: 'hoan_doi', name: 'Hoán Đổi', rarity: 'ultimate', desc: 'Đổi điểm với đối thủ.' }
];

export class CardSystem {
    
    static rollGacha() {
        const r = Math.random();
        let rarity = 'common';
        if (r > 0.6 && r <= 0.9) rarity = 'rare';
        if (r > 0.9) rarity = 'ultimate';

        const pool = CARDS.filter(c => c.rarity === rarity);
        const card = pool[Math.floor(Math.random() * pool.length)];
        return { ...card };
    }

    static buyCard(gameState, playerIndex) {
        const player = gameState.players[playerIndex];
        if (player.score >= 5 && player.inventory.length < 2) {
            player.score -= 5;
            gameState.bank += 5;
            const newCard = this.rollGacha();
            player.inventory.push(newCard);
            return { success: true, card: newCard };
        }
        return { success: false, reason: "Not enough score or inventory full." };
    }

    // Returns action result
    static useCard(gameState, playerIndex, cardId, targetPit = null) {
        const player = gameState.players[playerIndex];
        const opponent = gameState.players[playerIndex === 0 ? 1 : 0];
        
        const cardIndex = player.inventory.findIndex(c => c.id === cardId);
        if (cardIndex === -1) return { success: false, reason: "Card not found in inventory." };

        // AP Cost Check
        let apCost = 1;
        if (cardId === 'la_chan') apCost = 3;

        if (player.ap < apCost) return { success: false, reason: "Not enough AP." };

        // Apply effect
        let success = true;

        switch (cardId) {
            case 'doi_chieu':
                player.activeBuffs.doiChieuActive = true; 
                // Handled in SowingEngine via UI passing new direction
                break;
            case 'tiep_te':
                if (targetPit === null || gameState.getPitOwner(targetPit) !== playerIndex) {
                     return { success: false, reason: "Invalid target pit for Tiếp Tế." };
                }
                const amount = Math.min(3, gameState.bank);
                gameState.bank -= amount;
                gameState.board[targetPit].regularStones += amount;
                break;
            case 'la_chan':
                if (targetPit === null) return { success: false, reason: "Need target pit." };
                gameState.board[targetPit].isLocked = true;
                break;
            case 'thue_than':
                const tax = Math.min(2, opponent.score);
                opponent.score -= tax;
                gameState.bank += tax;
                break;
            case 'x2_thua_thang':
                player.activeBuffs.x2Harvest = true;
                break;
            case 'lien_hoan':
                player.activeBuffs.lienHoanActive = true;
                break;
            case 'muon_gio':
                player.activeBuffs.muonGioActive = true;
                break;
            case 'su_gia':
                if (targetPit === null || targetPit === 0 || targetPit === 6) return { success: false, reason: "Target must be Dân pit." };
                gameState.board[targetPit].type = 'quan';
                gameState.board[targetPit].quanStone = true;
                break;
            case 'can_quet':
                player.activeBuffs.canQuetActive = true;
                break;
            case 'hoan_doi':
                const temp = player.score;
                player.score = opponent.score;
                opponent.score = temp;
                break;
            default:
                success = false;
        }

        if (success) {
            player.ap -= apCost;
            player.inventory.splice(cardIndex, 1); // remove card
            gameState.lastAction = { type: 'use_card', cardId, targetPit, playerIndex };
        }

        return { success };
    }
}
