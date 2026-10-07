import { useAuth, useUser } from '@clerk/expo';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { WelcomeSheet } from '@/components/home/welcome-sheet';
import { PrimaryButton } from '@/components/primary-button';
import { Palette, Radius, Typography } from '@/constants/theme';
import { useGetToken } from '@/hooks/use-get-token';
import { listVerifications, type VerificationRequest } from '@/services/verification';

type HostState = { roles: string[]; latest: VerificationRequest | null } | null;

/** "Become a host" entry, reflecting the user's verification state. */
function HostCard({ state }: { state: HostState }) {
  if (!state) return null;
  const verified = state.roles.filter((r) => r === 'owner' || r === 'agent');
  const status = state.latest?.status;

  const [title, body, action, href] = verified.length
    ? [
        `Verified ${verified.join(' & ')} ✓`,
        'Your verified badge is active. Listing tools are coming soon.',
        'View status',
        '/host/status',
      ]
    : status === 'pending'
      ? ['Verification under review', 'We’ll let you know once a reviewer has checked it.', 'View status', '/host/status']
      : status === 'rejected'
        ? ['Action needed', 'Your verification needs a fix before you can host.', 'See what to fix', '/host/status']
        : [
            'Own a property or work as an agent?',
            'Get verified for free and list directly — no middlemen.',
            status === 'draft' ? 'Continue verification' : 'Become a host',
            '/host',
          ];

  return (
    <Pressable
      style={styles.card}
      onPress={() => router.push(href as '/host' | '/host/status')}
      accessibilityRole="button">
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardBody}>{body}</Text>
      <Text style={styles.cardAction}>{action} →</Text>
    </Pressable>
  );
}

// Placeholder until the home screen (kit screens 28–29) is built.
export default function HomeScreen() {
  const { signOut } = useAuth();
  const getToken = useGetToken();
  const { user } = useUser();
  const [hostState, setHostState] = useState<HostState>(null);
  // Kit screen 28: the "You're all set" sheet, shown once when arriving from profile setup.
  const { welcome } = useLocalSearchParams<{ welcome?: string }>();
  const [showWelcome, setShowWelcome] = useState(welcome === '1');

  useFocusEffect(
    useCallback(() => {
      listVerifications(getToken)
        .then(({ roles, requests }) => setHostState({ roles, latest: requests[0] ?? null }))
        .catch(() => {});
    }, [getToken]),
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Hi {user?.firstName ?? 'there'}!</Text>
        <Text style={styles.body}>
          Signed in as {user?.primaryEmailAddress?.emailAddress}. Home is coming next.
        </Text>
      </View>
      <HostCard state={hostState} />
      <WelcomeSheet
        visible={showWelcome}
        firstName={user?.firstName}
        onClose={() => {
          setShowWelcome(false);
          // Drop the param so the sheet doesn't come back on reload / back navigation.
          router.setParams({ welcome: undefined });
        }}
      />
      <PrimaryButton
        title="Sign out"
        size="md"
        variant="secondary"
        onPress={async () => {
          await signOut();
          router.replace('/');
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    gap: 24,
    backgroundColor: Palette.bgPrimary,
  },
  header: {
    gap: 8,
  },
  title: {
    ...Typography.headline,
    color: Palette.textPrimary,
    textAlign: 'center',
  },
  body: {
    ...Typography.textMdRegular,
    color: Palette.textQuaternary,
    textAlign: 'center',
  },
  card: {
    gap: 4,
    padding: 16,
    borderRadius: Radius.lg,
    backgroundColor: Palette.brand50,
    borderWidth: 1,
    borderColor: Palette.brandBorderSoft,
  },
  cardTitle: {
    ...Typography.textLgMedium,
    color: Palette.textPrimary,
  },
  cardBody: {
    ...Typography.textSmRegular,
    color: Palette.textTertiary,
  },
  cardAction: {
    ...Typography.textMdMedium,
    color: Palette.brand,
    marginTop: 6,
  },
});
