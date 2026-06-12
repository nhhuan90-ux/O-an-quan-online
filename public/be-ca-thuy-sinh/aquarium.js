/**
 * Aquarium Simulator - Giả lập Bể Cá Thủy Sinh
 * Core game engine using HTML5 Canvas & Web Audio API
 */

// Base path for assets - Use jsDelivr CDN in production (Render.com), local path in local development
const ASSETS_BASE = './assets/';

// Assets files definitions
const assetFiles = {
  // Backgrounds
  'bg_default': 'background.png',
  'bg_mavi': 'background_mavi.png',
  'bg_purple': 'backmorl.png',
  
  // Grounds
  'ground_green': 'zemin_yesil.png',
  'ground_blue': 'zemin_mavi.png',
  'ground_pink': 'zemin_pembe.png',
  'ground_orange': 'zemin_turuncu.png',
  'ground_mushroom': 'zemin_mantar.png',
  
  // Glass
  'glass_overlay': 'cam.png',
  'decor_skull': 'skull.png',
  
  // Food & Bubble
  'food': 'yem.png',
  'bubble_food': 'balikyembaloncugu.png',
  'bubble_normal': 'baloncuk2.png',
  
  // Fishes
  'fish_yellow_striped': 'saricizgilibalik.png',
  
  // UI & Cards
  'slot_back_1': 'slotback1.png',
  'slot_back_2': 'slotback2.png',
  'slot_back_3': 'slotback3.png',
  'slot_back_4': 'slotback4.png',
  'slot_back_5': 'slotback5.png',
  'spin_button': 'spinbutton.png',
  'card_common': 'fishcardcommon.png',
  'card_rare': 'fishcardrare.png',
  'card_epic': 'fishcardepic.png',
  'card_legend': 'fishcardlegend.png',
  'badge_common': 'commonsprite2.png',
  'badge_rare': 'raresprite2.png',
  'badge_epic': 'epicsprite2.png',
  'badge_legend': 'legendarysprite2.png',
  'slot_button': 'slotbutton.png',
  // Aquarium 3D Frames
  'akvaryum10': 'akvaryum10.png',
  'akvaryum3': 'akvaryum3.png',
  'akvaryum5': 'akvaryum5.png',
  'akvaryum7': 'akvaryum7.png',
  'akvaryum8': 'akvaryum8.png',
  'akvaryum9': 'akvaryum9.png',
  'akvaryumkapali': 'akvaryumkapali.png',
  'akvaryum_pembe': 'akvaryum_pembe.png',
  'decor_skull': 'skull.png',
  'decor_kask': 'kask.png',
  'decor_bonsai_bay': 'bonsai_bay.png'
};

// Add fish2 to fish22 dynamically (skip non-existent fish7)
for (let i = 2; i <= 22; i++) {
  if (i === 7) continue;
  assetFiles[`fish_${i}`] = `fish${i}.png`;
}

// Add bitki2 to bitki23 dynamically (skip non-existent bitki10, bitki14)
for (let i = 2; i <= 23; i++) {
  if (i === 10 || i === 14) continue;
  assetFiles[`plant_${i}`] = `bitki${i}.png`;
}

let loadedImages = {};
let assetsLoaded = false;

function preloadAssets(callback) {
  let loadedCount = 0;
  const keys = Object.keys(assetFiles);
  const total = keys.length;
  
  if (total === 0) {
    assetsLoaded = true;
    if (callback) callback();
    return;
  }
  
  keys.forEach(key => {
    const img = new Image();
    img.src = ASSETS_BASE + assetFiles[key];
    img.onload = () => {
      loadedImages[key] = img;
      loadedCount++;
      if (loadedCount === total) {
        assetsLoaded = true;
        console.log("All assets preloaded successfully!");
        if (callback) callback();
      }
    };
    img.onerror = () => {
      console.warn(`Failed to load asset: ${key} (${img.src}). Using vector fallback.`);
      loadedImages[key] = null;
      
      loadedCount++;
      if (loadedCount === total) {
        assetsLoaded = true;
        if (callback) callback();
      }
    };
  });
}


const fishCollection = [
  // Common
  { id: 'fish_2', name: 'Cá Neon Xanh', rarity: 'common' },
  { id: 'fish_3', name: 'Cá Neon Đỏ', rarity: 'common' },
  { id: 'fish_4', name: 'Cá Tam Giác', rarity: 'common' },
  { id: 'fish_5', name: 'Cá Mún Đỏ', rarity: 'common' },
  { id: 'fish_6', name: 'Cá Bảy Màu', rarity: 'common' },
  { id: 'fish_8', name: 'Tép Cherry Đỏ', rarity: 'common' },
  // Rare
  { id: 'fish_9', name: 'Tép Amano Cảnh', rarity: 'rare' },
  { id: 'fish_10', name: 'Cá Hồng Tử Kỳ', rarity: 'rare' },
  { id: 'fish_11', name: 'Cá Phượng Hoàng', rarity: 'rare' },
  { id: 'fish_12', name: 'Cá Sọc Ngựa', rarity: 'rare' },
  { id: 'fish_13', name: 'Cá Chuột Thái', rarity: 'rare' },
  { id: 'fish_14', name: 'Cá Bút Chì', rarity: 'rare' },
  // Epic
  { id: 'fish_15', name: 'Cá Thần Tiên', rarity: 'epic' },
  { id: 'fish_16', name: 'Cá Đĩa Đỏ', rarity: 'epic' },
  { id: 'fish_17', name: 'Cá Neon Đen', rarity: 'epic' },
  { id: 'fish_18', name: 'Cá Betta Halfmoon', rarity: 'epic' },
  { id: 'fish_19', name: 'Cá Sặc Gấm', rarity: 'epic' },
  { id: 'fish_yellow_striped', name: 'Cá Hề Nắng Vàng', rarity: 'epic' },
  // Legendary
  { id: 'fish_20', name: 'Cá Đĩa Albino Vàng', rarity: 'legendary' },
  { id: 'fish_21', name: 'Cá Betta Rồng Đỏ', rarity: 'legendary' },
  { id: 'fish_22', name: 'Cá Kỳ Dông Axolotl', rarity: 'legendary' }
];

let isSpinning = false;
let finalSpinResult = null;
let animFrameIndex = 1;
let animTimer = null;

