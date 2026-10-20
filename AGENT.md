# CUPID AI - SMART DATING APP (BTL-SE-DATING-2026)
## HỆ THỐNG TÀI LIỆU VÀ QUY CHUẨN DỰ ÁN

Dự án phát triển **Ứng dụng Hẹn hò Thông minh (Smart Dating App)** tích hợp Trí tuệ nhân tạo (AI Icebreaker), trắc nghiệm MBTI và trạng thái tâm trạng hàng ngày (Daily Mood).

---

### 1. BỘ TÀI LIỆU ĐẶC TẢ CHÍNH THỨC (DOCS REPOSITORY)

Tất cả các tài liệu đặc tả, thiết kế kiến trúc và kế hoạch triển khai đã được biên soạn và lưu trữ tại thư mục [`docs/`](file:///c:/Users/trann/Desktop/App-BTL/docs):

1. [`01_BRD_SRS_REQUIREMENTS_SPECIFICATION.md`](file:///c:/Users/trann/Desktop/App-BTL/docs/01_BRD_SRS_REQUIREMENTS_SPECIFICATION.md): Tài liệu Yêu cầu Nghiệp vụ (BRD) & Đặc tả Hệ thống (SRS), Use Cases, Phân quyền và NFRs.
2. [`02_SYSTEM_ARCHITECTURE_AND_DATABASE.md`](file:///c:/Users/trann/Desktop/App-BTL/docs/02_SYSTEM_ARCHITECTURE_AND_DATABASE.md): Thiết kế Kiến trúc hệ thống, Sơ đồ CSDL ERD, Mã nguồn `schema.prisma` và Đặc tả API/WebSocket.
3. [`03_BUSINESS_PROCESS_AND_AI_WORKFLOW.md`](file:///c:/Users/trann/Desktop/App-BTL/docs/03_BUSINESS_PROCESS_AND_AI_WORKFLOW.md): Phân tích quy trình AS-IS vs TO-BE và Đặc tả chuẩn 18 tiêu chí cho AI Icebreaker Automation.
4. [`04_WBS_PROJECT_MANAGEMENT_2_WEEKS.md`](file:///c:/Users/trann/Desktop/App-BTL/docs/04_WBS_PROJECT_MANAGEMENT_2_WEEKS.md): Cấu trúc phân rã công việc (WBS), Lịch trình tiến độ 14 ngày (Gantt) và Ma trận RACI.
5. [`05_TESTING_UAT_AND_RISK_MANAGEMENT.md`](file:///c:/Users/trann/Desktop/App-BTL/docs/05_TESTING_UAT_AND_RISK_MANAGEMENT.md): Chiến lược kiểm thử, Bộ 12 Test Cases chi tiết, Sổ đăng ký rủi ro và Ma trận truy vết RTM.
6. [`06_PROJECT_MANAGEMENT_LOGS.md`](file:///c:/Users/trann/Desktop/App-BTL/docs/06_PROJECT_MANAGEMENT_LOGS.md): Decision Log (DEC-001 -> DEC-010), Assumption Register, Dependency Log & Skill Usage Log.
7. [`backend/README.md`](file:///c:/Users/trann/Desktop/App-BTL/backend/README.md): Hướng dẫn bàn giao Backend API & WebSocket contract cho Frontend team (kèm file Postman `backend/cupid_ai_api_collection.json`).
8. [`docs/screenshots/`](file:///c:/Users/trann/Desktop/App-BTL/docs/screenshots): Thư mục lưu trữ ảnh chụp màn hình UI chuẩn của ứng dụng.

---

### 2. CÔNG NGHỆ CHÍNH (TECH STACK)
* **Frontend:** React Native CLI (Bare Native / Pure CLI), TypeScript, React Navigation, React Native Reanimated, `@react-native-community/geolocation`, `react-native-image-picker`.
* **Backend:** Node.js (TypeScript) + Express.js + Socket.io Server (Real-time Messaging).
* **Database & ORM:** PostgreSQL + Prisma ORM.
* **Media & Third-Party:** Cloudinary (Free tier) cho ảnh, Nodemailer & Resend cho Email OTP.
* **AI Orchestration:** Google Gemini 1.5 Flash API (kèm bộ Fallback Templates thông minh).
