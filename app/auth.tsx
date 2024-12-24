import React, { useState } from 'react'
import { View, StyleSheet, Platform } from 'react-native'
import { supabase } from '../lib/supabase'
import { Button, Text } from '@rneui/themed'
import { useRouter } from 'expo-router'

interface AuthFormProps {
  email: string
  password: string
  loading: boolean
  isSignUp: boolean
  error: string | null
  onEmailChange: (text: string) => void
  onPasswordChange: (text: string) => void
  onSignIn: () => void
  onSignUp: () => void
  onToggleMode: () => void
}

const WebInput = ({ type, value, onChange, placeholder, onEnterPress }: { 
  type: string
  value: string
  onChange: (text: string) => void
  placeholder: string
  onEnterPress: () => void
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      onEnterPress()
    }
  }

  return (
    <input
      type={type}
      value={value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      pattern={type === 'email' ? "[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$" : undefined}
      autoComplete={type === 'email' ? 'email' : type === 'password' ? 'current-password' : undefined}
      spellCheck={type === 'email' ? false : undefined}
      style={{
        flex: 1,
        height: '100%',
        paddingLeft: 12,
        paddingRight: 12,
        fontSize: 17,
        color: '#4A3728',
        border: 'none',
        outline: 'none',
        backgroundColor: 'transparent',
        width: '100%',
        fontFamily: 'Georgia, serif',
      }}
    />
  )
}

function AuthForm({ 
  email, 
  password, 
  loading, 
  isSignUp,
  error,
  onEmailChange, 
  onPasswordChange, 
  onSignIn, 
  onSignUp,
  onToggleMode 
}: AuthFormProps) {
  const handleSubmit = () => {
    if (loading) return
    if (isSignUp) {
      onSignUp()
    } else {
      onSignIn()
    }
  }

  // Determine which field has an error
  const hasEmailError = error?.toLowerCase().includes('email') || error?.toLowerCase().includes('account')
  const hasPasswordError = error?.toLowerCase().includes('password')

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
          <View style={[
            styles.inputContainer,
            hasEmailError && styles.inputError
          ]}>
            <i 
              className="fa fa-envelope" 
              style={{
                color: hasEmailError ? '#dc2626' : '#5469d4',
                marginRight: 12,
                fontSize: 16,
              }}
            />
            <WebInput
              type="email"
              value={email}
              onChange={onEmailChange}
              placeholder="email@address.com"
              onEnterPress={handleSubmit}
            />
          </View>
        </View>
        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Password</Text>
          <View style={[
            styles.inputContainer,
            hasPasswordError && styles.inputError
          ]}>
            <i 
              className="fa fa-lock" 
              style={{
                color: hasPasswordError ? '#dc2626' : '#5469d4',
                marginRight: 12,
                fontSize: 16,
              }}
            />
            <WebInput
              type="password"
              value={password}
              onChange={onPasswordChange}
              placeholder="Password"
              onEnterPress={handleSubmit}
            />
          </View>
          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title={isSignUp ? "Sign up" : "Sign in"}
            disabled={loading}
            onPress={handleSubmit}
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
  const [error, setError] = useState<string | null>(null)

  const handleSignIn = async () => {
    try {
      setError(null)
      
      // Validate email format
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
      if (!emailRegex.test(email)) {
        setError('Please enter a valid email address')
        return
      }

      // Validate password
      if (!password) {
        setError('Please enter your password')
        return
      }

      setLoading(true)

      // Attempt to sign in
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError('Incorrect email or password')
      } else {
        router.replace('/(app)')
      }
    } catch (error) {
      if (error instanceof Error) setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async () => {
    try {
      setError(null)

      // Validate email format
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
      if (!emailRegex.test(email)) {
        setError('Invalid email address format')
        return
      }

      // Validate password strength
      if (password.length < 6) {
        setError('Password must be at least 6 characters long')
        return
      }

      setLoading(true)
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })
      if (error) {
        if (error.message.includes('already registered')) {
          setError('This email is already registered')
        } else {
          setError(error.message)
        }
      } else {
        setError('Please check your inbox for email verification!')
      }
    } catch (error) {
      if (error instanceof Error) setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <AuthForm
        email={email}
        password={password}
        loading={loading}
        isSignUp={isSignUp}
        error={error}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onSignIn={handleSignIn}
        onSignUp={handleSignUp}
        onToggleMode={() => {
          setError(null)
          setIsSignUp(!isSignUp)
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBF7F4',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 40,
    ...Platform.select({
      web: {
        boxShadow: '0 8px 20px rgba(156, 123, 92, 0.15)',
      },
      default: {
        shadowColor: '#9C7B5C',
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
  title: {
    fontSize: 36,
    fontFamily: Platform.select({ web: 'Palatino, serif', default: 'serif' }),
    fontWeight: '600',
    color: '#4A3728',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    color: '#6B584A',
    marginBottom: 36,
    fontSize: 17,
    fontFamily: Platform.select({ web: 'Georgia, serif', default: 'serif' }),
    lineHeight: 24,
  },
  formContainer: {
    gap: 28,
  },
  inputWrapper: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A3728',
    marginBottom: 8,
    fontFamily: Platform.select({ web: 'Georgia, serif', default: 'serif' }),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#D4C5B9',
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    height: 52,
  },
  inputError: {
    borderColor: '#B45309',
    backgroundColor: '#FEF3C7',
  },
  buttonContainer: {
    gap: 16,
    marginTop: 12,
  },
  primaryButton: {
    backgroundColor: '#8B5E34',
    borderRadius: 12,
    height: 52,
    shadowColor: '#8B5E34',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  switchText: {
    color: '#6B584A',
    fontSize: 16,
    marginRight: 8,
    fontFamily: Platform.select({ web: 'Georgia, serif', default: 'serif' }),
  },
  switchButton: {
    color: '#8B5E34',
    fontWeight: '600',
    fontFamily: Platform.select({ web: 'Georgia, serif', default: 'serif' }),
  },
  errorText: {
    color: '#B45309',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    fontFamily: Platform.select({ web: 'Georgia, serif', default: 'serif' }),
  },
}) 