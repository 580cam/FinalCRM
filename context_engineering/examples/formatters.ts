/**
 * Utility functions for formatting values in the UI
 */

/**
 * Format a number as currency
 * @param value - The number to format
 * @param locale - The locale to use (defaults to 'en-US')
 * @param currency - The currency code (defaults to 'USD')
 * @returns Formatted currency string
 */
export function formatCurrency(
  value: number | null | undefined,
  locale = 'en-US',
  currency = 'USD'
): string {
  if (value === null || value === undefined) {
    return '$0.00';
  }
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format a number with commas
 * @param value - The number to format
 * @returns Formatted number string with commas
 */
export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return '0';
  }
  
  return new Intl.NumberFormat().format(value);
}

/**
 * Format a date to a readable string
 * @param date - The date to format
 * @param format - The format to use ('short', 'medium', 'long', 'full')
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string | null | undefined,
  format: 'short' | 'medium' | 'long' | 'full' = 'medium'
): string {
  if (!date) {
    return 'No date';
  }
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const options: Intl.DateTimeFormatOptions = {
    short: { month: 'numeric', day: 'numeric', year: '2-digit' },
    medium: { month: 'short', day: 'numeric', year: 'numeric' },
    long: { month: 'long', day: 'numeric', year: 'numeric' },
    full: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }
  }[format];
  
  return new Intl.DateTimeFormat('en-US', options).format(dateObj);
}

/**
 * Format a phone number to (XXX) XXX-XXXX
 * @param phone - The phone number to format
 * @returns Formatted phone number
 */
export function formatPhone(phone: string | null | undefined): string {
  if (!phone) {
    return '';
  }
  
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Check if we have a valid 10-digit number
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  // Return original if not valid
  return phone;
}

/**
 * Format a time value in hours to a readable hours and minutes format
 * @param hours - The time in hours
 * @returns Formatted time string (e.g., "2 hrs 30 mins" or "45 mins")
 */
export function formatTime(hours: number | null | undefined): string {
  if (hours === null || hours === undefined || hours === 0) {
    return '0 mins';
  }
  
  const totalMinutes = Math.round(hours * 60);
  const hoursPart = Math.floor(totalMinutes / 60);
  const minutesPart = totalMinutes % 60;
  
  if (hoursPart === 0) {
    return `${minutesPart} mins`;
  } else if (minutesPart === 0) {
    return `${hoursPart} ${hoursPart === 1 ? 'hr' : 'hrs'}`;
  } else {
    return `${hoursPart} ${hoursPart === 1 ? 'hr' : 'hrs'} ${minutesPart} mins`;
  }
}
