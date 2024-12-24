import React, { useState, useEffect } from 'react'
import { View, StyleSheet, Platform, ScrollView } from 'react-native'
import { Text, Button, Icon } from '@rneui/themed'
import { supabase } from '../../lib/supabase'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [remainingChars, setRemainingChars] = useState(500)
  const [isDarkMode, setIsDarkMode] = useState(false)

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
      setRemainingChars(120)

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
        background: '#1A1A1A',
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
      background: '#FBF7F4',
      cardBackground: 'white',
      text: '#4A3728',
      subtext: '#6B584A',
      userMessage: '#8B5E34',
      assistantMessage: '#F5EDE6',
      inputBackground: 'white',
      inputBorder: '#D4C5B9',
      charCount: '#6B584A',
      charCountBg: '#F5EDE6',
    }
  }

  const colors = getThemeColors()

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={{ flex: 1 }} />
            <View style={styles.titleContainer}>
              <Text style={[styles.title, { color: colors.text }]}>Pastor Chat</Text>
              <Text style={[styles.subtitle, { color: colors.subtext }]}>
                Start a conversation with a Pastor!
              </Text>
            </View>
            <View style={styles.themeToggleContainer}>
              <Button
                icon={
                  <Icon
                    name={isDarkMode ? 'sunny-outline' : 'moon-outline'}
                    type="ionicon"
                    color={colors.text}
                    size={24}
                  />
                }
                type="clear"
                onPress={() => setIsDarkMode(!isDarkMode)}
              />
            </View>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.inputBorder }]} />
        </View>

        <View style={styles.chatContainer}>
          <ScrollView style={styles.messagesContainer}>
            {messages.map((message, index) => (
              <View
                key={index}
                style={[
                  styles.messageWrapper,
                  message.role === 'user' 
                    ? [styles.userMessage, { backgroundColor: colors.userMessage }]
                    : [styles.assistantMessage, { backgroundColor: colors.assistantMessage }],
                ]}
              >
                <Text style={[
                  styles.messageText,
                  message.role === 'user' 
                    ? styles.userMessageText
                    : [styles.assistantMessageText, { color: colors.text }],
                ]}>
                  {message.content}
                </Text>
              </View>
            ))}
          </ScrollView>

          <View style={[styles.inputContainer, { borderTopColor: colors.inputBorder }]}>
            <textarea
              value={newMessage}
              onChange={(e) => {
                const text = e.target.value
                if (text.length <= 500) {
                  setNewMessage(text)
                  setRemainingChars(500 - text.length)
                }
              }}
              onKeyDown={handleKeyPress}
              placeholder="Type your message here..."
              style={{
                width: '100%',
                minHeight: 80,
                maxHeight: 120,
                padding: 16,
                borderWidth: 1.5,
                borderRadius: 12,
                fontSize: 16,
                fontFamily: Platform.select({ web: 'Georgia, serif', default: 'serif' }),
                backgroundColor: colors.inputBackground,
                borderColor: colors.inputBorder,
                color: colors.text,
                resize: 'none',
                outline: 'none',
              } as React.CSSProperties}
              maxLength={500}
            />
            <View style={styles.inputFooter}>
              <Text style={[
                styles.charCount,
                { 
                  color: colors.charCount,
                  backgroundColor: colors.charCountBg,
                },
                remainingChars <= 20 ? styles.charCountWarning : null,
                remainingChars <= 10 ? styles.charCountDanger : null,
              ]}>
                {remainingChars}
              </Text>
              <Button
                title={loading ? "Sending..." : "Send"}
                onPress={handleSendMessage}
                disabled={loading || !newMessage.trim()}
                buttonStyle={[styles.sendButton, { backgroundColor: colors.userMessage }]}
                disabledStyle={styles.sendButtonDisabled}
              />
            </View>
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  card: {
    borderRadius: 16,
    padding: 40,
    maxWidth: 800,
    width: '100%',
    height: '100%',
    alignSelf: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
      },
      default: {
        shadowColor: '#000000',
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
      },
    }),
  },
  header: {
    marginBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  titleContainer: {
    flex: 3,
    alignItems: 'center',
  },
  themeToggleContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 36,
    fontFamily: Platform.select({ web: 'Palatino, serif', default: 'serif' }),
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 17,
    fontFamily: Platform.select({ web: 'Georgia, serif', default: 'serif' }),
    lineHeight: 24,
  },
  divider: {
    height: 1,
    width: '100%',
  },
  chatContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  messagesContainer: {
    flex: 1,
    marginBottom: 20,
  },
  messageWrapper: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
  },
  assistantMessage: {
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: Platform.select({ web: 'Georgia, serif', default: 'serif' }),
  },
  userMessageText: {
    color: 'white',
  },
  assistantMessageText: {
    color: '#4A3728',
  },
  inputContainer: {
    borderTopWidth: 1,
    paddingTop: 20,
  },
  inputFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  charCount: {
    fontSize: 14,
    fontFamily: Platform.select({ web: 'Georgia, serif', default: 'serif' }),
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  charCountWarning: {
    color: '#92400E',
    backgroundColor: '#FEF3C7',
  },
  charCountDanger: {
    color: '#B45309',
    backgroundColor: '#FEF2F2',
  },
  sendButton: {
    borderRadius: 12,
    paddingHorizontal: 24,
    height: 44,
  },
  sendButtonDisabled: {
    backgroundColor: '#D4C5B9',
  },
} as const); 