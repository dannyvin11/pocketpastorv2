import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { StyleSheet, View, Alert, Platform } from 'react-native'
import { Button, Input, Text } from '@rneui/themed'
import { Session } from '@supabase/supabase-js'
import { useRouter } from 'expo-router'

export default function Account() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState('')
  const [website, setWebsite] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    getProfile()
  }, [])

  async function getProfile() {
    try {
      setLoading(true)
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      if (!currentSession) throw new Error('No session')
      
      setSession(currentSession)

      const { data, error, status } = await supabase
        .from('profiles')
        .select(`username, website, avatar_url`)
        .eq('id', currentSession.user.id)
        .single()

      if (data) {
        setUsername(data.username)
        setWebsite(data.website)
        setAvatarUrl(data.avatar_url)
      }
      if (error && status !== 406) {
        throw error
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  async function updateProfile({
    username,
    website,
    avatar_url,
  }: {
    username: string
    website: string
    avatar_url: string
  }) {
    try {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('No session')

      const updates = {
        id: session.user.id,
        username,
        website,
        avatar_url,
        updated_at: new Date(),
      }

      const { error } = await supabase.from('profiles').upsert(updates)

      if (error) {
        throw error
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Your Profile</Text>
        <Text style={styles.subtitle}>Update your personal information</Text>
        
        <View style={styles.formContainer}>
          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Email</Text>
            <Input
              placeholder="email@address.com"
              value={session?.user?.email}
              autoComplete="email"
              disabled
              inputStyle={styles.input}
              inputContainerStyle={styles.inputContainer}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Username</Text>
            <Input
              placeholder="Username"
              value={username || ''}
              onChangeText={(text) => setUsername(text)}
              autoComplete="username"
              inputStyle={styles.input}
              inputContainerStyle={styles.inputContainer}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.label}>Website</Text>
            <Input
              placeholder="https://example.com"
              value={website || ''}
              onChangeText={(text) => setWebsite(text)}
              autoComplete="url"
              inputStyle={styles.input}
              inputContainerStyle={styles.inputContainer}
            />
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title={loading ? 'Loading ...' : 'Update Profile'}
              onPress={() => updateProfile({ username, website, avatar_url: avatarUrl })}
              disabled={loading}
              buttonStyle={styles.primaryButton}
            />

            <Button
              title="Go to Chat"
              onPress={() => router.push('/(app)/chat')}
              buttonStyle={styles.primaryButton}
            />

            <Button
              title="Sign Out"
              onPress={() => supabase.auth.signOut()}
              type="outline"
              buttonStyle={styles.outlineButton}
              titleStyle={styles.outlineButtonText}
            />
          </View>
        </View>
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
  formContainer: {
    gap: 20,
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