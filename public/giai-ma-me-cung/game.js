// --- Questions Bank (30 riddles with 4 multiple-choice options) ---
const questionBank = [
  {
    question: "Cái gì tuy ăn được nhưng bạn không thể ăn vào bữa tối?",
    options: ["Bánh mì kẹp thịt", "Bữa sáng và bữa trưa", "Quả táo chín đỏ", "Cơm rang dưa bò"],
    answer: 1
  },
  {
    question: "Chỉ tăng mà không giảm, đó là gì?",
    options: ["Chiều cao cơ thể", "Nhiệt độ ngoài trời", "Tuổi tác", "Giá xăng dầu"],
    answer: 2
  },
  {
    question: "Bạn tưởng tượng mình giữa đàn cá mập trên thuyền thủng. Cách đơn giản nhất để thoát ra?",
    options: ["Nhảy xuống nước bơi thật nhanh", "Vá thuyền bằng kẹo cao su", "Ngừng tưởng tượng", "Kêu cứu người trên bờ"],
    answer: 2
  },
  {
    question: "Từ gì mà ai cũng phải phát âm sai?",
    options: ["Từ 'Sai'", "Từ 'Khó'", "Từ 'Ngắn'", "Từ 'Tròn'"],
    answer: 0
  },
  {
    question: "Tôi mong manh đến nỗi nếu bạn mở miệng gọi tên tôi, bạn sẽ giết chết tôi. Tôi là gì?",
    options: ["Bong bóng xà phòng", "Sương mù", "Sự im lặng", "Tiếng thở dài"],
    answer: 2
  },
  {
    question: "Một thợ điện ngã từ cầu thang cao 20 mét nhưng không hề bị thương. Vì sao?",
    options: ["Anh ấy có siêu năng lực", "Anh ấy rơi trúng đệm hơi", "Anh ấy ngã từ bậc dưới cùng", "Anh ấy có dây bảo hiểm"],
    answer: 2
  },
  {
    question: "Làm cách nào để bạn có thể thức 7 ngày liền mà không buồn ngủ?",
    options: ["Uống thật nhiều cà phê", "Ngủ vào ban đêm", "Chơi game liên tục", "Uống nước tăng lực"],
    answer: 1
  },
  {
    question: "Cái gì chắc chắn luôn xuất hiện ở cuối cầu vồng?",
    options: ["Hũ vàng của yêu tinh", "Mặt đất", "Chữ 'G'", "Những giọt mưa"],
    answer: 2
  },
  {
    question: "Cây gì không thể cao lên mà chỉ có thể thấp đi?",
    options: ["Cây tre non", "Cây nến (hoặc bút chì)", "Cây chuối cảnh", "Cây cỏ ngọt"],
    answer: 1
  },
  {
    question: "Cái gì xuất hiện một lần trong tháng nhưng lại không xuất hiện lần nào trong năm?",
    options: ["Ngày rằm", "Kỳ lĩnh lương", "Chữ 'T'", "Ngày 31"],
    answer: 2
  },
  {
    question: "Xe tải 10 tấn chở 2.1 tấn hàng đi qua cầu chịu tải tối đa 12 tấn. Tài xế qua cầu thế nào?",
    options: ["Bác tài xế đi bộ qua cầu", "Lái xe thật nhanh qua cầu", "Bơm căng lốp xe để giảm xóc", "Chờ ban đêm rồi đi qua"],
    answer: 0
  },
  {
    question: "Nhờ tôi, bạn có thể nhìn xuyên qua các bức tường. Tôi là gì?",
    options: ["Chiếc kính hiển vi", "Cửa sổ", "Kính thiên văn", "Bức ảnh chụp"],
    answer: 1
  },
  {
    question: "Cái gì có thể giữ mà không cần chạm vào?",
    options: ["Không khí", "Hơi thở (hoặc lời hứa)", "Ánh nắng mặt trời", "Dòng nước chảy"],
    answer: 1
  },
  {
    question: "Đâu là danh sách 10 bộ phận cơ thể người bắt đầu bằng chữ 'T' và chỉ có một từ?",
    options: [
      "Tim, Tai, Tóc, Tay, Trán, Thận, Tủy, Trĩ, Táo, Tơ",
      "Tim, Thận, Gan, Phổi, Tóc, Tai, Tay, Trán, Tủy, Trĩ",
      "Tim, Tai, Tóc, Tay, Trán, Thận, Tủy, Trĩ, Tì, Tinh",
      "Tim, Phổi, Ruột, Dạ dày, Tay, Chân, Tóc, Tai, Tay, Trán"
    ],
    answer: 2
  },
  {
    question: "Tôi nhẹ tựa lông hồng, nhưng người khỏe nhất không thể giữ tôi quá 10 phút. Tôi là gì?",
    options: ["Một cốc nước lọc", "Sợi chỉ nhỏ", "Hơi thở", "Quả bóng bay"],
    answer: 2
  },
  {
    question: "Người đàn ông đi mưa không ô áo mưa trùm đầu, quần áo ướt sũng nhưng không sợi tóc nào ướt. Vì sao?",
    options: ["Trời mưa quá nhỏ", "Tóc ông ta làm bằng nhựa", "Ông ta bị hói đầu", "Ông ta chạy rất nhanh"],
    answer: 2
  },
  {
    question: "Cái gì bạn có thể tạo ra nhưng không một ai (kể cả bạn) nhìn thấy?",
    options: ["Tiếng động / Tiếng nói", "Nước mắt", "Lửa nóng", "Mùi hương"],
    answer: 0
  },
  {
    question: "Cái gì có thể to bằng hoặc hơn cả một con voi nhưng không hề nặng chút nào?",
    options: ["Quả bong bóng hình voi", "Cái bóng của con voi", "Đám mây hình voi", "Bộ xương con voi"],
    answer: 1
  },
  {
    question: "Trò chơi có hai người đấu với nhau và chỉ có thể kết thúc khi có người ra được nước?",
    options: ["Chèo thuyền", "Cờ tướng / Cờ vua", "Bơi lội", "Đấu vật dưới nước"],
    answer: 1
  },
  {
    question: "Nóng và lạnh, cái nào chạy nhanh hơn?",
    options: ["Lạnh (vì lạnh buốt chạy nhanh)", "Nóng (vì nóng nở ra còn lạnh co lại, nên nóng lan truyền nhanh hơn)", "Cả hai chạy bằng nhau", "Không cái nào biết chạy"],
    answer: 1
  },
  {
    question: "Cái gì có cổ nhưng không có đầu?",
    options: ["Con hươu cao cổ", "Cái chai (hoặc cái áo)", "Con giun", "Cái bàn gỗ"],
    answer: 1
  },
  {
    question: "Cái gì có răng nhưng không biết nhai?",
    options: ["Con chó con", "Cái lược", "Con cá sấu", "Máy xay sinh tố"],
    answer: 1
  },
  {
    question: "Cái gì đi nằm, đứng nằm, nằm lại đứng?",
    options: ["Cái bóng", "Bàn chân", "Cái kính", "Cái đồng hồ"],
    answer: 1
  },
  {
    question: "Con gì đập thì sống, không đập thì chết?",
    options: ["Con tim", "Con cá", "Con ruồi", "Con muỗi"],
    answer: 0
  },
  {
    question: "Lịch nào dài nhất?",
    options: ["Lịch vạn niên", "Lịch lịch sử", "Lịch treo tường", "Lịch âm dương"],
    answer: 1
  },
  {
    question: "Xã nào đông dân nhất?",
    options: ["Xã hội", "Xã đàn", "Xã tắc", "Xã hội chủ nghĩa"],
    answer: 0
  },
  {
    question: "Bỏ ngoài nướng trong, ăn ngoài bỏ trong là gì?",
    options: ["Cây mía", "Bắp ngô", "Củ sắn", "Quả dừa"],
    answer: 1
  },
  {
    question: "Con đường nào ngắn nhất?",
    options: ["Đường đi lối tắt", "Đường sữa", "Đường cao tốc", "Đường hàng không"],
    answer: 1
  },
  {
    question: "Quần gì rộng nhất?",
    options: ["Quần ống sớ", "Quần đảo", "Quần jean", "Quần đùi"],
    answer: 1
  },
  {
    question: "Con cá nào không biết bơi?",
    options: ["Cá voi", "Cá gỗ (hoặc cá kho, cá chết)", "Cá chuồn", "Cá đuối"],
    answer: 1
  },
  {
    question: "Con gì đầu dê mình ốc?",
    options: ["Con dê núi", "Con dốc", "Con ốc sên", "Con sên trần"],
    answer: 1
  },
  {
    question: "Cái gì bằng cái vung, vùng xuống ao, đào không thấy, lấy không được?",
    options: ["Cái lá sen", "Bóng mặt trăng", "Bọt nước", "Hạt mưa sa"],
    answer: 1
  },
  {
    question: "Đầu đuôi vuông vắn như nhau, thân chia nhiều đốt rất mau rất đều. Giúp người học tập sớm chiều có nhau?",
    options: ["Cái bút chì", "Thước kẻ", "Vở bài tập", "Hộp bút màu"],
    answer: 1
  },
  {
    question: "Mặt thì vuông vức, tai thì không có. Miệng rộng bao la, nuốt người rồi lại nhả ra?",
    options: ["Thang máy", "Ngôi nhà", "Chiếc tủ", "Tàu hỏa"],
    answer: 1
  },
  {
    question: "Con gì đuôi ngắn tai dài, mắt hồng lông mượt, có tài chạy nhanh?",
    options: ["Con sóc", "Con chuột túi", "Con thỏ", "Con chuột lang"],
    answer: 2
  },
  {
    question: "Bốn cột trụ trời, quả đồi di động. Cái vòi nghẹo nghễ, cái đuôi ngoe nguẩy?",
    options: ["Con voi", "Con trâu nước", "Con hươu cao cổ", "Con tê giác"],
    answer: 0
  },
  {
    question: "Càng lau càng bẩn là cái gì?",
    options: ["Cái chổi quét nhà", "Cái khăn lau bảng", "Cái giẻ lau tay", "Khăn rửa mặt"],
    answer: 1
  },
  {
    question: "Cái gì tay trái cầm được mà tay phải không cầm được?",
    options: ["Cổ tay trái", "Khuỷu tay trái", "Khuỷu tay phải / Cổ tay phải", "Điện thoại di động"],
    answer: 2
  },
  {
    question: "Bố mẹ có sáu người con trai, mỗi người con trai có một người em gái. Hỏi gia đình có mấy con?",
    options: ["7 người con", "8 người con", "12 người con", "14 người con"],
    answer: 0
  },
  {
    question: "Một đàn chim đậu trên cành, thợ săn bắn chết một con. Hỏi trên cành còn mấy con?",
    options: ["Còn lại các con khác", "Còn đúng 0 con", "Còn 9 con", "Còn 1 con"],
    answer: 1
  },
  {
    question: "Gặp đười ươi rất hung dữ trong rừng sâu, trong tay có 2 con dao. Làm sao để thoát?",
    options: ["Ném 2 con dao xuống đất cho đười ươi tự đâm ngực", "Chạy trốn thật nhanh", "Trèo lên cây cao", "Nằm giả chết"],
    answer: 0
  },
  {
    question: "Quả gì không học mà đỗ?",
    options: ["Quả bí ngô", "Quả đỗ (quả đậu)", "Quả sung", "Quả lê rừng"],
    answer: 1
  },
  {
    question: "Con đường nào mà chỉ có xe chạy chứ không bao giờ có người đi bộ?",
    options: ["Đường cao tốc", "Đường ray xe lửa", "Đường hàng không", "Đường sông"],
    answer: 1
  },
  {
    question: "Con mèo nào cực kỳ sợ chuột?",
    options: ["Mèo Kitty", "Mèo Tom", "Mèo máy Doraemon", "Mèo đen mun"],
    answer: 2
  },
  {
    question: "Sông nào có tên vừa ngọt ngào vừa chua chát?",
    options: ["Sông Cam Lộ", "Sông Hồng Hà", "Sông Cửu Long", "Sông Lam"],
    answer: 0
  },
  {
    question: "Cái gì chứa nhiều sông hồ nước nôi nhất mà lại luôn khô ráo?",
    options: ["Đám mây mùa hạ", "Bản đồ", "Quả dưa hấu lớn", "Thủy cung"],
    answer: 1
  },
  {
    question: "Con gì sinh ra đã có râu như cụ già lớn tuổi?",
    options: ["Con dê", "Con khỉ vàng", "Con rùa biển", "Con mèo mun"],
    answer: 0
  },
  {
    question: "Loại hạt nào mắt thấy tai nghe nhưng không bao giờ ăn được?",
    options: ["Hạt hướng dương chín", "Hạt mưa", "Hạt bụi lơ lửng", "Hạt cát trắng"],
    answer: 1
  },
  {
    question: "Vua nào thưở nhỏ chăn trâu, lấy bông lau làm cờ tập trận giả?",
    options: ["Vua Lê Lợi", "Vua Đinh Bộ Lĩnh", "Vua Quang Trung", "Trần Hưng Đạo"],
    answer: 1
  },
  {
    question: "Con chim nào có kích thước lớn nhất hành tinh hiện nay?",
    options: ["Đại bàng đầu hói", "Đà điểu Châu Phi", "Chim ưng lửa", "Chim hải âu khổng lồ"],
    answer: 1
  },
  {
    question: "Cánh gì không biết bay, chỉ đứng yên một chỗ che mưa nắng cho nhà?",
    options: ["Cánh quạt trần", "Cánh diều giấy", "Cánh buồm lớn", "Cánh cửa"],
    answer: 3
  },
  {
    question: "Trái gì lúc nhỏ màu xanh, chín màu vàng đỏ nhạt, hạt như ngọc hồng mọng nước?",
    options: ["Quả thanh long", "Quả lựu", "Quả dâu tây ngọt", "Quả chôm chôm"],
    answer: 1
  },
  {
    question: "Hoa gì chỉ nở âm thầm vào đêm khuya, tỏa hương và rụng lúc ban sáng?",
    options: ["Hoa hồng nhung", "Hoa cúc vàng", "Hoa quỳnh", "Hoa hướng dương"],
    answer: 2
  },
  {
    question: "Cái gì mà bạn càng lấy đi nhiều từ nó thì nó lại càng phình to ra?",
    options: ["Cây tre non", "Cái hố cát", "Đám mây đen", "Quả bóng bay"],
    answer: 1
  },
  {
    question: "Con gì sáng đi bằng 4 chân, trưa đi bằng 2 chân, chiều đi bằng 3 chân?",
    options: ["Con vượn cổ", "Con chó săn", "Con người", "Con gấu nâu"],
    answer: 2
  },
  {
    question: "Cây gì có hoa mà không có lá, có quả tròn mà không bao giờ có hạt?",
    options: ["Cây xương rồng", "Cây nấm mối", "Cây cột điện", "Cây hoa đá"],
    answer: 2
  },
  {
    question: "Cái gì đi vòng quanh thế giới rộng lớn mà vẫn đứng nguyên ở một góc nhỏ?",
    options: ["Bức ảnh kỷ niệm", "Con tem thư", "Bản đồ thế giới", "Vệ tinh nhân tạo"],
    answer: 1
  },
  {
    question: "Tôi chứa đựng tất cả các từ ngữ thế gian, nhưng tôi không biết nói. Tôi là gì?",
    options: ["Cuốn từ điển", "Quyển vở nháp", "Bức thư tình", "Tờ báo sáng"],
    answer: 0
  },
  {
    question: "Tháng nào trong năm dương lịch có 28 ngày?",
    options: ["Chỉ có tháng 2", "Tất cả 12 tháng", "Tháng 2 năm nhuận", "Tháng Chạp"],
    answer: 1
  },
  {
    question: "Cá gì có hai mắt nhưng không vảy, sống trên cạn và có thể biết hát?",
    options: ["Cá nhân (con người)", "Cá voi xanh", "Cá chép vàng", "Cá ngựa biển"],
    answer: 0
  }
];

