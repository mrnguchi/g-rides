import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { RoleCard } from '../components';
import { colors, fonts } from '../theme';
import type { UserRole } from '../types/user';

export type { UserRole } from '../types/user';

const brandMark = require('../../assets/images/splash-icon.png');
const renterImage = require('../../assets/images/role-1.png');
const ownerImage = require('../../assets/images/role-2.png');
const driverImage = require('../../assets/images/role-3.png');
const renterIcon = require('../../assets/images/user.png');
const ownerIcon = require('../../assets/images/car.png');
const driverIcon = require('../../assets/images/driver.png');

const FOOTER_HEIGHT = 70;
const NON_CARD_CONTENT_HEIGHT = 203;
const MIN_CARD_HEIGHT = 156;
const MAX_CARD_HEIGHT = 172;

type RoleSelectionScreenProps = {
  onContinue?: (roles: UserRole[]) => void;
};

const roleOptions = [
  {
    id: 'renter',
    title: 'Renter',
    description:
      'Browse and rent vehicles nearby with flexible booking options.',
    image: renterImage,
    icon: renterIcon,
    imagePosition: 'left',
  },
  {
    id: 'owner',
    title: 'Car Owner',
    description: 'List your vehicles, manage bookings, and earn from rentals.',
    image: ownerImage,
    icon: ownerIcon,
    imagePosition: 'right',
  },
  {
    id: 'driver',
    title: 'Driver',
    description: 'Provide chauffeur services and accept driving requests.',
    image: driverImage,
    icon: driverIcon,
    imagePosition: 'left',
  },
] as const;

export function RoleSelectionScreen({
  onContinue,
}: RoleSelectionScreenProps) {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [selectedRoles, setSelectedRoles] = useState<Set<UserRole>>(
    () => new Set(['renter']),
  );

  const usableHeight = height - insets.top - insets.bottom;
  const availableCardHeight =
    (usableHeight - FOOTER_HEIGHT - NON_CARD_CONTENT_HEIGHT) / 3;
  const roleCardHeight = Math.min(
    MAX_CARD_HEIGHT,
    Math.max(MIN_CARD_HEIGHT, availableCardHeight),
  );

  const toggleRole = (role: UserRole) => {
    setSelectedRoles((currentRoles) => {
      const nextRoles = new Set(currentRoles);

      if (nextRoles.has(role)) {
        nextRoles.delete(role);
      } else {
        nextRoles.add(role);
      }

      return nextRoles;
    });
  };

  const handleContinue = () => {
    if (selectedRoles.size > 0) {
      onContinue?.([...selectedRoles]);
    }
  };

  const isContinueDisabled = selectedRoles.size === 0;

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <StatusBar style="dark" />

      <View style={styles.screen}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          style={styles.scrollView}
        >
          <View style={styles.headingContainer}>
            <Text style={styles.heading}>How would you like to</Text>
            <View style={styles.brandHeading}>
              <Text style={styles.heading}>use</Text>
              <Image source={brandMark} style={styles.brandMark} />
              <Text style={styles.heading}>-rides?</Text>
            </View>
            <Text style={styles.subtitle}>
              choose one or more roles to personalize{`\n`}your experience
            </Text>
          </View>

          <View style={styles.cards}>
            {roleOptions.map((role) => (
              <RoleCard
              description={role.description}
              height={roleCardHeight}
                icon={role.icon}
                image={role.image}
                imagePosition={role.imagePosition}
                key={role.id}
                onPress={() => toggleRole(role.id)}
                selected={selectedRoles.has(role.id)}
                title={role.title}
              />
            ))}
          </View>

          <View style={styles.note}>
            <View style={styles.noteIcon}>
              <Text style={styles.noteIconText}>!</Text>
            </View>
            <Text style={styles.noteText}>
              You can select multiple roles and switch between them in your
              profile
            </Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: isContinueDisabled }}
            disabled={isContinueDisabled}
            onPress={handleContinue}
            style={({ pressed }) => [
              styles.continueButton,
              isContinueDisabled && styles.continueButtonDisabled,
              pressed && styles.continueButtonPressed,
            ]}
          >
            <Text style={styles.continueText}>Continue</Text>
            <Text style={styles.continueArrow}>→</Text>
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
  screen: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headingContainer: {
    alignItems: 'center',
  },
  heading: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 23,
    fontWeight: '700',
    lineHeight: 26,
    textAlign: 'center',
  },
  brandHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandMark: {
    width: 34,
    height: 29,
    marginHorizontal: -2,
    resizeMode: 'contain',
  },
  subtitle: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 19,
    marginTop: 8,
    textAlign: 'center',
  },
  cards: {
    gap: 12,
    marginTop: 18,
  },
  note: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 28,
    paddingHorizontal: 8,
  },
  noteIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryBrandBlue,
    marginRight: 12,
  },
  noteIconText: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 14,
  },
  noteText: {
    flex: 1,
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 11,
    lineHeight: 14,
  },
  continueButton: {
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryBrandBlue,
  },
  continueButtonDisabled: {
    opacity: 0.45,
  },
  continueButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.99 }],
  },
  continueText: {
    color: colors.white,
    fontFamily: fonts.medium,
    fontSize: 16,
    fontWeight: '500',
  },
  continueArrow: {
    position: 'absolute',
    right: 22,
    color: colors.white,
    fontFamily: fonts.regular,
    fontSize: 25,
    fontWeight: '300',
  },
  footer: {
    backgroundColor: colors.white,
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 8,
  },
});
