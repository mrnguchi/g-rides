import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import type { TextInputProps } from 'react-native';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, fonts } from '../theme';

type AuthTextFieldProps = TextInputProps & {
  label: string;
  password?: boolean;
};

export function AuthTextField({
  label,
  password = false,
  ...inputProps
}: AuthTextFieldProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputRow}>
        <TextInput
          {...inputProps}
          placeholderTextColor="#A8AEB8"
          secureTextEntry={password && !isPasswordVisible}
          style={styles.input}
        />

        {password && (
          <Pressable
            accessibilityLabel={
              isPasswordVisible ? 'Hide password' : 'Show password'
            }
            accessibilityRole="button"
            hitSlop={10}
            onPress={() => setIsPasswordVisible((isVisible) => !isVisible)}
            style={styles.visibilityButton}
          >
            <Ionicons
              color={colors.primaryDark}
              name={isPasswordVisible ? 'eye-outline' : 'eye-off-outline'}
              size={20}
            />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 18,
  },
  label: {
    color: colors.primaryBrandBlue,
    fontFamily: fonts.semiBold,
    fontSize: 17,
    fontWeight: '600',
  },
  inputRow: {
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#94A3B8',
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontFamily: fonts.regular,
    fontSize: 14,
    paddingTop: 8,
    paddingBottom: 7,
    paddingHorizontal: 0,
  },
  visibilityButton: {
    width: 28,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});
