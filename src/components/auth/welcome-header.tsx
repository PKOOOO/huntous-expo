import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { Palette, Typography } from '@/constants/theme';

/** Building illustration + centred title, shared by Login and Register. */
export function WelcomeHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View style={styles.header}>
      <View style={styles.illustrationFrame}>
        <Image
          source={require('@/assets/images/auth/welcome-building.png')}
          style={styles.illustration}
        />
      </View>
      <View>
        <Text style={styles.title} accessibilityRole="header">
          {title}
        </Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    gap: 8,
  },
  illustrationFrame: {
    width: 100,
    height: 100,
    overflow: 'hidden',
  },
  illustration: {
    position: 'absolute',
    left: -2.5,
    top: -3,
    width: 108,
    height: 108,
  },
  title: {
    ...Typography.textXlMedium,
    color: Palette.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.textSmRegular,
    color: Palette.textQuaternary,
    textAlign: 'center',
  },
});
