import { View, Platform, StyleSheet, Image, Pressable, Dimensions } from 'react-native'
import { Slot, Stack, useRouter, useSegments } from 'expo-router'
import { Icon, Text } from '@rneui/themed'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import AsyncStorage from '@react-native-async-storage/async-storage'

// Add theme colors
const getThemeColors = (isDarkMode: boolean) => ({
  background: isDarkMode ? '#2D2D2D' : '#FFFFFF',
  border: isDarkMode ? '#4D4D4D' : '#D4C5B9',
  text: isDarkMode ? '#FFFFFF' : '#4A3728',
  subtext: isDarkMode ? '#B0B0B0' : '#6B584A',
  hover: isDarkMode ? '#3D3D3D' : '#F5EDE6',
  headerBg: isDarkMode ? '#2D2D2D' : '#FBF7F4',
})

const MenuItem = ({ icon, label, onPress, isDarkMode }: { 
  icon: string
  label: string
  onPress: () => void
  isDarkMode: boolean 
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const colors = getThemeColors(isDarkMode)
  
  return (
    <Pressable
      onPress={onPress}
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
      style={[
        styles.sidebarItem,
        styles.sidebarButton,
        isHovered && { backgroundColor: colors.hover }
      ]}
    >
      <Icon
        name={icon}
        type="ionicon"
        size={20}
        color={colors.subtext}
        containerStyle={Platform.OS === 'web' ? { boxShadow: 'none' } : undefined}
      />
      <Text style={[styles.sidebarText, { color: colors.text }]}>{label}</Text>
    </Pressable>
  )
}

const WebLayout = () => {
  const router = useRouter()
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [isMobileWeb, setIsMobileWeb] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    // Load theme preference
    const loadThemePreference = async () => {
      try {
        if (Platform.OS === 'web') {
          const savedTheme = localStorage.getItem('themePreference')
          setIsDarkMode(savedTheme === 'dark')
        } else {
          const savedTheme = await AsyncStorage.getItem('themePreference')
          setIsDarkMode(savedTheme === 'dark')
        }
      } catch (error) {
        console.error('Error loading theme preference:', error)
      }
    }

    loadThemePreference()
    
    // Rest of your existing useEffect code...
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.email) {
        setUserEmail(session.user.email)
      }
    })

    const checkMobileWeb = () => {
      const width = Dimensions.get('window').width
      setIsMobileWeb(width < 768)
      if (width >= 768) {
        setIsSidebarOpen(false)
      }
    }

    checkMobileWeb()
    if (Platform.OS === 'web') {
      window.addEventListener('resize', checkMobileWeb)
      return () => window.removeEventListener('resize', checkMobileWeb)
    }
  }, [])

  const colors = getThemeColors(isDarkMode)
  
  const SidebarContent = () => (
    <View style={[styles.sidebarContent, { backgroundColor: colors.background }]}>
      <View style={styles.sidebarTop}>
        <View style={[styles.brandContainer, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
          <Image 
            source={require('../../assets/logo.png')}
            style={styles.logo}
          />
          <Text style={[styles.brandText, { color: colors.text }]}>PocketPastor</Text>
        </View>
        <View style={styles.menuContainer}>
          <MenuItem
            icon="person-outline"
            label="Account"
            onPress={() => {
              router.push('/(app)/account')
              if (isMobileWeb) setIsSidebarOpen(false)
            }}
            isDarkMode={isDarkMode}
          />
          <MenuItem
            icon="chatbubble-outline"
            label="Chat"
            onPress={() => {
              router.push('/(app)/chat')
              if (isMobileWeb) setIsSidebarOpen(false)
            }}
            isDarkMode={isDarkMode}
          />
        </View>
      </View>
      {userEmail && (
        <View style={[styles.sidebarBottom, { borderTopColor: colors.border }]}>
          <View style={[styles.userContainer, { backgroundColor: colors.hover }]}>
            <Icon
              name="person-circle-outline"
              type="ionicon"
              size={20}
              color={colors.subtext}
              containerStyle={Platform.OS === 'web' ? { boxShadow: 'none' } : undefined}
            />
            <Text style={[styles.userEmail, { color: colors.text }]} numberOfLines={1} ellipsizeMode="middle">
              {userEmail}
            </Text>
          </View>
        </View>
      )}
    </View>
  )

  return (
    <View style={styles.webContainer}>
      {isMobileWeb && (
        <View style={[styles.mobileHeader, { backgroundColor: colors.headerBg }]}>
          <Pressable
            onPress={() => setIsSidebarOpen(!isSidebarOpen)}
            style={styles.menuButton}
          >
            <Icon
              name={isSidebarOpen ? 'close-outline' : 'menu-outline'}
              type="ionicon"
              size={24}
              color={colors.text}
              containerStyle={Platform.OS === 'web' ? { boxShadow: 'none' } : undefined}
            />
          </Pressable>
          <Image 
            source={require('../../assets/logo.png')}
            style={styles.mobileLogo}
          />
        </View>
      )}
      {(!isMobileWeb || isSidebarOpen) && (
        <View style={[
          styles.webSidebar,
          { backgroundColor: colors.background, borderRightColor: colors.border },
          isMobileWeb && styles.mobileSidebar,
          isSidebarOpen && styles.mobileSidebarOpen
        ]}>
          <SidebarContent />
        </View>
      )}
      <View style={[
        styles.webContent,
        isMobileWeb && styles.mobileContent
      ]}>
        <Slot />
      </View>
    </View>
  )
}

const MobileLayout = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        title: 'Pocket Pastor',
      }}
    >
      <Stack.Screen 
        name="index"
        options={{
          title: 'Pocket Pastor'
        }}
      />
      <Stack.Screen 
        name="chat"
        options={{
          title: 'Pocket Pastor'
        }}
      />
      <Stack.Screen 
        name="account" 
        options={{
          animation: 'slide_from_left',
          title: 'Pocket Pastor'
        }}
      />
    </Stack>
  )
}

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

  if (Platform.OS === 'web') {
    return <WebLayout />
  }
  return <MobileLayout />
}

