import Ionicons from '@expo/vector-icons/Ionicons';
import { StatusBar } from 'expo-status-bar';
import { useMemo } from 'react';
import {
  Image,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  initialWindowMetrics,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { useScreenBackNavigation } from '../hooks/useScreenBackNavigation';
import { colors, fonts, layout } from '../theme';
import type {
  AppNotification,
  NotificationKind,
} from '../types/notification';

type NotificationSheetProps = {
  notifications: AppNotification[];
  onClearAll: () => void;
  onClose: () => void;
  onMarkAllRead: () => void;
  onNotificationPress: (notification: AppNotification) => void;
  visible: boolean;
};

type NotificationPresentation = {
  background: string;
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const emptyNotificationIcon = require('../../assets/images/notification (1).png');

const notificationPresentation: Record<
  NotificationKind,
  NotificationPresentation
> = {
  booking: {
    background: '#EDF4FE',
    color: colors.primaryBrandBlue,
    icon: 'car-sport-outline',
  },
  discovery: {
    background: '#F0F7FF',
    color: '#2563EB',
    icon: 'location-outline',
  },
  message: {
    background: '#F1F0FF',
    color: '#6558D9',
    icon: 'chatbubble-ellipses-outline',
  },
  security: {
    background: '#EAF7EF',
    color: colors.success,
    icon: 'shield-checkmark-outline',
  },
};

export function NotificationSheet({
  notifications,
  onClearAll,
  onClose,
  onMarkAllRead,
  onNotificationPress,
  visible,
}: NotificationSheetProps) {
  const { height } = useWindowDimensions();
  const safeAreaInsets = useSafeAreaInsets();
  const backGestureHandlers = useScreenBackNavigation(onClose, visible);
  const unreadCount = notifications.filter((notification) => !notification.read)
    .length;
  const bottomSafeArea = Math.max(
    safeAreaInsets.bottom,
    initialWindowMetrics?.insets.bottom ?? 0,
  );
  const sheetHeight = Math.min(720, height * 0.84);
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
          accessibilityLabel="Close notifications"
          accessibilityRole="button"
          onPress={onClose}
          style={styles.backdrop}
        />

        <View style={[styles.sheet, { height: sheetHeight }]}>
          <View style={styles.dragArea} {...dragResponder.panHandlers}>
            <View style={styles.handle} />
          </View>

          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <View style={styles.titleRow}>
                <Text style={styles.title}>Notifications</Text>
                {unreadCount > 0 && (
                  <View style={styles.unreadCountBadge}>
                    <Text style={styles.unreadCountText}>{unreadCount}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.subtitle}>
                Booking updates, messages and useful reminders
              </Text>
            </View>
            <Pressable
              accessibilityLabel="Close notifications"
              accessibilityRole="button"
              hitSlop={8}
              onPress={onClose}
              style={({ pressed }) => [
                styles.closeButton,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons color={colors.textPrimary} name="close" size={22} />
            </Pressable>
          </View>

          {notifications.length ? (
            <>
              <View style={styles.toolbar}>
                <Text style={styles.toolbarLabel}>
                  {unreadCount
                    ? `${unreadCount} unread ${unreadCount === 1 ? 'update' : 'updates'}`
                    : 'You are all caught up'}
                </Text>
                {unreadCount > 0 && (
                  <Pressable
                    accessibilityRole="button"
                    hitSlop={8}
                    onPress={onMarkAllRead}
                    style={({ pressed }) => pressed && styles.pressed}
                  >
                    <Text style={styles.markAllText}>Mark all as read</Text>
                  </Pressable>
                )}
              </View>

              <ScrollView
                contentContainerStyle={[
                  styles.notificationList,
                  { paddingBottom: bottomSafeArea + 18 },
                ]}
                showsVerticalScrollIndicator={false}
                style={styles.notificationScroller}
              >
                {notifications.map((notification, index) => {
                  const presentation =
                    notificationPresentation[notification.kind];

                  return (
                    <Pressable
                      key={notification.id}
                      accessibilityRole="button"
                      onPress={() => onNotificationPress(notification)}
                      style={({ pressed }) => [
                        styles.notificationCard,
                        !notification.read && styles.unreadNotificationCard,
                        pressed && styles.notificationCardPressed,
                      ]}
                    >
                      <View
                        style={[
                          styles.notificationIcon,
                          { backgroundColor: presentation.background },
                        ]}
                      >
                        <Ionicons
                          color={presentation.color}
                          name={presentation.icon}
                          size={23}
                        />
                      </View>

                      <View style={styles.notificationCopy}>
                        <View style={styles.notificationTitleRow}>
                          <Text
                            numberOfLines={2}
                            style={[
                              styles.notificationTitle,
                              !notification.read && styles.unreadNotificationTitle,
                            ]}
                          >
                            {notification.title}
                          </Text>
                          {!notification.read && (
                            <View style={styles.unreadDot} />
                          )}
                        </View>
                        <Text style={styles.notificationMessage}>
                          {notification.message}
                        </Text>
                        <View style={styles.notificationMetaRow}>
                          <Text style={styles.notificationTime}>
                            {notification.timeLabel}
                          </Text>
                          {notification.actionLabel && (
                            <View style={styles.notificationAction}>
                              <Text style={styles.notificationActionText}>
                                {notification.actionLabel}
                              </Text>
                              <Ionicons
                                color={colors.primaryBrandBlue}
                                name="chevron-forward"
                                size={14}
                              />
                            </View>
                          )}
                        </View>
                      </View>
                    </Pressable>
                  );
                })}

                <Pressable
                  accessibilityRole="button"
                  onPress={onClearAll}
                  style={({ pressed }) => [
                    styles.clearButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <Ionicons
                    color={colors.textSecondary}
                    name="trash-outline"
                    size={17}
                  />
                  <Text style={styles.clearButtonText}>Clear notifications</Text>
                </Pressable>
              </ScrollView>
            </>
          ) : (
            <View
              style={[
                styles.emptyState,
                { paddingBottom: bottomSafeArea + 20 },
              ]}
            >
              <View style={styles.emptyIconOuter}>
                <View style={styles.emptyIconInner}>
                  <Image
                    resizeMode="contain"
                    source={emptyNotificationIcon}
                    style={styles.emptyIcon}
                  />
                </View>
                <View style={styles.emptyCheckBadge}>
                  <Ionicons color={colors.white} name="checkmark" size={15} />
                </View>
              </View>
              <Text style={styles.emptyTitle}>You’re all caught up</Text>
              <Text style={styles.emptyText}>
                Booking updates and important G-Rides notifications will appear
                here.
              </Text>
            </View>
          )}
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
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
  },
  sheet: {
    overflow: 'hidden',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: colors.white,
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
    minHeight: 73,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: layout.screenGutter,
    paddingBottom: 12,
  },
  headerCopy: {
    minWidth: 0,
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 22,
    fontWeight: '700',
  },
  unreadCountBadge: {
    minWidth: 23,
    height: 23,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: colors.primaryBrandBlue,
    paddingHorizontal: 6,
  },
  unreadCountText: {
    color: colors.white,
    fontFamily: fonts.semiBold,
    fontSize: 10,
    fontWeight: '600',
  },
  subtitle: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 10.5,
    marginTop: 4,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: colors.surfaceGray,
  },
  toolbar: {
    height: 43,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#EEF1F5',
    backgroundColor: '#FAFBFC',
    paddingHorizontal: layout.screenGutter,
  },
  toolbarLabel: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 10.5,
    fontWeight: '500',
  },
  markAllText: {
    color: colors.primaryBrandBlue,
    fontFamily: fonts.semiBold,
    fontSize: 10.5,
    fontWeight: '600',
  },
  notificationList: {
    paddingHorizontal: layout.screenGutter,
    paddingTop: 12,
  },
  notificationScroller: {
    flex: 1,
  },
  notificationCard: {
    minHeight: 112,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 11,
    borderWidth: 1,
    borderColor: '#EDF0F4',
    borderRadius: 15,
    backgroundColor: colors.white,
    padding: 12,
    marginBottom: 10,
  },
  unreadNotificationCard: {
    borderColor: '#D4E4FB',
    backgroundColor: '#FAFCFF',
  },
  notificationCardPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.99 }],
  },
  notificationIcon: {
    width: 43,
    height: 43,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
  },
  notificationCopy: {
    minWidth: 0,
    flex: 1,
  },
  notificationTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 7,
  },
  notificationTitle: {
    minWidth: 0,
    flex: 1,
    color: colors.textPrimary,
    fontFamily: fonts.medium,
    fontSize: 12.5,
    fontWeight: '500',
    lineHeight: 17,
  },
  unreadNotificationTitle: {
    fontFamily: fonts.semiBold,
    fontWeight: '600',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primaryBrandBlue,
    marginTop: 4,
  },
  notificationMessage: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 10.5,
    lineHeight: 15,
    marginTop: 5,
  },
  notificationMetaRow: {
    minHeight: 22,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 5,
  },
  notificationTime: {
    color: '#9AA2B1',
    fontFamily: fonts.regular,
    fontSize: 9,
  },
  notificationAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
  },
  notificationActionText: {
    color: colors.primaryBrandBlue,
    fontFamily: fonts.semiBold,
    fontSize: 9.5,
    fontWeight: '600',
  },
  clearButton: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  clearButtonText: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 10.5,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 38,
  },
  emptyIconOuter: {
    width: 102,
    height: 102,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 51,
    backgroundColor: '#F4F7FB',
  },
  emptyIconInner: {
    width: 70,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 35,
    backgroundColor: '#E8F1FD',
  },
  emptyIcon: {
    width: 37,
    height: 37,
    tintColor: colors.primaryBrandBlue,
  },
  emptyCheckBadge: {
    position: 'absolute',
    right: 4,
    bottom: 8,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.white,
    borderRadius: 14,
    backgroundColor: colors.success,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 20,
    fontWeight: '700',
    marginTop: 22,
  },
  emptyText: {
    maxWidth: 290,
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 11.5,
    lineHeight: 17,
    textAlign: 'center',
    marginTop: 8,
  },
  pressed: {
    opacity: 0.68,
  },
});
