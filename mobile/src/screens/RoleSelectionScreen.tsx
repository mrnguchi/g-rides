import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
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
  const { height, width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [selectedRoles, setSelectedRoles] = useState<Set<UserRole>>(
    () => new Set(['renter']),
  );

  const carousel = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  const cardWidth = Math.min(440, width - 64);
  const pageWidth = cardWidth + 16;
  const roleCardHeight = Math.min(460, Math.max(390, (height - insets.top - insets.bottom) * 0.56));
  const goToRole = (index: number) => {
    activeIndexRef.current = index;
    setActiveIndex(index);
    carousel.current?.scrollTo({ x: index * pageWidth, animated: true });
  };
  useEffect(() => {
    carousel.current?.scrollTo({ x: activeIndexRef.current * pageWidth, animated: false });
  }, [pageWidth]);

  const selectRole = (role: UserRole) => {
    setSelectedRoles(new Set([role]));
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
              Choose a role to personalize your experience.
            </Text>
          </View>

          <ScrollView
            ref={carousel}
            horizontal
            style={{ flexGrow: 0 }}
            showsHorizontalScrollIndicator={false}
            decelerationRate="fast"
            snapToInterval={pageWidth}
            disableIntervalMomentum
            directionalLockEnabled
            contentContainerStyle={[styles.cards, { paddingHorizontal: (width - cardWidth) / 2 }]}
            onMomentumScrollEnd={(event) => {
              const index = Math.max(0, Math.min(roleOptions.length - 1, Math.round(event.nativeEvent.contentOffset.x / pageWidth)));
              activeIndexRef.current = index;
              setActiveIndex(index);
            }}
          >
            {roleOptions.map((role) => (
              <View key={role.id} style={{ width: cardWidth }}>
              <RoleCard
                expanded
                description={role.description}
                height={roleCardHeight}
                icon={role.icon}
                image={role.image}
                imagePosition={role.imagePosition}
                key={role.id}
                onPress={() => selectRole(role.id)}
                selected={selectedRoles.has(role.id)}
                title={role.title}
              />
              </View>
            ))}
          </ScrollView>
          <View style={styles.pagination}>
            {roleOptions.map((role, index) => (
              <Pressable
                key={role.id}
                accessibilityRole="button"
                accessibilityLabel={`Show ${role.title}, ${index + 1} of 3`}
                accessibilityState={{ selected: activeIndex === index }}
                onPress={() => goToRole(index)}
                style={styles.dotTarget}
              >
                <View style={[styles.dot, activeIndex === index && styles.activeDot]} />
              </Pressable>
            ))}
          </View>
          <Text style={styles.pageLabel}>{activeIndex + 1} of 3 · Swipe to explore roles</Text>

          <View style={styles.note}>
            <View style={styles.noteIcon}>
              <Text style={styles.noteIconText}>!</Text>
            </View>
            <Text style={styles.noteText}>
              Choose one role to get started. You can switch roles later from your profile.
            </Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Text style={styles.selectionSummary}>
            {selectedRoles.size ? roleOptions.filter(role => selectedRoles.has(role.id)).map(role => role.title).join(' · ') : 'Select at least one role to continue'}
          </Text>
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
    paddingTop: 16,
    paddingBottom: 20,
  },
  headingContainer: {
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  heading: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 23,
    fontWeight: '700',
    lineHeight: 30,
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
    lineHeight: 22,
    marginTop: 12,
    maxWidth: 290,
    textAlign: 'center',
  },
  cards: {
    gap: 16,
    paddingTop: 26,
    paddingBottom: 24,
  },
  pagination: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  dotTarget: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#DCE5FA' },
  activeDot: { width: 30, backgroundColor: colors.primaryBrandBlue },
  pageLabel: { textAlign: 'center', fontFamily: fonts.regular, fontSize: 12, color: colors.textSecondary },
  selectionSummary: { textAlign: 'center', fontFamily: fonts.medium, fontSize: 12, lineHeight: 18, color: colors.textSecondary, marginBottom: 10 },
  note: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 22,
    paddingHorizontal: 32,
    maxWidth: 480,
    alignSelf: 'center',
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
    fontSize: 12,
    lineHeight: 19,
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