// --- State Variables ---
let grid = [];
let gridSize = 101; // Doubled from 51 to 101 to increase difficulty and scale
let shapeType = "square";
let startCell = null;
let endCell = null;
let playerPath = [];
let isDragging = false;
let lastDraggedCell = null;
let gates = []; // Array of { r, c, riddle, solved: false }
let activeGate = null;
let lives = 5;
let score = 0;
let soundMuted = false;
let audioCtx = null;
let canvas, ctx;
let usedRiddles = [];

// Chest placement states (randomly allocated at end-game)
let chestStates = {}; // e.g. {1: 'gold', 2: 'silver', 3: 'poison', 4: 'poison', 5: 'poison'}

// --- Shape Definitions (Mask functions returning true if cell is inside boundary) ---
function isInsideShape(r, c, type) {
  // Convert coordinate to float space (-1.0 to 1.0)
  const cx = (c - (gridSize - 1) / 2) / ((gridSize - 1) / 2);
  const cy = (((gridSize - 1) / 2) - r) / ((gridSize - 1) / 2); // invert y for math standard
  
  const dist = Math.sqrt(cx * cx + cy * cy);

  switch (type) {
    case "square":
      return Math.abs(cx) <= 0.95 && Math.abs(cy) <= 0.95;

    case "rectangle":
      return Math.abs(cx) <= 0.95 && Math.abs(cy) <= 0.75;

    case "circle":
      return dist <= 0.95;

    case "moon":
      // Main circle minus subtracting circle shifted to the right
      const inMainCircle = dist <= 0.95;
      const subCx = cx - 0.45;
      const subCy = cy;
      const inSubCircle = Math.sqrt(subCx * subCx + subCy * subCy) <= 0.75;
      return inMainCircle && !inSubCircle;

    case "heart":
      // (x^2 + y^2 - 1)^3 - x^2 * y^3 < 0
      const x = cx * 1.15;
      const y = cy * 1.15 + 0.15; // slightly shifted up
      const a = x * x + y * y - 1.0;
      return (a * a * a - x * x * y * y * y) < 0.0;

    case "star": {
      // 5-pointed star formula in polar coordinates
      const angle = Math.atan2(cy, cx);
      const k = 5;
      // standard radius variation
      const rLimit = 0.55 + 0.4 * Math.cos(k * angle - Math.PI / 2);
      return dist <= rLimit;
    }

    case "triangle":
      // Triangle pointing up
      return cy >= -0.85 && cy <= 0.85 && Math.abs(cx) <= (0.85 - cy) * 0.58;

    case "diamond":
      return (Math.abs(cx) + Math.abs(cy)) <= 0.95;

    case "cross":
      return (Math.abs(cx) <= 0.35 && Math.abs(cy) <= 0.95) || 
             (Math.abs(cy) <= 0.35 && Math.abs(cx) <= 0.95);

    default:
      return true;
  }
}

