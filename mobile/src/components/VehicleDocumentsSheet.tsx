import Ionicons from '@expo/vector-icons/Ionicons';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
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
import type {
  UserVehicle,
  VehicleDocument,
  VehicleDocumentKind,
  VehicleDocumentStatus,
} from '../types/vehicle';

type VehicleDocumentsSheetProps = {
  onAddDocument: (document: VehicleDocument) => void;
  onClose: () => void;
  vehicle?: UserVehicle;
  visible: boolean;
};

const documentIcon = require('../../assets/images/verified-user.png');
const uploadIcon = require('../../assets/images/add-photo.png');

const documentKinds: Array<{
  id: VehicleDocumentKind;
  label: string;
}> = [
  { id: 'registration', label: 'Registration' },
  { id: 'insurance', label: 'Insurance' },
  { id: 'roadworthiness', label: 'Roadworthiness' },
  { id: 'other', label: 'Other' },
];

const statusPresentation: Record<
  VehicleDocumentStatus,
  { backgroundColor: string; color: string; label: string }
> = {
  verified: {
    backgroundColor: '#EAF7EF',
    color: colors.success,
    label: 'Verified',
  },
  pending: {
    backgroundColor: '#FFF6E5',
    color: colors.warning,
    label: 'Pending',
  },
  expired: {
    backgroundColor: '#FFF0F0',
    color: colors.error,
    label: 'Expired',
  },
};

function labelFromKind(kind: VehicleDocumentKind) {
  return documentKinds.find((option) => option.id === kind)?.label ?? 'Other';
}

