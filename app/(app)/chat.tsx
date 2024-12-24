import React, { useState, useEffect, useRef } from 'react'
import { 
  View, 
  StyleSheet, 
  Platform, 
  ScrollView, 
  TextInput, 
  KeyboardAvoidingView,
  SafeAreaView,
  Keyboard,
  TouchableWithoutFeedback,
  Dimensions,
  Pressable,
  ActivityIndicator,
  Animated,
  ViewStyle
} from 'react-native'
import { Text, Icon } from '@rneui/themed'
import { supabase } from '../../lib/supabase'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useRouter } from 'expo-router'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const WebTextArea = ({ 
  value, 
  onChangeText, 
  onSubmit, 
  placeholder,
  maxLength,
  style,
  isDarkMode
}: { 
  value: string
  onChangeText: (text: string) => void
  onSubmit: () => void
  placeholder: string
  maxLength: number
  style: any
  isDarkMode: boolean
}) => {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSubmit()
    }
  }

  const webStyle = Platform.OS === 'web' ? {
    flex: 1,
    outline: 'none',
    resize: 'none' as const,
    border: `1.5px solid ${isDarkMode ? '#4D4D4D' : '#D4C5B9'}`,
    backgroundColor: isDarkMode ? '#2D2D2D' : '#FFFFFF',
    color: isDarkMode ? '#FFFFFF' : '#4A3728',
    fontSize: '16px',
    fontFamily: 'Georgia, serif',
    borderRadius: '12px',
    padding: '8px 12px',
    height: '40px',
    width: '100%',
    boxSizing: 'border-box' as const,
    overflow: 'hidden' as const,
  } : {}

  return Platform.OS === 'web' ? (
    <textarea
      value={value}
      onChange={(e) => onChangeText(e.target.value)}
      onKeyDown={handleKeyPress}
      placeholder={placeholder}
      style={webStyle}
      maxLength={maxLength}
    />
  ) : (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={isDarkMode ? '#6B6B6B' : '#9CA3AF'}
      multiline
      maxLength={maxLength}
      style={[style, { textAlignVertical: 'top' }]}
      onSubmitEditing={onSubmit}
      keyboardAppearance={isDarkMode ? 'dark' : 'light'}
    />
  )
}

// Create base styles outside components
const baseStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: Platform.OS === 'web' ? 'space-between' : 'center',
    padding: Platform.select({ web: 20, default: 16 }),
    borderBottomWidth: 1,
    borderBottomColor: Platform.select({ web: '#E5E7EB', default: 'transparent' }),
  },
  headerTitle: {
    fontSize: Platform.select({ web: 24, default: 20 }),
    fontWeight: '600',
    fontFamily: Platform.select({ web: 'Georgia, serif', default: 'serif' }),
    flex: Platform.OS === 'web' ? 0 : 1,
    textAlign: Platform.OS === 'web' ? 'left' : 'center',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: Platform.select({ web: 20, default: 16 }),
    gap: 16,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  userMessageWrapper: {
    justifyContent: 'flex-end',
  },
  assistantMessageWrapper: {
    justifyContent: 'flex-start',
  },
  message: {
    maxWidth: '80%',
    borderRadius: 16,
    padding: Platform.select({ web: 16, default: 12 }),
  },
  userMessage: {
    borderTopRightRadius: 4,
  },
  assistantMessage: {
    borderTopLeftRadius: 4,
  },
  messageText: {
    fontSize: Platform.select({ web: 16, default: 15 }),
    lineHeight: Platform.select({ web: 24, default: 22 }),
    fontFamily: Platform.select({ web: 'Georgia, serif', default: 'serif' }),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: Platform.select({ web: 20, default: 16 }),
    borderTopWidth: 1,
    borderTopColor: Platform.select({ web: '#E5E7EB', default: 'transparent' }),
    gap: 12,
  },
  input: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 40,
    maxHeight: 120,
    fontSize: Platform.select({ web: 16, default: 15 }),
    fontFamily: Platform.select({ web: 'Georgia, serif', default: 'serif' }),
  },
  inputRightContainer: {
    flexDirection: 'column',
    gap: 8,
    justifyContent: 'flex-end',
  },
  charCount: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  charCountText: {
    fontSize: 12,
    fontFamily: Platform.select({ web: 'Georgia, serif', default: 'serif' }),
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4,
    minWidth: 52,
    borderRadius: 16,
    borderTopLeftRadius: 4,
    alignSelf: 'flex-start',
    margin: Platform.select({ web: 16, default: 12 }),
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    opacity: 0.7,
  },
});

