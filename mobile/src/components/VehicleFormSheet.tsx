import Ionicons from '@expo/vector-icons/Ionicons';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useScreenBackNavigation } from '../hooks/useScreenBackNavigation';
import { colors, fonts, layout } from '../theme';
import type { UserRole } from '../types/user';
import type {
  FuelType,
  TransmissionType,
  UserVehicle,
  UserVehicleRelationship,
} from '../types/vehicle';

export type VehicleFormValues = {
  category: string;
  fuelType: FuelType;
  make: string;
  mileageKm?: number;
  model: string;
  registrationNumber: string;
  relationship: UserVehicleRelationship;
  transmission: TransmissionType;
  year: number;
};

type VehicleFormSheetProps = {
  activeRole: UserRole;
  initialVehicle?: UserVehicle;
  onClose: () => void;
  onSave: (values: VehicleFormValues) => void;
  visible: boolean;
};

type InputFieldProps = {
  keyboardType?: 'default' | 'number-pad';
  label: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  value: string;
};

const vehicleIcon = require('../../assets/images/vehicle.png');
const registrationIcon = require('../../assets/images/credit-card (1).png');

const fuelOptions: Array<{ id: FuelType; label: string }> = [
  { id: 'petrol', label: 'Petrol' },
  { id: 'diesel', label: 'Diesel' },
  { id: 'hybrid', label: 'Hybrid' },
  { id: 'electric', label: 'Electric' },
];

const transmissionOptions: Array<{
  id: TransmissionType;
  label: string;
}> = [
  { id: 'automatic', label: 'Automatic' },
  { id: 'manual', label: 'Manual' },
];

function InputField({
  keyboardType = 'default',
  label,
  onChangeText,
  placeholder,
  value,
}: InputFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        autoCapitalize="words"
        keyboardType={keyboardType}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9AA2B1"
        selectionColor={colors.primaryBrandBlue}
        style={styles.input}
        value={value}
      />
    </View>
  );
}

