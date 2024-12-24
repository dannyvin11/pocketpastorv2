import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { StyleSheet, View, Alert, Platform, Pressable, ActivityIndicator, ScrollView } from 'react-native'
import { Input, Text } from '@rneui/themed'
import { Session } from '@supabase/supabase-js'
import { useRouter } from 'expo-router'

export default function Account() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState<string>('')
  const [website, setWebsite] = useState<string>('')
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

      if (error && status !== 406) {
        throw error
      }

      if (data) {
        setUsername(data.username || '')
        setWebsite(data.website || '')
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
        avatar_url: '',
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

  const isMobileWeb = Platform.OS === 'web' && Platform.select({ web: !window.matchMedia('(min-width: 768px)').matches });
  const Container = isMobileWeb ? ScrollView : View;

  return (
    <Container style={styles.container} contentContainerStyle={isMobileWeb ? { flexGrow: 1 } : undefined}>
      <View style={[styles.card, Platform.OS === 'web' && styles.webCard]}>
        <Text style={styles.title}>Your Profile</Text>
        <Text style={styles.subtitle}>Update your personal information</Text>
        
        <View style={styles.formContainer}>
          {loading ? (
            <ActivityIndicator />
          ) : (
            <>
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
                  onChangeText={setUsername}
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
                  onChangeText={setWebsite}
                  autoComplete="url"
                  inputStyle={styles.input}
                  inputContainerStyle={styles.inputContainer}
                />
              </View>
            </>
          )}

          <View style={styles.buttonContainer}>
            <Pressable
              onPress={() => updateProfile({ username, website, avatar_url: '' })}
              disabled={loading}
              style={({ pressed }) => [
                styles.primaryButton,
                loading && styles.buttonDisabled,
                pressed && { opacity: 0.7 }
              ]}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Loading ...' : 'Update Profile'}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => router.push('/(app)/chat')}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && { opacity: 0.7 }
              ]}
            >
              <Text style={styles.buttonText}>Go to Chat</Text>
            </Pressable>

            <Pressable
              onPress={() => supabase.auth.signOut()}
              style={({ pressed }) => [
                styles.outlineButton,
                pressed && { opacity: 0.7 }
              ]}
            >
              <Text style={styles.outlineButtonText}>Sign Out</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBF7F4',
    padding: Platform.select({ web: 20, default: 16 }),
    minHeight: '100%',
    ...Platform.select({
      web: {
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
      }
    }),
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: Platform.select({ web: 40, default: 24 }),
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
    ...Platform.select({
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
  webCard: {
    boxShadow: '0 8px 20px rgba(156, 123, 92, 0.15)',
    marginVertical: 20,
    marginHorizontal: 'auto',
  },
  title: {
    fontSize: Platform.select({ web: 36, default: 28 }),
    fontFamily: Platform.select({ web: 'Palatino, serif', default: 'serif' }),
    fontWeight: '600',
    color: '#4A3728',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    color: '#6B584A',
    marginBottom: Platform.select({ web: 36, default: 24 }),
    fontSize: Platform.select({ web: 17, default: 15 }),
    fontFamily: Platform.select({ web: 'Georgia, serif', default: 'serif' }),
    lineHeight: 24,
  },
  formContainer: {
    gap: Platform.select({ web: 20, default: 16 }),
  },
  inputWrapper: {
    marginBottom: Platform.select({ web: 20, default: 16 }),
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
    fontSize: Platform.select({ web: 17, default: 16 }),
    fontFamily: Platform.select({ web: 'Georgia, serif', default: 'serif' }),
    paddingHorizontal: 16,
  },
  inputContainer: {
    borderWidth: 1.5,
    borderColor: '#D4C5B9',
    borderRadius: 12,
    paddingHorizontal: 0,
    height: Platform.select({ web: 52, default: 48 }),
    backgroundColor: 'white',
  },
  buttonContainer: {
    gap: Platform.select({ web: 16, default: 12 }),
    marginTop: Platform.select({ web: 12, default: 8 }),
  },
  primaryButton: {
    backgroundColor: '#8B5E34',
    borderRadius: 12,
    height: Platform.select({ web: 52, default: 48 }),
    marginBottom: Platform.select({ web: 12, default: 8 }),
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 2px 4px rgba(139, 94, 52, 0.2)',
      },
      default: {
        shadowColor: '#8B5E34',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
      },
    }),
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#8B5E34',
    borderRadius: 12,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineButtonText: {
    color: '#8B5E34',
    fontFamily: Platform.select({ web: 'Georgia, serif', default: 'serif' }),
    fontWeight: '600',
    fontSize: Platform.select({ web: 18, default: 16 }),
  },
  buttonText: {
    color: 'white',
    fontSize: Platform.select({ web: 18, default: 16 }),
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: Platform.select({ web: 'Georgia, serif', default: 'serif' }),
  },
  buttonDisabled: {
    opacity: 0.5,
  },
})