# CHIẾN LƯỢC KIỂM THỬ, NGHIỆM THU VÀ QUẢN LÝ RỦI RO (TESTING, UAT & RISK REGISTER)
## DỰ ÁN: SMART DATING APP (CUPID AI) - BÀI TẬP LỚN
**Phiên bản:** 1.0 (Official QA & Risk Strategy)  
**Vai trò:** Senior QA Lead & Risk Manager  

---

## 1. CHIẾN LƯỢC KIỂM THỬ TỔNG THỂ (TEST STRATEGY)

Hệ thống được kiểm thử đa tầng nhằm đảm bảo bài thuyết trình và demo đồ án diễn ra hoàn hảo, không gặp bất kỳ lỗi đột ngột nào trước mặt hội đồng giảng viên:

```
[ TẦNG 4: KIỂM THỬ NGHIỆM THU NGƯỜI DÙNG & DEMO (UAT Scenario Testing) ]
                                ▲
[ TẦNG 3: KIỂM THỬ CHẤT LƯỢNG AI & FALLBACK (AI Quality & Edge Case Testing) ]
                                ▲
[ TẦNG 2: KIỂM THỬ TÍCH HỢP & REAL-TIME (Integration & WebSocket Socket.io Testing) ]
                                ▲
[ TẦNG 1: KIỂM THỬ ĐƠN VỊ & QUY TẮC NGHIỆP VỤ (Unit & Business Logic Testing) ]
```

### 1.1. Phạm vi Kiểm thử
1. **Kiểm thử Chức năng (Functional Testing):** Xác thực OTP email, tính toán khoảng cách GPS, logic vuốt 2 chiều sinh Match, tính điểm MBTI và hết hạn nhãn Mood sau 24h.
2. **Kiểm thử Thời gian thực (Real-time Testing):** Kiểm tra đồng bộ tin nhắn qua Socket.io trên 2 thiết bị khác nhau, kiểm tra trạng thái đang gõ (`typing...`) và popup thông báo Match.
3. **Kiểm thử Chất lượng AI (AI Quality & Prompt Robustness):** Đo lường tính tự nhiên của câu mở lời bằng tiếng Việt, tính an toàn không chứa từ ngữ độc hại, thời gian phản hồi của mô hình Gemini và kiểm thử khả năng chuyển đổi sang Fallback khi mất mạng.
4. **Kiểm thử Kịch bản Demo Hội đồng (Live Demo Walkthrough):** Giả lập toàn bộ hành trình của giảng viên chấm bài từ lúc tạo 2 tài khoản mới đến lúc match và nhắn tin.

---

## 2. BỘ KỊCH BẢN KIỂM THỬ CHI TIẾT (TEST CASES SPECIFICATION)

