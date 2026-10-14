import Ionicons from '@expo/vector-icons/Ionicons';
import { memo } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors, fonts } from '../theme';
import type { ChatConversation, ChatMessage } from '../types/chat';

function formatConversationTime(timestamp: string) {
  const date = new Date(timestamp);
  const today = new Date();
  const dayDifference = Math.floor(
    (new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime() -
      new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()) /
      86_400_000,
  );

  if (dayDifference === 0) {
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }
  if (dayDifference === 1) return 'Yesterday';
  return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
}

function formatMessageTime(timestamp: string) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
}

type ConversationListItemProps = {
  conversation: ChatConversation;
  onPress: () => void;
};

export const ConversationListItem = memo(function ConversationListItem({
  conversation,
  onPress,
}: ConversationListItemProps) {
  const lastMessage = conversation.messages.at(-1);
  const unread = conversation.unreadCount > 0;

  return (
    <Pressable
      accessibilityHint="Opens this conversation"
      accessibilityLabel={`Conversation with ${conversation.participant.name}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.conversationCard,
        unread && styles.unreadConversationCard,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.avatarContainer}>
        <Image
          resizeMode={conversation.participant.isSupport ? 'contain' : 'cover'}
          source={conversation.participant.avatar}
          style={[
            styles.avatar,
            conversation.participant.isSupport && styles.supportAvatar,
          ]}
        />
        <View
          style={[
            styles.presenceDot,
            conversation.participant.isOnline
              ? styles.onlineDot
              : styles.offlineDot,
          ]}
        />
      </View>

      <View style={styles.conversationCopy}>
        <View style={styles.conversationTitleRow}>
          <View style={styles.participantNameRow}>
            <Text numberOfLines={1} style={styles.participantName}>
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
          {lastMessage && (
            <Text style={[styles.messageTime, unread && styles.unreadMessageTime]}>
              {formatConversationTime(lastMessage.sentAt)}
            </Text>
          )}
        </View>

        <Text style={styles.participantRole}>{conversation.participant.role}</Text>

        <View style={styles.previewRow}>
          <Text
            numberOfLines={1}
            style={[styles.messagePreview, unread && styles.unreadMessagePreview]}
          >
            {lastMessage?.sender === 'me' ? 'You: ' : ''}
            {lastMessage?.text || 'Start a conversation'}
          </Text>
          {unread ? (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>
                {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
              </Text>
            </View>
          ) : lastMessage?.sender === 'me' ? (
            <Ionicons
              color={colors.primaryBrandBlue}
              name={lastMessage.status === 'read' ? 'checkmark-done' : 'checkmark'}
              size={16}
            />
          ) : null}
        </View>

        {conversation.vehicle && (
          <View style={styles.bookingContext}>
            <Image source={conversation.vehicle.image} style={styles.contextImage} />
            <Text numberOfLines={1} style={styles.contextText}>
              {conversation.bookingLabel} · {conversation.vehicle.model}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
});

type MessageBubbleProps = {
  message: ChatMessage;
  participantAvatar: ChatConversation['participant']['avatar'];
};

export const MessageBubble = memo(function MessageBubble({
  message,
  participantAvatar,
}: MessageBubbleProps) {
  const mine = message.sender === 'me';

  return (
    <View style={[styles.messageRow, mine && styles.myMessageRow]}>
      {!mine && (
        <Image source={participantAvatar} style={styles.messageAvatar} />
      )}
      <View
        style={[
          styles.messageBubble,
          mine ? styles.myMessageBubble : styles.otherMessageBubble,
        ]}
      >
        <Text style={[styles.messageText, mine && styles.myMessageText]}>
          {message.text}
        </Text>
        <View style={[styles.bubbleMeta, mine && styles.myBubbleMeta]}>
          <Text style={[styles.bubbleTime, mine && styles.myBubbleTime]}>
            {formatMessageTime(message.sentAt)}
          </Text>
          {mine && (
            <Ionicons
              color="rgba(255,255,255,0.82)"
              name={message.status === 'read' ? 'checkmark-done' : 'checkmark'}
              size={14}
            />
          )}
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  conversationCard: {
    minHeight: 105,
    flexDirection: 'row',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF0F4',
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  unreadConversationCard: {
    backgroundColor: '#EDF4FE',
  },
  avatarContainer: {
    width: 56,
    height: 56,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surfaceGray,
  },
  supportAvatar: {
    padding: 9,
  },
  presenceDot: {
    position: 'absolute',
    right: 1,
    bottom: 1,
    width: 13,
    height: 13,
    borderWidth: 2.5,
    borderColor: colors.white,
    borderRadius: 7,
  },
  onlineDot: {
    backgroundColor: colors.success,
  },
  offlineDot: {
    backgroundColor: '#AAB2BF',
  },
  conversationCopy: {
    minWidth: 0,
    flex: 1,
  },
  conversationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  participantNameRow: {
    minWidth: 0,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  participantName: {
    minWidth: 0,
    flexShrink: 1,
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 15.5,
    fontWeight: '600',
  },
  messageTime: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 11.5,
  },
  unreadMessageTime: {
    color: colors.primaryBrandBlue,
    fontFamily: fonts.medium,
    fontWeight: '500',
  },
  participantRole: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 11.5,
    marginTop: 2,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 7,
  },
  messagePreview: {
    minWidth: 0,
    flex: 1,
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 12.5,
  },
  unreadMessagePreview: {
    color: colors.textPrimary,
    fontFamily: fonts.medium,
    fontWeight: '500',
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: colors.primaryBrandBlue,
    paddingHorizontal: 5,
  },
  unreadBadgeText: {
    color: colors.white,
    fontFamily: fonts.semiBold,
    fontSize: 11,
    fontWeight: '600',
  },
  bookingContext: {
    height: 26,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    overflow: 'hidden',
    borderRadius: 7,
    backgroundColor: '#EDF4FE',
    paddingRight: 8,
    marginTop: 9,
  },
  contextImage: {
    width: 34,
    height: 26,
  },
  contextText: {
    maxWidth: 205,
    color: colors.primaryBrandBlue,
    fontFamily: fonts.medium,
    fontSize: 10.5,
    fontWeight: '500',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 7,
    paddingRight: 54,
    marginBottom: 12,
  },
  myMessageRow: {
    justifyContent: 'flex-end',
    paddingRight: 0,
    paddingLeft: 54,
  },
  messageAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surfaceGray,
  },
  messageBubble: {
    maxWidth: '88%',
    borderRadius: 17,
    paddingHorizontal: 13,
    paddingTop: 10,
    paddingBottom: 7,
  },
  otherMessageBubble: {
    borderBottomLeftRadius: 5,
    backgroundColor: colors.white,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  myMessageBubble: {
    borderBottomRightRadius: 5,
    backgroundColor: colors.primaryBrandBlue,
  },
  messageText: {
    color: colors.textPrimary,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19,
  },
  myMessageText: {
    color: colors.white,
  },
  bubbleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 3,
    marginTop: 4,
  },
  myBubbleMeta: {
    alignSelf: 'flex-end',
  },
  bubbleTime: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 8,
  },
  myBubbleTime: {
    color: 'rgba(255,255,255,0.72)',
  },
  pressed: {
    opacity: 0.72,
  },
});
