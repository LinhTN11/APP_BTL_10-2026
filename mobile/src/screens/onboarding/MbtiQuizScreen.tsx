import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { apiClient } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { toast } from '../../context/ToastContext';

const QUESTIONS = [
  // E vs I
  { id: 1, axis: 'EI', text: 'Sau một tuần học tập/làm việc căng thẳng, bạn nạp lại năng lượng bằng cách nào?', optA: { label: 'Tụ tập bạn bè, đi cà phê hoặc tiệc tùng', val: 'E' }, optB: { label: 'Ở nhà một mình đọc sách, xem phim, nghe nhạc', val: 'I' } },
  { id: 2, axis: 'EI', text: 'Khi bước vào một bữa tiệc lạ, bạn thường:', optA: { label: 'Chủ động bắt chuyện và làm quen người mới', val: 'E' }, optB: { label: 'Đứng cạnh bạn quen hoặc chờ người khác đến chào', val: 'I' } },
  { id: 3, axis: 'EI', text: 'Bạn là người có xu hướng:', optA: { label: 'Nói ra suy nghĩ của mình trước rồi mới ngẫm', val: 'E' }, optB: { label: 'Suy nghĩ thật kỹ trong đầu trước khi mở lời', val: 'I' } },
  // S vs N
  { id: 4, axis: 'SN', text: 'Khi tiếp cận một vấn đề mới, bạn tập trung vào:', optA: { label: 'Dữ kiện thực tế, chi tiết cụ thể ngay trước mắt', val: 'S' }, optB: { label: 'Bức tranh toàn cảnh, ý nghĩa tiềm ẩn và khả năng tương lai', val: 'N' } },
  { id: 5, axis: 'SN', text: 'Bạn thích trò chuyện về chủ đề nào hơn?', optA: { label: 'Những trải nghiệm thực tế, chuyện đời sống hàng ngày', val: 'S' }, optB: { label: 'Ý tưởng trừu tượng, triết lý sống, phim ảnh viễn tưởng', val: 'N' } },
  { id: 6, axis: 'SN', text: 'Cách bạn làm việc thường là:', optA: { label: 'Tuân thủ các bước thực hành đã được kiểm chứng', val: 'S' }, optB: { label: 'Tìm kiếm phương pháp mới mẻ, mang tính đột phá', val: 'N' } },
  // T vs F
  { id: 7, axis: 'TF', text: 'Khi đưa ra một quyết định quan trọng, bạn dựa vào:', optA: { label: 'Tính logic, công bằng và lý trí khách quan', val: 'T' }, optB: { label: 'Cảm xúc cá nhân và sự hòa hợp của các bên liên quan', val: 'F' } },
  { id: 8, axis: 'TF', text: 'Nếu bạn thân làm sai một việc, bạn sẽ:', optA: { label: 'Chỉ ra lỗi sai thẳng thắn để bạn sửa đổi', val: 'T' }, optB: { label: 'Lắng nghe, thấu cảm và an ủi trước', val: 'F' } },
  { id: 9, axis: 'TF', text: 'Bạn tự thấy mình là người:', optA: { label: 'Bình tĩnh, lý trí và thực tế', val: 'T' }, optB: { label: 'Ấm áp, giàu lòng trắc ẩn và dễ xúc động', val: 'F' } },
  // J vs P
  { id: 10, axis: 'JP', text: 'Khi lên kế hoạch cho chuyến đi du lịch:', optA: { label: 'Lên lịch trình chi tiết từng giờ, đặt vé trước', val: 'J' }, optB: { label: 'Tùy hứng, đến nơi rồi tính, thích sự ngẫu hứng', val: 'P' } },
  { id: 11, axis: 'JP', text: 'Không gian bàn học / làm việc của bạn thường:', optA: { label: 'Ngăn nắp, đồ vật ở đúng vị trí quy định', val: 'J' }, optB: { label: 'Hơi bừa bộn nhưng bạn biết đồ mình để ở đâu', val: 'P' } },
  { id: 12, axis: 'JP', text: 'Trước một deadline quan trọng:', optA: { label: 'Hoàn thành từ sớm để không phải lo lắng', val: 'J' }, optB: { label: 'Nước đến chân mới nhảy, làm việc thăng hoa vào phút chót', val: 'P' } },
];

const ALL_MBTI = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP',
];

