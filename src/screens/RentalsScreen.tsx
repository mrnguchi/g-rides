import type { ImageSourcePropType } from 'react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  ActiveRentalCard,
  HomeBottomNavigation,
  RentalSummaryCard,
} from '../components';
import type { MainTab } from '../components';
import {
  MOCK_ACTIVE_RENTAL,
  MOCK_RENTAL_HISTORY,
  MOCK_UPCOMING_RENTALS,
} from '../constants/mockRentals';
import { colors, fonts, layout } from '../theme';
import type { RentalRecord } from '../types/rental';

type ActivityScreenProps = {
  onOpenRental?: (rental: RentalRecord) => void;
  onTabPress?: (tab: MainTab) => void;
  unreadMessagesCount?: number;
};

type RentalTab = 'active' | 'canceled' | 'completed';

const activeIcon = require('../../assets/images/time-left.png');
const canceledIcon = require('../../assets/images/forbidden.png');
const completedIcon = require('../../assets/images/check-mark.png');

const tabs: Array<{
  icon: ImageSourcePropType;
  key: RentalTab;
  label: string;
}> = [
  { key: 'active', label: 'Active', icon: activeIcon },
  { key: 'completed', label: 'Completed', icon: completedIcon },
  { key: 'canceled', label: 'Canceled', icon: canceledIcon },
];

const ACTIVE_RENTAL_DURATION_MS =
  ((2 * 24 + 4) * 60 + 32) * 60 * 1000;

function formatCountdown(remainingMs: number) {
  const totalMinutes = Math.max(0, Math.floor(remainingMs / 60_000));
  const days = Math.floor(totalMinutes / (24 * 60));
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
  const minutes = totalMinutes % 60;

  return `${days}d : ${hours.toString().padStart(2, '0')}h : ${minutes
    .toString()
    .padStart(2, '0')}m`;
}

