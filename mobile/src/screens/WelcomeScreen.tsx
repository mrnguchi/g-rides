import { StatusBar } from 'expo-status-bar';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, fonts } from '../theme';

const vehicleImage = require('../../assets/images/cars/toyota/4runner/toyota 4runner.png');
const brandLogo = require('../../assets/images/splash-icon.png');

type WelcomeScreenProps = {
  onLogin?: () => void;
  onSignUp?: () => void;
};

export function WelcomeScreen({ onLogin, onSignUp }: WelcomeScreenProps) {
  return (
      <SafeAreaView edges={['top', 'bottom']} style={styles.overlay}>
        <StatusBar style="dark" />

        <View style={styles.content}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.introduction}>
          <View style={styles.vehicleCard}>
            <View style={styles.vehicleStage}>
              <Image source={vehicleImage} resizeMode="contain" accessibilityLabel="Toyota 4Runner" style={styles.vehicleImage} />
            </View>
          <View style={styles.brand}>
            <Image
              accessibilityLabel="G-Rides logo"
              resizeMode="contain"
              source={brandLogo}
              style={styles.logo}
            />
            <Text style={styles.brandName}>- rides</Text>
          </View>
          </View>

          <View style={styles.copy}>
            <Text style={styles.title}>Welcome</Text>
            <Text style={styles.description}>
              Find trusted cars nearby and rent{`\n`}with ease.
            </Text>
          </View>
          </ScrollView>

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
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  introduction: {
    flexGrow: 1,
    paddingTop: 24,
    paddingBottom: 24,
  },
  vehicleCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 28,
    padding: 18,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.09,
    shadowRadius: 18,
    elevation: 4,
  },
  vehicleStage: {
    width: '100%',
    aspectRatio: 1.55,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vehicleImage: { width: '100%', height: '100%' },
  brand: {
    height: 74,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  logo: {
    width: 98,
    height: 74,
    marginRight: -20,
  },
  brandName: {
    color: colors.primaryDark,
    fontFamily: fonts.semiBold,
    fontSize: 29,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  copy: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingTop: 32,
    paddingBottom: 16,
    alignItems: 'center',
  },
  title: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
  },
  description: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 24,
    marginTop: 12,
    textAlign: 'center',
  },
  actions: {
    paddingTop: 12,
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
    borderColor: colors.primaryBrandBlue,
    backgroundColor: colors.white,
  },
  signUpButton: {
    backgroundColor: colors.primaryBrandBlue,
    marginTop: 14,
  },
  loginText: {
    color: colors.primaryBrandBlue,
    fontFamily: fonts.semiBold,
    fontSize: 16,
    fontWeight: '600',
  },
  signUpText: {
    color: colors.white,
    fontFamily: fonts.semiBold,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
});
