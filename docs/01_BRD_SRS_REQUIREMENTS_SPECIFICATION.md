# TÀI LIỆU YÊU CẦU NGHIỆP VỤ VÀ ĐẶC TẢ HỆ THỐNG (BRD & SRS)
## DỰ ÁN: ỨNG DỤNG HẸN HÒ THÔNG MINH (SMART DATING APP - CUPID AI)
**Mã dự án:** BTL-SE-DATING-2026  
**Vai trò:** Senior Business Analyst & Solution Architect  
**Phiên bản:** 1.0 (Official Release Specification)  
**Trạng thái:** Đã phê duyệt (Approved)  

---

## 1. TỔNG QUAN DỰ ÁN (EXECUTIVE SUMMARY)

### 1.1. Bối cảnh thị trường & Nỗi đau (Pain Points)
Các ứng dụng hẹn hò đại trà hiện nay (Tinder, Bumble) đang đối mặt với những vấn đề cốt lõi làm suy giảm trải nghiệm người dùng nghiêm trọng:
1. **Nạn "Match ảo" (Passive Swiping):** Người dùng vuốt phải theo phản xạ ngoại hình nhưng không có ý định trò chuyện nghiêm túc, tỷ lệ match cao nhưng không chuyển hóa thành hội thoại thật (> 60% match bị bỏ rơi).
2. **Khủng hoảng mở lời (First Message Anxiety / Ghosting):** Hơn 75% người dùng, đặc biệt là người hướng nội (Introvert), gặp bế tắc khi nghĩ câu mở đầu ấn tượng. Các câu chào kinh điển như *"Hi em", "Chào bạn", "Làm quen nha"* gây nhàm chán và bị ngó lơ.
3. **Thiếu sự thấu hiểu chiều sâu:** Hồ sơ quá ngắn gọn, chỉ hiển thị vài bức ảnh đã qua chỉnh sửa, thiếu các chỉ số tâm lý học (như tính cách MBTI) và trạng thái cảm xúc thực tế trong ngày (Daily Mood).

### 1.2. Mục tiêu dự án (Business & Academic Objectives)
* **Mục tiêu học thuật:** Xây dựng đồ án Bài Tập Lớn chuyên ngành Công nghệ Phần mềm hoàn chỉnh, đáp ứng tiêu chuẩn công nghiệp: Kiến trúc phân tầng sạch (Clean Architecture), mô hình RESTful API + Real-time WebSocket (Socket.io), CSDL quan hệ PostgreSQL với Prisma ORM, Frontend di động đa nền tảng React Native CLI thuần (Bare React Native), tích hợp AI Agent (Google Gemini API).
* **Mục tiêu sản phẩm:** Giải quyết trực diện nỗi đau hội thoại bằng **Trợ lý AI gợi ý câu mở lời thông minh (Icebreaker)** dựa trên phân tích điểm giao thoa giữa 2 hồ sơ (Sở thích, MBTI, Mood tag), đồng thời tăng tính gắn kết qua bộ trắc nghiệm MBTI nhanh và trạng thái tâm trạng thời gian thực.

---

## 2. PHẠM VI HỆ THỐNG (SYSTEM SCOPE)

### 2.1. Phạm vi Phiên bản 1 (MVP - Scope B) - Cam kết hoàn thành trong 2 tuần
* **Module 1: Xác thực & Quản lý tài khoản (Auth & Identity):**
  * Đăng ký tài khoản bằng Email & Mật khẩu.
  * Xác thực qua mã OTP gửi về Email (sử dụng Nodemailer / SMTP Service).
  * Đăng nhập, cấp phát JWT Access Token & Refresh Token an toàn.
  * Đổi mật khẩu, quên mật khẩu qua Email OTP.
