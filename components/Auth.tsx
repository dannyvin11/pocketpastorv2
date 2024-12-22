import React, { useState, useEffect, useCallback, memo } from 'react'
import { Alert, StyleSheet, View, Platform, Dimensions } from 'react-native'
import { supabase } from '../lib/supabase'
import { Button, Text } from '@rneui/themed'

const WebInput = memo(({ type, value, onChange, placeholder }: { 
  type: string, 
  value: string, 
  onChange: (text: string) => void, 
  placeholder: string 
}) => {
  console.log(`WebInput rendering - type: ${type}, value: ${value}`)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    console.log('WebInput onChange event:', newValue)
    
    // Only allow valid email characters for email type
    if (type === 'email') {
      // Remove any characters that aren't valid in an email address
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
})

WebInput.displayName = 'WebInput'

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

const AuthForm = memo(({ 
  email, 
  password, 
  loading, 
  isSignUp, 
  onEmailChange, 
  onPasswordChange, 
  onSignIn, 
  onSignUp,
  onToggleMode 
}: AuthFormProps) => {
  console.log('AuthForm rendering, Timestamp:', Date.now())
  return (
    <View style={styles.formWrapper}>
      <Text style={styles.mainTitle}>{isSignUp ? 'Create Account' : 'Welcome Back'}</Text>
      <Text style={styles.subtitle}>
        {isSignUp
          ? 'Sign up to start managing your account'
          : 'Sign in to access your account'}
      </Text>
      
      <View style={[styles.verticallySpaced, styles.mt20]}>
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
      <View style={styles.verticallySpaced}>
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
      <View style={[styles.verticallySpaced, styles.mt20]}>
        <Button
          title={isSignUp ? "Sign up" : "Sign in"}
          disabled={loading}
          onPress={isSignUp ? onSignUp : onSignIn}
          buttonStyle={styles.primaryButton}
          loading={loading}
        />
      </View>
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
  )
})

AuthForm.displayName = 'AuthForm'

export default function Auth() {
  console.log('Auth component rendering - START')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)

  useEffect(() => {
    console.log('Initial useEffect running')
    if (Platform.OS === 'web') {
      const rootDiv = document.querySelector('.css-view-175oi2r') as HTMLElement
      if (rootDiv) {
        rootDiv.style.width = '100%'
        console.log('Root div width set to 100%')
      } else {
        console.log('Root div not found')
      }
    }
  }, [])

  const handleEmailChange = useCallback((text: string) => {
    console.log('handleEmailChange called with:', text, 'Timestamp:', Date.now())
    setEmail(text)
  }, [])

  const handlePasswordChange = useCallback((text: string) => {
    console.log('handlePasswordChange called with:', text, 'Timestamp:', Date.now())
    setPassword(text)
  }, [])

  const showAlert = useCallback((message: string) => {
    console.log('Showing alert:', message)
    if (Platform.OS === 'web') {
      window.alert(message)
    } else {
      Alert.alert(message)
    }
  }, [])

  const handleSignIn = useCallback(async () => {
    console.log('Attempting sign in with email:', email)
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      })

      if (error) {
        console.error('Sign in error:', error)
        showAlert(error.message)
      } else {
        console.log('Sign in successful')
      }
    } catch (error) {
      console.error('Sign in exception:', error)
      if (error instanceof Error) {
        showAlert(error.message)
      }
    } finally {
      setLoading(false)
    }
  }, [email, password, showAlert])

  const handleSignUp = useCallback(async () => {
    console.log('Attempting sign up with email:', email)
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
        console.error('Sign up error:', error)
        showAlert(error.message)
      } else if (!session) {
        console.log('Sign up successful, verification email sent')
        showAlert('Please check your inbox for email verification!')
      } else {
        console.log('Sign up and session creation successful')
      }
    } catch (error) {
      console.error('Sign up exception:', error)
      if (error instanceof Error) {
        showAlert(error.message)
      }
    } finally {
      setLoading(false)
    }
  }, [email, password, showAlert])

  const toggleMode = useCallback(() => {
    console.log('Switching mode to:', !isSignUp, 'Timestamp:', Date.now())
    setIsSignUp(!isSignUp)
  }, [isSignUp])

  const isWeb = Platform.OS === 'web'
  const windowHeight = Dimensions.get('window').height

  console.log('Auth component rendering - before return, Timestamp:', Date.now())

  if (!isWeb) {
    console.log('Rendering mobile view')
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

  console.log('Rendering web view')
  return (
    <View style={[styles.pageContainer, { height: windowHeight }]}>
      <View style={styles.outerContainer}>
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
    </View>
  )
}

const styles = StyleSheet.create({
  pageContainer: {
    width: '100%',
    backgroundColor: '#f7fafc',
  },
  outerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  container: {
    flex: 1,
    backgroundColor: '#f7fafc',
    padding: 20,
  },
  formWrapper: {
    width: '100%',
    maxWidth: 400,
    padding: 40,
    backgroundColor: 'white',
    borderRadius: 12,
    ...Platform.select({
      web: {
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  mainTitle: {
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
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4a5568',
    marginBottom: 8,
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
  },
  mt20: {
    marginTop: 20,
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
  primaryButton: {
    backgroundColor: '#5469d4',
    borderRadius: 8,
    height: 48,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  switchText: {
    color: '#718096',
    fontSize: 16,
  },
  switchButton: {
    color: '#5469d4',
    fontWeight: '600',
    fontSize: 16,
  },
})