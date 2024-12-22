import React, { useState, useCallback } from 'react'
import { Alert, View, Platform, StyleSheet } from 'react-native'
import { supabase } from '../lib/supabase'
import { Button, Text } from '@rneui/themed'
import { useRouter } from 'expo-router'

const WebInput = ({ type, value, onChange, placeholder }: { 
  type: string, 
  value: string, 
  onChange: (text: string) => void, 
  placeholder: string 
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    if (type === 'email') {
      const emailValue = newValue.replace(/[^a-zA-Z0-9@._-]/g, '')
      onChange(emailValue)
    } else {
      onChange(newValue)
    }
  }

  return (
    <input
      type={type}
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      pattern={type === 'email' ? "[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$" : undefined}
      autoComplete={type === 'email' ? 'email' : type === 'password' ? 'current-password' : undefined}
      spellCheck={type === 'email' ? false : undefined}
      style={{
        flex: 1,
        height: 44,
        paddingLeft: 12,
        paddingRight: 12,
        fontSize: 16,
        color: '#1a202c',
        border: 'none',
        outline: 'none',
        backgroundColor: 'transparent',
        width: '100%'
      }}
    />
  )
}

interface AuthFormProps {
  email: string;
  password: string;
  loading: boolean;
  isSignUp: boolean;
  onEmailChange: (text: string) => void;
  onPasswordChange: (text: string) => void;
  onSignIn: () => void;
  onSignUp: () => void;
  onToggleMode: () => void;
}

function AuthForm({ 
  email, 
  password, 
  loading, 
  isSignUp, 
  onEmailChange, 
  onPasswordChange, 
  onSignIn, 
  onSignUp,
  onToggleMode 
}: AuthFormProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>
        {isSignUp ? 'Create Account' : 'Welcome Back'}
      </Text>
      <Text style={styles.subtitle}>
        {isSignUp
          ? 'Sign up to start managing your account'
          : 'Sign in to access your account'}
      </Text>
      
      <View style={styles.formContainer}>
        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputContainer}>
            <i className="fa fa-envelope" style={styles.icon} />
            <WebInput
              type="email"
              value={email}
              onChange={onEmailChange}
              placeholder="email@address.com"
            />
          </View>
        </View>
        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputContainer}>
            <i className="fa fa-lock" style={styles.icon} />
            <WebInput
              type="password"
              value={password}
              onChange={onPasswordChange}
              placeholder="Password"
            />
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title={isSignUp ? "Sign up" : "Sign in"}
            disabled={loading}
            onPress={isSignUp ? onSignUp : onSignIn}
            buttonStyle={styles.primaryButton}
            loading={loading}
          />

          <View style={styles.switchContainer}>
            <Text style={styles.switchText}>
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            </Text>
            <Button
              title={isSignUp ? "Sign in" : "Sign up"}
              type="clear"
              onPress={onToggleMode}
              titleStyle={styles.switchButton}
            />
          </View>
        </View>
      </View>
    </View>
  )
}

export default function Auth() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)

  const handleEmailChange = useCallback((text: string) => {
    setEmail(text)
  }, [])

  const handlePasswordChange = useCallback((text: string) => {
    setPassword(text)
  }, [])

  const showAlert = useCallback((message: string) => {
    if (Platform.OS === 'web') {
      window.alert(message)
    } else {
      Alert.alert(message)
    }
  }, [])

  const handleSignIn = useCallback(async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      })

      if (error) {
        showAlert(error.message)
      } else {
        router.replace('/(app)')
      }
    } catch (error) {
      if (error instanceof Error) {
        showAlert(error.message)
      }
    } finally {
      setLoading(false)
    }
  }, [email, password, showAlert, router])

  const handleSignUp = useCallback(async () => {
    try {
      setLoading(true)
      const {
        data: { session },
        error,
      } = await supabase.auth.signUp({
        email: email,
        password: password,
      })

      if (error) {
        showAlert(error.message)
      } else if (!session) {
        showAlert('Please check your inbox for email verification!')
      } else {
        router.replace('/(app)')
      }
    } catch (error) {
      if (error instanceof Error) {
        showAlert(error.message)
      }
    } finally {
      setLoading(false)
    }
  }, [email, password, showAlert, router])

  const toggleMode = useCallback(() => {
    setIsSignUp(!isSignUp)
  }, [isSignUp])

  return (
    <View style={styles.container}>
      <AuthForm
        email={email}
        password={password}
        loading={loading}
        isSignUp={isSignUp}
        onEmailChange={handleEmailChange}
        onPasswordChange={handlePasswordChange}
        onSignIn={handleSignIn}
        onSignUp={handleSignUp}
        onToggleMode={toggleMode}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7fafc',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 40,
    ...Platform.select({
      web: {
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      },
    }),
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    color: '#718096',
    marginBottom: 32,
    fontSize: 16,
  },
  formContainer: {
    gap: 24,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4a5568',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: 'white',
  },
  icon: {
    color: '#5469d4',
    marginRight: 12,
    fontSize: 16,
  },
  buttonContainer: {
    gap: 12,
    marginTop: 8,
  },
  primaryButton: {
    backgroundColor: '#5469d4',
    borderRadius: 8,
    height: 48,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  switchText: {
    color: '#718096',
    fontSize: 16,
    marginRight: 8,
  },
  switchButton: {
    color: '#5469d4',
    fontWeight: '600',
  },
}) 