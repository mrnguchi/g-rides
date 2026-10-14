import type { ImageSourcePropType } from 'react-native';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '../theme';
import Ionicons from '@expo/vector-icons/Ionicons';

type RoleCardProps = {
  description: string;
  height?: number;
  icon: ImageSourcePropType;
  image: ImageSourcePropType;
  imagePosition?: 'left' | 'right';
  onPress: () => void;
  selected: boolean;
  title: string;
  expanded?: boolean;
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
  expanded = false,
}: RoleCardProps) {
  if (expanded) return <Pressable accessibilityRole="checkbox" accessibilityLabel={`${title}: ${description}`} accessibilityState={{ checked: selected }} onPress={onPress} style={({ pressed }) => [expandedStyles.card, { minHeight: height }, pressed && styles.pressed]}>
    <View style={expandedStyles.artwork}><Image source={image} resizeMode="contain" style={expandedStyles.image} /></View>
    <View style={expandedStyles.content}>
      <View style={expandedStyles.titleRow}><View style={styles.iconBadge}><Image source={icon} style={styles.icon} /></View><Text style={expandedStyles.title}>{title}</Text></View>
      <Text style={expandedStyles.description}>{description}</Text>
      <View style={[expandedStyles.selection, selected && expandedStyles.selected]}><Ionicons name={selected ? 'checkmark-circle' : 'add-circle-outline'} size={22} color={colors.primaryBrandBlue} /><Text style={expandedStyles.selectionText}>{selected ? 'Selected' : 'Select this role'}</Text></View>
    </View>
  </Pressable>;
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

const expandedStyles = StyleSheet.create({
  card: { backgroundColor: colors.white, borderRadius: 28, shadowColor: colors.primaryDark, shadowOffset: { width: 0, height: 7 }, shadowOpacity: 0.08, shadowRadius: 18, elevation: 4 },
  artwork: { height: 215, borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden', backgroundColor: '#F4F6FC', paddingTop: 12 },
  image: { width: '100%', height: '100%' },
  content: { padding: 22, gap: 14, flexGrow: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  title: { flex: 1, fontFamily: fonts.semiBold, fontSize: 22, lineHeight: 28, color: colors.textPrimary },
  description: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 23, color: colors.textSecondary },
  selection: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, minHeight: 46, paddingHorizontal: 12, borderRadius: 23, borderWidth: 1, borderColor: '#DCE5FA', marginTop: 'auto' },
  selected: { backgroundColor: '#EDF2FF', borderColor: '#EDF2FF' },
  selectionText: { fontFamily: fonts.medium, fontSize: 14, color: colors.primaryBrandBlue },
});
