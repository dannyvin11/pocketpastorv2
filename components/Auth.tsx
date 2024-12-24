import { useState } from 'react'
import { Alert, StyleSheet, View, Platform, GestureResponderEvent } from 'react-native'
import { supabase } from '../lib/supabase'
import { Button, Input, Text } from '@rneui/themed'
import { useRouter } from 'expo-router'

export default function Auth() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  async function signInWithEmail() {
    setLoading(true)
    setErrorMessage('')
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setErrorMessage('Incorrect email or password')
        } else if (error.message.includes('Email not confirmed')) {
          setErrorMessage('Please verify your email address')
        } else {
          setErrorMessage(error.message)
        }
      } else {
        router.replace('/(app)/chat')
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  async function signUpWithEmail() {
    setLoading(true)
    setErrorMessage('')
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        if (error.message.includes('already registered')) {
          setErrorMessage('This email is already registered')
        } else if (error.message.includes('weak password')) {
          setErrorMessage('Password must be at least 6 characters long')
        } else {
          setErrorMessage(error.message)
        }
      } else {
        Alert.alert('Success!', 'Please check your email for verification link')
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (event: GestureResponderEvent | React.FormEvent) => {
    if ('preventDefault' in event) {
      event.preventDefault()
    }
    if (isSignUp) {
      signUpWithEmail()
    } else {
      signInWithEmail()
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Welcome</Text>
        <Text style={styles.subtitle}>
          {isSignUp ? 'Create an account to get started' : 'Sign in to continue your journey'}
        </Text>

        <form onSubmit={handleSubmit} style={styles.form as any}>
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Email</Text>
            <Input
              placeholder="email@address.com"
              value={email}
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
              keyboardType="email-address"
              onChangeText={(text) => {
                setEmail(text)
                setErrorMessage('')
              }}
              inputStyle={styles.input}
              inputContainerStyle={styles.inputContainer}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Password</Text>
            <Input
              placeholder="Password"
              value={password}
              autoCapitalize="none"
              autoComplete="password"
              autoCorrect={false}
              secureTextEntry={true}
              onChangeText={(text) => {
                setPassword(text)
                setErrorMessage('')
              }}
              inputStyle={styles.input}
              inputContainerStyle={styles.inputContainer}
            />
          </View>

          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}

          <View style={styles.buttonContainer}>
            <Button
              title={loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
              disabled={loading}
              onPress={handleSubmit}
              buttonStyle={styles.primaryButton}
            />

            <Button
              title={`Switch to ${isSignUp ? 'Sign In' : 'Sign Up'}`}
              onPress={() => {
                setIsSignUp(!isSignUp)
                setErrorMessage('')
              }}
              type="outline"
              buttonStyle={styles.outlineButton}
              titleStyle={styles.outlineButtonText}
            />
          </View>

          <input type="submit" style={{ display: 'none' }} />
        </form>
      </View>
    </View>
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
    paddingHorizontal: 16,
  },
  inputContainer: {
    borderWidth: 1.5,
    borderColor: '#D4C5B9',
    borderRadius: 12,
    paddingHorizontal: 0,
    height: 52,
    backgroundColor: 'white',
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