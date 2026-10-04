import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/components/primary-button';
import { toggle, useProfileDraft } from '@/components/profile-setup/profile-draft';
import { WizardScreen } from '@/components/profile-setup/wizard-screen';
import { Palette, Radius, Typography } from '@/constants/theme';
import type { Goal } from '@/services/profile';

const GOALS: { key: Goal; title: string; description: string }[] = [
  { key: 'rent', title: 'Rent a place', description: 'Find a home for short or long stays' },
  { key: 'buy', title: 'Buy property', description: 'Explore homes and properties to own' },
  { key: 'invest', title: 'Investment', description: 'Discover properties with growth potential' },
  { key: 'commercial', title: 'Commercial', description: 'Find spaces for your business needs' },
];

// Kit screens 23–25: Set up profile - goals (Figma 4331:9371). Progress value from Figma.
export default function GoalsScreen() {
  const { draft, update } = useProfileDraft();
  const next = () => router.push('/profile-setup/property-types');

  return (
    <WizardScreen
      progress={0.225}
      onSkip={next}
      title="What’s your goal?"
      subtitle="We'll personalize your experience. Pick all that apply."
      footer={
        <PrimaryButton
          title="Continue"
          size="md"
          disabled={draft.goals.length === 0}
          onPress={next}
        />
      }>
      <View style={styles.options}>
        {GOALS.map((goal) => {
          const selected = draft.goals.includes(goal.key);
          return (
            <Pressable
              key={goal.key}
              style={[styles.option, selected && styles.optionSelected]}
              onPress={() => update({ goals: toggle(draft.goals, goal.key) })}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: selected }}>
              <Image
                source={
                  selected
                    ? require('@/assets/icons/checkbox-md-checked.svg')
                    : require('@/assets/icons/checkbox-md-unchecked.svg')
                }
                style={styles.checkbox}
              />
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>{goal.title}</Text>
                <Text style={styles.optionDescription}>{goal.description}</Text>
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
    alignItems: 'center',
    gap: 16,
    // 16pt in Figma includes the 1pt inside stroke.
    padding: 15,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Palette.borderSecondary,
    backgroundColor: Palette.bgPrimary,
  },
  optionSelected: {
    borderColor: Palette.borderBrand,
  },
  checkbox: {
    width: 20,
    height: 20,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    ...Typography.textMdMedium,
    color: Palette.textPrimary,
  },
  optionDescription: {
    ...Typography.textXsRegular,
    color: Palette.textQuaternary,
  },
});
