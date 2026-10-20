# 💘 CUPID AI - BACKEND API & WEBSOCKET SERVICE MANUAL
> Tài liệu kỹ thuật bàn giao cho đội ngũ Frontend & Mobile Developer.  
> Phiên bản: **1.0.0 (Production-Ready)**  
> Trạng thái kiểm thử: **23/23 End-to-End Tests Passed (100%)**

---

## ⚡ 1. KHỞI CHẠY NHANH (QUICK START IN 3 MINUTES)

### Bước 1: Chuẩn bị tệp môi trường `.env`
Sao chép từ file mẫu:
```bash
cp .env.example .env
```
> **Lưu ý bảo mật:** File `.env` chứa bí mật hệ thống và đã được chặn trong `.gitignore`. Tuyệt đối không commit tệp này lên Git.

### Bước 2: Khởi chạy Database PostgreSQL
Nếu dùng Docker:
```bash
docker compose up -d
```
Hoặc dùng PostgreSQL cài trực tiếp trên máy (mặc định cổng `5433`, database `cupid_dating_db`).

### Bước 3: Cài đặt thư viện, Migrate & Chạy Server
```bash
# 1. Cài đặt dependencies
npm install

# 2. Sinh Prisma Client & chạy migration CSDL
npx prisma generate
npx prisma migrate dev

# 3. Nạp 20 tài khoản sinh viên mẫu tại Hà Nội (kèm ảnh, MBTI, Mood)
npm run seed

# 4. Kiểm thử toàn bộ 23 luồng nghiệp vụ E2E
npm run test:e2e

# 5. Khởi chạy Server ở chế độ Development
npm run dev
```

* 🚀 **API Base URL:** `http://localhost:5000/api/v1`
* 📡 **Health Check:** `http://localhost:5000/api/health`
* ⚡ **WebSocket Server:** `ws://localhost:5000` (Socket.io)
* 🗄️ **Prisma Studio (Xem CSDL trực quan):** `npm run prisma:studio` -> `http://localhost:5555`
* 📮 **Postman Collection:** File [`cupid_ai_api_collection.json`](./cupid_ai_api_collection.json) đã được chuẩn bị sẵn, chỉ cần Import vào Postman/Insomnia/Thunder Client để test ngay mà không cần cấu hình thủ công!

---

## 📱 2. CẤU HÌNH KẾT NỐI CHO FRONTEND / MOBILE

Tùy vào môi trường chạy ứng dụng, cấu hình `API_BASE_URL` trong file `mobile/src/api/client.ts` như sau:

| Thiết bị chạy Client | Cấu hình Base URL | Ghi chú |
| :--- | :--- | :--- |
| **Android Emulator** | `http://10.0.2.2:5000/api/v1` | `10.0.2.2` trỏ về `localhost` của máy tính chủ |
| **iOS Simulator** | `http://localhost:5000/api/v1` | Trỏ trực tiếp localhost trên macOS |
| **Thiết bị thật (USB ADB / WiFi)** | `http://<IP_MÁY_TÍNH>:5000/api/v1` | Ví dụ: `http://192.168.1.15:5000/api/v1` (Cùng lớp mạng WiFi) |

---

## 🔑 3. DANH SÁCH TÀI KHOẢN TEST CÓ SẴN (SAU KHI CHẠY SEED)

Hệ thống đã nạp sẵn **20 hồ sơ sinh viên Hà Nội** với mật khẩu mặc định: **`MatKhau123@`**.

