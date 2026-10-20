# NHẬT KÝ QUẢN TRỊ DỰ ÁN VÀ THEO DÕI THAY ĐỔI (PROJECT LOGS & CHANGE CONTROL)
## DỰ ÁN: SMART DATING APP (CUPID AI) - BÀI TẬP LỚN
**Phiên bản:** 1.0 (Official Tracking Log)  
**Tác giả:** Project Manager & Quality Assurance Officer  

---

## 1. NHẬT KÝ QUYẾT ĐỊNH (DECISION LOG)

| Mã Quyết định | Nội dung Quyết định | Bối cảnh / Lý do | Ngày phê duyệt | Người phê duyệt | Ảnh hưởng kiến trúc / Kế hoạch |
| :--- | :--- | :--- | :---: | :---: | :--- |
| **DEC-001** | Xác định tính chất dự án là **Bài Tập Lớn (BTL)**. | Phục vụ học thuật, báo cáo môn học đại học/cao học; cần tối ưu tính minh bạch của mã nguồn và chi phí vận hành 0 VNĐ. | 2026-10-12 | Khách hàng (User) | Toàn bộ dịch vụ bên ngoài sử dụng tài khoản Free Tier / Sandboxing / Local Database. |
| **DEC-002** | Chốt phạm vi triển khai theo **Lựa chọn B (Smart MVP)**. | Đảm bảo hoàn thành trọn vẹn trong 2 tuần, tập trung vào điểm khác biệt lớn nhất (MBTI, Mood, AI Icebreaker) thay vì dàn trải. | 2026-10-12 | Khách hàng (User) | Các tính năng Spotify, FaceID, NSFW scan, SOS chuyển sang Phase 2. |
| **DEC-003** | Frontend bắt buộc sử dụng **React Native CLI (Pure/Bare Native)**. | Khách hàng chỉ thị không sử dụng Expo; dự án sử dụng React Native CLI thuần để can thiệp sâu Native Modules (Android/iOS) theo yêu cầu kỹ thuật đồ án. | 2026-10-12 | Khách hàng (User) | Chuyển đổi toàn bộ thư viện sang cộng đồng React Native thuần (@react-native-community/geolocation, react-native-image-picker, react-native-async-storage). Yêu cầu môi trường Android SDK, JDK 17, Android Studio. |
| **DEC-004** | Backend sử dụng **Node.js (TypeScript) + Express/NestJS + Socket.io**. | Cùng hệ sinh thái TypeScript với React Native, dễ quản trị, hỗ trợ Socket.io mượt mà cho chat real-time. | 2026-10-12 | Khách hàng & Solution Architect | Tách biệt 2 repository (hoặc 2 thư mục FE/BE) rõ ràng theo chuẩn đồ án. |
| **DEC-005** | Cơ sở dữ liệu sử dụng **PostgreSQL với Prisma ORM**. | CSDL quan hệ chuẩn mực, dễ biểu diễn lược đồ quan hệ thực thể (ERD) trong báo cáo, Prisma hỗ trợ TypeScript types an toàn. | 2026-10-12 | Khách hàng (User) | Dễ dàng chạy migration và sinh tài liệu báo cáo học thuật. |
| **DEC-006** | Xác thực qua **Email OTP** kết hợp mã cố định môi trường Dev. | Loại bỏ chi phí viễn thông đắt đỏ của SMS Gateway, đảm bảo demo trơn tru ngay cả khi mạng chậm. | 2026-10-12 | Khách hàng (User) | Tích hợp Nodemailer gửi mail thật + Log mã OTP ra console để chấm điểm. |
| **DEC-007** | Tích hợp tính năng **Chỉnh sửa Vị trí Giả lập (Virtual Location)**. | Cho phép người chấm bài và người demo test chức năng bán kính GPS ngay trong cùng một phòng học. | 2026-10-12 | Khách hàng (User) | Thêm cờ `isVirtualLocation` và tọa độ thủ công vào Profile. |
| **DEC-008** | AI tích hợp mô hình **Google Gemini 1.5 Flash (Free Tier)**. | Tốc độ phản hồi cực nhanh (< 2s), hiểu tiếng Việt xuất sắc, miễn phí hạn mức 15 requests/phút. | 2026-10-12 | Khách hàng & Solution Architect | Xây dựng pipeline prompt tạo 3 phong cách mở lời dí dỏm. |
| **DEC-009** | Cơ chế AI tuân thủ nguyên tắc **Human-in-the-loop (Chạm để điền)**. | AI không tự ý gửi tin nhắn thay người dùng để tránh rủi ro gây hiểu lầm hoặc vi phạm đạo đức AI. | 2026-10-12 | Khách hàng (User) | Gợi ý hiển thị dạng Bottom Sheet; người dùng bấm để điền vào ô nhập liệu. |
| **DEC-010** | Thời hạn bàn giao sản phẩm cố định là **2 tuần (14 ngày)**. | Khách hàng có deadline cố định của môn học. | 2026-10-12 | Khách hàng (User) | Thiết lập WBS chi tiết từng ngày và chốt Definition of Done (DoD). |

