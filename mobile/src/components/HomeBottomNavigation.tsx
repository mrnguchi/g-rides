import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  colors,
  fonts,
  layout,
  radii,
  shadows,
  surfaces,
} from '../theme';
import type { MainTab } from '../types/navigation';
import { AppIcon, type AppIconName } from './AppIcon';

export type { MainTab } from '../types/navigation';

type HomeBottomNavigationProps = {
  activeTab?: MainTab;
  onTabPress?: (tab: MainTab) => void;
  unreadMessagesCount?: number;
};

const tabs: Array<{
  icon: AppIconName;
  key: MainTab;
  label: string;
}> = [
  { key: 'home', label: 'Home', icon: 'home' },
  {
    key: 'discover',
    label: 'Discover',
    icon: 'discover',
  },
  {
    key: 'activity',
    label: 'Activity',
    icon: 'activity',
  },
  {
    key: 'messages',
    label: 'Messages',
    icon: 'messages',
  },
  { key: 'profile', label: 'Profile', icon: 'profile' },
];

export function HomeBottomNavigation({
  activeTab = 'home',
  onTabPress,
  unreadMessagesCount = 0,
}: HomeBottomNavigationProps) {
  return (
    <SafeAreaView edges={['bottom']} pointerEvents="box-none" style={styles.safeArea}>
      <View style={styles.navigation}>
        {tabs.map((tab) => {
          const active = tab.key === activeTab;

          return (
            <Pressable
              key={tab.key}
              accessibilityLabel={
                tab.key === 'messages' && unreadMessagesCount > 0
                  ? `${tab.label}, ${unreadMessagesCount} unread`
                  : tab.label
              }
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              onPress={() => onTabPress?.(tab.key)}
              style={({ pressed }) => [
                styles.tab,
                active && styles.activeTab,
                pressed && styles.tabPressed,
              ]}
            >
              <View>
                <AppIcon
                  color={active ? colors.white : colors.textSecondary}
                  name={tab.icon}
                  size={23}
                  solid={active}
                  strokeWidth={active ? 2 : 1.65}
                />
                {tab.key === 'messages' && unreadMessagesCount > 0 && (
                  <View style={styles.notificationDot} />
                )}
              </View>
              <Text style={[styles.label, active && styles.activeLabel]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    position: 'absolute',
    zIndex: 100,
    right: 0,
    bottom: 0,
    left: 0,
    paddingHorizontal: layout.screenGutter,
  },
  navigation: {
    height: 74,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderRadius: radii.xl,
    backgroundColor: surfaces.raised,
    padding: 6,
    ...shadows.floating,
    transform: [{ translateY: 6 }],
  },
  tab: {
    minWidth: 56,
    minHeight: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    paddingHorizontal: 5,
    paddingVertical: 5,
  },
  activeTab: {
    backgroundColor: colors.primaryBrandBlue,
  },
  tabPressed: {
    opacity: 0.62,
  },
  label: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 9,
    fontWeight: '500',
    marginTop: 5,
  },
  activeLabel: {
    color: colors.white,
    fontFamily: fonts.semiBold,
    fontWeight: '600',
  },
  notificationDot: {
    position: 'absolute',
    top: -1,
    right: -1,
    width: 6,
    height: 6,
    borderWidth: 1,
    borderColor: colors.white,
    borderRadius: 3,
    backgroundColor: colors.error,
  },
});
