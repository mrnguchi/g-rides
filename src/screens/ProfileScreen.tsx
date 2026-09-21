import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  initialWindowMetrics,
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import {
  AppIcon,
  HomeBottomNavigation,
  RoleSwitchSheet,
  type AppIconName,
  type MainTab,
} from '../components';
import { useScreenBackNavigation } from '../hooks/useScreenBackNavigation';
import {
  colors,
  controlHeights,
  fonts,
  iconSizes,
  layout,
  radii,
  shadows,
  spacing,
  surfaces,
} from '../theme';
import type { UserRole } from '../types/user';

type ProfileScreenProps = {
  activeRole: UserRole;
  enabledRoles: UserRole[];
  notificationCount?: number;
  onLogout?: () => void;
  onOpenGarage?: () => void;
  onRoleChange: (role: UserRole) => void;
  onTabPress?: (tab: MainTab) => void;
  unreadMessagesCount?: number;
};

type ProfileMenuRowProps = {
  icon: AppIconName;
  label: string;
  onPress: () => void;
  subtitle?: string;
  value?: string;
};

const profileImage = require('../../assets/images/10075.jpeg');
const logoBlue = require('../../assets/images/logo-blue.png');

const rolePresentation: Record<
  UserRole,
  { description: string; icon: AppIconName; label: string }
> = {
  renter: {
    description: 'Rent vehicles and access every G-Rides service',
    icon: 'profile',
    label: 'Customer',
  },
  owner: {
    description: 'Manage your rental fleet and booking operations',
    icon: 'fleet',
    label: 'Car Owner',
  },
  driver: {
    description: 'Manage chauffeur trips and assigned vehicles',
    icon: 'driver',
    label: 'Driver',
  },
};

function ProfileMenuRow({
  icon,
  label,
  onPress,
  subtitle,
  value,
}: ProfileMenuRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuRow,
        pressed && styles.menuRowPressed,
      ]}
    >
      <View style={styles.menuIconContainer}>
        <AppIcon
          color={colors.primaryBrandBlue}
          name={icon}
          size={iconSizes.control}
        />
      </View>
      <View style={styles.menuCopy}>
        <Text style={styles.menuLabel}>{label}</Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
      {value && (
        <View style={styles.menuValuePill}>
          <Text style={styles.menuValue}>{value}</Text>
        </View>
      )}
      <AppIcon
        color="#A7AFBC"
        name="chevronRight"
        size={iconSizes.inline}
        strokeWidth={1.8}
      />
    </Pressable>
  );
}

function MenuDivider() {
  return <View style={styles.menuDivider} />;
}

