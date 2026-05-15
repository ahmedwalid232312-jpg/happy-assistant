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
  sender: 'user' | 'assistant';
  time: string;
};

const quickActions = [
  {
    label: 'Plan my day / خطط يومي',
    prompt: 'Help me plan my day with a morning routine and 3 top priorities.',
  },
  {
    label: 'Write email / اكتب بريدًا',
    prompt: 'Draft a professional email requesting a meeting next week.',
  },
  {
    label: 'Set reminder / اضبط تذكيرًا',
    prompt: 'Create a quick reminder for my workout tomorrow at 7 AM.',
  },
  {
    label: 'Find music / ابحث عن موسيقى',
    prompt: 'Find a song or music recommendation for a relaxed evening.',
  },
  {
    label: 'مرحبا / Hello',
    prompt: 'مرحبا، كيف يمكنني مساعدتك اليوم؟',
  },
];

const initialMessages: Message[] = [
  {
    id: '1',
    text: 'Welcome to Modern. I am your local assistant, designed to behave like a polished chat experience. / مرحبًا بك في مودرن. أنا مساعدك المحلي المصمم ليكون تجربة دردشة احترافية.',
    sender: 'assistant',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  },
];

const replyMap: { match: RegExp; reply: string }[] = [
  {
    match: /\b(hello|hi|hey|مرحبا|أهلاً|أهلا|هلا)\b/i,
    reply: 'Hello! I can help you with planning, writing, brainstorming, or any quick question.',
  },
  {
    match: /\b(plan|schedule|today|tomorrow|خطط|جدول|اليوم|غداً)\b/i,
    reply: 'Absolutely. Share your goals and I will create a clean plan for your day.',
  },
  {
    match: /\b(email|meeting|invite|request|بريد|اجتماع|دعوة|طلب)\b/i,
    reply: 'I can draft a strong professional message for you. Tell me the subject and audience.',
  },
  {
    match: /\b(remind|reminder|remember|note|تذكير|ذكر|ملاحظة)\b/i,
    reply: 'I can format a reminder for you with the right details and timing.',
  },
  {
    match: /\b(music|song|track|playlist|أغنية|موسيقى|برومو)\b/i,
    reply: 'Looking for music? I recommend a relaxing playlist with soulful tracks and popular new hits.',
  },
  {
    match: /\b(thank|thanks|شكراً|شكرا|متشكر|مشكور)\b/i,
    reply: 'You are welcome! Feel free to ask for anything else.',
  },
  {
    match: /(?:\b|^)(?:what is|who is|define|explain|how do i|how can i|why does|why is|when should|where can i|where is|how to)\b/i,
    reply: 'That sounds like a good question. I can explain it clearly and help you understand the best next steps.',
  },
  {
    match: /(?:\b|^)(?:كيف|ما هو|ما هي|من هو|من هي|عرف|اشرح|كيف يمكنني|كيف أفعل|لماذا|متى|أين)\b/i,
    reply: 'بالطبع! أرسل سؤالك وسأقدّم لك إجابة واضحة ومفيدة قدر الإمكان.',
  },
];

const arabicDefaultReply =
  'رائع! يمكنني مساعدتك في الأفكار والتنظيم والمشورة الواضحة. أخبرني بالمزيد لأرد بدقة.';

const generateLocalReply = (text: string) => {
  const cleanedText = text.trim();
  const candidate = replyMap.find((item) => item.match.test(cleanedText));
  const isArabic = /[\u0600-\u06FF]/.test(cleanedText);
  const isQuestion = /[؟?]$/.test(cleanedText) || /\b(what|why|how|when|where|who|which|did|do|does|can|could|would|should|هل|متى|أين|كيف|لماذا|ما|من)\b/i.test(cleanedText);

  if (candidate) {
    return candidate.reply;
  }

  if (isQuestion) {
    return isArabic
      ? `بالطبع، سؤالك: "${cleanedText}". سأقدّم لك إجابة مفيدة وواضحة بناءً على ذلك.`
      : `Sure, your question is: "${cleanedText}". Here is a helpful and clear answer based on that.`;
  }

  return isArabic
    ? arabicDefaultReply
    : 'That sounds great. I can help with ideas, organization, and clear advice. Tell me more so I can respond precisely.';
};

const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export default function HomeScreen() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const listRef = useRef<FlatList<Message> | null>(null);

  useEffect(() => {
    if (messages.length > 0) {
      listRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const sendMessage = (overrideText?: string) => {
    const messageText = (overrideText ?? inputText).trim();
    if (!messageText) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
      time: formatTime(new Date()),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!overrideText) {
      setInputText('');
    }
    setIsTyping(true);

    const aiReply = generateLocalReply(messageText);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: aiReply,
          sender: 'assistant',
          time: formatTime(new Date()),
        },
      ]);
      setIsTyping(false);
    }, 600);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.sender === 'user';
    const isRtl = /[\u0600-\u06FF]/.test(item.text);
    return (
      <View style={[styles.messageRow, isUser ? styles.messageRowUser : styles.messageRowAssistant]}>
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.assistantBubble]}>
          <View style={styles.metaRow}>
            <Text style={[styles.messageLabel, isUser ? styles.userLabel : styles.assistantLabel]}>
              {isUser ? 'You' : 'Modern'}
            </Text>
            <Text style={styles.messageTime}>{item.time}</Text>
          </View>
          <Text
            style={[
              styles.messageText,
              isUser ? styles.userText : styles.assistantText,
              isRtl ? styles.rtlText : styles.ltrText,
            ]}
          >
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>Modern</Text>
        <Text style={styles.topBarSubtitle}>Professional local chat assistant • مساعد محلي احترافي</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.chatContainer}
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.actionBar}>
          <Text style={styles.actionTitle}>Try a prompt / جرّب سؤال</Text>
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

        <View style={styles.footer}>
          <TextInput
            style={styles.input}
            placeholder="Send a message... / أرسل رسالة..."
            placeholderTextColor="#9CA3AF"
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={() => sendMessage()}
            returnKeyType="send"
          />
          <TouchableOpacity style={styles.sendButton} onPress={() => sendMessage()}>
            <Text style={styles.sendButtonText}>Send / إرسال</Text>
          </TouchableOpacity>
        </View>

        {isTyping ? (
          <View style={styles.typingContainer}>
            <Text style={styles.typingText}>Modern is typing...</Text>
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F7FB' },
  topBar: {
    paddingHorizontal: 20,
    paddingVertical: 18,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  topBarTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
  },
  topBarSubtitle: {
    marginTop: 4,
    fontSize: 14,
    color: '#64748B',
  },
  container: { flex: 1 },
  chatContainer: { padding: 16, paddingBottom: 20 },
  messageRow: { marginBottom: 10 },
  messageRowUser: { alignItems: 'flex-end' },
  messageRowAssistant: { alignItems: 'flex-start' },
  messageBubble: {
    maxWidth: '88%',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  userBubble: {
    backgroundColor: '#2563EB',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  messageLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  userLabel: {
    color: '#E0F2FE',
  },
  assistantLabel: {
    color: '#0F172A',
  },
  messageTime: {
    fontSize: 12,
    color: '#94A3B8',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
  },
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  ltrText: {
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  userText: {
    color: '#FFFFFF',
  },
  assistantText: {
    color: '#0F172A',
  },
  actionBar: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  actionTitle: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  quickActionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickActionButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  quickActionText: {
    color: '#1D4ED8',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
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
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  typingContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#F8FAFC',
  },
  typingText: {
    color: '#475569',
    fontSize: 13,
  },
});
