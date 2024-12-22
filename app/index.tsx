import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Redirect } from 'expo-router'

export default function Index() {
  const [loading, setLoading] = useState(true)
  const [hasSession, setHasSession] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setHasSession(!!session)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return null
  }

  return hasSession ? <Redirect href="/(app)" /> : <Redirect href="/auth" />
} 