// --- Audio Synthesizer (Web Audio API) ---
function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playSound(freq, type, duration, volume = 0.1, sweepEnd = null) {
  if (soundMuted) return;
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    if (sweepEnd) {
      osc.frequency.exponentialRampToValueAtTime(sweepEnd, ctx.currentTime + duration);
    }
    
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    console.error(e);
  }
}

function playCorrectSound() {
  playSound(523.25, 'sine', 0.15, 0.08); // C5
  setTimeout(() => playSound(659.25, 'sine', 0.2, 0.08), 100); // E5
}

function playErrorSound() {
  playSound(150, 'sawtooth', 0.25, 0.08); // Buzz
}

function playMoveSound() {
  playSound(600, 'triangle', 0.05, 0.04);
}

function playChestWinSound() {
  const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // Arpeggio
  notes.forEach((f, i) => {
    setTimeout(() => playSound(f, 'sine', 0.25, 0.06), i * 100);
  });
}

function playPoisonSound() {
  playSound(200, 'sawtooth', 0.8, 0.15, 60); // Low sliding buzz explosion
}

// --- Maze Generator (Iterative DFS Stack with Loop Generation) ---
function generateMaze() {
  grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill('W'));
  
  // 1. Mark cells that are outside the shape mask as 'B' (Blocked / Blank)
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (!isInsideShape(r, c, shapeType)) {
        grid[r][c] = 'B';
      }
    }
  }

  // 2. Iterative DFS Maze Carving using stack (prevents Maximum Call Stack size errors)
  const visited = new Set();
  const stack = [];
  
  // Find first valid odd cell inside shape to start DFS
  let startR = 1, startC = 1;
  let found = false;
  for (let r = 1; r < gridSize - 1; r += 2) {
    for (let c = 1; c < gridSize - 1; c += 2) {
      if (grid[r][c] === 'W') {
        startR = r;
        startC = c;
        found = true;
        break;
      }
    }
    if (found) break;
  }

  grid[startR][startC] = 'O'; // Path cell
  visited.add(`${startR},${startC}`);
  stack.push({ r: startR, c: startC });

  while (stack.length > 0) {
    const curr = stack[stack.length - 1]; // peek
    const r = curr.r;
    const c = curr.c;

    // Get unvisited directions
    const dirs = [
      [0, 2], [0, -2], [2, 0], [-2, 0]
    ];
    const unvisitedNeighbors = [];
    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr > 0 && nr < gridSize - 1 && nc > 0 && nc < gridSize - 1) {
        if (grid[nr][nc] === 'W' && !visited.has(`${nr},${nc}`)) {
          unvisitedNeighbors.push({ nr, nc, dr, dc });
        }
      }
    }

    if (unvisitedNeighbors.length > 0) {
      // Pick random neighbor
      const next = unvisitedNeighbors[Math.floor(Math.random() * unvisitedNeighbors.length)];
      
      // Carve wall in between
      grid[r + next.dr / 2][c + next.dc / 2] = 'O';
      grid[next.nr][next.nc] = 'O';
      
      visited.add(`${next.nr},${next.nc}`);
      stack.push({ r: next.nr, c: next.nc });
    } else {
      stack.pop();
    }
  }

  // 2.5 Randomly remove walls to create loops ("đường giả") to increase difficulty
  for (let r = 2; r < gridSize - 2; r++) {
    for (let c = 2; c < gridSize - 2; c++) {
      if (grid[r][c] === 'W') {
        const left = grid[r][c-1];
        const right = grid[r][c+1];
        const top = grid[r-1][c];
        const bottom = grid[r+1][c];
        
        // If it separates two paths horizontally or vertically
        if ((left === 'O' && right === 'O') || (top === 'O' && bottom === 'O')) {
          // 5% chance to remove the wall to create a loop/dead-end alternative
          if (Math.random() < 0.05) {
            grid[r][c] = 'O';
          }
        }
      }
    }
  }

  // 3. Find Entrance & Exit
  // Look for first valid cell on top rows for entrance
  startCell = null;
  for (let r = 1; r < gridSize - 1; r++) {
    for (let c = 1; c < gridSize - 1; c++) {
      if (grid[r][c] === 'O') {
        startCell = { r, c };
        grid[r - 1][c] = 'O'; // open wall above as entrance
        break;
      }
    }
    if (startCell) break;
  }

  // Look for last valid cell on bottom rows for exit
  endCell = null;
  for (let r = gridSize - 2; r > 0; r--) {
    for (let c = gridSize - 2; c > 0; c--) {
      if (grid[r][c] === 'O') {
        endCell = { r, c };
        grid[r + 1][c] = 'O'; // open wall below as exit
        break;
      }
    }
    if (endCell) break;
  }

  playerPath = [{ r: startCell.r - 1, c: startCell.c }];
}

