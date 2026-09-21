import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AuthTextField, PasswordRecoveryLayout } from '../components';
import { colors, fonts } from '../theme';

type ForgotPasswordScreenProps = {
  onBack?: () => void;
  onContinue?: (identifier: string) => void;
};

function isValidIdentifier(value: string) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phonePattern = /^\+?[\d\s().-]+$/;
  const phoneDigits = value.replace(/\D/g, '');

  return (
    emailPattern.test(value) ||
    (phonePattern.test(value) && phoneDigits.length >= 8 && phoneDigits.length <= 15)
  );
}

export function ForgotPasswordScreen({
  onBack,
  onContinue,
}: ForgotPasswordScreenProps) {
  const [identifier, setIdentifier] = useState('');
  const [error, setError] = useState('');

  const handleContinue = () => {
    const normalizedIdentifier = identifier.trim();

    if (!isValidIdentifier(normalizedIdentifier)) {
      setError('Enter a valid email address or phone number.');
      return;
    }

    setError('');
    onContinue?.(normalizedIdentifier);
  };

  return (
    <PasswordRecoveryLayout
      actionLabel="Send code"
      onAction={handleContinue}
      onBack={onBack}
    >
      <View style={styles.copy}>
        <View style={styles.iconContainer}>
          <Ionicons
            color={colors.primaryBrandBlue}
            name="lock-closed-outline"
            size={27}
          />
        </View>
        <Text style={styles.title}>Forgot password?</Text>
        <Text style={styles.description}>
          Enter the email address or phone number linked to your account. We’ll
          send you a verification code.
        </Text>
      </View>

      <View style={styles.form}>
        <AuthTextField
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect={false}
          keyboardType="email-address"
          label="Email or Phone"
          onChangeText={(value) => {
            setIdentifier(value);
            if (error) setError('');
          }}
          onSubmitEditing={handleContinue}
          placeholder="Enter your email or phone"
          returnKeyType="send"
          textContentType="username"
          value={identifier}
        />
        {!!error && <Text style={styles.error}>{error}</Text>}
      </View>
    </PasswordRecoveryLayout>
  );
}

const styles = StyleSheet.create({
  copy: {
    alignItems: 'center',
    marginTop: 20,
  },
  iconContainer: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceGray,
    marginBottom: 24,
  },
  title: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 27,
    fontWeight: '700',
    textAlign: 'center',
  },
  description: {
    maxWidth: 335,
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 21,
    marginTop: 12,
    textAlign: 'center',
  },
  form: {
    marginTop: 48,
  },
  error: {
    color: colors.error,
    fontFamily: fonts.regular,
    fontSize: 12,
    marginTop: -10,
  },
});
