export default class SoundManager {
    constructor() {
        // Essential SFX only
        const SOUND_URLS = {
            'pickup': 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
            'drop': 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
            'eat': 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3',
            'message': 'https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3'
        };

        this.sounds = {};
        for (const [key, url] of Object.entries(SOUND_URLS)) {
            this.sounds[key] = new Audio(url);
            this.sounds[key].load();
        }

        this.enabled = true;
    }

    play(name) {
        if (!this.enabled) return;
        const s = this.sounds[name];
        if (s) {
            s.currentTime = 0;
            s.play().catch(e => console.log("Sound play error:", e));
        }
    }

    // BGM removed as requested
    startBGM() {}
    stopBGM() {}

    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }
}

// Global instance
window.soundManager = new SoundManager();
