import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { OptionSheet } from '@/components/option-sheet';
import { PrimaryButton } from '@/components/primary-button';
import { useProfileDraft } from '@/components/profile-setup/profile-draft';
import { WizardScreen } from '@/components/profile-setup/wizard-screen';
import { DialCodeButton, SelectField, TextField } from '@/components/text-field';
import { COUNTRIES } from '@/constants/countries';
import { Palette, Radius, Typography } from '@/constants/theme';

/** Formats raw digits as DD/MM/YYYY while typing. */
function formatBirthday(input: string) {
  const digits = input.replace(/\D/g, '').slice(0, 8);
  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4)].filter(Boolean).join('/');
}

function isValidBirthday(value: string) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) return false;
  const [day, month, year] = match.slice(1).map(Number);
  const date = new Date(year, month - 1, day);
  const valid =
    date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  return valid && date < new Date() && year >= 1900;
}

// Kit screens 21–22: Set up profile - details (Figma 4290:11102).
export default function ProfileDetailsScreen() {
  const { draft, update } = useProfileDraft();
  const [sheet, setSheet] = useState<'country' | 'dial' | null>(null);
  const [birthdayError, setBirthdayError] = useState<string>();

  const country = COUNTRIES.find((c) => c.code === draft.countryCode);
  const dialCountry = COUNTRIES.find((c) => c.code === draft.phoneCountryCode) ?? COUNTRIES[0];
  const canContinue = draft.fullName.trim().length > 0;

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      // Clerk takes the image as a base64 data URL.
      base64: true,
    });
    const asset = result.canceled ? undefined : result.assets[0];
    if (asset?.base64) {
      update({
        photo: { uri: asset.uri, base64: asset.base64, mimeType: asset.mimeType ?? 'image/jpeg' },
      });
    }
  };

  const next = () => {
    if (draft.birthday && !isValidBirthday(draft.birthday)) {
      setBirthdayError('Enter a valid date as DD/MM/YYYY');
      return;
    }
    router.push('/profile-setup/goals');
  };

  return (
    <WizardScreen
      footer={
        <>
          <PrimaryButton title="Continue" size="md" disabled={!canContinue} onPress={next} />
          <PrimaryButton
            title="Skip"
            size="md"
            variant="secondary"
            onPress={() => router.push('/profile-setup/goals')}
          />
        </>
      }>
      <View style={styles.form}>
        <View style={styles.photoBlock}>
          <Pressable
            style={styles.avatar}
            onPress={pickPhoto}
            accessibilityRole="button"
            accessibilityLabel={draft.photo ? 'Change profile photo' : 'Upload profile photo'}>
            {draft.photo ? (
              <Image source={{ uri: draft.photo.uri }} style={styles.avatarPhoto} contentFit="cover" />
            ) : (
              <Image source={require('@/assets/icons/user-circle.svg')} style={styles.avatarIcon} />
            )}
          </Pressable>
          <Pressable style={styles.photoButton} onPress={pickPhoto} hitSlop={8}>
            <Image
              source={
                draft.photo
                  ? require('@/assets/icons/pencil-simple-line.svg')
                  : require('@/assets/icons/upload-simple.svg')
              }
              style={styles.photoButtonIcon}
            />
            <Text style={styles.photoButtonText}>
              {draft.photo ? 'Edit profile photo' : 'Upload photo'}
            </Text>
          </Pressable>
        </View>

        <TextField
          label="Full name"
          required
          size="sm"
          placeholder="Enter your full name"
          value={draft.fullName}
          onChangeText={(fullName) => update({ fullName })}
          autoCapitalize="words"
          autoComplete="name"
          textContentType="name"
        />
        <TextField
          label="Phone number"
          size="sm"
          placeholder="Enter phone number"
          value={draft.phone}
          onChangeText={(phone) => update({ phone: phone.replace(/[^\d ]/g, '') })}
          keyboardType="phone-pad"
          autoComplete="tel"
          textContentType="telephoneNumber"
          leading={<DialCodeButton code={dialCountry.dialCode} onPress={() => setSheet('dial')} />}
        />
        <TextField
          label="Birthday"
          size="sm"
          placeholder="DD/MM/YYYY"
          value={draft.birthday}
          onChangeText={(text) => {
            update({ birthday: formatBirthday(text) });
            setBirthdayError(undefined);
          }}
          error={birthdayError}
          keyboardType="number-pad"
          maxLength={10}
        />
        <SelectField
          label="Country"
          size="sm"
          placeholder="Select your country"
          value={country?.name}
          onPress={() => setSheet('country')}
        />
      </View>

      <OptionSheet
        visible={sheet === 'country'}
        title="Country"
        options={COUNTRIES.map((c) => ({ key: c.code, label: c.name }))}
        selectedKey={draft.countryCode}
        onSelect={(countryCode) => update({ countryCode })}
        onClose={() => setSheet(null)}
      />
      <OptionSheet
        visible={sheet === 'dial'}
        title="Country code"
        options={COUNTRIES.map((c) => ({ key: c.code, label: c.name, detail: c.dialCode }))}
        selectedKey={draft.phoneCountryCode}
        onSelect={(phoneCountryCode) => update({ phoneCountryCode })}
        onClose={() => setSheet(null)}
      />
    </WizardScreen>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 24,
  },
  photoBlock: {
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: Radius.pill,
    backgroundColor: Palette.bgTertiary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarIcon: {
    width: 32,
    height: 32,
  },
  avatarPhoto: {
    width: '100%',
    height: '100%',
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  photoButtonIcon: {
    width: 20,
    height: 20,
  },
  photoButtonText: {
    ...Typography.textSmMedium,
    color: Palette.brand,
  },
});
