import Ionicons from '@expo/vector-icons/Ionicons';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { BackButton, MessageBubble } from '../components';
import { useScreenBackNavigation } from '../hooks/useScreenBackNavigation';
import { colors, fonts, layout } from '../theme';
import type { ChatConversation, ChatMessage } from '../types/chat';

type ChatScreenProps = {
  conversation: ChatConversation;
  onBack?: () => void;
  onOpenVehicle?: () => void;
  onSendMessage: (text: string) => void;
};

type ChatActionSheet = 'attachments' | 'call';

export function ChatScreen({
  conversation,
  onBack,
  onOpenVehicle,
  onSendMessage,
}: ChatScreenProps) {
  const messagesRef = useRef<FlatList<ChatMessage>>(null);
  const safeAreaInsets = useSafeAreaInsets();
  const [composerText, setComposerText] = useState('');
  const [actionSheet, setActionSheet] = useState<ChatActionSheet>();
  const [isMuted, setIsMuted] = useState(false);
  const [isOptionsMenuVisible, setIsOptionsMenuVisible] = useState(false);
  const [notice, setNotice] = useState<string>();
  const orderedMessages = useMemo(
    () =>
      [...conversation.messages].sort(
        (first, second) =>
          new Date(second.sentAt).getTime() - new Date(first.sentAt).getTime(),
      ),
    [conversation.messages],
  );
  const canSend = composerText.trim().length > 0;
  const handleBack = () => {
    if (actionSheet) {
      setActionSheet(undefined);
      return;
    }

    if (isOptionsMenuVisible) {
      setIsOptionsMenuVisible(false);
      return;
    }

    onBack?.();
  };
  const backGestureHandlers = useScreenBackNavigation(handleBack);

  useEffect(() => {
    if (!orderedMessages.length) return;
    requestAnimationFrame(() => {
      messagesRef.current?.scrollToOffset({ animated: true, offset: 0 });
    });
  }, [orderedMessages.length]);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(undefined), 3200);
    return () => clearTimeout(timer);
  }, [notice]);

  const sendMessage = () => {
    const message = composerText.trim();
    if (!message) return;
    onSendMessage(message);
    setComposerText('');
  };

  return (
    <KeyboardAvoidingView
      {...backGestureHandlers}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
      style={styles.screen}
    >
      <StatusBar backgroundColor={colors.white} style="dark" />

      <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
        <View style={styles.header}>
          <BackButton accessibilityLabel="Back to messages" onPress={handleBack} />

          <Image
            resizeMode={conversation.participant.isSupport ? 'contain' : 'cover'}
            source={conversation.participant.avatar}
            style={[
              styles.headerAvatar,
              conversation.participant.isSupport && styles.supportAvatar,
            ]}
          />
          <View style={styles.headerCopy}>
            <View style={styles.headerNameRow}>
              <Text numberOfLines={1} style={styles.headerName}>
                {conversation.participant.name}
              </Text>
              {conversation.participant.isSupport && (
                <Ionicons
                  color={colors.primaryBrandBlue}
                  name="checkmark-circle"
                  size={15}
                />
              )}
            </View>
            <Text style={styles.headerPresence}>
              {conversation.participant.isOnline
                ? 'Online'
                : conversation.participant.role}
            </Text>
          </View>

          <Pressable
            accessibilityLabel="Call"
            accessibilityRole="button"
            onPress={() => {
              Keyboard.dismiss();
              setIsOptionsMenuVisible(false);
              setActionSheet('call');
            }}
            style={({ pressed }) => [styles.headerAction, pressed && styles.pressed]}
          >
            <Ionicons color={colors.primaryBrandBlue} name="call-outline" size={20} />
          </Pressable>
          <Pressable
            accessibilityLabel="Conversation options"
            accessibilityRole="button"
            onPress={() => {
              Keyboard.dismiss();
              setActionSheet(undefined);
              setIsOptionsMenuVisible((current) => !current);
            }}
            style={({ pressed }) => [styles.headerAction, pressed && styles.pressed]}
          >
            <Ionicons
              color={colors.textPrimary}
              name="ellipsis-vertical"
              size={20}
            />
          </Pressable>
        </View>
      </SafeAreaView>

      {conversation.vehicle && (
        <Pressable
          accessibilityHint="Opens the vehicle details"
          accessibilityRole="button"
          onPress={onOpenVehicle}
          style={({ pressed }) => [styles.contextBar, pressed && styles.pressed]}
        >
          <Image source={conversation.vehicle.image} style={styles.contextImage} />
          <View style={styles.contextCopy}>
            <Text style={styles.contextLabel}>
              {conversation.bookingLabel || 'Rental conversation'}
            </Text>
            <Text numberOfLines={1} style={styles.contextVehicle}>
              {conversation.vehicle.brand} {conversation.vehicle.model}
            </Text>
          </View>
          <View style={styles.contextAction}>
            <Text style={styles.contextActionText}>View car</Text>
            <Ionicons
              color={colors.primaryBrandBlue}
              name="chevron-forward"
              size={17}
            />
          </View>
        </Pressable>
      )}

      <View style={styles.messageArea}>
        <FlatList
          ref={messagesRef}
          contentContainerStyle={styles.messageListContent}
          data={orderedMessages}
          inverted
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          keyboardShouldPersistTaps="handled"
          keyExtractor={(message) => message.id}
          maintainVisibleContentPosition={{
            autoscrollToTopThreshold: 40,
            minIndexForVisible: 0,
          }}
          removeClippedSubviews={Platform.OS === 'android'}
          renderItem={({ item }) => (
            <MessageBubble
              message={item}
              participantAvatar={conversation.participant.avatar}
            />
          )}
          showsVerticalScrollIndicator={false}
        />
      </View>

      <SafeAreaView edges={['bottom']} style={styles.composerSafeArea}>
        <View style={styles.composer}>
          <Pressable
            accessibilityLabel="Add attachment"
            accessibilityRole="button"
            onPress={() => {
              Keyboard.dismiss();
              setIsOptionsMenuVisible(false);
              setActionSheet('attachments');
            }}
            style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
          >
            <Ionicons color={colors.primaryBrandBlue} name="add" size={26} />
          </Pressable>

          <View style={styles.inputContainer}>
            <TextInput
              accessibilityLabel="Message"
              maxLength={2000}
              multiline
              onChangeText={setComposerText}
              onSubmitEditing={sendMessage}
              placeholder="Type a message"
              placeholderTextColor={colors.textSecondary}
              returnKeyType="default"
              selectionColor={colors.primaryBrandBlue}
              style={styles.composerInput}
              value={composerText}
            />
            <Pressable
              accessibilityLabel="Open camera"
              accessibilityRole="button"
              hitSlop={7}
              onPress={() =>
                setNotice('Camera sharing will be connected to device permissions.')
              }
              style={({ pressed }) => pressed && styles.pressed}
            >
              <Ionicons
                color={colors.textSecondary}
                name="camera-outline"
                size={22}
              />
            </Pressable>
          </View>

          <Pressable
            accessibilityLabel={canSend ? 'Send message' : 'Record voice message'}
            accessibilityRole="button"
            onPress={() => {
              if (canSend) sendMessage();
              else {
                setNotice(
                  'Hold-to-record voice messages will be connected with the chat backend.',
                );
              }
            }}
            style={({ pressed }) => [styles.sendButton, pressed && styles.pressed]}
          >
            <Ionicons
              color={colors.white}
              name={canSend ? 'send' : 'mic'}
              size={20}
            />
          </Pressable>
        </View>
      </SafeAreaView>

      {notice && (
        <View
          pointerEvents="none"
          style={[styles.notice, { bottom: safeAreaInsets.bottom + 79 }]}
        >
          <Ionicons color={colors.white} name="checkmark-circle" size={18} />
          <Text style={styles.noticeText}>{notice}</Text>
        </View>
      )}

      {actionSheet && (
        <View style={styles.quickActionLayer}>
          <Pressable
            accessibilityLabel="Close chat action"
            accessibilityRole="button"
            onPress={() => setActionSheet(undefined)}
            style={styles.quickActionBackdrop}
          />
          <View
            style={[
              styles.quickActionSheet,
              { paddingBottom: Math.max(18, safeAreaInsets.bottom + 10) },
            ]}
          >
            <View style={styles.quickActionHandle} />
            <View style={styles.quickActionHeader}>
              <View style={styles.quickActionTitleRow}>
                <View style={styles.quickActionTitleIcon}>
                  <Ionicons
                    color={colors.primaryBrandBlue}
                    name={actionSheet === 'call' ? 'call-outline' : 'attach-outline'}
                    size={22}
                  />
                </View>
                <View style={styles.quickActionTitleCopy}>
                  <Text style={styles.quickActionTitle}>
                    {actionSheet === 'call' ? 'Start a call?' : 'Share in chat'}
                  </Text>
                  <Text style={styles.quickActionDescription}>
                    {actionSheet === 'call'
                      ? `Call ${conversation.participant.name} through G-Rides.`
                      : 'Choose what you would like to send.'}
                  </Text>
                </View>
              </View>
              <Pressable
                accessibilityLabel="Close chat action"
                accessibilityRole="button"
                hitSlop={8}
                onPress={() => setActionSheet(undefined)}
                style={({ pressed }) => [
                  styles.quickActionClose,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons color={colors.textPrimary} name="close" size={21} />
              </Pressable>
            </View>

            {actionSheet === 'call' ? (
              <View style={styles.callActions}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setActionSheet(undefined)}
                  style={({ pressed }) => [
                    styles.cancelAction,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.cancelActionText}>Not now</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    setActionSheet(undefined);
                    setNotice(
                      `Calling ${conversation.participant.name} will be enabled with the calling service.`,
                    );
                  }}
                  style={({ pressed }) => [
                    styles.confirmAction,
                    pressed && styles.pressed,
                  ]}
                >
                  <Ionicons color={colors.white} name="call" size={19} />
                  <Text style={styles.confirmActionText}>Start call</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.attachmentOptions}>
                {[
                  { icon: 'images-outline' as const, label: 'Photo or video' },
                  { icon: 'document-text-outline' as const, label: 'Document' },
                  { icon: 'location-outline' as const, label: 'Share location' },
                ].map((option) => (
                  <Pressable
                    key={option.label}
                    accessibilityRole="button"
                    onPress={() => {
                      setActionSheet(undefined);
                      setNotice(
                        `${option.label} sharing will be connected to device permissions.`,
                      );
                    }}
                    style={({ pressed }) => [
                      styles.attachmentOption,
                      pressed && styles.attachmentOptionPressed,
                    ]}
                  >
                    <View style={styles.attachmentOptionIcon}>
                      <Ionicons
                        color={colors.primaryBrandBlue}
                        name={option.icon}
                        size={23}
                      />
                    </View>
                    <Text style={styles.attachmentOptionText}>
                      {option.label}
                    </Text>
                    <Ionicons
                      color={colors.textSecondary}
                      name="chevron-forward"
                      size={18}
                    />
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        </View>
      )}

      {isOptionsMenuVisible && (
        <View style={styles.optionsLayer}>
          <Pressable
            accessibilityLabel="Close conversation options"
            accessibilityRole="button"
            onPress={() => setIsOptionsMenuVisible(false)}
            style={styles.optionsBackdrop}
          />
          <View
            accessibilityRole="menu"
            style={[styles.optionsMenu, { top: safeAreaInsets.top + 58 }]}
          >
            <View style={styles.optionsMenuHeader}>
              <Text style={styles.optionsMenuTitle}>Conversation</Text>
              <Text numberOfLines={1} style={styles.optionsMenuParticipant}>
                {conversation.participant.name}
              </Text>
            </View>

            <Pressable
              accessibilityRole="menuitem"
              onPress={() => {
                setIsOptionsMenuVisible(false);
                setNotice(
                  `${conversation.participant.name}'s profile is not available in this preview yet.`,
                );
              }}
              style={({ pressed }) => [
                styles.optionsMenuItem,
                pressed && styles.optionsMenuItemPressed,
              ]}
            >
              <View style={styles.optionsMenuIcon}>
                <Ionicons
                  color={colors.primaryBrandBlue}
                  name="person-outline"
                  size={19}
                />
              </View>
              <Text style={styles.optionsMenuItemText}>View profile</Text>
              <Ionicons
                color={colors.textSecondary}
                name="chevron-forward"
                size={16}
              />
            </Pressable>

            <Pressable
              accessibilityRole="menuitem"
              onPress={() => {
                const nextMutedState = !isMuted;
                setIsMuted(nextMutedState);
                setIsOptionsMenuVisible(false);
                setNotice(
                  nextMutedState
                    ? 'Notifications muted for this conversation.'
                    : 'Conversation notifications turned back on.',
                );
              }}
              style={({ pressed }) => [
                styles.optionsMenuItem,
                pressed && styles.optionsMenuItemPressed,
              ]}
            >
              <View style={styles.optionsMenuIcon}>
                <Ionicons
                  color={colors.primaryBrandBlue}
                  name={isMuted ? 'notifications-outline' : 'notifications-off-outline'}
                  size={19}
                />
              </View>
              <Text style={styles.optionsMenuItemText}>
                {isMuted ? 'Unmute conversation' : 'Mute conversation'}
              </Text>
              {isMuted && (
                <Ionicons
                  color={colors.primaryBrandBlue}
                  name="checkmark"
                  size={17}
                />
              )}
            </Pressable>

            <View style={styles.optionsDivider} />
            <Pressable
              accessibilityRole="menuitem"
              onPress={() => {
                setIsOptionsMenuVisible(false);
                setNotice(
                  'The report flow will be connected to G-Rides support.',
                );
              }}
              style={({ pressed }) => [
                styles.optionsMenuItem,
                pressed && styles.optionsMenuItemPressed,
              ]}
            >
              <View style={[styles.optionsMenuIcon, styles.reportIcon]}>
                <Ionicons color={colors.error} name="flag-outline" size={19} />
              </View>
              <Text style={[styles.optionsMenuItemText, styles.reportText]}>
                Report conversation
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F2F5F9',
  },
  headerSafeArea: {
    backgroundColor: colors.white,
  },
  header: {
    height: 65,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF0F4',
    paddingHorizontal: layout.screenGutter,
  },
  headerAvatar: {
    width: 41,
    height: 41,
    borderRadius: 21,
    backgroundColor: colors.surfaceGray,
  },
  supportAvatar: {
    padding: 7,
  },
  headerCopy: {
    minWidth: 0,
    flex: 1,
  },
  headerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerName: {
    minWidth: 0,
    flexShrink: 1,
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 14,
    fontWeight: '600',
  },
  headerPresence: {
    color: colors.success,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    marginTop: 2,
  },
  headerAction: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: '#F4F7FB',
  },
  contextBar: {
    minHeight: 67,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5EAF0',
    backgroundColor: colors.white,
    paddingHorizontal: layout.screenGutter,
    paddingVertical: 8,
  },
  contextImage: {
    width: 55,
    height: 47,
    borderRadius: 8,
    backgroundColor: colors.surfaceGray,
  },
  contextCopy: {
    minWidth: 0,
    flex: 1,
  },
  contextLabel: {
    color: colors.primaryBrandBlue,
    fontFamily: fonts.medium,
    fontSize: 9.5,
    fontWeight: '500',
  },
  contextVehicle: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 3,
  },
  contextAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  contextActionText: {
    color: colors.primaryBrandBlue,
    fontFamily: fonts.medium,
    fontSize: 10,
    fontWeight: '500',
  },
  messageArea: {
    flex: 1,
  },
  messageListContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: layout.screenGutter,
    paddingTop: 16,
    paddingBottom: 12,
  },
  composerSafeArea: {
    backgroundColor: colors.white,
  },
  composer: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5EAF0',
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  addButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 21,
    backgroundColor: '#EDF4FE',
  },
  inputContainer: {
    minHeight: 42,
    maxHeight: 104,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 7,
    borderRadius: 21,
    backgroundColor: colors.surfaceGray,
    paddingLeft: 14,
    paddingRight: 11,
    paddingVertical: 8,
  },
  composerInput: {
    minHeight: 25,
    maxHeight: 84,
    flex: 1,
    color: colors.textPrimary,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    padding: 0,
  },
  sendButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 21,
    backgroundColor: colors.primaryBrandBlue,
    shadowColor: colors.primaryBrandBlue,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 6,
    elevation: 4,
  },
  notice: {
    position: 'absolute',
    zIndex: 90,
    right: layout.screenGutter,
    left: layout.screenGutter,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    backgroundColor: colors.primaryDark,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 9,
    elevation: 8,
  },
  noticeText: {
    flex: 1,
    color: colors.white,
    fontFamily: fonts.medium,
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 15,
  },
  quickActionLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 110,
    justifyContent: 'flex-end',
  },
  quickActionBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.48)',
  },
  quickActionSheet: {
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    backgroundColor: colors.white,
    paddingHorizontal: layout.screenGutter,
    paddingTop: 10,
  },
  quickActionHandle: {
    width: 40,
    height: 5,
    alignSelf: 'center',
    borderRadius: 3,
    backgroundColor: colors.borderGray,
    marginBottom: 17,
  },
  quickActionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  quickActionTitleRow: {
    minWidth: 0,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  quickActionTitleIcon: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: '#EDF4FE',
  },
  quickActionTitleCopy: {
    minWidth: 0,
    flex: 1,
  },
  quickActionTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 16,
    fontWeight: '600',
  },
  quickActionDescription: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 10.5,
    lineHeight: 15,
    marginTop: 4,
  },
  quickActionClose: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: colors.surfaceGray,
  },
  callActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 22,
  },
  cancelAction: {
    height: 50,
    flex: 0.8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderGray,
    borderRadius: 25,
    backgroundColor: colors.white,
  },
  cancelActionText: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 13,
    fontWeight: '600',
  },
  confirmAction: {
    height: 50,
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 25,
    backgroundColor: colors.primaryBrandBlue,
  },
  confirmActionText: {
    color: colors.white,
    fontFamily: fonts.semiBold,
    fontSize: 13,
    fontWeight: '600',
  },
  attachmentOptions: {
    gap: 9,
    marginTop: 20,
  },
  attachmentOption: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    borderRadius: 13,
    backgroundColor: '#F7F9FC',
    paddingHorizontal: 11,
  },
  attachmentOptionPressed: {
    backgroundColor: '#EDF4FE',
  },
  attachmentOptionIcon: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
    backgroundColor: colors.white,
  },
  attachmentOptionText: {
    minWidth: 0,
    flex: 1,
    color: colors.textPrimary,
    fontFamily: fonts.medium,
    fontSize: 12,
    fontWeight: '500',
  },
  optionsLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
  optionsBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.12)',
  },
  optionsMenu: {
    position: 'absolute',
    right: layout.screenGutter,
    width: 242,
    overflow: 'hidden',
    borderRadius: 15,
    backgroundColor: colors.white,
    paddingVertical: 6,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 15,
  },
  optionsMenuHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#EEF1F5',
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 10,
  },
  optionsMenuTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 13,
    fontWeight: '600',
  },
  optionsMenuParticipant: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 9.5,
    marginTop: 2,
  },
  optionsMenuItem: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
  },
  optionsMenuItemPressed: {
    backgroundColor: colors.surfaceGray,
  },
  optionsMenuIcon: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
    backgroundColor: '#EDF4FE',
  },
  optionsMenuItemText: {
    minWidth: 0,
    flex: 1,
    color: colors.textPrimary,
    fontFamily: fonts.medium,
    fontSize: 11.5,
    fontWeight: '500',
  },
  optionsDivider: {
    height: 1,
    backgroundColor: '#EEF1F5',
    marginHorizontal: 12,
  },
  reportIcon: {
    backgroundColor: '#FDECEC',
  },
  reportText: {
    color: colors.error,
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.97 }],
  },
});
