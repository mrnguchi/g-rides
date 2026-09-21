import Ionicons from '@expo/vector-icons/Ionicons';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ConversationListItem, HomeBottomNavigation } from '../components';
import type { MainTab } from '../components';
import { colors, fonts, layout } from '../theme';
import type { ChatConversation } from '../types/chat';

type MessageFilter = 'all' | 'support' | 'unread';

type MessagesScreenProps = {
  conversations: ChatConversation[];
  onOpenConversation: (conversationId: string) => void;
  onTabPress?: (tab: MainTab) => void;
  unreadMessagesCount: number;
};

const filters: Array<{ key: MessageFilter; label: string }> = [
  { key: 'all', label: 'All messages' },
  { key: 'unread', label: 'Unread' },
  { key: 'support', label: 'Support' },
];

function lastMessageTime(conversation: ChatConversation) {
  const lastMessage = conversation.messages[conversation.messages.length - 1];
  return lastMessage ? new Date(lastMessage.sentAt).getTime() : 0;
}

export function MessagesScreen({
  conversations,
  onOpenConversation,
  onTabPress,
  unreadMessagesCount,
}: MessagesScreenProps) {
  const [activeFilter, setActiveFilter] = useState<MessageFilter>('all');
  const [notice, setNotice] = useState<string>();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(undefined), 3500);
    return () => clearTimeout(timer);
  }, [notice]);

  const displayedConversations = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return conversations
      .filter((conversation) => {
        const matchesFilter =
          activeFilter === 'all' ||
          (activeFilter === 'unread' && conversation.unreadCount > 0) ||
          (activeFilter === 'support' && conversation.participant.isSupport);
        const matchesSearch =
          !normalizedQuery ||
          `${conversation.participant.name} ${conversation.participant.role} ${conversation.vehicle?.model ?? ''}`
            .toLowerCase()
            .includes(normalizedQuery);

        return matchesFilter && matchesSearch;
      })
      .sort((first, second) => {
        if (first.isPinned !== second.isPinned) return first.isPinned ? -1 : 1;
        return lastMessageTime(second) - lastMessageTime(first);
      });
  }, [activeFilter, conversations, searchQuery]);

  return (
    <View style={styles.screen}>
      <StatusBar backgroundColor={colors.white} style="dark" />
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <FlatList
          contentContainerStyle={[
            styles.listContent,
            !displayedConversations.length && styles.emptyListContent,
          ]}
          data={displayedConversations}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          keyExtractor={(conversation) => conversation.id}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons
                  color={colors.primaryBrandBlue}
                  name="chatbubbles-outline"
                  size={34}
                />
              </View>
              <Text style={styles.emptyTitle}>No conversations found</Text>
              <Text style={styles.emptyText}>
                Try another search or choose a different message filter.
              </Text>
            </View>
          }
          ListHeaderComponent={
            <View style={styles.headerContent}>
              <View style={styles.titleRow}>
                <View>
                  <Text style={styles.title}>Messages</Text>
                  <Text style={styles.subtitle}>
                    Chat with owners, drivers, and support
                  </Text>
                </View>
                <Pressable
                  accessibilityLabel="Start a new conversation"
                  accessibilityRole="button"
                  onPress={() =>
                    setNotice(
                      'Choose a rental, owner, or driver from their profile to start a conversation.',
                    )
                  }
                  style={({ pressed }) => [
                    styles.composeButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <Ionicons color={colors.white} name="create-outline" size={22} />
                </Pressable>
              </View>

              <View style={styles.searchBar}>
                <Ionicons
                  color={colors.textSecondary}
                  name="search-outline"
                  size={21}
                />
                <TextInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  onChangeText={setSearchQuery}
                  placeholder="Search conversations"
                  placeholderTextColor={colors.textSecondary}
                  returnKeyType="search"
                  selectionColor={colors.primaryBrandBlue}
                  style={styles.searchInput}
                  value={searchQuery}
                />
                {!!searchQuery && (
                  <Pressable
                    accessibilityLabel="Clear search"
                    hitSlop={8}
                    onPress={() => setSearchQuery('')}
                  >
                    <Ionicons
                      color={colors.textSecondary}
                      name="close-circle"
                      size={19}
                    />
                  </Pressable>
                )}
              </View>

              <View style={styles.filterRow}>
                {filters.map((filter) => {
                  const active = filter.key === activeFilter;
                  const count =
                    filter.key === 'unread' ? unreadMessagesCount : undefined;

                  return (
                    <Pressable
                      key={filter.key}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                      onPress={() => setActiveFilter(filter.key)}
                      style={({ pressed }) => [
                        styles.filterChip,
                        active && styles.activeFilterChip,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Text
                        style={[
                          styles.filterText,
                          active && styles.activeFilterText,
                        ]}
                      >
                        {filter.label}
                      </Text>
                      {typeof count === 'number' && count > 0 && (
                        <View
                          style={[
                            styles.filterCount,
                            active && styles.activeFilterCount,
                          ]}
                        >
                          <Text
                            style={[
                              styles.filterCountText,
                              active && styles.activeFilterCountText,
                            ]}
                          >
                            {count > 9 ? '9+' : count}
                          </Text>
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </View>

              <View style={styles.conversationHeader}>
                <Text style={styles.conversationTitle}>Conversations</Text>
                <Text style={styles.conversationCount}>
                  {displayedConversations.length}
                </Text>
              </View>
            </View>
          }
          renderItem={({ item }) => (
            <ConversationListItem
              conversation={item}
              onPress={() => onOpenConversation(item.id)}
            />
          )}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>

      {notice && (
        <View pointerEvents="none" style={styles.notice}>
          <Ionicons color={colors.white} name="information-circle" size={19} />
          <Text style={styles.noticeText}>{notice}</Text>
        </View>
      )}

      <HomeBottomNavigation
        activeTab="messages"
        onTabPress={onTabPress}
        unreadMessagesCount={unreadMessagesCount}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.white,
  },
  safeArea: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 120,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  headerContent: {
    backgroundColor: colors.white,
    paddingHorizontal: layout.screenGutter,
    paddingTop: 25,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: colors.textPrimary,
    fontFamily: fonts.bold,
    fontSize: 25,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 11,
    marginTop: 4,
  },
  composeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    backgroundColor: colors.primaryBrandBlue,
    shadowColor: colors.primaryBrandBlue,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.24,
    shadowRadius: 7,
    elevation: 5,
  },
  searchBar: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 13,
    backgroundColor: colors.surfaceGray,
    paddingHorizontal: 13,
    marginTop: 23,
  },
  searchInput: {
    minWidth: 0,
    flex: 1,
    color: colors.textPrimary,
    fontFamily: fonts.regular,
    fontSize: 14,
    paddingVertical: 0,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 15,
  },
  filterChip: {
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: colors.borderGray,
    borderRadius: 18,
    backgroundColor: colors.white,
    paddingHorizontal: 13,
  },
  activeFilterChip: {
    borderColor: colors.primaryBrandBlue,
    backgroundColor: colors.primaryBrandBlue,
  },
  filterText: {
    color: colors.textSecondary,
    fontFamily: fonts.medium,
    fontSize: 11,
    fontWeight: '500',
  },
  activeFilterText: {
    color: colors.white,
  },
  filterCount: {
    minWidth: 17,
    height: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
    backgroundColor: '#EDF4FE',
    paddingHorizontal: 4,
  },
  activeFilterCount: {
    backgroundColor: colors.white,
  },
  filterCountText: {
    color: colors.primaryBrandBlue,
    fontFamily: fonts.semiBold,
    fontSize: 8,
    fontWeight: '600',
  },
  activeFilterCountText: {
    color: colors.primaryBrandBlue,
  },
  conversationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingTop: 25,
    paddingBottom: 9,
  },
  conversationTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 16,
    fontWeight: '600',
  },
  conversationCount: {
    minWidth: 22,
    height: 22,
    textAlign: 'center',
    textAlignVertical: 'center',
    color: colors.primaryBrandBlue,
    fontFamily: fonts.semiBold,
    fontSize: 10,
    fontWeight: '600',
    borderRadius: 11,
    backgroundColor: '#EDF4FE',
    paddingHorizontal: 5,
    paddingTop: 4,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 34,
    paddingBottom: 90,
  },
  emptyIcon: {
    width: 66,
    height: 66,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 33,
    backgroundColor: '#EDF4FE',
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontFamily: fonts.semiBold,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 15,
  },
  emptyText: {
    color: colors.textSecondary,
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 6,
  },
  notice: {
    position: 'absolute',
    zIndex: 20,
    right: layout.screenGutter,
    bottom: 104,
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
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 15,
  },
  pressed: {
    opacity: 0.72,
  },
});
