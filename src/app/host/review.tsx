import { useAuth } from '@clerk/expo';
import { Image } from 'expo-image';
import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { useHostRequest } from '@/components/host/host-request';
import { PrimaryButton } from '@/components/primary-button';
import { WizardScreen } from '@/components/profile-setup/wizard-screen';
import { Palette, Radius, Typography } from '@/constants/theme';
import { ApiError } from '@/services/api';
import { ID_TYPE_LABELS, submitVerification } from '@/services/verification';

const DOC_LABELS: Record<string, string> = {
  id_front: 'ID front',
  id_back: 'ID back',
  selfie: 'Selfie',
  ownership_proof: 'Proof of ownership',
  agent_license: 'EARB certificate',
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

/** Step 4: summary, data-protection consent, submit for review. */
export default function ReviewScreen() {
  const { getToken } = useAuth();
  const { request, setRequest } = useHostRequest();
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!request) return <Redirect href="/host" />;

  const submit = async () => {
    if (!consent || submitting) return;
    setSubmitting(true);
    try {
      setRequest(await submitVerification(getToken, request.id));
      router.dismissAll();
      router.replace('/host/status');
    } catch (error) {
      const missing = error instanceof ApiError && error.status === 422;
      Alert.alert(
        missing ? 'Something is missing' : 'Couldn’t submit',
        missing
          ? 'Please go back and check every step is complete, including all photos.'
          : 'Check your connection and try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <WizardScreen
      progress={1}
      backFallback="/host"
      title="Review and submit"
      subtitle="A Huntouse reviewer checks your details, usually within 1–2 working days."
      footer={
        <PrimaryButton
          title="Submit for verification"
          size="md"
          disabled={!consent}
          loading={submitting}
          onPress={submit}
        />
      }>
      <View style={styles.card}>
        <Row label="Becoming" value={request.kind === 'owner' ? 'Direct owner' : 'Agent'} />
        <Row
          label="ID"
          value={`${request.idType ? ID_TYPE_LABELS[request.idType] : '—'} •••• ${request.idNumberLast4 ?? '—'}`}
        />
        {request.kind === 'agent' && (
          <>
            <Row label="EARB number" value={request.earbNumber ?? '—'} />
            <Row label="Agency" value={request.agencyName ?? '—'} />
          </>
        )}
        <Row
          label="Documents"
          value={request.documents.map((d) => DOC_LABELS[d.kind] ?? d.kind).join(', ') || '—'}
        />
      </View>

      <Pressable
        style={styles.consent}
        onPress={() => setConsent((c) => !c)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: consent }}>
        <Image
          source={
            consent
              ? require('@/assets/icons/checkbox-md-checked.svg')
              : require('@/assets/icons/checkbox-md-unchecked.svg')
          }
          style={styles.checkbox}
        />
        <Text style={styles.consentText}>
          I confirm these documents are mine and genuine, and I agree that Huntouse may process them
          to verify my identity, in line with Kenya’s Data Protection Act. They’re stored privately
          and never shown to other users.
        </Text>
      </Pressable>
    </WizardScreen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 12,
    padding: 15,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Palette.borderSecondary,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  rowLabel: {
    ...Typography.textSmRegular,
    color: Palette.textQuaternary,
  },
  rowValue: {
    ...Typography.textSmMedium,
    color: Palette.textPrimary,
    flexShrink: 1,
    textAlign: 'right',
  },
  consent: {
    flexDirection: 'row',
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    marginTop: 2,
  },
  consentText: {
    ...Typography.textSmRegular,
    color: Palette.textTertiary,
    flex: 1,
  },
});
