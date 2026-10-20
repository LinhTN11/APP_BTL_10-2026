# CUPID AI - SMART DATING APP (BÀI TẬP LỚN CÔNG NGHỆ PHẦN MỀM)

> **Ứng dụng Hẹn hò Thông minh** tích hợp Trí tuệ nhân tạo (AI Icebreaker), trắc nghiệm MBTI và trạng thái tâm trạng hàng ngày (Daily Mood).

---

## 🌟 CÁC TÍNH NĂNG CỐT LÕI (MVP SCOPE)

1. **Xác thực an toàn & Tiết kiệm chi phí:**
   - Đăng ký tài khoản qua Email & Mật khẩu.
   - Xác thực mã OTP 6 số gửi qua Email (hoặc nhập mã bypass `123456` để phục vụ demo chấm điểm nhanh).
   - Đăng nhập bảo mật với JWT Access & Refresh Token.
2. **Hồ sơ Cá nhân & Trắc nghiệm MBTI:**
   - Thiết lập ảnh đại diện, tiểu sử, thẻ sở thích.
   - Bài trắc nghiệm tính cách MBTI nhanh 12 câu hoặc chọn trực tiếp mã MBTI (16 nhóm tính cách).
   - Nhãn trạng thái tâm trạng trong ngày (Daily Mood Tag) tự động hết hạn sau 24h.
3. **Khám phá & Ghép đôi theo vị trí:**
   - Thuật toán tính khoảng cách Haversine chuẩn xác theo tọa độ GPS.
   - Thao tác vuốt thẻ: Vuốt trái (Pass), Vuốt phải (Like).
   - Kích hoạt ghép đôi (Match) và thông báo Real-time ngay khi cả hai cùng Like.
   - **Chế độ Giả lập Vị trí (Virtual Location Mode):** Cho phép đổi tọa độ tức thì để demo tính năng khoảng cách ngay trong phòng thi/hội đồng.
4. **Nhắn tin Real-time & Trợ lý AI Mở lời:**
   - Nhắn tin 1-1 thời gian thực qua WebSocket (Socket.io).
   - **Trợ lý AI Cupid (Google Gemini 1.5 Flash):** Phân tích điểm chung giữa 2 hồ sơ và sinh ra 3 phong cách mở lời (Hài hước, Tinh tế, Trực diện) bằng tiếng Việt.
   - Cơ chế Human-in-the-loop: Chạm để điền câu gợi ý vào ô nhập tin nhắn, người dùng có thể chỉnh sửa trước khi bấm gửi.

---

## 🏗️ KIẾN TRÚC HỆ THỐNG & CÔNG NGHỆ

* **Backend:** Node.js (TypeScript) + Express.js + Socket.io Server.
* **Database & ORM:** PostgreSQL + Prisma ORM.
* **Frontend Mobile:** React Native CLI (Pure/Bare Native) + TypeScript + React Navigation.
* **AI Engine:** Google Gemini 1.5 Flash API (Free Tier qua `@google/generative-ai` SDK) kèm Fallback Templates an toàn.
* **Tài liệu đặc tả:** Thư mục [`docs/`](./docs) gồm đầy đủ BRD/SRS, Kiến trúc CSDL, Quy trình BPMN, WBS 14 ngày, Test Cases và Risk Register.

---

## 🚀 HƯỚNG DẪN KHỞI CHẠY HỆ THỐNG

### 1. Khởi chạy Cơ sở Dữ liệu (PostgreSQL)
Có thể sử dụng PostgreSQL cài cục bộ trên máy, Docker hoặc các dịch vụ đám mây miễn phí (Supabase / Neon.tech):
```bash
# Nếu dùng Docker:
cd backend
docker compose up -d
```

