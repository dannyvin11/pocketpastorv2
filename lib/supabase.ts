import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://soiarviiyysgaomrnvlv.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvaWFydmlpeXlzZ2FvbXJudmx2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM4ODQ0NzAsImV4cCI6MjA0OTQ2MDQ3MH0.IlRX43nSRwvYlJMX7g5hy7Mi48PH7eN_TQpdci6LN-E'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})