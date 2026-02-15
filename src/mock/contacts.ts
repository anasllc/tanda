export interface Contact {
  id: string;
  name: string;
  phoneNumber: string;
  username?: string;
  avatar?: string;
  isRegistered: boolean;
  isFavorite: boolean;
  lastTransactionAt?: string;
}

export const contacts: Contact[] = [
  // Registered users (on Tanda)
  {
    id: 'contact_001',
    name: 'Emeka Okonkwo',
    phoneNumber: '+2348023456789',
    username: 'emeka',
    isRegistered: true,
    isFavorite: true,
    lastTransactionAt: '2024-03-15T14:30:00Z',
  },
  {
    id: 'contact_002',
    name: 'Ngozi Eze',
    phoneNumber: '+2348034567890',
    username: 'ngozi',
    isRegistered: true,
    isFavorite: true,
    lastTransactionAt: '2024-03-15T12:15:00Z',
  },
  {
    id: 'contact_003',
    name: 'Chidi Nwosu',
    phoneNumber: '+2348045678901',
    username: 'chidi',
    isRegistered: true,
    isFavorite: false,
    lastTransactionAt: '2024-03-14T08:00:00Z',
  },
  {
    id: 'contact_004',
    name: 'Amara Obi',
    phoneNumber: '+2348056789012',
    username: 'amara',
    isRegistered: true,
    isFavorite: true,
    lastTransactionAt: '2024-03-12T19:45:00Z',
  },
  {
    id: 'contact_005',
    name: 'Kelechi Udoka',
    phoneNumber: '+2348067890123',
    username: 'kelechi',
    isRegistered: true,
    isFavorite: false,
    lastTransactionAt: '2024-03-05T20:00:00Z',
  },
  {
    id: 'contact_006',
    name: 'Adaeze Ikenna',
    phoneNumber: '+2348078901234',
    username: 'adaeze',
    isRegistered: true,
    isFavorite: false,
    lastTransactionAt: '2024-03-11T09:00:00Z',
  },
  {
    id: 'contact_007',
    name: 'Obinna Chukwu',
    phoneNumber: '+2348089012345',
    username: 'obinna',
    isRegistered: true,
    isFavorite: false,
    lastTransactionAt: '2024-03-09T18:30:00Z',
  },
  {
    id: 'contact_008',
    name: 'Ifeanyi Okoro',
    phoneNumber: '+2348090123456',
    username: 'ifeanyi',
    isRegistered: true,
    isFavorite: false,
  },
  {
    id: 'contact_009',
    name: 'Chiamaka Udo',
    phoneNumber: '+2348001234567',
    username: 'chiamaka',
    isRegistered: true,
    isFavorite: true,
  },
  {
    id: 'contact_010',
    name: 'Tochi Nnaji',
    phoneNumber: '+2348012345670',
    username: 'tochi',
    isRegistered: true,
    isFavorite: false,
  },
  {
    id: 'contact_011',
    name: 'Somto Agu',
    phoneNumber: '+2348023456701',
    username: 'somto',
    isRegistered: true,
    isFavorite: false,
  },
  {
    id: 'contact_012',
    name: 'Ifeoma Nwachukwu',
    phoneNumber: '+2348034567012',
    username: 'ifeoma',
    isRegistered: true,
    isFavorite: false,
  },
  {
    id: 'contact_013',
    name: 'Chukwuemeka Ani',
    phoneNumber: '+2348045670123',
    username: 'chukwuemeka',
    isRegistered: true,
    isFavorite: false,
  },
  {
    id: 'contact_014',
    name: 'Nkechi Obi',
    phoneNumber: '+2348056701234',
    username: 'nkechi',
    isRegistered: true,
    isFavorite: false,
  },
  {
    id: 'contact_015',
    name: 'Ebuka Eze',
    phoneNumber: '+2348067012345',
    username: 'ebuka',
    isRegistered: true,
    isFavorite: false,
  },
  // Unregistered contacts (not on Tanda)
  {
    id: 'contact_016',
    name: 'Mama',
    phoneNumber: '+2348070123456',
    isRegistered: false,
    isFavorite: true,
  },
  {
    id: 'contact_017',
    name: 'Papa',
    phoneNumber: '+2348071234567',
    isRegistered: false,
    isFavorite: true,
  },
  {
    id: 'contact_018',
    name: 'Aunty Nkem',
    phoneNumber: '+2348072345678',
    isRegistered: false,
    isFavorite: false,
  },
  {
    id: 'contact_019',
    name: 'Uncle Uche',
    phoneNumber: '+2348073456789',
    isRegistered: false,
    isFavorite: false,
  },
  {
    id: 'contact_020',
    name: 'Landlord',
    phoneNumber: '+2348074567890',
    isRegistered: false,
    isFavorite: false,
  },
];

export const getFavoriteContacts = (): Contact[] => {
  return contacts.filter(contact => contact.isFavorite);
};

export const getRegisteredContacts = (): Contact[] => {
  return contacts.filter(contact => contact.isRegistered);
};

export const getUnregisteredContacts = (): Contact[] => {
  return contacts.filter(contact => !contact.isRegistered);
};

export const getRecentContacts = (limit: number = 5): Contact[] => {
  return [...contacts]
    .filter(contact => contact.lastTransactionAt)
    .sort((a, b) =>
      new Date(b.lastTransactionAt!).getTime() - new Date(a.lastTransactionAt!).getTime()
    )
    .slice(0, limit);
};

export const searchContacts = (query: string): Contact[] => {
  const lowercaseQuery = query.toLowerCase();
  return contacts.filter(contact =>
    contact.name.toLowerCase().includes(lowercaseQuery) ||
    contact.phoneNumber.includes(query) ||
    contact.username?.toLowerCase().includes(lowercaseQuery)
  );
};

export const getContactById = (id: string): Contact | undefined => {
  return contacts.find(contact => contact.id === id);
};