### 2. Cài đặt và Chạy Backend Server
```bash
cd backend

# Cài đặt thư viện (đã cài sẵn)
npm install

# Sinh mã nguồn Prisma Client
npx prisma generate

# Chạy migration tạo bảng CSDL
npx prisma migrate dev --name init

# Nạp dữ liệu mẫu (Sở thích & 3 người dùng mẫu có sẵn MBTI, Mood)
npm run seed

# Khởi chạy Server ở chế độ Development
npm run dev
```
* Backend sẽ chạy tại: `http://localhost:5000`
* Kiểm tra trạng thái máy chủ: `http://localhost:5000/api/health`

### 3. Kiểm thử Tự động Hóa (E2E Integration Tests)
Backend đi kèm bộ kiểm thử tự động toàn diện gồm 23 bài test xác thực toàn bộ luồng Auth, OTP, Profile, Quản lý Bộ lọc, Vuốt thẻ, Ghép đôi, WebSocket Chat và Trợ lý AI:
```bash
cd backend
npm run test:e2e
```

### 4. Khởi chạy Ứng dụng Di động (React Native CLI)
```bash
cd mobile

# Chạy Metro Bundler
npm start

# Trên một cửa sổ Terminal khác: Chạy ứng dụng trên Android Emulator
npm run android
```

---

## 📖 TÀI LIỆU BACKEND & API HANDOVER CHO FRONTEND TEAM

Đội ngũ Frontend / Mobile có thể đọc chi tiết hướng dẫn tích hợp, bảng mô tả chi tiết 23 REST API endpoints, danh mục Socket.io events và mã lỗi tại:
👉 **[HƯỚNG DẪN BÀN GIAO BACKEND CHO FRONTEND](./backend/README.md)**

* **Postman Collection:** File [`backend/cupid_ai_api_collection.json`](./backend/cupid_ai_api_collection.json) đã sẵn sàng để Import 1-click vào Postman/Thunder Client/Insomnia.
* **Cấu hình IP máy chủ cho Android:** Sử dụng `http://10.0.2.2:5000/api/v1` thay vì `localhost`.

---

## 🔑 THÔNG TIN TÀI KHOẢN DEMO CÓ SẴN (SAU KHI CHẠY SEED)

Hệ thống đã nạp sẵn **20 hồ sơ sinh viên mẫu** thực tế tại Hà Nội (Bách Khoa, Ngoại Thương, Kinh Tế, Y Hà Nội, Kiến Trúc...) với đầy đủ ảnh đại diện, tiểu sử, nhóm tính cách MBTI và trạng thái cảm xúc Daily Mood.

* **Mật khẩu chung cho tất cả tài khoản mẫu:** `MatKhau123@`
* **Mã OTP Bypass phục vụ demo/chấm điểm:** Nhập `123456` với bất kỳ email nào khi đăng ký mới hoặc đặt lại mật khẩu.

| STT | Tên sinh viên | Email đăng nhập | Giới tính | Tuổi | MBTI | Tâm trạng (Daily Mood) | Vị trí / Trường |
| :---: | :--- | :--- | :---: | :---: | :---: | :--- | :--- |
| 1 | **Trần Mai Linh** | `linh.tran@test.com` | Nữ | 22 | **ENFP** | Thèm trà sữa 🧋 | ĐH Ngoại Thương (Cầu Giấy) |
| 2 | **Nguyễn Huy Hoàng** | `hoang.nguyen@test.com` | Nam | 23 | **INFP** | Cần người đi dạo 🌙 | ĐH Bách Khoa Hà Nội (Hai Bà Trưng) |
| 3 | **Lê Thu Hương** | `huong.le@test.com` | Nữ | 21 | **INFJ** | Xem phim cuối tuần 🎬 | ĐH Quốc Gia Hà Nội (Cầu Giấy) |
| 4 | **Phạm Quốc Anh** | `quocanh.pham@test.com` | Nam | 24 | **ENTJ** | Muốn đi cà phê chill ☕ | ĐH Kinh tế Quốc dân (Hai Bà Trưng) |
| 5 | **Đặng Thảo My** | `thaomy.dang@test.com` | Nữ | 20 | **ESFP** | Lập team ăn lẩu 🍲 | ĐH Hà Nội (Thanh Xuân) |
| 6 | **Vũ Minh Đức** | `minhduc.vu@test.com` | Nam | 22 | **INTJ** | Tìm bạn chạy bộ 🏃 | Học viện Bưu chính Viễn thông (Hà Đông) |
| 7 | **Bùi Khánh Huyền** | `khanhhuyen.bui@test.com`| Nữ | 23 | **ISFJ** | Muốn đi bảo tàng 🎨 | ĐH Mỹ thuật Việt Nam (Hoàn Kiếm) |
| 8 | **Đỗ Tấn Phát** | `tanphat.do@test.com` | Nam | 21 | **ISTP** | Tìm bạn leo núi trong nhà 🧗 | ĐH Xây Dựng (Hai Bà Trưng) |
| ... | *... và 12 sinh viên khác* | *(Xem danh sách đầy đủ trong [`backend/src/prisma/seed.ts`](./backend/src/prisma/seed.ts))* | | | | | |

