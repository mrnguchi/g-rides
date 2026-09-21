import { Image, StyleSheet } from 'react-native';

import { colors } from '../theme';

const locationIcon = require('../../assets/images/location (1).png');

type LocationIconProps = {
  size?: number;
};

export function LocationIcon({ size = 15 }: LocationIconProps) {
  return (
    <Image
      resizeMode="contain"
      source={locationIcon}
      style={[
        styles.icon,
        { height: size, width: size },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  icon: {
    tintColor: colors.primaryBrandBlue,
  },
});
