# 💘 Cupid AI - Tài Liệu Swagger / OpenAPI 3.0 Chuẩn

Tài liệu đặc tả toàn diện cho Backend API và Real-time WebSocket Server của hệ thống ứng dụng hẹn hò thông minh **Cupid AI**.

---

## 📂 Danh mục tài liệu trong thư mục này

| Tên File | Định dạng | Mục đích sử dụng |
| :--- | :--- | :--- |
| **[`openapi.json`](./openapi.json)** | JSON (OpenAPI 3.0.3) | Đặc tả API chuẩn dùng cho Postman import, Swagger UI, SDK Generator |
| **[`openapi.yaml`](./openapi.yaml)** | YAML (OpenAPI 3.0.3) | Dùng cho Swagger Editor, Git diff, Readme.io, Redoc |
| **[`index.html`](./index.html)** | Standalone HTML | Giao diện tương tác Swagger UI offline, mở trực tiếp bằng trình duyệt |
| **[`README.md`](./README.md)** | Markdown | Hướng dẫn sử dụng và kiểm thử API cho lập trình viên FE & BE |

---

## 🚀 3 Cách xem và tương tác Swagger API

### Cách 1: Xem trực tiếp từ Server Backend (Khuyên dùng khi Dev)
Khi chạy backend (`npm run dev` trong thư mục `backend`):
- Truy cập Swagger UI trực tiếp tại: **`http://localhost:5000/api-docs`**
- File đặc tả thô: `http://localhost:5000/api-docs/openapi.json`

### Cách 2: Mở file `index.html` độc lập (Không cần bật server)
- Click đúp vào file **[`docs/swagger/index.html`](./index.html)** hoặc kéo thả vào trình duyệt Chrome/Edge/Firefox.
- Giao diện Swagger UI chuẩn sẽ hiển thị toàn bộ 27 endpoints, mô hình dữ liệu (schemas) và ví dụ mẫu.

### Cách 3: Import vào Postman / Insomnia / Swagger Editor
1. Mở [Swagger Editor Online](https://editor.swagger.io/) hoặc ứng dụng Postman.
2. Chọn **File -> Import** -> Chọn file **`docs/swagger/openapi.json`** hoặc file có sẵn trong repo: `backend/cupid_ai_api_collection.json`.
3. Toàn bộ endpoints, headers và mock request bodies sẽ tự động được nạp.

---

## 🔑 Hướng dẫn Xác thực & Test API trên Swagger

1. **Đăng ký / Đăng nhập**:
   - Gọi endpoint `POST /api/v1/auth/login` (hoặc `POST /api/v1/auth/verify-otp`).
   - Sao chép chuỗi `accessToken` trong JSON trả về.
2. **Authorize trên Swagger UI**:
   - Bấm vào nút màu xanh **Authorize 🔓** ở góc trên bên phải màn hình Swagger UI.
   - Nhập token vào ô `Value` (Swagger UI sẽ tự động thêm tiền tố `Bearer `).
   - Bấm **Authorize** -> **Close**.
3. **Thực thi API**:
   - Giờ đây mọi endpoint có icon ổ khóa 🔒 (Profile, Discovery, Swipes, Chat, AI) đều đã được gắn token hợp lệ!

> [!TIP]
> **Dev OTP Bypass:** Khi test chức năng đăng ký (`/auth/register`), hệ thống trong chế độ development cho phép nhập trực tiếp mã OTP **`123456`** tại `/auth/verify-otp` để kích hoạt tài khoản tức thì mà không cần kiểm tra hộp thư email!

---

## ⚡ Real-time WebSocket Events Catalog (Socket.io)

Hệ thống sử dụng **Socket.io v4** chạy đồng thời trên cổng `5000`. URL kết nối:
- Web / iOS Simulator: `http://localhost:5000`
- Android Emulator: `http://10.0.2.2:5000`
- Real Phone / LAN: `http://<IP_MAY_TINH>:5000`

### 1. Phía Client phát đi (Emit)
| Sự kiện (Event) | Tham số (Payload) | Mô tả |
| :--- | :--- | :--- |
| `join_user_room` | `{ userId: string }` | Đăng ký lắng nghe phòng cá nhân ngay sau khi kết nối socket |
| `send_message` | `{ conversationId: string, content: string, recipientId: string }` | Gửi tin nhắn real-time cho đối phương trong cuộc hội thoại |
| `typing_start` | `{ conversationId: string, recipientId: string }` | Báo cho đối phương biết mình đang gõ tin nhắn |
| `typing_stop` | `{ conversationId: string, recipientId: string }` | Dừng hiệu ứng đang gõ tin nhắn |

### 2. Phía Client lắng nghe (Listen)
| Sự kiện (Event) | Dữ liệu nhận được (Data) | Mô tả |
| :--- | :--- | :--- |
| `receive_message` | `ChatMessage Object` (id, content, senderId, conversationId, createdAt) | Nhận tin nhắn mới từ đối phương |
| `user_typing` | `{ conversationId: string, isTyping: boolean }` | Hiển thị hiệu ứng đang gõ của đối phương |
| `match_notification`| `{ matchId: string, conversationId: string, partner: PublicProfile }` | Thông báo tức thì khi 2 người cùng quẹt Like nhau |

---

## 📋 Bảng mã trạng thái HTTP chuẩn (HTTP Status Codes)

- **`200 OK`**: Yêu cầu thành công, dữ liệu trả về hợp lệ.
- **`201 Created`**: Tạo mới thành công (Đăng ký tài khoản, gửi tin nhắn, tạo match).
- **`400 Bad Request`**: Dữ liệu gửi lên thiếu trường bắt buộc hoặc sai định dạng.
- **`401 Unauthorized`**: Token không tồn tại, sai định dạng hoặc đã hết hạn.
- **`404 Not Found`**: Không tìm thấy tài nguyên (User, Profile, Cuộc hội thoại không tồn tại).
- **`409 Conflict`**: Xung đột dữ liệu (Email đã được kích hoạt trước đó).
- **`429 Too Many Requests`**: Vượt quá hạn mức gọi API (Ví dụ: Giới hạn 20 lượt gọi AI Icebreaker/ngày).
- **`500 Internal Server Error`**: Lỗi hệ thống nội bộ máy chủ.
