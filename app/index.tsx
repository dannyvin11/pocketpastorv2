import { View, StyleSheet, Platform, Pressable, ScrollView, Text as RNText } from 'react-native';
import { Text } from '@rneui/themed';
import { Link } from 'expo-router';
import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'expo-router';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    // Only redirect on mobile platforms
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
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Biblical Guidance Chat</Text>
          <Text style={styles.subtitle}>Get spiritual guidance and biblical wisdom for life's questions</Text>
        </View>

        <View style={styles.features}>
          <View style={styles.featureItem}>
            <Text style={styles.featureTitle}>🤝 Personal Guidance</Text>
            <Text style={styles.featureText}>Receive thoughtful, biblical-based advice for your personal situations</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureTitle}>📖 Scripture-Based</Text>
            <Text style={styles.featureText}>Get insights directly from biblical teachings and verses</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureTitle}>🔒 Private & Secure</Text>
            <Text style={styles.featureText}>Your conversations are private and protected</Text>
          </View>
        </View>

        <View style={styles.cta}>
          <Link href="/auth" asChild>
            <View style={styles.ctaButtonWrapper}>
              <Pressable
                style={({ pressed }) => [
                  styles.ctaButton,
                  pressed && styles.ctaButtonPressed
                ]}
              >
                <RNText style={styles.ctaButtonText}>Get Started</RNText>
              </Pressable>
            </View>
          </Link>
          <Text style={styles.ctaSubtext}>Join thousands finding guidance through scripture</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2024 Biblical Guidance Chat. All rights reserved.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
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
  title: {
    fontSize: Platform.select({
      web: 48,
      default: 32
    }),
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: Platform.select({
      web: 20,
      default: 16
    }),
    color: '#64748b',
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
      web: 24,
      default: 20
    }),
    borderRadius: 16,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
      },
      default: {
        elevation: 2
      },
    }),
  },
  featureTitle: {
    fontSize: Platform.select({
      web: 20,
      default: 18
    }),
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  featureText: {
    fontSize: Platform.select({
      web: 16,
      default: 15
    }),
    color: '#64748b',
    lineHeight: 24,
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
      boxShadow: '0 4px 6px rgba(139, 94, 52, 0.25)',
    } : {
      elevation: 5
    }),
  },
  ctaButton: {
    paddingHorizontal: Platform.OS === 'web' ? 32 : 24,
    paddingVertical: Platform.OS === 'web' ? 16 : 14,
    width: Platform.OS === 'web' ? 'auto' : '90%',
    minWidth: Platform.OS === 'web' ? 200 : 'auto',
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
      web: 18,
      default: 16
    }),
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily: Platform.select({ web: 'Georgia, serif', default: 'serif' }),
  },
  ctaSubtext: {
    marginTop: 16,
    fontSize: Platform.select({
      web: 16,
      default: 14
    }),
    color: '#64748b',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  footer: {
    padding: Platform.select({
      web: 24,
      default: 20
    }),
    backgroundColor: 'white',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  footerText: {
    fontSize: Platform.select({
      web: 14,
      default: 12
    }),
    color: '#94a3b8',
  },
}); 