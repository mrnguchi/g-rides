import Ionicons from '@expo/vector-icons/Ionicons';
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

type SignUpScreenProps = {
  onLogin?: () => void;
  onSignUp?: () => void;
};

export function SignUpScreen({ onLogin, onSignUp }: SignUpScreenProps) {
  const [fullName, setFullName] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmedPassword, setConfirmedPassword] = useState('');
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(true);

  return (
    <AuthScreenLayout title={'Create your\nAccount'} variant="signUp">
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <AuthTextField
          autoCapitalize="words"
          autoComplete="name"
          label="Full name"
          onChangeText={setFullName}
          placeholder="Enter your full name"
          textContentType="name"
          value={fullName}
        />
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
          autoComplete="new-password"
          label="Password"
          onChangeText={setPassword}
          password
          placeholder="Enter your password"
          textContentType="newPassword"
          value={password}
        />
        <AuthTextField
          autoCapitalize="none"
          autoComplete="new-password"
          label="Confirm Password"
          onChangeText={setConfirmedPassword}
          password
          placeholder="Confirm your password"
          textContentType="newPassword"
          value={confirmedPassword}
        />

        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: hasAcceptedTerms }}
          onPress={() => setHasAcceptedTerms((isAccepted) => !isAccepted)}
          style={styles.terms}
        >
          <View
            style={[
              styles.checkbox,
              hasAcceptedTerms && styles.checkboxSelected,
            ]}
          >
            {hasAcceptedTerms && (
              <Ionicons color={colors.white} name="checkmark" size={14} />
            )}
          </View>
          <Text style={styles.termsText}>
            Agree with <Text style={styles.termsLink}>Terms & conditions</Text>
          </Text>
        </Pressable>

        <Text style={styles.dividerText}>Or sign up with</Text>
        <SocialAuthButtons />

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: !hasAcceptedTerms }}
          disabled={!hasAcceptedTerms}
          onPress={onSignUp}
          style={({ pressed }) => [
            styles.primaryButton,
            !hasAcceptedTerms && styles.primaryButtonDisabled,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.primaryButtonText}>Sign Up</Text>
        </Pressable>

        <View style={styles.accountPrompt}>
          <Text style={styles.accountText}>Already have an account?</Text>
          <Pressable accessibilityRole="button" onPress={onLogin}>
            <Text style={styles.accountLink}>Login</Text>
          </Pressable>
        </View>
      </ScrollView>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingTop: 26,
    paddingHorizontal: 26,
    paddingBottom: 18,
  },
  terms: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -2,
  },
  checkbox: {
    width: 17,
    height: 17,
    borderWidth: 1,
    borderColor: colors.primaryBrandBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxSelected: {
    backgroundColor: colors.primaryBrandBlue,
  },
  termsText: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 12,
  },
  termsLink: {
    color: colors.primaryBrandBlue,
    fontFamily: fonts.medium,
    fontWeight: '500',
  },
  dividerText: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 12,
    marginTop: 43,
    marginBottom: 8,
    textAlign: 'center',
  },
  primaryButton: {
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryBrandBlue,
    marginTop: 20,
  },
  primaryButtonDisabled: {
    opacity: 0.45,
  },
  primaryButtonText: {
    color: colors.white,
    fontFamily: fonts.semiBold,
    fontSize: 17,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
  accountPrompt: {
    alignItems: 'flex-end',
    marginTop: 18,
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
