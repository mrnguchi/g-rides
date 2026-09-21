import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AuthTextField, PasswordRecoveryLayout } from '../components';
import { colors, fonts } from '../theme';

type ResetPasswordScreenProps = {
  onBack?: () => void;
  onResetPassword?: (password: string) => void;
};

export function ResetPasswordScreen({
  onBack,
  onResetPassword,
}: ResetPasswordScreenProps) {
  const [password, setPassword] = useState('');
  const [confirmedPassword, setConfirmedPassword] = useState('');
  const [error, setError] = useState('');

  const handleResetPassword = () => {
    if (password.length < 8) {
      setError('Your password must contain at least 8 characters.');
      return;
    }

    if (password !== confirmedPassword) {
      setError('The passwords do not match.');
      return;
    }

    setError('');
    onResetPassword?.(password);
  };

  const handlePasswordChange = (value: string, isConfirmation = false) => {
    if (isConfirmation) setConfirmedPassword(value);
    else setPassword(value);
    if (error) setError('');
  };

  return (
    <PasswordRecoveryLayout
      actionLabel="Reset password"
      onAction={handleResetPassword}
      onBack={onBack}
    >
      <View style={styles.copy}>
        <View style={styles.iconContainer}>
          <Ionicons
            color={colors.primaryBrandBlue}
            name="key-outline"
            size={28}
          />
        </View>
        <Text style={styles.title}>Create new password</Text>
        <Text style={styles.description}>
          Choose a secure password that you haven’t used before.
        </Text>
      </View>

      <View style={styles.form}>
        <AuthTextField
          autoCapitalize="none"
          autoComplete="new-password"
          label="New Password"
          onChangeText={(value) => handlePasswordChange(value)}
          onSubmitEditing={handleResetPassword}
          password
          placeholder="Enter your new password"
          textContentType="newPassword"
          value={password}
        />
        <AuthTextField
          autoCapitalize="none"
          autoComplete="new-password"
          label="Confirm New Password"
          onChangeText={(value) => handlePasswordChange(value, true)}
          onSubmitEditing={handleResetPassword}
          password
          placeholder="Re-enter your new password"
          returnKeyType="done"
          textContentType="newPassword"
          value={confirmedPassword}
        />
        {!!error ? (
          <Text style={styles.error}>{error}</Text>
        ) : (
          <Text style={styles.hint}>Use at least 8 characters.</Text>
        )}
      </View>
    </PasswordRecoveryLayout>
  );
}

const styles = StyleSheet.create({
  copy: {
    alignItems: 'center',
    marginTop: 8,
  },
  iconContainer: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceGray,
    marginBottom: 22,
  },
  title: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 27,
    fontWeight: '700',
    textAlign: 'center',
  },
  description: {
    maxWidth: 320,
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 21,
    marginTop: 12,
    textAlign: 'center',
  },
  form: {
    marginTop: 42,
  },
  hint: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 12,
    marginTop: -8,
  },
  error: {
    color: colors.error,
    fontFamily: fonts.regular,
    fontSize: 12,
    marginTop: -8,
  },
});