---

## 📁 CẤU TRÚC THƯ MỤC DỰ ÁN

```
App-BTL/
├── docs/                                    # Hồ sơ đặc tả kỹ thuật và báo cáo BTL
│   ├── 01_BRD_SRS_REQUIREMENTS_SPECIFICATION.md
│   ├── 02_SYSTEM_ARCHITECTURE_AND_DATABASE.md
│   ├── 03_BUSINESS_PROCESS_AND_AI_WORKFLOW.md
│   ├── 04_WBS_PROJECT_MANAGEMENT_2_WEEKS.md
│   ├── 05_TESTING_UAT_AND_RISK_MANAGEMENT.md
│   ├── 06_PROJECT_MANAGEMENT_LOGS.md
│   └── screenshots/                         # Ảnh chụp giao diện chính của ứng dụng
│       ├── login_screen.png
│       ├── discover_card_screen.png
│       ├── matches_screen.png
│       └── profile_screen.png
├── backend/                                 # Máy chủ Node.js TypeScript + Socket.io
│   ├── prisma/                              # Schema CSDL, migrations & 20 seed profiles
│   ├── src/
│   │   ├── config/                          # Biến môi trường, database & socket singleton
│   │   ├── controllers/                     # Auth, Profile, Discovery, Swipe, Chat, AI
│   │   ├── middlewares/                     # JWT Auth, Rate limiting & Error handler
│   │   ├── routes/                          # RESTful API route definitions (23 endpoints)
│   │   ├── services/                        # AI Gemini Orchestrator & Email Service
│   │   ├── sockets/                         # WebSocket realtime chat & matching handlers
│   │   ├── test_backend_e2e.ts              # Bộ kiểm thử 23 bài test tự động hóa E2E
│   │   └── index.ts                         # Server entrypoint
│   ├── cupid_ai_api_collection.json         # Postman Collection v2.1 bàn giao cho FE
│   ├── README.md                            # Cẩm nang chi tiết bàn giao Backend cho FE
│   └── package.json
├── mobile/                                  # Ứng dụng di động React Native CLI
│   ├── src/
│   │   ├── api/                             # Axios client & token interceptors
│   │   ├── context/                         # AuthContext & SocketContext
│   │   ├── navigation/                      # RootNavigator & Bottom Tabs
│   │   ├── screens/                         # Auth, Onboarding, Discover, Chat, Profile
│   │   └── components/                      # AI Icebreaker Bottom Sheet Modal
│   ├── App.tsx                              # App Root Component
│   ├── index.js                             # Native Entrypoint
│   └── package.json
├── .gitignore                               # Quy tắc chặn tệp rác & bảo vệ tuyệt đối file bí mật .env
├── AGENT.md                                 # Bản đồ chỉ mục hệ thống
└── README.md                                # Cẩm nang tổng quan dự án
```
