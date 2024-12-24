import React, { useState, useEffect } from 'react'
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
  ActivityIndicator
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

export default function Chat() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [remainingChars, setRemainingChars] = useState(500)
  const [isDarkMode, setIsDarkMode] = useState(false)

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

    try {
      setLoading(true)
      const userMessage = newMessage.trim()
      
      // Add the user message to the UI immediately
      const newUserMessage = { role: 'user' as const, content: userMessage }
      setMessages(prev => [...prev, newUserMessage])
      setNewMessage('')
      setRemainingChars(500)

      // Get the current session
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('No session')

      // Send the message to the Edge Function
      const { data, error } = await supabase.functions.invoke('chat', {
        body: { 
          messages: [...messages, newUserMessage]
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      })

      if (error) {
        console.error('Edge Function Error:', error)
        throw error
      }

      if (!data?.message) {
        console.error('Invalid response:', data)
        throw new Error('Invalid response from chat function')
      }

      // Add the assistant's response to the UI
      setMessages(prev => [...prev, { 
        role: 'assistant' as const, 
        content: data.message 
      }])
    } catch (error) {
      console.error('Error:', error)
      if (error instanceof Error) {
        alert(error.message)
      }
    } finally {
      setLoading(false)
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
        styles.iconButton,
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
        styles.iconButton,
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
        styles.container, 
        { backgroundColor: colors.background },
        Platform.OS === 'web' && { height: windowHeight }
      ]}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <View style={[styles.header, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Pastor Chat
          </Text>
          {themeToggleButton}
        </View>

        <ScrollView 
          style={[styles.messagesContainer, { backgroundColor: colors.background }]}
          contentContainerStyle={styles.messagesContent}
        >
          {messages.map((message, index) => (
            <View
              key={index}
              style={[
                styles.messageWrapper,
                message.role === 'user' ? styles.userMessageWrapper : styles.assistantMessageWrapper
              ]}
            >
              <View
                style={[
                  styles.message,
                  message.role === 'user'
                    ? [styles.userMessage, { backgroundColor: colors.userMessage }]
                    : [styles.assistantMessage, { backgroundColor: colors.assistantMessage }]
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    { color: message.role === 'user' ? '#FFFFFF' : colors.text }
                  ]}
                >
                  {message.content}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={[styles.inputContainer, { backgroundColor: colors.cardBackground }]}>
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
              styles.input,
              {
                backgroundColor: colors.inputBackground,
                borderColor: colors.inputBorder,
                color: colors.text
              }
            ]}
            isDarkMode={isDarkMode}
          />
          <View style={styles.inputRightContainer}>
            <View
              style={[
                styles.charCount,
                { backgroundColor: colors.charCountBg }
              ]}
            >
              <Text style={[styles.charCountText, { color: colors.charCount }]}>
                {remainingChars}
              </Text>
            </View>
            <Pressable
              onPress={handleSendMessage}
              disabled={loading || !newMessage.trim()}
              style={({ pressed }) => [
                styles.sendButton,
                { backgroundColor: colors.userMessage },
                (loading || !newMessage.trim()) && styles.buttonDisabled,
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Platform.select({ web: 20, default: 16 }),
    borderBottomWidth: 1,
    borderBottomColor: Platform.select({ web: '#E5E7EB', default: 'transparent' }),
  },
  headerTitle: {
    fontSize: Platform.select({ web: 24, default: 20 }),
    fontWeight: '600',
    fontFamily: Platform.select({ web: 'Georgia, serif', default: 'serif' }),
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
}); 