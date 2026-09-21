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

import { BackButton } from '../components';
import { useScreenBackNavigation } from '../hooks/useScreenBackNavigation';
import { colors, fonts } from '../theme';

const onboardingImage = require('../../assets/images/onboarding-3.png');
const onboardingDecoration = require('../../assets/images/onboarding-deco.png');

type OnboardingThreeScreenProps = {
  onBack?: () => void;
  onFinish?: () => void;
  onSkip?: () => void;
};

export function OnboardingThreeScreen({
  onBack,
  onFinish,
  onSkip,
}: OnboardingThreeScreenProps) {
  const { height, width } = useWindowDimensions();
  const isCompactHeight = height < 750;
  const heroWidth = Math.min(width - 24, 370);
  const heroHeight = heroWidth * (1188 / 1324);
  const backGestureHandlers = useScreenBackNavigation(onBack);

  return (
    <SafeAreaView
      edges={['top', 'bottom']}
      style={styles.safeArea}
      {...backGestureHandlers}
    >
      <StatusBar style="dark" />

      <View style={styles.container}>
        <View style={[styles.header, isCompactHeight && styles.compactHeader]}>
          <BackButton
            accessibilityLabel="Return to the previous onboarding screen"
            onPress={onBack}
          />

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
            { height: heroHeight },
            isCompactHeight && styles.compactHeroContainer,
          ]}
        >
          <Image
            accessibilityLabel="A G-Rides customer with reliable cars, secure payments, and live tracking"
            resizeMode="contain"
            source={onboardingImage}
            style={{ width: heroWidth, height: heroHeight }}
          />

          <View pointerEvents="none" style={styles.decorations}>
            <View style={styles.upperLeftDot} />
            <View style={styles.lowerLeftDot} />
            <View style={styles.lowerRightDot} />
            <Image
              resizeMode="contain"
              source={onboardingDecoration}
              style={styles.decorationImage}
            />
          </View>
        </View>

        <View
          style={[
            styles.copyContainer,
            isCompactHeight && styles.compactCopyContainer,
          ]}
        >
          <Text style={styles.title}>Safe, Verified Rentals</Text>
          <Text
            style={[
              styles.description,
              isCompactHeight && styles.compactDescription,
            ]}
          >
            Reliable vehicles, secure payments, and live tracking designed to
            give you a safer and smoother rental experience.
          </Text>
        </View>

        <View style={styles.footer}>
          <View accessibilityLabel="Page 3 of 3" style={styles.pagination}>
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={styles.activeDot} />
          </View>

          <Pressable
            accessibilityLabel="Complete onboarding"
            accessibilityRole="button"
            onPress={onFinish}
            style={({ pressed }) => [
              styles.nextButton,
              pressed && styles.controlPressed,
            ]}
          >
            <Text style={styles.nextText}>Lets Go</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  decorations: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  upperLeftDot: {
    position: 'absolute',
    top: 0,
    left: '13%',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primaryBrandBlue,
  },
  lowerLeftDot: {
    position: 'absolute',
    bottom: -26,
    left: '12%',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.textSecondary,
  },
  lowerRightDot: {
    position: 'absolute',
    right: '12%',
    bottom: -2,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primaryBrandBlue,
  },
  decorationImage: {
    position: 'absolute',
    right: '14%',
    bottom: -30,
    width: 39,
    height: 37,
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
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryBrandBlue,
  },
  nextText: {
    color: colors.white,
    fontFamily: fonts.semiBold,
    fontSize: 11,
    fontWeight: '600',
  },
  controlPressed: {
    opacity: 0.78,
  },
});
