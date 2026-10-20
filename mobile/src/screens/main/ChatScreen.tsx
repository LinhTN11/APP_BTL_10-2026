import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { apiClient } from '../../api/client';
import { Message } from '../../types';
import { IcebreakerModal } from '../../components/IcebreakerModal';

export const ChatScreen = ({ route }: any) => {
  const { conversationId, partner, matchId } = route.params;
  const { user } = useAuth();
  const { socket } = useSocket();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    fetchHistory();

    if (socket) {
      socket.emit('join_conversation', { conversationId });

      socket.on('receive_message', (msg: any) => {
        setMessages((prev) => [
          ...prev,
          {
            id: msg.id,
            conversationId: msg.conversationId,
            senderId: msg.senderId,
            content: msg.content,
            isMe: msg.senderId === user?.id,
            isAiGenerated: msg.isAiGenerated,
            createdAt: msg.createdAt,
          },
        ]);
        flatListRef.current?.scrollToEnd({ animated: true });
      });

      socket.on('user_typing', (data: any) => {
        if (data.userId !== user?.id) {
          setPartnerTyping(data.isTyping);
        }
      });
    }

    return () => {
      if (socket) {
        socket.off('receive_message');
        socket.off('user_typing');
      }
    };
  }, [conversationId, socket, user?.id]);

  const fetchHistory = async () => {
    try {
      const res = await apiClient.get(`/chat/conversations/${conversationId}/messages`);
      setMessages(res.data.messages || []);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 200);
    } catch (e) {
      console.error('Fetch history error:', e);
    }
  };

  const handleSendMessage = () => {
    if (!inputText.trim() || !socket || !user) return;

    socket.emit('send_message', {
      conversationId,
      senderId: user.id,
      content: inputText.trim(),
      isAiGenerated: false,
    });

    socket.emit('typing_status', {
      conversationId,
      userId: user.id,
      isTyping: false,
    });

    setInputText('');
  };

  const handleSelectIcebreaker = (icebreakerText: string) => {
    // Fill into text input for user review/edit (Human-in-the-loop)
    setInputText(icebreakerText);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Top Header */}
      <View style={styles.header}>
        <Image
          source={{
            uri:
              partner?.avatarUrl ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500',
          }}
          style={styles.avatar}
        />
        <View style={styles.headerInfo}>
          <Text style={styles.partnerName}>{partner?.fullName || 'Người ấy'}</Text>
          <Text style={styles.partnerStatus}>
            {partnerTyping ? 'Đang soạn tin...' : 'Đang hoạt động'}
          </Text>
        </View>

        {/* AI Icebreaker Trigger Button */}
        <TouchableOpacity
          style={styles.aiButtonHeader}
          onPress={() => setShowAiModal(true)}
        >
          <Text style={styles.aiButtonHeaderText}>Gợi ý AI</Text>
        </TouchableOpacity>
      </View>

      {/* Message List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        renderItem={({ item }) => (
          <View
            style={[
              styles.bubbleRow,
              item.isMe ? styles.bubbleRowMe : styles.bubbleRowPartner,
            ]}
          >
            <View
              style={[
                styles.bubble,
                item.isMe ? styles.bubbleMe : styles.bubblePartner,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  item.isMe ? styles.messageTextMe : styles.messageTextPartner,
                ]}
              >
                {item.content}
              </Text>
            </View>
          </View>
        )}
      />

      {/* Fresh Chat AI Banner */}
      {messages.length === 0 ? (
        <View style={styles.freshBanner}>
          <Text style={styles.freshText}>
            Bạn chưa biết bắt đầu từ đâu? Đừng lo lắng!
          </Text>
          <TouchableOpacity
            style={styles.freshAiBtn}
            onPress={() => setShowAiModal(true)}
          >
            <Text style={styles.freshAiBtnText}>
              Nhấn để Cupid AI gợi ý câu mở lời duyên dáng
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Input Bar */}
      <View style={styles.inputBar}>
        <TouchableOpacity
          style={styles.sparkleBtn}
          onPress={() => setShowAiModal(true)}
        >
          <Text style={styles.sparkleIcon}>AI</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.textInput}
          placeholder="Nhập tin nhắn..."
          placeholderTextColor="#999"
          value={inputText}
          onChangeText={(text) => {
            setInputText(text);
            if (socket && user) {
              socket.emit('typing_status', {
                conversationId,
                userId: user.id,
                isTyping: text.length > 0,
              });
            }
          }}
          multiline
        />

        <TouchableOpacity
          style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
          onPress={handleSendMessage}
          disabled={!inputText.trim()}
        >
          <Text style={styles.sendIcon}>➤</Text>
        </TouchableOpacity>
      </View>

      {/* AI Icebreaker Bottom Sheet Modal */}
      <IcebreakerModal
        visible={showAiModal}
        matchId={matchId || conversationId}
        partnerName={partner?.fullName || 'Người ấy'}
        onClose={() => setShowAiModal(false)}
        onSelectIcebreaker={handleSelectIcebreaker}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  avatar: { width: 44, height: 44, borderRadius: 22, marginRight: 12 },
  headerInfo: { flex: 1 },
  partnerName: { fontSize: 16, fontWeight: '700', color: '#333' },
  partnerStatus: { fontSize: 12, color: '#4CAF50' },
  aiButtonHeader: {
    backgroundColor: '#FFF0F2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FF4458',
  },
  aiButtonHeaderText: { color: '#FF4458', fontSize: 12, fontWeight: '700' },
  messageList: { padding: 16, paddingBottom: 24 },
  bubbleRow: { flexDirection: 'row', marginVertical: 4 },
  bubbleRowMe: { justifyContent: 'flex-end' },
  bubbleRowPartner: { justifyContent: 'flex-start' },
  bubble: { maxWidth: '80%', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18 },
  bubbleMe: { backgroundColor: '#FF4458', borderBottomRightRadius: 4 },
  bubblePartner: { backgroundColor: '#fff', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#E9ECEF' },
  messageText: { fontSize: 15, lineHeight: 20 },
  messageTextMe: { color: '#fff' },
  messageTextPartner: { color: '#333' },
  freshBanner: {
    backgroundColor: '#FFF0F2',
    margin: 16,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF4458',
  },
  freshText: { fontSize: 13, color: '#666', marginBottom: 10, textAlign: 'center' },
  freshAiBtn: {
    backgroundColor: '#FF4458',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  freshAiBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },
  sparkleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFF0F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  sparkleIcon: { fontSize: 13, fontWeight: '800', color: '#FF4458' },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 14,
    color: '#333',
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FF4458',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendBtnDisabled: { backgroundColor: '#ccc' },
  sendIcon: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
