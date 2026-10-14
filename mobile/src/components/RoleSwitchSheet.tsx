import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import {
  Image,
  type ImageSourcePropType,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  initialWindowMetrics,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { useScreenBackNavigation } from '../hooks/useScreenBackNavigation';
import {
  colors,
  fonts,
  layout,
  radii,
  shadows,
  surfaces,
} from '../theme';
import type { UserRole } from '../types/user';
import { AppIcon } from './AppIcon';

type RoleSwitchSheetProps = {
  activeRole: UserRole;
  enabledRoles: UserRole[];
  onClose: () => void;
  onRoleChange: (role: UserRole) => void;
  onSetupRole: (role: UserRole) => void;
  visible: boolean;
};

type RoleOption = {
  description: string;
  icon: ImageSourcePropType;
  id: UserRole;
  label: string;
};

const roleOptions: RoleOption[] = [
  {
    description: 'Find a car for your next trip and book vehicle services.',
    icon: require('../../assets/images/user.png'),
    id: 'renter',
    label: 'Customer',
  },
  {
    description: 'List your cars, manage bookings and track your earnings.',
    icon: require('../../assets/images/car.png'),
    id: 'owner',
    label: 'Car Owner',
  },
  {
    description: 'Offer chauffeur services and manage trips.',
    icon: require('../../assets/images/driver.png'),
    id: 'driver',
    label: 'Driver',
  },
];

export function RoleSwitchSheet({
  activeRole,
  enabledRoles,
  onClose,
  onRoleChange,
  onSetupRole,
  visible,
}: RoleSwitchSheetProps) {
  const safeAreaInsets = useSafeAreaInsets();
  const [selectedRole, setSelectedRole] = useState<UserRole>(activeRole);
  const backGestureHandlers = useScreenBackNavigation(onClose, visible);
  const bottomSafeArea = Math.max(
    safeAreaInsets.bottom,
    initialWindowMetrics?.insets.bottom ?? 0,
  );
  const selectedOption =
    roleOptions.find((option) => option.id === selectedRole) ?? roleOptions[0];
  const selectedRoleIsEnabled = enabledRoles.includes(selectedRole);
  const selectedRoleIsActive = selectedRole === activeRole;

  useEffect(() => {
    if (visible) setSelectedRole(activeRole);
  }, [activeRole, visible]);

  const dragResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          gesture.dy > 8 && Math.abs(gesture.dy) > Math.abs(gesture.dx) * 1.2,
        onPanResponderRelease: (_, gesture) => {
          if (gesture.dy > 70 || gesture.vy > 0.85) onClose();
        },
      }),
    [onClose],
  );

  const handleContinue = () => {
    if (selectedRoleIsActive) return;
    if (selectedRoleIsEnabled) onRoleChange(selectedRole);
    else onSetupRole(selectedRole);
  };

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      presentationStyle="overFullScreen"
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View style={styles.modalRoot} {...backGestureHandlers}>
        <StatusBar style="light" />
        <Pressable
          accessibilityLabel="Close profile switcher"
          accessibilityRole="button"
          onPress={onClose}
          style={styles.backdrop}
        />

        <View style={styles.sheet}>
          <View style={styles.dragArea} {...dragResponder.panHandlers}>
            <View style={styles.handle} />
          </View>

          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={styles.title}>Switch profile</Text>
              <Text style={styles.subtitle}>
                How would you like to use G-Rides?
              </Text>
            </View>
            <Pressable
              accessibilityLabel="Close profile switcher"
              accessibilityRole="button"
              hitSlop={8}
              onPress={onClose}
              style={({ pressed }) => [
                styles.closeButton,
                pressed && styles.pressed,
              ]}
            >
              <AppIcon color={colors.textPrimary} name="close" size={22} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.roleList}>
            {roleOptions.map((role) => {
              const active = role.id === activeRole;
              const enabled = enabledRoles.includes(role.id);
              const selected = role.id === selectedRole;

              return (
                <Pressable
                  key={role.id}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  onPress={() => setSelectedRole(role.id)}
                  style={({ pressed }) => [
                    styles.roleCard,
                    selected && styles.selectedRoleCard,
                    pressed && styles.pressed,
                  ]}
                >
                  <View
                    style={[
                      styles.roleIconContainer,
                      selected && styles.selectedRoleIconContainer,
                    ]}
                  >
                    <Image
                      resizeMode="contain"
                      source={role.icon}
                      style={[
                        styles.roleIcon,
                        {
                          tintColor: selected
                            ? colors.white
                            : colors.primaryBrandBlue,
                        },
                      ]}
                    />
                  </View>
                  <View style={styles.roleCopy}>
                    <View style={styles.roleTitleRow}>
                      <Text style={styles.roleTitle}>{role.label}</Text>
                      <View
                        style={[
                          styles.statusPill,
                          active
                            ? styles.activeStatusPill
                            : enabled
                              ? styles.readyStatusPill
                              : styles.setupStatusPill,
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusText,
                            active
                              ? styles.activeStatusText
                              : enabled
                                ? styles.readyStatusText
                                : styles.setupStatusText,
                          ]}
                        >
                          {active ? 'Current' : enabled ? 'Available' : 'Get started'}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.roleDescription}>{role.description}</Text>
                  </View>
                  <View style={[styles.radio, selected && styles.selectedRadio]}>
                    {selected && <View style={styles.radioDot} />}
                  </View>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.roleNote}>
            <AppIcon
              color={colors.primaryBrandBlue}
              name="info"
              size={19}
              solid
            />
            <Text style={styles.roleNoteText}>
              Choose a profile to continue. You can switch back at any time.
            </Text>
          </View>
          </ScrollView>
          <View
            style={[
              styles.footer,
              { paddingBottom: Math.max(12, bottomSafeArea + 8) },
            ]}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: selectedRoleIsActive }}
              disabled={selectedRoleIsActive}
              onPress={handleContinue}
              style={({ pressed }) => [
                styles.continueButton,
                selectedRoleIsActive && styles.disabledButton,
                pressed && styles.continueButtonPressed,
              ]}
            >
              <Text
                style={[
                  styles.continueText,
                  selectedRoleIsActive && styles.disabledButtonText,
                ]}
              >
                {selectedRoleIsActive
                  ? 'Current profile'
                  : selectedRoleIsEnabled
                    ? `Switch to ${selectedOption.label}`
                    : `Get started as ${selectedOption.label}`}
              </Text>
              {!selectedRoleIsActive && (
                <AppIcon
                  color={colors.white}
                  name="arrowForward"
                  size={20}
                  strokeWidth={1.9}
                />
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
  },
  sheet: {
    maxHeight: '90%',
    overflow: 'hidden',
    borderTopLeftRadius: radii.sheet,
    borderTopRightRadius: radii.sheet,
    backgroundColor: surfaces.raised,
  },
  dragArea: {
    height: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  handle: {
    width: 43,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.borderGray,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingHorizontal: layout.screenGutter,
    paddingBottom: 17,
  },
  headerCopy: {
    minWidth: 0,
    flex: 1,
  },
  eyebrow: {
    color: colors.primaryBrandBlue,
    fontFamily: fonts.semiBold,
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.7,
  },
  title: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 22,
    fontWeight: '700',
    marginTop: 4,
  },
  subtitle: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 5,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: surfaces.muted,
  },
  scrollContent: { paddingTop: 8, paddingBottom: 16 },
  roleList: {
    gap: 16,
    paddingHorizontal: layout.screenGutter,
  },
  roleCard: {
    minHeight: 112,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: radii.lg,
    backgroundColor: surfaces.raised,
    padding: 16,
    ...shadows.soft,
  },
  selectedRoleCard: {
    backgroundColor: surfaces.blueSoft,
  },
  roleIconContainer: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: surfaces.blueSoft,
  },
  selectedRoleIconContainer: {
    backgroundColor: colors.primaryBrandBlue,
  },
  roleIcon: {
    width: 27,
    height: 27,
  },
  roleCopy: {
    minWidth: 0,
    flex: 1,
  },
  roleTitleRow: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  roleTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 17,
    fontWeight: '600',
  },
  statusPill: {
    borderRadius: 9,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  activeStatusPill: {
    backgroundColor: '#EAF7EF',
  },
  readyStatusPill: {
    backgroundColor: '#EDF4FE',
  },
  setupStatusPill: {
    backgroundColor: surfaces.muted,
  },
  statusText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    fontWeight: '500',
  },
  activeStatusText: {
    color: colors.success,
  },
  readyStatusText: {
    color: colors.primaryBrandBlue,
  },
  setupStatusText: {
    color: colors.textSecondary,
  },
  roleDescription: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 5,
  },
  radio: {
    width: 21,
    height: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.borderGray,
    borderRadius: 11,
  },
  selectedRadio: {
    borderColor: colors.primaryBrandBlue,
  },
  radioDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: colors.primaryBrandBlue,
  },
  roleNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    borderRadius: 12,
    backgroundColor: surfaces.blueSoft,
    padding: 11,
    marginHorizontal: layout.screenGutter,
    marginTop: 15,
  },
  roleNoteText: {
    flex: 1,
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 20,
  },
  footer: {
    backgroundColor: surfaces.raised,
    paddingHorizontal: layout.screenGutter,
    paddingTop: 12,
    marginTop: 16,
  },
  continueButton: {
    height: 53,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    borderRadius: 27,
    backgroundColor: colors.primaryBrandBlue,
  },
  disabledButton: {
    backgroundColor: colors.surfaceGray,
  },
  disabledButtonText: {
    color: colors.textSecondary,
  },
  continueButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.99 }],
  },
  continueText: {
    color: colors.white,
    fontFamily: fonts.semiBold,
    fontSize: 15,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.7,
  },
});
