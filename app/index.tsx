import { View, StyleSheet, Platform, Pressable, ScrollView, Text as RNText, Image, useWindowDimensions } from 'react-native';
import { Text } from '@rneui/themed';
import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'expo-router';

// Verses focused on guidance and wisdom
const VERSES = [
  { text: "Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.", reference: "Proverbs 3:5-6" },
  { text: "Your word is a lamp for my feet, a light on my path.", reference: "Psalm 119:105" },
  { text: "If any of you lacks wisdom, you should ask God, who gives generously to all without finding fault, and it will be given to you.", reference: "James 1:5" },
  { text: "I will instruct you and teach you in the way you should go; I will counsel you with my loving eye on you.", reference: "Psalm 32:8" },
  { text: "For the Lord gives wisdom; from his mouth come knowledge and understanding.", reference: "Proverbs 2:6" },
  { text: "Show me your ways, Lord, teach me your paths. Guide me in your truth and teach me, for you are God my Savior.", reference: "Psalm 25:4-5" },
  { text: "All Scripture is God-breathed and is useful for teaching, rebuking, correcting and training in righteousness.", reference: "2 Timothy 3:16" },
  { text: "The unfolding of your words gives light; it gives understanding to the simple.", reference: "Psalm 119:130" },
  { text: "In their hearts humans plan their course, but the Lord establishes their steps.", reference: "Proverbs 16:9" },
  { text: "The Lord will guide you always.", reference: "Isaiah 58:11" },
  { text: "The Lord makes firm the steps of the one who delights in him; though he may stumble, he will not fall, for the Lord upholds him with his hand.", reference: "Psalm 37:23-24" },
  { text: "Plans fail for lack of counsel, but with many advisers they succeed.", reference: "Proverbs 15:22" }
];

interface Scripture {
  text: string;
  reference: string;
}