// Global Game State
let state = {
  step: 1,
  tankSize: 'standard60', // cubic40, standard60, premium90
  tankFrame: 'akvaryum7', // akvaryum10, akvaryum7, akvaryum_pembe, etc. (Default to blue)
  substrate: {
    base: Array(40).fill(15), // Height values across 40 segments
    soil: Array(40).fill(30),
    sand: Array(40).fill(0),
    ground_blue: Array(40).fill(0),
    ground_green: Array(40).fill(0)
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
  selectedTemplateId: null,
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
let selectedPlantIndex = -1;
let isDragging = false;
let isFillingWater = false;
let dragOffset = { x: 0, y: 0 };
let algaeLevel = 0.0; // 0 to 1, increases if lights on without filter/CO2
let isSpinningGacha = false;

// Base scale factors to keep assets properly proportioned in the tank
const HARDSCAPE_BASE_SCALE = 0.55;
const PLANT_BASE_SCALE = 0.75;

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
  sand: { color: '#e5c185', label: 'Cát nắng vàng', desc: 'Cát trang trí thẩm mỹ' },
  ground_blue: { color: '#1a73e8', label: 'Cát xanh biển 🌊', desc: 'Cát màu xanh nước biển rực rỡ' },
  ground_green: { color: '#2e7d32', label: 'Đất rong rêu 🟢', desc: 'Nền rêu xanh tươi mát' }
};

const hardscapeItems = {
  driftwood: { label: 'Lũa Xương Chùm 🪵', imageKey: 'plant_12', desc: 'Lũa uốn khúc tự nhiên', bbox: { x: 152, y: 64, w: 96, h: 168 }, icon: '🪵' },
  bonsai: { label: 'Lũa Bonsai 🌳', imageKey: 'plant_23', desc: 'Tạo hình cây cổ thụ rêu phong', bbox: { x: 124, y: 68, w: 144, h: 168 }, icon: '🌳' },
  mossy_wood: { label: 'Lũa Bám Rêu 🌿', imageKey: 'plant_13', desc: 'Lũa bám rêu xum xuê sinh động', bbox: { x: 100, y: 52, w: 224, h: 204 }, icon: '🌿' },
  rock: { label: 'Đá Cảnh Pixel 🪨', imageKey: 'plant_21', desc: 'Đồi đá nhấp nhô phong cảnh', bbox: { x: 64, y: 60, w: 276, h: 176 }, icon: '🪨' },
  skull: { label: 'Đầu Lâu Cổ 💀', imageKey: 'decor_skull', desc: 'Đầu lâu trang trí kỳ bí', bbox: { x: 176, y: 72, w: 44, h: 40 }, icon: '💀' },
  coral: { label: 'San Hô Biển 🪸', imageKey: 'plant_5', desc: 'San hô pixel sặc sỡ', bbox: { x: 120, y: 60, w: 160, h: 180 }, icon: '🪸' },
  javamoss: { label: 'Rêu Java 🌿', imageKey: 'plant_9', desc: 'Rêu mịn phủ lũa đá', bbox: { x: 100, y: 80, w: 200, h: 140 }, icon: '🌿' },
  bridge: { label: 'Cầu Gỗ Nhỏ 🌉', imageKey: 'plant_16', desc: 'Cầu gỗ trang trí tinh tế', bbox: { x: 92, y: 72, w: 220, h: 156 }, icon: '🌉' },
  castle: { label: 'Lâu Đài Cổ 🏰', imageKey: 'plant_22', desc: 'Phế tích lâu đài bí ẩn', bbox: { x: 132, y: 72, w: 132, h: 168 }, icon: '🏰' },
  helmet: { label: 'Mũ Giáp Cổ ⛑️', imageKey: 'decor_kask', desc: 'Mũ hiệp sĩ chìm đáy', bbox: { x: 140, y: 100, w: 120, h: 100 }, icon: '⛑️' },
  ship: { label: 'Tàu Đắm Cổ 🚢', imageKey: 'plant_15', desc: 'Xác tàu gỗ đắm chìm', bbox: { x: 108, y: 92, w: 184, h: 112 }, icon: '🚢' },
  mushroom_house: { label: 'Nhà Nấm 🍄', imageKey: 'plant_19', desc: 'Nhà nấm trang trí dễ thương', bbox: { x: 104, y: 52, w: 184, h: 200 }, icon: '🍄' },
  leaning_bonsai: { label: 'Bonsai Dáng Bay 🌿', imageKey: 'decor_bonsai_bay', desc: 'Bonsai thế bay bám đá rêu phong', bbox: { x: 0, y: 0, w: 320, h: 240 }, icon: '🌿' }
};

// Substrate profile generator helper
function genSub(fn) {
  return Array.from({length: 40}, (_, i) => Math.max(0, Math.round(fn(i / 39))));
}

// 6 Pre-made Aquascape Templates
const aquascapeTemplates = [
  {
    id: 'iwagumi', name: '🏔️ Iwagumi', desc: 'Bố cục đá Nhật tối giản, thanh lịch',
    color: '#6b8f71', tankSize: 'standard60',
    substrate: {
      base: genSub(t => 12 + 18 * Math.pow(t - 0.35, 2)),
      soil: genSub(t => 20 + 20 * Math.pow(t - 0.35, 2)),
      sand: genSub(t => 4 + 4 * Math.sin(t * Math.PI))
    },
    hardscapesDef: [
      { type: 'rock', col: 16, scale: 1.4, rotation: -10 },
      { type: 'rock', col: 12, scale: 0.9, rotation: -25 },
      { type: 'rock', col: 22, scale: 0.7, rotation: 15 },
      { type: 'rock', col: 26, scale: 0.4, rotation: 5 }
    ],
    plantsDef: [
      { type: 'plant2', col: 6, size: 0.75 }, { type: 'plant2', col: 9, size: 0.8 },
      { type: 'plant2', col: 12, size: 0.9 }, { type: 'plant2', col: 18, size: 0.95 },
      { type: 'plant2', col: 20, size: 0.85 }, { type: 'plant2', col: 24, size: 0.8 },
      { type: 'plant2', col: 28, size: 0.7 }, { type: 'plant2', col: 32, size: 0.75 },
      { type: 'plant3', col: 2, size: 0.95 }, { type: 'plant3', col: 37, size: 0.9 }
    ],
    fishesDef: ['neon', 'neon', 'neon', 'neon', 'neon', 'neon', 'neon', 'neon', 'neon', 'neon'],
    equipment: { filter: true, light: true, co2: true, fan: false }
  },
  {
    id: 'dutch', name: '🌿 Dutch Style', desc: 'Vườn cây Hà Lan muôn sắc rực rỡ',
    color: '#4a8c5c', tankSize: 'standard60',
    substrate: {
      base: genSub(t => 12 + 12 * t),
      soil: genSub(t => 20 + 20 * t),
      sand: genSub(() => 0)
    },
    hardscapesDef: [],
    plantsDef: [
      { type: 'plant4', col: 2, size: 1.35 }, { type: 'plant4', col: 4, size: 1.25 },
      { type: 'plant20', col: 9, size: 1.15 }, { type: 'plant20', col: 12, size: 1.0 },
      { type: 'plant15', col: 16, size: 1.05 }, { type: 'plant15', col: 19, size: 0.95 },
      { type: 'plant19', col: 22, size: 1.1 }, { type: 'plant19', col: 25, size: 1.0 },
      { type: 'plant7', col: 28, size: 1.15 }, { type: 'plant7', col: 31, size: 1.0 },
      { type: 'plant4', col: 35, size: 1.25 }, { type: 'plant4', col: 37, size: 1.35 },
      { type: 'plant2', col: 7, size: 0.85 }, { type: 'plant2', col: 14, size: 0.8 },
      { type: 'plant2', col: 20, size: 0.75 }, { type: 'plant2', col: 27, size: 0.8 }
    ],
    fishesDef: ['neon', 'neon', 'neon', 'neon', 'mun', 'mun', 'mun', 'mun'],
    equipment: { filter: true, light: true, co2: true, fan: false }
  },
  {
    id: 'nature', name: '🌳 Nature Aquarium', desc: 'Amano tự nhiên ôm đá kẹp cát trắng',
    color: '#34a853', tankSize: 'standard60',
    substrate: {
      base: genSub(t => 14 + 14 * Math.pow(t - 0.5, 2)),
      soil: genSub(t => (t < 0.38 || t > 0.62) ? (24 + 16 * Math.pow(t - 0.5, 2)) : 5),
      sand: genSub(t => (t >= 0.35 && t <= 0.65) ? (16 - 12 * Math.abs(t - 0.5)) : 2)
    },
    hardscapesDef: [
      { type: 'mossy_wood', col: 10, scale: 1.0, rotation: -20 },
      { type: 'bonsai', col: 28, scale: 0.95, rotation: 10 },
      { type: 'rock', col: 14, scale: 0.55, rotation: -10 },
      { type: 'rock', col: 23, scale: 0.5, rotation: 15 }
    ],
    plantsDef: [
      { type: 'plant11', col: 12, size: 0.85 }, { type: 'plant11', col: 26, size: 0.8 },
      { type: 'plant15', col: 7, size: 1.05 }, { type: 'plant15', col: 31, size: 1.0 },
      { type: 'plant19', col: 4, size: 1.15 }, { type: 'plant19', col: 34, size: 1.2 },
      { type: 'plant20', col: 11, size: 0.95 }, { type: 'plant20', col: 29, size: 0.9 },
      { type: 'plant2', col: 3, size: 0.8 }, { type: 'plant2', col: 36, size: 0.75 }
    ],
    fishesDef: ['neon', 'neon', 'neon', 'neon', 'cherry', 'cherry', 'cherry', 'cherry', 'cherry'],
    equipment: { filter: true, light: true, co2: true, fan: false }
  },
  {
    id: 'jungle', name: '🌴 Rừng Nhiệt Đới', desc: 'Hoang dã rậm rạp um tùm phân tầng',
    color: '#2d5a1e', tankSize: 'premium90',
    substrate: {
      base: genSub(t => 22 - 12 * t),
      soil: genSub(t => 28 - 18 * t),
      sand: genSub(() => 0)
    },
    hardscapesDef: [
      { type: 'driftwood', col: 8, scale: 1.3, rotation: 15 },
      { type: 'mossy_wood', col: 18, scale: 1.1, rotation: -10 },
      { type: 'bonsai', col: 28, scale: 0.95, rotation: -30 },
      { type: 'rock', col: 6, scale: 0.7, rotation: -5 },
      { type: 'rock', col: 22, scale: 0.6, rotation: 12 }
    ],
    plantsDef: [
      { type: 'plant4', col: 2, size: 1.35 }, { type: 'plant4', col: 4, size: 1.25 },
      { type: 'plant4', col: 35, size: 1.15 }, { type: 'plant4', col: 38, size: 1.3 },
      { type: 'plant19', col: 7, size: 1.15 }, { type: 'plant19', col: 12, size: 1.0 },
      { type: 'plant15', col: 16, size: 1.1 }, { type: 'plant15', col: 21, size: 0.95 },
      { type: 'plant7', col: 25, size: 1.05 }, { type: 'plant7', col: 29, size: 0.9 },
      { type: 'plant20', col: 14, size: 1.0 }, { type: 'plant20', col: 32, size: 0.95 },
      { type: 'plant11', col: 10, size: 0.85 }, { type: 'plant11', col: 19, size: 0.8 },
      { type: 'plant11', col: 27, size: 0.75 }, { type: 'plant3', col: 13, size: 0.9 },
      { type: 'plant3', col: 24, size: 0.85 }, { type: 'plant2', col: 1, size: 0.85 },
      { type: 'plant2', col: 31, size: 0.75 }, { type: 'plant2', col: 36, size: 0.8 }
    ],
    fishesDef: ['tamgiac', 'tamgiac', 'tamgiac', 'tamgiac', 'tamgiac', 'neon', 'neon', 'neon', 'neon', 'neon'],
    equipment: { filter: true, light: true, co2: true, fan: true }
  },
  {
    id: 'fantasy', name: '💀 Fantasy Biển Sâu', desc: 'Bảo tàng đắm tàu lâu đài phế tích kì bí',
    color: '#6a4c93', tankSize: 'standard60',
    substrate: {
      base: genSub(t => 12 + 6 * Math.sin(t * Math.PI)),
      soil: genSub(() => 4),
      sand: genSub(t => 16 + 8 * Math.cos(t * Math.PI * 2))
    },
    hardscapesDef: [
      { type: 'ship', col: 11, scale: 1.25, rotation: -12 },
      { type: 'castle', col: 28, scale: 0.85, rotation: 6 },
      { type: 'helmet', col: 5, scale: 0.9, rotation: -15 },
      { type: 'skull', col: 34, scale: 1.5, rotation: 22 },
      { type: 'coral', col: 18, scale: 0.85, rotation: 0 },
      { type: 'coral', col: 22, scale: 0.7, rotation: 0 }
    ],
    plantsDef: [
      { type: 'plant7', col: 3, size: 0.85 }, { type: 'plant7', col: 15, size: 0.75 },
      { type: 'plant7', col: 32, size: 0.9 }, { type: 'plant3', col: 8, size: 0.95 },
      { type: 'plant3', col: 25, size: 0.9 }, { type: 'plant2', col: 13, size: 0.75 },
      { type: 'plant2', col: 21, size: 0.7 }
    ],
    fishesDef: ['neon', 'neon', 'neon', 'neon', 'mun', 'mun', 'mun', 'mun'],
    equipment: { filter: true, light: true, co2: false, fan: false }
  },
  {
    id: 'zen', name: '🎋 Zen Tĩnh Lặng', desc: 'Đền đá tối giản bên cầu gỗ cát trắng',
    color: '#8a7e6b', tankSize: 'standard60',
    substrate: {
      base: genSub(() => 6),
      soil: genSub(t => (t > 0.58) ? (6 + 12 * (t - 0.58)) : 2),
      sand: genSub(t => 16 + 6 * Math.sin(t * Math.PI * 0.7))
    },
    hardscapesDef: [
      { type: 'rock', col: 26, scale: 0.95, rotation: -6 },
      { type: 'rock', col: 29, scale: 0.55, rotation: 12 },
      { type: 'rock', col: 11, scale: 0.65, rotation: -10 },
      { type: 'rock', col: 9, scale: 0.35, rotation: 20 },
      { type: 'bridge', col: 18, scale: 0.8, rotation: 0 }
    ],
    plantsDef: [
      { type: 'plant11', col: 24, size: 0.75 }, { type: 'plant15', col: 28, size: 0.85 },
      { type: 'plant3', col: 7, size: 0.9 }, { type: 'plant3', col: 33, size: 0.85 },
      { type: 'plant2', col: 13, size: 0.7 }
    ],
    fishesDef: ['cherry', 'cherry', 'cherry', 'cherry', 'cherry', 'cherry', 'cherry', 'mun', 'mun'],
    equipment: { filter: true, light: true, co2: false, fan: false }
  }
];

const floraItems = {
  plant2: { label: 'Trân châu ngọc trai 🌱', imageKey: 'plant_2', desc: 'Thảm cỏ xanh mịn bò sát nền', bbox: { x: 152, y: 84, w: 96, h: 136 }, baseW: 40, baseH: 57 },
  plant3: { label: 'Cỏ Nhật xanh mướt 🌿', imageKey: 'plant_3', desc: 'Lá dài mềm mại trung cảnh', bbox: { x: 148, y: 72, w: 104, h: 156 }, baseW: 50, baseH: 75 },
  plant4: { label: 'Hẹ nước lá dài 🌾', imageKey: 'plant_4', desc: 'Thân cao thanh mảnh hậu cảnh', bbox: { x: 128, y: 52, w: 140, h: 200 }, baseW: 105, baseH: 150 },
  plant7: { label: 'Rong đuôi chồn ☘️', imageKey: 'plant_7', desc: 'Cành lá kim dày đặc lọc nước', bbox: { x: 88, y: 56, w: 228, h: 188 }, baseW: 145, baseH: 120 },
  plant11: { label: 'Ráy Nana lá sẫm 🍃', imageKey: 'plant_11', desc: 'Buộc lũa hoặc đá rất dai sức', bbox: { x: 112, y: 44, w: 192, h: 208 }, baseW: 83, baseH: 90 },
  plant15: { label: 'Dương xỉ Mỹ nhân 🎋', imageKey: 'plant_17', desc: 'Lá răng cưa sang trọng', bbox: { x: 136, y: 52, w: 128, h: 200 }, baseW: 90, baseH: 140 },
  plant19: { label: 'Trầu bà lá lớn 🍁', imageKey: 'plant_18', desc: 'Khóm to nổi bật hậu cảnh', bbox: { x: 156, y: 40, w: 84, h: 220 }, baseW: 65, baseH: 170 },
  plant20: { label: 'Cây cắt cắm lá đỏ 🍂', imageKey: 'plant_20', desc: 'Sắc đỏ rực rỡ làm điểm nhấn', bbox: { x: 132, y: 72, w: 136, h: 156 }, baseW: 96, baseH: 110 }
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
  updateUI(); // Render immediately to prevent white screens/missing toolbox while loading
  loadOrInitProgress();
  
  // Start Game loop after assets are loaded
  preloadAssets(() => {
    tick();
  });
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
  updateUI(); // Always update UI at the end to ensure step 1 or loaded step renders correctly!
}

function sanitizeState(loadedState) {
  const defaultState = {
    step: 1,
    tankSize: 'standard60',
    tankFrame: 'akvaryum7',
    substrate: {
      base: Array(40).fill(15),
      soil: Array(40).fill(30),
      sand: Array(40).fill(0),
      ground_blue: Array(40).fill(0),
      ground_green: Array(40).fill(0)
    },
    hardscapes: [],
    plants: [],
    equipment: {
      filter: false,
      light: false,
      co2: false,
      fan: false
    },
    bioCycle: {
      bacteria: 0.0,
      ammonia: 1.0,
      nitrite: 0.0,
      cycled: false
    },
    waterLevel: 0.0,
    fishes: [],
    themeOverride: 'auto',
    selectedTemplateId: null
  };

  if (!loadedState) return defaultState;
  
  const merged = { ...defaultState, ...loadedState };
  
  merged.substrate = { ...defaultState.substrate, ...(loadedState.substrate || {}) };
  ['base', 'soil', 'sand', 'ground_blue', 'ground_green'].forEach(k => {
    if (!Array.isArray(merged.substrate[k]) || merged.substrate[k].length !== 40) {
      merged.substrate[k] = Array(40).fill(k === 'base' ? 15 : (k === 'soil' ? 30 : 0));
    }
  });
  
  if (!Array.isArray(merged.hardscapes)) merged.hardscapes = [];
  if (!Array.isArray(merged.plants)) merged.plants = [];
  if (!Array.isArray(merged.fishes)) merged.fishes = [];
  
  merged.equipment = { ...defaultState.equipment, ...(loadedState.equipment || {}) };
  merged.bioCycle = { ...defaultState.bioCycle, ...(loadedState.bioCycle || {}) };
  
  return merged;
}

async function fetchStateFromServer(code) {
  try {
    const res = await fetch(`/api/aquarium/load/${code}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.state) {
        state = sanitizeState(data.state);
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
  selectedHardscapeIndex = -1;
  selectedPlantIndex = -1;
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
  const grid = document.querySelector('.fish-selection-grid');
  const fishScrollTop = grid ? grid.scrollTop : 0;

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
        
        <div class="template-section-title" style="margin-top: 25px; margin-bottom: 8px; font-weight: bold; border-top: 1px dashed var(--glass-border); padding-top: 15px;">
          ✨ Mẫu Tiểu Cảnh Sẵn
        </div>
        <p class="tool-desc" style="margin-bottom: 12px; font-size: 0.75rem; opacity: 0.85;">
          Hoặc chọn nhanh 1 trong 6 phong cách bố cục được setup sẵn cực đẹp bên dưới:
        </p>
        <div class="template-grid">
          ${aquascapeTemplates.map(tpl => `
            <div class="template-card ${state.selectedTemplateId === tpl.id ? 'selected' : ''}" onclick="applyTemplate('${tpl.id}')" style="color: ${tpl.color || '#fff'}">
              <div class="template-header">
                <span class="template-name">${tpl.name}</span>
                <span class="template-badge">${tpl.tankSize === 'cubic40' ? 'Cubic 40' : tpl.tankSize === 'premium90' ? 'Premium 90' : 'Standard 60'}</span>
              </div>
              <span class="template-desc">${tpl.desc}</span>
            </div>
          `).join('')}
        </div>
      `;
      break;
      
    case 2:
      title.textContent = 'Rải Phân Nền & Đất';
      container.innerHTML = `
        <p class="tool-desc" style="margin-bottom:10px;">Chọn vật liệu bên dưới, sau đó nhấn giữ kéo trên mặt đáy bể cá để đắp đất nền:</p>
        <div class="tool-grid" style="grid-template-columns: repeat(2, 1fr); gap: 10px;">
          <div class="tool-card" id="card-brush-base" onclick="selectSubstrateBrush('base')">
            <span class="tool-icon" style="color:${materials.base.color}">🟫</span>
            <span class="tool-name">${materials.base.label}</span>
          </div>
          <div class="tool-card" id="card-brush-soil" onclick="selectSubstrateBrush('soil')">
            <span class="tool-icon" style="color:${materials.soil.color}">⬛</span>
            <span class="tool-name">${materials.soil.label}</span>
          </div>
          <div class="tool-card" id="card-brush-sand" onclick="selectSubstrateBrush('sand')">
            <span class="tool-icon" style="color:${materials.sand.color}">🟨</span>
            <span class="tool-name">${materials.sand.label}</span>
          </div>
          <div class="tool-card" id="card-brush-ground_blue" onclick="selectSubstrateBrush('ground_blue')">
            <span class="tool-icon" style="color:${materials.ground_blue.color}">🔵</span>
            <span class="tool-name">${materials.ground_blue.label}</span>
          </div>
          <div class="tool-card" id="card-brush-ground_green" onclick="selectSubstrateBrush('ground_green')">
            <span class="tool-icon" style="color:${materials.ground_green.color}">🟢</span>
            <span class="tool-name">${materials.ground_green.label}</span>
          </div>
        </div>
        <div class="btn-action-block" style="margin-top: 15px;">
          <button class="btn-action" onclick="clearSubstrate()">🧹 Xóa hết nền</button>
        </div>
      `;
      break;
      
    case 3:
      title.textContent = 'Bố cục Lũa & Đá';
      let html = `<p class="tool-desc" style="margin-bottom:10px;">Nhấn vào vật liệu để thêm vào bể. Kéo di chuyển, và dùng các núm xoay bên dưới:</p>
        <div class="tool-grid">`;
      for (const key in hardscapeItems) {
        const item = hardscapeItems[key];
        const icon = item.icon || '🪵';
        html += `
          <div class="tool-card" onclick="addHardscape('${key}')">
            <span class="tool-icon">${icon}</span>
            <span class="tool-name">${item.label}</span>
          </div>
        `;
      }
      html += `</div>
        
        <div class="hardscape-controls" id="hardscape-sliders" style="display:none; margin-top: 15px; display:flex; flex-direction:column; gap:12px;">
          <h4 style="font-size:0.9rem; font-weight:700;">Điều chỉnh Vật thể Đang Chọn:</h4>
          <div class="control-slider-group">
            <div class="slider-header">
              <span>Phóng to/Thu nhỏ</span>
              <span id="txt-hs-scale">1.0x</span>
            </div>
            <input type="range" id="slide-hs-scale" class="custom-range" min="0.4" max="4.5" step="0.05" value="1.0" oninput="adjustSelectedHardscape('scale', this.value)">
          </div>
          <div class="control-slider-group">
            <div class="slider-header">
              <span>Xoay góc</span>
              <span id="txt-hs-rotate">0°</span>
            </div>
            <input type="range" id="slide-hs-rotate" class="custom-range" min="-180" max="180" step="5" value="0" oninput="adjustSelectedHardscape('rotation', this.value)">
          </div>
          <div style="display: flex; gap: 8px; margin-top: 5px;">
            <button class="btn-action" style="flex: 1; margin: 0; font-size: 0.8rem; background: var(--color-secondary, #6c757d);" onclick="moveSelectedHardscapeZ('back')">⏬ Gửi ra sau</button>
            <button class="btn-action" style="flex: 1; margin: 0; font-size: 0.8rem; background: var(--color-secondary, #6c757d);" onclick="moveSelectedHardscapeZ('front')">⏫ Đưa lên trước</button>
          </div>
          <button class="btn-action" style="background:var(--color-danger); color:white; border:none; margin-top: 5px;" onclick="removeSelectedHardscape()">🗑️ Xóa vật thể chọn</button>
        </div>
      `;
      container.innerHTML = html;
      activeTool = 'drag-hardscape';
      break;
      
    case 4:
      title.textContent = 'Cắm Cây Thủy Sinh';
      container.innerHTML = `
        <p class="tool-desc" style="margin-bottom:10px;">Chọn cây rồi click lên đất nền/gỗ đá trong bể để trồng:</p>
        <div class="tool-grid" style="grid-template-columns: repeat(2, 1fr); gap: 10px;">
          <div class="tool-card" id="card-plant-plant2" onclick="selectPlantTool('plant2')">
            <span class="tool-icon">🌱</span>
            <span class="tool-name">${floraItems.plant2.label}</span>
          </div>
          <div class="tool-card" id="card-plant-plant3" onclick="selectPlantTool('plant3')">
            <span class="tool-icon">🌿</span>
            <span class="tool-name">${floraItems.plant3.label}</span>
          </div>
          <div class="tool-card" id="card-plant-plant4" onclick="selectPlantTool('plant4')">
            <span class="tool-icon">🌾</span>
            <span class="tool-name">${floraItems.plant4.label}</span>
          </div>
          <div class="tool-card" id="card-plant-plant7" onclick="selectPlantTool('plant7')">
            <span class="tool-icon">☘️</span>
            <span class="tool-name">${floraItems.plant7.label}</span>
          </div>
          <div class="tool-card" id="card-plant-plant11" onclick="selectPlantTool('plant11')">
            <span class="tool-icon">🍃</span>
            <span class="tool-name">${floraItems.plant11.label}</span>
          </div>
          <div class="tool-card" id="card-plant-plant15" onclick="selectPlantTool('plant15')">
            <span class="tool-icon">🎋</span>
            <span class="tool-name">${floraItems.plant15.label}</span>
          </div>
          <div class="tool-card" id="card-plant-plant19" onclick="selectPlantTool('plant19')">
            <span class="tool-icon">🍁</span>
            <span class="tool-name">${floraItems.plant19.label}</span>
          </div>
          <div class="tool-card" id="card-plant-plant20" onclick="selectPlantTool('plant20')">
            <span class="tool-icon">🍂</span>
            <span class="tool-name">${floraItems.plant20.label}</span>
          </div>
        </div>
        <div class="btn-action-block" style="margin-top: 15px;">
          <button class="btn-action" onclick="clearPlants()">🧹 Bứng hết cây</button>
        </div>
        
        <div class="plant-controls" id="plant-sliders" style="display:none; margin-top: 15px; display:flex; flex-direction:column; gap:12px;">
          <h4 style="font-size:0.9rem; font-weight:700;">Điều chỉnh Cây Đang Chọn:</h4>
          <div class="control-slider-group">
            <div class="slider-header">
              <span>Phóng to/Thu nhỏ</span>
              <span id="txt-plant-size">1.0x</span>
            </div>
            <input type="range" id="slide-plant-size" class="custom-range" min="0.4" max="4.5" step="0.05" value="1.0" oninput="adjustSelectedPlant('size', this.value)">
          </div>
          <div style="display: flex; gap: 8px; margin-top: 5px;">
            <button class="btn-action" style="flex: 1; margin: 0; font-size: 0.8rem; background: var(--color-secondary, #6c757d);" onclick="moveSelectedPlantZ('back')">⏬ Gửi ra sau</button>
            <button class="btn-action" style="flex: 1; margin: 0; font-size: 0.8rem; background: var(--color-secondary, #6c757d);" onclick="moveSelectedPlantZ('front')">⏫ Đưa lên trước</button>
          </div>
          <button class="btn-action" style="background:var(--color-danger); color:white; border:none; margin-top: 5px;" onclick="removeSelectedPlant()">🗑️ Nhổ cây đang chọn</button>
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
      title.textContent = 'Thả Cá & Sinh Vật Cảnh';
      
      const rarityLabels = {
        'common': 'Thường',
        'rare': 'Hiếm',
        'epic': 'Sử thi',
        'legendary': 'Huyền thoại'
      };
      
      let fishGridHtml = `<p class="tool-desc" style="margin-bottom:12px;">Nhấp vào sinh vật bất kỳ dưới đây để thả vào bể (Tối đa 150 con):</p>
        <div class="fish-selection-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; max-height: 280px; overflow-y: auto; padding-right: 5px;">`;
      
      fishCollection.forEach(fish => {
        const fishImg = ASSETS_BASE + (fish.id === 'fish_yellow_striped' ? 'saricizgilibalik.png' : `${fish.id.replace('_', '')}.png`);
        fishGridHtml += `
          <div class="fish-selection-card" onclick="addFishDirectly('${fish.id}')" style="display: flex; align-items: center; gap: 10px; background: rgba(255, 255, 255, 0.05); border: 1px solid var(--glass-border); padding: 8px; border-radius: 6px; cursor: pointer; transition: all 0.2s ease;">
            <div style="width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.2); border-radius: 4px; overflow: hidden; position: relative;">
              <img src="${fishImg}" style="max-width: 90%; max-height: 90%; object-fit: contain; image-rendering: pixelated;">
            </div>
            <div style="flex: 1; min-width: 0; display: flex; flex-direction: column;">
              <span style="font-size: 0.8rem; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--text-main);">${fish.name}</span>
              <span class="rarity-badge-text ${fish.rarity}" style="font-size: 0.65rem; font-weight: bold; width: fit-content; text-transform: uppercase;">${rarityLabels[fish.rarity]}</span>
            </div>
          </div>
        `;
      });
      
      fishGridHtml += `</div>
        <div class="btn-action-block" style="margin-top: 15px; border-top: 1px dashed var(--glass-border); padding-top: 15px;">
          <button class="btn-action" style="background:var(--color-danger); color:white; border:none;" onclick="clearFauna()">🗑️ Vớt hết cá ra</button>
        </div>
      `;
      
      container.innerHTML = fishGridHtml;
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
  
  // Restore sliders states
  if (state.step === 3) {
    updateHardscapeSliders();
  }
  if (state.step === 4) {
    updatePlantSliders();
  }
  
  // Restore fish scroll position if we are in Step 7
  if (state.step === 7 && fishScrollTop > 0) {
    const newGrid = document.querySelector('.fish-selection-grid');
    if (newGrid) {
      newGrid.scrollTop = fishScrollTop;
    }
  }
}

// Select size
function selectTankSize(size) {
  state.tankSize = size;
  state.selectedTemplateId = null; // Clear template selection if size changed manually
  updateUI();
  saveStateToServer();
}

function selectTankFrame(frame) {
  state.tankFrame = frame;
  updateUI();
  saveStateToServer();
}

// Template Sound synthesis
function playTemplateSound() {
  if (!soundActive || !audioCtx) return;
  try {
    const now = audioCtx.currentTime;
    for (let i = 0; i < 5; i++) {
      const timeOffset = i * 0.08;
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(350 + i * 110 + Math.random() * 40, now + timeOffset);
      osc.frequency.exponentialRampToValueAtTime(900 + Math.random() * 200, now + timeOffset + 0.12);
      
      gainNode.gain.setValueAtTime(0.025 + Math.random() * 0.015, now + timeOffset);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + timeOffset + 0.12);
      
      osc.start(now + timeOffset);
      osc.stop(now + timeOffset + 0.12);
    }
  } catch (e) {
    console.error("Template sound playback error:", e);
  }
}

// Apply a selected layout template
function applyTemplate(templateId) {
  const template = aquascapeTemplates.find(t => t.id === templateId);
  if (!template) return;
  
  state.tankSize = template.tankSize;
  state.selectedTemplateId = templateId;
  
  // Set substrate values from template
  state.substrate.base = [...template.substrate.base];
  state.substrate.soil = [...template.substrate.soil];
  state.substrate.sand = [...template.substrate.sand];
  state.substrate.ground_blue = template.substrate.ground_blue ? [...template.substrate.ground_blue] : Array(40).fill(0);
  state.substrate.ground_green = template.substrate.ground_green ? [...template.substrate.ground_green] : Array(40).fill(0);
  
  // Clear existing items
  state.hardscapes = [];
  state.plants = [];
  state.fishes = [];
  
  // Setup coordinate mapping
  const dim = tankDims[template.tankSize];
  const startX = (canvas.width - dim.width) / 2;
  const innerStartX = startX;
  const innerWidth = dim.width;
  const innerHeight = dim.height;
  const colWidth = innerWidth / 40;
  const bottom = canvas.height - 20;
  
  // Add hardscape objects
  if (template.hardscapesDef) {
    state.hardscapes = template.hardscapesDef.map(def => {
      const x = innerStartX + def.col * colWidth;
      const colIdx = Math.max(0, Math.min(39, Math.round(def.col)));
      const h_below = (state.substrate.base[colIdx] || 0) + (state.substrate.soil[colIdx] || 0) + (state.substrate.sand[colIdx] || 0) + ((state.substrate.ground_blue && state.substrate.ground_blue[colIdx]) || 0) + ((state.substrate.ground_green && state.substrate.ground_green[colIdx]) || 0);
      const y = bottom - h_below;
      return {
        type: def.type,
        x: x,
        y: y,
        scale: def.scale,
        rotation: def.rotation * Math.PI / 180
      };
    });
  }
  
  // Add plants
  if (template.plantsDef) {
    state.plants = template.plantsDef.map(def => {
      const x = innerStartX + def.col * colWidth;
      const colIdx = Math.max(0, Math.min(39, Math.round(def.col)));
      const h_below = (state.substrate.base[colIdx] || 0) + (state.substrate.soil[colIdx] || 0) + (state.substrate.sand[colIdx] || 0) + ((state.substrate.ground_blue && state.substrate.ground_blue[colIdx]) || 0) + ((state.substrate.ground_green && state.substrate.ground_green[colIdx]) || 0);
      const y = bottom - h_below;
      return {
        type: def.type,
        x: x,
        y: y,
        size: def.size
      };
    });
  }
  
  // Spawn default fishes/fauna
  if (template.fishesDef) {
    template.fishesDef.forEach(type => {
      const fishX = innerStartX + 50 + Math.random() * (innerWidth - 100);
      const fishY = dim.yOffset + 50 + Math.random() * (innerHeight - 150);
      spawnFaunaObject(type, fishX, fishY);
    });
  }
  
  // Setup equipments & water
  state.equipment = { ...template.equipment };
  state.waterLevel = 0.9;
  
  // Cycle the bio system
  state.bioCycle.bacteria = 1.0;
  state.bioCycle.ammonia = 0.0;
  state.bioCycle.nitrite = 0.0;
  state.bioCycle.nitrate = 0.5;
  state.bioCycle.cycled = true;
  
  // Play sound
  playTemplateSound();
  
  showToast(`✨ Đã thiết lập phong cách: ${template.name}!`);
  
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
  state.substrate.ground_blue = Array(40).fill(0);
  state.substrate.ground_green = Array(40).fill(0);
  state.selectedTemplateId = null; // Clear template selection
  updateUI();
  saveStateToServer();
}

// Hardscape Arrangement
function addHardscape(type) {
  state.selectedTemplateId = null; // Clear template selection
  const dim = tankDims[state.tankSize];
  const startX = (canvas.width - dim.width) / 2;
  const bottom = canvas.height - 20;
  const innerBottom = dim.yOffset + 0.903 * (bottom - dim.yOffset);
  const item = {
    type,
    x: canvas.width / 2 + (Math.random() * 80 - 40),
    y: innerBottom,
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

function moveSelectedHardscapeZ(direction) {
  if (selectedHardscapeIndex < 0 || selectedHardscapeIndex >= state.hardscapes.length) return;
  
  const hs = state.hardscapes[selectedHardscapeIndex];
  
  if (direction === 'back') {
    // Move to the beginning of the array so it draws first (behind everything)
    state.hardscapes.splice(selectedHardscapeIndex, 1);
    state.hardscapes.unshift(hs);
    selectedHardscapeIndex = 0;
  } else if (direction === 'front') {
    // Move to the end of the array so it draws last (in front of everything)
    state.hardscapes.splice(selectedHardscapeIndex, 1);
    state.hardscapes.push(hs);
    selectedHardscapeIndex = state.hardscapes.length - 1;
  }
  
  updateHardscapeSliders();
  updateUI();
  saveStateToServer();
}

function updatePlantSliders() {
  const panel = document.getElementById('plant-sliders');
  if (!panel) return;
  if (selectedPlantIndex >= 0 && selectedPlantIndex < state.plants.length) {
    const item = state.plants[selectedPlantIndex];
    panel.style.display = 'flex';
    document.getElementById('slide-plant-size').value = item.size || 1.0;
    document.getElementById('txt-plant-size').textContent = (item.size || 1.0).toFixed(1) + 'x';
  } else {
    panel.style.display = 'none';
  }
}

function adjustSelectedPlant(prop, val) {
  if (selectedPlantIndex >= 0 && selectedPlantIndex < state.plants.length) {
    const item = state.plants[selectedPlantIndex];
    if (prop === 'size') {
      item.size = parseFloat(val);
      document.getElementById('txt-plant-size').textContent = parseFloat(val).toFixed(1) + 'x';
    }
    saveStateToServer();
  }
}

function removeSelectedPlant() {
  if (selectedPlantIndex >= 0 && selectedPlantIndex < state.plants.length) {
    state.plants.splice(selectedPlantIndex, 1);
    selectedPlantIndex = -1;
    updatePlantSliders();
    updateUI();
    saveStateToServer();
  }
}

function moveSelectedPlantZ(direction) {
  if (selectedPlantIndex < 0 || selectedPlantIndex >= state.plants.length) return;
  
  const p = state.plants[selectedPlantIndex];
  
  if (direction === 'back') {
    state.plants.splice(selectedPlantIndex, 1);
    state.plants.unshift(p);
    selectedPlantIndex = 0;
  } else if (direction === 'front') {
    state.plants.splice(selectedPlantIndex, 1);
    state.plants.push(p);
    selectedPlantIndex = state.plants.length - 1;
  }
  
  updatePlantSliders();
  updateUI();
  saveStateToServer();
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
  
  isFillingWater = true; // Animate rising water in tick() game loop
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
  if (state.fishes.length >= 150) {
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
  finalSpinResult = null;
  updateUI();
  loadToolbox();
  saveStateToServer();
}

function spawnSlotFish(fish) {
  if (state.fishes.length >= 150) {
    showToast("Bể cá đã chật, không nên thả thêm!");
    return;
  }
  
  const dim = tankDims[state.tankSize];
  const startX = (canvas.width - dim.width) / 2;
  const bottom = canvas.height - 20;
  const innerStartX = startX;
  const innerEndX = startX + dim.width;
  const innerTop = dim.yOffset;
  const innerBottom = bottom;
  const innerHeight = innerBottom - innerTop;
  const waterTop = innerTop + (1.0 - state.waterLevel) * (innerHeight - 10);
  
  const isCrawler = fish.id === 'fish_8' || fish.id === 'fish_9';
  
  state.fishes.push({
    type: isCrawler ? 'cherry' : 'fish',
    imageKey: fish.id,
    fishName: fish.name,
    rarity: fish.rarity,
    x: innerStartX + (innerEndX - innerStartX) / 2 + (Math.random() * 100 - 50),
    y: isCrawler ? innerBottom - 25 : waterTop + Math.random() * (innerBottom - waterTop - 40),
    vx: (Math.random() > 0.5 ? 1 : -1) * (0.8 + Math.random() * 0.8),
    vy: isCrawler ? 0 : (Math.random() * 2 - 1) * 0.4,
    size: isCrawler ? 12 : 16 + Math.random() * 6,
    angle: 0,
    targetX: canvas.width / 2,
    targetY: canvas.height / 2
  });
  
  updateUI();
  saveStateToServer();
}

function addFishDirectly(fishId) {
  const fish = fishCollection.find(f => f.id === fishId);
  if (!fish) return;
  spawnSlotFish(fish);
  showToast("🐠 Đã thả " + fish.name + " vào bể!");
  
  // Play bubble sound
  if (audioCtx && soundActive) {
    playBubbleSound();
  }
}

function animateSlotFrame() {
  if (!isSpinning) return;
  
  const frame = document.getElementById('slot-machine-frame');
  if (frame) {
    animFrameIndex = (animFrameIndex % 5) + 1;
    frame.style.backgroundImage = `url('${ASSETS_BASE}slotback${animFrameIndex}.png')`;
  }
  
  setTimeout(animateSlotFrame, 120);
}

function spinSlotMachine() {
  if (isSpinning) return;
  if (state.fishes.length >= 150) {
    showToast("Bể cá đã chật, không nên thả thêm!");
    return;
  }
  
  isSpinning = true;
  finalSpinResult = null;
  loadToolbox(); // Re-render to disable button
  animateSlotFrame(); // Start frame animation
  
  // Play initial pop sound if audio initialized
  if (audioCtx && soundActive) {
    playBubbleSound();
  }
  
  let speed = 60; // ms per shuffle
  let duration = 0;
  
  const runShuffle = () => {
    duration += speed;
    
    // Pick random fish for visual shuffle
    const randFish = fishCollection[Math.floor(Math.random() * fishCollection.length)];
    const cardImg = document.getElementById('slot-card-image');
    const fishPrev = document.getElementById('slot-fish-preview');
    
    if (cardImg && fishPrev) {
      cardImg.src = ASSETS_BASE + `fishcard${randFish.rarity}.png`;
      fishPrev.src = ASSETS_BASE + (randFish.id === 'fish_yellow_striped' ? 'saricizgilibalik.png' : `${randFish.id.replace('_', '')}.png`);
    }
    
    if (audioCtx && soundActive && Math.random() < 0.3) {
      playBubbleSound();
    }
    
    if (duration < 1800) {
      // Accelerate or decelerate speed
      if (duration > 1200) speed += 40;
      setTimeout(runShuffle, speed);
    } else {
      // Calculate final result
      // Probabilities: Common 60%, Rare 25%, Epic 12%, Legendary 3%
      const rand = Math.random() * 100;
      let selectedRarity = 'common';
      if (rand < 3) selectedRarity = 'legendary';
      else if (rand < 15) selectedRarity = 'epic';
      else if (rand < 40) selectedRarity = 'rare';
      
      const filteredFishes = fishCollection.filter(f => f.rarity === selectedRarity);
      const finalFish = filteredFishes[Math.floor(Math.random() * filteredFishes.length)];
      
      // Stop spinning
      isSpinning = false;
      finalSpinResult = finalFish;
      
      // Auto-spawn in tank
      spawnSlotFish(finalFish);
      
      // Re-render Step 7 toolbox to show congrats card
      loadToolbox();
    }
  };
  
  setTimeout(runShuffle, speed);
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
  
  // Lower water level to 0.55
  state.waterLevel = 0.55;
  updateUI();
  
  setTimeout(() => {
    showToast("💧 Đang bơm nước sạch mới...");
    
    // Trigger smooth rising animation on canvas!
    isFillingWater = true;
    
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
    const input = document.getElementById('sync-input-code');
    input.value = '';
    // Autofocus input after transition finishes (150ms)
    setTimeout(() => {
      input.focus();
    }, 150);
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

// Helper function to map plant types to their asset keys
function getPlantImageKey(type) {
  switch (type) {
    case 'montecarlo': return 'plant_2';
    case 'anubias': return 'plant_11';
    case 'fern': return 'plant_15';
    case 'rotala': return 'plant_20';
    default:
      if (type && type.startsWith('plant')) {
        const num = type.replace('plant', '');
        return `plant_${num}`;
      }
      return type;
  }
}

// Canvas Interaction Handlers
function handlePointerDown(e) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const x = (e.clientX - rect.left) * scaleX;
  const y = (e.clientY - rect.top) * scaleY;
  
  const dim = tankDims[state.tankSize];
  const startX = (canvas.width - dim.width) / 2;
  const bottom = canvas.height - 20;
  const innerStartX = startX;
  const innerEndX = startX + dim.width;
  const innerTop = dim.yOffset;
  const innerBottom = bottom;
  
  if (x < innerStartX || x > innerEndX || y < innerTop || y > innerBottom) {
    return; // Clicked outside the inner tank glass
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
    // Select or drag hardscapes using bounding box of the drawn sprite area
    selectedHardscapeIndex = -1;
    for (let i = state.hardscapes.length - 1; i >= 0; i--) {
      const hs = state.hardscapes[i];
      const item = hardscapeItems[hs.type];
      if (!item) continue;
      
      const bbox = item.bbox;
      const scaleFactor = hs.scale * HARDSCAPE_BASE_SCALE;
      const w = bbox.w * scaleFactor;
      const h = bbox.h * scaleFactor;
      const dx = (bbox.w / 2) * scaleFactor;
      const dy = bbox.h * scaleFactor;
      
      if (x > hs.x - dx && x < hs.x + dx && y > hs.y - dy && y < hs.y) {
        selectedHardscapeIndex = i;
        dragOffset.x = hs.x - x;
        dragOffset.y = hs.y - y;
        updateHardscapeSliders();
        break;
      }
    }
    updateHardscapeSliders();
  }
  else if (state.step === 4) {
    // Select or drag plants using bounding box of the drawn plant area
    selectedPlantIndex = -1;
    for (let i = state.plants.length - 1; i >= 0; i--) {
      const p = state.plants[i];
      const item = floraItems[p.type];
      if (!item) continue;
      
      const size = (p.size || 1.0) * PLANT_BASE_SCALE;
      const w = item.baseW * size;
      const h = item.baseH * size;
      
      if (x > p.x - w/2 && x < p.x + w/2 && y > p.y - h && y < p.y) {
        selectedPlantIndex = i;
        dragOffset.x = p.x - x;
        dragOffset.y = p.y - y;
        updatePlantSliders();
        break;
      }
    }
    updatePlantSliders();
    
    // If no existing plant was clicked and a plant tool is selected, place a new plant
    if (selectedPlantIndex < 0 && activeTool === 'place-plant' && selectedToolOption) {
      state.selectedTemplateId = null; // Clear template selection
      state.plants.push({
        type: selectedToolOption,
        x: x,
        y: y,
        size: 1.0
      });
      saveStateToServer();
      showToast("🌱 Đã trồng cây!");
    }
  }
  else if (state.step === 8 && activeTool === 'feed') {
    // Drop fish food
    fishFood.push({ x, y: y < innerTop ? innerTop : y, speed: 1 + Math.random() * 1.5 });
  }
  else if (state.step === 8 && activeTool === 'prune') {
    // Cut background plants
    state.plants = state.plants.filter(p => {
      const imgKey = getPlantImageKey(p.type);
      if ((p.type === 'rotala' || imgKey === 'plant_20') && Math.hypot(p.x - x, p.y - y) < 45) {
        p.size = 0.5; // Cut down
        return true;
      }
      return Math.hypot(p.x - x, p.y - y) >= 30;
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
  const startX = (canvas.width - dim.width) / 2;
  const bottom = canvas.height - 20;
  const innerStartX = startX;
  const innerEndX = startX + dim.width;
  const innerTop = dim.yOffset;
  const innerBottom = bottom;
  
  if (state.step === 2 && activeTool && activeTool.startsWith('brush-')) {
    applySubstrateBrush(x, activeTool.split('-')[1]);
  }
  else if (state.step === 3 && selectedHardscapeIndex >= 0) {
    // Drag hardscape item
    const hs = state.hardscapes[selectedHardscapeIndex];
    hs.x = Math.max(innerStartX + 20, Math.min(innerEndX - 20, x + dragOffset.x));
    hs.y = Math.max(innerTop + 40, Math.min(innerBottom, y + dragOffset.y));
    saveStateToServer();
  }
  else if (state.step === 4 && selectedPlantIndex >= 0) {
    // Drag plant item
    const p = state.plants[selectedPlantIndex];
    p.x = Math.max(innerStartX + 10, Math.min(innerEndX - 10, x + dragOffset.x));
    p.y = Math.max(innerTop + 40, Math.min(innerBottom, y + dragOffset.y));
    saveStateToServer();
  }
  else if (state.step === 8 && activeTool === 'scrape') {
    algaeLevel = Math.max(0, algaeLevel - 0.005);
  }
}

function handlePointerUp() {
  isDragging = false;
  if (state.step === 4) {
    updatePlantSliders();
  }
}

// Substrate brush logic
function applySubstrateBrush(x, type) {
  state.selectedTemplateId = null; // Clear template selection
  const dim = tankDims[state.tankSize];
  const startX = (canvas.width - dim.width) / 2;
  const innerStartX = startX;
  const innerWidth = dim.width;
  const segmentWidth = innerWidth / 40;
  
  const segmentIdx = Math.floor((x - innerStartX) / segmentWidth);
  if (segmentIdx >= 0 && segmentIdx < 40) {
    // Increase thickness at index and adjacent indices for a smoother curve
    const indices = [segmentIdx - 2, segmentIdx - 1, segmentIdx, segmentIdx + 1, segmentIdx + 2];
    const intensities = [0.2, 0.6, 1.2, 0.6, 0.2];
    
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
  if (!arr || !Array.isArray(arr)) return true;
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
  if (waterOverlay) {
    waterOverlay.style.height = (state.waterLevel * 100) + '%';
  }
}

// GAME SIMULATION LOOP (60fps)
function tick() {
  time += 0.05;
  
  // Update water level rising if filling
  if (isFillingWater) {
    state.waterLevel += 0.005;
    if (state.waterLevel >= 0.85) {
      state.waterLevel = 0.85;
      isFillingWater = false;
      
      const doseBtn = document.getElementById('btn-dose-bacteria');
      if (doseBtn) {
        doseBtn.disabled = false;
      }
      const fillBtn = document.getElementById('btn-fill-water');
      if (fillBtn) {
        fillBtn.textContent = '✓ Bể đã đầy nước';
      }
      
      showToast("🌊 Bơm nước hoàn tất!");
      saveStateToServer();
    }
    updateUI();
  }
  
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
      const hBlue = (state.substrate.ground_blue && state.substrate.ground_blue[segIdx]) || 0;
      const hGreen = (state.substrate.ground_green && state.substrate.ground_green[segIdx]) || 0;
      substrateY = bottom - hBase - hSoil - hSand - hBlue - hGreen;
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
  
  const innerStartX = startX;
  const innerEndX = endX;
  const innerWidth = dim.width;
  const innerTop = dim.yOffset;
  const innerBottom = bottom;
  const innerHeight = innerBottom - innerTop;
  const waterTop = innerTop + (1.0 - state.waterLevel) * (innerHeight - 10);
  
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
      let targetY = innerBottom;
      let targetX = fish.x;
      
      const segmentWidth = innerWidth / 40;
      const segIdx = Math.floor((fish.x - innerStartX) / segmentWidth);
      if (segIdx >= 0 && segIdx < 40) {
        const hBase = state.substrate.base[segIdx] || 0;
        const hSoil = state.substrate.soil[segIdx] || 0;
        const hSand = state.substrate.sand[segIdx] || 0;
        const hBlue = (state.substrate.ground_blue && state.substrate.ground_blue[segIdx]) || 0;
        const hGreen = (state.substrate.ground_green && state.substrate.ground_green[segIdx]) || 0;
        targetY = innerBottom - hBase - hSoil - hSand - hBlue - hGreen - 6;
      }
      
      // Crawling movement
      if (Math.random() < 0.05) {
        fish.vx = (Math.random() - 0.5) * 0.6;
      }
      
      fish.x += fish.vx;
      fish.y += (targetY - fish.y) * 0.1; // Snap to ground
      
      // Boundaries
      if (fish.x < innerStartX + 15) { fish.x = innerStartX + 15; fish.vx = 0.3; }
      if (fish.x > innerEndX - 15) { fish.x = innerEndX - 15; fish.vx = -0.3; }
    } 
    else {
      // Fish behavior
      let ax = 0, ay = 0;
      
      // 1. Schooling behavior (Cohesion & Alignment) - by exact species/imageKey
      let schoolX = 0, schoolY = 0;
      let alignVx = 0, alignVy = 0;
      let schoolCount = 0;
      
      // 2. Separation behavior - avoid clumping with ANY other fish
      let sepX = 0, sepY = 0;
      let sepCount = 0;
      
      state.fishes.forEach(other => {
        if (other === fish) return;
        
        const d = Math.hypot(other.x - fish.x, other.y - fish.y);
        
        // Separation (prevent overlap for all fishes)
        const minDistance = (fish.type === 'cherry' || other.type === 'cherry') ? 22 : 45;
        if (d < minDistance && d > 0) {
          sepX += (fish.x - other.x) / d;
          sepY += (fish.y - other.y) / d;
          sepCount++;
        }
        
        // Schooling (Cohesion & Alignment) - only same species
        const fishImgKey = fish.imageKey || (fish.type === 'neon' ? 'fish_2' : (fish.type === 'tamgiac' ? 'fish_4' : (fish.type === 'mun' ? 'fish_yellow_striped' : 'fish_2')));
        const otherImgKey = other.imageKey || (other.type === 'neon' ? 'fish_2' : (other.type === 'tamgiac' ? 'fish_4' : (other.type === 'mun' ? 'fish_yellow_striped' : 'fish_2')));
        if (fishImgKey === otherImgKey && fish.type !== 'cherry') {
          if (d < 140) {
            schoolX += other.x;
            schoolY += other.y;
            alignVx += other.vx;
            alignVy += other.vy;
            schoolCount++;
          }
        }
      });
      
      // Apply Cohesion & Alignment
      if (schoolCount > 0) {
        schoolX /= schoolCount;
        schoolY /= schoolCount;
        alignVx /= schoolCount;
        alignVy /= schoolCount;
        
        // Cohesion force
        ax += (schoolX - fish.x) * 0.003;
        ay += (schoolY - fish.y) * 0.003;
        
        // Alignment force
        ax += (alignVx - fish.vx) * 0.02;
        ay += (alignVy - fish.vy) * 0.02;
      }
      
      // Apply Separation
      if (sepCount > 0) {
        sepX /= sepCount;
        sepY /= sepCount;
        ax += sepX * 0.14;
        ay += sepY * 0.14;
      }
      
      // 3. Head to Food if available
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
      
      // 4. Random swimming force (momentum)
      if (Math.random() < 0.03) {
        ax += (Math.random() - 0.5) * 0.18;
        ay += (Math.random() - 0.5) * 0.09;
      }
      
      // Apply acceleration
      fish.vx += ax;
      fish.vy += ay;
      
      // Max speed clamp
      const speed = Math.hypot(fish.vx, fish.vy);
      const isNeon = fish.imageKey && (fish.imageKey === 'fish_2' || fish.imageKey === 'fish_3' || fish.imageKey === 'fish_17');
      const maxSpeed = (isNeon || fish.type === 'neon') ? 1.3 : 1.7;
      if (speed > maxSpeed) {
        fish.vx = (fish.vx / speed) * maxSpeed;
        fish.vy = (fish.vy / speed) * maxSpeed;
      }
      
      // Update position
      fish.x += fish.vx;
      fish.y += fish.vy;
      
      // Angle facing velocity
      fish.angle = Math.atan2(fish.vy, fish.vx);
      
      // Avoid borders (inner glass bounds)
      const borderForce = 0.15;
      if (fish.x < innerStartX + 20) fish.vx += borderForce;
      if (fish.x > innerEndX - 20) fish.vx -= borderForce;
      
      const segmentWidth = innerWidth / 40;
      const segIdx = Math.floor((fish.x - innerStartX) / segmentWidth);
      let substrateY = innerBottom - 20;
      if (segIdx >= 0 && segIdx < 40) {
        substrateY = innerBottom - (state.substrate.base[segIdx] || 0) - (state.substrate.soil[segIdx] || 0) - (state.substrate.sand[segIdx] || 0) - ((state.substrate.ground_blue && state.substrate.ground_blue[segIdx]) || 0) - ((state.substrate.ground_green && state.substrate.ground_green[segIdx]) || 0);
      }
      
      if (fish.y < waterTop + 20) fish.vy += borderForce;
      if (fish.y > substrateY - 15) fish.vy -= borderForce;

      // Hard clamp positions to keep them strictly inside the water bounds
      if (fish.x < innerStartX + 15) {
        fish.x = innerStartX + 15;
        if (fish.vx < 0) fish.vx = 0.2;
      }
      if (fish.x > innerEndX - 15) {
        fish.x = innerEndX - 15;
        if (fish.vx > 0) fish.vx = -0.2;
      }
      if (fish.y < waterTop + 15) {
        fish.y = waterTop + 15;
        if (fish.vy < 0) fish.vy = 0.2; // bounce back down
      }
      if (fish.y > substrateY - 12) {
        fish.y = substrateY - 12;
        if (fish.vy > 0) fish.vy = -0.2; // bounce back up
      }
    }
  });
}

// Helper to calculate the non-transparent bounding box of an image dynamically (crops out transparent borders)
function getImageBBox(img) {
  if (img._bbox) return img._bbox;
  try {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = img.width;
    tempCanvas.height = img.height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(img, 0, 0);
    const imgData = tempCtx.getImageData(0, 0, img.width, img.height);
    const data = imgData.data;
    
    let minX = img.width, minY = img.height, maxX = 0, maxY = 0;
    let hasAlpha = false;
    
    for (let y = 0; y < img.height; y++) {
      for (let x = 0; x < img.width; x++) {
        const idx = (y * img.width + x) * 4;
        const alpha = data[idx + 3];
        if (alpha > 5) {
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
          hasAlpha = true;
        }
      }
    }
    
    const bbox = hasAlpha ? {
      x: minX,
      y: minY,
      w: maxX - minX + 1,
      h: maxY - minY + 1
    } : {
      x: 0,
      y: 0,
      w: img.width,
      h: img.height
    };
    
    img._bbox = bbox;
    return bbox;
  } catch (e) {
    // Fallback if canvas reading fails (cors, etc.)
    return { x: 0, y: 0, w: img.width, h: img.height };
  }
}

// CANVAS DRAWINGS
function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  const dim = tankDims[state.tankSize];
  const startX = (canvas.width - dim.width) / 2;
  const endX = startX + dim.width;
  const bottom = canvas.height - 20;
  
  // Calculate inner glass area boundaries (mapping to old full tank frame style)
  const innerStartX = startX;
  const innerEndX = endX;
  const innerWidth = dim.width;
  const innerTop = dim.yOffset;
  const innerBottom = bottom;
  const innerHeight = innerBottom - innerTop;
  
  // 1. Draw Stand/Cabinet
  ctx.fillStyle = 'var(--aquarium-stand, #6d5c4c)';
  ctx.fillRect(startX - 20, bottom + 5, dim.width + 40, 20);
  ctx.fillStyle = '#2c221a';
  ctx.fillRect(startX - 30, bottom + 12, dim.width + 60, 4);
  // 2. Draw glass background tint (gradient fallback + pixel-art image matching active theme)
  const isNight = document.body.classList.contains('theme-dark');
  
  // Draw premium gradient background matching the active theme first
  let bgGrad = ctx.createLinearGradient(innerStartX, innerTop, innerStartX, innerBottom);
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
  ctx.fillRect(innerStartX, innerTop, innerWidth, innerHeight);

  // Layer the pixel-art background image if available (avoid using transparent checkerboard 'bg_default')
  let bgKey = 'bg_mavi';
  if (state.activeTheme === 'zen') bgKey = 'bg_purple';
  
  const bgImg = loadedImages[bgKey];
  if (bgImg) {
    ctx.save();
    ctx.imageSmoothingEnabled = false; // Prevent blurring of pixel art
    
    const bbox = getImageBBox(bgImg);
    
    if (bbox.w <= 64 && bbox.h <= 64) {
      // Tile small patterns
      const pattern = ctx.createPattern(bgImg, 'repeat');
      ctx.fillStyle = pattern;
      ctx.translate(innerStartX, innerTop);
      ctx.fillRect(0, 0, innerWidth, innerHeight);
    } else {
      // Draw cropped background stretched to cover the entire inner glass area
      ctx.drawImage(
        bgImg,
        bbox.x, bbox.y, bbox.w, bbox.h,
        innerStartX, innerTop, innerWidth, innerHeight
      );
    }
    ctx.restore();
  }
  
  // If night mode, draw a dark blue ambient overlay over the background
  if (isNight) {
    ctx.fillStyle = 'rgba(10, 20, 50, 0.45)';
    ctx.fillRect(innerStartX, innerTop, innerWidth, innerHeight);
  }
  
  // 3. Draw Substrate Layers (Draw inside inner glass boundaries)
  drawSubstrateCurve(ctx, innerStartX, innerBottom, innerWidth, 'base', materials.base.color);
  drawSubstrateCurve(ctx, innerStartX, innerBottom, innerWidth, 'soil', materials.soil.color);
  drawSubstrateCurve(ctx, innerStartX, innerBottom, innerWidth, 'sand', materials.sand.color);
  drawSubstrateCurve(ctx, innerStartX, innerBottom, innerWidth, 'ground_blue', materials.ground_blue.color);
  drawSubstrateCurve(ctx, innerStartX, innerBottom, innerWidth, 'ground_green', materials.ground_green.color);
  
  // Draw Theme Decors (like Coral Reef neon corals)
  drawThemeDecors(ctx, startX, endX, bottom, dim);
  
  // 4. Draw Hardscape (Stones and Driftwoods)
  state.hardscapes.forEach((hs, idx) => {
    const isSelected = idx === selectedHardscapeIndex && state.step === 3;
    drawHardscapeObject(ctx, hs, isSelected);
  });
  
  // 5. Draw Plants (Flora)
  state.plants.forEach((p, idx) => {
    const isSelected = idx === selectedPlantIndex && state.step === 4;
    drawPlantObject(ctx, p, isSelected);
  });
  
  // 6. Draw Equipments
  drawEquipments(ctx, startX, endX, bottom, dim.yOffset);
  
  // 7. Draw Water level (contained inside the inner glass box)
  if (state.waterLevel > 0.05) {
    const waterTop = innerTop + (1.0 - state.waterLevel) * (innerHeight - 10);
    ctx.fillStyle = 'rgba(128, 208, 235, 0.15)';
    ctx.fillRect(innerStartX, waterTop, innerWidth, innerBottom - waterTop);
    
    // Draw Water Line inside glass boundaries
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(innerStartX, waterTop);
    ctx.lineTo(innerEndX, waterTop);
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
  
  // 10. Algae glass blur overlay (restricted to inner glass)
  if (algaeLevel > 0.05) {
    ctx.fillStyle = `rgba(110, 160, 90, ${algaeLevel * 0.4})`;
    ctx.fillRect(innerStartX, innerTop, innerWidth, innerHeight);
  }
  
  // Glass reflection overlay (restricted to inner glass)
  const glassImg = loadedImages['glass_overlay'];
  if (glassImg) {
    ctx.save();
    ctx.globalAlpha = 0.45;
    ctx.drawImage(glassImg, innerStartX, innerTop, innerWidth, innerHeight);
    ctx.restore();
  }
  
  // 11. Draw Tank glass outline (old style)
  ctx.strokeStyle = 'var(--aquarium-border, #4A3F35)';
  ctx.lineWidth = 4;
  ctx.strokeRect(startX, dim.yOffset, dim.width, bottom - dim.yOffset);
}

// Substrate Drawer
function drawSubstrateCurve(ctx, startX, bottom, width, type, color) {
  const heights = state.substrate[type];
  if (isEmptyArray(heights)) return;
  
  const colWidth = width / 40;
  
  let patternImg = null;
  if (type === 'base') patternImg = loadedImages['ground_mushroom'];
  else if (type === 'soil') patternImg = loadedImages['ground_green'];
  else if (type === 'sand') patternImg = loadedImages['ground_orange'] || loadedImages['ground_blue'] || loadedImages['ground_pink'];
  else if (type === 'ground_blue') patternImg = loadedImages['ground_blue'];
  else if (type === 'ground_green') patternImg = loadedImages['ground_green'];
  
  if (patternImg && patternImg.complete && patternImg.naturalWidth > 0) {
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    
    // Apply soft, natural color filters to tone down the harsh neon colors
    if (type === 'base') {
      ctx.filter = 'saturate(0.5) brightness(0.6) sepia(0.2)';
    } else if (type === 'soil') {
      ctx.filter = 'saturate(0.1) brightness(0.35) contrast(1.1)';
    } else if (type === 'sand') {
      ctx.filter = 'saturate(0.4) brightness(0.95) sepia(0.35) contrast(0.95)';
    } else if (type === 'ground_blue') {
      // Keep blue sand cheerful and vibrant
      ctx.filter = 'saturate(0.85) brightness(0.85) contrast(1.05)';
    } else if (type === 'ground_green') {
      // Keep green mossy soil vibrant and algae-like
      ctx.filter = 'saturate(0.8) brightness(0.8) contrast(1.1)';
    }
    
    // Bounding box of the active ground region in the 400x300 sprite:
    // x = 40, y = 212, w = 320, h = 64
    const srcXStart = 40;
    const srcYStart = 212;
    const srcWidth = 320;
    const srcHeight = 64;
    const sh_surface = 36; // The top 36px contains the grass/wavy ripples
    
    for (let i = 0; i < 40; i++) {
      const h_current = heights[i] || 0;
      if (h_current <= 0) continue;
      
      let h_below = 0;
      if (type === 'soil') {
        h_below = state.substrate.base[i] || 0;
      } else if (type === 'sand') {
        h_below = (state.substrate.base[i] || 0) + (state.substrate.soil[i] || 0);
      } else if (type === 'ground_blue') {
        h_below = (state.substrate.base[i] || 0) + (state.substrate.soil[i] || 0) + (state.substrate.sand[i] || 0);
      } else if (type === 'ground_green') {
        h_below = (state.substrate.base[i] || 0) + (state.substrate.soil[i] || 0) + (state.substrate.sand[i] || 0) + ((state.substrate.ground_blue && state.substrate.ground_blue[i]) || 0);
      }
      
      const x1 = Math.floor(startX + i * colWidth);
      const x2 = Math.floor(startX + (i + 1) * colWidth);
      const dw = x2 - x1;
      
      const yStart = Math.floor(bottom - h_below - h_current);
      const yEnd = Math.floor(bottom - h_below);
      const dh_total = yEnd - yStart;
      
      if (dh_total <= 0) continue;
      
      // Source X matching the segment index i (0 to 39) mapped to 320px
      const sx = srcXStart + i * (srcWidth / 40);
      const sw = srcWidth / 40;
      
      if (dh_total < sh_surface) {
        // Draw only the top surface cropped to the height of the column
        ctx.drawImage(
          patternImg,
          sx, srcYStart, sw, dh_total,
          x1, yStart, dw, dh_total
        );
      } else {
        // 1. Draw top surface (fixed sh_surface height)
        ctx.drawImage(
          patternImg,
          sx, srcYStart, sw, sh_surface,
          x1, yStart, dw, sh_surface
        );
        // 2. Draw body (stretched to fill the rest of the column)
        ctx.drawImage(
          patternImg,
          sx, srcYStart + sh_surface, sw, srcHeight - sh_surface,
          x1, yStart + sh_surface, dw, dh_total - sh_surface
        );
      }
    }
    ctx.restore();
  } else {
    // Fallback: draw smooth vector curve if image is not loaded yet
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(startX, bottom);
    for (let i = 0; i <= 40; i++) {
      const x = startX + i * colWidth;
      let yHeight = 0;
      if (type === 'base') {
        yHeight = heights[Math.min(39, i)] || 0;
      } else if (type === 'soil') {
        yHeight = (state.substrate.base[Math.min(39, i)] || 0) + (heights[Math.min(39, i)] || 0);
      } else if (type === 'sand') {
        yHeight = (state.substrate.base[Math.min(39, i)] || 0) + (state.substrate.soil[Math.min(39, i)] || 0) + (heights[Math.min(39, i)] || 0);
      } else if (type === 'ground_blue') {
        yHeight = (state.substrate.base[Math.min(39, i)] || 0) + (state.substrate.soil[Math.min(39, i)] || 0) + (state.substrate.sand[Math.min(39, i)] || 0) + (heights[Math.min(39, i)] || 0);
      } else if (type === 'ground_green') {
        yHeight = (state.substrate.base[Math.min(39, i)] || 0) + (state.substrate.soil[Math.min(39, i)] || 0) + (state.substrate.sand[Math.min(39, i)] || 0) + ((state.substrate.ground_blue && state.substrate.ground_blue[Math.min(39, i)]) || 0) + (heights[Math.min(39, i)] || 0);
      }
      ctx.lineTo(x, bottom - yHeight);
    }
    ctx.lineTo(startX + width, bottom);
    ctx.closePath();
    ctx.fill();
    
    // Draw granule textures (little dots)
    ctx.fillStyle = type === 'sand' ? '#d8ae62' : (type === 'base' ? '#6e513d' : (type === 'ground_blue' ? '#0d47a1' : (type === 'ground_green' ? '#1b5e20' : '#1a1512')));
    for (let i = 0; i < 40; i += 2) {
      const x = startX + i * colWidth + Math.random() * 5;
      let yHeight = state.substrate.base[i] || 0;
      if (type === 'soil') yHeight += state.substrate.soil[i] || 0;
      if (type === 'sand') yHeight += (state.substrate.soil[i] || 0) + (state.substrate.sand[i] || 0);
      if (type === 'ground_blue') yHeight += (state.substrate.soil[i] || 0) + (state.substrate.sand[i] || 0) + ((state.substrate.ground_blue && state.substrate.ground_blue[i]) || 0);
      if (type === 'ground_green') yHeight += (state.substrate.soil[i] || 0) + (state.substrate.sand[i] || 0) + ((state.substrate.ground_blue && state.substrate.ground_blue[i]) || 0) + ((state.substrate.ground_green && state.substrate.ground_green[i]) || 0);
      
      ctx.beginPath();
      ctx.arc(x, bottom - yHeight + 4, 1.5, 0, Math.PI*2);
      ctx.fill();
    }
  }
}


// Hardscape Drawer
function drawHardscapeObject(ctx, hs, isSelected) {
  const item = hardscapeItems[hs.type];
  if (!item) return;
  
  const img = loadedImages[item.imageKey];
  if (!img || !img.complete || img.naturalWidth === 0) return; // Wait until loaded
  
  ctx.save();
  ctx.translate(hs.x, hs.y);
  ctx.rotate(hs.rotation);
  ctx.scale(hs.scale * HARDSCAPE_BASE_SCALE, hs.scale * HARDSCAPE_BASE_SCALE);
  
  ctx.imageSmoothingEnabled = false;
  
  const bbox = (hs.type === 'helmet' || hs.type === 'leaning_bonsai') ? getImageBBox(img) : item.bbox;
  
  let drawW = bbox.w;
  let drawH = bbox.h;
  if (hs.type === 'helmet' || hs.type === 'leaning_bonsai') {
    const targetW = item.bbox.w;
    const targetH = item.bbox.h;
    const ratio = Math.min(targetW / bbox.w, targetH / bbox.h);
    drawW = bbox.w * ratio;
    drawH = bbox.h * ratio;
  }
  
  // Draw the cropped pixel-art sprite centered horizontally, sitting exactly on the baseline
  ctx.drawImage(
    img,
    bbox.x, bbox.y, bbox.w, bbox.h,
    -drawW / 2, -drawH, drawW, drawH
  );
  
  // Selection box outline if active tool is hardscape and clicked
  if (isSelected) {
    ctx.strokeStyle = 'var(--color-primary, #5a8df3)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(-drawW / 2, -drawH, drawW, drawH);
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
function drawPlantObject(ctx, p, isSelected) {
  const item = floraItems[p.type];
  if (!item) return;
  
  const imgKey = item.imageKey;
  const plantImg = loadedImages[imgKey];
  
  if (plantImg && plantImg.complete && plantImg.naturalWidth > 0) {
    ctx.save();
    ctx.translate(p.x, p.y);
    
    // Sine sway physics based on water current
    const currentStrength = state.equipment.filter ? 1.0 : 0.25;
    const sway = Math.sin(time * 1.5 + p.x * 0.02) * 0.06 * currentStrength;
    ctx.rotate(sway);
    
    ctx.imageSmoothingEnabled = false;
    
    const size = (p.size || 1.0) * PLANT_BASE_SCALE;
    const w = item.baseW * size;
    const h = item.baseH * size;
    const bbox = item.bbox;
    
    // Draw cropped plant centered horizontally, sitting on baseline
    ctx.drawImage(
      plantImg,
      bbox.x, bbox.y, bbox.w, bbox.h,
      -w / 2, -h, w, h
    );
    
    // Draw selection box outline if active tool is plant and clicked
    if (isSelected) {
      ctx.strokeStyle = 'var(--color-primary, #5a8df3)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(-w / 2, -h, w, h);
      ctx.setLineDash([]);
      
      // Draw small anchor ring
      ctx.fillStyle = 'var(--color-primary)';
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI*2);
      ctx.fill();
    }
    
    ctx.restore();
    return;
  }
  
  // Fallback vector drawing if image failed to load
  ctx.save();
  ctx.translate(p.x, p.y);
  
  const currentStrength = state.equipment.filter ? 1.0 : 0.25;
  const sway = Math.sin(time * 1.5 + p.x * 0.02) * 4 * currentStrength * (p.size || 1.0);
  
  // Map vector colors
  let color = '#3a722e';
  let isTall = false;
  let isBushy = false;
  
  if (imgKey === 'plant_20') { color = '#cc4d4d'; isTall = true; }
  else if (imgKey === 'plant_2') { color = '#68b85c'; }
  else if (imgKey === 'plant_11') { color = '#2d6d35'; isBushy = true; }
  else if (imgKey === 'plant_15' || imgKey === 'plant_17') { color = '#448c4e'; isBushy = true; }
  else if (imgKey === 'plant_3') { color = '#55a045'; isBushy = true; }
  else if (imgKey === 'plant_4') { color = '#348e3e'; isTall = true; }
  else if (imgKey === 'plant_7') { color = '#2c7333'; isTall = true; }
  else if (imgKey === 'plant_19' || imgKey === 'plant_18') { color = '#8cb83a'; isBushy = true; }
  
  const size = (p.size || 1.0) * 2.0 * PLANT_BASE_SCALE;
  
  if (isTall) {
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, 5);
    ctx.quadraticCurveTo(sway * 0.8, -40, sway * 1.2, -80 * size);
    ctx.stroke();
    
    // Leaves
    const leafNodes = 6;
    for (let i = 1; i <= leafNodes; i++) {
      const pct = i / leafNodes;
      const nodeY = -80 * size * pct;
      const nodeX = sway * 1.2 * pct;
      ctx.beginPath();
      ctx.arc(nodeX - 5, nodeY, 4 * size, 0, Math.PI*2);
      ctx.arc(nodeX + 5, nodeY, 4 * size, 0, Math.PI*2);
      ctx.fill();
    }
  } 
  else if (isBushy) {
    ctx.fillStyle = color;
    ctx.strokeStyle = '#1a3c1c';
    ctx.lineWidth = 1.5;
    
    ctx.beginPath();
    ctx.moveTo(0, 5);
    ctx.quadraticCurveTo(sway * 1.2, -15, sway * 1.5, -45 * size);
    ctx.stroke();
    
    ctx.save();
    ctx.translate(sway * 1.2, -20);
    ctx.beginPath();
    ctx.ellipse(0, 0, 8 * size, 18 * size, sway * 0.05, 0, Math.PI*2);
    ctx.ellipse(-10 * size, -10, 6 * size, 12 * size, -Math.PI/6, 0, Math.PI*2);
    ctx.ellipse(10 * size, -10, 6 * size, 12 * size, Math.PI/6, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  } 
  else {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, 0, 16 * size, 0, Math.PI * 2);
    ctx.arc(12, -4, 10 * size, 0, Math.PI * 2);
    ctx.arc(-12, -2, 11 * size, 0, Math.PI * 2);
    ctx.fill();
  }
  
  ctx.restore();
}

// Equipments visuals drawer
function drawEquipments(ctx, startX, endX, bottom, yOffset) {
  const dim = tankDims[state.tankSize];
  const innerStartX = startX;
  const innerEndX = endX;
  const innerTop = yOffset;
  const innerBottom = bottom;

  // Canister Filter pipes (attached to inner rim)
  if (state.equipment.filter) {
    ctx.strokeStyle = 'rgba(100, 150, 100, 0.6)';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    
    // Inlet pipe (left bottom, hanging inside the inner glass)
    ctx.beginPath();
    ctx.moveTo(innerStartX + 15, innerTop - 10);
    ctx.lineTo(innerStartX + 15, innerBottom - 40);
    ctx.stroke();
    
    // Outlet pipe (right top, blowing water inside)
    ctx.beginPath();
    ctx.moveTo(innerEndX - 15, innerTop - 10);
    ctx.lineTo(innerEndX - 15, innerTop + 20);
    ctx.lineTo(innerEndX - 35, innerTop + 20);
    ctx.stroke();
  }
  
  // LED Lights (stands on the inner glass left and right rim)
  if (state.equipment.light) {
    ctx.fillStyle = '#bbb';
    ctx.fillRect(innerStartX, innerTop - 16, innerEndX - innerStartX, 8);
    // Stand legs
    ctx.fillStyle = '#888';
    ctx.fillRect(innerStartX - 4, innerTop - 16, 8, 20);
    ctx.fillRect(innerEndX - 4, innerTop - 16, 8, 20);
  }
  
  // CO2 Diffuser (attached to the inner right glass)
  if (state.equipment.co2) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(innerEndX - 25, innerTop + 30);
    ctx.lineTo(innerEndX - 25, innerBottom - 30);
    ctx.stroke();
    
    // Diffuser cup at bottom-right
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.arc(innerEndX - 25, innerBottom - 25, 8, 0, Math.PI, true);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  
  // Cooling Fan (mounted on the left rim of inner glass)
  if (state.equipment.fan) {
    ctx.save();
    ctx.translate(innerStartX + 40, innerTop - 12);
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
  const bubImg = loadedImages['bubble_normal'] || loadedImages['bubble_food'];
  waterParticles.forEach(p => {
    if (bubImg) {
      ctx.drawImage(bubImg, p.x - p.size, p.y - p.size, p.size * 2, p.size * 2);
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
      ctx.fill();
    }
  });
  
  // 2. CO2 Bubbles
  co2Bubbles.forEach(b => {
    if (bubImg) {
      ctx.drawImage(bubImg, b.x - b.size, b.y - b.size, b.size * 2, b.size * 2);
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.size, 0, Math.PI*2);
      ctx.fill();
    }
  });
  
  // 3. Bacteria droplets
  ctx.fillStyle = 'rgba(100, 200, 255, 0.8)';
  waterDroplets.forEach(d => {
    ctx.beginPath();
    ctx.arc(d.x, d.y, d.size, 0, Math.PI*2);
    ctx.fill();
  });
  
  // 4. Fish Food
  const foodImg = loadedImages['food'];
  fishFood.forEach(f => {
    if (foodImg) {
      ctx.drawImage(foodImg, f.x - 4, f.y - 4, 8, 8);
    } else {
      ctx.fillStyle = '#b77341';
      ctx.beginPath();
      ctx.arc(f.x, f.y, 2.2, 0, Math.PI*2);
      ctx.fill();
    }
  });
}

// Fauna Object Drawer
function drawFaunaObject(ctx, f) {
  let imgKey = f.imageKey;
  if (!imgKey) {
    // Fallback mapping
    if (f.type === 'neon') imgKey = 'fish_2';
    else if (f.type === 'tamgiac') imgKey = 'fish_4';
    else if (f.type === 'mun') imgKey = 'fish_yellow_striped';
    else if (f.type === 'cherry') imgKey = 'fish_8';
    else imgKey = 'fish_2';
  }
  
  const fishImg = loadedImages[imgKey];
  if (fishImg) {
    ctx.save();
    ctx.translate(f.x, f.y);
    
    // Swimming direction rotation and flipping
    ctx.rotate(f.angle + (f.vx < 0 ? Math.PI : 0));
    ctx.scale(f.vx < 0 ? -1 : 1, 1);
    
    // Add wagging rotation
    const wag = Math.sin(time * 3 + f.x * 0.05) * 0.15;
    ctx.rotate(wag);
    
    // Cherry shrimp looks better smaller/slender, standard fish standard size
    let w = f.size * 2.2;
    let h = f.size * 1.1;
    if (f.type === 'cherry' || imgKey === 'fish_8') {
      w = f.size * 1.8;
      h = f.size * 0.9;
    }
    
    ctx.drawImage(fishImg, -w/2, -h/2, w, h);
    ctx.restore();
    return;
  }
  
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
    else {
      // Default orange/gold generic fish for slot machine fishes when images fail to load
      ctx.fillStyle = '#ff9100';
      ctx.beginPath();
      ctx.ellipse(0, 0, 12, 7, 0, 0, Math.PI*2);
      ctx.fill();
      
      // Eye
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(5, -2, 1.2, 0, Math.PI*2);
      ctx.fill();
      
      // Fin
      ctx.fillStyle = '#ff3d00';
      ctx.beginPath();
      ctx.ellipse(-2, -4, 4, 2, -Math.PI/6, 0, Math.PI*2);
      ctx.fill();
      
      // Wagging tail
      ctx.save();
      ctx.translate(-12, 0);
      ctx.rotate(wag);
      ctx.fillStyle = '#d50000';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-6, -5);
      ctx.lineTo(-3, 0);
      ctx.lineTo(-6, 5);
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