export const MbtiQuizScreen = () => {
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [selectedMbti, setSelectedMbti] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { refreshProfile } = useAuth();

  const handleSelectAnswer = (qId: number, val: string) => {
    setAnswers({ ...answers, [qId]: val });
  };

  const calculateMbtiFromQuiz = (): string => {
    let e = 0, i = 0, s = 0, n = 0, t = 0, f = 0, j = 0, p = 0;
    QUESTIONS.forEach((q) => {
      const ans = answers[q.id];
      if (ans === 'E') e++;
      if (ans === 'I') i++;
      if (ans === 'S') s++;
      if (ans === 'N') n++;
      if (ans === 'T') t++;
      if (ans === 'F') f++;
      if (ans === 'J') j++;
      if (ans === 'P') p++;
    });

    const part1 = e >= i ? 'E' : 'I';
    const part2 = s >= n ? 'S' : 'N';
    const part3 = t >= f ? 'T' : 'F';
    const part4 = j >= p ? 'J' : 'P';

    return `${part1}${part2}${part3}${part4}`;
  };

  const handleSaveMbti = async (mbtiCode: string) => {
    try {
      setLoading(true);
      await apiClient.put('/profile/mbti', { mbtiType: mbtiCode });
      await refreshProfile();
      toast.success(
        `Mã tính cách ${mbtiCode} đã được cập nhật thành công!`,
        'Cập nhật MBTI'
      );
    } catch (error: any) {
      toast.error(error.message, 'Lỗi cập nhật MBTI');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitQuiz = () => {
    if (Object.keys(answers).length < QUESTIONS.length) {
      toast.info('Vui lòng trả lời đủ 12 câu hỏi trắc nghiệm.', 'Chưa hoàn thành');
      return;
    }
    const computed = calculateMbtiFromQuiz();
    handleSaveMbti(computed);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Trắc Nghiệm Tính Cách MBTI</Text>
      <Text style={styles.subtitle}>
        Khám phá bản thân để AI tối ưu hóa độ tương hợp và gợi ý mở lời chuẩn xác
      </Text>

      {/* Quick selection if already known */}
      <View style={styles.fastBox}>
        <Text style={styles.fastTitle}>Đã biết nhóm MBTI của bạn?</Text>
        <Text style={styles.fastSubtitle}>Chạm để chọn ngay mà không cần làm bài test:</Text>
        <View style={styles.mbtiGrid}>
          {ALL_MBTI.map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.mbtiBtn, selectedMbti === type && styles.mbtiBtnActive]}
              onPress={() => {
                setSelectedMbti(type);
                handleSaveMbti(type);
              }}
            >
              <Text style={[styles.mbtiText, selectedMbti === type && styles.mbtiTextActive]}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Text style={styles.dividerText}>── HOẶC LÀM BÀI TEST NHANH 2 PHÚT ──</Text>

      {/* 12 questions */}
      {QUESTIONS.map((q, idx) => {
        const currentAns = answers[q.id];
        return (
          <View key={q.id} style={styles.card}>
            <Text style={styles.questionNum}>Câu {idx + 1}/12</Text>
            <Text style={styles.questionText}>{q.text}</Text>

            <TouchableOpacity
              style={[styles.optBtn, currentAns === q.optA.val && styles.optBtnSelected]}
              onPress={() => handleSelectAnswer(q.id, q.optA.val)}
            >
              <Text style={[styles.optText, currentAns === q.optA.val && styles.optTextSelected]}>
                A. {q.optA.label}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optBtn, currentAns === q.optB.val && styles.optBtnSelected]}
              onPress={() => handleSelectAnswer(q.id, q.optB.val)}
            >
              <Text style={[styles.optText, currentAns === q.optB.val && styles.optTextSelected]}>
                B. {q.optB.label}
              </Text>
            </TouchableOpacity>
          </View>
        );
      })}

      <TouchableOpacity
        style={styles.submitBtn}
        onPress={handleSubmitQuiz}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitBtnText}>Hoàn Thành & Khám Phá Ngay</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  content: { padding: 20, paddingBottom: 60 },
  title: { fontSize: 24, fontWeight: '800', color: '#333', marginBottom: 6 },
  subtitle: { fontSize: 13, color: '#666', marginBottom: 20, lineHeight: 18 },
  fastBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  fastTitle: { fontSize: 15, fontWeight: '700', color: '#FF4458', marginBottom: 4 },
  fastSubtitle: { fontSize: 12, color: '#888', marginBottom: 12 },
  mbtiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  mbtiBtn: {
    width: '23%',
    height: 36,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  mbtiBtnActive: { backgroundColor: '#FF4458', borderColor: '#FF4458' },
  mbtiText: { fontSize: 12, fontWeight: '700', color: '#555' },
  mbtiTextActive: { color: '#fff' },
  dividerText: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    color: '#aaa',
    marginVertical: 16,
    letterSpacing: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  questionNum: { fontSize: 12, fontWeight: '700', color: '#FF4458', marginBottom: 4 },
  questionText: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 12, lineHeight: 20 },
  optBtn: {
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  optBtnSelected: { backgroundColor: '#FFF0F2', borderColor: '#FF4458' },
  optText: { fontSize: 13, color: '#555', lineHeight: 18 },
  optTextSelected: { color: '#FF4458', fontWeight: '700' },
  submitBtn: {
    height: 52,
    backgroundColor: '#FF4458',
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#FF4458',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
