import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, borderRadius, layout } from '../../../src/theme';
import { Header } from '../../../src/components/layout';
import { SearchBar, Avatar, EmptyState } from '../../../src/components/ui';
import { contacts, Contact, searchContacts, getFavoriteContacts, getRecentContacts } from '../../../src/mock/contacts';
import { lightHaptic } from '../../../src/utils/haptics';

interface ContactItemProps {
  contact: Contact;
  onPress: () => void;
}

const ContactItem: React.FC<ContactItemProps> = ({ contact, onPress }) => (
  <TouchableOpacity style={styles.contactItem} onPress={onPress} activeOpacity={0.7}>
    <Avatar name={contact.name} size="medium" />
    <View style={styles.contactInfo}>
      <Text style={styles.contactName}>{contact.name}</Text>
      {contact.username ? (
        <Text style={styles.contactUsername}>@{contact.username}</Text>
      ) : (
        <Text style={styles.contactPhone}>{contact.phoneNumber}</Text>
      )}
    </View>
    {!contact.isRegistered && (
      <View style={styles.inviteBadge}>
        <Text style={styles.inviteText}>Invite</Text>
      </View>
    )}
  </TouchableOpacity>
);

export default function SendScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredContacts = searchQuery ? searchContacts(searchQuery) : [];
  const favoriteContacts = getFavoriteContacts();
  const recentContacts = getRecentContacts(5);

  const handleContactPress = (contact: Contact) => {
    lightHaptic();
    if (contact.isRegistered) {
      router.push({
        pathname: '/(main)/(send)/amount',
        params: { contactId: contact.id, contactName: contact.name },
      });
    }
  };

  const renderSearchResults = () => {
    if (filteredContacts.length === 0) {
      return (
        <EmptyState
          type="search"
          title="No results found"
          description="Try searching with a different name or phone number"
        />
      );
    }

    return (
      <FlatList
        data={filteredContacts}
        renderItem={({ item }) => (
          <ContactItem contact={item} onPress={() => handleContactPress(item)} />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
    );
  };

  const renderContacts = () => (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {recentContacts.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent</Text>
          <View style={styles.recentRow}>
            {recentContacts.map((contact) => (
              <TouchableOpacity
                key={contact.id}
                style={styles.recentItem}
                onPress={() => handleContactPress(contact)}
              >
                <Avatar name={contact.name} size="large" />
                <Text style={styles.recentName} numberOfLines={1}>
                  {contact.name.split(' ')[0]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {favoriteContacts.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Favorites</Text>
          {favoriteContacts.map((contact) => (
            <ContactItem
              key={contact.id}
              contact={contact}
              onPress={() => handleContactPress(contact)}
            />
          ))}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>All Contacts</Text>
        {contacts
          .filter((c) => c.isRegistered)
          .map((contact) => (
            <ContactItem
              key={contact.id}
              contact={contact}
              onPress={() => handleContactPress(contact)}
            />
          ))}
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header title="Send Money" showBack />

      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search name, username, or phone"
        />
      </View>

      {searchQuery ? renderSearchResults() : renderContacts()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  searchContainer: {
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[4],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing[5],
  },
  list: {
    paddingHorizontal: spacing[5],
  },
  bottomPadding: {
    height: spacing[8],
  },
  section: {
    marginBottom: spacing[6],
  },
  sectionTitle: {
    ...typography.labelLarge,
    color: colors.text.tertiary,
    marginBottom: spacing[3],
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  recentRow: {
    flexDirection: 'row',
    gap: spacing[4],
  },
  recentItem: {
    alignItems: 'center',
    width: 72,
  },
  recentName: {
    ...typography.labelMedium,
    color: colors.text.secondary,
    marginTop: spacing[2],
    textAlign: 'center',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[3],
  },
  contactInfo: {
    flex: 1,
    marginLeft: spacing[3],
  },
  contactName: {
    ...typography.bodyLarge,
    color: colors.text.primary,
  },
  contactUsername: {
    ...typography.bodySmall,
    color: colors.primary[500],
    marginTop: 2,
  },
  contactPhone: {
    ...typography.bodySmall,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  inviteBadge: {
    backgroundColor: colors.primary[500] + '20',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.full,
  },
  inviteText: {
    ...typography.labelSmall,
    color: colors.primary[500],
  },
});