const TypingIndicator = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const [dots] = useState(() => [
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0)
  ]);

  useEffect(() => {
    const animations = dots.map((dot, index) => {
      return Animated.sequence([
        Animated.delay(index * 200),
        Animated.loop(
          Animated.sequence([
            Animated.timing(dot, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(dot, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            })
          ])
        )
      ]);
    });

    Animated.parallel(animations).start();

    return () => {
      dots.forEach(dot => dot.setValue(0));
    };
  }, []);

  const containerStyle: ViewStyle = {
    backgroundColor: isDarkMode ? '#3D3D3D' : '#F5EDE6',
    padding: Platform.select({ web: 16, default: 12 }),
    borderRadius: 16,
    borderTopLeftRadius: 4,
    flexDirection: 'row',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    minWidth: 60,
    minHeight: 36,
    alignSelf: 'flex-start',
    marginVertical: 4,
    marginHorizontal: Platform.select({ web: 16, default: 12 }),
  };

  const dotStyle: ViewStyle = {
    backgroundColor: isDarkMode ? '#787880' : '#8E8E93',
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 3,
    opacity: 0.7,
  };

  return (
    <View style={containerStyle}>
      {dots.map((dot, index) => (
        <Animated.View
          key={index}
          style={[
            dotStyle,
            {
              transform: [{
                translateY: dot.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -6]
                })
              }]
            }
          ]}
        />
      ))}
    </View>
  );
};

