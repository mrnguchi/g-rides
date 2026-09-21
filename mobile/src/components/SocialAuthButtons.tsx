import { Image, Pressable, StyleSheet, View } from 'react-native';

import { colors } from '../theme';

const googleIcon = require('../../assets/images/google-icon.png');
const appleIcon = require('../../assets/images/apple-icon.png');

type SocialAuthButtonsProps = {
  onApplePress?: () => void;
  onGooglePress?: () => void;
};

export function SocialAuthButtons({
  onApplePress,
  onGooglePress,
}: SocialAuthButtonsProps) {
  return (
    <View style={styles.container}>
      <Pressable
        accessibilityLabel="Continue with Google"
        accessibilityRole="button"
        onPress={onGooglePress}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <Image
          resizeMode="contain"
          source={googleIcon}
          style={styles.googleIcon}
        />
      </Pressable>

      <Pressable
        accessibilityLabel="Continue with Apple"
        accessibilityRole="button"
        onPress={onApplePress}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <Image
          resizeMode="contain"
          source={appleIcon}
          style={styles.appleIcon}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  button: {
    width: 42,
    height: 42,
    borderWidth: 1,
    borderColor: colors.borderGray,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  pressed: {
    opacity: 0.65,
    transform: [{ scale: 0.96 }],
  },
  googleIcon: {
    width: 24,
    height: 24,
  },
  appleIcon: {
    width: 20,
    height: 23,
  },
});
