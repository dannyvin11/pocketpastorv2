import { View } from 'react-native'
import Account from '../../components/Account'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Session } from '@supabase/supabase-js'
import { useRouter, useSegments } from 'expo-router'

export default function Index() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const segments = useSegments()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!loading && !session && segments[0] === '(app)') {
      router.replace('/auth')
    }
  }, [session, loading, segments])

  if (loading || !session) {
    return null
  }

  return (
    <View style={{ flex: 1 }}>
      <Account />
    </View>
  )
} 