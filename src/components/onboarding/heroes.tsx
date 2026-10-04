import { Image, type ImageSource, type ImageStyle } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { BrandName, FontFamily, Palette, Radius, Typography } from '@/constants/theme';

/**
 * Onboarding hero illustrations. Each is laid out at the kit's fixed 343x409 frame
 * (Figma "Mockup Container") and scaled to fit by the onboarding screen.
 */
export const HERO_FRAME = { width: 343, height: 409 } as const;

// ---------------------------------------------------------------------------------------
// Slide 1 — three tilted photo cards (Figma 4270:11562)
// ---------------------------------------------------------------------------------------

const CARD = { width: 160, height: 220, border: 5 };

type PhotoCardProps = {
  /** Card centre in frame coordinates. */
  center: { x: number; y: number };
  rotate: string;
  source: ImageSource;
  /** Photo rect inside the card's border, as positioned in Figma. */
  photo: ImageStyle;
};

function PhotoCard({ center, rotate, source, photo }: PhotoCardProps) {
  return (
    <View
      style={[
        styles.cardShadow,
        { left: center.x - CARD.width / 2, top: center.y - CARD.height / 2, transform: [{ rotate }] },
      ]}>
      <View style={styles.card}>
        <Image source={source} style={[styles.absolute, photo]} contentFit="cover" />
      </View>
    </View>
  );
}

export function ExploreHomesHero() {
  return (
    <View style={styles.frame}>
      <PhotoCard
        center={{ x: 248.5, y: 119.1 }}
        rotate="8deg"
        source={require('@/assets/images/onboarding/house-white-modern.jpg')}
        photo={{ left: -13.63, top: -26, width: 195.45, height: 262.58 }}
      />
      <PhotoCard
        center={{ x: 89.3, y: 147.6 }}
        rotate="-5deg"
        source={require('@/assets/images/onboarding/house-palms.jpg')}
        photo={{ left: -27.27, top: -29.49, width: 181.88, height: 242.5 }}
      />
      <PhotoCard
        center={{ x: 181.3, y: 300.7 }}
        rotate="-2deg"
        source={require('@/assets/images/onboarding/house-pool.jpg')}
        // Figma counter-rotates this photo by +2deg so it sits level inside the tilted card.
        photo={{ left: -106.62, top: -247.71, width: 421, height: 612, transform: [{ rotate: '2deg' }] }}
      />
    </View>
  );
}

// ---------------------------------------------------------------------------------------
// Slide 2 — phone showing the AI assistant (Figma 4270:11520)
// ---------------------------------------------------------------------------------------

const PHONE = { left: 40, top: 0, width: 263, height: 538.4 };
const SCREEN = { left: 50.66, top: 9.41, width: 241.95, height: 519.8 };

export function AiAssistantHero() {
  return (
    <View style={[styles.frame, styles.clip]}>
      <Image
        source={require('@/assets/images/onboarding/iphone-frame.png')}
        style={[styles.absolute, PHONE]}
        contentFit="fill"
      />
      <View style={[styles.absolute, styles.screen, SCREEN]}>
        <Image
          source={require('@/assets/images/onboarding/ai-assistant-screen.png')}
          style={StyleSheet.absoluteFill}
          contentFit="fill"
        />
        {/* The kit's screen art says "Livana"; cover that one label with live text. */}
        <View style={styles.assistantNamePatch}>
          <Text style={styles.assistantName} numberOfLines={1}>
            {BrandName} AI Assistant
          </Text>
        </View>
        <View style={styles.dynamicIsland} />
      </View>

      <LinearGradient
        colors={[Palette.bgPrimary, Palette.bgPrimary, 'rgba(255,255,255,0.81)', 'rgba(255,255,255,0)']}
        locations={[0, 0.648, 0.739, 1]}
        start={{ x: 0, y: 1 }}
        end={{ x: 0, y: 0 }}
        style={styles.bottomFade}
        pointerEvents="none"
      />

      <SuggestionChip label="Best areas for families" style={{ bottom: 65 }} />
      <SuggestionChip label="Apartments under KES 50k/month" style={{ top: 360 }} />
    </View>
  );
}