* **Module 2: Quản lý Hồ sơ Cá nhân (Profile Management):**
  * Thiết lập thông tin cơ bản: Tên, Giới tính, Ngày sinh (tính tuổi tự động >= 18), Chiều cao, Nghề nghiệp.
  * Tải lên và quản lý ảnh hồ sơ (Tối đa 6 ảnh, tích hợp Cloudinary CDN).
  * Bộ thẻ sở thích (Interests tag) chọn lọc từ danh mục có sẵn.
  * **Trắc nghiệm MBTI nhanh:** Bài test 12 câu hỏi trắc nghiệm rút gọn hoặc cho phép tự chọn mã MBTI (16 nhóm tính cách) hiển thị huy hiệu trên hồ sơ.
  * **Nhãn trạng thái tâm trạng (Daily Mood Tag):** Chọn 1 trạng thái trong ngày (VD: *"Thèm trà sữa"*, *"Cần người đi dạo"*, *"Xem phim cuối tuần"*...), tự động hết hạn sau 24h.
* **Module 3: Khám phá & Ghép đôi (Discovery & Matching):**
  * Lấy tọa độ GPS thực tế từ thiết bị (`@react-native-community/geolocation`) và hỗ trợ **Chế độ giả lập vị trí (Virtual Location Mode)** phục vụ demo chấm điểm.
  * Bộ lọc khám phá: Giới tính quan tâm, khoảng cách bán kính (1km - 100km), độ tuổi (min - max).
  * Thuật toán hiển thị thẻ (Card Deck): Loại trừ các user đã vuốt hoặc đã match.
  * Cơ chế vuốt: Vuốt phải (Like), vuốt trái (Pass).
  * Sự kiện tương hợp (Match): Kích hoạt ngay lập tức khi cả hai cùng Like nhau (Double-opt-in).
* **Module 4: Nhắn tin Thời gian thực (Real-time Messaging):**
  * Danh sách hội thoại tương hợp (Matches & Conversations List).
  * Khung chat 1-1 thời gian thực với Socket.io: Gửi/nhận tin nhắn văn bản tức thì.
  * Trạng thái tin nhắn: Đang soạn thảo (`typing...`), trạng thái gửi thành công, mốc thời gian.
  * Huỷ kết nối (Unmatch): Xoá phiên trò chuyện và không bao giờ hiển thị lại đối phương.
* **Module 5: Trợ lý AI Gợi ý Mở lời (Smart AI Icebreaker - Core AI):**
  * Nút "Gợi ý mở lời bằng AI" tích hợp trực tiếp trong khung chat của cuộc match mới.
  * Hệ thống tự động thu thập ngữ cảnh: So sánh profile 2 người (Sở thích chung, MBTI đối xứng/tương thích, Mood tag hiện tại).
  * Gọi Google Gemini API sinh ra **3 phong cách mở lời độc đáo** bằng tiếng Việt:
    1. *Hài hước, dí dỏm*
    2. *Tinh tế, lịch thiệp*
    3. *Trực diện, cởi mở*
  * Cơ chế Human-in-the-loop: Chạm để đưa câu gợi ý vào ô nhập tin nhắn, người dùng có toàn quyền chỉnh sửa trước khi bấm gửi.

### 2.2. Ngoài phạm vi Phase 1 (Đưa vào Roadmap Phase 2)
* Đăng nhập FaceID / Vân tay cục bộ.
* Đồng bộ gu âm nhạc qua Spotify/Apple Music OAuth.
* Trò chơi phá băng minigame trong chat (Truth or Dare).
* Chế độ "Luyện tập mở lời" giả lập đối phương bằng AI.
* AI quét kiểm duyệt hình ảnh nhạy cảm NSFW thời gian thực.
* Tích hợp bản đồ quán cafe đối tác và voucher O2O.
* Cổng thanh toán gói Plus / Gold (Stripe / VNPay).

---

## 3. ĐỐI TƯỢNG SỬ DỤNG (USER PERSONAS)

