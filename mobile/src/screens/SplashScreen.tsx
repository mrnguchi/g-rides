import { StatusBar } from 'expo-status-bar';
import { Image, StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '../theme';

const logo = require('../../assets/images/logo.png');

export function SplashScreen() {
  return (
    <View style={styles.container}>
      <StatusBar hidden />

      <View style={styles.logoContainer}>
        <Image
          accessibilityLabel="G-Rides logo"
          resizeMode="contain"
          source={logo}
          style={styles.logo}
        />
      </View>

      <Text style={styles.wordmark}>G - Rides</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryDark,
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 170,
    height: 144,
  },
  wordmark: {
    position: 'absolute',
    right: 0,
    bottom: 30,
    left: 0,
    color: colors.backgroundLight,
    fontFamily: fonts.semiBold,
    fontSize: 24,
    fontWeight: '600',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
});