// --- Pathfinder (BFS to trace solution path and allocate gates) ---
function findSolutionPath() {
  const queue = [[{ r: startCell.r - 1, c: startCell.c }]];
  const visited = new Set([`${startCell.r - 1},${startCell.c}`]);

  while (queue.length > 0) {
    const path = queue.shift();
    const current = path[path.length - 1];

    if (current.r === endCell.r + 1 && current.c === endCell.c) {
      return path; // Found solution path!
    }

    const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    for (const [dr, dc] of dirs) {
      const nr = current.r + dr;
      const nc = current.c + dc;
      if (nr >= 0 && nr < gridSize && nc >= 0 && nc < gridSize) {
        if (grid[nr][nc] === 'O' && !visited.has(`${nr},${nc}`)) {
          visited.add(`${nr},${nc}`);
          queue.push([...path, { r: nr, c: nc }]);
        }
      }
    }
  }
  return [];
}

function allocateGates() {
  const sol = findSolutionPath();
  gates = [];
  
  if (sol.length < 10) return; // grid too small

  // Place 4 to 5 gates along the solution path
  const numGates = 4 + Math.floor(Math.random() * 2); // 4 or 5 gates
  const step = Math.floor((sol.length - 4) / numGates);

  for (let i = 1; i <= numGates; i++) {
    // Pick cells in solution path
    const node = sol[i * step];
    if (node) {
      // Get a random riddle
      const riddle = getRandomRiddle();
      gates.push({
        r: node.r,
        c: node.c,
        riddle: riddle,
        solved: false
      });
    }
  }
}

