import Constants from 'expo-constants';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  NativeSyntheticEvent,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TextInputSubmitEditingEventData,
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

const initialMessages: Message[] = [
  {
    id: '1',
    text: 'Good morning! ☀️ I am your daily assistant. How can I make your day better?',
    sender: 'ai',
  },
];

export default function HomeScreen() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const listRef = useRef<FlatList<Message> | null>(null);

  const claudeApiKey =
    Constants.expoConfig?.extra?.claudeApiKey || process.env.CLAUDE_API_KEY || '';

  useEffect(() => {
    if (messages.length > 0) {
      listRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const generateAiResponse = (text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes('hello') || lower.includes('hi')) {
      return 'Hello there! How can I support you today? 😊';
    }
    if (lower.includes('weather')) {
      return 'I can help you check the weather in your area. Where are you located?';
    }
    if (lower.includes('remind') || lower.includes('reminder')) {
      return 'I can help you set a reminder. What would you like to remember?';
    }
    if (lower.includes('joke')) {
      return 'Why did the computer get cold? Because it left its Windows open! 😂';
    }
    return 'That sounds wonderful! I am here to help you get that done. 😊✨';
  };

  const sendMessage = async (textOverride?: string) => {
    const trimmedText = (textOverride ?? inputText).trim();
    if (trimmedText === '') return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: trimmedText,
      sender: 'user',
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    if (!textOverride) {
      setInputText('');
    }
    setIsTyping(true);
    setErrorMessage('');

    if (!claudeApiKey) {
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        text:
          'Claude API key not configured. Add CLAUDE_API_KEY to your environment or expo config to enable real AI replies.',
        sender: 'ai',
      };
      setMessages((prevMessages) => [...prevMessages, fallbackMessage]);
      setIsTyping(false);
      return;
    }

    try {
      const prompt = `Human: ${trimmedText}\n\nAssistant:`;
      const response = await fetch('https://api.anthropic.com/v1/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': claudeApiKey,
        },
        body: JSON.stringify({
          model: 'claude-3.5',
          prompt,
          max_tokens_to_sample: 1000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Claude API error: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      const aiResponse =
        data?.completion ||
        'Sorry, I could not read the response from Claude. Please try again.';

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse.trim(),
        sender: 'ai',
      };
      setMessages((prevMessages) => [...prevMessages, aiMessage]);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown error talking to Claude.';
      setErrorMessage(message);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text:
          'There was a problem connecting to Claude. Check your API key and network connection.',
        sender: 'ai',
      };
      setMessages((prevMessages) => [...prevMessages, aiMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmitEditing = (
    event: NativeSyntheticEvent<TextInputSubmitEditingEventData>
  ) => {
    sendMessage();
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.sender === 'user';
    return (
      <View
        style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.aiBubble,
        ]}
      >
        <Text style={[styles.messageText, isUser ? styles.userText : styles.aiText]}>
          {item.text}
        </Text>
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
          <Text style={styles.headerSubtitle}>
            A professional AI experience for smarter work and daily planning.
          </Text>
        </View>

        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>Built for your mobile workflow</Text>
          <Text style={styles.heroDescription}>
            Send requests, get instant insights, and turn ideas into action with a polished AI workspace.
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
              onSubmitEditing={handleSubmitEditing}
              returnKeyType="send"
            />
            <TouchableOpacity style={styles.sendButton} onPress={() => sendMessage()}>
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
          {isTyping ? <Text style={styles.typingLabel}>Assistant is typing...</Text> : null}
          {errorMessage ? <Text style={styles.errorLabel}>{errorMessage}</Text> : null}
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
  errorLabel: {
    marginTop: 8,
    color: '#B91C1C',
    fontSize: 13,
  },
});