| Tên hiển thị | Email | Mật khẩu | MBTI | Tâm trạng (Mood) | Khu vực / Tọa độ |
| :--- | :--- | :--- | :---: | :--- | :--- |
| **Trần Mai Linh** | `linh.tran@test.com` | `MatKhau123@` | **ENFP** | Thèm trà sữa | Hoàn Kiếm (21.0285, 105.8544) |
| **Nguyễn Huy Hoàng** | `hoang.nguyen@test.com` | `MatKhau123@` | **INFP** | Cần người đi dạo | Cầu Giấy / Bách Khoa (21.0055, 105.8433) |
| **Lê Thu Hương** | `huong.le@test.com` | `MatKhau123@` | **INFJ** | Xem phim cuối tuần | Đống Đa (21.0225, 105.8185) |
| **Phạm Minh Đức** | `minh.duc@test.com` | `MatKhau123@` | **ENTJ** | Tập gym chung | Hai Bà Trưng (21.0035, 105.8415) |
| **Vũ Ngọc Ánh** | `ngoc.anh@test.com` | `MatKhau123@` | **ISFP** | Đang yêu đời | Đống Đa (21.0210, 105.8245) |
| **Đỗ Tuấn Kiệt** | `tuan.kiet@test.com` | `MatKhau123@` | **INTP** | Cà phê chuyện trò | Cầu Giấy (21.0360, 105.7905) |
| **Ngô Phương Thảo** | `phuong.thao@test.com` | `MatKhau123@` | **ENFJ** | Cần người đi dạo | Tây Hồ (21.0583, 105.8236) |
| **Trần Quốc Bảo** | `quoc.bao@test.com` | `MatKhau123@` | **ENTP** | Đi ăn đêm | Ba Đình (21.0335, 105.8345) |

> 💡 **Cơ chế Dev OTP Bypass:** Khi test đăng ký mới hoặc quên mật khẩu, có thể nhập ngay mã **`123456`** để kích hoạt tài khoản lập tức mà không cần kiểm tra hòm thư email thật.

---

## 📡 4. ĐẶC TẢ HỢP ĐỒNG API (RESTFUL API SPECIFICATION)

Toàn bộ API yêu cầu xác thực cần truyền Header:  
`Authorization: Bearer <accessToken>`

### 4.1. Module Xác thực (Authentication)
* **`POST /api/v1/auth/register`**
  * Body: `{ "email": "user@test.com", "password": "Password123@" }`
  * Response 201: `{ "success": true, "message": "...", "email": "..." }`
* **`POST /api/v1/auth/verify-otp`**
  * Body: `{ "email": "user@test.com", "otpCode": "123456" }`
  * Response 200: `{ "success": true, "accessToken": "...", "refreshToken": "...", "user": { "id": "...", "email": "...", "hasProfile": false } }`
* **`POST /api/v1/auth/resend-otp`**
  * Body: `{ "email": "user@test.com" }`
* **`POST /api/v1/auth/login`**
  * Body: `{ "email": "user@test.com", "password": "Password123@" }`
  * Response 200: `{ "success": true, "accessToken": "...", "refreshToken": "...", "user": { ... } }`
* **`POST /api/v1/auth/refresh-token`**
  * Body: `{ "refreshToken": "..." }`
  * Response 200: `{ "success": true, "accessToken": "...", "refreshToken": "...", "user": { ... } }`
* **`POST /api/v1/auth/google`**
  * Body: `{ "idToken": "...", "user": { "email": "...", "name": "...", "photo": "..." } }`
* **`POST /api/v1/auth/forgot-password`**
  * Body: `{ "email": "user@test.com" }`
* **`POST /api/v1/auth/reset-password`**
  * Body: `{ "email": "user@test.com", "otpCode": "123456", "newPassword": "NewPassword123@" }`
* **`PUT /api/v1/auth/change-password`** *(Cần Auth)*
  * Body: `{ "oldPassword": "...", "newPassword": "..." }`

---

### 4.2. Module Hồ sơ & Sở thích (Profile Management)
* **`GET /api/v1/profile/interests`** *(Cần Auth)*
  * Trả về danh sách sở thích và icon từ database:
  * Response 200: `{ "success": true, "count": 10, "interests": [ { "id": 1, "name": "Âm nhạc", "iconName": "musical-notes", "category": "Nghệ thuật" }, ... ] }`
* **`GET /api/v1/profile/me`** *(Cần Auth)*
  * Trả về thông tin hồ sơ của chính mình kèm trạng thái `isMoodActive` (còn hạn 24h hay không).
* **`GET /api/v1/profile/user/:userId`** *(Cần Auth)*
  * Xem hồ sơ chi tiết của đối phương (tính tuổi tự động, lọc ảnh, MBTI, mood tag).
