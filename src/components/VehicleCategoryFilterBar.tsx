import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';

import { colors, fonts } from '../theme';
import type { VehicleCategoryFilter } from '../types/map';

type VehicleCategoryFilterBarProps = {
  activeCategory: VehicleCategoryFilter;
  onCategoryChange: (category: VehicleCategoryFilter) => void;
};

const categories: VehicleCategoryFilter[] = [
  'All Cars',
  'Sedans',
  'SUVs',
  'Luxury',
];

const categoryIcons = {
  'All Cars': require('../../assets/images/car.png'),
  Sedans: require('../../assets/images/sedans.png'),
  SUVs: require('../../assets/images/SUVs.png'),
  Luxury: require('../../assets/images/luxury.png'),
};

export function VehicleCategoryFilterBar({
  activeCategory,
  onCategoryChange,
}: VehicleCategoryFilterBarProps) {
  return (
    <ScrollView
      contentContainerStyle={styles.categoryList}
      horizontal
      keyboardShouldPersistTaps="handled"
      showsHorizontalScrollIndicator={false}
      style={styles.scroller}
    >
      {categories.map((category) => {
        const active = category === activeCategory;

        return (
          <Pressable
            key={category}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => onCategoryChange(category)}
            style={({ pressed }) => [
              styles.categoryChip,
              active && styles.activeCategoryChip,
              pressed && styles.pressed,
            ]}
          >
            <Image
              resizeMode="contain"
              source={categoryIcons[category]}
              style={[
                styles.categoryIcon,
                { tintColor: active ? colors.white : colors.textPrimary },
              ]}
            />
            <Text
              style={[
                styles.categoryText,
                active && styles.activeCategoryText,
              ]}
            >
              {category}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroller: {
    flexGrow: 0,
  },
  categoryList: {
    gap: 7,
    paddingTop: 13,
    paddingRight: 8,
    paddingBottom: 8,
  },
  categoryChip: {
    height: 38,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#E8ECF2',
    borderRadius: 19,
    backgroundColor: colors.white,
    paddingHorizontal: 13,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  activeCategoryChip: {
    borderColor: colors.primaryBrandBlue,
    backgroundColor: colors.primaryBrandBlue,
  },
  categoryIcon: {
    width: 16,
    height: 16,
  },
  categoryText: {
    color: colors.textPrimary,
    fontFamily: fonts.medium,
    fontSize: 12,
    fontWeight: '500',
  },
  activeCategoryText: {
    color: colors.white,
  },
  pressed: {
    opacity: 0.72,
  },
});
