import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Platform, KeyboardAvoidingView, TextInput, NativeSyntheticEvent, TextInputKeyPressEventData } from 'react-native';
import { Text, Button } from '@rneui/themed';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatHistory {
  role: string;
  content: string;
}

const MAX_CHARS = 120;

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! How can I help you with biblical guidance today?',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [inputText, setInputText] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  const router = useRouter();

  useEffect(() => {
    // Scroll to bottom whenever messages change
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSend = async () => {
    if (inputText.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: inputText.trim(),
        isUser: true,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, newMessage]);
      setInputText('');

      try {
        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (!session) throw new Error('No active session');

        // Update chat history with user's message
        const updatedHistory = [
          ...chatHistory,
          { role: 'user', content: newMessage.text }
        ];
        setChatHistory(updatedHistory);

        // Call the edge function with auth token and chat history
        const { data, error } = await supabase.functions.invoke('chat', {
          body: { 
            text: newMessage.text,
            messages: updatedHistory
          },
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (error) throw error;

        // Add the bot response to chat history
        setChatHistory(prev => [...prev, { role: 'assistant', content: data.message }]);

        // Add the bot response to messages
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: data.message,
          isUser: false,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, botResponse]);
      } catch (error: any) {
        console.error('Error calling edge function:', error);
        // Add an error message
        const errorResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: error?.message || 'Sorry, there was an error processing your message.',
          isUser: false,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorResponse]);
      }
    }
  };

  const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
    // On web, we need to handle the shift+enter case
    if (Platform.OS === 'web') {
      const nativeEvent = e.nativeEvent as unknown as KeyboardEvent;
      if (nativeEvent.key === 'Enter') {
        if (!nativeEvent.shiftKey) {
          e.preventDefault?.();
          handleSend();
          // Refocus the input after sending
          inputRef.current?.focus();
          return false;
        }
        return true;
      }
    } else if (e.nativeEvent.key === 'Enter') {
      // On mobile, Enter always sends
      handleSend();
      return false;
    }
    return true;
  };

  const handleChangeText = (text: string) => {
    if (text.length <= MAX_CHARS) {
      setInputText(text);
    }
  };

  const getCharCountStyle = () => {
    const remaining = MAX_CHARS - inputText.length;
    if (remaining <= 20) {
      return styles.charCountWarning;
    }
    if (remaining <= 50) {
      return styles.charCountCaution;
    }
    return [styles.charCount, isDarkMode && styles.charCountDark];
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, isDarkMode && styles.containerDark]}
    >
      <View style={[styles.header, isDarkMode && styles.headerDark]}>
        <Button
          type="clear"
          icon={{ name: 'arrow-back', color: isDarkMode ? '#e2e8f0' : '#4a5568' }}
          onPress={() => router.back()}
        />
        <Text style={[styles.headerTitle, isDarkMode && styles.headerTitleDark]}>Chat Assistant</Text>
        <Button
          type="clear"
          icon={{ 
            name: isDarkMode ? 'light-mode' : 'dark-mode', 
            color: isDarkMode ? '#e2e8f0' : '#4a5568',
            type: 'material'
          }}
          onPress={toggleDarkMode}
        />
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageBubble,
              message.isUser ? styles.userMessage : [styles.botMessage, isDarkMode && styles.botMessageDark],
            ]}
          >
            <Text 
              style={[
                styles.messageText,
                message.isUser ? styles.userMessageText : isDarkMode && styles.messageTextDark,
                Platform.OS === 'web' && { whiteSpace: 'pre-wrap' } as any
              ]}
            >
              {message.text}
            </Text>
            <Text style={[
              styles.timestamp,
              message.isUser ? styles.userTimestamp : isDarkMode && styles.timestampDark
            ]}>
              {message.timestamp.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View style={[styles.inputContainer, isDarkMode && styles.inputContainerDark]}>
        <View style={[styles.inputWrapper, isDarkMode && styles.inputWrapperDark]}>
          <View style={styles.textInputContainer}>
            <TextInput
              ref={inputRef}
              style={[
                styles.input,
                isDarkMode && styles.inputDark,
                Platform.OS === 'web' && { whiteSpace: 'pre-wrap' } as any
              ]}
              value={inputText}
              onChangeText={handleChangeText}
              placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
              placeholderTextColor={isDarkMode ? '#718096' : '#a0aec0'}
              multiline
              maxLength={MAX_CHARS}
              onKeyPress={handleKeyPress}
              blurOnSubmit={false}
              returnKeyType="send"
            />
          </View>
          <View style={[styles.charCountContainer, isDarkMode && styles.charCountContainerDark]}>
            <Text style={getCharCountStyle()}>
              {MAX_CHARS - inputText.length}
            </Text>
          </View>
        </View>
        <Button
          icon={{ name: 'send', color: inputText.trim() ? 'white' : (isDarkMode ? '#222222' : '#718096') }}
          onPress={handleSend}
          buttonStyle={[
            styles.sendButton,
            isDarkMode && styles.sendButtonDark,
            !inputText.trim() && (isDarkMode ? styles.sendButtonDisabledDark : styles.sendButtonDisabled)
          ]}
          disabled={!inputText.trim()}
          disabledStyle={{}}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7fafc',
  },
  containerDark: {
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerDark: {
    backgroundColor: '#111111',
    borderBottomColor: '#222222',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3748',
  },
  headerTitleDark: {
    color: '#ffffff',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  userMessage: {
    backgroundColor: '#5469d4',
    alignSelf: 'flex-end',
    borderTopRightRadius: 4,
  },
  botMessage: {
    backgroundColor: 'white',
    alignSelf: 'flex-start',
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  botMessageDark: {
    backgroundColor: '#1a1a1a',
    borderColor: '#333333',
  },
  messageText: {
    fontSize: 16,
    color: '#2d3748',
  },
  messageTextDark: {
    color: '#ffffff',
  },
  userMessageText: {
    color: 'white',
  },
  timestamp: {
    fontSize: 12,
    color: '#a0aec0',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  timestampDark: {
    color: '#888888',
  },
  userTimestamp: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    alignItems: 'flex-end',
  },
  inputContainerDark: {
    backgroundColor: '#111111',
    borderTopColor: '#222222',
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginRight: 8,
    backgroundColor: '#f7fafc',
    borderRadius: 20,
    paddingRight: 8,
    paddingVertical: 4,
  },
  inputWrapperDark: {
    backgroundColor: '#1a1a1a',
  },
  textInputContainer: {
    flex: 1,
    marginRight: 8,
  },
  input: {
    minHeight: 40,
    maxHeight: 100,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    fontSize: 16,
    color: '#2d3748',
  },
  inputDark: {
    color: '#ffffff',
  },
  charCountContainer: {
    backgroundColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'center',
    minWidth: 45,
  },
  charCountContainerDark: {
    backgroundColor: '#333333',
  },
  charCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4a5568',
    textAlign: 'center',
  },
  charCountDark: {
    color: '#ffffff',
  },
  charCountCaution: {
    fontSize: 14,
    fontWeight: '600',
    color: '#d97706',
    textAlign: 'center',
  },
  charCountWarning: {
    fontSize: 14,
    fontWeight: '600',
    color: '#dc2626',
    textAlign: 'center',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    padding: 0,
    backgroundColor: '#5469d4',
  },
  sendButtonDark: {
    backgroundColor: '#1a1a1a',
  },
  sendButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  sendButtonDisabledDark: {
    backgroundColor: '#0a0a0a',
  },
}); 