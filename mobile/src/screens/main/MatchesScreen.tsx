import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { apiClient } from '../../api/client';
import { Conversation } from '../../types';

export const MatchesScreen = ({ navigation }: any) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchConversations();
    });
    return unsubscribe;
  }, [navigation]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/chat/conversations');
      setConversations(res.data.conversations || []);
    } catch (e) {
      console.error('Fetch conversations error:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF4458" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hội Thoại & Ghép Đôi</Text>
      </View>

      {conversations.length === 0 ? (
        <View style={styles.center}>
          <View style={styles.emptyIconContainer}>
            <View style={styles.emptyIconBubble} />
          </View>
          <Text style={styles.emptyTitle}>Chưa có hội thoại nào</Text>
          <Text style={styles.emptySubtitle}>
            Hãy tích cực vuốt thẻ ở tab Khám phá để tìm thấy những người bạn tương hợp nhé!
          </Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.conversationId || item.matchId}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.convItem}
              onPress={() =>
                navigation.navigate('Chat', {
                  conversationId: item.conversationId,
                  matchId: item.matchId,
                  partner: item.partner,
                })
              }
            >
              <Image
                source={{
                  uri:
                    item.partner.avatarUrl ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500',
                }}
                style={styles.avatar}
              />
              <View style={styles.convDetails}>
                <View style={styles.nameRow}>
                  <Text style={styles.name}>{item.partner.fullName}</Text>
                  {item.partner.mbtiType ? (
                    <View style={styles.mbtiBadge}>
                      <Text style={styles.mbtiText}>{item.partner.mbtiType}</Text>
                    </View>
                  ) : null}
                </View>

                <Text style={styles.lastMsg} numberOfLines={1}>
                  {item.lastMessage
                    ? `${item.lastMessage.isMe ? 'Bạn: ' : ''}${item.lastMessage.content}`
                    : 'Hãy là người mở lời đầu tiên...'}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#333' },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF0F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyIconBubble: {
    width: 26,
    height: 20,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FF4458',
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#333', marginBottom: 6 },
  emptySubtitle: { fontSize: 13, color: '#888', textAlign: 'center', lineHeight: 18 },
  convItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  avatar: { width: 56, height: 56, borderRadius: 28, marginRight: 14 },
  convDetails: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  name: { fontSize: 16, fontWeight: '700', color: '#333' },
  mbtiBadge: {
    backgroundColor: '#FFF0F2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  mbtiText: { color: '#FF4458', fontSize: 11, fontWeight: '800' },
  lastMsg: { fontSize: 13, color: '#777' },
});
