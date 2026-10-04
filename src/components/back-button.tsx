import { Image } from 'expo-image';
import { router, type Href } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { Palette, Radius } from '@/constants/theme';

/** Kit nav-bar back button. Goes back, or to `fallback` when there is no history. */
export function BackButton({ fallback }: { fallback: Href }) {
  return (
    <Pressable
      onPress={() => (router.canGoBack() ? router.back() : router.replace(fallback))}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel="Go back">
      <Image source={require('@/assets/icons/arrow-left.svg')} style={styles.icon} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'flex-start',
    padding: 8,
    borderRadius: Radius.pill,
    backgroundColor: Palette.bgTertiary,
  },
  pressed: {
    opacity: 0.7,
  },
  icon: {
    width: 20,
    height: 20,
  },
});
