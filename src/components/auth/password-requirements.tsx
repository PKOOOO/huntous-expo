import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { Palette, Typography } from '@/constants/theme';

export const PASSWORD_RULES = [
  { label: 'Minimum 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'At least one uppercase letter (A-Z)', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'At least one number (0-9)', test: (p: string) => /\d/.test(p) },
  { label: 'At least one special character (!@#$%^&*)', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
] as const;

export const meetsPasswordRules = (password: string) =>
  PASSWORD_RULES.every((rule) => rule.test(password));

/** Live checklist under the "Create new password" field. */
export function PasswordRequirements({ password }: { password: string }) {
  return (
    <View style={styles.list}>
      {PASSWORD_RULES.map((rule) => {
        const met = rule.test(password);
        return (
          <View
            key={rule.label}
            style={styles.row}
            accessible
            accessibilityLabel={`${rule.label}, ${met ? 'met' : 'not met'}`}>
            <Image
              source={
                met
                  ? require('@/assets/icons/checkbox-checked.svg')
                  : require('@/assets/icons/checkbox-unchecked.svg')
              }
              style={styles.icon}
            />
            <Text style={styles.label}>{rule.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    width: 16,
    height: 16,
  },
  label: {
    ...Typography.textXsRegular,
    color: Palette.textQuaternary,
  },
});
