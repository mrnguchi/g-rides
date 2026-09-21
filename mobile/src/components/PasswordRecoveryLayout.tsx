import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useScreenBackNavigation } from '../hooks/useScreenBackNavigation';
import { colors, fonts } from '../theme';
import { BackButton } from './BackButton';

type PasswordRecoveryLayoutProps = {
  actionDisabled?: boolean;
  actionLabel: string;
  children: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  onAction?: () => void;
  onBack?: () => void;
  showBackButton?: boolean;
};

export function PasswordRecoveryLayout({
  actionDisabled = false,
  actionLabel,
  children,
  contentStyle,
  onAction,
  onBack,
  showBackButton = true,
}: PasswordRecoveryLayoutProps) {
  const backGestureHandlers = useScreenBackNavigation(
    onBack,
    showBackButton,
  );

  return (
    <SafeAreaView
      edges={['top', 'bottom']}
      style={styles.safeArea}
      {...backGestureHandlers}
    >
      <StatusBar style="dark" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          {showBackButton && <BackButton onPress={onBack} />}
        </View>

        <View style={[styles.content, contentStyle]}>{children}</View>

        <View style={styles.footer}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: actionDisabled }}
            disabled={actionDisabled}
            onPress={onAction}
            style={({ pressed }) => [
              styles.actionButton,
              actionDisabled && styles.actionButtonDisabled,
              pressed && styles.actionButtonPressed,
            ]}
          >
            <Text style={styles.actionLabel}>{actionLabel}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    height: 76,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 10,
  },
  actionButton: {
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryBrandBlue,
  },
  actionButtonDisabled: {
    opacity: 0.45,
  },
  actionButtonPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
  actionLabel: {
    color: colors.white,
    fontFamily: fonts.semiBold,
    fontSize: 18,
    fontWeight: '600',
  },
});
