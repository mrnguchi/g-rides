import Ionicons from '@expo/vector-icons/Ionicons';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  initialWindowMetrics,
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import {
  BackButton,
  GarageVehicleCard,
  VehicleDocumentsSheet,
  VehicleFormSheet,
  type VehicleFormValues,
} from '../components';
import { useScreenBackNavigation } from '../hooks/useScreenBackNavigation';
import { colors, fonts, layout } from '../theme';
import type { UserRole } from '../types/user';
import type {
  UserVehicle,
  UserVehicleRelationship,
  VehicleDocument,
} from '../types/vehicle';

type GarageFilter = 'all' | UserVehicleRelationship;

type MyVehiclesScreenProps = {
  activeRole: UserRole;
  onBack: () => void;
  onSaveVehicle: (vehicle: UserVehicle) => void;
  vehicles: readonly UserVehicle[];
};

const rolePresentation: Record<
  UserRole,
  {
    action: string;
    description: string;
    eyebrow: string;
    icon: number;
    relationships: readonly UserVehicleRelationship[];
  }
> = {
  renter: {
    action: 'Add a vehicle',
    description:
      'Manage personal vehicles for maintenance, parts, towing, and insurance.',
    eyebrow: 'PERSONAL GARAGE',
    icon: require('../../assets/images/user.png'),
    relationships: ['personal', 'active_rental'],
  },
  owner: {
    action: 'Add fleet vehicle',
    description:
      'Keep your personal and rental fleet vehicles ready for every service.',
    eyebrow: 'OWNER FLEET',
    icon: require('../../assets/images/car.png'),
    relationships: ['fleet', 'personal'],
  },
  driver: {
    action: 'Request assignment',
    description:
      'See vehicles assigned to you and report service needs to their owners.',
    eyebrow: 'DRIVER VEHICLES',
    icon: require('../../assets/images/driver.png'),
    relationships: ['assigned'],
  },
};

const filterLabels: Record<GarageFilter, string> = {
  all: 'All',
  personal: 'Personal',
  fleet: 'Fleet',
  assigned: 'Assigned',
  active_rental: 'Active rental',
};

const fallbackVehicleImage = require('../../assets/images/car-2.jpeg');
const garageIcon = require('../../assets/images/vehicle.png');