export function ActivityScreen({
  onOpenRental,
  onTabPress,
  unreadMessagesCount = 0,
}: ActivityScreenProps) {
  const rentalEndsAtRef = useRef(Date.now() + ACTIVE_RENTAL_DURATION_MS);
  const [activeTab, setActiveTab] = useState<RentalTab>('active');
  const [actionNotice, setActionNotice] = useState<string>();
  const [remainingMs, setRemainingMs] = useState(ACTIVE_RENTAL_DURATION_MS);

  useEffect(() => {
    const countdownTimer = setInterval(() => {
      setRemainingMs(rentalEndsAtRef.current - Date.now());
    }, 30_000);

    return () => clearInterval(countdownTimer);
  }, []);

  useEffect(() => {
    if (!actionNotice) return undefined;
    const noticeTimer = setTimeout(() => setActionNotice(undefined), 3200);
    return () => clearTimeout(noticeTimer);
  }, [actionNotice]);

  const displayedHistory = useMemo(
    () =>
      MOCK_RENTAL_HISTORY.filter((rental) => rental.status === activeTab),
    [activeTab],
  );

  const handleRentalAction = (action: 'extend' | 'report' | 'return') => {
    const messages = {
      extend: 'Your rental extension request is ready to review.',
      report: 'Support has been notified. We will contact you shortly.',
      return: 'Your vehicle return checklist is ready.',
    };
    setActionNotice(messages[action]);
  };

  const renderSummaryList = (rentals: RentalRecord[]) => {
    if (!rentals.length) {
      return (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <Image
              resizeMode="contain"
              source={activeTab === 'canceled' ? canceledIcon : completedIcon}
              style={styles.emptyIcon}
            />
          </View>
          <Text style={styles.emptyTitle}>No {activeTab} rentals</Text>
          <Text style={styles.emptyText}>
            Your {activeTab} rental history will appear here.
          </Text>
        </View>
      );
    }

    return rentals.map((rental) => (
      <RentalSummaryCard
        key={rental.id}
        onPress={() => onOpenRental?.(rental)}
        rental={rental}
      />
    ));
  };

  return (
    <View style={styles.screen}>
      <StatusBar backgroundColor={colors.backgroundLight} style="dark" />
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Activity</Text>
          <Text style={styles.subtitle}>Your rentals and service history</Text>

          <View accessibilityRole="tablist" style={styles.tabBar}>
            {tabs.map((tab) => {
              const selected = tab.key === activeTab;
              return (
                <Pressable
                  key={tab.key}
                  accessibilityRole="tab"
                  accessibilityState={{ selected }}
                  onPress={() => {
                    setActiveTab(tab.key);
                    setActionNotice(undefined);
                  }}
                  style={({ pressed }) => [
                    styles.tab,
                    selected && styles.activeTab,
                    pressed && styles.pressed,
                  ]}
                >
                  <Image
                    resizeMode="contain"
                    source={tab.icon}
                    style={[
                      styles.tabIcon,
                      {
                        tintColor: selected
                          ? colors.white
                          : colors.textPrimary,
                      },
                    ]}
                  />
                  <Text style={[styles.tabText, selected && styles.activeTabText]}>
                    {tab.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {actionNotice && (
            <View style={styles.actionNotice}>
              <Image
                resizeMode="contain"
                source={completedIcon}
                style={styles.actionNoticeIcon}
              />
              <Text style={styles.actionNoticeText}>{actionNotice}</Text>
            </View>
          )}

          {activeTab === 'active' ? (
            <>
              <ActiveRentalCard
                countdown={formatCountdown(remainingMs)}
                onAction={handleRentalAction}
                rental={MOCK_ACTIVE_RENTAL}
              />
              <View style={styles.upcomingSection}>
                <Text style={styles.sectionTitle}>Upcoming rental</Text>
                {MOCK_UPCOMING_RENTALS.map((rental) => (
                  <RentalSummaryCard
                    key={rental.id}
                    onPress={() => onOpenRental?.(rental)}
                    rental={rental}
                  />
                ))}
              </View>
            </>
          ) : (
            <View style={styles.historySection}>
              <View style={styles.historyHeader}>
                <Text style={styles.sectionTitle}>
                  {activeTab === 'completed'
                    ? 'Completed rentals'
                    : 'Canceled rentals'}
                </Text>
                <Text style={styles.historyCount}>
                  {displayedHistory.length}{' '}
                  {displayedHistory.length === 1 ? 'rental' : 'rentals'}
                </Text>
              </View>
              {renderSummaryList(displayedHistory)}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>

      <HomeBottomNavigation
        activeTab="activity"
        onTabPress={onTabPress}
        unreadMessagesCount={unreadMessagesCount}
      />
    </View>
  );
}

// Temporary compatibility alias while imports migrate to ActivityScreen.
export const RentalsScreen = ActivityScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    paddingHorizontal: layout.screenGutter,
    paddingTop: 28,
    paddingBottom: 126,
  },
  title: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 25,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 13,
    marginBottom: 18,
    marginTop: 3,
  },
  tabBar: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 25,
    backgroundColor: colors.white,
    padding: 4,
    marginTop: 0,
    marginBottom: 22,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  tab: {
    height: 42,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderRadius: 21,
  },
  activeTab: {
    backgroundColor: colors.primaryBrandBlue,
  },
  tabIcon: {
    width: 17,
    height: 17,
  },
  tabText: {
    color: colors.textPrimary,
    fontFamily: fonts.medium,
    fontSize: 12,
    fontWeight: '500',
  },
  activeTabText: {
    color: colors.white,
  },
  actionNotice: {
    minHeight: 43,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#D8EBDD',
    borderRadius: 10,
    backgroundColor: '#F2FBF5',
    paddingHorizontal: 12,
    marginBottom: 13,
  },
  actionNoticeIcon: {
    width: 18,
    height: 18,
    tintColor: colors.success,
  },
  actionNoticeText: {
    flex: 1,
    color: colors.success,
    fontFamily: fonts.medium,
    fontSize: 10.5,
    fontWeight: '500',
    lineHeight: 15,
  },
  upcomingSection: {
    marginTop: 24,
  },
  historySection: {
    minHeight: 360,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 13,
  },
  historyCount: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 11,
    marginBottom: 13,
  },
  emptyState: {
    minHeight: 270,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 32,
    backgroundColor: colors.surfaceGray,
  },
  emptyIcon: {
    width: 29,
    height: 29,
    tintColor: colors.primaryBrandBlue,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 15,
  },
  emptyText: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 12,
    marginTop: 6,
  },
  pressed: {
    opacity: 0.72,
  },
});