export default function Index() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobileWeb = Platform.OS === 'web' && width < 768;

  const [scripture, setScripture] = useState<Scripture>(() => {
    // Initialize with a random verse
    const randomIndex = Math.floor(Math.random() * VERSES.length);
    return VERSES[randomIndex];
  });

  useEffect(() => {
    // Function to get a random verse
    const getRandomVerse = () => {
      let newIndex;
      do {
        newIndex = Math.floor(Math.random() * VERSES.length);
      } while (scripture === VERSES[newIndex]); // Ensure we get a different verse
      return VERSES[newIndex];
    };

    // Set initial random verse
    setScripture(getRandomVerse());

    // Only add web-specific event listeners
    if (Platform.OS === 'web') {
      const handleRefresh = () => {
        setScripture(getRandomVerse());
      };

      // Add event listeners for web
      if (typeof window !== 'undefined') {
        window.addEventListener('pageshow', handleRefresh);
        window.addEventListener('focus', handleRefresh);

        return () => {
          window.removeEventListener('pageshow', handleRefresh);
          window.removeEventListener('focus', handleRefresh);
        };
      }
    }

    // Only redirect on native mobile platforms
    if (Platform.OS !== 'web') {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          router.replace('/(app)');
        } else {
          router.replace('/auth');
        }
      });
    }
  }, []);

  if (Platform.OS !== 'web') {
    return null;
  }

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={[
        styles.scrollContent,
        isMobileWeb && styles.mobileScrollContent
      ]}
    >
      <View style={[styles.content, isMobileWeb && styles.mobileContent]}>
        <View style={[styles.header, isMobileWeb && styles.mobileHeader]}>
          <Image
            source={require('../assets/logo.png')}
            style={[styles.logo, isMobileWeb && styles.mobileLogo]}
            resizeMode="contain"
          />
          <Text style={[styles.title, isMobileWeb && styles.mobileTitle]}>Pocket Pastor</Text>
          <Text style={[styles.subtitle, isMobileWeb && styles.mobileSubtitle]}>
            Your companion for spiritual guidance and biblical wisdom
          </Text>
          <Text style={[styles.verse, isMobileWeb && styles.mobileVerse]}>
            "{scripture.text}" - {scripture.reference}
          </Text>
        </View>

        <View style={[styles.features, isMobileWeb && styles.mobileFeatures]}>
          <View style={[styles.featureItem, isMobileWeb && styles.mobileFeatureItem]}>
            <Text style={[styles.featureTitle, isMobileWeb && styles.mobileFeatureTitle]}>
              🤝 Personal Guidance
            </Text>
            <Text style={[styles.featureText, isMobileWeb && styles.mobileFeatureText]}>
              Receive compassionate, scripture-based counsel tailored to your unique journey of faith
            </Text>
          </View>
          <View style={[styles.featureItem, isMobileWeb && styles.mobileFeatureItem]}>
            <Text style={[styles.featureTitle, isMobileWeb && styles.mobileFeatureTitle]}>
              📖 Scripture-Based
            </Text>
            <Text style={[styles.featureText, isMobileWeb && styles.mobileFeatureText]}>
              Find wisdom and direction through carefully selected Bible verses and teachings
            </Text>
          </View>
          <View style={[styles.featureItem, isMobileWeb && styles.mobileFeatureItem]}>
            <Text style={[styles.featureTitle, isMobileWeb && styles.mobileFeatureTitle]}>
              🔒 Private & Secure
            </Text>
            <Text style={[styles.featureText, isMobileWeb && styles.mobileFeatureText]}>
              Share your thoughts and questions in a safe, confidential space
            </Text>
          </View>
        </View>

        <View style={[styles.cta, isMobileWeb && styles.mobileCta]}>
          <Link href="/auth" asChild>
            <View style={styles.ctaButtonWrapper}>
              <Pressable
                style={({ pressed }) => [
                  styles.ctaButton,
                  isMobileWeb && styles.mobileCtaButton,
                  pressed && styles.ctaButtonPressed
                ]}
              >
                <RNText style={[styles.ctaButtonText, isMobileWeb && styles.mobileCtaButtonText]}>
                  Begin Your Journey
                </RNText>
              </Pressable>
            </View>
          </Link>
          <Text style={[styles.ctaSubtext, isMobileWeb && styles.mobileCtaSubtext]}>
            Find guidance and peace through God's word
          </Text>
        </View>
      </View>

      <View style={[styles.footer, isMobileWeb && styles.mobileFooter]}>
        <Text style={[styles.footerText, isMobileWeb && styles.mobileFooterText]}>
          © 2024 Pocket Pastor. All rights reserved.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBF7F4', // Warm, spiritual background color
  },
  scrollContent: {
    flexGrow: 1,
    minHeight: '100%',
  },
  content: {
    flex: 1,
    padding: Platform.select({
      web: 32,
      default: 20
    }),
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: Platform.select({
      web: 64,
      default: 40
    }),
    paddingTop: Platform.select({
      web: 64,
      default: 40
    }),
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  title: {
    fontSize: Platform.select({
      web: 56,
      default: 36
    }),
    fontFamily: Platform.select({ web: 'Palatino, serif', default: 'serif' }),
    fontWeight: '600',
    color: '#4A3728',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: Platform.select({
      web: 24,
      default: 18
    }),
    fontFamily: Platform.select({ web: 'Georgia, serif', default: 'serif' }),
    color: '#6B584A',
    textAlign: 'center',
    maxWidth: 600,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  verse: {
    fontSize: Platform.select({
      web: 20,
      default: 16
    }),
    fontFamily: Platform.select({ web: 'Georgia, serif', default: 'serif' }),
    fontStyle: 'italic',
    color: '#8B5E34',
    textAlign: 'center',
    maxWidth: 600,
    paddingHorizontal: 20,
  },
  features: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: Platform.select({
      web: 32,
      default: 16
    }),
    marginBottom: Platform.select({
      web: 64,
      default: 40
    }),
  },
  featureItem: {
    flex: 1,
    minWidth: Platform.OS === 'web' ? 280 : '100%',
    maxWidth: Platform.OS === 'web' ? 320 : '100%',
    backgroundColor: 'white',
    padding: Platform.select({
      web: 32,
      default: 24
    }),
    borderRadius: 16,
    ...Platform.select({
      web: {
        boxShadow: '0 8px 20px rgba(156, 123, 92, 0.15)'
      },
      default: {
        elevation: 4,
        shadowColor: '#9C7B5C',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
    }),
  },
  featureTitle: {
    fontSize: Platform.select({
      web: 22,
      default: 20
    }),
    fontFamily: Platform.select({ web: 'Georgia, serif', default: 'serif' }),
    fontWeight: '600',
    color: '#4A3728',
    marginBottom: 16,
  },
  featureText: {
    fontSize: Platform.select({
      web: 17,
      default: 16
    }),
    fontFamily: Platform.select({ web: 'Georgia, serif', default: 'serif' }),
    color: '#6B584A',
    lineHeight: 26,
  },
  cta: {
    alignItems: 'center',
    paddingBottom: Platform.select({
      web: 64,
      default: 40
    }),
    width: '100%',
  },
  ctaButtonWrapper: {
    backgroundColor: '#8B5E34',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 8px 20px rgba(139, 94, 52, 0.25)',
    } : {
      elevation: 5,
      shadowColor: '#8B5E34',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
    }),
  },
  ctaButton: {
    paddingHorizontal: Platform.OS === 'web' ? 40 : 32,
    paddingVertical: Platform.OS === 'web' ? 20 : 16,
    width: Platform.OS === 'web' ? 'auto' : '90%',
    minWidth: Platform.OS === 'web' ? 240 : 'auto',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5E34',
    ...(Platform.OS === 'web' ? {
      cursor: 'pointer',
    } : {}),
  },
  ctaButtonPressed: {
    opacity: 0.9,
    backgroundColor: '#7A5230',
  },
  ctaButtonText: {
    fontSize: Platform.select({
      web: 20,
      default: 18
    }),
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily: Platform.select({ web: 'Georgia, serif', default: 'serif' }),
  },
  ctaSubtext: {
    marginTop: 16,
    fontSize: Platform.select({
      web: 18,
      default: 16
    }),
    fontFamily: Platform.select({ web: 'Georgia, serif', default: 'serif' }),
    color: '#6B584A',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  footer: {
    padding: Platform.select({
      web: 24,
      default: 20
    }),
    backgroundColor: '#F5EDE6',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5D6C9',
  },
  footerText: {
    fontSize: Platform.select({
      web: 15,
      default: 13
    }),
    fontFamily: Platform.select({ web: 'Georgia, serif', default: 'serif' }),
    color: '#8B5E34',
  },
  // Mobile web specific styles
  mobileScrollContent: {
    paddingHorizontal: 16,
  },
  mobileContent: {
    padding: 16,
  },
  mobileHeader: {
    paddingTop: 32,
    marginBottom: 32,
  },
  mobileLogo: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  mobileTitle: {
    fontSize: 32,
    marginBottom: 12,
  },
  mobileSubtitle: {
    fontSize: 16,
    marginBottom: 16,
  },
  mobileVerse: {
    fontSize: 14,
    paddingHorizontal: 16,
  },
  mobileFeatures: {
    gap: 16,
    marginBottom: 32,
  },
  mobileFeatureItem: {
    padding: 16,
    minWidth: '100%',
  },
  mobileFeatureTitle: {
    fontSize: 18,
    marginBottom: 12,
  },
  mobileFeatureText: {
    fontSize: 14,
    lineHeight: 22,
  },
  mobileCta: {
    paddingBottom: 32,
  },
  mobileCtaButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    width: '100%',
  },
  mobileCtaButtonText: {
    fontSize: 16,
  },
  mobileCtaSubtext: {
    fontSize: 14,
  },
  mobileFooter: {
    padding: 16,
  },
  mobileFooterText: {
    fontSize: 12,
  },
}); 