* **`POST /api/v1/profile`** *(Cần Auth)*
  * Tạo hoặc cập nhật hồ sơ cá nhân:
  * Body:
    ```json
    {
      "fullName": "Nguyễn Văn A",
      "gender": "MALE",
      "birthDate": "2002-05-14",
      "bio": "Mô tả ngắn...",
      "heightCm": 175,
      "interestIds": [1, 2, 9],
      "photos": ["https://..."],
      "avatarUrl": "https://...",
      "latitude": 21.0285,
      "longitude": 105.8544
    }
    ```
* **`PUT /api/v1/profile/preferences`** *(Cần Auth)*
  * Cập nhật bộ lọc tìm kiếm: `{ "maxDistanceKm": 50, "ageMin": 18, "ageMax": 30 }`
* **`POST /api/v1/profile/upload`** *(Cần Auth)*
  * Tải ảnh lên hồ sơ: `{ "imageUrl": "https://..." }` hoặc `{ "imageBase64": "...", "isAvatar": true }` (tối đa 6 ảnh).
* **`PUT /api/v1/profile/mbti`** *(Cần Auth)*
  * Cập nhật mã MBTI: `{ "mbtiType": "INTJ" }`
* **`PUT /api/v1/profile/mood`** *(Cần Auth)*
  * Cập nhật tâm trạng trong ngày: `{ "dailyMood": "Thèm trà sữa" }`
* **`PUT /api/v1/profile/location`** *(Cần Auth)*
  * Cập nhật vị trí GPS / Chế độ giả lập Demo:
  * `{ "latitude": 21.0360, "longitude": 105.7905, "isVirtualLocation": true }`

---

### 4.3. Module Khám phá & Vuốt Ghép đôi (Discovery & Swipe)
* **`GET /api/v1/discovery/feed`** *(Cần Auth)*
  * Hỗ trợ bộ lọc query: `?maxDistance=50&gender=FEMALE&ageMin=18&ageMax=25`
  * Tự động tính khoảng cách Haversine (km), tính tuổi, lọc bỏ người đã vuốt hoặc đã unmatch.
  * Response 200:
    ```json
    {
      "success": true,
      "count": 10,
      "feed": [
        {
          "id": "uuid",
          "fullName": "Trần Mai Linh",
          "gender": "FEMALE",
          "age": 22,
          "heightCm": 162,
          "bio": "...",
          "mbtiType": "ENFP",
          "dailyMood": "Thèm trà sữa",
          "avatarUrl": "https://...",
          "photos": ["https://..."],
          "distanceKm": 5.4,
          "interests": ["Âm nhạc", "Du lịch"]
        }
      ]
    }
    ```
* **`POST /api/v1/swipes`** *(Cần Auth)*
  * Thao tác vuốt: `{ "targetUserId": "uuid", "action": "LIKE" }` (hoặc `"PASS"`)
  * Khi tương hợp 2 chiều:
    ```json
    {
      "success": true,
      "matched": true,
      "matchId": "uuid",
      "conversationId": "uuid",
      "matchedUser": { "id": "uuid", "fullName": "...", "avatarUrl": "..." }
    }
    ```

---

### 4.4. Module Hội thoại & Nhắn tin (Chat & Conversations)
* **`GET /api/v1/chat/conversations`** *(Cần Auth)*
  * Lấy danh sách hội thoại còn hiệu lực kèm tin nhắn mới nhất, thông tin đối phương và MBTI.
* **`GET /api/v1/chat/conversations/:conversationId/messages`** *(Cần Auth)*
  * Lấy toàn bộ lịch sử tin nhắn của cuộc trò chuyện theo thứ tự thời gian.
* **`PUT /api/v1/chat/conversations/:conversationId/read`** *(Cần Auth)*
  * Đánh dấu toàn bộ tin nhắn đối phương gửi là đã đọc.
* **`POST /api/v1/chat/unmatch`** *(Cần Auth)*
  * Hủy kết nối: `{ "matchId": "uuid" }` -> Đóng phòng chat và không bao giờ hiển thị lại đối phương.

---