| Mã Persona | Đối tượng | Đặc điểm hành vi | Nhu cầu cốt lõi |
| :--- | :--- | :--- | :--- |
| **PER-01** | **Nguyễn Văn An (21 tuổi)** - Sinh viên đại học, tính cách INFP (Hướng nội). | Thích đọc sách, nghe podcast, ngại bắt chuyện trước với người lạ vì sợ vô duyên. | Cần AI gợi ý câu mở lời thông minh từ điểm chung sở thích để vượt qua rào cản tâm lý e ngại ban đầu. |
| **PER-02** | **Trần Mai Linh (23 tuổi)** - Nhân viên văn phòng, tính cách ENFP (Hướng ngoại). | Bận rộn, nhận được hàng chục match mỗi ngày nhưng ngán ngẩm với các câu chào rập khuôn. | Muốn thấy ngay Mood tag trong ngày và tính cách MBTI của đối phương; chỉ phản hồi những câu mở lời sáng tạo. |
| **PER-03** | **Giảng viên / Hội đồng chấm BTL** - Người đánh giá đồ án. | Yêu cầu kiểm tra code rõ ràng, demo kịch bản mượt mà không lỗi crash, kiến trúc đáp ứng chuẩn kỹ thuật. | Cần tính năng đổi GPS giả lập để test 2 tài khoản match với nhau ngay trong phòng thi/hội đồng. |

---

## 4. DANH SÁCH YÊU CẦU CHỨC NĂNG (FUNCTIONAL REQUIREMENTS - FR)

| Mã Yêu cầu | Tên chức năng | Mô tả chi tiết | Độ ưu tiên | Tiêu chí nghiệm thu (Acceptance Criteria) |
| :--- | :--- | :--- | :---: | :--- |
| **FR-01** | Đăng ký & Xác thực Email OTP | Cho phép nhập email hợp lệ, mật khẩu (>= 8 ký tự). Hệ thống gửi mã OTP 6 số ngẫu nhiên qua email có hiệu lực 5 phút. | **Must-Have** | Đăng ký thành công khi nhập đúng OTP. Báo lỗi khi OTP sai/hết hạn. Không cho phép trùng email. |
| **FR-02** | Đăng nhập & Quản lý Phiên | Xác thực thông tin đăng nhập, sinh cặp JWT (Access Token 1h, Refresh Token 7d). Lưu trữ token an toàn tại client. | **Must-Have** | Đăng nhập trả về Token và điều hướng vào App. Chặn truy cập API khi token hết hạn. |
| **FR-03** | Khởi tạo Hồ sơ & Upload Ảnh | Cho phép nhập Bio, giới tính, ngày sinh, chọn tối đa 5 sở thích, upload tối đa 6 ảnh lên Cloudinary. | **Must-Have** | Ảnh được resize tối ưu trước khi upload. Lưu trữ link HTTPS từ Cloudinary vào DB. |
| **FR-04** | Trắc nghiệm MBTI Rút gọn | Cung cấp bài test 12 câu (A/B) đo lường 4 chiều: E/I, S/N, T/F, J/P. Tự động tính toán và gắn nhãn MBTI (VD: INTJ) lên hồ sơ. Hỗ trợ tự chọn nếu đã biết. | **Must-Have** | Hiển thị huy hiệu MBTI trên thẻ hồ sơ; người dùng có thể làm lại bài test bất kỳ lúc nào. |
| **FR-05** | Nhãn Tâm trạng (Daily Mood) | Cho phép chọn 1 trạng thái từ 8 lựa chọn có sẵn. Hệ thống lưu mốc thời gian và tự động ẩn nhãn sau 24h. | **Must-Have** | Mood tag hiển thị nổi bật trên thẻ vuốt; tự động reset khi quá 24h kể từ lúc cập nhật. |
| **FR-06** | Khám phá & Bộ lọc GPS | Hiển thị thẻ người dùng theo bán kính (Haversine formula), độ tuổi, giới tính. Hỗ trợ chuyển đổi giữa GPS máy thật và GPS giả lập. | **Must-Have** | Không hiển thị lại người đã vuốt. Tính chính xác khoảng cách (km) giữa 2 tọa độ. |
| **FR-07** | Thao tác Vuốt & Match | Vuốt phải (Like) lưu vào bảng Swipes. Nếu phát hiện đối phương đã Like mình trước đó -> Tạo bản ghi Match và bắn thông báo real-time. | **Must-Have** | Khi match xảy ra, cả 2 máy nhận được popup "It's a Match!" trong vòng < 500ms. |
| **FR-08** | Chat 1-1 Real-time | Giao diện nhắn tin trực tiếp qua Socket.io. Hiển thị danh sách hội thoại, tin nhắn mới nhất, trạng thái online/offline và typing. | **Must-Have** | Tin nhắn hiển thị tức thì trên cả 2 màn hình không cần reload lại trang. Lưu trữ vĩnh viễn vào CSDL. |
| **FR-09** | AI Gợi ý Mở lời (Icebreaker) | Nhấn nút "Gợi ý AI" trong chat match mới. BE tổng hợp profile 2 bên -> Prompt Google Gemini -> Trả về 3 câu chào. Bấm câu chào sẽ điền vào input. | **Must-Have** | Thời gian phản hồi AI < 3.5s. Trả về đúng 3 phong cách (Hài hước, Tinh tế, Trực diện). Không tự ý gửi tin. |
| **FR-10** | Huỷ kết nối (Unmatch) | Người dùng có thể huỷ match. Xoá cuộc hội thoại khỏi danh sách của cả hai và huỷ quan hệ kết nối. | **Must-Have** | Ngay lập tức đóng phòng chat, đối phương không thể gửi tin nhắn tiếp. |

