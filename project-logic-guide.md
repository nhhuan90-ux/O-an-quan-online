# Hướng Dẫn Kỹ Thuật & Logic Dự Án "Thế Giới Trò Chơi" 🧸

Tài liệu này ghi nhớ toàn bộ cấu trúc hệ thống, sơ đồ thư mục, logic hoạt động chi tiết và các thuật toán cốt lõi của dự án cổng game hợp nhất nhằm giúp lập trình viên nắm bắt nhanh chóng khi sửa đổi và nâng cấp mã nguồn.

---

## 1. Tổng Quan Kiến Trúc Hệ Thống (Architecture Overview)

Dự án là một ứng dụng web nguyên khối (monolith) chạy trên nền tảng **Node.js / Express** kết hợp **Socket.io** cho truyền tải thời gian thực.
- **Backend (server/):** Đảm nhận việc phục vụ các tệp tĩnh, cung cấp các endpoint API (như đồng bộ bể cá) và quản lý các kết nối Socket.io cho phòng chơi mạng ngang hàng (multiplayer) của game Ô Ăn Quan.
- **Frontend (public/):** Sử dụng thuần HTML5, CSS3 (Pastel & Glassmorphic) và JavaScript Vanilla (không qua framework nặng như React/Vue để tối ưu tốc độ tải tức thì). Đồ họa chủ yếu dựng bằng **HTML5 Canvas 2D** và âm thanh được tổng hợp qua **Web Audio API** (không cần tải file nhạc tĩnh).

---

## 2. Cấu Trúc Thư Mục Chi Tiết (Directory Structure)

```
/ (Project Root)
├── package.json                   # Cấu hình dependencies (express, socket.io, compression)
├── README.md                      # Hướng dẫn deploy & setup chung
├── project-logic-guide.md         # Hướng dẫn logic chi tiết (File này)
├── server/
│   ├── index.js                   # Express + Socket.io Server, nén Gzip, API đồng bộ bể cá
│   └── aquariums.json             # Cơ sở dữ liệu JSON lưu trữ trạng thái bể cá (Cloud Sync)
└── public/
    ├── index.html                 # Trang chủ chọn game (Lobby Portal) dạng card Pastel
    ├── me-cung/                   # Game Mê Cung Bong Bóng (306 màn chơi)
    │   ├── index.html, style.css, game.js
    ├── giai-ma-me-cung/           # Game Giải Mã Mê Cung (51x51, 60+ câu đố trắc nghiệm)
    │   ├── index.html, style.css, game.js
    ├── be-ca-thuy-sinh/           # Game Giả Lập Bể Cá Thủy Sinh (Setup A-Z, Gacha, Theme)
    │   ├── index.html, style.css, aquarium.js
    ├── o-an-quan/                 # Game Ô Ăn Quan Online (Multiplayer, Local, AI Bot)
    │   ├── index.html, css/, js/, assets/
    ├── classic-puzzles/           # Game Trò Chơi Cổ Điển (Tháp Hà Nội & Sắp Xếp Nước)
    │   ├── index.html, classic-puzzles.js
    └── game-iq/                   # Game IQ Suite (Shikaku, LITS, Shingoki, Pipes, Lollipops, v.v.)
        ├── index.html, style.css, game-iq.js
        └── [shikaku|lits|shingoki|pipes|lollipops|hanoi|water-sort].js
```

---

## 3. Logic Chi Tiết & Giải Thuật Của Từng Trò Chơi

### 3.1. Ô Ăn Quan Online 🌾
- **Cơ chế chơi:** Hỗ trợ 3 chế độ (Chơi trực tuyến qua Socket.io, Chơi cục bộ 2 người trên cùng máy, Chơi với máy - AI Bot).
- **Socket.io Matchmaking:** Sử dụng cơ chế phòng chơi với mã code 4 chữ số. Server tự động ghép cặp 2 người chơi chung một mã phòng và đồng bộ hóa lượt đi, nước đi.
- **Tối ưu hình ảnh:** Toàn bộ ảnh nền bàn cờ nặng đã được nén sang định dạng `.webp` và tải qua CDN jsDelivr nhằm tiết kiệm băng thông tối đa cho server.