| Mã Test Case | Tên Kịch bản Kiểm thử | Dữ liệu Đầu vào (Test Inputs) | Kết quả Mong đợi (Expected Output) | Mức độ Ưu tiên |
| :--- | :--- | :--- | :--- | :---: |
| **TC-01** | Đăng ký tài khoản với Email mới | Email: `student@test.com`, Pass: `MatKhau123@` | Hệ thống tạo user chưa kích hoạt, gửi email chứa mã OTP 6 số ngẫu nhiên. Trả về mã HTTP 201. | **P0 (Critical)** |
| **TC-02** | Nhập sai mã OTP hoặc OTP hết hạn | Mã OTP nhập vào: `000000` (Sai) | Hệ thống báo lỗi "Mã OTP không chính xác hoặc đã hết hạn". Không cho phép đăng nhập. Mã HTTP 400. | **P0 (Critical)** |
| **TC-03** | Nhập đúng OTP kích hoạt | Mã OTP: Đúng 6 số vừa nhận trong email | Tài khoản chuyển trạng thái `isVerified = true`, trả về cặp JWT Token hợp lệ, chuyển màn hình tạo Profile. | **P0 (Critical)** |
| **TC-04** | Trắc nghiệm tính cách MBTI | Hoàn thành 12 câu hỏi trắc nghiệm rút gọn | Hệ thống tính toán chính xác 4 chiều (E/I, S/N, T/F, J/P), gán đúng mã MBTI (VD: `ENFP`) lên thẻ hồ sơ. | **P1 (High)** |
| **TC-05** | Thiết lập Nhãn Tâm trạng (Mood) | Chọn nhãn: "Thèm trà sữa" lúc 10:00 | Nhãn hiển thị ngay trên avatar/profile. CSDL lưu `moodUpdatedAt`. Kiểm tra logic sau 24h tự động ẩn nhãn. | **P1 (High)** |
| **TC-06** | Tính toán khoảng cách GPS giả lập | User A: Tọa độ Hồ Gươm (21.0285, 105.8544)<br>User B: Tọa độ Cầu Giấy (21.0360, 105.7905) | Hệ thống hiển thị khoảng cách xấp xỉ ~6.5 km trên thẻ của đối phương với sai số < 5%. | **P0 (Critical)** |
| **TC-07** | Thao tác Vuốt Like 1 chiều | User A vuốt phải (Like) User B (User B chưa vuốt) | Bản ghi Swipe được lưu vào CSDL với action `LIKE`. Chưa sinh Match, không có popup thông báo. | **P0 (Critical)** |
| **TC-08** | Thao tác Vuốt Like 2 chiều (Match) | User B đăng nhập và vuốt phải (Like) User A | Hệ thống phát hiện tương hợp 2 chiều, tạo bản ghi `Match` + `Conversation`. Cả 2 máy nhận popup "It's a Match!" qua Socket.io. | **P0 (Critical)** |
| **TC-09** | Nhắn tin Real-time qua Socket.io | User A gửi "Chào Linh!" từ máy 1 | Máy 2 (User B) nhận được tin nhắn tức thì (< 100ms) mà không cần reload trang. Âm thanh thông báo phát ra. | **P0 (Critical)** |
| **TC-10** | Trợ lý AI sinh gợi ý mở lời | Nhấn nút "✨ Gợi ý mở lời AI" trong chat | Backend gọi Gemini API thành công, trả về đúng 3 phong cách (Hài hước, Tinh tế, Trực diện) tiếng Việt trong vòng < 3s. | **P0 (Critical)** |
| **TC-11** | Chạm để điền câu gợi ý AI | Chạm vào câu gợi ý phong cách "Hài hước" | Ô soạn thảo tin nhắn tự động điền toàn bộ nội dung câu nói. Người dùng có thể sửa đổi và bấm gửi bình thường. | **P1 (High)** |
| **TC-12** | Xử lý ngoại lệ Fallback khi mất AI | Tắt mạng internet của AI hoặc nhập API Key rỗng | Backend tự động chuyển sang Fallback Templates, trả về 3 câu chào theo sở thích trong < 100ms, không crash app. | **P1 (High)** |

---

## 3. SỔ ĐĂNG KÝ VÀ QUẢN LÝ RỦI RO (RISK REGISTER)

| Mã Rủi ro | Mô tả Rủi ro | Nguyên nhân tiềm ẩn | Xác suất | Tác động | Biện pháp Phòng ngừa (Mitigation) | Phương án Ứng phó khi xảy ra (Contingency) | Người chịu trách nhiệm |
| :--- | :--- | :--- | :---: | :---: | :--- | :--- | :---: |
| **RSK-01** | Google Gemini API bị chạm Rate Limit hoặc chặn vùng tại phòng thi | Dùng gói Free Tier (15 RPM) bị vượt ngưỡng hoặc mạng trường chặn truy cập API nước ngoài. | Trung bình | **Cao** | Thiết kế sẵn cơ chế Fallback Rule-based trong mã nguồn Backend; lưu cache kết quả gợi ý. | Chuyển hệ thống sang chế độ Offline Fallback ngay lập tức; giải trình cơ chế dự phòng với hội đồng. | Solution Architect |
| **RSK-02** | Mạng WiFi hội đồng yếu, làm đứt kết nối WebSocket Socket.io | Mạng trường đại học thường đông người truy cập, chập chờn. | **Cao** | **Cao** | Sử dụng tính năng phát WiFi 4G/5G cá nhân trực tiếp từ điện thoại cho cả Laptop và máy test. | Bật cơ chế Auto-reconnect của Socket.io kèm tính năng kéo-thả để tải lại (Pull-to-refresh) tin nhắn. | Mobile & Backend Dev |
| **RSK-03** | Khó demo khoảng cách GPS vì 2 máy ở cùng một vị trí | Thuyết trình trong cùng một phòng học khiến 2 điện thoại có cùng tọa độ GPS. | **Cao** | Trung bình | Tích hợp sẵn tính năng "Chế độ Vị trí Giả lập" (Virtual Location Picker) ngay trong cài đặt Profile. | Cho phép người thuyết trình bấm nút "Đặt vị trí ở Cầu Giấy" và máy kia "Đặt ở Hoàn Kiếm" để minh họa cự ly. | Mobile Developer |
| **RSK-04** | Dịch vụ gửi Email OTP bị chậm trễ hoặc rơi vào Spam | Dịch vụ SMTP miễn phí có thể trễ vài phút làm gián đoạn thời gian demo ngắn ngủi của hội đồng. | Trung bình | **Cao** | Ghi mã OTP trực tiếp vào console log của Backend và cho phép nhập mã cố định `123456` trong môi trường DEV/DEMO. | Khi demo, bật màn hình Console Backend để giảng viên thấy mã OTP nhảy ra ngay lập tức, chứng minh hệ thống chạy thật. | Backend Developer |
| **RSK-05** | Lỗi build Gradle hoặc xung đột thư viện Native trên React Native CLI | Cấu hình Android SDK, JDK hoặc thư viện Native (`react-native-reanimated`, `react-native-gesture-handler`) gặp lỗi linking. | Trung bình | Trung bình | Sử dụng các phiên bản thư viện ổn định đã kiểm chứng trên React Native CLI; cấu hình đúng file `android/app/build.gradle` và `MainApplication.kt/java`. | Đã chuẩn bị sẵn mẫu cấu hình build Gradle chuẩn và tài liệu hướng dẫn khắc phục lỗi build thường gặp. | Mobile Developer & PM |

