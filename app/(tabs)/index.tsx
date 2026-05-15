import Constants from 'expo-constants';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'ai';
};

const quickActions = [
  {
    label: 'Plan my day',
    prompt: 'Help me plan my day with a morning routine and 3 top priorities.',
  },
  {
    label: 'Write email',
    prompt: 'Write a professional email requesting a meeting next week.',
  },
  {
    label: 'Set reminder',
    prompt: 'Set a reminder for my workout tomorrow at 7 AM.',
  },
];

const fallbackMessages: Message[] = [
  {
    id: '1',
    text: 'Hello! I am your local assistant. Ask me anything and I will respond without cloud services.',
    sender: 'ai',
  },
];

const generateLocalReply = (text: string) => {
  const lower = text.toLowerCase();
  if (lower.includes('hello') || lower.includes('hi')) {
    return 'Hi! I can help you plan, write, or answer questions using local logic.';
  }
  if (lower.includes('plan') || lower.includes('schedule')) {
    return 'Sure, I can help you outline your day and priorities. Tell me your main goals.';
  }
  if (lower.includes('email')) {
    return 'I can draft an email for you. Share who it is for and the main message.';
  }
  if (lower.includes('remind') || lower.includes('reminder')) {
    return 'I can help you remember something. What should I remind you about and when?';
  }
  if (lower.includes('thank')) {
    return 'You are welcome! Ask me anything else when you are ready.';
  }
  return 'That sounds great! I am here to help with ideas, planning, and quick answers.';
};

export default function HomeScreen() {
  const [messages, setMessages] = useState<Message[]>(fallbackMessages);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const listRef = useRef<FlatList<Message> | null>(null);

  useEffect(() => {
    if (messages.length > 0) {
      listRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const sendMessage = async (textOverride?: string) => {
    const message = (textOverride ?? inputText).trim();
    if (!message) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: 'user',
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textOverride) {
      setInputText('');
    }
    setIsTyping(true);

    const aiReply = generateLocalReply(message);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: aiReply,
          sender: 'ai',
        },
      ]);
      setIsTyping(false);
    }, 500);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.sender === 'user';
    return (
      <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble]}>
        <Text style={[styles.messageText, isUser ? styles.userText : styles.aiText]}>{item.text}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Modern</Text>
          <Text style={styles.headerSubtitle}>Manual assistant mode — no cloud service required.</Text>
        </View>

        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>Local thinking, polished design</Text>
          <Text style={styles.heroDescription}>
            Ask questions, get structured replies, and use quick prompts all from local app logic.
          </Text>
          <View style={styles.quickActionRow}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.label}
                style={styles.quickActionButton}
                onPress={() => sendMessage(action.prompt)}
              >
                <Text style={styles.quickActionText}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.chatContainer}
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.footer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              placeholderTextColor="#9CA3AF"
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={() => sendMessage()}
              returnKeyType="send"
            />
            <TouchableOpacity style={styles.sendButton} onPress={() => sendMessage()}>
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
          {isTyping ? <Text style={styles.typingLabel}>Assistant is typing...</Text> : null}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { flex: 1 },
  header: {
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    marginTop: 8,
    color: '#475569',
    fontSize: 15,
    lineHeight: 22,
    maxWidth: '92%',
  },
  heroCard: {
    marginHorizontal: 16,
    marginVertical: 16,
    padding: 20,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 8,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  heroDescription: {
    marginTop: 10,
    color: '#475569',
    fontSize: 15,
    lineHeight: 22,
  },
  quickActionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 18,
  },
  quickActionButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: '#EFF6FF',
  },
  quickActionText: {
    color: '#1D4ED8',
    fontWeight: '600',
  },
  chatContainer: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  messageBubble: {
    maxWidth: '82%',
    padding: 16,
    borderRadius: 22,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: '#2563EB',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 6,
  },
  aiBubble: {
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
  },
  userText: {
    color: '#FFFFFF',
  },
  aiText: {
    color: '#0F172A',
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  inputWrapper: {
    flexDirection: 'row',
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 16,
    color: '#0F172A',
  },
  sendButton: {
    backgroundColor: '#2563EB',
    borderRadius: 999,
    paddingHorizontal: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  typingLabel: {
    marginTop: 10,
    color: '#64748B',
    fontSize: 13,
  },
});
