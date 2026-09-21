import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

import { PasswordRecoveryLayout } from '../components';
import { colors, fonts } from '../theme';

type PasswordResetSuccessScreenProps = {
  onLogin?: () => void;
};

export function PasswordResetSuccessScreen({
  onLogin,
}: PasswordResetSuccessScreenProps) {
  return (
    <PasswordRecoveryLayout
      actionLabel="Back to Login"
      onAction={onLogin}
      showBackButton={false}
    >
      <View style={styles.content}>
        <View style={styles.successIcon}>
          <Ionicons color={colors.white} name="checkmark" size={42} />
        </View>
        <Text style={styles.title}>Password reset</Text>
        <Text style={styles.description}>
          Your password has been changed successfully. You can now log in with
          your new password.
        </Text>
      </View>
    </PasswordRecoveryLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -80,
    flex: 1,
  },
  successIcon: {
    width: 82,
    height: 82,
    borderRadius: 41,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success,
    marginBottom: 28,
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
});
