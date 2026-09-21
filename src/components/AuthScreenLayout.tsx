import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';
import {
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { colors, fonts } from '../theme';

const backgroundImage = require('../../assets/images/welcome-bg.jpeg');
const brandLogo = require('../../assets/images/logo.png');

type AuthScreenLayoutProps = {
  children: ReactNode;
  title: string;
  variant: 'login' | 'signUp';
};

export function AuthScreenLayout({
  children,
  title,
  variant,
}: AuthScreenLayoutProps) {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const usableHeight = height - insets.top - insets.bottom;
  const sheetHeight =
    variant === 'signUp'
      ? Math.min(590, Math.max(430, usableHeight - 155))
      : Math.min(470, Math.max(390, usableHeight - 280));

  return (
    <ImageBackground
      resizeMode="cover"
      source={backgroundImage}
      style={styles.background}
    >
      <SafeAreaView edges={['top']} style={styles.overlay}>
        <StatusBar hidden />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.title}>{title}</Text>
              <Image
                accessibilityLabel="G-Rides logo"
                resizeMode="contain"
                source={brandLogo}
                style={styles.logo}
              />
            </View>
          </View>

          <View
            style={[
              styles.sheet,
              {
                height: sheetHeight + insets.bottom,
                paddingBottom: insets.bottom,
              },
            ]}
          >
            {children}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: colors.primaryDark,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.82)',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flex: 1,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 52,
    paddingHorizontal: 28,
  },
  title: {
    maxWidth: '65%',
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 36,
  },
  logo: {
    width: 126,
    height: 106,
    marginRight: -18,
  },
  sheet: {
    overflow: 'hidden',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    backgroundColor: colors.backgroundLight,
  },
});