---

## 5. DANH SÁCH YÊU CẦU PHI CHỨC NĂNG (NON-FUNCTIONAL REQUIREMENTS - NFR)

* **NFR-01 (Hiệu năng - Performance):**
  * Thời gian phản hồi API REST thông thường (CRUD profile, danh sách feed): <= 250ms ở điều kiện mạng nội bộ.
  * Độ trễ tin nhắn Real-time qua WebSocket: <= 100ms.
  * Độ trễ sinh câu gợi ý AI qua Gemini Flash: <= 3.0s.
* **NFR-02 (Bảo mật - Security):**
  * Mật khẩu người dùng phải được băm (hash) bằng thuật toán `bcrypt` với Salt Rounds >= 10.
  * Toàn bộ các API riêng tư đều phải được bảo vệ bởi middleware xác thực JWT Bearer Token.
  * Sử dụng cơ chế Rate Limiting trên Backend (chống spam OTP và brute-force đăng nhập).
* **NFR-03 (Khả năng tương thích - Compatibility):**
  * Ứng dụng chạy mượt mà trên nền tảng Android (>= Android 9) và iOS (>= iOS 14) thông qua React Native CLI (build APK / Android Studio Emulator hoặc chạy thiết bị thật qua USB ADB Debugging).
* **NFR-04 (Tính dễ sử dụng - Usability):**
  * Giao diện tuân thủ tiêu chuẩn Human Interface Guidelines (iOS) và Material Design (Android). Thao tác vuốt thẻ mượt mà 60 FPS.
* **NFR-05 (Tính mở rộng & Dễ bảo trì - Maintainability):**
  * Mã nguồn Backend tổ chức theo mô hình Controller - Service - Repository chuẩn mực.
  * Cơ sở dữ liệu có Migration scripts quản lý bằng Prisma.

---

## 6. MA TRẬN PHÂN QUYỀN VÀ VAI TRÒ (ROLE & PERMISSION MATRIX)

