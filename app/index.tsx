import { View, StyleSheet, Platform } from 'react-native';
import { Text, Button } from '@rneui/themed';
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
    <View style={styles.container}>
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
            <Button
              title="Get Started"
              buttonStyle={styles.ctaButton}
              titleStyle={styles.ctaButtonText}
            />
          </Link>
          <Text style={styles.ctaSubtext}>Join thousands finding guidance through scripture</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2024 Biblical Guidance Chat. All rights reserved.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
    padding: 32,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 64,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 20,
    color: '#64748b',
    textAlign: 'center',
    maxWidth: 600,
  },
  features: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 32,
    marginBottom: 64,
  },
  featureItem: {
    flex: 1,
    minWidth: 280,
    maxWidth: 320,
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#64748b',
    lineHeight: 24,
  },
  cta: {
    alignItems: 'center',
  },
  ctaButton: {
    backgroundColor: '#5469d4',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    minWidth: 200,
  },
  ctaButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  ctaSubtext: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },
  footer: {
    padding: 24,
    backgroundColor: 'white',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  footerText: {
    fontSize: 14,
    color: '#94a3b8',
  },
}); 