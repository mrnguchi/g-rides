import Ionicons from '@expo/vector-icons/Ionicons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, moneyText } from '../theme';
import type { Vehicle } from '../types/map';
import { LocationIcon } from './LocationIcon';

type VehicleCardProps = {
  favorite?: boolean;
  onPress?: () => void;
  onToggleFavorite?: () => void;
  selected?: boolean;
  variant?: 'featured' | 'recommended';
  vehicle: Vehicle;
};

export function VehicleCard({
  favorite = false,
  onPress,
  onToggleFavorite,
  selected = false,
  variant = 'featured',
  vehicle,
}: VehicleCardProps) {
  const isRecommended = variant === 'recommended';
  const formattedPrice = vehicle.pricePerDayXaf.toLocaleString('en-US');

  return (
    <Pressable
      accessibilityLabel={`${vehicle.brand} ${vehicle.model}, ${formattedPrice} XAF per day`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        isRecommended ? styles.recommendedCard : styles.featuredCard,
        selected && styles.selectedCard,
        pressed && styles.pressed,
      ]}
    >
      <View
        style={
          isRecommended
            ? styles.recommendedImageContainer
            : styles.featuredImageContainer
        }
      >
        <Image
          resizeMode="cover"
          source={vehicle.image}
          style={styles.image}
        />

        {!isRecommended && (
          <Pressable
            accessibilityLabel={
              favorite ? 'Remove from favorites' : 'Add to favorites'
            }
            accessibilityRole="button"
            hitSlop={8}
            onPress={(event) => {
              event.stopPropagation();
              onToggleFavorite?.();
            }}
            style={({ pressed }) => [
              styles.favoriteButton,
              pressed && styles.favoritePressed,
            ]}
          >
            <Ionicons
              color={colors.primaryBrandBlue}
              name={favorite ? 'bookmark' : 'bookmark-outline'}
              size={19}
            />
          </Pressable>
        )}
      </View>

      <View
        style={[
          styles.details,
          isRecommended && styles.recommendedDetails,
        ]}
      >
        <View style={styles.metaRow}>
          <Text numberOfLines={1} style={styles.brand}>
            {vehicle.brand}
          </Text>
          <View style={styles.rating}>
            <Ionicons color={colors.warning} name="star" size={14} />
            <Text style={styles.ratingText}>{vehicle.rating.toFixed(1)}</Text>
          </View>
        </View>

        <Text
          numberOfLines={1}
          style={[
            styles.model,
            isRecommended && styles.recommendedModel,
          ]}
        >
          {vehicle.model}
        </Text>

        <View style={styles.distanceRow}>
          <LocationIcon size={14} />
          <Text style={styles.distance}>{vehicle.distanceKm} km away</Text>
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.price}>{formattedPrice}XAF</Text>
          <Text style={styles.perDay}>/day</Text>
          <Text
            style={[
              styles.availability,
              !vehicle.available && styles.unavailable,
            ]}
          >
            {vehicle.available ? 'Available' : 'Unavailable'}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 15,
    backgroundColor: colors.white,
    shadowColor: colors.primaryDark,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.11,
    shadowRadius: 10,
    elevation: 5,
  },
  featuredCard: {
    width: 198,
    height: 270,
    marginRight: 14,
    marginVertical: 4,
  },
  recommendedCard: {
    height: 144,
    flexDirection: 'row',
    marginBottom: 18,
  },
  selectedCard: {
    shadowColor: colors.primaryBrandBlue,
    shadowOpacity: 0.24,
    shadowRadius: 13,
    elevation: 8,
  },
  featuredImageContainer: {
    height: 154,
    overflow: 'hidden',
    borderRadius: 11,
    marginTop: 7,
    marginHorizontal: 7,
  },
  recommendedImageContainer: {
    width: '44%',
    height: 130,
    overflow: 'hidden',
    borderRadius: 10,
    marginTop: 7,
    marginBottom: 7,
    marginLeft: 7,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    shadowColor: colors.primaryDark,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  favoritePressed: {
    opacity: 0.7,
    transform: [{ scale: 0.93 }],
  },
  details: {
    flex: 1,
    paddingHorizontal: 9,
    paddingTop: 9,
    paddingBottom: 10,
  },
  recommendedDetails: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    flex: 1,
    color: colors.primaryBrandBlue,
    fontFamily: fonts.medium,
    fontSize: 11,
    fontWeight: '500',
    marginRight: 4,
    textTransform: 'capitalize',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    color: colors.textPrimary,
    fontFamily: fonts.medium,
    fontSize: 11,
    fontWeight: '500',
  },
  model: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  recommendedModel: {
    fontSize: 14,
    marginTop: 14,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 8,
  },
  distance: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 11,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 'auto',
  },
  price: {
    color: colors.primaryBrandBlue,
    fontSize: 15,
     ...moneyText },
  perDay: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 10,
    marginLeft: 2,
  },
  availability: {
    color: colors.success,
    fontFamily: fonts.medium,
    fontSize: 9.5,
    fontWeight: '500',
    marginLeft: 'auto',
  },
  unavailable: {
    color: colors.error,
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }],
  },
});