export function ProfileScreen({
  activeRole,
  enabledRoles,
  notificationCount = 0,
  onLogout,
  onOpenGarage,
  onRoleChange,
  onTabPress,
  unreadMessagesCount = 0,
}: ProfileScreenProps) {
  const safeAreaInsets = useSafeAreaInsets();
  const [isLogoutVisible, setIsLogoutVisible] = useState(false);
  const [isRoleSwitcherVisible, setIsRoleSwitcherVisible] = useState(false);
  const [notice, setNotice] = useState<string>();
  const logoutBackGestureHandlers = useScreenBackNavigation(
    () => setIsLogoutVisible(false),
    isLogoutVisible,
  );
  const bottomSafeArea = Math.max(
    safeAreaInsets.bottom,
    initialWindowMetrics?.insets.bottom ?? 0,
  );
  const activeRolePresentation = rolePresentation[activeRole];

  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(undefined), 3400);
    return () => clearTimeout(timer);
  }, [notice]);

  const openPlaceholder = (label: string) => {
    setNotice(`${label} will open here as we build out account settings.`);
  };

  const switchRole = (role: UserRole) => {
    onRoleChange(role);
    setIsRoleSwitcherVisible(false);
    setNotice(`Switched to your ${rolePresentation[role].label} workspace.`);
  };

  const setupRole = (role: UserRole) => {
    setIsRoleSwitcherVisible(false);
    setNotice(
      `${rolePresentation[role].label} setup will be connected with that workspace.`,
    );
  };

  const openMyVehicles = () => {
    if (onOpenGarage) onOpenGarage();
    else openPlaceholder('My Vehicles');
  };

  return (
    <View style={styles.screen}>
      <StatusBar backgroundColor={surfaces.canvas} style="dark" />

      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          <Text style={styles.headerTitle}>Profile</Text>
          <Pressable
            accessibilityLabel="Profile settings"
            accessibilityRole="button"
            onPress={() => openPlaceholder('Profile settings')}
            style={({ pressed }) => [
              styles.headerButton,
              pressed && styles.pressed,
            ]}
          >
            <AppIcon
              color={colors.textPrimary}
              name="settings"
              size={iconSizes.control}
            />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <Image source={profileImage} style={styles.avatar} />
              <View style={styles.verifiedBadge}>
                <AppIcon
                  color={colors.white}
                  name="verified"
                  size={15}
                  solid
                  strokeWidth={2}
                />
              </View>
            </View>

            <View style={styles.profileCopy}>
              <Text style={styles.profileName}>Munoh Nguchi</Text>
              <Text numberOfLines={1} style={styles.profileEmail}>
                munohnguchi334@gmail.com
              </Text>
              <View style={styles.profileStatusPill}>
                <View style={styles.profileStatusDot} />
                <Text style={styles.profileStatusText}>Verified account</Text>
              </View>
            </View>

            <Pressable
              accessibilityLabel="Edit profile"
              accessibilityRole="button"
              onPress={() => openPlaceholder('Edit profile')}
              style={({ pressed }) => [
                styles.editButton,
                pressed && styles.pressed,
              ]}
            >
              <AppIcon
                color={colors.primaryBrandBlue}
                name="edit"
                size={iconSizes.control}
              />
            </Pressable>
          </View>

          <Pressable
            accessibilityLabel="Switch G-Rides workspace"
            accessibilityRole="button"
            onPress={() => setIsRoleSwitcherVisible(true)}
            style={({ pressed }) => [
              styles.workspaceCard,
              pressed && styles.workspaceCardPressed,
            ]}
          >
            <View style={styles.workspaceIconContainer}>
              <AppIcon
                color={colors.white}
                name={activeRolePresentation.icon}
                size={iconSizes.feature}
                strokeWidth={1.8}
              />
            </View>
            <View style={styles.workspaceCopy}>
              <Text style={styles.workspaceEyebrow}>ACTIVE WORKSPACE</Text>
              <Text style={styles.workspaceTitle}>
                {activeRolePresentation.label}
              </Text>
              <Text numberOfLines={2} style={styles.workspaceDescription}>
                {activeRolePresentation.description}
              </Text>
            </View>
            <View style={styles.switchButton}>
              <AppIcon
                color={colors.primaryBrandBlue}
                name="swap"
                size={18}
                strokeWidth={1.8}
              />
              <Text style={styles.switchButtonText}>Switch</Text>
            </View>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={openMyVehicles}
            style={({ pressed }) => [
              styles.vehicleFeatureCard,
              pressed && styles.featureCardPressed,
            ]}
          >
            <View style={styles.vehicleFeatureIcon}>
              <AppIcon
                color={colors.primaryBrandBlue}
                name="vehicle"
                size={27}
                strokeWidth={1.75}
              />
            </View>
            <View style={styles.vehicleFeatureCopy}>
              <Text style={styles.vehicleFeatureEyebrow}>VEHICLE SERVICES</Text>
              <Text style={styles.vehicleFeatureTitle}>My Vehicles</Text>
              <Text style={styles.vehicleFeatureDescription}>
                Personal vehicles, documents and service readiness
              </Text>
            </View>
            <View style={styles.featureArrow}>
              <AppIcon
                color={colors.white}
                name="arrowForward"
                size={18}
                strokeWidth={1.8}
              />
            </View>
          </Pressable>

          <Text style={styles.sectionLabel}>Account</Text>
          <View style={styles.menuGroup}>
            <ProfileMenuRow
              icon="profile"
              label="Personal information"
              onPress={() => openPlaceholder('Personal information')}
              subtitle="Name, phone number and profile photo"
            />
            <MenuDivider />
            <ProfileMenuRow
              icon="verified"
              label="Identity verification"
              onPress={() => openPlaceholder('Identity verification')}
              subtitle="Your account is verified"
              value="Verified"
            />
            <MenuDivider />
            <ProfileMenuRow
              icon="security"
              label="Password & security"
              onPress={() => openPlaceholder('Password and security')}
              subtitle="Password, PIN and signed-in devices"
            />
            <MenuDivider />
            <ProfileMenuRow
              icon="notification"
              label="Notifications"
              onPress={() => openPlaceholder('Notification preferences')}
              subtitle="Bookings, services and message alerts"
              value={
                notificationCount > 0 ? `${notificationCount} new` : undefined
              }
            />
          </View>

          <Text style={styles.sectionLabel}>Preferences</Text>
          <View style={styles.menuGroup}>
            <ProfileMenuRow
              icon="wallet"
              label="Payment methods"
              onPress={() => openPlaceholder('Payment methods')}
              subtitle="MTN MoMo and Orange Money"
            />
            <MenuDivider />
            <ProfileMenuRow
              icon="favorite"
              label="Saved cars"
              onPress={() => openPlaceholder('Saved cars')}
              subtitle="Rental vehicles you added to favourites"
            />
            <MenuDivider />
            <ProfileMenuRow
              icon="location"
              label="Saved locations"
              onPress={() => openPlaceholder('Saved locations')}
              subtitle="Pickup, delivery and service addresses"
            />
            <MenuDivider />
            <ProfileMenuRow
              icon="language"
              label="Language and currency"
              onPress={() => openPlaceholder('Language and currency')}
              value="English · XAF"
            />
          </View>

          <Text style={styles.sectionLabel}>Support</Text>
          <View style={styles.menuGroup}>
            <ProfileMenuRow
              icon="help"
              label="Help Center"
              onPress={() => openPlaceholder('Help Center')}
              subtitle="Answers, safety and service assistance"
            />
            <MenuDivider />
            <ProfileMenuRow
              icon="support"
              label="Contact G-Rides"
              onPress={() => openPlaceholder('G-Rides support')}
              subtitle="Chat with our support team"
            />
            <MenuDivider />
            <ProfileMenuRow
              icon="privacy"
              label="Terms and privacy"
              onPress={() => openPlaceholder('Terms and privacy')}
            />
          </View>

          <View style={styles.accountFooterRow}>
            <View style={styles.versionContainer}>
              <Image
                resizeMode="contain"
                source={logoBlue}
                style={styles.versionLogo}
              />
              <View>
                <Text style={styles.versionBrand}>G-Rides</Text>
                <Text style={styles.versionText}>Version 1.0.0</Text>
              </View>
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={() => setIsLogoutVisible(true)}
              style={({ pressed }) => [
                styles.logoutButton,
                pressed && styles.pressed,
              ]}
            >
              <AppIcon
                color={colors.error}
                name="logout"
                size={iconSizes.inline}
              />
              <Text style={styles.logoutText}>Log out</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>

      {notice && (
        <View pointerEvents="none" style={styles.notice}>
          <AppIcon color={colors.white} name="info" size={19} solid />
          <Text style={styles.noticeText}>{notice}</Text>
        </View>
      )}

      <HomeBottomNavigation
        activeTab="profile"
        onTabPress={onTabPress}
        unreadMessagesCount={unreadMessagesCount}
      />

      <RoleSwitchSheet
        activeRole={activeRole}
        enabledRoles={enabledRoles}
        onClose={() => setIsRoleSwitcherVisible(false)}
        onRoleChange={switchRole}
        onSetupRole={setupRole}
        visible={isRoleSwitcherVisible}
      />

      <Modal
        animationType="fade"
        onRequestClose={() => setIsLogoutVisible(false)}
        presentationStyle="overFullScreen"
        statusBarTranslucent
        transparent
        visible={isLogoutVisible}
      >
        <View style={styles.logoutModalRoot} {...logoutBackGestureHandlers}>
          <StatusBar style="light" />
          <Pressable
            accessibilityLabel="Close logout confirmation"
            accessibilityRole="button"
            onPress={() => setIsLogoutVisible(false)}
            style={styles.logoutBackdrop}
          />
          <View
            style={[
              styles.logoutSheet,
              { paddingBottom: Math.max(14, bottomSafeArea + 10) },
            ]}
          >
            <View style={styles.logoutHandle} />
            <View style={styles.logoutSheetIcon}>
              <AppIcon
                color={colors.error}
                name="logout"
                size={28}
                strokeWidth={1.8}
              />
            </View>
            <Text style={styles.logoutTitle}>Log out of G-Rides?</Text>
            <Text style={styles.logoutDescription}>
              You will need to sign in again to access your activities,
              messages and saved vehicles.
            </Text>
            <View style={styles.logoutActions}>
              <Pressable
                accessibilityRole="button"
                onPress={() => setIsLogoutVisible(false)}
                style={({ pressed }) => [
                  styles.stayButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.stayButtonText}>Stay logged in</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={onLogout}
                style={({ pressed }) => [
                  styles.confirmLogoutButton,
                  pressed && styles.confirmLogoutPressed,
                ]}
              >
                <Text style={styles.confirmLogoutText}>Log out</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: surfaces.canvas,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenGutter,
  },
  headerSpacer: {
    width: controlHeights.compact,
    height: controlHeights.compact,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 20,
    fontWeight: '700',
  },
  headerButton: {
    width: controlHeights.compact,
    height: controlHeights.compact,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
    backgroundColor: surfaces.raised,
    ...shadows.soft,
  },
  content: {
    paddingHorizontal: layout.screenGutter,
    paddingTop: spacing.xs,
    paddingBottom: 132,
  },
  profileCard: {
    minHeight: 110,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radii.xl,
    backgroundColor: surfaces.raised,
    padding: spacing.md,
    ...shadows.soft,
  },
  avatarContainer: {
    width: 72,
    height: 72,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 36,
  },
  verifiedBadge: {
    position: 'absolute',
    right: -1,
    bottom: 0,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: surfaces.raised,
    borderRadius: 12,
    backgroundColor: colors.success,
  },
  profileCopy: {
    minWidth: 0,
    flex: 1,
  },
  profileName: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 17,
    fontWeight: '700',
  },
  profileEmail: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 11.5,
    marginTop: 4,
  },
  profileStatusPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: radii.pill,
    backgroundColor: surfaces.greenSoft,
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginTop: 9,
  },
  profileStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
  },
  profileStatusText: {
    color: colors.success,
    fontFamily: fonts.semiBold,
    fontSize: 9.5,
    fontWeight: '600',
  },
  editButton: {
    width: controlHeights.compact,
    height: controlHeights.compact,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.md,
    backgroundColor: surfaces.blueSoft,
  },
  workspaceCard: {
    minHeight: 108,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    borderRadius: radii.xl,
    backgroundColor: colors.primaryDark,
    padding: 14,
    marginTop: spacing.md,
    ...shadows.soft,
  },
  workspaceCardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.995 }],
  },
  workspaceIconContainer: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: colors.primaryBrandBlue,
  },
  workspaceCopy: {
    minWidth: 0,
    flex: 1,
  },
  workspaceEyebrow: {
    color: colors.trackingGlow,
    fontFamily: fonts.semiBold,
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.85,
  },
  workspaceTitle: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 3,
  },
  workspaceDescription: {
    color: 'rgba(255,255,255,0.66)',
    fontFamily: fonts.regular,
    fontSize: 10.5,
    lineHeight: 14,
    marginTop: 3,
  },
  switchButton: {
    height: 38,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: radii.pill,
    backgroundColor: colors.white,
    paddingHorizontal: 11,
  },
  switchButtonText: {
    color: colors.primaryBrandBlue,
    fontFamily: fonts.semiBold,
    fontSize: 11,
    fontWeight: '600',
  },
  vehicleFeatureCard: {
    minHeight: 96,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: radii.xl,
    backgroundColor: surfaces.raised,
    padding: 14,
    marginTop: spacing.sm,
    ...shadows.soft,
  },
  featureCardPressed: {
    opacity: 0.72,
  },
  vehicleFeatureIcon: {
    width: 54,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: surfaces.blueSoft,
  },
  vehicleFeatureCopy: {
    minWidth: 0,
    flex: 1,
  },
  vehicleFeatureEyebrow: {
    color: colors.primaryBrandBlue,
    fontFamily: fonts.semiBold,
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.7,
  },
  vehicleFeatureTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 3,
  },
  vehicleFeatureDescription: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 10.5,
    lineHeight: 15,
    marginTop: 3,
  },
  featureArrow: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: colors.primaryBrandBlue,
  },
  sectionLabel: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 14,
    fontWeight: '600',
    marginTop: spacing.xl,
    marginBottom: 9,
    marginLeft: 3,
  },
  menuGroup: {
    overflow: 'hidden',
    borderRadius: radii.xl,
    backgroundColor: surfaces.raised,
    paddingHorizontal: 13,
    ...shadows.soft,
  },
  menuRow: {
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingVertical: 9,
  },
  menuRowPressed: {
    opacity: 0.58,
  },
  menuIconContainer: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: surfaces.blueSoft,
  },
  menuCopy: {
    minWidth: 0,
    flex: 1,
  },
  menuLabel: {
    color: colors.textPrimary,
    fontFamily: fonts.medium,
    fontSize: 14,
    fontWeight: '500',
  },
  menuSubtitle: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 10.5,
    lineHeight: 15,
    marginTop: 4,
  },
  menuValuePill: {
    maxWidth: 94,
    borderRadius: radii.pill,
    backgroundColor: surfaces.muted,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  menuValue: {
    color: colors.primaryBrandBlue,
    fontFamily: fonts.semiBold,
    fontSize: 9.5,
    fontWeight: '600',
    textAlign: 'right',
  },
  menuDivider: {
    height: 1,
    backgroundColor: surfaces.muted,
    marginLeft: 53,
  },
  accountFooterRow: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    borderRadius: radii.lg,
    backgroundColor: surfaces.raised,
    paddingHorizontal: 14,
    marginTop: spacing.lg,
    ...shadows.soft,
  },
  versionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  versionLogo: {
    width: 43,
    height: 43,
  },
  versionBrand: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 12,
    fontWeight: '600',
  },
  versionText: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    marginTop: 2,
  },
  logoutButton: {
    height: 42,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderRadius: radii.pill,
    backgroundColor: surfaces.redSoft,
    paddingHorizontal: 13,
  },
  logoutText: {
    color: colors.error,
    fontFamily: fonts.semiBold,
    fontSize: 12,
    fontWeight: '600',
  },
  notice: {
    position: 'absolute',
    zIndex: 110,
    right: layout.screenGutter,
    bottom: 106,
    left: layout.screenGutter,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: radii.md,
    backgroundColor: colors.primaryDark,
    paddingHorizontal: 14,
    paddingVertical: 10,
    ...shadows.floating,
  },
  noticeText: {
    flex: 1,
    color: colors.white,
    fontFamily: fonts.medium,
    fontSize: 11.5,
    fontWeight: '500',
    lineHeight: 16,
  },
  logoutModalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  logoutBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
  },
  logoutSheet: {
    alignItems: 'center',
    borderTopLeftRadius: radii.sheet,
    borderTopRightRadius: radii.sheet,
    backgroundColor: surfaces.raised,
    paddingHorizontal: layout.screenGutter,
    paddingTop: 10,
  },
  logoutHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.borderGray,
    marginBottom: 22,
  },
  logoutSheetIcon: {
    width: 62,
    height: 62,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: surfaces.redSoft,
  },
  logoutTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 21,
    fontWeight: '700',
    marginTop: 16,
  },
  logoutDescription: {
    maxWidth: 310,
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 7,
  },
  logoutActions: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    gap: 10,
    marginTop: 22,
  },
  stayButton: {
    height: controlHeights.primary,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.md,
    backgroundColor: surfaces.muted,
  },
  stayButtonText: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 12,
    fontWeight: '600',
  },
  confirmLogoutButton: {
    height: controlHeights.primary,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.md,
    backgroundColor: colors.error,
  },
  confirmLogoutPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }],
  },
  confirmLogoutText: {
    color: colors.white,
    fontFamily: fonts.semiBold,
    fontSize: 12,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.65,
  },
});
