import type { ImageSourcePropType } from 'react-native';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '../theme';

type RoleCardProps = {
  description: string;
  height?: number;
  icon: ImageSourcePropType;
  image: ImageSourcePropType;
  imagePosition?: 'left' | 'right';
  onPress: () => void;
  selected: boolean;
  title: string;
};

export function RoleCard({
  description,
  height = 156,
  icon,
  image,
  imagePosition = 'left',
  onPress,
  selected,
  title,
}: RoleCardProps) {
  const imageElement = (
    <View
      style={[
        styles.imageContainer,
        imagePosition === 'left'
          ? styles.leftImageContainer
          : styles.rightImageContainer,
      ]}
    >
      <Image resizeMode="cover" source={image} style={styles.image} />
    </View>
  );

  return (
    <Pressable
      accessibilityLabel={`${title}: ${description}`}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { height },
        pressed && styles.pressed,
      ]}
    >
      {imagePosition === 'left' && imageElement}

      <View style={styles.content}>
        <View style={styles.iconBadge}>
          <Image source={icon} style={styles.icon} />
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>

        <View
          style={[
            styles.radio,
            imagePosition === 'left' ? styles.radioRight : styles.radioLeft,
          ]}
        >
          {selected && <View style={styles.radioSelected} />}
        </View>
      </View>

      {imagePosition === 'right' && imageElement}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 14,
    backgroundColor: colors.white,
    shadowColor: colors.primaryDark,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },
  imageContainer: {
    width: '45%',
    height: '100%',
    overflow: 'hidden',
  },
  leftImageContainer: {
    borderTopLeftRadius: 13,
    borderBottomLeftRadius: 13,
  },
  rightImageContainer: {
    borderTopRightRadius: 13,
    borderBottomRightRadius: 13,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    paddingTop: 12,
    paddingHorizontal: 12,
  },
  iconBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryBrandBlue,
  },
  icon: {
    width: 18,
    height: 18,
    resizeMode: 'contain',
    tintColor: colors.white,
  },
  title: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 15,
    fontWeight: '700',
    marginTop: 7,
  },
  description: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 15,
    marginTop: 4,
  },
  radio: {
    position: 'absolute',
    bottom: 8,
    width: 18,
    height: 18,
    borderWidth: 1.5,
    borderColor: colors.primaryBrandBlue,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  radioLeft: {
    left: 12,
  },
  radioRight: {
    right: 12,
  },
  radioSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primaryBrandBlue,
  },
});