export function VehicleDocumentsSheet({
  onAddDocument,
  onClose,
  vehicle,
  visible,
}: VehicleDocumentsSheetProps) {
  const [documentName, setDocumentName] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [kind, setKind] = useState<VehicleDocumentKind>('registration');
  const [validationMessage, setValidationMessage] = useState<string>();

  const handleBack = () => {
    if (isAdding) {
      setIsAdding(false);
      setValidationMessage(undefined);
      return;
    }
    onClose();
  };
  const backGestureHandlers = useScreenBackNavigation(handleBack, visible);

  useEffect(() => {
    if (!visible) return;
    setDocumentName('');
    setExpiresAt('');
    setIsAdding(false);
    setKind('registration');
    setValidationMessage(undefined);
  }, [vehicle?.id, visible]);

  const saveDocument = () => {
    if (!documentName.trim()) {
      setValidationMessage('Enter a clear name for this document.');
      return;
    }

    onAddDocument({
      expiresAt: expiresAt.trim() || undefined,
      id: `vehicle-document-${Date.now()}`,
      kind,
      name: documentName.trim(),
      status: 'pending',
    });
    setDocumentName('');
    setExpiresAt('');
    setIsAdding(false);
    setValidationMessage(undefined);
  };

  if (!vehicle) return null;

  return (
    <Modal
      animationType="fade"
      onRequestClose={handleBack}
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
          accessibilityLabel="Close vehicle documents"
          accessibilityRole="button"
          onPress={onClose}
          style={styles.backdrop}
        />

        <SafeAreaView edges={['bottom']} style={styles.sheetSafeArea}>
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <View style={styles.header}>
              {isAdding && (
                <Pressable
                  accessibilityLabel="Back to documents"
                  accessibilityRole="button"
                  onPress={handleBack}
                  style={({ pressed }) => [
                    styles.headerButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <Ionicons
                    color={colors.textPrimary}
                    name="arrow-back"
                    size={21}
                  />
                </Pressable>
              )}
              <View style={styles.headerCopy}>
                <Text style={styles.eyebrow}>VEHICLE DOCUMENTS</Text>
                <Text style={styles.title}>
                  {isAdding ? 'Add document' : `${vehicle.make} ${vehicle.model}`}
                </Text>
                <Text style={styles.subtitle}>
                  {isAdding
                    ? 'Save the document details for verification.'
                    : `${vehicle.registrationNumber} · ${vehicle.documents.length} documents`}
                </Text>
              </View>
              <Pressable
                accessibilityLabel="Close vehicle documents"
                accessibilityRole="button"
                onPress={onClose}
                style={({ pressed }) => [
                  styles.headerButton,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons color={colors.textPrimary} name="close" size={22} />
              </Pressable>
            </View>

            {isAdding ? (
              <ScrollView
                contentContainerStyle={styles.addContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.uploadPlaceholder}>
                  <View style={styles.uploadIconContainer}>
                    <Image source={uploadIcon} style={styles.uploadIcon} />
                  </View>
                  <View style={styles.uploadCopy}>
                    <Text style={styles.uploadTitle}>Secure file upload</Text>
                    <Text style={styles.uploadDescription}>
                      File attachment will activate when document storage is
                      connected. You can save its details now.
                    </Text>
                  </View>
                </View>

                <Text style={styles.sectionLabel}>Document type</Text>
                <View style={styles.kindList}>
                  {documentKinds.map((option) => {
                    const selected = kind === option.id;
                    return (
                      <Pressable
                        key={option.id}
                        accessibilityRole="radio"
                        accessibilityState={{ checked: selected }}
                        onPress={() => setKind(option.id)}
                        style={({ pressed }) => [
                          styles.kindChip,
                          selected && styles.selectedKindChip,
                          pressed && styles.pressed,
                        ]}
                      >
                        <Text
                          style={[
                            styles.kindText,
                            selected && styles.selectedKindText,
                          ]}
                        >
                          {option.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <Text style={styles.inputLabel}>Document name</Text>
                <TextInput
                  onChangeText={setDocumentName}
                  placeholder="e.g. 2026 insurance certificate"
                  placeholderTextColor="#9AA2B1"
                  selectionColor={colors.primaryBrandBlue}
                  style={styles.input}
                  value={documentName}
                />

                <Text style={styles.inputLabel}>Expiry date (optional)</Text>
                <TextInput
                  onChangeText={setExpiresAt}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#9AA2B1"
                  selectionColor={colors.primaryBrandBlue}
                  style={styles.input}
                  value={expiresAt}
                />

                {validationMessage && (
                  <View style={styles.validationNotice}>
                    <Ionicons
                      color={colors.error}
                      name="alert-circle"
                      size={18}
                    />
                    <Text style={styles.validationText}>
                      {validationMessage}
                    </Text>
                  </View>
                )}
              </ScrollView>
            ) : (
              <ScrollView
                contentContainerStyle={styles.documentList}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.securityNotice}>
                  <Ionicons
                    color={colors.primaryBrandBlue}
                    name="shield-checkmark"
                    size={20}
                  />
                  <Text style={styles.securityNoticeText}>
                    Documents are linked to this vehicle and used only for
                    verification and relevant G-Rides services.
                  </Text>
                </View>

                {vehicle.documents.length ? (
                  vehicle.documents.map((document) => {
                    const presentation = statusPresentation[document.status];
                    return (
                      <View key={document.id} style={styles.documentCard}>
                        <View style={styles.documentIconContainer}>
                          <Image
                            source={documentIcon}
                            style={styles.documentIcon}
                          />
                        </View>
                        <View style={styles.documentCopy}>
                          <Text style={styles.documentName}>{document.name}</Text>
                          <Text style={styles.documentMeta}>
                            {labelFromKind(document.kind)}
                            {document.expiresAt
                              ? ` · Expires ${document.expiresAt}`
                              : ''}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.statusPill,
                            { backgroundColor: presentation.backgroundColor },
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusText,
                              { color: presentation.color },
                            ]}
                          >
                            {presentation.label}
                          </Text>
                        </View>
                      </View>
                    );
                  })
                ) : (
                  <View style={styles.emptyState}>
                    <View style={styles.emptyIconContainer}>
                      <Image source={documentIcon} style={styles.emptyIcon} />
                    </View>
                    <Text style={styles.emptyTitle}>No documents yet</Text>
                    <Text style={styles.emptyText}>
                      Add registration, insurance, or roadworthiness details to
                      keep this vehicle ready for services.
                    </Text>
                  </View>
                )}
              </ScrollView>
            )}

            <View style={styles.footer}>
              {isAdding ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={saveDocument}
                  style={({ pressed }) => [
                    styles.primaryButton,
                    pressed && styles.primaryButtonPressed,
                  ]}
                >
                  <Text style={styles.primaryButtonText}>Save document</Text>
                  <Ionicons color={colors.white} name="checkmark" size={21} />
                </Pressable>
              ) : (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setIsAdding(true)}
                  style={({ pressed }) => [
                    styles.primaryButton,
                    pressed && styles.primaryButtonPressed,
                  ]}
                >
                  <Ionicons color={colors.white} name="add" size={21} />
                  <Text style={styles.primaryButtonText}>Add document</Text>
                </Pressable>
              )}
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
    maxHeight: '88%',
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
    gap: 10,
    paddingHorizontal: layout.screenGutter,
    paddingBottom: 15,
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
    marginTop: 3,
  },
  subtitle: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    marginTop: 3,
  },
  headerButton: {
    width: 39,
    height: 39,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: colors.surfaceGray,
  },
  documentList: {
    paddingHorizontal: layout.screenGutter,
    paddingBottom: 18,
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    borderRadius: 13,
    backgroundColor: '#EDF4FE',
    padding: 12,
    marginBottom: 14,
  },
  securityNoticeText: {
    flex: 1,
    color: colors.primaryBrandBlue,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    lineHeight: 14,
  },
  documentCard: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 14,
    backgroundColor: colors.backgroundLight,
    padding: 10,
    marginBottom: 9,
  },
  documentIconContainer: {
    width: 43,
    height: 43,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: colors.white,
  },
  documentIcon: {
    width: 23,
    height: 23,
    tintColor: colors.primaryBrandBlue,
  },
  documentCopy: {
    minWidth: 0,
    flex: 1,
  },
  documentName: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 11.5,
    fontWeight: '600',
  },
  documentMeta: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 8.5,
    marginTop: 4,
  },
  statusPill: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  statusText: {
    fontFamily: fonts.semiBold,
    fontSize: 8,
    fontWeight: '600',
  },
  emptyState: {
    minHeight: 250,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 32,
    backgroundColor: '#EDF4FE',
  },
  emptyIcon: {
    width: 31,
    height: 31,
    tintColor: colors.primaryBrandBlue,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 15,
  },
  emptyText: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 10.5,
    lineHeight: 16,
    textAlign: 'center',
    marginTop: 6,
  },
  addContent: {
    paddingHorizontal: layout.screenGutter,
    paddingBottom: 18,
  },
  uploadPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.borderGray,
    borderRadius: 15,
    backgroundColor: colors.backgroundLight,
    padding: 13,
  },
  uploadIconContainer: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: colors.white,
  },
  uploadIcon: {
    width: 25,
    height: 25,
    tintColor: colors.primaryBrandBlue,
  },
  uploadCopy: {
    minWidth: 0,
    flex: 1,
  },
  uploadTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 11,
    fontWeight: '600',
  },
  uploadDescription: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 8.8,
    lineHeight: 13,
    marginTop: 3,
  },
  sectionLabel: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 11.5,
    fontWeight: '600',
    marginTop: 18,
    marginBottom: 9,
  },
  kindList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  kindChip: {
    minHeight: 38,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderGray,
    borderRadius: 19,
    paddingHorizontal: 13,
  },
  selectedKindChip: {
    borderColor: colors.primaryBrandBlue,
    backgroundColor: '#EDF4FE',
  },
  kindText: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 9.5,
    fontWeight: '500',
  },
  selectedKindText: {
    color: colors.primaryBrandBlue,
  },
  inputLabel: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 9.5,
    fontWeight: '500',
    marginTop: 16,
    marginBottom: 6,
  },
  input: {
    height: 49,
    borderWidth: 1,
    borderColor: colors.borderGray,
    borderRadius: 12,
    color: colors.textPrimary,
    fontFamily: fonts.medium,
    fontSize: 12,
    paddingHorizontal: 12,
  },
  validationNotice: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 11,
    backgroundColor: '#FFF0F0',
    paddingHorizontal: 11,
    marginTop: 14,
  },
  validationText: {
    flex: 1,
    color: colors.error,
    fontFamily: fonts.medium,
    fontSize: 10,
    fontWeight: '500',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#EDF0F4',
    paddingHorizontal: layout.screenGutter,
    paddingTop: 12,
    paddingBottom: 12,
  },
  primaryButton: {
    height: 51,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 15,
    backgroundColor: colors.primaryBrandBlue,
  },
  primaryButtonPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }],
  },
  primaryButtonText: {
    color: colors.white,
    fontFamily: fonts.semiBold,
    fontSize: 12.5,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.65,
  },
});

