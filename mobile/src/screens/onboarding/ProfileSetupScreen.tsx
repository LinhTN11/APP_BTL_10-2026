import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { apiClient } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { toast } from '../../context/ToastContext';

const PRESET_INTERESTS = [
  { id: 1, name: 'Âm nhạc' },
  { id: 2, name: 'Du lịch' },
  { id: 3, name: 'Đọc sách' },
  { id: 4, name: 'Nấu ăn' },
  { id: 5, name: 'Xem phim' },
  { id: 6, name: 'Nhiếp ảnh' },
  { id: 7, name: 'Thể thao / Gym' },
  { id: 8, name: 'Nuôi mèo' },
  { id: 9, name: 'Cà phê chuyện trò' },
  { id: 10, name: 'Lập trình / Tech' },
];

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500',
];

export const ProfileSetupScreen = ({ navigation }: any) => {
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('FEMALE');
  const [birthDate, setBirthDate] = useState('2002-05-14');
  const [bio, setBio] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<number[]>([1, 2, 9]);
  const [avatarUrl, setAvatarUrl] = useState(PRESET_AVATARS[0]);
  const [loading, setLoading] = useState(false);
  const { updateProfileState } = useAuth();

  const toggleInterest = (id: number) => {
    if (selectedInterests.includes(id)) {
      setSelectedInterests(selectedInterests.filter((item) => item !== id));
    } else {
      if (selectedInterests.length >= 5) {
        toast.info('Bạn chỉ có thể chọn tối đa 5 sở thích.');
        return;
      }
      setSelectedInterests([...selectedInterests, id]);
    }
  };

  const handleSaveAndContinue = async () => {
    if (!fullName.trim()) {
      toast.error('Vui lòng nhập họ và tên của bạn.');
      return;
    }

    try {
      setLoading(true);
      const res = await apiClient.post('/profile', {
        fullName: fullName.trim(),
        gender,
        birthDate,
        bio: bio.trim(),
        avatarUrl,
        photos: [avatarUrl],
        interestIds: selectedInterests,
        latitude: 21.0285,
        longitude: 105.8544,
      });

      updateProfileState(res.data.profile);
      navigation.navigate('MbtiQuiz');
    } catch (error: any) {
      toast.error(error.message, 'Lỗi lưu hồ sơ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Thiết Lập Hồ Sơ</Text>
      <Text style={styles.subtitle}>Hãy để đối phương hiểu rõ hơn về con người bạn</Text>

      {/* Avatar Selection */}
      <Text style={styles.sectionTitle}>1. Chọn ảnh đại diện</Text>
      <View style={styles.avatarRow}>
        {PRESET_AVATARS.map((url, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => setAvatarUrl(url)}
            style={[
              styles.avatarContainer,
              avatarUrl === url && styles.avatarSelected,
            ]}
          >
            <Image source={{ uri: url }} style={styles.avatarImg} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Basic Info */}
      <Text style={styles.sectionTitle}>2. Thông tin cơ bản</Text>
      <Text style={styles.label}>Họ và tên hiển thị</Text>
      <TextInput
        style={styles.input}
        placeholder="VD: Mai Linh"
        placeholderTextColor="#999"
        value={fullName}
        onChangeText={setFullName}
      />

      <Text style={styles.label}>Giới tính</Text>
      <View style={styles.genderRow}>
        {(['MALE', 'FEMALE', 'OTHER'] as const).map((g) => (
          <TouchableOpacity
            key={g}
            style={[styles.genderBtn, gender === g && styles.genderBtnActive]}
            onPress={() => setGender(g)}
          >
            <Text
              style={[
                styles.genderBtnText,
                gender === g && styles.genderBtnTextActive,
              ]}
            >
              {g === 'MALE' ? 'Nam' : g === 'FEMALE' ? 'Nữ' : 'Khác'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Lời giới thiệu (Bio)</Text>
      <TextInput
        style={[styles.input, styles.bioInput]}
        placeholder="Chia sẻ một chút về tính cách hoặc sở thích của bạn..."
        placeholderTextColor="#999"
        multiline
        numberOfLines={3}
        value={bio}
        onChangeText={setBio}
      />

      {/* Interests */}
      <Text style={styles.sectionTitle}>3. Sở thích của bạn (Chọn 3 - 5 thẻ)</Text>
      <View style={styles.tagGrid}>
        {PRESET_INTERESTS.map((interest) => {
          const isSelected = selectedInterests.includes(interest.id);
          return (
            <TouchableOpacity
              key={interest.id}
              style={[styles.tag, isSelected && styles.tagSelected]}
              onPress={() => toggleInterest(interest.id)}
            >
              <Text style={[styles.tagText, isSelected && styles.tagTextSelected]}>
                {interest.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        style={styles.submitBtn}
        onPress={handleSaveAndContinue}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitBtnText}>Tiếp tục sang Trắc nghiệm MBTI</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 24, paddingBottom: 50 },
  title: { fontSize: 26, fontWeight: '800', color: '#333', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 24 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF4458',
    marginTop: 16,
    marginBottom: 12,
  },
  avatarRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  avatarContainer: {
    width: 68,
    height: 68,
    borderRadius: 34,
    padding: 3,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  avatarSelected: { borderColor: '#FF4458' },
  avatarImg: { width: '100%', height: '100%', borderRadius: 34 },
  label: { fontSize: 13, fontWeight: '600', color: '#444', marginBottom: 6, marginTop: 10 },
  input: {
    height: 48,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    color: '#333',
  },
  bioInput: { height: 80, textAlignVertical: 'top', paddingTop: 12 },
  genderRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  genderBtn: {
    flex: 1,
    height: 44,
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  genderBtnActive: { backgroundColor: '#FFF0F2', borderColor: '#FF4458' },
  genderBtnText: { fontSize: 14, color: '#666', fontWeight: '600' },
  genderBtnTextActive: { color: '#FF4458' },
  tagGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  tag: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  tagSelected: { backgroundColor: '#FF4458', borderColor: '#FF4458' },
  tagText: { fontSize: 13, color: '#555', fontWeight: '500' },
  tagTextSelected: { color: '#fff', fontWeight: '700' },
  submitBtn: {
    height: 52,
    backgroundColor: '#FF4458',
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
    shadowColor: '#FF4458',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