| Chức năng / Hành động | Guest (Khách chưa đăng nhập) | Registered User (Đã xác thực OTP) | Banned / Suspended User |
| :--- | :---: | :---: | :---: |
| Đăng ký / Đăng nhập / Nhận OTP | Cho phép | Cho phép | Bị chặn |
| Xem danh sách người dùng để vuốt | Bị chặn | Cho phép | Bị chặn |
| Thao tác Vuốt Like / Pass | Bị chặn | Cho phép | Bị chặn |
| Tham gia phòng Chat Socket.io | Bị chặn | Cho phép | Bị chặn |
| Kích hoạt tính năng AI Icebreaker | Bị chặn | Cho phép (Giới hạn 20 lần/ngày) | Bị chặn |
| Thay đổi tọa độ GPS giả lập | Bị chặn | Cho phép (Phục vụ demo) | Bị chặn |
| Cập nhật Hồ sơ, MBTI, Mood | Bị chặn | Cho phép | Bị chặn |

---

## 7. ĐẶC TẢ CA SỬ DỤNG CHÍNH (KEY USE CASES)

### UC-01: Khám phá đối tượng & Ghép đôi tương hợp (Swipe & Match)
* **Actor:** Registered User (User A).
* **Tiền điều kiện:** User A đã đăng nhập, đã hoàn thiện hồ sơ và bật định vị.
* **Luồng chính (Main Flow):**
  1. User A mở tab "Khám phá" (Discover).
  2. Hệ thống tải danh sách các thẻ hồ sơ phù hợp trong bán kính cài đặt (loại trừ người đã vuốt).
  3. User A xem ảnh, thông tin MBTI, sở thích, Mood tag và khoảng cách của User B.
  4. User A vuốt thẻ sang phải (Like).
  5. Hệ thống ghi nhận lượt Like vào CSDL và kiểm tra xem User B đã Like User A trước đó chưa.
  6. **Phát hiện Match:** Hệ thống ghi nhận User B đã Like User A -> Tạo bản ghi Match mới.
  7. Socket.io bắn sự kiện `new_match` tới cả User A và User B.
  8. Màn hình User A hiển thị popup chúc mừng "It's a Match!" kèm nút "Gửi lời chào ngay" hoặc "Tiếp tục vuốt".
* **Luồng thay thế (Alternative Flow):**
  * Tại bước 5: Nếu User B chưa Like User A -> Hệ thống chỉ lưu trạng thái Like và tiếp tục hiển thị thẻ kế tiếp cho User A.

### UC-02: Tạo lời mở đầu với Trợ lý AI (Generate AI Icebreaker)
* **Actor:** Registered User (User A).
* **Tiền điều kiện:** User A và User B đã match thành công, User A mở phòng chat 1-1 với User B.
* **Luồng chính (Main Flow):**
  1. Trong khung chat, User A bấm vào biểu tượng "✨ Gợi ý mở lời AI".
  2. Ứng dụng hiển thị trạng thái loading "AI đang phân tích sở thích & tính cách...".
  3. Mobile App gửi yêu cầu POST `/api/v1/ai/icebreaker` kèm `matchId`.
  4. Backend kiểm tra quyền truy cập của User A đối với `matchId`.
  5. Backend truy vấn dữ liệu hồ sơ User A và User B từ PostgreSQL (Tên, Bio, Sở thích, MBTI, Mood tag).
  6. Backend nạp dữ liệu vào Prompt chuẩn hóa và gửi yêu cầu tới Google Gemini API.
  7. Gemini trả về kết quả định dạng JSON gồm 3 câu chào theo 3 phong cách (Hài hước, Tinh tế, Trực diện).
  8. Backend phản hồi JSON về Mobile App.
  9. Mobile App hiển thị danh sách 3 thẻ câu gợi ý dưới dạng bottom sheet.
  10. User A nhấn chọn 1 câu gợi ý -> Câu đó tự động được điền vào thanh nhập tin nhắn (`TextInput`).
  11. User A có thể gõ thêm/chỉnh sửa nội dung và bấm nút "Gửi" (Send).
* **Ngoại lệ (Exception Flow):**
  * *Mất kết nối mạng / AI quá tải:* Backend kích hoạt cơ chế Fallback, trả về 3 câu mở lời mẫu theo sở thích được lưu sẵn trong hệ thống mà không làm gián đoạn trải nghiệm người dùng.