### 3.2. Mê Cung Bong Bóng (Bubble Maze) 🧼
- **Danh sách màn chơi:** Gồm **306 màn chơi** liên tục (Màn 1-6 lấy từ dữ liệu PDF tĩnh gốc; Màn 7-306 sinh tự động bằng thuật toán).
- **Thuật toán sinh mê cung (Maze Generator):**
  - Sử dụng thuật toán DFS sinh đường đi ngẫu nhiên từ điểm Start.
  - Sử dụng cơ chế **Seed ngẫu nhiên nhưng cố định** để đảm bảo màn chơi của mỗi cấp độ không thay đổi khi tải lại trang.
- **Điều khiển thông minh:**
  - **Auto-Run to Intersection:** Nhân vật tự động chạy thẳng dọc theo hành lang và chỉ dừng lại khi chạm tường hoặc gặp ngã rẽ.
  - **Local BFS Interpolation:** Khi người chơi kéo chuột nhanh bị nhảy cách ô, hệ thống tự động chạy thuật toán BFS tìm đường đi ngắn nhất để bù đắp các ô bị nhảy (tối đa 5 ô), giúp nét vẽ bám chuột mượt mà không bị đứt nét.
  - Bấm vào một ô đã đi qua sẽ kích hoạt **Rollback** thu hồi nét vẽ về ô đó.

### 3.3. Giải Mã Mê Cung (Riddle Maze) 🧭
- **Quy mô bản đồ:** Lưới kích thước lớn **51x51** (hơn 2,600 ô).
- **Sinh mê cung DFS lặp (Iterative Stack):** Để tránh lỗi tràn bộ nhớ (Maximum call stack size exceeded) đối với lưới lớn 51x51, thuật toán DFS sinh mê cung được viết bằng vòng lặp và mảng stack thay vì đệ quy.
- **Dỡ tường tạo vòng lặp (Loops):** Thuật toán tự động dỡ bỏ ngẫu nhiên ~5% số bức tường ngăn cách để tạo ra các hành lang vòng khép kín, làm tăng số lượng đường giả và độ khó.
- **Mặt nạ hình học (Geometry Masking):** Vẽ mê cung nằm gọn trong các hình dáng hình học độc đáo: Tròn, Tim, Sao, Trăng khuyết, Thập tự, v.v.
- **Hệ thống cửa ải & 60+ câu đố:**
  - Cửa ải đố vui được ẩn trên canvas, chỉ hiện lên khi người chơi di chuyển đè lên ô đó.
  - Trả lời sai trừ 1 mạng (tối đa 5 mạng). Mất hết mạng sẽ Game Over và khôi phục điểm số về checkpoint màn trước.
- **Kết màn (5 Bảo Rương):** Người chơi phải chọn 1 trong 5 rương (1 Rương Vàng x2 điểm, 1 Rương Bạc cộng điểm, 3 Rương Độc nổ khói biến nhân vật thành ma bay lên trời và trừ điểm).

### 3.4. Giả Lập Bể Cá Thủy Sinh (Aquarium Simulator) 🌿🐠
- **8 Bước Thiết Lập chuẩn chuyên nghiệp:**
  1. *Chọn bể (Tank Size):* Cubic 40, Standard 60, Premium 90 thay đổi kích thước canvas.
  2. *Rải phân nền:* Đắp vẽ các lớp cốt nền JBL nâu, phân nền ADA đen, cát sỏi vàng lượn sóng.
  3. *Xếp đá lũa (Hardscape):* Đặt gỗ Bonsai, lũa cành, đá Tiger, đá Tai Mèo (cho phép kéo di chuyển, xoay 360 độ và scale).
  4. *Cắm cây (Flora):* Cắm trân châu ngọc trai, ráy Nana, dương xỉ, cỏ lá đỏ hậu cảnh (cây đung đưa bằng hàm `Math.sin(time)` mô phỏng dòng chảy).
  5. *Lắp thiết bị:* Canister lọc, đèn LED RGB, sủi CO2 (sủi bọt khí siêu mịn bay lên), quạt mát.
  6. *Vào nước & Vi sinh (Cycling):* Nước dâng ngập bể, châm vi sinh sống và chạy đồng hồ Nitơ (Ammonia, Nitrite giảm dần, Nitrate tăng, Vi sinh đạt 100% an toàn).
  7. *Thả cá cảnh:* Cá Neon, cá Tam Giác bơi theo đàn (schooling behavior AI), tép Cherry bò nhặt rêu hại, cá Mún dọn váng kính.
  8. *Chăm sóc:* Cho ăn (thức ăn chìm dần, cá bơi tới đớp), cạo rêu bám kính, tỉa cây mọc cao, thay nước 30% định kỳ, châm dinh dưỡng nước.
