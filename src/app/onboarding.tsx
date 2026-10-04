import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState, type ComponentType, type ReactNode } from 'react';
import { StyleSheet, Text, useWindowDimensions, View, type LayoutChangeEvent } from 'react-native';
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  AiAssistantHero,
  ExploreHomesHero,
  HERO_FRAME,
  PickYourPlaceHero,
} from '@/components/onboarding/heroes';
import { PageDots } from '@/components/onboarding/page-dots';
import { PrimaryButton } from '@/components/primary-button';
import { Palette, Typography } from '@/constants/theme';

type Slide = {
  key: string;
  title: string;
  body: string;
  Hero: ComponentType;
};

const SLIDES: Slide[] = [
  {
    key: 'explore',
    title: 'Explore homes\nin all the places you love',
    body: 'Explore a wide range of properties tailored to your lifestyle and needs.',
    Hero: ExploreHomesHero,
  },
  {
    key: 'assistant',
    title: 'Finding your future home\nshouldn’t feel overwhelming',
    body: 'Search smarter, save better options, and find a home worth choosing.',
    Hero: AiAssistantHero,
  },
  {
    key: 'match',
    title: 'Your next chapter\nstarts with the right place',
    body: 'We make it easier to discover spaces that truly fit you.',
    Hero: PickYourPlaceHero,
  },
];

// Spacing from the kit's onboarding frames (Figma 4270:11244 and siblings).
const GUTTER = 16;
const GAP = 16;
const DOTS_HEIGHT = 5;
const BODY_HEIGHT = 48; // two lines of Text md
/** Heroes may grow a little on large phones, never more than this. */
const MAX_HERO_SCALE = 1.2;

export default function OnboardingScreen() {
  const { width } = useWindowDimensions();
  const progress = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler((event) => {
    progress.value = event.contentOffset.x / width;
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.pager}>
        <Animated.ScrollView
          horizontal
          pagingEnabled
          bounces={false}
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}>
          {SLIDES.map(({ key, title, body, Hero }) => (
            <View key={key} style={[styles.slide, { width }]}>
              <Text style={styles.title} accessibilityRole="header">
                {title}
              </Text>
              <FitToFrame>
                <Hero />
              </FitToFrame>
              <Text style={styles.body}>{body}</Text>
            </View>
          ))}
        </Animated.ScrollView>

        <View style={styles.dots} pointerEvents="none">
          <PageDots count={SLIDES.length} progress={progress} />
        </View>
      </View>

      <View style={styles.actions}>
        <PrimaryButton title="Get started" onPress={() => router.push('/sign-up')} />
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <Text
            style={styles.footerLink}
            onPress={() => router.push('/sign-in')}
            accessibilityRole="link">
            Sign in
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

/** Scales a fixed-size hero to fit the space left between the title and the dots. */
function FitToFrame({ children }: { children: ReactNode }) {
  const [scale, setScale] = useState(0);

  const onLayout = ({ nativeEvent }: LayoutChangeEvent) => {
    const { width, height } = nativeEvent.layout;
    setScale(
      Math.min(MAX_HERO_SCALE, width / HERO_FRAME.width, height / HERO_FRAME.height),
    );
  };

  return (
    <View style={styles.hero} onLayout={onLayout}>
      {scale > 0 && <View style={{ transform: [{ scale }] }}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.bgPrimary,
  },
  pager: {
    flex: 1,
  },
  slide: {
    flex: 1,
    paddingTop: 24,
    paddingHorizontal: GUTTER,
  },
  title: {
    ...Typography.headline,
    color: Palette.textPrimary,
    textAlign: 'center',
  },
  hero: {
    flex: 1,
    marginTop: GAP,
    marginBottom: GAP + DOTS_HEIGHT + GAP,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    ...Typography.textMdRegular,
    height: BODY_HEIGHT,
    color: Palette.textQuaternary,
    textAlign: 'center',
  },
  dots: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: BODY_HEIGHT + GAP,
  },
  actions: {
    paddingHorizontal: GUTTER,
    paddingTop: 24,
    paddingBottom: 8,
    gap: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  footerText: {
    ...Typography.textMdRegular,
    color: Palette.textQuaternary,
  },
  footerLink: {
    ...Typography.textMdMedium,
    color: Palette.brand,
  },
});