const styles = StyleSheet.create({
  webContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  webSidebar: {
    width: 240,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: '#D4C5B9',
  },
  sidebarContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  sidebarTop: {
    gap: 32,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 20,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#D4C5B9',
    backgroundColor: '#FBF7F4',
  },
  logo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  brandText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#4A3728',
    fontFamily: 'Palatino, serif',
    letterSpacing: -0.3,
  },
  menuContainer: {
    gap: 4,
    paddingHorizontal: 12,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
  },
  sidebarButton: {
    borderRadius: 8,
    cursor: 'pointer',
  },
  sidebarText: {
    color: '#6B584A',
    fontSize: 15,
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fontWeight: '500',
  },
  sidebarBottom: {
    padding: 16,
    borderTopWidth: 1,
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    borderRadius: 8,
  },
  userEmail: {
    fontSize: 13,
    fontFamily: 'system-ui, -apple-system, sans-serif',
    flex: 1,
  },
  webContent: {
    flex: 1,
  },
  mobileHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#D4C5B9',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 100,
    ...(Platform.OS === 'web' && {
      style: {
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
      }
    })
  },
  menuButton: {
    padding: 8,
    marginRight: 8,
    borderRadius: 8,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      ':hover': {
        backgroundColor: '#F5EDE6'
      }
    })
  },
  mobileLogo: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },
  mobileSidebar: {
    position: 'absolute',
    top: 60,
    bottom: 0,
    left: 0,
    width: '80%',
    maxWidth: 320,
    zIndex: 99,
    transform: [{ translateX: -320 }],
    backgroundColor: '#FFFFFF',
    ...(Platform.OS === 'web' && {
      style: {
        boxShadow: '2px 0 8px rgba(0, 0, 0, 0.1)'
      }
    })
  },
  mobileSidebarOpen: {
    transform: [{ translateX: 0 }],
  },
  mobileContent: {
    marginTop: 60,
  },
}); 