function SuggestionChip({ label, style }: { label: string; style: ViewStyle }) {
  return (
    <View style={[styles.chipRow, style]}>
      <View style={styles.chip}>
        <Image source={require('@/assets/images/onboarding/sparkle.svg')} style={styles.sparkle} />
        <Text style={styles.chipLabel}>{label}</Text>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------------------
// Slide 3 — photo grid with picked favourites (Figma 4348:9943)
// ---------------------------------------------------------------------------------------

type GridTile = {
  frame: { left: number; top: number; height: number };
  source: ImageSource;
  photo: ImageStyle;
  picked?: boolean;
};

const TILE_WIDTH = 109;
const TILE_INNER_WIDTH = TILE_WIDTH - 4;

/** Centres a photo of the given size horizontally (and optionally vertically) in a tile. */
const centered = (width: number, height: number, tileHeight?: number): ImageStyle => ({
  width,
  height,
  left: (TILE_INNER_WIDTH - width) / 2,
  top: tileHeight === undefined ? -2 : (tileHeight - 4 - height) / 2,
});

const GRID: GridTile[] = [
  {
    frame: { left: 0, top: 0, height: 130 },
    source: require('@/assets/images/onboarding/grid-1.jpg'),
    photo: centered(151, 188, 130),
  },
  {
    frame: { left: 0, top: 138, height: 140 },
    source: require('@/assets/images/onboarding/house-palms.jpg'),
    photo: centered(181.88, 242.5, 140),
    picked: true,
  },
  {
    frame: { left: 0, top: 286, height: 175 },
    source: require('@/assets/images/onboarding/grid-3.jpg'),
    photo: { left: -2, top: -2, width: 109, height: 163 },
  },
  {
    frame: { left: 117, top: 0, height: 163 },
    source: require('@/assets/images/onboarding/grid-4.jpg'),
    photo: centered(193, 241, 163),
  },
  {
    frame: { left: 117, top: 171, height: 142 },
    source: require('@/assets/images/onboarding/grid-5.jpg'),
    photo: centered(121, 151),
    picked: true,
  },
  {
    frame: { left: 117, top: 321, height: 140 },
    source: require('@/assets/images/onboarding/grid-6.jpg'),
    photo: centered(210, 140),
  },
  {
    frame: { left: 234, top: 0, height: 175 },
    source: require('@/assets/images/onboarding/house-white-modern.jpg'),
    photo: { left: -2, top: -2, width: 109, height: 175 },
    picked: true,
  },
  {
    frame: { left: 234, top: 183, height: 140 },
    source: require('@/assets/images/onboarding/grid-8.jpg'),
    photo: { left: -2, top: -2, width: 109, height: 140, borderRadius: 10 },
  },
  {
    frame: { left: 234, top: 331, height: 175 },
    source: require('@/assets/images/onboarding/grid-9.jpg'),
    photo: centered(117, 175),
  },
];

export function PickYourPlaceHero() {
  return (
    <View style={[styles.frame, styles.clip]}>
      {GRID.map((tile, i) => (
        <View
          key={i}
          style={[styles.tile, tile.frame, tile.picked ? styles.tilePicked : styles.tileFaded]}>
          <Image source={tile.source} style={[styles.absolute, tile.photo]} contentFit="cover" />
          {tile.picked && (
            <Image
              source={require('@/assets/images/onboarding/check-circle.svg')}
              style={styles.check}
            />
          )}
        </View>
      ))}
      <LinearGradient
        colors={[Palette.bgPrimary, 'rgba(255,255,255,0)']}
        start={{ x: 0, y: 1 }}
        end={{ x: 0, y: 0 }}
        style={styles.bottomFade}
        pointerEvents="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: HERO_FRAME.width,
    height: HERO_FRAME.height,
  },
  clip: {
    overflow: 'hidden',
  },
  absolute: {
    position: 'absolute',
  },
  cardShadow: {
    position: 'absolute',
    width: CARD.width,
    height: CARD.height,
    borderRadius: Radius.lg,
    boxShadow: '0px 4px 30px 0px rgba(0, 0, 0, 0.1)',
  },
  card: {
    flex: 1,
    borderRadius: Radius.lg,
    borderWidth: CARD.border,
    borderColor: Palette.bgPrimary,
    backgroundColor: Palette.bgPrimary,
    overflow: 'hidden',
  },
  screen: {
    borderRadius: 36,
    overflow: 'hidden',
  },
  assistantNamePatch: {
    position: 'absolute',
    left: 74,
    top: 38,
    width: 110,
    height: 14,
    justifyContent: 'center',
    backgroundColor: Palette.bgPrimary,
  },
  assistantName: {
    fontFamily: FontFamily.medium,
    fontSize: 8.5,
    letterSpacing: 8.5 * -0.03,
    color: Palette.textPrimary,
  },
  dynamicIsland: {
    position: 'absolute',
    left: 82,
    top: 7,
    width: 76,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#000000',
  },
  bottomFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 97,
  },
  chipRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  chip: {
    minWidth: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    // Figma's 12/6 padding includes the 1pt inside stroke.
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Palette.brandBorderSoft,
    backgroundColor: Palette.bgPrimary,
    boxShadow: '0px 1px 30px 0px rgba(0, 0, 0, 0.08)',
  },
  sparkle: {
    width: 16,
    height: 16,
  },
  chipLabel: {
    ...Typography.textSmMedium,
    color: Palette.textSecondary,
  },
  tile: {
    position: 'absolute',
    width: TILE_WIDTH,
    borderRadius: Radius.md,
    borderWidth: 2,
    overflow: 'hidden',
  },
  tileFaded: {
    borderColor: Palette.bgPrimary,
    opacity: 0.4,
  },
  tilePicked: {
    borderColor: Palette.brand,
    boxShadow: '0px 4px 30px 0px rgba(236, 104, 70, 0.08)',
  },
  check: {
    position: 'absolute',
    left: 79,
    top: 2,
    width: 24,
    height: 24,
  },
});