function getRandomRiddle() {
  // Reset if all are used
  if (usedRiddles.length >= questionBank.length) {
    usedRiddles = [];
  }
  
  // Pick one not in used list
  let available = questionBank.filter(q => !usedRiddles.includes(q));
  if (available.length === 0) available = questionBank;

  const riddle = available[Math.floor(Math.random() * available.length)];
  usedRiddles.push(riddle);
  return riddle;
}

// --- Player Movement & Control handlers (Manual Drawing & Keyboard) ---
function movePlayer(dr, dc) {
  if (lives <= 0 || activeGate) return;

  const lastNode = playerPath[playerPath.length - 1];
  const nr = lastNode.r + dr;
  const nc = lastNode.c + dc;

  if (nr >= 0 && nr < gridSize && nc >= 0 && nc < gridSize) {
    if (grid[nr][nc] === 'O') {
      executeMove(nr, nc);
    }
  }
}

function getCellFromCoordinates(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const x = clientX - rect.left;
  const y = clientY - rect.top;
  
  const cellSize = rect.width / gridSize;
  const col = Math.floor(x / cellSize);
  const row = Math.floor(y / cellSize);
  
  if (col >= 0 && col < gridSize && row >= 0 && row < gridSize) {
    return { r: row, c: col };
  }
  return null;
}

function handlePointerDown(e) {
  if (lives <= 0 || activeGate) return;
  getAudioContext();

  const cell = getCellFromCoordinates(e.clientX, e.clientY);
  if (cell) {
    isDragging = true;
    executeMove(cell.r, cell.c);
    lastDraggedCell = cell;
  }
}

function handlePointerMove(e) {
  if (!isDragging || lives <= 0 || activeGate) return;

  const cell = getCellFromCoordinates(e.clientX, e.clientY);
  if (cell) {
    if (!lastDraggedCell || lastDraggedCell.r !== cell.r || lastDraggedCell.c !== cell.c) {
      executeMove(cell.r, cell.c);
      lastDraggedCell = cell;
    }
  }
}

function handlePointerUp() {
  isDragging = false;
  lastDraggedCell = null;
}

function executeMove(r, c) {
  if (lives <= 0 || activeGate) return;

  // Only walkable on path cells 'O'
  if (grid[r][c] !== 'O') return;

  // 1. Rollback path if stepping on a cell already in playerPath
  const indexInPath = playerPath.findIndex(node => node.r === r && node.c === c);
  if (indexInPath !== -1) {
    if (indexInPath === playerPath.length - 1) return; // already at the tip
    
    // Truncate path
    playerPath = playerPath.slice(0, indexInPath + 1);
    playMoveSound();
    drawBoard();
    return;
  }

  // 2. Extend path if adjacent to the current path tip
  const lastNode = playerPath[playerPath.length - 1];
  const dist = Math.abs(lastNode.r - r) + Math.abs(lastNode.c - c);
  if (dist === 1) {
    playerPath.push({ r, c });
    playMoveSound();
    drawBoard();

    // Check if player stepped on a gate
    const gate = gates.find(g => g.r === r && g.c === c);
    if (gate && !gate.solved) {
      isDragging = false; // stop dragging
      activeGate = gate;
      setTimeout(() => {
        showRiddlePopup(gate);
      }, 150);
      return;
    }

    // Check if reached exit
    if (r === endCell.r + 1 && c === endCell.c) {
      isDragging = false;
      showChestSelection();
    }
  }
}

// --- Riddle Overlay Control ---
function showRiddlePopup(gate) {
  const num = gates.indexOf(gate) + 1;
  document.getElementById('riddle-gate-num').innerText = num;
  document.getElementById('riddle-text').innerText = gate.riddle.question;

  const optDiv = document.getElementById('riddle-options');
  optDiv.innerHTML = '';

  gate.riddle.options.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.className = 'btn-option';
    btn.innerText = opt;
    btn.onclick = () => submitAnswer(idx);
    optDiv.appendChild(btn);
  });

  document.getElementById('riddle-feedback').classList.add('hidden');
  document.getElementById('riddle-overlay').classList.remove('hidden');
}

