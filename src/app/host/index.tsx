import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { useHostRequest } from '@/components/host/host-request';
import { PrimaryButton } from '@/components/primary-button';
import { WizardScreen } from '@/components/profile-setup/wizard-screen';
import { Palette, Radius, Typography } from '@/constants/theme';
import { useGetToken } from '@/hooks/use-get-token';
import {
  listVerifications,
  startVerification,
  type VerificationKind,
} from '@/services/verification';

const ROLES: { kind: VerificationKind; title: string; description: string; needs: string }[] = [
  {
    kind: 'owner',
    title: 'Direct owner',
    description: 'You own the property and list it yourself.',
    needs: 'Your ID, a selfie and proof you own the property.',
  },
  {
    kind: 'agent',
    title: 'Agent',
    description: 'You are a registered estate agent listing for owners.',
    needs: 'Your ID, a selfie, your EARB number and practising certificate.',
  },
];

/** Step 1: choose to become a direct owner or an agent. */
export default function ChooseRoleScreen() {
  const getToken = useGetToken();
  const { setRequest } = useHostRequest();
  const [kind, setKind] = useState<VerificationKind | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    listVerifications(getToken)
      .then(({ roles: r }) => setRoles(r))
      .catch(() => {});
  }, [getToken]);

  const start = async () => {
    if (!kind || starting) return;
    setStarting(true);
    try {
      const request = await startVerification(getToken, kind);
      setRequest(request);
      if (request.status === 'pending') {
        router.replace('/host/status');
      } else {
        router.push('/host/identity');
      }
    } catch (error) {
      if (__DEV__) console.warn('[host] start failed', error);
      Alert.alert('Couldn’t start verification', 'Check your connection and try again.');
    } finally {
      setStarting(false);
    }
  };

  return (
    <WizardScreen
      backFallback="/home"
      title="Become a host"
      subtitle="Verification is free. It keeps renters safe and earns you a verified badge."
      footer={
        <PrimaryButton title="Continue" size="md" disabled={!kind} loading={starting} onPress={start} />
      }>
      <View style={styles.options}>
        {ROLES.map((role) => {
          const already = roles.includes(role.kind);
          const selected = kind === role.kind;
          return (
            <Pressable
              key={role.kind}
              disabled={already}
              style={[styles.option, selected && styles.optionSelected, already && styles.optionDone]}
              onPress={() => setKind(role.kind)}
              accessibilityRole="radio"
              accessibilityState={{ selected, disabled: already }}>
              <Image
                source={
                  selected || already
                    ? require('@/assets/icons/checkbox-md-checked.svg')
                    : require('@/assets/icons/checkbox-md-unchecked.svg')
                }
                style={styles.checkbox}
              />
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>
                  {role.title}
                  {already && <Text style={styles.verified}>  ✓ Verified</Text>}
                </Text>
                <Text style={styles.optionDescription}>{role.description}</Text>
                <Text style={styles.optionNeeds}>You’ll need: {role.needs}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </WizardScreen>
  );
}

const styles = StyleSheet.create({
  options: {
    gap: 20,
  },
  option: {
    flexDirection: 'row',
    gap: 16,
    padding: 15,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Palette.borderSecondary,
    backgroundColor: Palette.bgPrimary,
  },
  optionSelected: {
    borderColor: Palette.borderBrand,
  },
  optionDone: {
    opacity: 0.6,
  },
  checkbox: {
    width: 20,
    height: 20,
    marginTop: 2,
  },
  optionText: {
    flex: 1,
    gap: 2,
  },
  optionTitle: {
    ...Typography.textMdMedium,
    color: Palette.textPrimary,
  },
  verified: {
    ...Typography.textSmMedium,
    color: Palette.brand,
  },
  optionDescription: {
    ...Typography.textSmRegular,
    color: Palette.textTertiary,
  },
  optionNeeds: {
    ...Typography.textXsRegular,
    color: Palette.textQuaternary,
    marginTop: 4,
  },
});