- **Cơ chế Đồng bộ Đám Mây (Cloud Sync):** Gửi yêu cầu lưu trữ lên `/api/aquarium/save` (lưu tệp `server/aquariums.json`) và khôi phục bể cá qua mã code 6 số ngẫu nhiên duy nhất của người chơi.
- **Tự động chuyển đổi Theme & Clock hệ thống:**
  - *Sáng (6h - 18h):* Theme pastel tươi sáng.
  - *Tối (18h - 6h):* Tự động kích hoạt Dark Mode và bật đèn LED rọi chùm sáng lung linh.
- **Ngọc Trai, Gacha & Cá Hiếm (Nếu merge từ temp-local):**
  - Cá no bụng > 50% sẽ sinh ra Ngọc Trai (`🔮`) chìm xuống đáy. Click thu thập cộng `+1 🔮` kèm tiếng chuông ngân.
  - Dùng 10 ngọc trai quay slot machine nhận cá hiếm (Koi, Sứa neon co bóp, Cá đĩa sọc xanh, Cá lồng đèn phát sáng, Cá voi mini).
  - Cá đói < 30% hiện bong bóng thought `🍂`. Cho ăn tăng kích thước cá lớn dần.

### 3.5. Classic Puzzles (Trò Chơi Cổ Điển) 🧪
- **Tháp Hà Nội (Tower of Hanoi):** Di chuyển các đĩa màu sắc từ cọc này sang cọc khác sao cho đĩa lớn không bao giờ đè lên đĩa nhỏ.
- **Sắp Xếp Nước (Water Sort):** 
  - Đổ nước màu giữa các ống nghiệm để dồn nước cùng màu về chung một ống.
  - **BFS Solver (Tự động giải):** Tích hợp giải thuật tìm kiếm theo chiều rộng (BFS) để duyệt qua các trạng thái đổ nước, tự động tìm ra số bước di chuyển tối ưu nhất và thực hiện đổ nước tự động minh họa cho người chơi.
  - Sửa lỗi sắp xếp các ống nghiệm thành 2 hàng cho cấp độ Vừa và Khó, sử dụng chiều cao tự động để tránh tràn khung và lỗi chồng chéo phần tử UI.

### 3.6. Game IQ (Game IQ Suite) 🧠
- Quản lý tập trung bởi class `GameManager` trong `game-iq.js`.
- Cung cấp các trò chơi ô số và hình học kích thích trí não: Shikaku, LITS, Shingoki, Pipes, Lollipops.
- Tích hợp tính năng: Chọn độ khó (Dễ, Vừa, Khó), Hoàn tác/Làm lại (Undo/Redo Stack), Gợi ý (Hint), Tự giải (Solve), Hệ thống checklist kiểm tra luật chơi trực quan thời gian thực, và hoạt ảnh pháo hoa ăn mừng chiến thắng.

---

## 4. Các Kỹ Thuật Tối Ưu Hóa Trải Nghiệm & Băng Thông

1. **Gzip Compression:** Kích hoạt middleware `compression` trong backend Express để nén toàn bộ tệp tĩnh CSS, JS truyền tải xuống client, giảm tới 70% thời gian tải trang.
2. **Lazy Loading Image:** Ảnh nền sảnh và ván đấu chỉ được tải bất đồng bộ khi người chơi kích hoạt màn hình tương ứng, tránh blocking tiến trình tải trang ban đầu.
3. **Dynamic Import Modules:** Các script hướng dẫn chơi hoặc bộ chat phụ trợ được tải động bằng `await import()` chỉ khi người chơi bấm nút yêu cầu sử dụng.
4. **Web Audio Synthesizer:** Loại bỏ hoàn toàn các tệp MP3 nặng nề. Toàn bộ hiệu ứng âm thanh click, nhạc chuông chiến thắng, tiếng nước sủi bọt, tiếng cạch gacha... đều được sinh tự động trực tiếp bằng mã lệnh JavaScript thông qua việc cấu hình tần số (frequency) và cường độ âm (gain) của các bộ dao động sóng âm (OscillatorNode) thuộc Web Audio API.

---

## 5. Hướng Dẫn Vận Hành Cục Bộ

1. Cài đặt các thư viện phụ thuộc:
   ```bash
   npm install
   ```
2. Khởi chạy máy chủ phát triển cục bộ:
   ```bash
   npm start
   ```
3. Truy cập trò chơi tại: **[http://localhost:3000](http://localhost:3000)**