function submitAnswer(selectedIdx) {
  if (!activeGate) return;

  const feedback = document.getElementById('riddle-feedback');

  if (selectedIdx === activeGate.riddle.answer) {
    // Correct!
    playCorrectSound();
    activeGate.solved = true;
    activeGate = null;
    score += 50; // Add score for correct answer
    updateProgressUI();
    document.getElementById('riddle-overlay').classList.add('hidden');
    drawBoard();
  } else {
    // Incorrect!
    playErrorSound();
    lives--;
    updateProgressUI();
    
    // Check if dead
    if (lives <= 0) {
      document.getElementById('riddle-overlay').classList.add('hidden');
      document.getElementById('game-over-overlay').classList.remove('hidden');
      return;
    }

    feedback.innerText = `Sai rồi! Đáp án chưa chính xác. Bạn bị mất 1 mạng 💔 (Còn lại ${lives} mạng)`;
    feedback.classList.remove('hidden');
    
    // Shake the riddle popup for visual error feedback
    const box = document.querySelector('.riddle-box');
    box.classList.add('error-shake');
    setTimeout(() => box.classList.remove('error-shake'), 400);

    // Prompt another question or keep current one (user comment says: "trả lời lại đến khi đúng")
    // Keep current question so user must try to solve it.
  }
}

// --- Chest Randomization & End Game Overlay ---
function showChestSelection() {
  // Reset chest graphics
  for (let i = 1; i <= 5; i++) {
    const ch = document.getElementById(`chest-${i}`);
    ch.innerText = '📦';
    ch.style.background = '';
  }

  // Allocate Gold, Silver, and 3 Poison chests randomly
  const roles = ['gold', 'silver', 'poison', 'poison', 'poison'];
  roles.sort(() => Math.random() - 0.5);

  chestStates = {};
  for (let i = 1; i <= 5; i++) {
    chestStates[i] = roles[i - 1];
  }

  document.getElementById('chest-overlay').classList.remove('hidden');
}

function selectChest(idx) {
  const result = chestStates[idx];
  document.getElementById('chest-overlay').classList.add('hidden');

  if (result === 'gold') {
    // Major win!
    playChestWinSound();
    score = score * 2 + 100; // Double score + bonus
    localStorage.setItem('riddle_maze_score', score); // Save accumulated score
    
    // Save level progression
    const currentLevel = parseInt(localStorage.getItem('riddle_maze_level')) || 1;
    localStorage.setItem('riddle_maze_level', currentLevel + 1);
    
    document.getElementById('victory-icon-display').innerText = '👑🏆';
    document.getElementById('victory-title-display').innerText = 'KHO BÁU VÀNG! 👑';
    document.getElementById('victory-desc-display').innerText = `Đại thám hiểm xuất sắc! Bạn đã mở trúng Rương Vàng thần thánh, nhân đôi toàn bộ điểm số tích lũy từ các cửa ải!`;
    document.getElementById('victory-final-score').innerText = score;
    document.getElementById('victory-overlay').classList.remove('hidden');
  } 
  else if (result === 'silver') {
    // Medium win!
    playChestWinSound();
    score += 150; // Bonus
    localStorage.setItem('riddle_maze_score', score); // Save accumulated score
    
    // Save level progression
    const currentLevel = parseInt(localStorage.getItem('riddle_maze_level')) || 1;
    localStorage.setItem('riddle_maze_level', currentLevel + 1);

    document.getElementById('victory-icon-display').innerText = '🥈🎁';
    document.getElementById('victory-title-display').innerText = 'KHO BÁU BẠC! 🥈';
    document.getElementById('victory-desc-display').innerText = `Chúc mừng bạn đã mở trúng Rương Bạc chứa nhiều vàng bạc đá quý quý giá bên trong!`;
    document.getElementById('victory-final-score').innerText = score;
    document.getElementById('victory-overlay').classList.remove('hidden');
  } 
  else {
    // Toxic gas loss!
    playPoisonSound();
    
    // Reset player's active score to last successfully saved checkpoint on death
    const saved = parseInt(localStorage.getItem('riddle_maze_score')) || 0;
    localStorage.setItem('riddle_maze_score', saved);
    score = saved;
    
    // Trigger ghost floating animation
    const ghost = document.getElementById('ghost-char');
    ghost.style.animation = 'none';
    void ghost.offsetWidth; // trigger reflow
    ghost.style.animation = 'float-ghost 4.5s forwards ease-in-out';

    document.getElementById('poison-overlay').classList.remove('hidden');
  }
}

function goHomeSafely() {
  // Safe exit victory
  playCorrectSound();
  document.getElementById('chest-overlay').classList.add('hidden');

  localStorage.setItem('riddle_maze_score', score); // Save accumulated score

  // Save level progression
  const currentLevel = parseInt(localStorage.getItem('riddle_maze_level')) || 1;
  localStorage.setItem('riddle_maze_level', currentLevel + 1);

  document.getElementById('victory-icon-display').innerText = '🏡💖';
  document.getElementById('victory-title-display').innerText = 'Thoát Hiểm An Toàn! 🏡';
  document.getElementById('victory-desc-display').innerText = `Quyết định sáng suốt! Bạn đã bảo toàn tính mạng, mang toàn bộ điểm số tích lũy vượt qua các cửa ải về nhà an toàn.`;
  document.getElementById('victory-final-score').innerText = score;
  document.getElementById('victory-overlay').classList.remove('hidden');
}

