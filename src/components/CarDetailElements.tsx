import Ionicons from '@expo/vector-icons/Ionicons';
import {
  Image,
  type ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors, fonts } from '../theme';

type IconLabelProps = {
  icon: ImageSourcePropType;
  label: string;
};

export function DetailSpecChip({ icon, label }: IconLabelProps) {
  return (
    <View style={styles.specChip}>
      <View style={styles.specIconContainer}>
        <Image source={icon} style={styles.specIcon} />
      </View>
      <Text numberOfLines={1} style={styles.specLabel}>
        {label}
      </Text>
    </View>
  );
}

type RentalInfoCardProps = IconLabelProps & {
  helper: string;
  style?: StyleProp<ViewStyle>;
  value: string;
};

export function RentalInfoCard({
  helper,
  icon,
  label,
  style,
  value,
}: RentalInfoCardProps) {
  return (
    <View style={[styles.infoCard, style]}>
      <View style={styles.infoIconContainer}>
        <Image source={icon} style={styles.infoIcon} />
      </View>
      <View style={styles.infoTextContainer}>
        <Text numberOfLines={1} style={styles.infoLabel}>
          {label}
        </Text>
        <Text numberOfLines={1} style={styles.infoValue}>
          {value}
        </Text>
        <Text numberOfLines={1} style={styles.infoHelper}>
          {helper}
        </Text>
      </View>
    </View>
  );
}

type ComfortFeatureTagProps = IconLabelProps & {
  style?: StyleProp<ViewStyle>;
};

export function ComfortFeatureTag({
  icon,
  label,
  style,
}: ComfortFeatureTagProps) {
  return (
    <View style={[styles.comfortTag, style]}>
      <Image source={icon} style={styles.comfortIcon} />
      <Text
        adjustsFontSizeToFit
        minimumFontScale={0.82}
        numberOfLines={1}
        style={styles.comfortLabel}
      >
        {label}
      </Text>
    </View>
  );
}

type RentalPolicyCardProps = IconLabelProps & {
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export function RentalPolicyCard({
  icon,
  label,
  onPress,
  style,
}: RentalPolicyCardProps) {
  return (
    <Pressable
      accessibilityLabel={`View ${label}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.policyCard,
        style,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.policyIconContainer}>
        <Image source={icon} style={styles.policyIcon} />
      </View>
      <Text numberOfLines={2} style={styles.policyLabel}>
        {label}
      </Text>
      <Ionicons
        color={colors.primaryBrandBlue}
        name="chevron-forward"
        size={14}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  specChip: {
    height: 46,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.borderGray,
    borderRadius: 22,
    backgroundColor: colors.white,
    paddingHorizontal: 7,
  },
  specIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAF2FF',
  },
  specIcon: {
    width: 19,
    height: 19,
    resizeMode: 'contain',
    tintColor: colors.primaryBrandBlue,
  },
  specLabel: {
    flexShrink: 1,
    color: colors.primaryBrandBlue,
    fontFamily: fonts.medium,
    fontSize: 12,
    fontWeight: '500',
  },
  infoCard: {
    minWidth: 0,
    minHeight: 76,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 9,
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 10,
    shadowColor: colors.primaryDark,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 7,
    elevation: 3,
  },
  infoLabel: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 10,
    fontWeight: '500',
  },
  infoIconContainer: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAF2FF',
  },
  infoIcon: {
    width: 19,
    height: 19,
    resizeMode: 'contain',
    tintColor: colors.primaryBrandBlue,
  },
  infoTextContainer: {
    minWidth: 0,
    flex: 1,
  },
  infoValue: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  infoHelper: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 9,
    marginTop: 2,
  },
  comfortTag: {
    minWidth: 0,
    minHeight: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 6,
    backgroundColor: '#EAF2FF',
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  comfortIcon: {
    width: 13,
    height: 13,
    resizeMode: 'contain',
    tintColor: colors.primaryBrandBlue,
  },
  comfortLabel: {
    minWidth: 0,
    flexShrink: 1,
    color: colors.primaryBrandBlue,
    fontFamily: fonts.medium,
    fontSize: 10,
    fontWeight: '500',
  },
  policyCard: {
    minWidth: 0,
    minHeight: 68,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    borderRadius: 9,
    backgroundColor: colors.white,
    paddingHorizontal: 11,
    shadowColor: colors.primaryDark,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 7,
    elevation: 3,
  },
  policyIconContainer: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAF2FF',
  },
  policyIcon: {
    width: 18,
    height: 18,
    resizeMode: 'contain',
    tintColor: colors.primaryBrandBlue,
  },
  policyLabel: {
    minWidth: 0,
    flex: 1,
    color: colors.textPrimary,
    fontFamily: fonts.medium,
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 14,
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
  },
});
