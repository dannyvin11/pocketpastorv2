import { Stack } from 'expo-router'
import { useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter, useSegments } from 'expo-router'

export default function AppLayout() {
  const router = useRouter()
  const segments = useSegments()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace('/auth')
      }
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace('/auth')
      }
    })
  }, [router])

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  )
} 