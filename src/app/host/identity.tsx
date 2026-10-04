import { useAuth } from '@clerk/expo';
import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { DocumentTile } from '@/components/host/document-tile';
import { hasDocument, useHostRequest } from '@/components/host/host-request';
import { OptionSheet } from '@/components/option-sheet';
import { PrimaryButton } from '@/components/primary-button';
import { WizardScreen } from '@/components/profile-setup/wizard-screen';
import { SelectField, TextField } from '@/components/text-field';
import { Palette, Typography } from '@/constants/theme';
import { ApiError } from '@/services/api';
import { ID_TYPE_LABELS, updateVerification, type IdType } from '@/services/verification';

const ID_NUMBER = /^[A-Za-z0-9 -]{5,20}$/;

/** Step 2: identity — ID type & number, photos of the ID, and a selfie. */
export default function IdentityScreen() {
  const { getToken } = useAuth();
  const { request, setRequest, refresh } = useHostRequest();
  const [idType, setIdType] = useState<IdType | null>(request?.idType ?? null);
  const [idNumber, setIdNumber] = useState('');
  const [idNumberError, setIdNumberError] = useState<string>();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!request) return <Redirect href="/host" />;

  const needsBack = idType !== 'passport';
  const docsDone =
    hasDocument(request, 'id_front') &&
    hasDocument(request, 'selfie') &&
    (!needsBack || hasDocument(request, 'id_back'));
  const numberDone = idNumber.trim().length > 0 || request.idNumberLast4 !== null;
  const canContinue = idType !== null && numberDone && docsDone;

  const next = async () => {
    if (!canContinue || saving) return;
    if (idNumber.trim() && !ID_NUMBER.test(idNumber.trim())) {
      setIdNumberError('Enter the number exactly as printed on your ID');
      return;
    }
    setSaving(true);
    try {
      const updated = await updateVerification(getToken, request.id, {
        idType,
        ...(idNumber.trim() && { idNumber: idNumber.trim() }),
      });
      setRequest(updated);
      router.push(updated.kind === 'owner' ? '/host/ownership' : '/host/agency');
    } catch (error) {
      if (error instanceof ApiError && error.status === 400) {
        setIdNumberError('Enter the number exactly as printed on your ID');
      } else {
        Alert.alert('Couldn’t save', 'Check your connection and try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <WizardScreen
      progress={1 / 3}
      backFallback="/host"
      title="Verify your identity"
      subtitle="Only Huntouse reviewers see your documents. They’re never shown to renters."
      footer={<PrimaryButton title="Continue" size="md" disabled={!canContinue} loading={saving} onPress={next} />}>
      <View style={styles.form}>
        <SelectField
          label="ID type"
          required
          size="sm"
          placeholder="Select your ID type"
          value={idType ? ID_TYPE_LABELS[idType] : undefined}
          onPress={() => setSheetOpen(true)}
        />
        <TextField
          label="ID number"
          required
          size="sm"
          placeholder={
            request.idNumberLast4 ? `Saved (ends in ${request.idNumberLast4})` : 'As printed on your ID'
          }
          value={idNumber}
          onChangeText={(text) => {
            setIdNumber(text);
            setIdNumberError(undefined);
          }}
          error={idNumberError}
          autoCapitalize="characters"
          autoCorrect={false}
        />

        <Text style={styles.section}>Photos</Text>
        <Text style={styles.tip}>
          Use good light, show all four corners, and make sure the text is readable.
        </Text>
        <DocumentTile
          requestId={request.id}
          kind="id_front"
          label={idType === 'passport' ? 'Passport photo page' : 'Front of your ID'}
          uploaded={hasDocument(request, 'id_front')}
          sources={['camera', 'library']}
          onUploaded={refresh}
        />
        {needsBack && (
          <DocumentTile
            requestId={request.id}
            kind="id_back"
            label="Back of your ID"
            uploaded={hasDocument(request, 'id_back')}
            sources={['camera', 'library']}
            onUploaded={refresh}
          />
        )}
        <DocumentTile
          requestId={request.id}
          kind="selfie"
          label="A selfie"
          hint="Face the camera, no hat or sunglasses. We compare it with your ID photo."
          uploaded={hasDocument(request, 'selfie')}
          sources={['selfie']}
          onUploaded={refresh}
        />
      </View>

      <OptionSheet
        visible={sheetOpen}
        title="ID type"
        options={(Object.keys(ID_TYPE_LABELS) as IdType[]).map((key) => ({
          key,
          label: ID_TYPE_LABELS[key],
        }))}
        selectedKey={idType ?? undefined}
        onSelect={(key) => setIdType(key as IdType)}
        onClose={() => setSheetOpen(false)}
      />
    </WizardScreen>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 20,
    paddingBottom: 8,
  },
  section: {
    ...Typography.textLgMedium,
    color: Palette.textPrimary,
    marginTop: 4,
  },
  tip: {
    ...Typography.textSmRegular,
    color: Palette.textQuaternary,
    marginTop: -14,
  },
});
