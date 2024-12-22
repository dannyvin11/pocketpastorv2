import { Stack } from 'expo-router'
import { useEffect } from 'react'
import { Platform } from 'react-native'
import '../global.css'

export default function Layout() {
  useEffect(() => {
    if (Platform.OS === 'web') {
      const rootDiv = document.querySelector('.css-view-175oi2r') as HTMLElement
      if (rootDiv) {
        rootDiv.style.width = '100%'
      }
    }
  }, [])

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  )
} 