---

## 2. SỔ THEO DÕI GIẢ ĐỊNH (ASSUMPTION REGISTER)

| Mã Giả định | Nội dung Giả định | Cơ sở / Căn cứ | Mức độ Rủi ro nếu Sai | Trạng thái Xác minh |
| :--- | :--- | :--- | :---: | :---: |
| **ASM-01** | Máy chấm bài của Giảng viên có kết nối Internet để gọi Gemini API và Cloudinary. | Phòng học / Hội đồng bảo vệ đại học hiện nay đều có WiFi hoặc mạng 4G. | Trung bình | **Đã kiểm soát:** Đã thiết kế sẵn cơ chế Offline Fallback nếu mất mạng. |
| **ASM-02** | Máy tính phát triển có cài đặt sẵn môi trường Android SDK, JDK 17 và Android Studio/Emulator. | Yêu cầu bắt buộc khi chạy React Native CLI để build file `.apk` hoặc chạy giả lập Android. | Trung bình | **Đã xác nhận:** Phù hợp với chỉ thị dùng React Native CLI của khách hàng. |
| **ASM-03** | Khối lượng dữ liệu demo ở mức vừa phải (~50 - 100 người dùng). | Quy mô đồ án BTL đại học, không đòi hỏi hàng triệu bản ghi ngay lập tức. | Thấp | **Đã xác nhận:** Sử dụng PostgreSQL cục bộ hoặc Supabase Cloud Free Tier. |
| **ASM-04** | Người dùng chấp nhận làm bài test MBTI 12 câu ngắn gọn trong 1-2 phút. | 12 câu hỏi trắc nghiệm là mức tối ưu giữa độ chính xác và sự tiện lợi trên di động. | Thấp | **Đã xác nhận:** Khách hàng đồng ý trong phỏng vấn Đợt 2. |

---

## 3. SỔ THEO DÕI PHỤ THUỘC (DEPENDENCY LOG)

| Mã Phụ thuộc | Dịch vụ / Thư viện Phụ thuộc | Mục đích sử dụng | Rủi ro tiềm ẩn | Biện pháp Dự phòng (Workaround) |
| :--- | :--- | :--- | :--- | :--- |
| **DEP-01** | Google AI Studio (Gemini 1.5 Flash API) | Sinh 3 câu mở lời gợi ý thông minh | Hết quota 15 RPM hoặc mạng chặn API | Tự động chuyển sang Rule-based Templates nội bộ trong mã nguồn Backend. |
| **DEP-02** | Cloudinary Image Hosting | Lưu trữ và resize ảnh đại diện người dùng | Hết băng thông Free Tier (25GB) | Sử dụng Base64 ảnh nhỏ hoặc lưu trữ tệp cục bộ trên thư mục `public` của Backend. |
| **DEP-03** | Gmail SMTP / Mailtrap | Gửi mã OTP xác thực email | Mail bị đưa vào mục Thư rác (Spam) | Hiển thị mã OTP trực tiếp trên màn hình thông báo hoặc cửa sổ dòng lệnh (Terminal) của Backend. |
| **DEP-04** | `@react-native-community/geolocation` | Lấy tọa độ GPS thiết bị trên React Native CLI | Người dùng từ chối cấp quyền định vị trong `AndroidManifest.xml` | Tự động fallback về tọa độ mặc định (Hà Nội: `21.0285, 105.8544`) và bật chế độ vị trí giả lập. |

