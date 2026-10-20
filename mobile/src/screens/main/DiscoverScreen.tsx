import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { apiClient } from '../../api/client';
import { CandidateProfile } from '../../types';
import { toast } from '../../context/ToastContext';

export const DiscoverScreen = ({ navigation }: any) => {
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [matchedModal, setMatchedModal] = useState<{
    visible: boolean;
    partner?: CandidateProfile;
    conversationId?: string;
  }>({ visible: false });

  useEffect(() => {
    fetchFeed();
  }, []);

  const fetchFeed = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/discovery/feed');
      setCandidates(res.data.feed || []);
      setCurrentIndex(0);
    } catch (error: any) {
      console.error('Fetch Feed Error:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (action: 'LIKE' | 'PASS') => {
    if (currentIndex >= candidates.length) return;

    const currentCandidate = candidates[currentIndex];

    try {
      const res = await apiClient.post('/swipes', {
        targetUserId: currentCandidate.id,
        action,
      });

      if (res.data.matched) {
        setMatchedModal({
          visible: true,
          partner: currentCandidate,
          conversationId: res.data.conversationId,
        });
      }

      setCurrentIndex((prev) => prev + 1);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF4458" />
        <Text style={styles.loadingText}>Đang tìm kiếm đối tượng phù hợp quanh bạn...</Text>
      </View>
    );
  }

  const currentCandidate = candidates[currentIndex];

  if (!currentCandidate || currentIndex >= candidates.length) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.emptyIllustration}>
          <View style={styles.emptyCardBack} />
          <View style={styles.emptyCardFront}>
            <Text style={styles.emptyCardInitial}>C</Text>
          </View>
        </View>
        <Text style={styles.emptyTitle}>Tạm hết hồ sơ phù hợp</Text>
        <Text style={styles.emptySubtitle}>
          Hãy mở rộng bán kính tìm kiếm hoặc quay lại sau nhé!
        </Text>
        <TouchableOpacity style={styles.refreshBtn} onPress={fetchFeed}>
          <Text style={styles.refreshText}>Tải lại danh sách</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.headerLogo}>Cupid AI</Text>
        <TouchableOpacity onPress={fetchFeed}>
          <Text style={styles.headerAction}>Làm mới</Text>
        </TouchableOpacity>
      </View>

      {/* Main Profile Card */}
      <View style={styles.cardContainer}>
        <Image
          source={{
            uri:
              currentCandidate.photos[0] ||
              currentCandidate.avatarUrl ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500',
          }}
          style={styles.cardImage}
        />

        <View style={styles.cardGradientOverlay}>
          {/* Daily Mood Tag */}
          {currentCandidate.dailyMood ? (
            <View style={styles.moodBadge}>
              <Text style={styles.moodText}>
                Tâm trạng hôm nay: {currentCandidate.dailyMood}
              </Text>
            </View>
          ) : null}

          {/* Name & Age */}
          <View style={styles.nameRow}>
            <Text style={styles.nameText}>
              {currentCandidate.fullName}, {currentCandidate.age}
            </Text>
            {currentCandidate.mbtiType ? (
              <View style={styles.mbtiBadge}>
                <Text style={styles.mbtiBadgeText}>{currentCandidate.mbtiType}</Text>
              </View>
            ) : null}
          </View>

          {/* Distance */}
          <Text style={styles.distanceText}>
            Cách bạn {currentCandidate.distanceKm} km
          </Text>

          {/* Bio */}
          {currentCandidate.bio ? (
            <Text style={styles.bioText} numberOfLines={2}>
              {currentCandidate.bio}
            </Text>
          ) : null}

          {/* Interests Tags */}
          <View style={styles.interestsRow}>
            {currentCandidate.interests.map((interest, idx) => (
              <View key={idx} style={styles.interestTag}>
                <Text style={styles.interestText}>{interest}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.passBtn]}
          onPress={() => handleSwipe('PASS')}
        >
          <Text style={styles.passIcon}>✕</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.likeBtn]}
          onPress={() => handleSwipe('LIKE')}
        >
          <Text style={[styles.likeIcon, { color: '#FF4458' }]}>♥</Text>
        </TouchableOpacity>
      </View>

      {/* It's a Match Modal */}
      <Modal visible={matchedModal.visible} transparent animationType="fade">
        <View style={styles.matchModalOverlay}>
          <View style={styles.matchModalContent}>
            <Text style={styles.matchTitle}>IT'S A MATCH!</Text>
            <Text style={styles.matchSubtitle}>
              Bạn và {matchedModal.partner?.fullName} đã tìm thấy điểm chung!
            </Text>

            <View style={styles.matchAvatarRow}>
              <Image
                source={{
                  uri:
                    matchedModal.partner?.avatarUrl ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500',
                }}
                style={styles.matchAvatar}
              />
            </View>

            <TouchableOpacity
              style={styles.chatNowBtn}
              onPress={() => {
                const partner = matchedModal.partner;
                const convId = matchedModal.conversationId;
                setMatchedModal({ visible: false });
                if (partner && convId) {
                  navigation.navigate('Chat', {
                    conversationId: convId,
                    partner: {
                      id: partner.id,
                      fullName: partner.fullName,
                      avatarUrl: partner.avatarUrl,
                    },
                  });
                }
              }}
            >
              <Text style={styles.chatNowText}>Mở Lời với Trợ Lý AI</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.continueBtn}
              onPress={() => setMatchedModal({ visible: false })}
            >
              <Text style={styles.continueText}>Tiếp tục khám phá</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  headerLogo: { fontSize: 24, fontWeight: '800', color: '#FF4458', letterSpacing: -0.5 },
  headerAction: { fontSize: 13, color: '#666', fontWeight: '600' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  loadingText: { marginTop: 12, color: '#666', fontSize: 14 },
  emptyIllustration: {
    width: 64,
    height: 74,
    marginBottom: 20,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCardBack: {
    position: 'absolute',
    width: 44,
    height: 60,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: '#F5F5F5',
    transform: [{ rotate: '-12deg' }],
  },
  emptyCardFront: {
    position: 'absolute',
    width: 44,
    height: 60,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FF4458',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '6deg' }],
    elevation: 2,
  },
  emptyCardInitial: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FF4458',
  },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#333', marginBottom: 6 },
  emptySubtitle: { fontSize: 14, color: '#888', textAlign: 'center', marginBottom: 20 },
  refreshBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#FF4458',
    borderRadius: 24,
  },
  refreshText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  cardContainer: {
    flex: 1,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  cardImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  cardGradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  moodBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FF4458',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    marginBottom: 8,
  },
  moodText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  nameText: { fontSize: 24, fontWeight: '800', color: '#fff' },
  mbtiBadge: {
    backgroundColor: '#3F51B5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  mbtiBadgeText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  distanceText: { fontSize: 13, color: '#ddd', marginBottom: 6 },
  bioText: { fontSize: 13, color: '#eee', lineHeight: 18, marginBottom: 10 },
  interestsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  interestTag: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  interestText: { color: '#fff', fontSize: 12, fontWeight: '500' },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 36,
    paddingVertical: 16,
  },
  actionBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  passBtn: { borderColor: '#E9ECEF', borderWidth: 1 },
  passIcon: { fontSize: 28, color: '#666', fontWeight: '800' },
  likeBtn: { borderColor: '#FF4458', borderWidth: 1 },
  likeIcon: { fontSize: 30 },
  matchModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  matchModalContent: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  matchTitle: { fontSize: 28, fontWeight: '900', color: '#FF4458', marginBottom: 8 },
  matchSubtitle: { fontSize: 14, color: '#555', textAlign: 'center', marginBottom: 20 },
  matchAvatarRow: { marginBottom: 24 },
  matchAvatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: '#FF4458' },
  chatNowBtn: {
    width: '100%',
    height: 50,
    backgroundColor: '#FF4458',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  chatNowText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  continueBtn: { padding: 10 },
  continueText: { color: '#888', fontSize: 14, fontWeight: '600' },
});
