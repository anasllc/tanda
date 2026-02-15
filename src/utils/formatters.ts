import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';

/**
 * Format currency amount
 */
export const formatCurrency = (
  amount: number,
  currency: string = 'NGN',
  showSymbol: boolean = true
): string => {
  const symbols: Record<string, string> = {
    NGN: '₦',
    USD: '$',
    GBP: '£',
    EUR: '€',
  };

  const symbol = showSymbol ? symbols[currency] || currency : '';
  const formatted = new Intl.NumberFormat('en-NG', {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return `${symbol}${formatted}`;
};

/**
 * Format currency for compact display (e.g., 1.5M, 250K)
 */
export const formatCurrencyCompact = (amount: number, currency: string = 'NGN'): string => {
  const symbols: Record<string, string> = {
    NGN: '₦',
    USD: '$',
    GBP: '£',
    EUR: '€',
  };

  const symbol = symbols[currency] || currency;

  if (amount >= 1000000) {
    return `${symbol}${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `${symbol}${(amount / 1000).toFixed(1)}K`;
  }
  return `${symbol}${amount}`;
};

/**
 * Format phone number for display
 */
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');

  // Nigerian number format
  if (digits.startsWith('234') && digits.length === 13) {
    const local = digits.slice(3);
    return `+234 ${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`;
  }

  if (digits.startsWith('0') && digits.length === 11) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  }

  return phone;
};

/**
 * Format date for transaction list
 */
export const formatTransactionDate = (dateString: string): string => {
  const date = new Date(dateString);

  if (isToday(date)) {
    return `Today, ${format(date, 'h:mm a')}`;
  }

  if (isYesterday(date)) {
    return `Yesterday, ${format(date, 'h:mm a')}`;
  }

  return format(date, 'MMM d, h:mm a');
};

/**
 * Format date for grouping (e.g., "Today", "Yesterday", "March 14")
 */
export const formatDateGroup = (dateString: string): string => {
  const date = new Date(dateString);

  if (isToday(date)) {
    return 'Today';
  }

  if (isYesterday(date)) {
    return 'Yesterday';
  }

  return format(date, 'MMMM d, yyyy');
};

/**
 * Format relative time
 */
export const formatRelativeTime = (dateString: string): string => {
  return formatDistanceToNow(new Date(dateString), { addSuffix: true });
};

/**
 * Format time only
 */
export const formatTime = (dateString: string): string => {
  return format(new Date(dateString), 'h:mm a');
};

/**
 * Format full date
 */
export const formatFullDate = (dateString: string): string => {
  return format(new Date(dateString), 'EEEE, MMMM d, yyyy');
};

/**
 * Format date for receipts
 */
export const formatReceiptDate = (dateString: string): string => {
  return format(new Date(dateString), 'MMM d, yyyy • h:mm a');
};

/**
 * Get user initials from name
 */
export const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

/**
 * Mask sensitive data
 */
export const maskString = (str: string, visibleChars: number = 4): string => {
  if (str.length <= visibleChars) return str;
  const masked = '*'.repeat(str.length - visibleChars);
  return masked + str.slice(-visibleChars);
};

/**
 * Format account number with spaces
 */
export const formatAccountNumber = (accountNumber: string): string => {
  return accountNumber.replace(/(\d{4})/g, '$1 ').trim();
};

/**
 * Generate transaction reference
 */
export const generateReference = (prefix: string = 'TND'): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}${timestamp}${random}`;
};
