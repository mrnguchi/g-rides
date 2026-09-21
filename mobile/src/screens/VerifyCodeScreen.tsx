import { useEffect, useRef, useState } from 'react';
import type { NativeSyntheticEvent, TextInputKeyPressEventData } from 'react-native';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { PasswordRecoveryLayout } from '../components';
import { colors, fonts } from '../theme';

const CODE_LENGTH = 4;
const RESEND_DELAY_SECONDS = 30;

type VerifyCodeScreenProps = {
  identifier: string;
  onBack?: () => void;
  onResend?: (identifier: string) => void;
  onVerify?: (code: string) => void;
};

export function VerifyCodeScreen({
  identifier,
  onBack,
  onResend,
  onVerify,
}: VerifyCodeScreenProps) {
  const [digits, setDigits] = useState(() => Array(CODE_LENGTH).fill(''));
  const [resendSeconds, setResendSeconds] = useState(RESEND_DELAY_SECONDS);
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const code = digits.join('');
  const deliveryMethod = identifier.includes('@')
    ? 'email address'
    : 'phone number';

  useEffect(() => {
    if (resendSeconds === 0) return;

    const timer = setTimeout(() => {
      setResendSeconds((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => clearTimeout(timer);
  }, [resendSeconds]);

  const handleDigitChange = (value: string, index: number) => {
    const enteredDigits = value.replace(/\D/g, '').slice(0, CODE_LENGTH);

    if (!enteredDigits) {
      setDigits((currentDigits) => {
        const nextDigits = [...currentDigits];
        nextDigits[index] = '';
        return nextDigits;
      });
      return;
    }

    setDigits((currentDigits) => {
      const nextDigits = [...currentDigits];
      enteredDigits.split('').forEach((digit, offset) => {
        const targetIndex = index + offset;
        if (targetIndex < CODE_LENGTH) nextDigits[targetIndex] = digit;
      });
      return nextDigits;
    });

    const nextIndex = Math.min(index + enteredDigits.length, CODE_LENGTH - 1);
    if (index + enteredDigits.length >= CODE_LENGTH) {
      inputRefs.current[CODE_LENGTH - 1]?.blur();
    } else {
      inputRefs.current[nextIndex]?.focus();
    }
  };

  const handleKeyPress = (
    event: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number,
  ) => {
    if (event.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = () => {
    if (resendSeconds > 0) return;

    setDigits(Array(CODE_LENGTH).fill(''));
    setResendSeconds(RESEND_DELAY_SECONDS);
    inputRefs.current[0]?.focus();
    onResend?.(identifier);
  };

  return (
    <PasswordRecoveryLayout
      actionDisabled={code.length !== CODE_LENGTH}
      actionLabel="Verify"
      contentStyle={styles.content}
      onAction={() => onVerify?.(code)}
      onBack={onBack}
    >
      <View style={styles.verificationContent}>
        <Text style={styles.title}>Verify code</Text>
        <Text style={styles.description}>
          Please enter the code we just sent to{`\n`}this {deliveryMethod}
        </Text>
        <Text style={styles.identifier}>{identifier}</Text>

        <View accessibilityLabel="Four-digit verification code" style={styles.codeRow}>
          {digits.map((digit, index) => (
            <TextInput
              key={index}
              ref={(input) => {
                inputRefs.current[index] = input;
              }}
              accessibilityLabel={`Verification code digit ${index + 1}`}
              autoComplete="one-time-code"
              caretHidden
              keyboardType="number-pad"
              maxLength={CODE_LENGTH}
              onChangeText={(value) => handleDigitChange(value, index)}
              onKeyPress={(event) => handleKeyPress(event, index)}
              selectTextOnFocus
              style={[styles.codeInput, digit && styles.codeInputFilled]}
              textContentType="oneTimeCode"
              value={digit}
            />
          ))}
        </View>

        <View style={styles.resendContainer}>
          <Text style={styles.resendPrompt}>Didn’t receive OTP?</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: resendSeconds > 0 }}
            disabled={resendSeconds > 0}
            hitSlop={10}
            onPress={handleResend}
          >
            <Text
              style={[
                styles.resendText,
                resendSeconds > 0 && styles.resendTextDisabled,
              ]}
            >
              {resendSeconds > 0
                ? `Resend code in 0:${String(resendSeconds).padStart(2, '0')}`
                : 'Resend code'}
            </Text>
          </Pressable>
        </View>
      </View>
    </PasswordRecoveryLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 22,
  },
  verificationContent: {
    alignItems: 'center',
    paddingTop: 84,
  },
  title: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 27,
    fontWeight: '700',
    textAlign: 'center',
  },
  description: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 20,
    marginTop: 12,
    textAlign: 'center',
  },
  identifier: {
    color: colors.primaryBrandBlue,
    fontFamily: fonts.semiBold,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  codeRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 70,
  },
  codeInput: {
    width: 59,
    height: 48,
    borderWidth: 1,
    borderColor: colors.borderGray,
    borderRadius: 8,
    color: colors.textPrimary,
    backgroundColor: colors.surfaceGray,
    fontFamily: fonts.medium,
    fontSize: 16,
    fontWeight: '500',
    padding: 0,
    textAlign: 'center',
  },
  codeInputFilled: {
    borderColor: colors.primaryBrandBlue,
    backgroundColor: colors.white,
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: 66,
  },
  resendPrompt: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 15,
  },
  resendText: {
    color: colors.primaryBrandBlue,
    fontFamily: fonts.semiBold,
    fontSize: 15,
    fontWeight: '600',
    marginTop: 8,
  },
  resendTextDisabled: {
    color: colors.textSecondary,
  },
});