export default function Chat() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [remainingChars, setRemainingChars] = useState(500)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const scrollViewRef = useRef<ScrollView>(null)

  // Load saved theme preference
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        if (Platform.OS === 'web') {
          const savedTheme = localStorage.getItem('themePreference')
          if (savedTheme !== null) {
            setIsDarkMode(savedTheme === 'dark')
          }
        } else {
          const savedTheme = await AsyncStorage.getItem('themePreference')
          if (savedTheme !== null) {
            setIsDarkMode(savedTheme === 'dark')
          }
        }
      } catch (error) {
        console.error('Error loading theme preference:', error)
      }
    }

    loadThemePreference()
  }, [])

  // Save theme preference when it changes
  const handleThemeChange = async (darkMode: boolean) => {
    try {
      const themeValue = darkMode ? 'dark' : 'light'
      if (Platform.OS === 'web') {
        localStorage.setItem('themePreference', themeValue)
      } else {
        await AsyncStorage.setItem('themePreference', themeValue)
      }
      setIsDarkMode(darkMode)
    } catch (error) {
      console.error('Error saving theme preference:', error)
    }
  }

  useEffect(() => {
    // Add initial welcome message
    setMessages([{
      role: 'assistant',
      content: "Hello! I'm your pastoral assistant. Feel free to share what's on your mind, ask questions about faith, or seek guidance. I'm here to help and provide biblical wisdom for your journey."
    }])
  }, [])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || loading) return

    const userMessage = newMessage.trim()
    setNewMessage('')
    setRemainingChars(500)
    setLoading(true)

    // Add user message immediately
    const newUserMessage: Message = { role: 'user', content: userMessage }
    setMessages(prev => [...prev, newUserMessage])

    try {
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('No session')

      // Create a new message for the streaming response
      setMessages(prev => [...prev, { role: 'assistant', content: '' }])

      // Send the message to the streaming Edge Function
      const response = await fetch(`${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/chat-stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          messages: [...messages, newUserMessage]
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Different handling for web and mobile platforms
      if (Platform.OS === 'web') {
        // Web platform - use streaming
        const reader = response.body?.getReader()
        if (!reader) throw new Error('No response body')

        const decoder = new TextDecoder()
        let accumulatedMessage = ''

        try {
          while (true) {
            const { value, done } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value, { stream: true })
            accumulatedMessage += chunk

            setMessages(currentMessages => {
              const newMessages = [...currentMessages]
              if (newMessages.length > 0) {
                newMessages[newMessages.length - 1] = {
                  role: 'assistant',
                  content: accumulatedMessage
                }
              }
              return newMessages
            })

            scrollViewRef.current?.scrollToEnd({ animated: true })
          }
        } catch (streamError) {
          console.error('Stream error:', streamError)
          throw new Error('Error processing stream')
        }
      } else {
        // Mobile platform - use text response
        try {
          const text = await response.text()
          
          // Update gradually to simulate streaming
          let displayedText = ''
          const textArray = text.split('')
          
          for (let i = 0; i < textArray.length; i++) {
            displayedText += textArray[i]
            setMessages(currentMessages => {
              const newMessages = [...currentMessages]
              if (newMessages.length > 0) {
                newMessages[newMessages.length - 1] = {
                  role: 'assistant',
                  content: displayedText
                }
              }
              return newMessages
            })
            
            // Add a small delay between characters
            await new Promise(resolve => setTimeout(resolve, 10))
            scrollViewRef.current?.scrollToEnd({ animated: true })
          }
        } catch (textError) {
          console.error('Text processing error:', textError)
          throw new Error('Error processing response')
        }
      }
    } catch (error) {
      console.error('Error:', error)
      setMessages(currentMessages => {
        const newMessages = [...currentMessages]
        if (newMessages.length > 0) {
          newMessages[newMessages.length - 1] = {
            role: 'assistant',
            content: 'I apologize, but I encountered an error. Please try again.'
          }
        }
        return newMessages
      })
    } finally {
      setLoading(false)
      scrollViewRef.current?.scrollToEnd({ animated: true })
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const getThemeColors = () => {
    if (isDarkMode) {
      return {
        background: '#2D2D2D',
        cardBackground: '#2D2D2D',
        text: '#FFFFFF',
        subtext: '#B0B0B0',
        userMessage: '#8B5E34',
        assistantMessage: '#3D3D3D',
        inputBackground: '#3D3D3D',
        inputBorder: '#4D4D4D',
        charCount: '#B0B0B0',
        charCountBg: '#3D3D3D',
      }
    }
    return {
      background: '#FFFFFF',
      cardBackground: '#FFFFFF',
      text: '#4A3728',
      subtext: '#6B584A',
      userMessage: '#8B5E34',
      assistantMessage: '#F5EDE6',
      inputBackground: '#FFFFFF',
      inputBorder: '#D4C5B9',
      charCount: '#6B584A',
      charCountBg: '#F5EDE6',
    }
  }

  const colors = getThemeColors()

  // Update theme toggle button in both web and iOS renders
  const themeToggleButton = (
    <Pressable
      onPress={() => handleThemeChange(!isDarkMode)}
      style={({ pressed }) => [
        baseStyles.iconButton,
        pressed && { opacity: 0.7 }
      ]}
    >
      <Icon
        name={isDarkMode ? 'sunny-outline' : 'moon-outline'}
        type="ionicon"
        color={colors.text}
        size={24}
      />
    </Pressable>
  )

  // Back button component
  const BackButton = (
    <Pressable
      onPress={() => router.replace('/(app)/account')}
      style={({ pressed }) => [
        baseStyles.iconButton,
        pressed && { opacity: 0.7 }
      ]}
    >
      <Icon
        name="arrow-back-outline"
        type="ionicon"
        color={colors.text}
        size={24}
      />
    </Pressable>
  )

  // Add windowHeight to track viewport height for mobile
  const windowHeight = Platform.OS === 'web' ? Dimensions.get('window').height : undefined;

  // Update the main return JSX to better handle mobile web
  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[
        baseStyles.container, 
        { backgroundColor: colors.background },
        Platform.OS === 'web' && { height: windowHeight }
      ]}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <View style={[baseStyles.header, { backgroundColor: colors.cardBackground }]}>
          {Platform.OS !== 'web' && BackButton}
          <Text style={[baseStyles.headerTitle, { color: colors.text }]}>
            Pastor Chat
          </Text>
          {themeToggleButton}
        </View>

        <ScrollView 
          style={[baseStyles.messagesContainer, { backgroundColor: colors.background }]}
          contentContainerStyle={baseStyles.messagesContent}
          ref={scrollViewRef}
        >
          {messages.map((message, index) => (
            <View
              key={index}
              style={[
                baseStyles.messageWrapper,
                message.role === 'user' ? baseStyles.userMessageWrapper : baseStyles.assistantMessageWrapper
              ]}
            >
              {message.role === 'assistant' && 
               index === messages.length - 1 && 
               loading && 
               message.content === '' ? (
                <TypingIndicator isDarkMode={isDarkMode} />
              ) : (
                <View
                  style={[
                    baseStyles.message,
                    message.role === 'user'
                      ? [baseStyles.userMessage, { backgroundColor: colors.userMessage }]
                      : [baseStyles.assistantMessage, { backgroundColor: colors.assistantMessage }]
                  ]}
                >
                  <Text
                    style={[
                      baseStyles.messageText,
                      { color: message.role === 'user' ? '#FFFFFF' : colors.text }
                    ]}
                  >
                    {message.content}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </ScrollView>

        <View style={[baseStyles.inputContainer, { backgroundColor: colors.cardBackground }]}>
          <WebTextArea
            value={newMessage}
            onChangeText={(text) => {
              setNewMessage(text)
              setRemainingChars(500 - text.length)
            }}
            onSubmit={handleSendMessage}
            placeholder="Type your message..."
            maxLength={500}
            style={[
              baseStyles.input,
              {
                backgroundColor: colors.inputBackground,
                borderColor: colors.inputBorder,
                color: colors.text
              }
            ]}
            isDarkMode={isDarkMode}
          />
          <View style={baseStyles.inputRightContainer}>
            <View
              style={[
                baseStyles.charCount,
                { backgroundColor: colors.charCountBg }
              ]}
            >
              <Text style={[baseStyles.charCountText, { color: colors.charCount }]}>
                {remainingChars}
              </Text>
            </View>
            <Pressable
              onPress={handleSendMessage}
              disabled={loading || !newMessage.trim()}
              style={({ pressed }) => [
                baseStyles.sendButton,
                { backgroundColor: colors.userMessage },
                (loading || !newMessage.trim()) && baseStyles.buttonDisabled,
                pressed && { opacity: 0.7 }
              ]}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Icon name="send" type="ionicon" color="#FFFFFF" size={20} />
              )}
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  )
} 