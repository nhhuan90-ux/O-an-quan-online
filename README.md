# 🧸 Thế giới trò chơi (Childhood Game Hub)

Một cổng game hợp nhất tuyệt đẹp với phong cách thiết kế Light Pastel sinh động, quy tụ hai trò chơi hấp dẫn:
1. **Mê Cung Bong Bóng (Bubble Maze):** Vẽ đường đi kết nối các bong bóng cam mà không đi lặp hay bỏ sót. Gồm 306 màn chơi từ dễ đến siêu khó và công cụ tự tạo màn chơi.
2. **Ô Ăn Quan Online:** Trò chơi dân gian Việt Nam đấu trí trực tuyến qua Socket.io. Hỗ trợ đấu với máy (AI), 2 người chơi cục bộ hoặc tạo phòng đấu online với bạn bè.

---

## 🚀 Hướng dẫn chạy thử ở máy cục bộ (Local)

### 1. Cài đặt các thư viện phụ thuộc:
```bash
npm install
```

### 2. Khởi động máy chủ:
```bash
npm run dev
# Hoặc: npm start
```

Mở trình duyệt truy cập: **[http://localhost:3000](http://localhost:3000)**

---

## 📦 Hướng dẫn đưa dự án lên GitHub

Dự án đã được khởi tạo sẵn Git cục bộ và cấu hình tệp `.gitignore` chuẩn. Để đẩy mã nguồn lên kho chứa GitHub của bạn:

1. **Tạo một Repository mới** trên tài khoản GitHub của bạn (ví dụ tên là `the-gioi-tro-choi`).
2. **Liên kết Git cục bộ với GitHub** bằng cách chạy các lệnh sau trong thư mục dự án:
```bash
# Đổi tên nhánh mặc định thành main
git branch -M main

# Thêm đường dẫn tới repository GitHub của bạn
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Đẩy mã nguồn lên GitHub
git push -u origin main
```

---

## 🌐 Hướng dẫn Deploy lên các dịch vụ đám mây (Web Hosting)

Dự án này sử dụng Node.js backend kết hợp WebSocket (`socket.io`), do đó cần deploy lên dịch vụ hỗ trợ chạy ứng dụng Node.js (không dùng GitHub Pages do Pages chỉ hỗ trợ trang tĩnh).

Các nhà cung cấp tốt nhất và miễn phí/giá rẻ:

### 1. Deploy lên Render.com (Khuyên dùng)
* Đăng nhập vào [Render.com](https://render.com/) bằng tài khoản GitHub.
* Chọn **New** -> **Web Service**.
* Liên kết với Repository bạn vừa tạo trên GitHub.
* Cấu hình các thông số sau:
  * **Runtime:** `Node`
  * **Build Command:** `npm install`
  * **Start Command:** `npm start`
* Nhấp **Create Web Service**. Ứng dụng sẽ được triển khai trực tiếp và tự động gán đường dẫn web HTTPS (ví dụ: `https://the-gioi-tro-choi.onrender.com`).

### 2. Deploy lên Railway.app
* Đăng nhập vào [Railway.app](https://railway.app/).
* Chọn **New Project** -> **Deploy from GitHub repo**.
* Chọn Repository dự án của bạn.
* Railway sẽ tự động phân tích cấu hình `package.json` và khởi chạy server Node.js.

### 3. Deploy lên Heroku
* Tạo ứng dụng mới trên Heroku.
* Liên kết GitHub hoặc sử dụng Heroku CLI để deploy:
```bash
heroku create
git push heroku main
```