---

## 4. MA TRẬN TRUY VẾT YÊU CẦU (REQUIREMENT TRACEABILITY MATRIX - RTM)

Ma trận này chứng minh tính kết nối xuyên suốt: Mọi mục tiêu kinh doanh/học thuật đều có yêu cầu cụ thể, thành phần kiến trúc xử lý và ca kiểm thử nghiệm thu tương ứng:

| Mã Mục tiêu | Mã Yêu cầu (FR/NFR) | Thành phần Kiến trúc (Component) | Hạng mục WBS | Mã Test Case | Tiêu chí Nghiệm thu (UAT Criteria) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **OBJ-01** (Định danh an toàn, không tốn phí) | FR-01, FR-02, NFR-02 | `AuthService`, `Nodemailer`, `JWT Middleware` | WP 2.1, WP 3.1 | TC-01, TC-02, TC-03 | Đăng ký nhận OTP qua email, đăng nhập bảo mật bằng Token, không tốn chi phí viễn thông. |
| **OBJ-02** (Xóa bỏ hồ sơ ảo & hiểu tính cách) | FR-03, FR-04, FR-05 | `ProfileService`, `MBTI Engine`, `Cloudinary` | WP 2.2, WP 2.3, WP 3.2, WP 3.3 | TC-04, TC-05 | Hồ sơ hiển thị huy hiệu MBTI (16 nhóm) và Mood tag tự động cập nhật/reset theo chu kỳ 24h. |
| **OBJ-03** (Ghép đôi chuẩn xác theo bán kính) | FR-06, FR-07 | `MatchingService` (Haversine Algorithm), `Expo Location` | WP 2.4, WP 2.5, WP 3.4, WP 3.5 | TC-06, TC-07, TC-08 | Tính đúng cự ly khoảng cách giữa 2 tọa độ; kích hoạt thông báo Match ngay khi 2 người cùng Like nhau. |
| **OBJ-04** (Tương tác tức thì) | FR-08, NFR-01 | `ChatGateway` (Socket.io), `PostgreSQL Message Table` | WP 4.1, WP 4.2 | TC-09 | Tin nhắn hiển thị trên máy nhận < 100ms, có hiệu ứng typing và lưu vĩnh viễn trong CSDL. |
| **OBJ-05** (Xóa bỏ rào cản mở lời bằng AI) | FR-09, NFR-01 | `AIService` (Google Gemini 1.5 Flash), `Prompt Pipeline` | WP 4.3, WP 4.4, WP 4.5 | TC-10, TC-11, TC-12 | Trả về 3 phong cách mở lời dí dỏm bằng tiếng Việt < 3s; chạm để điền vào ô chat; có Fallback an toàn. |
