/**
 * Aquarium Simulator - Giả lập Bể Cá Thủy Sinh
 * Core game engine using HTML5 Canvas & Web Audio API
 */

// Global Game State
let state = {
  step: 1,
  tankSize: 'standard60', // cubic40, standard60, premium90
  substrate: {
    base: Array(40).fill(15), // Height values across 40 segments
    soil: Array(40).fill(30),
    sand: Array(40).fill(0)
  },
  hardscapes: [], // { type, x, y, scale, rotation }
  plants: [], // { type, x, y, size }
  equipment: {
    filter: false,
    light: false,
    co2: false,
    fan: false
  },
  waterLevel: 0, // 0 to 1 (reaches 0.9 max)
  bioCycle: {
    ammonia: 1.0,
    nitrite: 0.8,
    bacteria: 0.0,
    nitrate: 0.0,
    cycled: false
  },
  fishes: [], // { type, x, y, vx, vy, size, targetX, targetY, angle, hunger, sizeScale }
  themeOverride: 'auto', // auto, light, dark
  pearls: 0,
  unlockedThemes: ['river'],
  activeTheme: 'river'
};

// Sync Code variables
let currentSyncCode = '';
let saveDebounceTimer = null;

// UI & DOM Elements
let canvas, ctx;
let audioCtx = null;
let noiseSource = null;
let noiseFilter = null;
let noiseGain = null;
let soundInterval = null;
let soundActive = false;

// Physics / Animation loop variables
let animationId = null;
let time = 0;
let fishFood = []; // { x, y, speed }
let waterParticles = []; // For filter flow / bubbles
let co2Bubbles = []; // For CO2 diffuser
let waterDroplets = []; // For bacteria drops
let droppedPearls = []; // For pearls produced by fish: { x, y, vy, size, angle, value }
let floatingTexts = []; // For popups like +1 🔮 or yum!: { x, y, text, life, color }
let cherryBlossoms = []; // For Zen Pond theme floating petals: { x, y, vx, vy, size, angle, rotSpeed }
let activeTool = null; // 'brush-base', 'brush-soil', 'brush-sand', 'place-plant', 'prune', 'scrape', 'drag-hardscape'
let selectedToolOption = null; // specific stone/wood/plant type
let selectedHardscapeIndex = -1;
let isDragging = false;
let dragOffset = { x: 0, y: 0 };
let algaeLevel = 0.0; // 0 to 1, increases if lights on without filter/CO2
let isSpinningGacha = false;

// Dimensions mapping
const tankDims = {
  cubic40: { width: 500, height: 400, yOffset: 70, label: "Bể Cubic 40x40x40cm" },
  standard60: { width: 680, height: 420, yOffset: 50, label: "Bể Tiêu chuẩn 60x40x40cm" },
  premium90: { width: 780, height: 450, yOffset: 30, label: "Bể Cao cấp 90x45x45cm" }
};

// Materials definitions
const materials = {
  base: { color: '#8d6d53', label: 'Cốt nền JBL', desc: 'Dinh dưỡng lót đáy bể' },
  soil: { color: '#2b241e', label: 'Phân nền ADA', desc: 'Đất công nghiệp hạt đen' },
  sand: { color: '#e5c185', label: 'Cát nắng vàng', desc: 'Cát trang trí thẩm mỹ' }
};

const hardscapeItems = {
  bonsai: { label: 'Lũa Bonsai 🌳', icon: '🌳', desc: 'Tạo hình cây cổ thụ rêu phong' },
  driftwood: { label: 'Lũa Xương Chùm 🪵', icon: '🪵', desc: 'Lũa uốn khúc tự nhiên' },
  tiger: { label: 'Đá Tiger 🪨', icon: '🪨', desc: 'Đá vàng óng, nhiều kẽ nứt' },
  taimeo: { label: 'Đá Tai Mèo 🏔️', icon: '🏔️', desc: 'Đá nhọn hoang sơ' }
};

const floraItems = {
  montecarlo: { label: 'Trân châu ngọc trai (Tiền cảnh)', color: '#68b85c', desc: 'Thảm cỏ xanh bò sát nền' },
  anubias: { label: 'Ráy lá nhỏ Nana (Trung cảnh)', color: '#2d6d35', desc: 'Lá dày sẫm buộc lên gỗ, đá' },
  fern: { label: 'Dương xỉ (Trung cảnh)', color: '#448c4e', desc: 'Lá dài feathery tự nhiên' },
  rotala: { label: 'Cắt cắm lá đỏ (Hậu cảnh)', color: '#cc4d4d', desc: 'Thân cao lá đỏ hồng rực rỡ' }
};

const faunaItems = {
  neon: { label: 'Cá Neon Xanh 🐟', icon: '🐟', desc: 'Bơi theo đàn phát sáng' },
  tamgiac: { label: 'Cá Tam Giác 🐠', icon: '🐠', desc: 'Nhanh nhẹn, thân cam rực' },
  cherry: { label: 'Tép Cherry Đỏ 🦐', icon: '🦐', desc: 'Bò đáy bể dọn rêu hại' },
  mun: { label: 'Cá Mún Vàng 🐡', icon: '🐡', desc: 'Cá vàng tinh nghịch diệt váng' },
  
  // Rare breeds from Gacha
  goldfish: { label: 'Cá Chép Koi 🎏', icon: '🎏', desc: 'Cá Koi vẩy rồng may mắn (Hiếm)' },
  jellyfish: { label: 'Sứa Neon 👾', icon: '👾', desc: 'Sứa phát sáng kỳ ảo (Cực Hiếm)' },
  discus: { label: 'Cá Đĩa Đỏ 🐙', icon: '🐙', desc: 'Cá đĩa đỏ hoàng gia (Hiếm)' },
  angler: { label: 'Cá Lồng Đèn 🦑', icon: '🦑', desc: 'Cá lồng đèn phát sáng (Hiếm)' },
  whale: { label: 'Cá Voi Xanh 🐋', icon: '🐋', desc: 'Cá voi xanh mini khổng lồ (Siêu Cấp)' }
};

// Initialize
window.addEventListener('DOMContentLoaded', () => {
  canvas = document.getElementById('aquarium-canvas');
  ctx = canvas.getContext('2d');
  
  setupTheme();
  setupEventListeners();
  loadOrInitProgress();
  
  // Start Game loop
  tick();
});

// Theme Setup & Clock check
function setupTheme() {
  const checkClock = () => {
    if (state.themeOverride === 'auto') {
      const hour = new Date().getHours();
      // Night is from 18:00 (6 PM) to 6:00 (6 AM)
      const isNight = hour >= 18 || hour < 6;
      setThemeClass(isNight);
    } else {
      setThemeClass(state.themeOverride === 'dark');
    }
  };
  
  checkClock();
  setInterval(checkClock, 60000); // Check every minute
}

function setThemeClass(isNight) {
  const body = document.body;
  const themeStatus = document.getElementById('theme-status');
  const themeText = document.getElementById('theme-text');
  const lightGlow = document.getElementById('tank-light-glow');
  
  if (isNight) {
    body.classList.remove('theme-light');
    body.classList.add('theme-dark');
    themeStatus.querySelector('.theme-icon').textContent = '🌙';
    themeText.textContent = 'Ban đêm (Theme Tối)';
    
    // Automatically turn on tank light rays in night mode if light equipment is installed
    if (state.equipment.light) {
      lightGlow.classList.add('active');
    } else {
      lightGlow.classList.remove('active');
    }
  } else {
    body.classList.remove('theme-dark');
    body.classList.add('theme-light');
    themeStatus.querySelector('.theme-icon').textContent = '☀️';
    themeText.textContent = 'Ban ngày (Theme Sáng)';
    lightGlow.classList.remove('active');
  }
}

// Sound Synthesis using Web Audio API
function initAudio() {
  if (audioCtx) return;
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    // Create water hum (low frequency lowpassed noise)
    const bufferSize = audioCtx.sampleRate * 2;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    
    noiseSource = audioCtx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;
    
    noiseFilter = audioCtx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(140, audioCtx.currentTime);
    
    noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0.0, audioCtx.currentTime); // Start muted
    
    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(audioCtx.destination);
    noiseSource.start();
    
    // Water bubbling interval
    soundInterval = setInterval(playBubbleSound, 400);
  } catch (e) {
    console.error("Audio Synthesis error:", e);
  }
}

function playBubbleSound() {
  if (!soundActive || !audioCtx) return;
  
  // Bubbling pop chirps
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  
  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  
  const now = audioCtx.currentTime;
  osc.type = 'sine';
  osc.frequency.setValueAtTime(320 + Math.random() * 100, now);
  osc.frequency.exponentialRampToValueAtTime(750 + Math.random() * 200, now + 0.08);
  
  gainNode.gain.setValueAtTime(0.015 + Math.random() * 0.02, now);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
  
  osc.start(now);
  osc.stop(now + 0.09);
}

function toggleSound() {
  initAudio();
  const btn = document.getElementById('btn-sound');
  soundActive = !soundActive;
  
  if (audioCtx) {
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    
    // Fade hum gain in/out
    const targetVolume = soundActive && state.equipment.filter ? 0.25 : 0.0;
    noiseGain.gain.setTargetAtTime(targetVolume, audioCtx.currentTime, 0.3);
  }
  
  btn.textContent = soundActive ? '🔊 Bật tiếng' : '🔇 Tắt tiếng';
  btn.classList.toggle('btn-accent', soundActive);
}

// LocalStorage & Cloud Sync logic
async function loadOrInitProgress() {
  const cachedCode = localStorage.getItem('aquarium_sync_code');
  if (cachedCode) {
    currentSyncCode = cachedCode;
    document.getElementById('sync-code-display').textContent = currentSyncCode;
    await fetchStateFromServer(currentSyncCode);
  } else {
    // Save state once to generate code
    await saveStateToServer(true);
  }
}

