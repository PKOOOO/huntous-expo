import { router, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackButton } from '@/components/back-button';
import { useHostRequest } from '@/components/host/host-request';
import { PrimaryButton } from '@/components/primary-button';
import { Palette, Radius, Typography } from '@/constants/theme';
import { useGetToken } from '@/hooks/use-get-token';
import { listVerifications, type VerificationRequest } from '@/services/verification';

const COPY = {
  pending: {
    badge: 'Under review',
    title: 'Thanks — we’re checking your details',
    body: 'A Huntouse reviewer will verify your documents, usually within 1–2 working days. We’ll let you know as soon as it’s done.',
  },
  approved: {
    badge: 'Verified',
    title: 'You’re verified!',
    body: 'Your verified badge shows renters you’re the real deal. Listing tools are coming soon.',
  },
  rejected: {
    badge: 'Action needed',
    title: 'We couldn’t verify you yet',
    body: 'Please fix the issue below and resubmit.',
  },
  draft: {
    badge: 'Not submitted',
    title: 'Finish your verification',
    body: 'You started becoming a host but haven’t submitted yet.',
  },
} as const;

/** Verification status: pending / approved / rejected (with reason + resubmit). */
export default function StatusScreen() {
  const getToken = useGetToken();
  const { setRequest } = useHostRequest();
  const [request, setLocal] = useState<VerificationRequest | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      listVerifications(getToken)
        .then(({ requests }) => setLocal(requests[0] ?? null))
        .catch(() => {})
        .finally(() => setLoading(false));
    }, [getToken]),
  );

  const copy = request ? COPY[request.status] : null;
  const role = request?.kind === 'agent' ? 'agent' : 'owner';

  const resume = () => {
    if (!request) return;
    setRequest(request);
    router.push('/host/identity');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.navBar}>
        <BackButton fallback="/home" />
      </View>
      {loading ? (
        <ActivityIndicator color={Palette.brand} style={styles.loading} />
      ) : !request || !copy ? (
        <View style={styles.body}>
          <Text style={styles.title}>No verification yet</Text>
          <PrimaryButton title="Become a host" size="md" onPress={() => router.replace('/host')} />
        </View>
      ) : (
        <View style={styles.body}>
          <Text
            style={[
              styles.badge,
              request.status === 'approved' && styles.badgeApproved,
              request.status === 'rejected' && styles.badgeRejected,
            ]}>
            {copy.badge} · {role}
          </Text>
          <Text style={styles.title} accessibilityRole="header">
            {copy.title}
          </Text>
          <Text style={styles.text}>{copy.body}</Text>
          {request.status === 'rejected' && request.rejectionReason && (
            <View style={styles.reason}>
              <Text style={styles.reasonLabel}>Reviewer’s note</Text>
              <Text style={styles.reasonText}>{request.rejectionReason}</Text>
            </View>
          )}
          <View style={styles.actions}>
            {(request.status === 'rejected' || request.status === 'draft') && (
              <PrimaryButton
                title={request.status === 'rejected' ? 'Fix and resubmit' : 'Continue'}
                size="md"
                onPress={resume}
              />
            )}
            <PrimaryButton
              title="Back to home"
              size="md"
              variant="secondary"
              onPress={() => router.replace('/home')}
            />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.bgPrimary,
  },
  navBar: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  loading: {
    marginTop: 48,
  },
  body: {
    paddingHorizontal: 16,
    gap: 12,
  },
  badge: {
    ...Typography.textSmMedium,
    alignSelf: 'flex-start',
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    color: Palette.textSecondary,
    backgroundColor: Palette.bgTertiary,
  },
  badgeApproved: {
    color: Palette.textWhite,
    backgroundColor: Palette.brand,
  },
  badgeRejected: {
    color: Palette.textError,
    backgroundColor: '#FEE4E2',
  },
  title: {
    ...Typography.displayXsMedium,
    color: Palette.textPrimary,
  },
  text: {
    ...Typography.textMdRegular,
    color: Palette.textTertiary,
  },
  reason: {
    gap: 4,
    padding: 12,
    borderRadius: Radius.md,
    backgroundColor: '#FEF3F2',
  },
  reasonLabel: {
    ...Typography.textSmMedium,
    color: Palette.textError,
  },
  reasonText: {
    ...Typography.textMdRegular,
    color: Palette.textPrimary,
  },
  actions: {
    gap: 12,
    marginTop: 12,
  },
});
