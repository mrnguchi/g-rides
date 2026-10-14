import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon } from './AppIcon';
import { colors } from '../theme';

export const initialCustomerNotificationPreferences: Record<string, boolean> = {
  'Booking updates and cancellations': true,
  'Pickup and return reminders': true,
  'Payment and refund updates': true,
  'Service request updates': true,
  Messages: true,
};

export function NotificationPreferencesSheet({ preferences, onSave, onClose }: {
  preferences: Record<string, boolean>; onSave: (value: Record<string, boolean>) => void; onClose: () => void;
}) {
  const [draft, setDraft] = useState({ ...preferences });
  const insets = useSafeAreaInsets();
  return <Modal transparent visible animationType="slide" onRequestClose={onClose}>
    <View style={styles.root}><Pressable accessibilityRole="button" accessibilityLabel="Close notification settings" onPress={onClose} style={styles.backdrop} />
      <View accessibilityViewIsModal style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 20) }]}><View style={styles.handle} />
        <View style={styles.header}><Text style={styles.title}>Notifications</Text><Pressable accessibilityRole="button" accessibilityLabel="Close notification settings" onPress={onClose} style={styles.close}><AppIcon name="close" size={22} /></Pressable></View>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.description}>Choose the updates you want to receive.</Text>
          {Object.entries(draft).map(([label, enabled]) => <View key={label} style={styles.row}><Text style={styles.label}>{label}</Text><Switch accessibilityLabel={label} value={enabled} onValueChange={value => setDraft(current => ({ ...current, [label]: value }))} trackColor={{ true: colors.primaryBrandBlue }} /></View>)}
          <Text style={styles.description}>Preferences are saved in this session. Device push delivery is not connected yet.</Text>
        </ScrollView>
        <View style={styles.actions}><Pressable accessibilityRole="button" onPress={onClose} style={styles.cancel}><Text style={styles.cancelText}>Cancel</Text></Pressable><Pressable accessibilityRole="button" onPress={() => { onSave(draft); onClose(); }} style={styles.save}><Text style={styles.saveText}>Save changes</Text></Pressable></View>
      </View>
    </View>
  </Modal>;
}
const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' }, backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(15,23,42,0.45)' }, sheet: { maxHeight: '90%', backgroundColor: colors.white, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 22, paddingTop: 12 }, handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.borderGray, alignSelf: 'center', marginBottom: 15 }, header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 15 }, title: { flex: 1, fontSize: 21, fontWeight: '700', color: colors.textPrimary }, close: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.backgroundLight, justifyContent: 'center', alignItems: 'center' }, content: { paddingBottom: 20 }, description: { fontSize: 13, lineHeight: 21, color: colors.textSecondary }, row: { flexDirection: 'row', gap: 15, alignItems: 'center', paddingVertical: 14 }, label: { flex: 1, color: colors.textPrimary, fontSize: 15, fontWeight: '600', lineHeight: 22 }, actions: { flexDirection: 'row', gap: 12, alignItems: 'center' }, cancel: { padding: 16 }, cancelText: { fontSize: 15, fontWeight: '600', color: colors.textPrimary }, save: { flex: 1, minHeight: 50, borderRadius: 25, backgroundColor: colors.primaryBrandBlue, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20, marginTop: 10 }, saveText: { color: colors.white, fontSize: 14, fontWeight: '600' },
});
