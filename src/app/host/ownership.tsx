import { Redirect, router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { DocumentTile } from '@/components/host/document-tile';
import { hasDocument, useHostRequest } from '@/components/host/host-request';
import { PrimaryButton } from '@/components/primary-button';
import { WizardScreen } from '@/components/profile-setup/wizard-screen';
import { Palette, Typography } from '@/constants/theme';

const ACCEPTED = [
  'Title deed or certificate of lease',
  'Sale agreement for the property',
  'Recent utility bill (water / electricity) in your name at this address',
  'Land rates receipt in your name',
];

/** Step 3 (owner): proof that the applicant owns a property. */
export default function OwnershipScreen() {
  const { request, refresh } = useHostRequest();
  if (!request) return <Redirect href="/host" />;

  const done = hasDocument(request, 'ownership_proof');

  return (
    <WizardScreen
      progress={2 / 3}
      backFallback="/host/identity"
      title="Proof of ownership"
      subtitle="Renters trust listings from people who actually own the property. Upload one of:"
      footer={
        <PrimaryButton
          title="Continue"
          size="md"
          disabled={!done}
          onPress={() => router.push('/host/review')}
        />
      }>
      <View style={styles.list}>
        {ACCEPTED.map((item) => (
          <Text key={item} style={styles.item}>
            •  {item}
          </Text>
        ))}
      </View>
      <DocumentTile
        requestId={request.id}
        kind="ownership_proof"
        label="Ownership document"
        hint="Photo or PDF, up to 10 MB. The name must match your ID."
        uploaded={done}
        sources={['camera', 'file']}
        onUploaded={refresh}
      />
      <Text style={styles.note}>
        You’ll add proof for each property when you list it. This first document verifies you as an
        owner.
      </Text>
    </WizardScreen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 6,
    marginTop: -12,
  },
  item: {
    ...Typography.textSmRegular,
    color: Palette.textTertiary,
  },
  note: {
    ...Typography.textXsRegular,
    color: Palette.textQuaternary,
  },
});