export function VehicleFormSheet({
  activeRole,
  initialVehicle,
  onClose,
  onSave,
  visible,
}: VehicleFormSheetProps) {
  const [category, setCategory] = useState('SUV');
  const [fuelType, setFuelType] = useState<FuelType>('petrol');
  const [make, setMake] = useState('');
  const [mileage, setMileage] = useState('');
  const [model, setModel] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [relationship, setRelationship] =
    useState<UserVehicleRelationship>('personal');
  const [transmission, setTransmission] =
    useState<TransmissionType>('automatic');
  const [validationMessage, setValidationMessage] = useState<string>();
  const [year, setYear] = useState(`${new Date().getFullYear()}`);
  const backGestureHandlers = useScreenBackNavigation(onClose, visible);

  const relationshipOptions = useMemo(() => {
    if (activeRole === 'owner') {
      return [
        { id: 'fleet' as const, label: 'Fleet vehicle' },
        { id: 'personal' as const, label: 'Personal vehicle' },
      ];
    }

    if (activeRole === 'driver') {
      return [{ id: 'assigned' as const, label: 'Assigned vehicle' }];
    }

    return [{ id: 'personal' as const, label: 'Personal vehicle' }];
  }, [activeRole]);

  useEffect(() => {
    if (!visible) return;

    setCategory(initialVehicle?.category ?? 'SUV');
    setFuelType(initialVehicle?.fuelType ?? 'petrol');
    setMake(initialVehicle?.make ?? '');
    setMileage(
      initialVehicle?.mileageKm ? `${initialVehicle.mileageKm}` : '',
    );
    setModel(initialVehicle?.model ?? '');
    setRegistrationNumber(initialVehicle?.registrationNumber ?? '');
    setRelationship(
      initialVehicle?.relationship ?? relationshipOptions[0].id,
    );
    setTransmission(initialVehicle?.transmission ?? 'automatic');
    setValidationMessage(undefined);
    setYear(
      initialVehicle?.year
        ? `${initialVehicle.year}`
        : `${new Date().getFullYear()}`,
    );
  }, [initialVehicle, relationshipOptions, visible]);

  const submit = () => {
    const parsedYear = Number.parseInt(year, 10);
    const parsedMileage = mileage
      ? Number.parseInt(mileage.replace(/[^0-9]/g, ''), 10)
      : undefined;

    if (!make.trim() || !model.trim() || !registrationNumber.trim()) {
      setValidationMessage('Add the make, model, and registration number.');
      return;
    }

    if (
      !Number.isFinite(parsedYear) ||
      parsedYear < 1950 ||
      parsedYear > new Date().getFullYear() + 1
    ) {
      setValidationMessage('Enter a valid vehicle year.');
      return;
    }

    onSave({
      category: category.trim() || 'Other',
      fuelType,
      make: make.trim(),
      mileageKm: Number.isFinite(parsedMileage) ? parsedMileage : undefined,
      model: model.trim(),
      registrationNumber: registrationNumber.trim().toUpperCase(),
      relationship,
      transmission,
      year: parsedYear,
    });
  };

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      presentationStyle="overFullScreen"
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalRoot}
        {...backGestureHandlers}
      >
        <StatusBar style="light" />
        <Pressable
          accessibilityLabel="Close vehicle form"
          accessibilityRole="button"
          onPress={onClose}
          style={styles.backdrop}
        />

        <SafeAreaView edges={['bottom']} style={styles.sheetSafeArea}>
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <View style={styles.header}>
              <View style={styles.headerIconContainer}>
                <Image
                  resizeMode="contain"
                  source={vehicleIcon}
                  style={styles.headerIcon}
                />
              </View>
              <View style={styles.headerCopy}>
                <Text style={styles.eyebrow}>MY GARAGE</Text>
                <Text style={styles.title}>
                  {initialVehicle ? 'Edit vehicle' : 'Add a vehicle'}
                </Text>
                <Text style={styles.subtitle}>
                  These details help us match services and compatible parts.
                </Text>
              </View>
              <Pressable
                accessibilityLabel="Close vehicle form"
                accessibilityRole="button"
                onPress={onClose}
                style={({ pressed }) => [
                  styles.closeButton,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons color={colors.textPrimary} name="close" size={22} />
              </Pressable>
            </View>

            <ScrollView
              contentContainerStyle={styles.formContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.sectionLabel}>Vehicle use</Text>
              <View style={styles.choiceRow}>
                {relationshipOptions.map((option) => {
                  const selected = relationship === option.id;
                  return (
                    <Pressable
                      key={option.id}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: selected }}
                      onPress={() => setRelationship(option.id)}
                      style={({ pressed }) => [
                        styles.choice,
                        selected && styles.selectedChoice,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Ionicons
                        color={
                          selected ? colors.white : colors.primaryBrandBlue
                        }
                        name={option.id === 'fleet' ? 'business' : 'car-sport'}
                        size={17}
                      />
                      <Text
                        style={[
                          styles.choiceText,
                          selected && styles.selectedChoiceText,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <View style={styles.twoColumnRow}>
                <InputField
                  label="Make"
                  onChangeText={setMake}
                  placeholder="Toyota"
                  value={make}
                />
                <InputField
                  label="Model"
                  onChangeText={setModel}
                  placeholder="Land Cruiser"
                  value={model}
                />
              </View>
              <View style={styles.twoColumnRow}>
                <InputField
                  keyboardType="number-pad"
                  label="Year"
                  onChangeText={setYear}
                  placeholder="2022"
                  value={year}
                />
                <InputField
                  label="Category"
                  onChangeText={setCategory}
                  placeholder="SUV"
                  value={category}
                />
              </View>

              <View style={styles.registrationField}>
                <Image
                  source={registrationIcon}
                  style={styles.registrationIcon}
                />
                <View style={styles.registrationCopy}>
                  <Text style={styles.fieldLabel}>Registration number</Text>
                  <TextInput
                    autoCapitalize="characters"
                    onChangeText={setRegistrationNumber}
                    placeholder="LT 482 GR"
                    placeholderTextColor="#9AA2B1"
                    selectionColor={colors.primaryBrandBlue}
                    style={styles.registrationInput}
                    value={registrationNumber}
                  />
                </View>
              </View>

              <InputField
                keyboardType="number-pad"
                label="Current mileage (optional)"
                onChangeText={setMileage}
                placeholder="68,420 km"
                value={mileage}
              />

              <Text style={styles.sectionLabel}>Fuel type</Text>
              <View style={styles.wrapChoices}>
                {fuelOptions.map((option) => {
                  const selected = fuelType === option.id;
                  return (
                    <Pressable
                      key={option.id}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: selected }}
                      onPress={() => setFuelType(option.id)}
                      style={({ pressed }) => [
                        styles.smallChoice,
                        selected && styles.selectedSmallChoice,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Text
                        style={[
                          styles.smallChoiceText,
                          selected && styles.selectedSmallChoiceText,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={styles.sectionLabel}>Transmission</Text>
              <View style={styles.choiceRow}>
                {transmissionOptions.map((option) => {
                  const selected = transmission === option.id;
                  return (
                    <Pressable
                      key={option.id}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: selected }}
                      onPress={() => setTransmission(option.id)}
                      style={({ pressed }) => [
                        styles.choice,
                        selected && styles.selectedChoice,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Text
                        style={[
                          styles.choiceText,
                          selected && styles.selectedChoiceText,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {validationMessage && (
                <View style={styles.validationNotice}>
                  <Ionicons
                    color={colors.error}
                    name="alert-circle"
                    size={18}
                  />
                  <Text style={styles.validationText}>{validationMessage}</Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.footer}>
              <Pressable
                accessibilityRole="button"
                onPress={onClose}
                style={({ pressed }) => [
                  styles.cancelButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={submit}
                style={({ pressed }) => [
                  styles.saveButton,
                  pressed && styles.saveButtonPressed,
                ]}
              >
                <Text style={styles.saveText}>
                  {initialVehicle ? 'Save changes' : 'Add vehicle'}
                </Text>
                <Ionicons color={colors.white} name="arrow-forward" size={20} />
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
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
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
  },
  sheetSafeArea: {
    maxHeight: '93%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: colors.white,
  },
  sheet: {
    maxHeight: '100%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: colors.white,
    paddingTop: 10,
  },
  handle: {
    width: 43,
    height: 5,
    alignSelf: 'center',
    borderRadius: 3,
    backgroundColor: colors.borderGray,
    marginBottom: 15,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    paddingHorizontal: layout.screenGutter,
    paddingBottom: 14,
  },
  headerIconContainer: {
    width: 45,
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: '#EDF4FE',
  },
  headerIcon: {
    width: 27,
    height: 27,
  },
  headerCopy: {
    minWidth: 0,
    flex: 1,
  },
  eyebrow: {
    color: colors.primaryBrandBlue,
    fontFamily: fonts.semiBold,
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.7,
  },
  title: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 20,
    fontWeight: '700',
    marginTop: 2,
  },
  subtitle: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    lineHeight: 13,
    marginTop: 3,
  },
  closeButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
    backgroundColor: colors.surfaceGray,
  },
  formContent: {
    paddingHorizontal: layout.screenGutter,
    paddingBottom: 18,
  },
  sectionLabel: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 11.5,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  twoColumnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  field: {
    minWidth: 0,
    flex: 1,
    marginTop: 12,
  },
  fieldLabel: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 9.5,
    fontWeight: '500',
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.borderGray,
    borderRadius: 12,
    color: colors.textPrimary,
    fontFamily: fonts.medium,
    fontSize: 12,
    paddingHorizontal: 12,
  },
  choiceRow: {
    flexDirection: 'row',
    gap: 9,
  },
  choice: {
    minHeight: 43,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.borderGray,
    borderRadius: 12,
    backgroundColor: colors.white,
    paddingHorizontal: 10,
  },
  selectedChoice: {
    borderColor: colors.primaryBrandBlue,
    backgroundColor: colors.primaryBrandBlue,
  },
  choiceText: {
    color: colors.textPrimary,
    fontFamily: fonts.medium,
    fontSize: 10.5,
    fontWeight: '500',
  },
  selectedChoiceText: {
    color: colors.white,
  },
  registrationField: {
    minHeight: 66,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: colors.borderGray,
    borderRadius: 13,
    paddingHorizontal: 12,
    marginTop: 13,
  },
  registrationIcon: {
    width: 25,
    height: 25,
    tintColor: colors.primaryBrandBlue,
  },
  registrationCopy: {
    minWidth: 0,
    flex: 1,
  },
  registrationInput: {
    height: 26,
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 13,
    fontWeight: '600',
    padding: 0,
  },
  wrapChoices: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  smallChoice: {
    minHeight: 38,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderGray,
    borderRadius: 19,
    backgroundColor: colors.white,
    paddingHorizontal: 15,
  },
  selectedSmallChoice: {
    borderColor: colors.primaryBrandBlue,
    backgroundColor: '#EDF4FE',
  },
  smallChoiceText: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 10,
    fontWeight: '500',
  },
  selectedSmallChoiceText: {
    color: colors.primaryBrandBlue,
  },
  validationNotice: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 11,
    backgroundColor: '#FFF0F0',
    paddingHorizontal: 11,
    marginTop: 15,
  },
  validationText: {
    flex: 1,
    color: colors.error,
    fontFamily: fonts.medium,
    fontSize: 10,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#EDF0F4',
    paddingHorizontal: layout.screenGutter,
    paddingTop: 12,
    paddingBottom: 12,
  },
  cancelButton: {
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderGray,
    borderRadius: 15,
    paddingHorizontal: 20,
  },
  cancelText: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 12,
    fontWeight: '600',
  },
  saveButton: {
    height: 50,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 15,
    backgroundColor: colors.primaryBrandBlue,
  },
  saveButtonPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }],
  },
  saveText: {
    color: colors.white,
    fontFamily: fonts.semiBold,
    fontSize: 12.5,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.66,
  },
});

