import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../api/client';
import { toast } from '../../context/ToastContext';

const MOOD_OPTIONS = [
  'Thèm trà sữa',
  'Cần người đi dạo',
  'Xem phim cuối tuần',
  'Cà phê chuyện trò',
  'Tập gym chung',
  'Học bài cùng',
  'Đi ăn đêm',
  'Đang yêu đời',
];

const VIRTUAL_LOCATIONS = [
  { name: 'Hồ Gươm (Hoàn Kiếm)', lat: 21.0285, lon: 105.8544 },
  { name: 'Đại học Bách Khoa (Hai Bà Trưng)', lat: 21.0055, lon: 105.8433 },
  { name: 'Cầu Giấy (ĐH Quốc Gia)', lat: 21.036, lon: 105.7905 },
  { name: 'Hồ Tây (Tây Hồ)', lat: 21.0583, lon: 105.8236 },
];

export const ProfileScreen = ({ navigation }: any) => {
  const { user, logout, updateProfileState } = useAuth();
  const profile = user?.profile;

  const [currentMood, setCurrentMood] = useState(profile?.dailyMood || null);
  const [selectedLocation, setSelectedLocation] = useState(
    profile?.isVirtualLocation ? 'Vị trí giả lập' : 'GPS Thiết bị'
  );

  const handleUpdateMood = async (mood: string) => {
    try {
      const res = await apiClient.put('/profile/mood', { dailyMood: mood });
      setCurrentMood(mood);
      if (profile) {
        updateProfileState({ ...profile, dailyMood: mood });
      }
      toast.success(`Đã cập nhật tâm trạng: "${mood}"`);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleSetVirtualLocation = async (loc: { name: string; lat: number; lon: number }) => {
    try {
      await apiClient.put('/profile/location', {
        latitude: loc.lat,
        longitude: loc.lon,
        isVirtualLocation: true,
      });
      setSelectedLocation(loc.name);
      if (profile) {
        updateProfileState({
          ...profile,
          latitude: loc.lat,
          longitude: loc.lon,
          isVirtualLocation: true,
        });
      }
      toast.success(
        `Vị trí Demo đã chuyển sang: ${loc.name}. Khoảng cách đã được cập nhật!`,
        'Đã đổi tọa độ Demo'
      );
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Profile Card */}
      <View style={styles.profileCard}>
        <Image
          source={{
            uri:
              profile?.avatarUrl ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500',
          }}
          style={styles.avatar}
        />
        <Text style={styles.name}>{profile?.fullName || user?.email}</Text>
        <Text style={styles.email}>{user?.email}</Text>

        <View style={styles.badgeRow}>
          {profile?.mbtiType ? (
            <View style={styles.mbtiBadge}>
              <Text style={styles.mbtiText}>MBTI: {profile.mbtiType}</Text>
            </View>
          ) : null}

          {currentMood ? (
            <View style={styles.moodBadge}>
              <Text style={styles.moodText}>{currentMood}</Text>
            </View>
          ) : null}
        </View>

        {profile?.bio ? <Text style={styles.bioText}>"{profile.bio}"</Text> : null}
      </View>

      {/* Daily Mood Selector */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cập nhật tâm trạng trong ngày</Text>
        <Text style={styles.sectionDesc}>
          Nhãn này sẽ hiển thị nổi bật trên thẻ vuốt và tự động reset sau 24h:
        </Text>
        <View style={styles.moodGrid}>
          {MOOD_OPTIONS.map((mood, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.moodItem, currentMood === mood && styles.moodItemActive]}
              onPress={() => handleUpdateMood(mood)}
            >
              <Text style={[styles.moodItemText, currentMood === mood && styles.moodItemTextActive]}>
                {mood}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Demo Virtual GPS Location Mode */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Chế độ giả lập tọa độ (Demo)</Text>
        <Text style={styles.sectionDesc}>
          Hiện tại: <Text style={{ fontWeight: '700', color: '#FF4458' }}>{selectedLocation}</Text>
          {'\n'}Bấm để đổi tọa độ và kiểm chứng cự ly khoảng cách ngay trong phòng thi:
        </Text>
        <View style={styles.locGrid}>
          {VIRTUAL_LOCATIONS.map((loc, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.locBtn}
              onPress={() => handleSetVirtualLocation(loc)}
            >
              <Text style={styles.locBtnText}>{loc.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Retake MBTI */}
      <TouchableOpacity
        style={styles.mbtiActionBtn}
        onPress={() => navigation.navigate('MbtiQuiz')}
      >
        <Text style={styles.mbtiActionText}>Làm lại trắc nghiệm tính cách MBTI</Text>
      </TouchableOpacity>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>Đăng Xuất</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  content: { padding: 18, paddingBottom: 50 },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  avatar: { width: 90, height: 90, borderRadius: 45, marginBottom: 12 },
  name: { fontSize: 20, fontWeight: '800', color: '#333' },
  email: { fontSize: 13, color: '#888', marginTop: 2, marginBottom: 10 },
  badgeRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  mbtiBadge: { backgroundColor: '#3F51B5', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  mbtiText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  moodBadge: { backgroundColor: '#FFF0F2', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: '#FF4458' },
  moodText: { color: '#FF4458', fontWeight: '700', fontSize: 12 },
  bioText: { fontSize: 13, color: '#555', fontStyle: 'italic', textAlign: 'center', lineHeight: 18 },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#333', marginBottom: 4 },
  sectionDesc: { fontSize: 12, color: '#777', marginBottom: 12, lineHeight: 16 },
  moodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  moodItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  moodItemActive: { backgroundColor: '#FF4458', borderColor: '#FF4458' },
  moodItemText: { fontSize: 12, color: '#555', fontWeight: '600' },
  moodItemTextActive: { color: '#fff' },
  locGrid: { gap: 8 },
  locBtn: {
    backgroundColor: '#F8F9FA',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  locBtnText: { fontSize: 13, color: '#444', fontWeight: '600' },
  mbtiActionBtn: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  mbtiActionText: { color: '#3F51B5', fontWeight: '700', fontSize: 14 },
  logoutBtn: {
    backgroundColor: '#FFF0F2',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  logoutText: { color: '#FF4458', fontWeight: '700', fontSize: 14 },
});
