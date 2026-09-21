import { StatusBar } from 'expo-status-bar';
import {
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, fonts } from '../theme';

const backgroundImage = require('../../assets/images/welcome-bg.jpeg');
const brandLogo = require('../../assets/images/logo.png');

type WelcomeScreenProps = {
  onLogin?: () => void;
  onSignUp?: () => void;
};

export function WelcomeScreen({ onLogin, onSignUp }: WelcomeScreenProps) {
  return (
    <ImageBackground
      resizeMode="cover"
      source={backgroundImage}
      style={styles.background}
    >
      <SafeAreaView edges={['top', 'bottom']} style={styles.overlay}>
        <StatusBar hidden />

        <View style={styles.content}>
          <View style={styles.brand}>
            <Image
              accessibilityLabel="G-Rides logo"
              resizeMode="contain"
              source={brandLogo}
              style={styles.logo}
            />
            <Text style={styles.brandName}>- rides</Text>
          </View>

          <View style={styles.copy}>
            <Text style={styles.title}>Welcome</Text>
            <Text style={styles.description}>
              Find trusted cars nearby and rent{`\n`}with ease.
            </Text>
          </View>

          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              onPress={onLogin}
              style={({ pressed }) => [
                styles.button,
                styles.loginButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.loginText}>Login</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={onSignUp}
              style={({ pressed }) => [
                styles.button,
                styles.signUpButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.signUpText}>Sign Up</Text>
            </Pressable>
          </View>
        </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  brand: {
    height: 126,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 52,
  },
  logo: {
    width: 150,
    height: 126,
    marginRight: -31,
  },
  brandName: {
    color: colors.white,
    fontFamily: fonts.semiBold,
    fontSize: 34,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  copy: {
    position: 'absolute',
    top: '46%',
    right: 24,
    left: 24,
    alignItems: 'center',
  },
  title: {
    color: colors.white,
    fontFamily: fonts.bold,
    fontSize: 34,
    fontWeight: '700',
    textAlign: 'center',
  },
  description: {
    color: colors.backgroundLight,
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 21,
    marginTop: 14,
    textAlign: 'center',
  },
  actions: {
    marginTop: 'auto',
    paddingBottom: 8,
  },
  button: {
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButton: {
    borderWidth: 1,
    borderColor: colors.white,
    backgroundColor: 'transparent',
  },
  signUpButton: {
    backgroundColor: colors.backgroundLight,
    marginTop: 14,
  },
  loginText: {
    color: colors.white,
    fontFamily: fonts.semiBold,
    fontSize: 20,
    fontWeight: '600',
  },
  signUpText: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 20,
    fontWeight: '600',
  },
  buttonPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
});