### 4.5. Module Trợ lý AI (Google Gemini Icebreaker)
* **`POST /api/v1/ai/icebreaker`** *(Cần Auth - Giới hạn 20 lần/ngày)*
  * Body: `{ "matchId": "uuid" }` (Hệ thống hỗ trợ truyền linh hoạt cả `matchId` hoặc `conversationId`).
  * Phân tích điểm chung (Sở thích, MBTI, Tâm trạng đối phương) và trả về 3 phong cách mở lời dí dỏm bằng tiếng Việt:
  * Response 200:
    ```json
    {
      "success": true,
      "commonGround": "Cả hai đều yêu thích Đọc sách và tính cách hướng nội (INFP & INTJ)",
      "icebreakers": [
        {
          "style": "Hài hước",
          "text": "Nghe đồn hai đứa INFP và INTJ gặp nhau thì cả buổi chỉ nhìn nhau cười qua trang sách đúng không bạn? Chào Linh nha!"
        },
        {
          "style": "Tinh tế",
          "text": "Chào Linh, thấy bạn đang để tâm trạng 'Thèm trà sữa' mà lại thích đọc sách, bạn có quán cafe sách nào yên tĩnh tủ ruột không?"
        },
        {
          "style": "Trực diện",
          "text": "Chào bạn! Mình thấy gu đọc sách của hai đứa mình có khá nhiều điểm chung, rất vui được kết nối với bạn!"
        }
      ]
    }
    ```

---

## ⚡ 5. TỪ ĐIỂN SỰ KIỆN REAL-TIME (SOCKET.IO DICTIONARY)

Kết nối: `const socket = io("http://<HOST>:5000", { transports: ['websocket'] });`

| Tên sự kiện | Chiều (Direction) | Payload | Ý nghĩa nghiệp vụ |
| :--- | :---: | :--- | :--- |
| **`join_user_room`** | Client ➔ Server | `{ "userId": "uuid" }` | Đăng ký nhận thông báo cá nhân (Popup Match, Tin nhắn mới). Gọi ngay khi app khởi động. |
| **`join_conversation`** | Client ➔ Server | `{ "conversationId": "uuid" }` | Tham gia phòng chat của cuộc trò chuyện tương ứng khi mở màn hình Chat. |
| **`send_message`** | Client ➔ Server | `{ "conversationId": "uuid", "senderId": "uuid", "content": "string", "isAiGenerated": false }` | Người dùng bấm gửi tin nhắn văn bản. |
| **`receive_message`** | Server ➔ Client | `{ "id": "uuid", "conversationId": "uuid", "senderId": "uuid", "content": "string", "createdAt": "ISO" }` | Phát tán tin nhắn mới tức thời cho cả 2 bên trong phòng chat. |
| **`new_message_notification`**| Server ➔ Client | `{ "conversationId": "uuid", "senderId": "uuid", "content": "string" }` | Bắn tới phòng cá nhân đối phương khi họ đang ở tab khác ngoài phòng chat. |
| **`typing_status`** | Client ➔ Server | `{ "conversationId": "uuid", "userId": "uuid", "isTyping": true }` | Phát cờ đang soạn tin nhắn. |
| **`user_typing`** | Server ➔ Client | `{ "userId": "uuid", "isTyping": true }` | Hiển thị hiệu ứng "Đang soạn tin..." trên máy đối phương. |
| **`mark_read`** | Client ➔ Server | `{ "conversationId": "uuid", "userId": "uuid" }` | Đánh dấu tin nhắn đã đọc qua socket. |
| **`messages_read`** | Server ➔ Client | `{ "conversationId": "uuid", "readBy": "uuid" }` | Cập nhật trạng thái đã xem trên máy người gửi. |
| **`match_notification`** | Server ➔ Client | `{ "matchId": "uuid", "conversationId": "uuid", "partner": { ... } }` | Bắn popup chúc mừng "It's a Match!" lập tức trên cả 2 máy khi cùng Like. |
| **`match_unmatched`** | Server ➔ Client | `{ "matchId": "uuid" }` | Đóng phòng chat lập tức trên cả 2 máy khi có người bấm Hủy kết nối. |

---

## 🧪 6. KIỂM THỬ TỰ ĐỘNG (AUTOMATED TEST SUITE)

Để chạy kiểm thử tự động toàn bộ API và WebSocket trước khi bàn giao:
```bash
npm run test:e2e
```
Kết quả mong đợi: **`ALL 23 BACKEND MODULE END-TO-END TESTS PASSED 100%!`**
