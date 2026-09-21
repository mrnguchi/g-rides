import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  AuthScreenLayout,
  AuthTextField,
  SocialAuthButtons,
} from '../components';
import { colors, fonts } from '../theme';

type LoginScreenProps = {
  onForgotPassword?: () => void;
  onLogin?: () => void;
  onSignUp?: () => void;
};

export function LoginScreen({
  onForgotPassword,
  onLogin,
  onSignUp,
}: LoginScreenProps) {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');

  return (
    <AuthScreenLayout title={'Welcome back\nLogin'} variant="login">
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <AuthTextField
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          label="Email or Phone"
          onChangeText={setEmailOrPhone}
          placeholder="Enter your email or phone"
          textContentType="username"
          value={emailOrPhone}
        />
        <AuthTextField
          autoCapitalize="none"
          autoComplete="current-password"
          label="Password"
          onChangeText={setPassword}
          password
          placeholder="Enter your password"
          textContentType="password"
          value={password}
        />

        <Pressable
          accessibilityRole="button"
          onPress={onForgotPassword}
          style={styles.forgotPasswordButton}
        >
          <Text style={styles.forgotPasswordText}>Forgot password</Text>
        </Pressable>

        <Text style={styles.dividerText}>Or login with</Text>
        <SocialAuthButtons />

        <Pressable
          accessibilityRole="button"
          onPress={onLogin}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.primaryButtonText}>Login</Text>
        </Pressable>

        <View style={styles.accountPrompt}>
          <Text style={styles.accountText}>Don’t have an account?</Text>
          <Pressable accessibilityRole="button" onPress={onSignUp}>
            <Text style={styles.accountLink}>Sign Up</Text>
          </Pressable>
        </View>
      </ScrollView>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingTop: 46,
    paddingHorizontal: 26,
    paddingBottom: 18,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginTop: -12,
  },
  forgotPasswordText: {
    color: colors.primaryBrandBlue,
    fontFamily: fonts.medium,
    fontSize: 12,
    fontWeight: '500',
  },
  dividerText: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 12,
    marginTop: 40,
    marginBottom: 8,
    textAlign: 'center',
  },
  primaryButton: {
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryBrandBlue,
    marginTop: 24,
  },
  primaryButtonText: {
    color: colors.white,
    fontFamily: fonts.semiBold,
    fontSize: 17,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
  accountPrompt: {
    alignItems: 'flex-end',
    marginTop: 30,
  },
  accountText: {
    color: colors.textPrimary,
    fontFamily: fonts.regular,
    fontSize: 12,
  },
  accountLink: {
    color: colors.primaryBrandBlue,
    fontFamily: fonts.semiBold,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
});
