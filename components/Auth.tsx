import { useState, useEffect } from 'react'
import { Alert, StyleSheet, View, Platform, KeyboardAvoidingView } from 'react-native'
import { supabase } from '../lib/supabase'
import { Button, Input, Text } from '@rneui/themed'
import { useRouter } from 'expo-router'

const FormContainer = ({ children, onSubmit }: { children: React.ReactNode; onSubmit: () => void }) => {
  console.log('FormContainer rendering for platform:', Platform.OS)
  
  if (Platform.OS === 'web') {
    console.log('Rendering web form')
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit()
        }}
        style={{ width: '100%' }}
      >
        {children}
      </form>
    )
  }
  
  console.log('Rendering native view container')
  return (
    <View style={{ width: '100%' }}>
      {children}
    </View>
  )
}

export default function Auth() {
  console.log('Auth component rendering')
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    console.log('Platform:', Platform.OS)
    console.log('Platform constants:', Platform.constants)
  }, [])

  async function signInWithEmail() {
    console.log('Attempting sign in with email')
    setLoading(true)
    setErrorMessage('')
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.log('Sign in error:', error.message)
        if (error.message.includes('Invalid login credentials')) {
          setErrorMessage('Incorrect email or password')
        } else if (error.message.includes('Email not confirmed')) {
          setErrorMessage('Please verify your email address')
        } else {
          setErrorMessage(error.message)
        }
      } else {
        console.log('Sign in successful, navigating to chat')
        router.replace('/(app)/chat')
      }
    } catch (error) {
      console.error('Sign in exception:', error)
      if (error instanceof Error) {
        Alert.alert(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  async function signUpWithEmail() {
    console.log('Attempting sign up with email')
    setLoading(true)
    setErrorMessage('')
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        console.log('Sign up error:', error.message)
        if (error.message.includes('already registered')) {
          setErrorMessage('This email is already registered')
        } else if (error.message.includes('weak password')) {
          setErrorMessage('Password must be at least 6 characters long')
        } else {
          setErrorMessage(error.message)
        }
      } else {
        console.log('Sign up successful, showing verification message')
        Alert.alert('Success!', 'Email Verification is currently disabled, please sign in with the email and password you provided')
      }
    } catch (error) {
      console.error('Sign up exception:', error)
      if (error instanceof Error) {
        Alert.alert(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = () => {
    console.log('Handle submit called')
    if (isSignUp) {
      signUpWithEmail()
    } else {
      signInWithEmail()
    }
  }

  const renderInputs = () => {
    console.log('Rendering input fields')
    return (
      <>
        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Email</Text>
          <Input
            testID="email-input"
            placeholder="email@address.com"
            value={email}
            autoCapitalize="none"
            autoComplete={Platform.select({ web: 'email', default: 'off' })}
            autoCorrect={false}
            keyboardType="email-address"
            onChangeText={(text) => {
              console.log('Email changed:', text.length > 0)
              setEmail(text)
              setErrorMessage('')
            }}
            inputStyle={styles.input}
            inputContainerStyle={styles.inputContainer}
            returnKeyType="next"
            containerStyle={{ paddingHorizontal: 0 }}
            textContentType="emailAddress"
            inputAccessoryViewID={Platform.OS === 'ios' ? 'none' : undefined}
            inputMode="email"
            leftIcon={undefined}
          />
        </View>

        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Password</Text>
          <Input
            testID="password-input"
            placeholder="Password"
            value={password}
            autoCapitalize="none"
            autoComplete={Platform.select({ web: 'current-password', default: 'off' })}
            autoCorrect={false}
            secureTextEntry={true}
            onChangeText={(text) => {
              console.log('Password changed:', text.length > 0)
              setPassword(text)
              setErrorMessage('')
            }}
            inputStyle={styles.input}
            inputContainerStyle={styles.inputContainer}
            returnKeyType="go"
            onSubmitEditing={() => {
              console.log('Submit editing triggered')
              handleSubmit()
            }}
            containerStyle={{ paddingHorizontal: 0 }}
            textContentType="password"
            inputAccessoryViewID={Platform.OS === 'ios' ? 'none' : undefined}
            leftIcon={undefined}
          />
        </View>
      </>
    )
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Welcome</Text>
        <Text style={styles.subtitle}>
          {isSignUp ? 'Create an account to get started' : 'Sign in to continue your journey'}
        </Text>

        <FormContainer onSubmit={handleSubmit}>
          {renderInputs()}

          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}

          <View style={styles.buttonContainer}>
            <Button
              testID="submit-button"
              title={loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
              disabled={loading}
              onPress={() => {
                console.log('Submit button pressed')
                handleSubmit()
              }}
              buttonStyle={styles.primaryButton}
            />

            <Button
              testID="toggle-mode-button"
              title={`Switch to ${isSignUp ? 'Sign In' : 'Sign Up'}`}
              onPress={() => {
                console.log('Toggling sign up mode:', !isSignUp)
                setIsSignUp(!isSignUp)
                setErrorMessage('')
              }}
              type="outline"
              buttonStyle={styles.outlineButton}
              titleStyle={styles.outlineButtonText}
            />
          </View>
        </FormContainer>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBF7F4',
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 40,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
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
  form: {
    width: '100%',
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
  input: {
    color: '#4A3728',
    fontSize: 17,
    fontFamily: Platform.select({ web: 'Georgia, serif', default: 'serif' }),
    paddingHorizontal: 0,
    paddingLeft: 0,
    paddingRight: 0,
    marginLeft: 0,
    marginRight: 0,
    minHeight: 0,
  },
  inputContainer: {
    borderWidth: 1.5,
    borderColor: '#D4C5B9',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 52,
    backgroundColor: 'white',
    paddingLeft: 12,
    paddingRight: 12,
    marginLeft: 0,
    marginRight: 0,
    borderBottomWidth: 1.5,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 14,
    marginTop: -12,
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: Platform.select({ web: 'Georgia, serif', default: 'serif' }),
  },
  buttonContainer: {
    gap: 16,
    marginTop: 12,
  },
  primaryButton: {
    backgroundColor: '#8B5E34',
    borderRadius: 12,
    height: 52,
    marginBottom: 12,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#8B5E34',
    borderRadius: 12,
    height: 52,
  },
  outlineButtonText: {
    color: '#8B5E34',
    fontFamily: Platform.select({ web: 'Georgia, serif', default: 'serif' }),
    fontWeight: '600',
  },
})