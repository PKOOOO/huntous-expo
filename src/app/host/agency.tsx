import { useAuth } from '@clerk/expo';
import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { DocumentTile } from '@/components/host/document-tile';
import { hasDocument, useHostRequest } from '@/components/host/host-request';
import { PrimaryButton } from '@/components/primary-button';
import { WizardScreen } from '@/components/profile-setup/wizard-screen';
import { TextField } from '@/components/text-field';
import { Palette, Typography } from '@/constants/theme';
import { updateVerification } from '@/services/verification';

/** Step 3 (agent): EARB registration, agency details and practising certificate. */
export default function AgencyScreen() {
  const { getToken } = useAuth();
  const { request, setRequest, refresh } = useHostRequest();
  const [earbNumber, setEarbNumber] = useState(request?.earbNumber ?? '');
  const [agencyName, setAgencyName] = useState(request?.agencyName ?? '');
  const [agencyLocation, setAgencyLocation] = useState(request?.agencyLocation ?? '');
  const [saving, setSaving] = useState(false);

  if (!request) return <Redirect href="/host" />;

  const canContinue =
    earbNumber.trim().length >= 2 &&
    agencyName.trim().length >= 2 &&
    hasDocument(request, 'agent_license');

  const next = async () => {
    if (!canContinue || saving) return;
    setSaving(true);
    try {
      const updated = await updateVerification(getToken, request.id, {
        earbNumber: earbNumber.trim(),
        agencyName: agencyName.trim(),
        ...(agencyLocation.trim().length >= 2 && { agencyLocation: agencyLocation.trim() }),
      });
      setRequest(updated);
      router.push('/host/review');
    } catch {
      Alert.alert('Couldn’t save', 'Check your connection and try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <WizardScreen
      progress={2 / 3}
      backFallback="/host/identity"
      title="Your agency"
      subtitle="Huntouse only lists registered agents, so clients know who they’re dealing with."
      footer={<PrimaryButton title="Continue" size="md" disabled={!canContinue} loading={saving} onPress={next} />}>
      <View style={styles.form}>
        <TextField
          label="EARB registration number"
          required
          size="sm"
          placeholder="Estate Agents Registration Board number"
          value={earbNumber}
          onChangeText={setEarbNumber}
          autoCapitalize="characters"
          autoCorrect={false}
        />
        <TextField
          label="Agency name"
          required
          size="sm"
          placeholder="e.g. Tsavo Homes"
          value={agencyName}
          onChangeText={setAgencyName}
          autoCapitalize="words"
        />
        <TextField
          label="Agency location"
          size="sm"
          placeholder="e.g. Westlands, Nairobi"
          value={agencyLocation}
          onChangeText={setAgencyLocation}
          autoCapitalize="words"
        />
        <DocumentTile
          requestId={request.id}
          kind="agent_license"
          label="EARB practising certificate"
          hint="Photo or PDF of your current certificate, up to 10 MB."
          uploaded={hasDocument(request, 'agent_license')}
          sources={['camera', 'file']}
          onUploaded={refresh}
        />
        <Text style={styles.note}>
          Each sale listing will also need the owner’s mandate (authority to sell).
        </Text>
      </View>
    </WizardScreen>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 20,
    paddingBottom: 8,
  },
  note: {
    ...Typography.textXsRegular,
    color: Palette.textQuaternary,
  },
});
