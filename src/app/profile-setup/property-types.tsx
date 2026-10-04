import { useAuth, useUser } from '@clerk/expo';
import { Image, type ImageSource } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { toggle, useProfileDraft } from '@/components/profile-setup/profile-draft';
import { WizardScreen } from '@/components/profile-setup/wizard-screen';
import { Palette, Radius, Typography } from '@/constants/theme';
import { saveProfile, type PropertyType } from '@/services/profile';

/** Bubble field as drawn in Figma (4341:9487); scaled down on shorter screens. */
const FIELD = { width: 343, height: 494 };
const BUBBLE = 109;

const TYPES: {
  key: PropertyType;
  label: string;
  icon: ImageSource;
  /** Top-left in FIELD coordinates. */
  at: { left: number; top: number };
  /** Size of the illustration inside its 40pt clip, from Figma. */
  iconSize: number;
}[] = [
  { key: 'home', label: 'Home', icon: require('@/assets/images/property-types/home.png'), at: { left: 20, top: 10 }, iconSize: 48 },
  { key: 'apartments', label: 'Apartments', icon: require('@/assets/images/property-types/apartments.png'), at: { left: 224, top: 0 }, iconSize: 48 },
  { key: 'condos', label: 'Condos', icon: require('@/assets/images/property-types/condos.png'), at: { left: 147, top: 125 }, iconSize: 44 },
  { key: 'lofts', label: 'Lofts', icon: require('@/assets/images/property-types/lofts.png'), at: { left: 0, top: 162 }, iconSize: 46 },
  { key: 'villas', label: 'Villas', icon: require('@/assets/images/property-types/villas.png'), at: { left: 234, top: 240 }, iconSize: 42 },
  { key: 'townhouses', label: 'Townhouses', icon: require('@/assets/images/property-types/townhouses.png'), at: { left: 108, top: 270 }, iconSize: 42 },
  { key: 'studios', label: 'Studios', icon: require('@/assets/images/property-types/studios.png'), at: { left: 0, top: 345 }, iconSize: 48 },
  { key: 'penthouses', label: 'Penthouses', icon: require('@/assets/images/property-types/penthouses.png'), at: { left: 214, top: 385 }, iconSize: 44 },
];

// Kit screens 26–27: Set up profile - property type preference (Figma 4336:9480).
export default function PropertyTypesScreen() {
  const { draft, update } = useProfileDraft();
  const { user } = useUser();
  const { getToken } = useAuth();
  const [scale, setScale] = useState(0);
  const [saving, setSaving] = useState(false);

  const onLayout = ({ nativeEvent }: LayoutChangeEvent) => {
    const { width, height } = nativeEvent.layout;
    setScale(Math.min(1, width / FIELD.width, height / FIELD.height));
  };

  const finish = async () => {
    if (!user || saving) return;
    setSaving(true);
    try {
      await saveProfile(user, getToken, draft);
      router.replace('/home');
    } catch (error) {
      if (__DEV__) console.warn('[profile] save failed', error);
      Alert.alert('Couldn’t save your profile', 'Check your connection and try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <WizardScreen
      progress={0.316}
      onSkip={finish}
      title="Property type preference"
      subtitle="Select all you're interested in"
      scroll={false}
      footer={
        <PrimaryButton
          title="Continue"
          size="md"
          disabled={draft.propertyTypes.length === 0}
          loading={saving}
          onPress={finish}
        />
      }>
      <View style={styles.area} onLayout={onLayout}>
        {scale > 0 && (
          <View style={[styles.field, { transform: [{ scale }] }]}>
            {TYPES.map((type) => {
              const selected = draft.propertyTypes.includes(type.key);
              return (
                <Pressable
                  key={type.key}
                  style={[styles.bubble, type.at, selected && styles.bubbleSelected]}
                  onPress={() => update({ propertyTypes: toggle(draft.propertyTypes, type.key) })}
                  accessibilityRole="checkbox"
                  accessibilityLabel={type.label}
                  accessibilityState={{ checked: selected }}>
                  <View style={styles.iconClip}>
                    <Image
                      source={type.icon}
                      style={{
                        position: 'absolute',
                        width: type.iconSize,
                        height: type.iconSize,
                        // Figma centres each illustration 0.5pt right and 0.5pt up.
                        left: (40 - type.iconSize) / 2 + 0.5,
                        top: (40 - type.iconSize) / 2 - 0.5,
                      }}
                    />
                  </View>
                  <Text style={[styles.label, selected && styles.labelSelected]}>{type.label}</Text>
                </Pressable>
              );
            })}
          </View>
        )}
      </View>
    </WizardScreen>
  );
}

const styles = StyleSheet.create({
  area: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  field: {
    width: FIELD.width,
    height: FIELD.height,
  },
  bubble: {
    position: 'absolute',
    width: BUBBLE,
    height: BUBBLE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Palette.borderSecondary,
    backgroundColor: Palette.bgPrimary,
  },
  bubbleSelected: {
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.17)',
    backgroundColor: Palette.brand,
    boxShadow: '0px 4px 15px 0px rgba(236, 104, 70, 0.4)',
  },
  iconClip: {
    width: 40,
    height: 40,
    overflow: 'hidden',
  },
  label: {
    ...Typography.textSmMedium,
    color: Palette.textTertiary,
  },
  labelSelected: {
    color: Palette.textWhite,
  },
});
