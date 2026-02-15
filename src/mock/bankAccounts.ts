export interface Bank {
  code: string;
  name: string;
  shortName?: string;
  logo?: string;
}

export interface BankAccount {
  id: string;
  bankCode: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  isDefault: boolean;
  createdAt: string;
}

export interface VirtualAccount {
  bankName: string;
  accountNumber: string;
  accountName: string;
}

export const banks: Bank[] = [
  { code: '044', name: 'Access Bank', shortName: 'Access' },
  { code: '023', name: 'Citibank Nigeria', shortName: 'Citibank' },
  { code: '063', name: 'Diamond Bank', shortName: 'Diamond' },
  { code: '050', name: 'Ecobank Nigeria', shortName: 'Ecobank' },
  { code: '084', name: 'Enterprise Bank', shortName: 'Enterprise' },
  { code: '070', name: 'Fidelity Bank', shortName: 'Fidelity' },
  { code: '011', name: 'First Bank of Nigeria', shortName: 'First Bank' },
  { code: '214', name: 'First City Monument Bank', shortName: 'FCMB' },
  { code: '058', name: 'Guaranty Trust Bank', shortName: 'GTBank' },
  { code: '030', name: 'Heritage Bank', shortName: 'Heritage' },
  { code: '301', name: 'Jaiz Bank', shortName: 'Jaiz' },
  { code: '082', name: 'Keystone Bank', shortName: 'Keystone' },
  { code: '526', name: 'Parallex Bank', shortName: 'Parallex' },
  { code: '076', name: 'Polaris Bank', shortName: 'Polaris' },
  { code: '101', name: 'Providus Bank', shortName: 'Providus' },
  { code: '221', name: 'Stanbic IBTC Bank', shortName: 'Stanbic' },
  { code: '068', name: 'Standard Chartered Bank', shortName: 'Standard Chartered' },
  { code: '232', name: 'Sterling Bank', shortName: 'Sterling' },
  { code: '100', name: 'Suntrust Bank', shortName: 'Suntrust' },
  { code: '032', name: 'Union Bank of Nigeria', shortName: 'Union Bank' },
  { code: '033', name: 'United Bank for Africa', shortName: 'UBA' },
  { code: '215', name: 'Unity Bank', shortName: 'Unity' },
  { code: '035', name: 'Wema Bank', shortName: 'Wema' },
  { code: '057', name: 'Zenith Bank', shortName: 'Zenith' },
  // Digital Banks
  { code: '999', name: 'Kuda Bank', shortName: 'Kuda' },
  { code: '090', name: 'OPay', shortName: 'OPay' },
  { code: '091', name: 'PalmPay', shortName: 'PalmPay' },
  { code: '092', name: 'Moniepoint', shortName: 'Moniepoint' },
];

export const savedBankAccounts: BankAccount[] = [
  {
    id: 'acc_001',
    bankCode: '044',
    bankName: 'Access Bank',
    accountNumber: '0123456789',
    accountName: 'CHIOMA ADEYEMI',
    isDefault: true,
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'acc_002',
    bankCode: '058',
    bankName: 'Guaranty Trust Bank',
    accountNumber: '0987654321',
    accountName: 'CHIOMA ADEYEMI',
    isDefault: false,
    createdAt: '2024-02-20T14:30:00Z',
  },
  {
    id: 'acc_003',
    bankCode: '057',
    bankName: 'Zenith Bank',
    accountNumber: '1122334455',
    accountName: 'CHIOMA ADEYEMI',
    isDefault: false,
    createdAt: '2024-03-05T09:15:00Z',
  },
];

// Virtual account for deposits
export const virtualAccount: VirtualAccount = {
  bankName: 'Providus Bank',
  accountNumber: '9876543210',
  accountName: 'TANDA/CHIOMA ADEYEMI',
};

export const getBankByCode = (code: string): Bank | undefined => {
  return banks.find(bank => bank.code === code);
};

export const getDefaultBankAccount = (): BankAccount | undefined => {
  return savedBankAccounts.find(account => account.isDefault);
};

export const searchBanks = (query: string): Bank[] => {
  const lowercaseQuery = query.toLowerCase();
  return banks.filter(bank =>
    bank.name.toLowerCase().includes(lowercaseQuery) ||
    bank.shortName?.toLowerCase().includes(lowercaseQuery)
  );
};

export const formatAccountNumber = (accountNumber: string): string => {
  // Format: XXXX XXXX XX
  return accountNumber.replace(/(\d{4})(\d{4})(\d{2})/, '$1 $2 $3');
};

export const maskAccountNumber = (accountNumber: string): string => {
  // Show only last 4 digits: **** **** 89
  const last4 = accountNumber.slice(-4);
  return `**** **** ${last4.slice(0, 2)}`;
};