// --- Canvas Drawing Logic ---
function resizeCanvas() {
  const container = document.getElementById('canvas-container');
  const size = container.clientWidth;
  const dpr = window.devicePixelRatio || 1;
  
  canvas.width = size * dpr;
  canvas.height = size * dpr;
  canvas.style.width = `${size}px`;
  canvas.style.height = `${size}px`;
  ctx.scale(dpr, dpr);
  
  drawBoard();
}

function drawShapeBorder(width) {
  ctx.save();
  ctx.strokeStyle = '#4A3F35'; // Dark border
  ctx.lineWidth = 4;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  
  const cx = width / 2;
  const cy = width / 2;
  const r = (width - 2) / 2 * 0.95;

  ctx.beginPath();
  switch (shapeType) {
    case "square":
      ctx.rect(width * 0.025, width * 0.025, width * 0.95, width * 0.95);
      break;
    case "rectangle":
      ctx.rect(width * 0.025, width * 0.125, width * 0.95, width * 0.75);
      break;
    case "circle":
      ctx.arc(cx, cy, r, 0, 2 * Math.PI);
      break;
    case "moon":
      ctx.arc(cx, cy, r, -Math.PI / 2, Math.PI / 2, false);
      const subCx = cx + r * 0.45;
      const subR = r * 0.79;
      ctx.arc(subCx, cy, subR, Math.PI / 2, -Math.PI / 2, true);
      break;
    case "heart": {
      const hx = cx;
      const hy = cy - width * 0.05;
      const hw = width * 0.85;
      ctx.moveTo(hx, hy + hw * 0.3);
      ctx.bezierCurveTo(hx - hw/2, hy - hw/2, hx - hw, hy + hw/3, hx, hy + hw * 0.85);
      ctx.bezierCurveTo(hx + hw, hy + hw/3, hx + hw/2, hy - hw/2, hx, hy + hw * 0.3);
      break;
    }
    case "star": {
      const spikes = 5;
      const outerR = r;
      const innerR = r * 0.4;
      let rot = Math.PI / 2 * 3;
      let sx = cx;
      let sy = cy;
      const step = Math.PI / spikes;
      ctx.moveTo(cx, cy - outerR);
      for (let i = 0; i < spikes; i++) {
        sx = cx + Math.cos(rot) * outerR;
        sy = cy + Math.sin(rot) * outerR;
        ctx.lineTo(sx, sy);
        rot += step;
        sx = cx + Math.cos(rot) * innerR;
        sy = cy + Math.sin(rot) * innerR;
        ctx.lineTo(sx, sy);
        rot += step;
      }
      ctx.closePath();
      break;
    }
    case "triangle":
      ctx.moveTo(cx, cy - r);
      ctx.lineTo(cx - r * 0.86, cy + r * 0.85);
      ctx.lineTo(cx + r * 0.86, cy + r * 0.85);
      ctx.closePath();
      break;
    case "diamond":
      ctx.moveTo(cx, cy - r);
      ctx.lineTo(cx + r, cy);
      ctx.lineTo(cx, cy + r);
      ctx.lineTo(cx - r, cy);
      ctx.closePath();
      break;
    case "cross":
      const cw = r * 0.35;
      ctx.moveTo(cx - cw, cy - r);
      ctx.lineTo(cx + cw, cy - r);
      ctx.lineTo(cx + cw, cy - cw);
      ctx.lineTo(cx + r, cy - cw);
      ctx.lineTo(cx + r, cy + cw);
      ctx.lineTo(cx + cw, cy + cw);
      ctx.lineTo(cx + cw, cy + r);
      ctx.lineTo(cx - cw, cy + r);
      ctx.lineTo(cx - cw, cy + cw);
      ctx.lineTo(cx - r, cy + cw);
      ctx.lineTo(cx - r, cy - cw);
      ctx.lineTo(cx - cw, cy - cw);
      ctx.closePath();
      break;
  }
  ctx.stroke();
  ctx.restore();
}