async function fetchStateFromServer(code) {
  try {
    const res = await fetch(`/api/aquarium/load/${code}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.state) {
        state = data.state;
        updateUI();
        showToast("Đã đồng bộ bể cá của bạn!");
      }
    } else {
      localStorage.removeItem('aquarium_sync_code');
      currentSyncCode = '';
      await saveStateToServer(true);
    }
  } catch (err) {
    console.error("Error fetching state:", err);
  }
}

async function saveStateToServer(immediate = false) {
  if (saveDebounceTimer) {
    clearTimeout(saveDebounceTimer);
  }
  
  const performSave = async () => {
    try {
      const response = await fetch('/api/aquarium/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: currentSyncCode, state })
      });
      const data = await response.json();
      if (data.success) {
        currentSyncCode = data.code;
        localStorage.setItem('aquarium_sync_code', currentSyncCode);
        document.getElementById('sync-code-display').textContent = currentSyncCode;
      }
    } catch (e) {
      console.error("Error saving state to server:", e);
    }
  };

  if (immediate) {
    await performSave();
  } else {
    saveDebounceTimer = setTimeout(performSave, 2000);
  }
}

// Navigation Steps
function updateStepUI() {
  const stepsList = document.querySelectorAll('#setup-steps-list .step-item');
  stepsList.forEach((item, idx) => {
    const stepNum = idx + 1;
    item.classList.remove('active', 'completed');
    
    if (stepNum === state.step) {
      item.classList.add('active');
    } else if (stepNum < state.step) {
      item.classList.add('completed');
    }
  });

  // Load toolbox for this step
  loadToolbox();
  
  // Update nav buttons
  document.getElementById('btn-prev-step').disabled = state.step === 1;
  const nextBtn = document.getElementById('btn-next-step');
  
  if (state.step === 8) {
    nextBtn.textContent = 'Hoàn Thành 🌿';
  } else {
    nextBtn.textContent = 'Tiếp Theo ➔';
  }
  
  // Set guides / tips banner based on step
  const tips = [
    "Bước 1: Chọn kích cỡ bể cá. Bể càng to thì chơi càng dễ vì nước ổn định, tuy nhiên tốn đất nền và lũa đá hơn. Chọn 1 trong 3 cỡ bên phải.",
    "Bước 2: Rải phân nền. Hãy chọn cốt nền dinh dưỡng lót đáy trước, sau đó rải lớp phân nền công nghiệp ADA để cắm rễ cây. Sử dụng cọ vẽ (nhấn giữ kéo) đáy bể để tạo đồi cao tự nhiên.",
    "Bước 3: Sắp xếp lũa & đá (Hardscape). Chọn lũa Bonsai hoặc đá núi, kéo thả di chuyển chúng trên màn hình. Sử dụng thanh trượt bên phải để phóng to và xoay góc đá lũa cho đẹp mắt.",
    "Bước 4: Trồng cây. Chọn loại cây cắm rễ nền tiền cảnh (Trân châu ngọc trai), hậu cảnh (Rotala lá đỏ) hoặc buộc ráy/rêu lên gỗ đá. Click lên bể cá để trồng cây.",
    "Bước 5: Lắp đặt máy lọc, đèn LED và sủi khí CO2. Thiết bị hoạt động tốt giúp nước trong vắt và cây thủy sinh quang hợp nhả bong bóng khí cực đẹp.",
    "Bước 6: Vào nước từ từ để tránh xói phân nền. Sau đó châm vi sinh sống (men lọc) để nuôi hệ vi khuẩn phân hủy độc tố. Đợi vòng chu trình sinh học (cycling) chạy an toàn mới thả cá nhé!",
    "Bước 7: Thả cá neon, cá tam giác bơi lội theo đàn hoặc thả tép cảnh dọn dêu hại. Click vào bể để thả các cư dân bé nhỏ của bạn.",
    "Bước 8: Bể cá của bạn đã hoàn thành! Bật chế độ thư giãn 🧘‍♂️ để ngắm nhìn bể. Bạn có thể châm phân nước, cắt tỉa cây mọc cao, cọ lau kính rêu hại hoặc thay nước định kỳ."
  ];
  document.getElementById('tip-banner-text').textContent = tips[state.step - 1];
  
  // Sound gains adapt
  if (audioCtx && soundActive) {
    const targetVolume = state.equipment.filter ? 0.25 : 0.0;
    noiseGain.gain.setTargetAtTime(targetVolume, audioCtx.currentTime, 0.3);
  }
}

// Generate Toolbox Content
function loadToolbox() {
  const container = document.getElementById('toolbox-options-container');
  const title = document.getElementById('toolbox-title');
  container.innerHTML = '';
  activeTool = null;
  selectedToolOption = null;
  
  switch(state.step) {
    case 1:
      title.textContent = 'Chọn Kích Thước Bể';
      container.innerHTML = `
        <div class="tool-grid">
          <div class="tool-card ${state.tankSize === 'cubic40' ? 'selected' : ''}" onclick="selectTankSize('cubic40')">
            <span class="tool-icon">🧊</span>
            <span class="tool-name">Cubic 40</span>
            <span class="tool-desc">40x40x40cm (~64L)<br>Nhỏ gọn, dễ thương</span>
          </div>
          <div class="tool-card ${state.tankSize === 'standard60' ? 'selected' : ''}" onclick="selectTankSize('standard60')">
            <span class="tool-icon">📐</span>
            <span class="tool-name">Standard 60</span>
            <span class="tool-desc">60x40x40cm (~96L)<br>Tối ưu cho người mới</span>
          </div>
          <div class="tool-card ${state.tankSize === 'premium90' ? 'selected' : ''}" onclick="selectTankSize('premium90')">
            <span class="tool-icon">👑</span>
            <span class="tool-name">Premium 90</span>
            <span class="tool-desc">90x45x45cm (~180L)<br>Hùng vĩ, rộng rãi</span>
          </div>
        </div>
      `;
      break;
      
    case 2:
      title.textContent = 'Rải Phân Nền & Đất';
      container.innerHTML = `
        <p class="tool-desc" style="margin-bottom:10px;">Chọn vật liệu bên dưới, sau đó nhấn giữ kéo trên mặt đáy bể cá để đắp đất nền:</p>
        <div class="tool-grid">
          <div class="tool-card" id="card-brush-base" onclick="selectSubstrateBrush('base')">
            <span class="tool-icon" style="color:${materials.base.color}">🟫</span>
            <span class="tool-name">${materials.base.label}</span>
            <span class="tool-desc">${materials.base.desc}</span>
          </div>
          <div class="tool-card" id="card-brush-soil" onclick="selectSubstrateBrush('soil')">
            <span class="tool-icon" style="color:${materials.soil.color}">⬛</span>
            <span class="tool-name">${materials.soil.label}</span>
            <span class="tool-desc">${materials.soil.desc}</span>
          </div>
          <div class="tool-card" id="card-brush-sand" onclick="selectSubstrateBrush('sand')">
            <span class="tool-icon" style="color:${materials.sand.color}">🟨</span>
            <span class="tool-name">${materials.sand.label}</span>
            <span class="tool-desc">${materials.sand.desc}</span>
          </div>
        </div>
        <div class="btn-action-block" style="margin-top: 15px;">
          <button class="btn-action" onclick="clearSubstrate()">🧹 Xóa hết nền</button>
        </div>
      `;
      break;
      
    case 3:
      title.textContent = 'Bố cục Lũa & Đá';
      container.innerHTML = `
        <p class="tool-desc" style="margin-bottom:10px;">Nhấn vào vật liệu để thêm vào bể. Kéo di chuyển, và dùng các núm xoay bên dưới:</p>
        <div class="tool-grid">
          <div class="tool-card" onclick="addHardscape('bonsai')">
            <span class="tool-icon">🌳</span>
            <span class="tool-name">${hardscapeItems.bonsai.label}</span>
          </div>
          <div class="tool-card" onclick="addHardscape('driftwood')">
            <span class="tool-icon">🪵</span>
            <span class="tool-name">${hardscapeItems.driftwood.label}</span>
          </div>
          <div class="tool-card" onclick="addHardscape('tiger')">
            <span class="tool-icon">🪨</span>
            <span class="tool-name">${hardscapeItems.tiger.label}</span>
          </div>
          <div class="tool-card" onclick="addHardscape('taimeo')">
            <span class="tool-icon">🏔️</span>
            <span class="tool-name">${hardscapeItems.taimeo.label}</span>
          </div>
        </div>
        
        <div class="hardscape-controls" id="hardscape-sliders" style="display:none; margin-top: 15px; display:flex; flex-direction:column; gap:12px;">
          <h4 style="font-size:0.9rem; font-weight:700;">Điều chỉnh Vật thể Đang Chọn:</h4>
          <div class="control-slider-group">
            <div class="slider-header">
              <span>Phóng to/Thu nhỏ</span>
              <span id="txt-hs-scale">1.0x</span>
            </div>
            <input type="range" id="slide-hs-scale" class="custom-range" min="0.4" max="2.0" step="0.05" value="1.0" oninput="adjustSelectedHardscape('scale', this.value)">
          </div>
          <div class="control-slider-group">
            <div class="slider-header">
              <span>Xoay góc</span>
              <span id="txt-hs-rotate">0°</span>
            </div>
            <input type="range" id="slide-hs-rotate" class="custom-range" min="-180" max="180" step="5" value="0" oninput="adjustSelectedHardscape('rotation', this.value)">
          </div>
          <button class="btn-action" style="background:var(--color-danger); color:white; border:none;" onclick="removeSelectedHardscape()">🗑️ Xóa vật thể chọn</button>
        </div>
      `;
      activeTool = 'drag-hardscape';
      break;
      
    case 4:
      title.textContent = 'Cắm Cây Thủy Sinh';
      container.innerHTML = `
        <p class="tool-desc" style="margin-bottom:10px;">Chọn cây rồi click lên đất nền/gỗ đá trong bể để trồng:</p>
        <div class="tool-grid">
          <div class="tool-card" id="card-plant-montecarlo" onclick="selectPlantTool('montecarlo')">
            <span class="tool-icon">🌱</span>
            <span class="tool-name">Trân châu ngọc trai</span>
          </div>
          <div class="tool-card" id="card-plant-anubias" onclick="selectPlantTool('anubias')">
            <span class="tool-icon">🌿</span>
            <span class="tool-name">Ráy Nana</span>
          </div>
          <div class="tool-card" id="card-plant-fern" onclick="selectPlantTool('fern')">
            <span class="tool-icon">☘️</span>
            <span class="tool-name">Dương xỉ</span>
          </div>
          <div class="tool-card" id="card-plant-rotala" onclick="selectPlantTool('rotala')">
            <span class="tool-icon">🍁</span>
            <span class="tool-name">Cắt cắm lá đỏ</span>
          </div>
        </div>
        <div class="btn-action-block" style="margin-top: 15px;">
          <button class="btn-action" onclick="clearPlants()">🧹 Bứng hết cây</button>
        </div>
      `;
      break;
      
    case 5:
      title.textContent = 'Lắp Đặt Thiết Bị';
      container.innerHTML = `
        <div class="btn-action-block">
          <button class="btn-action ${state.equipment.filter ? 'active' : ''}" onclick="toggleEquipment('filter')">
            🪣 Máy lọc ngoài Canister: <span>${state.equipment.filter ? 'Đang Chạy' : 'Đang Tắt'}</span>
          </button>
          <button class="btn-action ${state.equipment.light ? 'active' : ''}" onclick="toggleEquipment('light')">
            💡 Đèn LED RGB Chuyên dụng: <span>${state.equipment.light ? 'Đang Bật' : 'Đang Tắt'}</span>
          </button>
          <button class="btn-action ${state.equipment.co2 ? 'active' : ''}" onclick="toggleEquipment('co2')">
            💨 Hệ thống sủi nén CO2: <span>${state.equipment.co2 ? 'Đang sủi' : 'Đang Tắt'}</span>
          </button>
          <button class="btn-action ${state.equipment.fan ? 'active' : ''}" onclick="toggleEquipment('fan')">
            🪭 Quạt làm mát nước: <span>${state.equipment.fan ? 'Đang Quay' : 'Đang Tắt'}</span>
          </button>
        </div>
      `;
      break;
      
    case 6:
      title.textContent = 'Vào Nước & Men Vi Sinh';
      const biologicalState = state.bioCycle.cycled ? 
        `<span style="color:var(--color-success); font-weight:700;">Hệ Lọc Sinh Học Khỏe Mạnh (An Toàn)</span>` : 
        `<span style="color:var(--color-warning); font-weight:700;">Đang thiết lập hệ vi sinh (Chưa an toàn để thả cá)</span>`;
      
      container.innerHTML = `
        <div class="btn-action-block" style="margin-bottom:15px;">
          <button class="btn-action" id="btn-fill-water" onclick="fillWater()" ${state.waterLevel > 0.1 ? 'disabled' : ''}>💧 Bơm nước đầy bể</button>
          <button class="btn-action" id="btn-dose-bacteria" onclick="doseBacteria()" ${state.waterLevel < 0.8 || state.bioCycle.bacteria > 0.9 ? 'disabled' : ''}>🧪 Châm Men Vi Sinh sống</button>
        </div>
        
        <div class="cycling-monitor control-slider-group" style="font-size:0.85rem;">
          <h4 style="margin-bottom:8px; border-bottom:1px solid var(--glass-border); padding-bottom:4px;">Giám Sát Chu Trình Nitơ</h4>
          <div style="margin-bottom:6px;">
            <div style="display:flex; justify-content:space-between;"><span>Độc tố Ammonia (NH3)</span> <span id="lbl-nh3">--</span></div>
            <div style="width:100%; height:6px; background:#ddd; border-radius:3px; overflow:hidden;"><div id="bar-nh3" style="width:0; height:100%; background:var(--color-danger); transition:width 0.5s;"></div></div>
          </div>
          <div style="margin-bottom:6px;">
            <div style="display:flex; justify-content:space-between;"><span>Độc tố Nitrite (NO2)</span> <span id="lbl-no2">--</span></div>
            <div style="width:100%; height:6px; background:#ddd; border-radius:3px; overflow:hidden;"><div id="bar-no2" style="width:0; height:100%; background:var(--color-warning); transition:width 0.5s;"></div></div>
          </div>
          <div style="margin-bottom:6px;">
            <div style="display:flex; justify-content:space-between;"><span>Men Vi Sinh hữu ích</span> <span id="lbl-bacteria">--</span></div>
            <div style="width:100%; height:6px; background:#ddd; border-radius:3px; overflow:hidden;"><div id="bar-bacteria" style="width:0; height:100%; background:var(--color-success); transition:width 0.5s;"></div></div>
          </div>
          <p style="font-size:0.75rem; color:var(--text-muted); margin-top:8px;">${biologicalState}</p>
        </div>
      `;
      updateCyclingBars();
      break;
      
    case 7:
      title.textContent = 'Thả Cá & Tép Cảnh';
      container.innerHTML = `
        <p class="tool-desc" style="margin-bottom:10px;">Bể đã an toàn sinh học! Nhấn chọn cá/tép để thả vào bể (tối đa 25 con):</p>
        <div class="tool-grid">
          <div class="tool-card" onclick="spawnFauna('neon')">
            <span class="tool-icon">🐟</span>
            <span class="tool-name">${faunaItems.neon.label}</span>
            <span class="tool-desc">${faunaItems.neon.desc}</span>
          </div>
          <div class="tool-card" onclick="spawnFauna('tamgiac')">
            <span class="tool-icon">🐠</span>
            <span class="tool-name">${faunaItems.tamgiac.label}</span>
            <span class="tool-desc">${faunaItems.tamgiac.desc}</span>
          </div>
          <div class="tool-card" onclick="spawnFauna('cherry')">
            <span class="tool-icon">🦐</span>
            <span class="tool-name">${faunaItems.cherry.label}</span>
            <span class="tool-desc">${faunaItems.cherry.desc}</span>
          </div>
          <div class="tool-card" onclick="spawnFauna('mun')">
            <span class="tool-icon">🐡</span>
            <span class="tool-name">${faunaItems.mun.label}</span>
            <span class="tool-desc">${faunaItems.mun.desc}</span>
          </div>
        </div>
        <div class="btn-action-block" style="margin-top: 15px;">
          <button class="btn-action" style="background:var(--color-danger); color:white; border:none;" onclick="clearFauna()">🗑️ Vớt hết cá tép ra</button>
        </div>
      `;
      break;
      
    case 8:
      title.textContent = 'Chăm Sóc & Thư Giãn';
      let themeHTML = `
        <div style="margin-top:15px; border-top:1px solid var(--glass-border); padding-top:15px;">
          <h4 style="font-size:0.9rem; font-weight:700; margin-bottom:8px;">Chủ Đề Bể Cá</h4>
          <div class="tool-grid">
            <div class="tool-card ${state.activeTheme === 'river' ? 'selected' : ''}" onclick="switchTheme('river')">
              <span class="tool-icon">🌿</span>
              <span class="tool-name">Sông</span>
              <span class="tool-desc">Mở khóa</span>
            </div>
            <div class="tool-card ${state.activeTheme === 'reef' ? 'selected' : ''}" onclick="switchTheme('reef')">
              <span class="tool-icon">🪸</span>
              <span class="tool-name">Coral Reef</span>
              <span class="tool-desc">${state.unlockedThemes.includes('reef') ? 'Mở khóa' : 'Khóa (50 🔮)'}</span>
            </div>
            <div class="tool-card ${state.activeTheme === 'zen' ? 'selected' : ''}" onclick="switchTheme('zen')">
              <span class="tool-icon">🌸</span>
              <span class="tool-name">Ao Zen</span>
              <span class="tool-desc">${state.unlockedThemes.includes('zen') ? 'Mở khóa' : 'Khóa (100 🔮)'}</span>
            </div>
          </div>
        </div>
      `;
      container.innerHTML = `
        <p class="tool-desc" style="margin-bottom:10px;">Bể cá đã hoạt động ổn định. Hãy chăm sóc bể cá và đổi chủ đề bể:</p>
        <div class="btn-action-block">
          <button class="btn-action" id="tool-feed" onclick="selectMaintenanceTool('feed')">🍂 Rải thức ăn cho cá</button>
          <button class="btn-action" id="tool-prune" onclick="selectMaintenanceTool('prune')">✂️ Kéo cắt tỉa cây mọc cao</button>
          <button class="btn-action" id="tool-scrape" onclick="selectMaintenanceTool('scrape')">🧽 Dao cạo rêu bám kính</button>
          <button class="btn-action" onclick="performWaterChange()">🪣 Thay nước 30% định kỳ</button>
          <button class="btn-action" onclick="doseLiquidFertilizer()">🧪 Châm phân nước vi lượng</button>
        </div>
        ${themeHTML}
      `;
      break;
  }
}

// Select size
function selectTankSize(size) {
  state.tankSize = size;
  updateUI();
  saveStateToServer();
}

// Brushing substrate
function selectSubstrateBrush(type) {
  document.querySelectorAll('.tool-card').forEach(c => c.classList.remove('selected'));
  document.getElementById(`card-brush-${type}`).classList.add('selected');
  activeTool = `brush-${type}`;
}

function clearSubstrate() {
  state.substrate.base = Array(40).fill(0);
  state.substrate.soil = Array(40).fill(0);
  state.substrate.sand = Array(40).fill(0);
  updateUI();
  saveStateToServer();
}

// Hardscape Arrangement
function addHardscape(type) {
  const dim = tankDims[state.tankSize];
  const item = {
    type,
    x: canvas.width / 2 + (Math.random() * 80 - 40),
    y: canvas.height - 100,
    scale: 1.0,
    rotation: 0.0
  };
  state.hardscapes.push(item);
  selectedHardscapeIndex = state.hardscapes.length - 1;
  updateHardscapeSliders();
  updateUI();
  saveStateToServer();
}

function updateHardscapeSliders() {
  const panel = document.getElementById('hardscape-sliders');
  if (selectedHardscapeIndex >= 0 && selectedHardscapeIndex < state.hardscapes.length) {
    const item = state.hardscapes[selectedHardscapeIndex];
    panel.style.display = 'flex';
    document.getElementById('slide-hs-scale').value = item.scale;
    document.getElementById('txt-hs-scale').textContent = item.scale + 'x';
    
    const deg = Math.round(item.rotation * 180 / Math.PI);
    document.getElementById('slide-hs-rotate').value = deg;
    document.getElementById('txt-hs-rotate').textContent = deg + '°';
  } else {
    panel.style.display = 'none';
  }
}

function adjustSelectedHardscape(prop, val) {
  if (selectedHardscapeIndex >= 0 && selectedHardscapeIndex < state.hardscapes.length) {
    const item = state.hardscapes[selectedHardscapeIndex];
    if (prop === 'scale') {
      item.scale = parseFloat(val);
      document.getElementById('txt-hs-scale').textContent = val + 'x';
    } else if (prop === 'rotation') {
      const rad = parseFloat(val) * Math.PI / 180;
      item.rotation = rad;
      document.getElementById('txt-hs-rotate').textContent = val + '°';
    }
    saveStateToServer();
  }
}

function removeSelectedHardscape() {
  if (selectedHardscapeIndex >= 0 && selectedHardscapeIndex < state.hardscapes.length) {
    state.hardscapes.splice(selectedHardscapeIndex, 1);
    selectedHardscapeIndex = -1;
    updateHardscapeSliders();
    updateUI();
    saveStateToServer();
  }
}

// Planting plants
function selectPlantTool(type) {
  document.querySelectorAll('.tool-card').forEach(c => c.classList.remove('selected'));
  document.getElementById(`card-plant-${type}`).classList.add('selected');
  activeTool = 'place-plant';
  selectedToolOption = type;
}

function clearPlants() {
  state.plants = [];
  updateUI();
  saveStateToServer();
}

// Equipments toggle
function toggleEquipment(type) {
  state.equipment[type] = !state.equipment[type];
  
  // Update lights glow
  const isNight = document.body.classList.contains('theme-dark');
  const lightGlow = document.getElementById('tank-light-glow');
  if (isNight && state.equipment.light) {
    lightGlow.classList.add('active');
  } else {
    lightGlow.classList.remove('active');
  }
  
  // Hum sound activation
  if (audioCtx && soundActive) {
    const targetVolume = state.equipment.filter ? 0.25 : 0.0;
    noiseGain.gain.setTargetAtTime(targetVolume, audioCtx.currentTime, 0.3);
  }
  
  loadToolbox();
  updateUI();
  saveStateToServer();
}

// Water filling & Biological cycling
function fillWater() {
  if (state.waterLevel > 0.1) return;
  
  const fillBtn = document.getElementById('btn-fill-water');
  fillBtn.disabled = true;
  fillBtn.textContent = '🌊 Đang Bơm Nước...';
  
  const waterOverlay = document.getElementById('water-filling-overlay');
  waterOverlay.style.height = '85%';
  
  setTimeout(() => {
    state.waterLevel = 0.85;
    fillBtn.textContent = '✓ Bể Đầy Nước';
    loadToolbox();
    updateUI();
    saveStateToServer();
  }, 3000);
}

function doseBacteria() {
  if (state.waterLevel < 0.8 || state.bioCycle.bacteria > 0.9) return;
  
  // Add bacteria drops
  for (let i = 0; i < 5; i++) {
    waterDroplets.push({
      x: canvas.width / 2 + (Math.random() * 200 - 100),
      y: tankDims[state.tankSize].yOffset,
      size: 4 + Math.random() * 4,
      speed: 1.5 + Math.random() * 2
    });
  }
  
  const doseBtn = document.getElementById('btn-dose-bacteria');
  doseBtn.disabled = true;
  doseBtn.textContent = '🧪 Đang châm vi sinh...';
  
  // Simulate Nitrogen Cycle
  let step = 0;
  const cycleInterval = setInterval(() => {
    step++;
    
    // Ammonia goes down, bacteria goes up, Nitrite goes up then down, Nitrate rises slowly
    state.bioCycle.bacteria = Math.min(1.0, state.bioCycle.bacteria + 0.1);
    
    if (step <= 5) {
      state.bioCycle.ammonia = Math.max(0.0, state.bioCycle.ammonia - 0.2);
      state.bioCycle.nitrite = Math.min(1.0, state.bioCycle.nitrite + 0.2);
    } else {
      state.bioCycle.nitrite = Math.max(0.0, state.bioCycle.nitrite - 0.2);
      state.bioCycle.nitrate = Math.min(0.8, state.bioCycle.nitrate + 0.15);
    }
    
    updateCyclingBars();
    
    if (step >= 10) {
      clearInterval(cycleInterval);
      state.bioCycle.cycled = true;
      state.bioCycle.ammonia = 0.0;
      state.bioCycle.nitrite = 0.0;
      state.bioCycle.bacteria = 1.0;
      
      doseBtn.textContent = '✓ Hoàn tất Cycling';
      updateUI();
      loadToolbox();
      saveStateToServer();
    }
  }, 1000);
}

function updateCyclingBars() {
  if (state.step !== 6) return;
  
  const nh3 = state.bioCycle.ammonia;
  const no2 = state.bioCycle.nitrite;
  const bac = state.bioCycle.bacteria;
  
  document.getElementById('lbl-nh3').textContent = (nh3 * 5).toFixed(1) + ' mg/l';
  document.getElementById('bar-nh3').style.width = (nh3 * 100) + '%';
  
  document.getElementById('lbl-no2').textContent = (no2 * 2).toFixed(1) + ' mg/l';
  document.getElementById('bar-no2').style.width = (no2 * 100) + '%';
  
  document.getElementById('lbl-bacteria').textContent = (bac * 100).toFixed(0) + '%';
  document.getElementById('bar-bacteria').style.width = (bac * 100) + '%';
}

// Fauna Introduction
function spawnFauna(type) {
  if (state.fishes.length >= 25) {
    showToast("Bể cá đã chật, không nên thả thêm!");
    return;
  }
  
  const dim = tankDims[state.tankSize];
  const waterTop = dim.yOffset + (1.0 - state.waterLevel) * (canvas.height - dim.yOffset - 30);
  const bottomBound = canvas.height - 50;
  
  state.fishes.push({
    type,
    x: canvas.width / 2 + (Math.random() * 100 - 50),
    y: waterTop + Math.random() * (bottomBound - waterTop - 50),
    vx: (Math.random() > 0.5 ? 1 : -1) * (0.8 + Math.random() * 0.8),
    vy: (Math.random() * 2 - 1) * 0.4,
    size: type === 'cherry' ? 12 : 16 + Math.random() * 6,
    angle: 0,
    targetX: canvas.width / 2,
    targetY: canvas.height / 2,
    hunger: 100,
    sizeScale: 1.0
  });
  
  updateUI();
  saveStateToServer();
}

function clearFauna() {
  state.fishes = [];
  updateUI();
  saveStateToServer();
}

// Maintenance Mode tools
function selectMaintenanceTool(tool) {
  document.querySelectorAll('.btn-action').forEach(b => b.classList.remove('active'));
  
  if (activeTool === tool) {
    activeTool = null;
  } else {
    activeTool = tool;
    document.getElementById(`tool-${tool}`).classList.add('active');
  }
}

function performWaterChange() {
  if (state.waterLevel < 0.2) return;
  
  showToast("🪣 Đang hút 30% nước cũ...");
  
  // Lower water level
  const origLevel = state.waterLevel;
  state.waterLevel = 0.55;
  
  const waterOverlay = document.getElementById('water-filling-overlay');
  waterOverlay.style.height = '55%';
  
  setTimeout(() => {
    showToast("💧 Đang bơm nước sạch mới...");
    state.waterLevel = 0.85;
    waterOverlay.style.height = '85%';
    
    // Water change clears algae and resets nitrates
    algaeLevel = Math.max(0.0, algaeLevel - 0.5);
    state.bioCycle.nitrate = Math.max(0.0, state.bioCycle.nitrate - 0.6);
    
    updateUI();
    saveStateToServer();
  }, 2000);
}

function doseLiquidFertilizer() {
  showToast("🧪 Đang châm phân nước vi lượng cho cây...");
  
  // Bacteria particles
  for (let i = 0; i < 6; i++) {
    waterDroplets.push({
      x: canvas.width / 2 + (Math.random() * 300 - 150),
      y: tankDims[state.tankSize].yOffset,
      size: 3 + Math.random() * 3,
      speed: 1.2 + Math.random() * 2.5
    });
  }
  
  // Grow plants slightly
  state.plants.forEach(p => {
    p.size = Math.min(2.0, (p.size || 1.0) + 0.1);
  });
  
  updateUI();
  saveStateToServer();
}

// Event Listeners Setup
function setupEventListeners() {
  // Navigation Steps buttons
  document.getElementById('btn-prev-step').addEventListener('click', () => {
    if (state.step > 1) {
      state.step--;
      updateStepUI();
      saveStateToServer();
    }
  });
  
  document.getElementById('btn-next-step').addEventListener('click', () => {
    if (state.step < 8) {
      // Validation before stepping
      if (state.step === 1 && !state.tankSize) {
        showToast("Vui lòng chọn kích thước bể!");
        return;
      }
      if (state.step === 2 && isEmptyArray(state.substrate.soil) && isEmptyArray(state.substrate.sand)) {
        showToast("Hãy rải một ít đất nền để trồng cây nhé!");
        return;
      }
      if (state.step === 6 && !state.bioCycle.cycled) {
        showToast("Hãy châm vi sinh và đợi hệ lọc chạy ổn định (Cycled) đã!");
        return;
      }
      
      state.step++;
      updateStepUI();
      saveStateToServer();
    } else {
      // Completed, go home or relax
      showToast("🌿 Bể cá đã hoàn tất! Bắt đầu chế độ thư giãn.");
      document.body.classList.add('relax-mode');
    }
  });
  
  // Mode toggles
  document.getElementById('btn-sound').addEventListener('click', toggleSound);
  
  document.getElementById('btn-daynight').addEventListener('click', () => {
    const btn = document.getElementById('btn-daynight');
    if (state.themeOverride === 'auto') {
      state.themeOverride = 'light';
      btn.textContent = '☀️ Theme Sáng';
    } else if (state.themeOverride === 'light') {
      state.themeOverride = 'dark';
      btn.textContent = '🌙 Theme Tối';
    } else {
      state.themeOverride = 'auto';
      btn.textContent = '🌗 Tự động';
    }
    setupTheme();
    saveStateToServer();
  });
  
  document.getElementById('btn-photo').addEventListener('click', takeSnapshot);
  
  document.getElementById('btn-relax').addEventListener('click', () => {
    document.body.classList.toggle('relax-mode');
    const isRelax = document.body.classList.contains('relax-mode');
    document.getElementById('btn-relax').textContent = isRelax ? '🛠️ Bật điều khiển' : '🧘‍♂️ Thư giãn';
  });
  
  // Sync Dialog Modal handlers
  const syncModal = document.getElementById('sync-modal');
  document.getElementById('btn-sync-dialog').addEventListener('click', () => {
    syncModal.classList.add('open');
    document.getElementById('sync-input-code').value = '';
  });
  
  document.getElementById('btn-sync-cancel').addEventListener('click', () => {
    syncModal.classList.remove('open');
  });
  
  document.getElementById('btn-sync-confirm').addEventListener('click', async () => {
    const codeInput = document.getElementById('sync-input-code').value.trim();
    if (codeInput.length === 6 && /^\d+$/.test(codeInput)) {
      syncModal.classList.remove('open');
      await fetchStateFromServer(codeInput);
    } else {
      showToast("Vui lòng nhập đúng mã 6 chữ số!");
    }
  });
  
  document.getElementById('btn-copy-code').addEventListener('click', () => {
    if (currentSyncCode) {
      navigator.clipboard.writeText(currentSyncCode);
      showToast("📋 Đã sao chép mã bể cá!");
    }
  });
  
  // Gacha Modal handlers
  const gachaModal = document.getElementById('gacha-modal');
  document.getElementById('btn-gacha-open').addEventListener('click', () => {
    gachaModal.classList.add('open');
    document.getElementById('gacha-result-text').textContent = 'Chúc bạn may mắn!';
    document.getElementById('gacha-result-text').style.color = 'var(--text-main)';
  });
  
  document.getElementById('btn-gacha-close').addEventListener('click', () => {
    gachaModal.classList.remove('open');
  });
  
  document.getElementById('btn-spin-slot').addEventListener('click', spinGacha);

  // Canvas pointer events for drawing/dragging
  canvas.addEventListener('pointerdown', handlePointerDown);
  canvas.addEventListener('pointermove', handlePointerMove);
  canvas.addEventListener('pointerup', handlePointerUp);
  canvas.addEventListener('pointerleave', handlePointerUp);
}

// Canvas Interaction Handlers
function handlePointerDown(e) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const x = (e.clientX - rect.left) * scaleX;
  const y = (e.clientY - rect.top) * scaleY;
  
  const dim = tankDims[state.tankSize];
  if (x < (canvas.width - dim.width)/2 || x > (canvas.width + dim.width)/2 || y < dim.yOffset || y > canvas.height - 20) {
    return; // Clicked outside the tank glass
  }
  
  isDragging = true;
  
  // 0. Check if clicked on a pearl
  for (let i = droppedPearls.length - 1; i >= 0; i--) {
    const p = droppedPearls[i];
    if (Math.hypot(p.x - x, p.y - y) < 22) {
      // Collect pearl
      state.pearls = (state.pearls || 0) + p.value;
      droppedPearls.splice(i, 1);
      
      floatingTexts.push({
        x: p.x,
        y: p.y,
        text: `+${p.value} 🔮`,
        life: 1.0,
        color: '#9D00FF'
      });
      
      // Play high-pitched bubble collection sound
      if (audioCtx && soundActive) {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.frequency.setValueAtTime(880, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.08);
        gainNode.gain.setValueAtTime(0.03, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.08);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.09);
      }
      
      updateUI();
      saveStateToServer();
      return; // Stop further interaction on this click
    }
  }
  
  // Check Step-specific action
  if (state.step === 2 && activeTool && activeTool.startsWith('brush-')) {
    applySubstrateBrush(x, activeTool.split('-')[1]);
  } 
  else if (state.step === 3) {
    // Select or drag hardscapes
    selectedHardscapeIndex = -1;
    for (let i = state.hardscapes.length - 1; i >= 0; i--) {
      const hs = state.hardscapes[i];
      const radius = 40 * hs.scale;
      // Distance check
      if (Math.hypot(hs.x - x, hs.y - y) < radius) {
        selectedHardscapeIndex = i;
        dragOffset.x = hs.x - x;
        dragOffset.y = hs.y - y;
        updateHardscapeSliders();
        break;
      }
    }
    updateHardscapeSliders();
  }
  else if (state.step === 4 && activeTool === 'place-plant') {
    state.plants.push({
      type: selectedToolOption,
      x: x,
      y: y,
      size: 1.0
    });
    saveStateToServer();
  }
  else if (state.step === 8 && activeTool === 'feed') {
    // Drop fish food
    fishFood.push({ x, y: y < dim.yOffset ? dim.yOffset : y, speed: 1 + Math.random() * 1.5 });
  }
  else if (state.step === 8 && activeTool === 'prune') {
    // Cut background plants
    state.plants = state.plants.filter(p => {
      if (p.type === 'rotala' && Math.hypot(p.x - x, p.y - y) < 35) {
        p.size = 0.5; // Cut down
        return true;
      }
      // Bứng cây khác nếu nhấp trúng
      return Math.hypot(p.x - x, p.y - y) >= 20;
    });
    saveStateToServer();
  }
  else if (state.step === 8 && activeTool === 'scrape') {
    // Clean algae
    if (Math.random() > 0.5) {
      algaeLevel = Math.max(0, algaeLevel - 0.05);
      showToast("🧽 Lau sạch kính bể cá...");
    }
  }
}

function handlePointerMove(e) {
  if (!isDragging) return;
  
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const x = (e.clientX - rect.left) * scaleX;
  const y = (e.clientY - rect.top) * scaleY;
  
  const dim = tankDims[state.tankSize];
  
  if (state.step === 2 && activeTool && activeTool.startsWith('brush-')) {
    applySubstrateBrush(x, activeTool.split('-')[1]);
  }
  else if (state.step === 3 && selectedHardscapeIndex >= 0) {
    // Drag hardscape item
    const hs = state.hardscapes[selectedHardscapeIndex];
    hs.x = Math.max((canvas.width - dim.width)/2 + 20, Math.min((canvas.width + dim.width)/2 - 20, x + dragOffset.x));
    hs.y = Math.max(dim.yOffset + 40, Math.min(canvas.height - 30, y + dragOffset.y));
    saveStateToServer();
  }
  else if (state.step === 8 && activeTool === 'scrape') {
    algaeLevel = Math.max(0, algaeLevel - 0.005);
  }
}

function handlePointerUp() {
  isDragging = false;
}

// Substrate brush logic
function applySubstrateBrush(x, type) {
  const dim = tankDims[state.tankSize];
  const startX = (canvas.width - dim.width) / 2;
  const segmentWidth = dim.width / 40;
  
  const segmentIdx = Math.floor((x - startX) / segmentWidth);
  if (segmentIdx >= 0 && segmentIdx < 40) {
    // Increase thickness at index and adjacent indices for a smoother curve
    const indices = [segmentIdx - 2, segmentIdx - 1, segmentIdx, segmentIdx + 1, segmentIdx + 2];
    const intensities = [2, 6, 12, 6, 2];
    
    indices.forEach((idx, i) => {
      if (idx >= 0 && idx < 40) {
        state.substrate[type][idx] = Math.min(120, state.substrate[type][idx] + intensities[i]);
      }
    });
    
    saveStateToServer();
  }
}

// Spawn fauna helper
function spawnFaunaObject(type, x, y) {
  state.fishes.push({
    type, x, y,
    vx: (Math.random() > 0.5 ? 1 : -1) * (0.8 + Math.random() * 0.8),
    vy: (Math.random() * 2 - 1) * 0.4,
    size: type === 'cherry' ? 12 : 16 + Math.random() * 6,
    angle: 0,
    targetX: x,
    targetY: y,
    hunger: 100,
    sizeScale: 1.0
  });
}

// Validation utils
function isEmptyArray(arr) {
  return arr.every(v => v === 0);
}

// Snapshot/photo capture
function takeSnapshot() {
  showToast("📸 Đang chụp ảnh lưu khoảnh khắc...");
  
  // Flash effect
  const wrapper = document.querySelector('.aquarium-wrapper');
  wrapper.style.filter = 'brightness(2) contrast(1.2)';
  setTimeout(() => {
    wrapper.style.filter = 'none';
  }, 150);
  
  // Save canvas as image download link
  const link = document.createElement('a');
  link.download = 'be-ca-thuy-sinh-cua-toi.png';
  link.href = canvas.toDataURL();
  link.click();
}

function showToast(text) {
  const toast = document.getElementById('toast-notif');
  toast.textContent = text;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2500);
}

// Updating General UI state
function updateUI() {
  updateStepUI();
  
  if (document.getElementById('pearl-count')) {
    document.getElementById('pearl-count').textContent = state.pearls || 0;
  }
  
  // Update water statistics card readings
  const valTemp = document.getElementById('val-temp');
  const indTemp = document.getElementById('ind-temp');
  const valPh = document.getElementById('val-ph');
  const indPh = document.getElementById('ind-ph');
  const valBio = document.getElementById('val-bio');
  const indBio = document.getElementById('ind-bio');
  const valAlgae = document.getElementById('val-algae');
  const indAlgae = document.getElementById('ind-algae');
  
  // Set parameters mock value based on steps/equipments
  if (state.step < 6 || state.waterLevel < 0.2) {
    valTemp.textContent = '-- °C';
    valPh.textContent = '--';
    valBio.textContent = '--';
    valAlgae.textContent = '--';
    return;
  }
  
  // Temp: Cooling fan drops it
  const temp = state.equipment.fan ? 24.5 : 28.2;
  valTemp.textContent = temp.toFixed(1) + ' °C';
  indTemp.className = 'stat-indicator ' + (temp < 26 ? 'ok' : 'warning');
  
  // pH: CO2 drops it (makes it acidic)
  const ph = state.equipment.co2 ? 6.4 : 7.2;
  valPh.textContent = ph.toFixed(1);
  indPh.className = 'stat-indicator ok';
  
  // Bacteria
  const bio = state.bioCycle.cycled ? 'Khỏe mạnh' : 'Chưa ổn định';
  valBio.textContent = bio;
  indBio.className = 'stat-indicator ' + (state.bioCycle.cycled ? 'ok' : 'danger');
  
  // Algae
  const algaePct = Math.round(algaeLevel * 100);
  valAlgae.textContent = algaePct + '%';
  let algaeClass = 'ok';
  if (algaePct > 50) algaeClass = 'danger';
  else if (algaePct > 15) algaeClass = 'warning';
  indAlgae.className = 'stat-indicator ' + algaeClass;
  
  // Update water level visuals
  const waterOverlay = document.getElementById('water-filling-overlay');
  waterOverlay.style.height = (state.waterLevel * 100) + '%';
}

// GAME SIMULATION LOOP (60fps)
function tick() {
  time += 0.05;
  
  // Update physics/biology simulations
  simulateParticles();
  simulateFauna();
  simulateAlgaeGrowth();
  
  // Render canvas
  render();
  
  animationId = requestAnimationFrame(tick);
}

// Algae growth simulation
function simulateAlgaeGrowth() {
  if (state.step < 6 || state.waterLevel < 0.5) return;
  
  // Algae grows if light is ON, but slows down if filter & CO2 & plants are active
  if (state.equipment.light) {
    let growthRate = 0.00015;
    if (state.equipment.filter) growthRate -= 0.00005;
    if (state.equipment.co2) growthRate -= 0.00003;
    growthRate -= Math.min(0.00005, state.plants.length * 0.000005); // Plants consume nutrients
    
    algaeLevel = Math.max(0.0, Math.min(1.0, algaeLevel + growthRate));
  } else {
    // Dies down slowly in dark
    algaeLevel = Math.max(0.0, algaeLevel - 0.00005);
  }
}

// Particles physics (CO2, filter flow, bacteria drops, food)
function simulateParticles() {
  const dim = tankDims[state.tankSize];
  const startX = (canvas.width - dim.width) / 2;
  const endX = startX + dim.width;
  const bottom = canvas.height - 20;
  const waterTop = dim.yOffset + (1.0 - state.waterLevel) * (canvas.height - dim.yOffset - 30);
  
  // 1. Filter bubbles (flow)
  if (state.equipment.filter && state.waterLevel > 0.3) {
    // Outflow bubbles on top-left blowing right
    if (Math.random() < 0.2) {
      waterParticles.push({
        x: startX + 10,
        y: waterTop + 15,
        vx: 2 + Math.random() * 2,
        vy: (Math.random() - 0.5) * 0.5,
        size: 1 + Math.random() * 2,
        life: 1.0
      });
    }
  }
  
  waterParticles.forEach((p, idx) => {
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= 0.98; // Friction
    p.vy += 0.01; // Rise bubble
    p.life -= 0.015;
    
    // Boundary check
    if (p.x > endX || p.y < waterTop || p.life <= 0) {
      waterParticles.splice(idx, 1);
    }
  });
  
  // 2. CO2 bubbles
  if (state.equipment.co2 && state.waterLevel > 0.4) {
    // Bubble generator at bottom-right
    if (Math.random() < 0.4) {
      co2Bubbles.push({
        x: endX - 45 + (Math.random() * 8 - 4),
        y: bottom - 25,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -0.8 - Math.random() * 0.8,
        size: 0.8 + Math.random() * 1.0
      });
    }
  }
  
  co2Bubbles.forEach((b, idx) => {
    b.x += b.vx;
    b.y += b.vy;
    // Oscillate sideways
    b.vx += Math.sin(time + idx) * 0.05;
    
    if (b.y < waterTop || b.x < startX || b.x > endX) {
      co2Bubbles.splice(idx, 1);
    }
  });
  
  // 3. Bacteria droplets
  waterDroplets.forEach((d, idx) => {
    d.y += d.speed;
    if (d.y >= waterTop) {
      // Disperse inside water
      waterDroplets.splice(idx, 1);
    }
  });
  
  // 4. Fish Food
  fishFood.forEach((f, idx) => {
    // Slow sink inside water
    f.y += 0.6;
    f.x += Math.sin(time + idx) * 0.2;
    
    const segmentWidth = dim.width / 40;
    const segIdx = Math.floor((f.x - startX) / segmentWidth);
    let substrateY = bottom;
    if (segIdx >= 0 && segIdx < 40) {
      const hBase = state.substrate.base[segIdx] || 0;
      const hSoil = state.substrate.soil[segIdx] || 0;
      const hSand = state.substrate.sand[segIdx] || 0;
      substrateY = bottom - hBase - hSoil - hSand;
    }
    
    if (f.y >= substrateY) {
      // Sinks to soil and decays after some time
      fishFood.splice(idx, 1);
    }
  });
  
  // 5. Cherry Blossoms (Zen Pond theme)
  if (state.activeTheme === 'zen' && state.waterLevel > 0.1 && Math.random() < 0.015) {
    cherryBlossoms.push({
      x: startX + Math.random() * dim.width,
      y: dim.yOffset,
      vx: -0.5 - Math.random() * 0.5,
      vy: 0.4 + Math.random() * 0.4,
      size: 4 + Math.random() * 4,
      angle: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.05
    });
  }
  
  cherryBlossoms.forEach((c, idx) => {
    c.x += c.vx;
    c.y += c.vy;
    c.angle += c.rotSpeed;
    c.vx += Math.sin(time * 0.5 + idx) * 0.02;
    
    const segmentWidth = dim.width / 40;
    const segIdx = Math.floor((c.x - startX) / segmentWidth);
    let substrateY = bottom;
    if (segIdx >= 0 && segIdx < 40) {
      substrateY = bottom - (state.substrate.base[segIdx] || 0) - (state.substrate.soil[segIdx] || 0) - (state.substrate.sand[segIdx] || 0);
    }
    
    if (c.y >= substrateY || c.x < startX || c.x > endX) {
      cherryBlossoms.splice(idx, 1);
    }
  });

  // 6. Dropped Pearls
  droppedPearls.forEach(p => {
    if (p.vy > 0) {
      p.y += p.vy;
      p.angle += 0.05;
      
      const segmentWidth = dim.width / 40;
      const segIdx = Math.floor((p.x - startX) / segmentWidth);
      let substrateY = bottom;
      if (segIdx >= 0 && segIdx < 40) {
        substrateY = bottom - (state.substrate.base[segIdx] || 0) - (state.substrate.soil[segIdx] || 0) - (state.substrate.sand[segIdx] || 0);
      }
      
      if (p.y >= substrateY - 4) {
        p.y = substrateY - 4;
        p.vy = 0; // stop falling
      }
    }
  });
  
  // 7. Floating Texts
  floatingTexts.forEach((t, idx) => {
    t.y -= 0.5; // Float up
    t.life -= 0.015; // Fade out
    if (t.life <= 0) {
      floatingTexts.splice(idx, 1);
    }
  });
}

// AI Fish & Tép logic
function simulateFauna() {
  if (state.waterLevel < 0.3) return;
  
  const dim = tankDims[state.tankSize];
  const startX = (canvas.width - dim.width) / 2;
  const endX = startX + dim.width;
  const bottom = canvas.height - 20;
  const waterTop = dim.yOffset + (1.0 - state.waterLevel) * (canvas.height - dim.yOffset - 30);
  
  state.fishes.forEach(fish => {
    // Deplete hunger
    fish.hunger = Math.max(0, (fish.hunger || 100) - 0.006);
    
    // Spawning pearls from happy fish
    if (fish.type !== 'cherry' && fish.hunger > 50 && Math.random() < 0.0003) {
      droppedPearls.push({
        x: fish.x,
        y: fish.y,
        vy: 0.6 + Math.random() * 0.4,
        size: 5,
        angle: 0,
        value: 1
      });
      floatingTexts.push({
        x: fish.x,
        y: fish.y - 12,
        text: '🔮',
        life: 1.0,
        color: '#9A00D6'
      });
    }

    if (fish.type === 'cherry') {
      // Shrimp behavior: crawl on bottom substrate, crawl on wood, rocks
      // Look for a close hardscape or crawl bottom
      let targetY = bottom;
      let targetX = fish.x;
      
      const segmentWidth = dim.width / 40;
      const segIdx = Math.floor((fish.x - startX) / segmentWidth);
      if (segIdx >= 0 && segIdx < 40) {
        const hBase = state.substrate.base[segIdx] || 0;
        const hSoil = state.substrate.soil[segIdx] || 0;
        const hSand = state.substrate.sand[segIdx] || 0;
        targetY = bottom - hBase - hSoil - hSand - 6;
      }
      
      // Crawling movement
      if (Math.random() < 0.05) {
        fish.vx = (Math.random() - 0.5) * 0.6;
      }
      
      fish.x += fish.vx;
      fish.y += (targetY - fish.y) * 0.1; // Snap to ground
      
      // Boundaries
      if (fish.x < startX + 15) { fish.x = startX + 15; fish.vx = 0.3; }
      if (fish.x > endX - 15) { fish.x = endX - 15; fish.vx = -0.3; }
    } 
    else {
      // Fish behavior
      // 1. Schooling behavior for Neon and Tam Giac
      let schoolX = 0, schoolY = 0;
      let schoolCount = 0;
      
      state.fishes.forEach(other => {
        if (other.type === fish.type && other !== fish) {
          const d = Math.hypot(other.x - fish.x, other.y - fish.y);
          if (d < 120) {
            schoolX += other.x;
            schoolY += other.y;
            schoolCount++;
          }
        }
      });
      
      // Move towards school center
      let ax = 0, ay = 0;
      if (schoolCount > 0) {
        schoolX /= schoolCount;
        schoolY /= schoolCount;
        ax += (schoolX - fish.x) * 0.005;
        ay += (schoolY - fish.y) * 0.005;
      }
      
      // 2. Head to Food if available
      if (fishFood.length > 0) {
        // Find closest food
        let closest = null;
        let minDist = 9999;
        fishFood.forEach(food => {
          const d = Math.hypot(food.x - fish.x, food.y - fish.y);
          if (d < minDist) {
            minDist = d;
            closest = food;
          }
        });
        
        if (closest && minDist < 200) {
          ax += (closest.x - fish.x) * 0.025;
          ay += (closest.y - fish.y) * 0.025;
          
          // Eat food
          if (minDist < 18) {
            const fIdx = fishFood.indexOf(closest);
            if (fIdx >= 0) fishFood.splice(fIdx, 1);
            
            // Satisfy hunger & grow size
            fish.hunger = Math.min(100, (fish.hunger || 100) + 40);
            fish.sizeScale = Math.min(2.0, (fish.sizeScale || 1.0) + 0.05);
            
            floatingTexts.push({
              x: fish.x,
              y: fish.y - 12,
              text: 'Ngon! 😋',
              life: 1.0,
              color: 'var(--color-success)'
            });
            
            // Play a small eating sound
            if (audioCtx && soundActive) {
              const osc = audioCtx.createOscillator();
              const gainNode = audioCtx.createGain();
              osc.connect(gainNode);
              gainNode.connect(audioCtx.destination);
              osc.frequency.setValueAtTime(600, audioCtx.currentTime);
              osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.06);
              gainNode.gain.setValueAtTime(0.02, audioCtx.currentTime);
              gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.06);
              osc.start();
              osc.stop(audioCtx.currentTime + 0.07);
            }
          }
        }
      }
      
      // 3. Random swimming force (momentum)
      if (Math.random() < 0.03) {
        ax += (Math.random() - 0.5) * 0.2;
        ay += (Math.random() - 0.5) * 0.1;
      }
      
      // Apply acceleration
      fish.vx += ax;
      fish.vy += ay;
      
      // Max speed clamp
      const speed = Math.hypot(fish.vx, fish.vy);
      const maxSpeed = fish.type === 'neon' ? 1.5 : 2.0;
      if (speed > maxSpeed) {
        fish.vx = (fish.vx / speed) * maxSpeed;
        fish.vy = (fish.vy / speed) * maxSpeed;
      }
      
      // Update position
      fish.x += fish.vx;
      fish.y += fish.vy;
      
      // Angle facing velocity
      fish.angle = Math.atan2(fish.vy, fish.vx);
      
      // Avoid borders
      const borderForce = 0.15;
      if (fish.x < startX + 35) fish.vx += borderForce;
      if (fish.x > endX - 35) fish.vx -= borderForce;
      
      const segmentWidth = dim.width / 40;
      const segIdx = Math.floor((fish.x - startX) / segmentWidth);
      let substrateY = bottom - 20;
      if (segIdx >= 0 && segIdx < 40) {
        substrateY = bottom - (state.substrate.base[segIdx] || 0) - (state.substrate.soil[segIdx] || 0) - (state.substrate.sand[segIdx] || 0);
      }
      
      if (fish.y < waterTop + 25) fish.vy += borderForce;
      if (fish.y > substrateY - 15) fish.vy -= borderForce;
    }
  });
}

// CANVAS DRAWINGS
function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  const dim = tankDims[state.tankSize];
  const startX = (canvas.width - dim.width) / 2;
  const endX = startX + dim.width;
  const bottom = canvas.height - 20;
  
  // 1. Draw Stand/Cabinet
  ctx.fillStyle = 'var(--aquarium-stand, #6d5c4c)';
  ctx.fillRect(startX - 20, bottom + 5, dim.width + 40, 20);
  ctx.fillStyle = '#2c221a';
  ctx.fillRect(startX - 30, bottom + 12, dim.width + 60, 4);

  // 2. Draw glass background tint (gradient matching the active theme)
  let bgGrad = ctx.createLinearGradient(startX, dim.yOffset, startX, bottom);
  if (state.activeTheme === 'reef') {
    bgGrad.addColorStop(0, '#240f47');
    bgGrad.addColorStop(1, '#080315');
  } else if (state.activeTheme === 'zen') {
    bgGrad.addColorStop(0, '#6e4352');
    bgGrad.addColorStop(1, '#1a0a10');
  } else { // 'river' default
    bgGrad.addColorStop(0, '#104e73');
    bgGrad.addColorStop(1, '#051a2e');
  }
  ctx.fillStyle = bgGrad;
  ctx.fillRect(startX, dim.yOffset, dim.width, bottom - dim.yOffset);
  
  // 3. Draw Substrate Layers
  drawSubstrateCurve(ctx, startX, bottom, dim.width, 'base', materials.base.color);
  drawSubstrateCurve(ctx, startX, bottom, dim.width, 'soil', materials.soil.color);
  drawSubstrateCurve(ctx, startX, bottom, dim.width, 'sand', materials.sand.color);
  
  // Draw Theme Decors (like Coral Reef neon corals)
  drawThemeDecors(ctx, startX, endX, bottom, dim);
  
  // 4. Draw Hardscape (Stones and Driftwoods)
  state.hardscapes.forEach((hs, idx) => {
    const isSelected = idx === selectedHardscapeIndex && state.step === 3;
    drawHardscapeObject(ctx, hs, isSelected);
  });
  
  // 5. Draw Plants (Flora)
  state.plants.forEach(p => {
    drawPlantObject(ctx, p);
  });
  
  // 6. Draw Equipments
  drawEquipments(ctx, startX, endX, bottom, dim.yOffset);
  
  // 7. Draw Water level
  if (state.waterLevel > 0.05) {
    const waterTop = dim.yOffset + (1.0 - state.waterLevel) * (canvas.height - dim.yOffset - 30);
    ctx.fillStyle = 'rgba(128, 208, 235, 0.15)';
    ctx.fillRect(startX, waterTop, dim.width, bottom - waterTop);
    
    // Draw Water Line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(startX, waterTop);
    ctx.lineTo(endX, waterTop);
    ctx.stroke();
  }
  
  // 8. Particles (Bubbles, Drops, Food, Cherry Blossoms)
  drawParticles(ctx);
  
  // Draw dropped pearls lying on the substrate
  drawDroppedPearls(ctx);
  
  // 9. Draw Fishes
  state.fishes.forEach(fish => {
    drawFaunaObject(ctx, fish);
  });
  
  // Draw floating texts (score notifications, fish thought text) on top of fish
  drawFloatingTexts(ctx);
  
  // 10. Algae glass blur overlay
  if (algaeLevel > 0.05) {
    ctx.fillStyle = `rgba(110, 160, 90, ${algaeLevel * 0.4})`;
    ctx.fillRect(startX, dim.yOffset, dim.width, bottom - dim.yOffset);
  }
  
  // 11. Draw Tank glass outline
  ctx.strokeStyle = 'var(--aquarium-border, #4A3F35)';
  ctx.lineWidth = 4;
  ctx.strokeRect(startX, dim.yOffset, dim.width, bottom - dim.yOffset);
}

// Substrate Drawer
function drawSubstrateCurve(ctx, startX, bottom, width, type, color) {
  const heights = state.substrate[type];
  if (isEmptyArray(heights)) return;
  
  const segmentWidth = width / 40;
  
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(startX, bottom);
  
  // Render heights as path
  for (let i = 0; i <= 40; i++) {
    const x = startX + i * segmentWidth;
    
    // Calculate total height of this type plus all types underneath
    let yHeight = 0;
    if (type === 'base') {
      yHeight = heights[Math.min(39, i)] || 0;
    } else if (type === 'soil') {
      yHeight = (state.substrate.base[Math.min(39, i)] || 0) + (heights[Math.min(39, i)] || 0);
    } else if (type === 'sand') {
      yHeight = (state.substrate.base[Math.min(39, i)] || 0) + (state.substrate.soil[Math.min(39, i)] || 0) + (heights[Math.min(39, i)] || 0);
    }
    
    ctx.lineTo(x, bottom - yHeight);
  }
  
  ctx.lineTo(startX + width, bottom);
  ctx.closePath();
  ctx.fill();
  
  // Draw granule textures (little dots)
  ctx.fillStyle = type === 'sand' ? '#d8ae62' : (type === 'base' ? '#6e513d' : '#1a1512');
  const segmentWidthTex = width / 40;
  for (let i = 0; i < 40; i += 2) {
    const x = startX + i * segmentWidthTex + Math.random() * 5;
    let yHeight = state.substrate.base[i];
    if (type === 'soil') yHeight += state.substrate.soil[i];
    if (type === 'sand') yHeight += state.substrate.soil[i] + state.substrate.sand[i];
    
    ctx.beginPath();
    ctx.arc(x, bottom - yHeight + 4, 1.5, 0, Math.PI*2);
    ctx.fill();
  }
}

// Hardscape Drawer
function drawHardscapeObject(ctx, hs, isSelected) {
  ctx.save();
  ctx.translate(hs.x, hs.y);
  ctx.rotate(hs.rotation);
  ctx.scale(hs.scale, hs.scale);
  
  if (hs.type === 'bonsai') {
    // Trunk
    ctx.fillStyle = '#4e331c';
    ctx.strokeStyle = '#2b1b0c';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-12, 0);
    ctx.quadraticCurveTo(-15, -45, -5, -60);
    ctx.lineTo(5, -60);
    ctx.quadraticCurveTo(15, -45, 12, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Branches
    ctx.beginPath();
    ctx.moveTo(-7, -50);
    ctx.quadraticCurveTo(-35, -75, -45, -65);
    ctx.moveTo(7, -50);
    ctx.quadraticCurveTo(35, -75, 45, -65);
    ctx.moveTo(0, -60);
    ctx.lineTo(0, -85);
    ctx.stroke();
    
    // Moss cushions (glowing green blobs)
    ctx.fillStyle = '#3a722e';
    ctx.beginPath();
    ctx.arc(-45, -65, 20, 0, Math.PI * 2);
    ctx.arc(45, -65, 20, 0, Math.PI * 2);
    ctx.arc(0, -85, 24, 0, Math.PI * 2);
    ctx.fill();
  } 
  else if (hs.type === 'driftwood') {
    ctx.strokeStyle = '#5a3f25';
    ctx.fillStyle = '#362414';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    
    // Main branch curved
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-30, -50, 40, -100, 30, -130);
    ctx.stroke();
    
    // Sub branches
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(5, -45);
    ctx.quadraticCurveTo(-35, -80, -40, -100);
    ctx.moveTo(25, -95);
    ctx.quadraticCurveTo(60, -110, 50, -135);
    ctx.stroke();
  } 
  else if (hs.type === 'tiger') {
    // Jagged Stone polygon
    ctx.fillStyle = '#b78b53';
    ctx.strokeStyle = '#5e4321';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-35, 0);
    ctx.lineTo(-40, -45);
    ctx.lineTo(-15, -75);
    ctx.lineTo(20, -60);
    ctx.lineTo(35, -30);
    ctx.lineTo(30, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Tiger stripes (dark brown cracks)
    ctx.strokeStyle = '#32220d';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-15, -75);
    ctx.lineTo(-20, -20);
    ctx.moveTo(10, -65);
    ctx.lineTo(0, -10);
    ctx.moveTo(-35, -40);
    ctx.lineTo(-10, -35);
    ctx.stroke();
  } 
  else if (hs.type === 'taimeo') {
    // Tai Meo nhọn hoắt
    ctx.fillStyle = '#65717a';
    ctx.strokeStyle = '#384147';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-25, 0);
    ctx.lineTo(-10, -85);
    ctx.lineTo(5, -50);
    ctx.lineTo(20, -95);
    ctx.lineTo(25, -40);
    ctx.lineTo(30, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Ridges
    ctx.strokeStyle = '#85929c';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-10, -85);
    ctx.lineTo(-5, 0);
    ctx.moveTo(20, -95);
    ctx.lineTo(10, 0);
    ctx.stroke();
  }
  
  // Selection box outline if active tool is hardscape and clicked
  if (isSelected) {
    ctx.strokeStyle = 'var(--color-primary, #5a8df3)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(-50, -140, 100, 150);
    ctx.setLineDash([]);
    
    // Draw small anchor ring
    ctx.fillStyle = 'var(--color-primary)';
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI*2);
    ctx.fill();
  }
  
  ctx.restore();
}

// Flora Plant Drawer
function drawPlantObject(ctx, p) {
  ctx.save();
  ctx.translate(p.x, p.y);
  
  // Sine sway physics based on water current
  const currentStrength = state.equipment.filter ? 1.0 : 0.25;
  const sway = Math.sin(time * 1.5 + p.x * 0.02) * 4 * currentStrength * (p.size || 1.0);
  
  if (p.type === 'montecarlo') {
    // Foreground green bush clusters
    ctx.fillStyle = floraItems.montecarlo.color;
    ctx.beginPath();
    ctx.arc(0, 0, 12 * (p.size || 1.0), 0, Math.PI * 2);
    ctx.arc(8, -4, 8 * (p.size || 1.0), 0, Math.PI * 2);
    ctx.arc(-8, -2, 9 * (p.size || 1.0), 0, Math.PI * 2);
    ctx.fill();
  } 
  else if (p.type === 'anubias') {
    // Ráy Nana: Broad leaves
    ctx.fillStyle = '#1e5225';
    ctx.strokeStyle = '#0e2b12';
    ctx.lineWidth = 1;
    
    // Draw stems
    ctx.beginPath();
    ctx.moveTo(0, 5);
    ctx.quadraticCurveTo(-10 + sway, -10, -15 + sway, -20);
    ctx.moveTo(0, 5);
    ctx.quadraticCurveTo(10 + sway, -12, 18 + sway, -22);
    ctx.stroke();
    
    // Draw broad leaves
    ctx.save();
    ctx.translate(sway, 0);
    ctx.beginPath();
    // Leaf 1
    ctx.ellipse(-15, -20, 12, 6, -Math.PI/4, 0, Math.PI*2);
    // Leaf 2
    ctx.ellipse(18, -22, 13, 7, Math.PI/4, 0, Math.PI*2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  } 
  else if (p.type === 'fern') {
    // Dương xỉ
    ctx.fillStyle = '#387340';
    ctx.strokeStyle = '#224d27';
    ctx.lineWidth = 1.5;
    
    ctx.beginPath();
    ctx.moveTo(0, 5);
    ctx.quadraticCurveTo(sway * 1.2, -15, sway * 1.5, -45);
    ctx.stroke();
    
    // Feathery leaves
    ctx.save();
    ctx.translate(sway * 1.2, -20);
    ctx.beginPath();
    ctx.ellipse(0, 0, 4, 18, sway * 0.05, 0, Math.PI*2);
    ctx.ellipse(-8, -10, 3, 12, -Math.PI/6, 0, Math.PI*2);
    ctx.ellipse(8, -10, 3, 12, Math.PI/6, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  } 
  else if (p.type === 'rotala') {
    // Tall stems with red/pink leaves
    ctx.strokeStyle = '#cc4d4d';
    ctx.fillStyle = '#e86161';
    ctx.lineWidth = 2;
    
    // Stem
    ctx.beginPath();
    ctx.moveTo(0, 5);
    ctx.quadraticCurveTo(sway * 0.8, -40, sway * 1.2, -80 * (p.size || 1.0));
    ctx.stroke();
    
    // Leaves alternating
    ctx.fillStyle = '#f07878';
    const leafNodes = 6;
    for (let i = 1; i <= leafNodes; i++) {
      const pct = i / leafNodes;
      const nodeY = -80 * (p.size || 1.0) * pct;
      const nodeX = sway * 1.2 * pct;
      
      ctx.beginPath();
      ctx.arc(nodeX - 5, nodeY, 4, 0, Math.PI*2);
      ctx.arc(nodeX + 5, nodeY, 4, 0, Math.PI*2);
      ctx.fill();
    }
  }
  
  ctx.restore();
}

// Equipments visuals drawer
function drawEquipments(ctx, startX, endX, bottom, yOffset) {
  // Canister Filter pipes
  if (state.equipment.filter) {
    ctx.strokeStyle = 'rgba(100, 150, 100, 0.6)';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    
    // Inlet pipe (left bottom)
    ctx.beginPath();
    ctx.moveTo(startX + 20, yOffset - 10);
    ctx.lineTo(startX + 20, bottom - 60);
    ctx.stroke();
    
    // Outlet pipe (right top)
    ctx.beginPath();
    ctx.moveTo(endX - 25, yOffset - 10);
    ctx.lineTo(endX - 25, yOffset + 25);
    ctx.lineTo(endX - 45, yOffset + 25);
    ctx.stroke();
  }
  
  // LED Lights
  if (state.equipment.light) {
    ctx.fillStyle = '#bbb';
    ctx.fillRect(startX + 20, yOffset - 16, endX - startX - 40, 8);
    // Stand legs
    ctx.fillStyle = '#888';
    ctx.fillRect(startX + 10, yOffset - 16, 10, 20);
    ctx.fillRect(endX - 20, yOffset - 16, 10, 20);
  }
  
  // CO2 Diffuser
  if (state.equipment.co2) {
    // Draw tiny glass diffuser at bottom-right
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(endX - 45, bottom - 100);
    ctx.lineTo(endX - 45, bottom - 30);
    ctx.stroke();
    
    // Diffuser cup
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.arc(endX - 45, bottom - 25, 8, 0, Math.PI, true);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  
  // Cooling Fan
  if (state.equipment.fan) {
    ctx.save();
    ctx.translate(startX + 60, yOffset - 12);
    ctx.fillStyle = '#444';
    ctx.fillRect(-15, -15, 30, 15);
    
    // Fan blades spinning
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 2) {
      const speedRotation = time * 2.5;
      ctx.moveTo(0, -7);
      ctx.lineTo(Math.cos(a + speedRotation) * 12, -7 + Math.sin(a + speedRotation) * 12);
    }
    ctx.stroke();
    ctx.restore();
  }
}

// Particles Drawer
function drawParticles(ctx) {
  // 1. Water Particles (flow)
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  waterParticles.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
    ctx.fill();
  });
  
  // 2. CO2 Bubbles
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  co2Bubbles.forEach(b => {
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.size, 0, Math.PI*2);
    ctx.fill();
  });
  
  // 3. Bacteria droplets
  ctx.fillStyle = 'rgba(100, 200, 255, 0.8)';
  waterDroplets.forEach(d => {
    ctx.beginPath();
    ctx.arc(d.x, d.y, d.size, 0, Math.PI*2);
    ctx.fill();
  });
  
  // 4. Fish Food
  ctx.fillStyle = '#b77341';
  fishFood.forEach(f => {
    ctx.beginPath();
    ctx.arc(f.x, f.y, 2.2, 0, Math.PI*2);
    ctx.fill();
  });
}

// Fauna Object Drawer
function drawFaunaObject(ctx, f) {
  ctx.save();
  ctx.translate(f.x, f.y);
  
  // Wagging phase
  const wag = Math.sin(time * 3 + f.x * 0.05) * 0.4;
  
  if (f.type === 'cherry') {
    // Cherry Shrimp crawling
    ctx.rotate(f.vx < 0 ? Math.PI : 0);
    ctx.fillStyle = '#e53935';
    
    // Body segment oval
    ctx.beginPath();
    ctx.ellipse(0, 0, 8, 4, 0, 0, Math.PI*2);
    ctx.fill();
    
    // Tail segment
    ctx.beginPath();
    ctx.ellipse(-8, 2, 4, 2.2, Math.sin(time*2)*0.3, 0, Math.PI*2);
    ctx.fill();
    
    // Feelers (Antennas)
    ctx.strokeStyle = '#ffa4a2';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(6, -2);
    ctx.quadraticCurveTo(14, -10 + Math.sin(time)*2, 22, -12);
    ctx.moveTo(6, 0);
    ctx.quadraticCurveTo(15, 4 + Math.cos(time)*2, 20, 8);
    ctx.stroke();
    
    // Legs moving
    ctx.strokeStyle = '#d32f2f';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    const legMove = Math.sin(time * 5) * 3;
    ctx.moveTo(-2, 3); ctx.lineTo(-4, 6 + legMove);
    ctx.moveTo(1, 3); ctx.lineTo(1, 6 - legMove);
    ctx.moveTo(4, 3); ctx.lineTo(5, 6 + legMove);
    ctx.stroke();
  } 
  else {
    // Fishes swimming
    ctx.rotate(f.angle + (f.vx < 0 ? Math.PI : 0));
    const sizeScale = f.sizeScale || 1.0;
    ctx.scale((f.vx < 0 ? -1 : 1) * sizeScale, sizeScale); // Flip facing direction and apply growth scale
    
    if (f.type === 'neon') {
      // Neon tetra: glowing blue stripe + red tail
      ctx.fillStyle = '#616161'; // Dark back
      ctx.beginPath();
      ctx.ellipse(0, 0, 10, 4, 0, 0, Math.PI*2);
      ctx.fill();
      
      // Blue glowing line
      ctx.fillStyle = '#00e5ff';
      ctx.fillRect(-6, -2, 12, 1.5);
      
      // Red back half
      ctx.fillStyle = '#ff1744';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-10, 0);
      ctx.lineTo(-8, 3);
      ctx.lineTo(0, 1.5);
      ctx.fill();
      
      // Wagging tail fin
      ctx.save();
      ctx.translate(-10, 0);
      ctx.rotate(wag);
      ctx.fillStyle = 'rgba(255, 23, 68, 0.8)';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-6, -4);
      ctx.lineTo(-4, 0);
      ctx.lineTo(-6, 4);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    } 
    else if (f.type === 'tamgiac') {
      // Harlequin Rasbora: diamond copper shape, black wedge triangle
      ctx.fillStyle = '#ff7b50';
      ctx.beginPath();
      ctx.ellipse(0, 0, 11, 6, 0, 0, Math.PI*2);
      ctx.fill();
      
      // Black triangle wedge on tail
      ctx.fillStyle = '#1c2833';
      ctx.beginPath();
      ctx.moveTo(-1, 0);
      ctx.lineTo(-10, -4.5);
      ctx.lineTo(-10, 4.5);
      ctx.closePath();
      ctx.fill();
      
      // Wagging tail
      ctx.save();
      ctx.translate(-11, 0);
      ctx.rotate(wag);
      ctx.fillStyle = 'rgba(255, 123, 80, 0.7)';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-5, -5);
      ctx.lineTo(-3, 0);
      ctx.lineTo(-5, 5);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    } 
    else if (f.type === 'mun') {
      // Platy (Gold/Orange stubby oval)
      ctx.fillStyle = '#ffab40';
      ctx.beginPath();
      ctx.ellipse(0, 0, 12, 7.5, 0, 0, Math.PI*2);
      ctx.fill();
      
      // Eye
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(6, -2, 1.5, 0, Math.PI*2);
      ctx.fill();
      
      // Fin
      ctx.fillStyle = '#ff9100';
      ctx.beginPath();
      ctx.ellipse(-2, -5, 4, 2, -Math.PI/6, 0, Math.PI*2);
      ctx.fill();
      
      // Wagging tail
      ctx.save();
      ctx.translate(-12, 0);
      ctx.rotate(wag);
      ctx.fillStyle = '#ff6d00';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-6, -6);
      ctx.lineTo(-3, 0);
      ctx.lineTo(-6, 6);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    else if (f.type === 'goldfish') {
      // Goldfish / Koi: Orange-white flowy body
      ctx.fillStyle = '#f5f5f5'; // White base
      ctx.beginPath();
      ctx.ellipse(0, 0, 14, 6.5, 0, 0, Math.PI*2);
      ctx.fill();
      
      // Orange patches
      ctx.fillStyle = '#ff6d00';
      ctx.beginPath();
      ctx.ellipse(3, -2, 4, 3, Math.PI/6, 0, Math.PI*2);
      ctx.ellipse(-4, 1, 5, 2.5, -Math.PI/4, 0, Math.PI*2);
      ctx.fill();
      
      // Eye
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(9, -2, 1.8, 0, Math.PI*2);
      ctx.fill();
      
      // Flowing tail fins
      ctx.save();
      ctx.translate(-14, 0);
      ctx.rotate(wag);
      ctx.fillStyle = 'rgba(255, 109, 0, 0.8)';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-8, -8, -12, -4, -16, -6);
      ctx.bezierCurveTo(-12, 0, -12, 0, -16, 6);
      ctx.bezierCurveTo(-12, 4, -8, 8, 0, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    else if (f.type === 'jellyfish') {
      // Jellyfish: neon purple pulsing dome, trailing tentacles
      ctx.fillStyle = 'rgba(186, 85, 211, 0.6)';
      ctx.strokeStyle = '#DA70D6';
      ctx.lineWidth = 1.5;
      
      // Pulse animation
      const pulse = 1.0 + Math.sin(time * 3) * 0.15;
      
      ctx.save();
      ctx.scale(pulse, 2 - pulse);
      ctx.beginPath();
      ctx.arc(0, -2, 10, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      
      // Wavy tentacles
      ctx.strokeStyle = '#BA55D3';
      ctx.lineWidth = 1.2;
      const tentacleSway = Math.sin(time * 2) * 3;
      for (let i = -6; i <= 6; i += 4) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.quadraticCurveTo(i + tentacleSway, 8, i, 16);
        ctx.stroke();
      }
    }
    else if (f.type === 'discus') {
      // Discus: vertical flat disk, bright stripes
      ctx.fillStyle = '#e74c3c';
      ctx.beginPath();
      ctx.ellipse(0, 0, 12, 14, 0, 0, Math.PI*2);
      ctx.fill();
      
      // Bright blue neon stripes
      ctx.strokeStyle = '#3498db';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-5, -11); ctx.lineTo(-5, 11);
      ctx.moveTo(0, -12); ctx.lineTo(0, 12);
      ctx.moveTo(5, -11); ctx.lineTo(5, 11);
      ctx.stroke();
      
      // Big eye
      ctx.fillStyle = '#f1c40f';
      ctx.beginPath();
      ctx.arc(6, -4, 2.5, 0, Math.PI*2);
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(6.5, -4, 1.2, 0, Math.PI*2);
      ctx.fill();
      
      // Tiny tail
      ctx.save();
      ctx.translate(-12, 0);
      ctx.rotate(wag);
      ctx.fillStyle = 'rgba(231, 76, 60, 0.7)';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-4, -4);
      ctx.lineTo(-4, 4);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    else if (f.type === 'angler') {
      // Angler: deep-sea round monster, sharp teeth, glowing rod
      ctx.fillStyle = '#34495e';
      ctx.beginPath();
      ctx.ellipse(0, 0, 14, 11, 0, 0, Math.PI*2);
      ctx.fill();
      
      // Big jaw outline
      ctx.strokeStyle = '#2c3e50';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(4, 3);
      ctx.lineTo(12, 1);
      ctx.stroke();
      
      // Sharp teeth (white triangles)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(5, 2); ctx.lineTo(7, -1); ctx.lineTo(9, 2);
      ctx.moveTo(8, 2); ctx.lineTo(10, 5); ctx.lineTo(12, 2);
      ctx.fill();
      
      // Eye
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(4, -4, 2.2, 0, Math.PI*2);
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(4, -4, 1.0, 0, Math.PI*2);
      ctx.fill();
      
      // Glowing rod
      ctx.strokeStyle = '#95a5a6';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(1, -9);
      ctx.quadraticCurveTo(8, -18, 14, -13);
      ctx.stroke();
      
      // Light bulb
      ctx.fillStyle = '#f1c40f';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#f1c40f';
      ctx.beginPath();
      ctx.arc(14, -13, 3.5, 0, Math.PI*2);
      ctx.fill();
      ctx.shadowBlur = 0; // Reset
      
      // Small wagging tail
      ctx.save();
      ctx.translate(-14, 0);
      ctx.rotate(wag);
      ctx.fillStyle = '#34495e';
      ctx.beginPath();
      ctx.moveTo(0,0);
      ctx.lineTo(-4, -4);
      ctx.lineTo(-4, 4);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    else if (f.type === 'whale') {
      // Whale: large dark blue leviathan, white belly, tiny eye
      ctx.fillStyle = '#2c3e50';
      ctx.beginPath();
      ctx.ellipse(0, 0, 24, 13, 0, 0, Math.PI*2);
      ctx.fill();
      
      // White belly
      ctx.fillStyle = '#ecf0f1';
      ctx.beginPath();
      ctx.ellipse(1, 4, 18, 6.5, 0, 0, Math.PI);
      ctx.fill();
      
      // Tiny eye
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(16, -3, 1.2, 0, Math.PI*2);
      ctx.fill();
      
      // Tail fin
      ctx.save();
      ctx.translate(-24, 0);
      ctx.rotate(wag * 0.6);
      ctx.fillStyle = '#2c3e50';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-7, -8);
      ctx.lineTo(-5, 0);
      ctx.lineTo(-7, 8);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }
  
  // Hunger bubble (Leaf 🍂 bubble drawn above the fish if it is starving)
  if (f.hunger < 30 && f.type !== 'cherry') {
    ctx.save();
    // Neutralize parent rotation and flips so the thought bubble stays upright
    ctx.rotate(-f.angle - (f.vx < 0 ? Math.PI : 0));
    ctx.scale(f.vx < 0 ? -1 : 1, 1);
    
    // Draw bubble
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.lineWidth = 1;
    
    const bx = 0;
    const by = -f.size - 18;
    ctx.beginPath();
    ctx.arc(bx, by, 10, 0, Math.PI*2);
    ctx.fill();
    ctx.stroke();
    
    // Tiny thought bubble dots
    ctx.beginPath();
    ctx.arc(bx - 5, by + 12, 3, 0, Math.PI*2);
    ctx.arc(bx - 2, by + 16, 2, 0, Math.PI*2);
    ctx.fill();
    ctx.stroke();
    
    ctx.font = '10px var(--font-body)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🍂', bx, by);
    ctx.restore();
  }
  
  ctx.restore();
}

// -------------------------------------------------------------
// ADVANCED GAME PLAY & THEME DRAWING HELPERS
// -------------------------------------------------------------

// Draw neon corals on substrate for Reef theme
function drawThemeDecors(ctx, startX, endX, bottom, dim) {
  if (state.activeTheme === 'reef') {
    ctx.save();
    // Coral 1 (Left)
    const cx1 = startX + dim.width * 0.25;
    const cy1 = bottom - (state.substrate.sand[10] + state.substrate.soil[10] + state.substrate.base[10] || 20);
    ctx.translate(cx1, cy1);
    drawNeonCoral(ctx, -15, 0.8, '#FF007F'); // Hot pink coral
    ctx.restore();
    
    ctx.save();
    // Coral 2 (Right)
    const cx2 = startX + dim.width * 0.75;
    const cy2 = bottom - (state.substrate.sand[30] + state.substrate.soil[30] + state.substrate.base[30] || 20);
    ctx.translate(cx2, cy2);
    drawNeonCoral(ctx, 15, 1.0, '#00F0FF'); // Cyan coral
    ctx.restore();
  }
}

// Draw a single branching neon coral
function drawNeonCoral(ctx, angleDeg, scale, color) {
  ctx.save();
  ctx.scale(scale, scale);
  ctx.rotate(angleDeg * Math.PI / 180);
  
  // Neon glow shadows
  ctx.shadowBlur = 15;
  ctx.shadowColor = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  
  // Main stem
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-10, -25, -5, -45);
  ctx.stroke();
  
  // Left branch
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(-7, -20);
  ctx.quadraticCurveTo(-25, -35, -20, -50);
  ctx.stroke();
  
  // Right branch
  ctx.beginPath();
  ctx.moveTo(-3, -32);
  ctx.quadraticCurveTo(15, -42, 12, -55);
  ctx.stroke();
  
  ctx.restore();
}

// Render dropped pearls on the bottom substrate
function drawDroppedPearls(ctx) {
  droppedPearls.forEach(p => {
    ctx.save();
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#D4AF37'; // Golden glow
    ctx.fillStyle = '#E0B0FF';   // Purple pearl body
    ctx.strokeStyle = '#D4AF37'; // Golden border
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size || 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  });
}

// Render floating notification text labels
function drawFloatingTexts(ctx) {
  floatingTexts.forEach(t => {
    ctx.save();
    ctx.globalAlpha = Math.max(0, t.life);
    ctx.font = 'bold 12px var(--font-body)';
    ctx.fillStyle = t.color || 'var(--color-primary)';
    ctx.textAlign = 'center';
    ctx.fillText(t.text, t.x, t.y);
    ctx.restore();
  });
}

// Switch themes & handle pearl unlock mechanics
function switchTheme(theme) {
  if (theme === 'river') {
    state.activeTheme = 'river';
    showToast("🌿 Đã chuyển sang chủ đề Sông nhiệt đới");
  } else if (theme === 'reef') {
    if (state.unlockedThemes.includes('reef')) {
      state.activeTheme = 'reef';
      showToast("🪸 Đã chuyển sang chủ đề Coral Reef");
    } else {
      // Try to unlock with 50 pearls
      if ((state.pearls || 0) >= 50) {
        state.pearls -= 50;
        state.unlockedThemes.push('reef');
        state.activeTheme = 'reef';
        showToast("🔓 Đã mở khóa Coral Reef (50 🔮)!");
        playSmallWinChime();
      } else {
        showToast("❌ Không đủ ngọc trai! Cần 50 🔮");
        playSadBuzzSound();
        return;
      }
    }
  } else if (theme === 'zen') {
    if (state.unlockedThemes.includes('zen')) {
      state.activeTheme = 'zen';
      showToast("🌸 Đã chuyển sang chủ đề Ao Zen");
    } else {
      // Try to unlock with 100 pearls
      if ((state.pearls || 0) >= 100) {
        state.pearls -= 100;
        state.unlockedThemes.push('zen');
        state.activeTheme = 'zen';
        showToast("🔓 Đã mở khóa Ao Zen (100 🔮)!");
        playSmallWinChime();
      } else {
        showToast("❌ Không đủ ngọc trai! Cần 100 🔮");
        playSadBuzzSound();
        return;
      }
    }
  }
  
  // Re-render Step 8 HTML to update selected state and lock/unlock labels
  if (state.step === 8) {
    loadToolbox();
  }
  
  updateUI();
  saveStateToServer();
}

// -------------------------------------------------------------
// GACHA / SLOT MACHINE CONTROLLER
// -------------------------------------------------------------

function spinGacha() {
  if (isSpinningGacha) return;
  
  if ((state.pearls || 0) < 10) {
    showToast("❌ Không đủ ngọc trai! Cần 10 🔮");
    playSadBuzzSound();
    return;
  }
  
  // Deduct 10 pearls
  state.pearls -= 10;
  updateUI();
  saveStateToServer();
  
  isSpinningGacha = true;
  const btnSpin = document.getElementById('btn-spin-slot');
  btnSpin.disabled = true;
  
  const resultText = document.getElementById('gacha-result-text');
  resultText.textContent = "🎰 Đang quay...";
  resultText.style.color = "var(--text-main)";
  
  // Pre-determine outcome
  const roll = Math.random();
  let winType = 0; // 0: no match, 1: 2-match (refund 5), 2: 3-match (win rare fish)
  let wonBreed = null;
  let finalReels = [];
  
  const allReelsPool = ['🐟', '🐠', '🦐', '🐡', '🎏', '👾', '🐙', '🦑', '🐋'];
  const rareBreeds = [
    { type: 'goldfish', emoji: '🎏', label: 'Cá Chép Koi 🎏', weight: 0.40 },
    { type: 'discus', emoji: '🐙', label: 'Cá Đĩa Đỏ 🐙', weight: 0.30 },
    { type: 'angler', emoji: '🦑', label: 'Cá Lồng Đèn 🦑', weight: 0.18 },
    { type: 'jellyfish', emoji: '👾', label: 'Sứa Neon 👾', weight: 0.10 },
    { type: 'whale', emoji: '🐋', label: 'Cá Voi Xanh 🐋', weight: 0.02 }
  ];
  
  if (roll < 0.15) {
    // 3-match win (15% chance)
    winType = 2;
    // Roll rare breed based on weights
    const breedRoll = Math.random();
    let cumulative = 0;
    wonBreed = rareBreeds[0];
    for (let rb of rareBreeds) {
      cumulative += rb.weight;
      if (breedRoll < cumulative) {
        wonBreed = rb;
        break;
      }
    }
    finalReels = [wonBreed.emoji, wonBreed.emoji, wonBreed.emoji];
  } else if (roll < 0.50) {
    // 2-match win (35% chance)
    winType = 1;
    // Pick an emoji to match
    const matchEmoji = allReelsPool[Math.floor(Math.random() * allReelsPool.length)];
    // Pick a different emoji for the third
    let diffEmoji = matchEmoji;
    while (diffEmoji === matchEmoji) {
      diffEmoji = allReelsPool[Math.floor(Math.random() * allReelsPool.length)];
    }
    // Randomize position of diffEmoji
    const pos = Math.floor(Math.random() * 3);
    if (pos === 0) finalReels = [diffEmoji, matchEmoji, matchEmoji];
    else if (pos === 1) finalReels = [matchEmoji, diffEmoji, matchEmoji];
    else finalReels = [matchEmoji, matchEmoji, diffEmoji];
  } else {
    // Lose / No matches (50% chance)
    winType = 0;
    // Pick 3 unique random emojis
    const shuffled = [...allReelsPool].sort(() => 0.5 - Math.random());
    finalReels = [shuffled[0], shuffled[1], shuffled[2]];
  }
  
  // Animation loop
  let reel1Stopped = false;
  let reel2Stopped = false;
  let reel3Stopped = false;
  
  const r1 = document.getElementById('reel-1');
  const r2 = document.getElementById('reel-2');
  const r3 = document.getElementById('reel-3');
  
  initAudio();
  
  let spinCounter = 0;
  const spinInterval = setInterval(() => {
    spinCounter++;
    
    if (!reel1Stopped) r1.textContent = allReelsPool[Math.floor(Math.random() * allReelsPool.length)];
    if (!reel2Stopped) r2.textContent = allReelsPool[Math.floor(Math.random() * allReelsPool.length)];
    if (!reel3Stopped) r3.textContent = allReelsPool[Math.floor(Math.random() * allReelsPool.length)];
    
    playTickSound();
    
    // Stop reels one by one
    if (spinCounter === 6) {
      reel1Stopped = true;
      r1.textContent = finalReels[0];
    }
    if (spinCounter === 12) {
      reel2Stopped = true;
      r2.textContent = finalReels[1];
    }
    if (spinCounter === 18) {
      reel3Stopped = true;
      r3.textContent = finalReels[2];
      clearInterval(spinInterval);
      
      // Handle result after a tiny delay
      setTimeout(() => {
        if (winType === 2) {
          resultText.textContent = `🎉 Bạn trúng 3 hình! Nhận cá hiếm: ${wonBreed.label}!`;
          resultText.style.color = "var(--color-success)";
          playVictoryChime();
          spawnFauna(wonBreed.type);
        } else if (winType === 1) {
          resultText.textContent = "⚖️ Trúng 2 hình! Hoàn lại 5 🔮";
          resultText.style.color = "var(--color-warning)";
          playSmallWinChime();
          state.pearls = (state.pearls || 0) + 5;
        } else {
          resultText.textContent = "😢 Tiếc quá! Chúc bạn may mắn lần sau.";
          resultText.style.color = "var(--color-danger)";
          playSadBuzzSound();
        }
        
        isSpinningGacha = false;
        btnSpin.disabled = false;
        
        updateUI();
        saveStateToServer();
      }, 100);
    }
  }, 80);
}

// -------------------------------------------------------------
// SYNTHESIZER SOUND GENERATORS (Web Audio API)
// -------------------------------------------------------------

function playTickSound() {
  if (!audioCtx || !soundActive) return;
  try {
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, audioCtx.currentTime);
    osc.frequency.setValueAtTime(45, audioCtx.currentTime + 0.02);
    
    gainNode.gain.setValueAtTime(0.04, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.03);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.04);
  } catch (e) {
    console.error("Tick synth error:", e);
  }
}

function playSadBuzzSound() {
  if (!audioCtx || !soundActive) return;
  try {
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(110, audioCtx.currentTime);
    osc.frequency.linearRampToValueAtTime(65, audioCtx.currentTime + 0.35);
    
    gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.38);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.4);
  } catch (e) {
    console.error("Sad buzz error:", e);
  }
}

function playSmallWinChime() {
  if (!audioCtx || !soundActive) return;
  try {
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
    osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5
    
    gainNode.gain.setValueAtTime(0.03, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.25);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.3);
  } catch (e) {
    console.error("Small win chime error:", e);
  }
}

function playVictoryChime() {
  if (!audioCtx || !soundActive) return;
  try {
    const now = audioCtx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.12);
      
      gainNode.gain.setValueAtTime(0.03, now + i * 0.12);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.12 + 0.3);
      
      osc.start(now + i * 0.12);
      osc.stop(now + i * 0.12 + 0.32);
    });
  } catch (e) {
    console.error("Victory chime error:", e);
  }
}

