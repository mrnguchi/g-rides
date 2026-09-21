import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, fonts } from '../theme';

type BackButtonProps = {
  accessibilityLabel?: string;
  onPress?: () => void;
};

export function BackButton({
  accessibilityLabel = 'Go back',
  onPress,
}: BackButtonProps) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      hitSlop={12}
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Text style={styles.icon}>←</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    shadowColor: colors.primaryDark,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.14,
    shadowRadius: 4,
    elevation: 3,
  },
  icon: {
    color: colors.primaryDark,
    fontFamily: fonts.regular,
    fontSize: 19,
    fontWeight: '400',
    lineHeight: 21,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.96 }],
  },
});