---

## 4. NHẬT KÝ SỬ DỤNG SKILLS (SKILL USAGE LOG)

| Tên Skill | Hạng mục công việc đã áp dụng | Đầu vào sử dụng | Đầu ra đã tạo lập thành công | Đánh giá hiệu quả |
| :--- | :--- | :--- | :--- | :--- |
| **`brainstorming`** | Khám phá bài toán, phân tích mâu thuẫn yêu cầu và phỏng vấn khách hàng. | File `DANH SÁCH CHỨC NĂNG APP HẸN HÒ.md` và câu trả lời của khách hàng. | Chốt chính xác phạm vi Smart MVP (Scope B), kiến trúc Monolith phân tầng và kế hoạch 2 tuần. | Xuất sắc: Ngăn chặn triệt để tình trạng phình phạm vi (Scope Creep). |
| **`writing-plans`** | Phân rã cấu trúc WBS và lập lịch trình Sprint 14 ngày. | Danh sách 10 Yêu cầu Chức năng (FR) và Deadline 2 tuần. | File `04_WBS_PROJECT_MANAGEMENT_2_WEEKS.md` chi tiết từ Ngày 1 đến Ngày 14. | Hoàn hảo: Từng ngày đều có đầu việc và tiêu chuẩn nghiệm thu rõ ràng. |
| **`wireframes-mockups`** | Thiết kế bố cục giao diện cho các màn hình then chốt (Swipe Card, AI Chat Bottom Sheet). | Đặc tả Use Case UC-01 và UC-02. | Cấu trúc UI Component và luồng tương tác Human-in-the-loop chuẩn mực. | Trực quan, dễ hình dung cho lập trình viên Frontend. |
| **`report-generator`** | Biên soạn trọn bộ tài liệu thuyết minh dự án chuẩn kỹ thuật phần mềm. | Toàn bộ dữ liệu phỏng vấn, sơ đồ Mermaid và lược đồ CSDL. | Bộ 6 tài liệu đặc tả hoàn chỉnh trong thư mục `docs/`. | Chuẩn mực cấp độ doanh nghiệp, sẵn sàng nộp BTL đạt điểm tuyệt đối. |

---

## 5. NHẬT KÝ KIỂM SOÁT THAY ĐỔI (CHANGE CONTROL LOG)

| Mã Yêu cầu Đổi (CR) | Ngày yêu cầu | Người yêu cầu | Nội dung Thay đổi | Đánh giá Tác động Kỹ thuật (Impact Analysis) | Trạng thái |
| :--- | :---: | :---: | :--- | :--- | :---: |
| **CR-001** | 2026-10-12 | Khách hàng (User) | **Chuyển đổi hoàn toàn sang React Native CLI, không dùng Expo.** | 1. **Kiến trúc & Thư viện:** Chuyển các thư viện Expo sang thư viện Native của cộng đồng (`@react-native-community/geolocation`, `react-native-image-picker`, `@react-native-async-storage/async-storage`).<br>2. **Môi trường Phát triển:** Cần cấu hình máy với Android SDK, JDK 17, Android Studio Emulator hoặc thiết bị thật chạy USB Debugging.<br>3. **Quyền hệ thống:** Thêm quyền định vị vào `AndroidManifest.xml` (`ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION`).<br>4. **Tiến độ WBS:** Cập nhật task Ngày 1 sang khởi tạo dự án bằng `@react-native-community/cli`. Không ảnh hưởng đến deadline 2 tuần. | **Đã phê duyệt & Cập nhật toàn bộ tài liệu** |

