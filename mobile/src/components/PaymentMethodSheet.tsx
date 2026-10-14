import Ionicons from '@expo/vector-icons/Ionicons';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useScreenBackNavigation } from '../hooks/useScreenBackNavigation';
import { colors, fonts, layout, moneyText } from '../theme';

export type PaymentMethod = 'mtnMomo' | 'orangeMoney';

type PaymentMethodSheetProps = {
  amount: string;
  bookingReference: string;
  onClose: () => void;
  onContinue: (method: PaymentMethod) => void;
  visible: boolean;
};

const mtnMomoIcon = require('../../assets/images/momo.jpeg');
const orangeMoneyIcon = require('../../assets/images/orange-money.png');

const methods: Array<{
  description: string;
  icon: number;
  id: PaymentMethod;
  label: string;
}> = [
  {
    description: 'Pay from your MTN Mobile Money wallet',
    icon: mtnMomoIcon,
    id: 'mtnMomo',
    label: 'MTN MoMo',
  },
  {
    description: 'Pay from your Orange Money wallet',
    icon: orangeMoneyIcon,
    id: 'orangeMoney',
    label: 'Orange Money',
  },
];

export function PaymentMethodSheet({
  amount,
  bookingReference,
  onClose,
  onContinue,
  visible,
}: PaymentMethodSheetProps) {
  const [selectedMethod, setSelectedMethod] =
    useState<PaymentMethod>('mtnMomo');
  const backGestureHandlers = useScreenBackNavigation(onClose, visible);

  useEffect(() => {
    if (visible) setSelectedMethod('mtnMomo');
  }, [visible]);

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      presentationStyle="overFullScreen"
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View style={styles.modalRoot} {...backGestureHandlers}>
        <StatusBar style="light" />
        <Pressable
          accessibilityLabel="Close payment methods"
          accessibilityRole="button"
          onPress={onClose}
          style={styles.backdrop}
        />

        <SafeAreaView edges={['bottom']} style={styles.sheetSafeArea}>
          <View style={styles.sheet}>
            <View style={styles.handle} />

            <View style={styles.header}>
              <View style={styles.headerCopy}>
                <Text style={styles.eyebrow}>SECURE CHECKOUT</Text>
                <Text style={styles.title}>Choose payment method</Text>
              </View>
              <Pressable
                accessibilityLabel="Close payment methods"
                accessibilityRole="button"
                hitSlop={8}
                onPress={onClose}
                style={({ pressed }) => [
                  styles.closeButton,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons color={colors.textPrimary} name="close" size={22} />
              </Pressable>
            </View>

            <View style={styles.amountCard}>
              <View>
                <Text style={styles.amountLabel}>Amount due</Text>
                <Text style={styles.bookingReference}>
                  Booking #{bookingReference}
                </Text>
              </View>
              <Text style={styles.amount}>{amount}</Text>
            </View>

            <Text style={styles.sectionLabel}>Pay with</Text>
            <View style={styles.methodList}>
              {methods.map((method) => {
                const selected = selectedMethod === method.id;

                return (
                  <Pressable
                    key={method.id}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: selected }}
                    onPress={() => setSelectedMethod(method.id)}
                    style={({ pressed }) => [
                      styles.methodCard,
                      selected && styles.selectedMethodCard,
                      pressed && styles.pressedMethodCard,
                    ]}
                  >
                    <View
                      style={[
                        styles.methodIconContainer,
                        selected && styles.selectedMethodIconContainer,
                      ]}
                    >
                      <Image
                        resizeMode="contain"
                        source={method.icon}
                        style={styles.methodIcon}
                      />
                    </View>
                    <View style={styles.methodCopy}>
                      <Text style={styles.methodLabel}>{method.label}</Text>
                      <Text style={styles.methodDescription}>
                        {method.description}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.radio,
                        selected && styles.selectedRadio,
                      ]}
                    >
                      {selected && <View style={styles.radioDot} />}
                    </View>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.securityRow}>
              <Ionicons
                color={colors.success}
                name="shield-checkmark"
                size={17}
              />
              <Text style={styles.securityText}>
                Your payment details are encrypted and protected.
              </Text>
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={() => onContinue(selectedMethod)}
              style={({ pressed }) => [
                styles.continueButton,
                pressed && styles.continueButtonPressed,
              ]}
            >
              <Text style={styles.continueText}>Continue securely</Text>
              <Ionicons color={colors.white} name="arrow-forward" size={21} />
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.52)',
  },
  sheetSafeArea: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: colors.white,
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: colors.white,
    paddingHorizontal: layout.screenGutter,
    paddingTop: 11,
    paddingBottom: 14,
  },
  handle: {
    width: 42,
    height: 5,
    alignSelf: 'center',
    borderRadius: 3,
    backgroundColor: colors.borderGray,
    marginBottom: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerCopy: {
    flex: 1,
  },
  eyebrow: {
    color: colors.primaryBrandBlue,
    fontFamily: fonts.semiBold,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.8,
  },
  title: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 21,
    fontWeight: '700',
    marginTop: 4,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: colors.surfaceGray,
  },
  amountCard: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    borderRadius: 15,
    backgroundColor: colors.primaryDark,
    paddingHorizontal: 16,
    paddingVertical: 13,
    marginTop: 20,
  },
  amountLabel: {
    color: 'rgba(255,255,255,0.72)',
    fontFamily: fonts.regular,
    fontSize: 11,
  },
  bookingReference: {
    color: colors.white,
    fontFamily: fonts.medium,
    fontSize: 11,
    fontWeight: '500',
    marginTop: 5,
  },
  amount: {
    color: colors.white,
    fontSize: 18,
     ...moneyText },
  sectionLabel: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
  },
  methodList: {
    gap: 10,
  },
  methodCard: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.2,
    borderColor: colors.borderGray,
    borderRadius: 14,
    backgroundColor: colors.white,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  selectedMethodCard: {
    borderColor: colors.primaryBrandBlue,
    backgroundColor: '#EDF4FE',
  },
  pressedMethodCard: {
    opacity: 0.78,
  },
  methodIconContainer: {
    width: 44,
    height: 44,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: colors.surfaceGray,
  },
  selectedMethodIconContainer: {
    backgroundColor: '#EDF4FE',
  },
  methodIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
  },
  methodCopy: {
    minWidth: 0,
    flex: 1,
  },
  methodLabel: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 14,
    fontWeight: '600',
  },
  methodDescription: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 10.5,
    marginTop: 4,
  },
  radio: {
    width: 21,
    height: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.borderGray,
    borderRadius: 11,
  },
  selectedRadio: {
    borderColor: colors.primaryBrandBlue,
  },
  radioDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: colors.primaryBrandBlue,
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 17,
  },
  securityText: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 10,
  },
  continueButton: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 27,
    backgroundColor: colors.primaryBrandBlue,
    marginTop: 17,
    shadowColor: colors.primaryBrandBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 5,
  },
  continueButtonPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },
  continueText: {
    color: colors.white,
    fontFamily: fonts.semiBold,
    fontSize: 16,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.68,
  },
});
