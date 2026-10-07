import { Image } from 'expo-image';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { SlideInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Palette, Typography } from '@/constants/theme';

type WelcomeSheetProps = {
  visible: boolean;
  firstName?: string | null;
  onClose: () => void;
};

/**
 * Kit screen 28 "Home-Welcome": the "You're all set" sheet shown once, right after profile setup,
 * over Home (Figma 4344:10282). Dismissed by tapping outside or the grabber.
 */
export function WelcomeSheet({ visible, firstName, onClose }: WelcomeSheetProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close" />
      <Animated.View entering={SlideInDown.duration(350)} style={styles.sheet}>
        <SafeAreaView edges={['bottom']}>
          <Pressable style={styles.grabberHit} onPress={onClose} accessibilityLabel="Close">
            <View style={styles.grabber} />
          </Pressable>
          <View style={styles.content}>
            <View style={styles.art}>
              <Image source={require('@/assets/images/auth/confetti.svg')} style={styles.confetti} />
              <Image source={require('@/assets/images/home/welcome-villa.png')} style={styles.villa} />
            </View>
            <View style={styles.text}>
              <Text style={styles.title} accessibilityRole="header">
                You’re all set{firstName ? `, ${firstName}` : ''}! 🎉
              </Text>
              <Text style={styles.body}>
                Your account is ready. We’ve saved your preferences and we’re already looking for
                properties that match — you’ll be the first to know when something great comes up.
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    backgroundColor: Palette.bgPrimary,
  },
  grabberHit: {
    alignItems: 'center',
    paddingTop: 5,
    paddingBottom: 27,
  },
  grabber: {
    width: 36,
    height: 5,
    borderRadius: 100,
    backgroundColor: Palette.fgSenary,
  },
  content: {
    gap: 16,
    paddingHorizontal: 16,
    // Kit: 50pt bottom padding includes the 34pt home indicator (handled by the safe area).
    paddingBottom: 16,
  },
  art: {
    height: 160,
    overflow: 'hidden',
  },
  confetti: {
    position: 'absolute',
    alignSelf: 'center',
    top: -25,
    width: 244,
    height: 210,
  },
  villa: {
    position: 'absolute',
    alignSelf: 'center',
    top: -22,
    width: 204,
    height: 204,
  },
  text: {
    alignItems: 'center',
  },
  title: {
    ...Typography.displayXsMedium,
    color: Palette.textPrimary,
    textAlign: 'center',
  },
  body: {
    ...Typography.textSmRegular,
    color: Palette.textQuaternary,
    textAlign: 'center',
  },
});
