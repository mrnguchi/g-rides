import Ionicons from '@expo/vector-icons/Ionicons';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import {
  Image,
  Modal,
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
import type { UserVehicle } from '../types/vehicle';

type VehicleSelectionSheetProps = {
  emptyMessage?: string;
  onClose: () => void;
  onSelect: (vehicle: UserVehicle) => void;
  selectedVehicleId?: string;
  title?: string;
  vehicles: readonly UserVehicle[];
  visible: boolean;
};

const fallbackVehicleImage = require('../../assets/images/car-2.jpeg');

export function VehicleSelectionSheet({
  emptyMessage = 'Add an eligible vehicle to your Garage before continuing.',
  onClose,
  onSelect,
  selectedVehicleId,
  title = 'Choose a vehicle',
  vehicles,
  visible,
}: VehicleSelectionSheetProps) {
  const [query, setQuery] = useState('');
  const backGestureHandlers = useScreenBackNavigation(onClose, visible);
  const filteredVehicles = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return vehicles;

    return vehicles.filter((vehicle) =>
      `${vehicle.make} ${vehicle.model} ${vehicle.registrationNumber}`
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [query, vehicles]);

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
          accessibilityLabel="Close vehicle selector"
          accessibilityRole="button"
          onPress={onClose}
          style={styles.backdrop}
        />

        <SafeAreaView edges={['bottom']} style={styles.sheetSafeArea}>
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <View style={styles.header}>
              <View style={styles.headerCopy}>
                <Text style={styles.eyebrow}>MY GARAGE</Text>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.subtitle}>
                  Select the vehicle this service is for.
                </Text>
              </View>
              <Pressable
                accessibilityLabel="Close vehicle selector"
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

            <View style={styles.searchBar}>
              <Ionicons
                color={colors.textSecondary}
                name="search-outline"
                size={20}
              />
              <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={setQuery}
                placeholder="Search make, model or registration"
                placeholderTextColor="#9AA2B1"
                selectionColor={colors.primaryBrandBlue}
                style={styles.searchInput}
                value={query}
              />
            </View>

            <ScrollView
              contentContainerStyle={styles.listContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {filteredVehicles.length ? (
                filteredVehicles.map((vehicle) => {
                  const selected = selectedVehicleId === vehicle.id;
                  return (
                    <Pressable
                      key={vehicle.id}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: selected }}
                      onPress={() => onSelect(vehicle)}
                      style={({ pressed }) => [
                        styles.vehicleRow,
                        selected && styles.selectedVehicleRow,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Image
                        resizeMode="cover"
                        source={vehicle.image ?? fallbackVehicleImage}
                        style={styles.vehicleImage}
                      />
                      <View style={styles.vehicleCopy}>
                        <Text numberOfLines={1} style={styles.vehicleName}>
                          {vehicle.make} {vehicle.model}
                        </Text>
                        <Text style={styles.vehicleMeta}>
                          {vehicle.year} · {vehicle.registrationNumber}
                        </Text>
                        <Text style={styles.relationship}>
                          {vehicle.relationship.replace('_', ' ')}
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
                })
              ) : (
                <View style={styles.emptyState}>
                  <View style={styles.emptyIcon}>
                    <Ionicons
                      color={colors.primaryBrandBlue}
                      name="car-sport-outline"
                      size={32}
                    />
                  </View>
                  <Text style={styles.emptyTitle}>No vehicle found</Text>
                  <Text style={styles.emptyText}>
                    {query ? 'Try another search.' : emptyMessage}
                  </Text>
                </View>
              )}
            </ScrollView>
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
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
  },
  sheetSafeArea: {
    maxHeight: '82%',
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
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingHorizontal: layout.screenGutter,
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
    fontSize: 21,
    fontWeight: '700',
    marginTop: 3,
  },
  subtitle: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 10,
    marginTop: 4,
  },
  closeButton: {
    width: 39,
    height: 39,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: colors.surfaceGray,
  },
  searchBar: {
    height: 49,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 14,
    backgroundColor: colors.surfaceGray,
    paddingHorizontal: 12,
    marginHorizontal: layout.screenGutter,
    marginTop: 17,
  },
  searchInput: {
    minWidth: 0,
    flex: 1,
    color: colors.textPrimary,
    fontFamily: fonts.regular,
    fontSize: 11.5,
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: layout.screenGutter,
    paddingTop: 13,
    paddingBottom: 18,
  },
  vehicleRow: {
    minHeight: 84,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    borderWidth: 1,
    borderColor: colors.borderGray,
    borderRadius: 15,
    padding: 8,
    marginBottom: 9,
  },
  selectedVehicleRow: {
    borderColor: colors.primaryBrandBlue,
    backgroundColor: '#F7FAFF',
  },
  vehicleImage: {
    width: 78,
    height: 66,
    borderRadius: 11,
    backgroundColor: colors.surfaceGray,
  },
  vehicleCopy: {
    minWidth: 0,
    flex: 1,
  },
  vehicleName: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 12.5,
    fontWeight: '600',
  },
  vehicleMeta: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    marginTop: 4,
  },
  relationship: {
    color: colors.primaryBrandBlue,
    fontFamily: fonts.medium,
    fontSize: 8.5,
    fontWeight: '500',
    textTransform: 'capitalize',
    marginTop: 5,
  },
  radio: {
    width: 22,
    height: 22,
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
  emptyState: {
    flex: 1,
    minHeight: 250,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 35,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 32,
    backgroundColor: '#EDF4FE',
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 14,
  },
  emptyText: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 10.5,
    lineHeight: 16,
    textAlign: 'center',
    marginTop: 6,
  },
  pressed: {
    opacity: 0.65,
  },
});