function drawBoard() {
  if (!canvas || !ctx) return;

  const rect = canvas.getBoundingClientRect();
  const width = rect.width;
  const cellSize = width / gridSize;

  ctx.clearRect(0, 0, width, width);

  // Draw cells
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const type = grid[r][c];
      const cx = c * cellSize;
      const cy = r * cellSize;

      if (type === 'B') {
        continue;
      }

      if (type === 'W') {
        // Wall - soft pastel brown
        ctx.fillStyle = '#E8DCD0';
        ctx.fillRect(cx, cy, cellSize, cellSize);
      } else {
        // Path cell - soft pastel cream
        ctx.fillStyle = '#FCFAF6';
        ctx.fillRect(cx, cy, cellSize, cellSize);
      }
    }
  }

  // Draw player trail line
  if (playerPath.length > 1) {
    ctx.beginPath();
    ctx.lineWidth = Math.max(2, cellSize * 0.4);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#FFA07A'; // Coral
    
    for (let i = 0; i < playerPath.length; i++) {
      const node = playerPath[i];
      const ncx = node.c * cellSize + cellSize / 2;
      const ncy = node.r * cellSize + cellSize / 2;
      if (i === 0) {
        ctx.moveTo(ncx, ncy);
      } else {
        ctx.lineTo(ncx, ncy);
      }
    }
    ctx.stroke();
  }

  // Draw player trail circles
  playerPath.forEach((node) => {
    const cx = node.c * cellSize + cellSize / 2;
    const cy = node.r * cellSize + cellSize / 2;
    ctx.beginPath();
    ctx.arc(cx, cy, cellSize * 0.2, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(255, 160, 122, 0.6)';
    ctx.fill();
  });

  // Draw entrance (vector arrow)
  if (startCell) {
    const ecx = startCell.c * cellSize;
    const ecy = (startCell.r - 1) * cellSize;
    ctx.fillStyle = '#86EFAC'; // green-300
    ctx.fillRect(ecx, ecy, cellSize, cellSize);
    
    // Draw small down arrow
    ctx.beginPath();
    ctx.moveTo(ecx + cellSize * 0.25, ecy + cellSize * 0.3);
    ctx.lineTo(ecx + cellSize * 0.75, ecy + cellSize * 0.3);
    ctx.lineTo(ecx + cellSize * 0.5, ecy + cellSize * 0.7);
    ctx.closePath();
    ctx.fillStyle = '#166534'; // green-800
    ctx.fill();
  }

  // Draw exit (vector star)
  if (endCell) {
    const excx = endCell.c * cellSize;
    const excy = (endCell.r + 1) * cellSize;
    ctx.fillStyle = '#FDE68A'; // yellow-200
    ctx.fillRect(excx, excy, cellSize, cellSize);
    
    // Draw simple star
    ctx.fillStyle = '#D97706'; // amber-600
    ctx.beginPath();
    const cx = excx + cellSize / 2;
    const cy = excy + cellSize / 2;
    const spikes = 5;
    const outerRadius = cellSize * 0.35;
    const innerRadius = cellSize * 0.15;
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fill();
  }

  // Draw gates/checkpoints (only if solved! Unsolved gates are hidden)
  gates.forEach((gate, idx) => {
    if (!gate.solved) return; // Hidden initially!

    const gcx = gate.c * cellSize + cellSize / 2;
    const gcy = gate.r * cellSize + cellSize / 2;
    
    ctx.beginPath();
    ctx.arc(gcx, gcy, cellSize * 0.42, 0, 2 * Math.PI);
    ctx.fillStyle = '#95DAC1'; // green solved
    ctx.fill();

    // Border
    ctx.lineWidth = Math.max(1, cellSize * 0.1);
    ctx.strokeStyle = '#FFFFFF';
    ctx.stroke();

    // Checkmark text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${Math.max(5, cellSize * 0.6)}px 'Quicksand', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✓', gcx, gcy);
  });

  // Draw Player Avatar (at path tip)
  if (playerPath.length > 0) {
    const playerPos = playerPath[playerPath.length - 1];
    const pcx = playerPos.c * cellSize + cellSize / 2;
    const pcy = playerPos.r * cellSize + cellSize / 2;
    
    ctx.beginPath();
    ctx.arc(pcx, pcy, cellSize * 0.4, 0, 2 * Math.PI);
    ctx.fillStyle = '#FFA07A'; // coral
    ctx.fill();

    // Concentric inner highlight
    ctx.beginPath();
    ctx.arc(pcx, pcy, cellSize * 0.18, 0, 2 * Math.PI);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();

    // Border
    ctx.lineWidth = Math.max(1, cellSize * 0.15);
    ctx.strokeStyle = '#4A3F35';
    ctx.stroke();
  }
}

// --- UI Updates ---
function updateProgressUI() {
  // Score
  document.getElementById('display-score').innerText = score;
  
  // Lives
  const container = document.getElementById('lives-container');
  container.innerHTML = '';
  for (let i = 0; i < 5; i++) {
    if (i < lives) {
      container.innerHTML += '💖';
    } else {
      container.innerHTML += '💔';
    }
  }

  // Gates cleared
  const cleared = gates.filter(g => g.solved).length;
  document.getElementById('display-gates').innerText = `${cleared} / ${gates.length}`;
}

// --- Game Initializer ---
function initGame() {
  lives = 5;
  activeGate = null;

  // Load accumulated score or reset to checkpoint if they died
  const savedScore = parseInt(localStorage.getItem('riddle_maze_score')) || 0;
  score = savedScore;

  // Load and display current level
  const savedLevel = parseInt(localStorage.getItem('riddle_maze_level')) || 1;
  document.getElementById('display-level').innerText = `Màn ${savedLevel}`;

  // List of shapes
  const shapes = ["square", "rectangle", "circle", "moon", "heart", "star", "triangle", "diamond", "cross"];
  // Select a random shape
  shapeType = shapes[Math.floor(Math.random() * shapes.length)];
  
  // Display shape name in Vietnamese
  const namesDict = {
    square: "Hình vuông",
    rectangle: "Hình chữ nhật",
    circle: "Hình tròn",
    moon: "Trăng khuyết",
    heart: "Trái tim",
    star: "Ngôi sao",
    triangle: "Hình tam giác",
    diamond: "Hình kim cương",
    cross: "Hình chữ thập"
  };
  document.getElementById('display-shape').innerText = namesDict[shapeType];

  // Generate Maze & Gates
  generateMaze();
  allocateGates();
  playerPath = [{ r: startCell.r - 1, c: startCell.c }];
  
  // Reset all UI overlays
  document.getElementById('riddle-overlay').classList.add('hidden');
  document.getElementById('chest-overlay').classList.add('hidden');
  document.getElementById('poison-overlay').classList.add('hidden');
  document.getElementById('victory-overlay').classList.add('hidden');
  document.getElementById('game-over-overlay').classList.add('hidden');

  updateProgressUI();

  // Resize and redraw canvas
  resizeCanvas();
}

function startNewExploration() {
  localStorage.removeItem('riddle_maze_score');
  localStorage.removeItem('riddle_maze_level');
  initGame();
}

// --- Window event wiring ---
window.addEventListener('load', () => {
  canvas = document.getElementById('game-canvas');
  ctx = canvas.getContext('2d');

  window.addEventListener('resize', resizeCanvas);

  // Pointer events for drag-drawing
  canvas.addEventListener('pointerdown', handlePointerDown);
  canvas.addEventListener('pointermove', handlePointerMove);
  window.addEventListener('pointerup', handlePointerUp);

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        movePlayer(-1, 0);
        e.preventDefault();
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        movePlayer(1, 0);
        e.preventDefault();
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        movePlayer(0, -1);
        e.preventDefault();
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        movePlayer(0, 1);
        e.preventDefault();
        break;
    }
  });

  initGame();
});
