import { Stack } from 'expo-router'
import { useEffect, useState } from 'react'
import { Platform, Dimensions } from 'react-native'
import '../global.css'

export default function Layout() {
  const [isMobileWeb, setIsMobileWeb] = useState(false)

  useEffect(() => {
    if (Platform.OS === 'web') {
      // Set the web tab title
      document.title = 'Pocket Pastor'
      
      // Add favicon
      const link = document.createElement('link')
      link.rel = 'icon'
      link.type = 'image/png'
      link.href = '/logo.png'
      document.head.appendChild(link)
      
      // Add viewport meta tag for mobile responsiveness
      const viewport = document.createElement('meta')
      viewport.name = 'viewport'
      viewport.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no'
      document.head.appendChild(viewport)
      
      // Fix root div width
      const rootDiv = document.querySelector('.css-view-175oi2r') as HTMLElement
      if (rootDiv) {
        rootDiv.style.width = '100%'
      }

      // Check if mobile web
      const checkMobileWeb = () => {
        const width = Dimensions.get('window').width
        setIsMobileWeb(width < 768)
      }

      checkMobileWeb()
      window.addEventListener('resize', checkMobileWeb)
      return () => window.removeEventListener('resize', checkMobileWeb)
    }
  }, [])

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        title: 'Pocket Pastor',
      }}
    />
  )
} 