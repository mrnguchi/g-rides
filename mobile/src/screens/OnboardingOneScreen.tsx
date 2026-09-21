import { StatusBar } from 'expo-status-bar';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, fonts } from '../theme';

const onboardingImage = require('../../assets/images/onboarding-1.png');

type OnboardingOneScreenProps = {
  onNext?: () => void;
  onSkip?: () => void;
};

export function OnboardingOneScreen({
  onNext,
  onSkip,
}: OnboardingOneScreenProps) {
  const { height, width } = useWindowDimensions();
  const isCompactHeight = height < 750;
  const heroWidth = Math.min(width - 24, 370);
  const heroHeight = heroWidth * (297 / 332);

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <StatusBar style="dark" />

      <View style={styles.container}>
        <View style={[styles.header, isCompactHeight && styles.compactHeader]}>
          <Pressable
            accessibilityLabel="Skip onboarding"
            accessibilityRole="button"
            hitSlop={12}
            onPress={onSkip}
            style={({ pressed }) => [
              styles.skipButton,
              pressed && styles.controlPressed,
            ]}
          >
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        </View>

        <View
          style={[
            styles.heroContainer,
            isCompactHeight && styles.compactHeroContainer,
          ]}
        >
          <Image
            accessibilityLabel="A G-Rides car shown on a nearby vehicle map"
            resizeMode="contain"
            source={onboardingImage}
            style={{ width: heroWidth, height: heroHeight }}
          />
        </View>

        <View
          style={[
            styles.copyContainer,
            isCompactHeight && styles.compactCopyContainer,
          ]}
        >
          <Text style={styles.title}>Find cars near you</Text>
          <Text
            style={[
              styles.description,
              isCompactHeight && styles.compactDescription,
            ]}
          >
            Browse and rent trusted vehicles nearby with real time map discovery
            and flexible rental options.
          </Text>
        </View>

        <View style={styles.footer}>
          <View accessibilityLabel="Page 1 of 3" style={styles.pagination}>
            <View style={styles.activeDot} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>

          <Pressable
            accessibilityLabel="Next onboarding screen"
            accessibilityRole="button"
            onPress={onNext}
            style={({ pressed }) => [
              styles.nextButton,
              pressed && styles.controlPressed,
            ]}
          >
            <Text style={styles.nextText}>Next</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    height: 68,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  compactHeader: {
    height: 56,
  },
  skipButton: {
    minWidth: 44,
    borderRadius: 6,
    backgroundColor: colors.surfaceGray,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  skipText: {
    color: colors.primaryBrandBlue,
    fontFamily: fonts.semiBold,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  heroContainer: {
    alignItems: 'center',
    marginTop: 18,
  },
  compactHeroContainer: {
    marginTop: 8,
  },
  copyContainer: {
    alignItems: 'center',
    marginTop: 40,
    paddingHorizontal: 24,
  },
  compactCopyContainer: {
    marginTop: 18,
  },
  title: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 21,
    fontWeight: '700',
    textAlign: 'center',
  },
  description: {
    maxWidth: 320,
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 17,
    marginTop: 20,
    textAlign: 'center',
  },
  compactDescription: {
    marginTop: 14,
  },
  footer: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  activeDot: {
    width: 28,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primaryBrandBlue,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.borderGray,
  },
  nextButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryBrandBlue,
  },
  nextText: {
    color: colors.white,
    fontFamily: fonts.semiBold,
    fontSize: 12,
    fontWeight: '600',
  },
  controlPressed: {
    opacity: 0.78,
  },
});