export function MyVehiclesScreen({
  activeRole,
  onBack,
  onSaveVehicle,
  vehicles,
}: MyVehiclesScreenProps) {
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState<GarageFilter>('all');
  const [editingVehicleId, setEditingVehicleId] = useState<string>();
  const [isVehicleFormVisible, setIsVehicleFormVisible] = useState(false);
  const [notice, setNotice] = useState<string>();
  const [selectedDocumentVehicleId, setSelectedDocumentVehicleId] =
    useState<string>();
  const backGestureHandlers = useScreenBackNavigation(onBack);
  const presentation = rolePresentation[activeRole];
  const editingVehicle = vehicles.find(
    (vehicle) => vehicle.id === editingVehicleId,
  );
  const selectedDocumentVehicle = vehicles.find(
    (vehicle) => vehicle.id === selectedDocumentVehicleId,
  );
  const bottomSafeArea = Math.max(
    insets.bottom,
    initialWindowMetrics?.insets.bottom ?? 0,
  );

  useEffect(() => {
    setActiveFilter('all');
  }, [activeRole]);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(undefined), 3400);
    return () => clearTimeout(timer);
  }, [notice]);

  const roleVehicles = useMemo(
    () =>
      vehicles.filter((vehicle) =>
        presentation.relationships.includes(vehicle.relationship),
      ),
    [presentation.relationships, vehicles],
  );
  const displayedVehicles = useMemo(
    () =>
      activeFilter === 'all'
        ? roleVehicles
        : roleVehicles.filter(
            (vehicle) => vehicle.relationship === activeFilter,
          ),
    [activeFilter, roleVehicles],
  );
  const filterOptions: GarageFilter[] = [
    'all',
    ...presentation.relationships,
  ];
  const verifiedDocuments = roleVehicles.reduce(
    (count, vehicle) =>
      count +
      vehicle.documents.filter((document) => document.status === 'verified')
        .length,
    0,
  );

  const openAddVehicle = () => {
    if (activeRole === 'driver') {
      setNotice(
        'An assignment request will be sent to a verified vehicle owner when the backend is connected.',
      );
      return;
    }

    setEditingVehicleId(undefined);
    setIsVehicleFormVisible(true);
  };

  const saveVehicle = (values: VehicleFormValues) => {
    const savedVehicle: UserVehicle = editingVehicle
      ? {
          ...editingVehicle,
          ...values,
        }
      : {
          ...values,
          documents: [],
          id: `garage-vehicle-${Date.now()}`,
          image: fallbackVehicleImage,
          ownerUserId: 'current-user',
          status: 'pending_verification',
        };

    onSaveVehicle(savedVehicle);
    setIsVehicleFormVisible(false);
    setEditingVehicleId(undefined);
    setNotice(
      editingVehicle
        ? 'Vehicle details updated.'
        : 'Vehicle added. Add its documents to complete verification.',
    );
  };

  const addDocument = (document: VehicleDocument) => {
    if (!selectedDocumentVehicle) return;

    onSaveVehicle({
      ...selectedDocumentVehicle,
      documents: [...selectedDocumentVehicle.documents, document],
    });
    setNotice('Document saved and marked as pending verification.');
  };

  return (
    <View style={styles.screen} {...backGestureHandlers}>
      <StatusBar backgroundColor={colors.backgroundLight} style="dark" />
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.header}>
          <BackButton onPress={onBack} />
          <View style={styles.headerCopy}>
            <Text style={styles.headerTitle}>My Vehicles</Text>
            <Text style={styles.headerSubtitle}>Garage</Text>
          </View>
          <View style={styles.vehicleCountPill}>
            <Image source={garageIcon} style={styles.vehicleCountIcon} />
            <Text style={styles.vehicleCountText}>{roleVehicles.length}</Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingBottom: 106 + bottomSafeArea },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.roleBanner}>
            <View style={styles.roleIconContainer}>
              <Image
                resizeMode="contain"
                source={presentation.icon}
                style={styles.roleIcon}
              />
            </View>
            <View style={styles.roleCopy}>
              <Text style={styles.roleEyebrow}>{presentation.eyebrow}</Text>
              <Text style={styles.roleDescription}>
                {presentation.description}
              </Text>
            </View>
          </View>

          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{roleVehicles.length}</Text>
              <Text style={styles.summaryLabel}>
                {roleVehicles.length === 1 ? 'Vehicle' : 'Vehicles'}
              </Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{verifiedDocuments}</Text>
              <Text style={styles.summaryLabel}>Verified documents</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryValue}>
                {
                  roleVehicles.filter((vehicle) => vehicle.status === 'active')
                    .length
                }
              </Text>
              <Text style={styles.summaryLabel}>Service ready</Text>
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Vehicles</Text>
              <Text style={styles.sectionSubtitle}>
                Select a vehicle to manage its documents.
              </Text>
            </View>
          </View>

          {filterOptions.length > 2 && (
            <ScrollView
              contentContainerStyle={styles.filterList}
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              {filterOptions.map((filter) => {
                const selected = activeFilter === filter;
                return (
                  <Pressable
                    key={filter}
                    accessibilityRole="tab"
                    accessibilityState={{ selected }}
                    onPress={() => setActiveFilter(filter)}
                    style={({ pressed }) => [
                      styles.filterChip,
                      selected && styles.selectedFilterChip,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterText,
                        selected && styles.selectedFilterText,
                      ]}
                    >
                      {filterLabels[filter]}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          )}

          <View style={styles.vehicleList}>
            {displayedVehicles.length ? (
              displayedVehicles.map((vehicle) => {
                const canEdit =
                  activeRole !== 'driver' &&
                  vehicle.relationship !== 'active_rental';
                return (
                  <GarageVehicleCard
                    key={vehicle.id}
                    onDocuments={() =>
                      setSelectedDocumentVehicleId(vehicle.id)
                    }
                    onEdit={
                      canEdit
                        ? () => {
                            setEditingVehicleId(vehicle.id);
                            setIsVehicleFormVisible(true);
                          }
                        : undefined
                    }
                    vehicle={vehicle}
                  />
                );
              })
            ) : (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconContainer}>
                  <Image source={garageIcon} style={styles.emptyIcon} />
                </View>
                <Text style={styles.emptyTitle}>No vehicles here yet</Text>
                <Text style={styles.emptyText}>
                  {activeRole === 'driver'
                    ? 'Assigned vehicles will appear after an owner connects you to their fleet.'
                    : 'Add a vehicle to prepare it for maintenance, parts, towing, and insurance.'}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>

      {notice && (
        <View
          pointerEvents="none"
          style={[styles.notice, { bottom: 83 + bottomSafeArea }]}
        >
          <Ionicons color={colors.white} name="information-circle" size={19} />
          <Text style={styles.noticeText}>{notice}</Text>
        </View>
      )}

      <SafeAreaView edges={['bottom']} style={styles.bottomSafeArea}>
        <View style={styles.bottomBar}>
          <Pressable
            accessibilityRole="button"
            onPress={openAddVehicle}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.primaryButtonPressed,
            ]}
          >
            <Ionicons
              color={colors.white}
              name={activeRole === 'driver' ? 'link-outline' : 'add'}
              size={21}
            />
            <Text style={styles.primaryButtonText}>{presentation.action}</Text>
            <Ionicons color={colors.white} name="arrow-forward" size={20} />
          </Pressable>
        </View>
      </SafeAreaView>

      <VehicleFormSheet
        activeRole={activeRole}
        initialVehicle={editingVehicle}
        onClose={() => {
          setEditingVehicleId(undefined);
          setIsVehicleFormVisible(false);
        }}
        onSave={saveVehicle}
        visible={isVehicleFormVisible}
      />

      <VehicleDocumentsSheet
        onAddDocument={addDocument}
        onClose={() => setSelectedDocumentVehicleId(undefined)}
        vehicle={selectedDocumentVehicle}
        visible={Boolean(selectedDocumentVehicle)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenGutter,
  },
  headerCopy: {
    alignItems: 'center',
  },
  headerTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 19,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    marginTop: 2,
  },
  vehicleCountPill: {
    minWidth: 42,
    height: 38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderRadius: 19,
    backgroundColor: colors.white,
    paddingHorizontal: 9,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 2,
  },
  vehicleCountIcon: {
    width: 18,
    height: 18,
  },
  vehicleCountText: {
    color: colors.primaryBrandBlue,
    fontFamily: fonts.bold,
    fontSize: 12,
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: layout.screenGutter,
    paddingTop: 5,
  },
  roleBanner: {
    minHeight: 98,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    overflow: 'hidden',
    borderRadius: 18,
    backgroundColor: colors.primaryDark,
    padding: 14,
  },
  roleIconContainer: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 17,
    backgroundColor: colors.primaryBrandBlue,
  },
  roleIcon: {
    width: 33,
    height: 33,
    tintColor: colors.white,
  },
  roleCopy: {
    minWidth: 0,
    flex: 1,
  },
  roleEyebrow: {
    color: colors.trackingGlow,
    fontFamily: fonts.semiBold,
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.75,
  },
  roleDescription: {
    color: colors.white,
    fontFamily: fonts.medium,
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 16,
    marginTop: 6,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  summaryCard: {
    minHeight: 69,
    flex: 1,
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: colors.white,
    paddingHorizontal: 10,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  summaryValue: {
    color: colors.primaryBrandBlue,
    fontFamily: fonts.bold,
    fontSize: 18,
    fontWeight: '700',
  },
  summaryLabel: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 8.5,
    lineHeight: 11,
    marginTop: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 23,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 18,
    fontWeight: '700',
  },
  sectionSubtitle: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    marginTop: 4,
  },
  filterList: {
    gap: 8,
    paddingVertical: 13,
  },
  filterChip: {
    minHeight: 37,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderGray,
    borderRadius: 19,
    backgroundColor: colors.white,
    paddingHorizontal: 14,
  },
  selectedFilterChip: {
    borderColor: colors.primaryBrandBlue,
    backgroundColor: colors.primaryBrandBlue,
  },
  filterText: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 10,
    fontWeight: '500',
  },
  selectedFilterText: {
    color: colors.white,
  },
  vehicleList: {
    gap: 13,
    marginTop: 14,
  },
  emptyState: {
    minHeight: 285,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: colors.white,
    paddingHorizontal: 34,
  },
  emptyIconContainer: {
    width: 68,
    height: 68,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 34,
    backgroundColor: '#EDF4FE',
  },
  emptyIcon: {
    width: 37,
    height: 37,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 17,
    fontWeight: '700',
    marginTop: 15,
  },
  emptyText: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 10.5,
    lineHeight: 16,
    textAlign: 'center',
    marginTop: 7,
  },
  notice: {
    position: 'absolute',
    zIndex: 110,
    right: layout.screenGutter,
    left: layout.screenGutter,
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 13,
    backgroundColor: colors.primaryDark,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  noticeText: {
    flex: 1,
    color: colors.white,
    fontFamily: fonts.medium,
    fontSize: 10.5,
    fontWeight: '500',
    lineHeight: 15,
  },
  bottomSafeArea: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: colors.white,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 10,
  },
  bottomBar: {
    paddingHorizontal: layout.screenGutter,
    paddingTop: 12,
    paddingBottom: 10,
  },
  primaryButton: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    borderRadius: 16,
    backgroundColor: colors.primaryBrandBlue,
  },
  primaryButtonPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }],
  },
  primaryButtonText: {
    color: colors.white,
    fontFamily: fonts.semiBold,
    fontSize: 13,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.65,
  },
});

