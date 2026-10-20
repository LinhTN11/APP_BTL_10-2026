import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { apiClient } from '../api/client';
import { IcebreakerItem } from '../types';

interface IcebreakerModalProps {
  visible: boolean;
  matchId: string;
  partnerName: string;
  onClose: () => void;
  onSelectIcebreaker: (text: string) => void;
}

export const IcebreakerModal: React.FC<IcebreakerModalProps> = ({
  visible,
  matchId,
  partnerName,
  onClose,
  onSelectIcebreaker,
}) => {
  const [loading, setLoading] = useState(false);
  const [commonGround, setCommonGround] = useState('');
  const [icebreakers, setIcebreakers] = useState<IcebreakerItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible && matchId) {
      fetchIcebreakers();
    }
  }, [visible, matchId]);

  const fetchIcebreakers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.post('/ai/icebreaker', { matchId });
      setCommonGround(res.data.commonGround);
      setIcebreakers(res.data.icebreakers || []);
    } catch (err: any) {
      console.error('Fetch icebreakers error:', err);
      setError(err.message || 'Không thể kết nối tới AI. Hãy thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const getStyleColor = (style: string) => {
    switch (style) {
      case 'Hài hước':
        return '#FF9800';
      case 'Tinh tế':
        return '#4CAF50';
      case 'Trực diện':
        return '#2196F3';
      default:
        return '#FF4458';
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>Trợ Lý AI Gợi Ý Mở Lời</Text>
              <Text style={styles.subtitle}>Phân tích điểm tương đồng với {partnerName}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FF4458" />
              <Text style={styles.loadingText}>
                Cupid AI đang phân tích sở thích & tính cách 2 bên...
              </Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={fetchIcebreakers}>
                <Text style={styles.retryText}>Thử lại</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              {commonGround ? (
                <View style={styles.commonBox}>
                  <Text style={styles.commonTitle}>Điểm chung phát hiện:</Text>
                  <Text style={styles.commonText}>{commonGround}</Text>
                </View>
              ) : null}

              <Text style={styles.instruction}>
                Chạm vào câu bạn thích nhất để điền vào ô tin nhắn:
              </Text>

              {icebreakers.map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.card}
                  onPress={() => {
                    onSelectIcebreaker(item.text);
                    onClose();
                  }}
                >
                  <View style={styles.styleBadgeRow}>
                    <Text
                      style={[
                        styles.styleBadge,
                        { color: getStyleColor(item.style) },
                      ]}
                    >
                      ● Phong cách: {item.style}
                    </Text>
                  </View>
                  <Text style={styles.cardText}>"{item.text}"</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '75%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FF4458',
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '700',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 14,
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
  },
  errorContainer: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 13,
    marginBottom: 12,
  },
  retryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#FF4458',
    borderRadius: 16,
  },
  retryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  commonBox: {
    backgroundColor: '#FFF0F2',
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
  },
  commonTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF4458',
    marginBottom: 2,
  },
  commonText: {
    fontSize: 13,
    color: '#444',
    lineHeight: 18,
  },
  instruction: {
    fontSize: 12,
    color: '#888',
    marginBottom: 10,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#F8F9FA',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  styleBadgeRow: {
    marginBottom: 6,
  },
  styleBadge: {
    fontSize: 12,
    fontWeight: '700',
  },
  cardText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    fontStyle: 'italic',
  },
});
