import { StyleSheet, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';

import { Palette } from '@/constants/theme';

const DOT = 5;
const ACTIVE_WIDTH = 32;

type PageDotsProps = {
  count: number;
  /** Scroll position measured in pages (0 = first page). */
  progress: SharedValue<number>;
};

export function PageDots({ count, progress }: PageDotsProps) {
  return (
    <View style={styles.row} importantForAccessibility="no-hide-descendants">
      {Array.from({ length: count }, (_, i) => (
        <Dot key={i} index={i} progress={progress} />
      ))}
    </View>
  );
}

function Dot({ index, progress }: { index: number; progress: SharedValue<number> }) {
  const animatedStyle = useAnimatedStyle(() => {
    const input = [index - 1, index, index + 1];
    return {
      width: interpolate(progress.value, input, [DOT, ACTIVE_WIDTH, DOT], Extrapolation.CLAMP),
      backgroundColor: interpolateColor(progress.value, input, [
        Palette.fgSenary,
        Palette.brand,
        Palette.fgSenary,
      ]),
    };
  });

  return <Animated.View style={[styles.dot, animatedStyle]} />;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  dot: {
    height: DOT,
    borderRadius: DOT / 2,
  },
});
