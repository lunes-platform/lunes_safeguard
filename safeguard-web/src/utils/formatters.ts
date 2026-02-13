// Formatting utilities for SafeGard application

/**
 * Formats numbers with locale-specific formatting
 */
export function formatNumber(
  value: number,
  locale: string = 'pt-BR',
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(locale, options).format(value)
}

/**
 * Formats currency values in LUNES equivalent
 */
export function formatCurrency(
  value: number,
  currency: string = 'LUNES',
  locale: string = 'pt-BR'
): string {
  // Handle custom currencies that don't have ISO codes
  const customCurrencies = ['LUNES', 'LUSDT', 'LBTC'];

  if (customCurrencies.includes(currency)) {
    const symbol = currency === 'LUSDT' ? '$' : currency;
    return `${formatNumber(value, locale)} ${symbol}`;
  }

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    // Fallback for invalid currency codes
    return `${formatNumber(value, locale)} ${currency}`;
  }
}

/**
 * Formats large numbers with K, M, B suffixes
 */
export function formatCompactNumber(value: number, locale: string = 'pt-BR'): string {
  return new Intl.NumberFormat(locale, {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}

/**
 * Formats percentage values
 */
export function formatPercentage(value: number, locale: string = 'pt-BR'): string {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100)
}

/**
 * Formats dates with locale-specific formatting
 */
export function formatDate(
  date: Date,
  locale: string = 'pt-BR',
  options?: Intl.DateTimeFormatOptions
): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }

  return new Intl.DateTimeFormat(locale, { ...defaultOptions, ...options }).format(date)
}

/**
 * Formats relative time (e.g., "2 days ago", "in 3 hours")
 */
export function formatRelativeTime(
  date: Date,
  locale: string = 'pt-BR'
): string {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
  const now = new Date()
  const diffInSeconds = (date.getTime() - now.getTime()) / 1000

  const units: Array<[string, number]> = [
    ['year', 31536000],
    ['month', 2592000],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
    ['second', 1],
  ]

  for (const [unit, secondsInUnit] of units) {
    const value = Math.round(diffInSeconds / secondsInUnit)
    if (Math.abs(value) >= 1) {
      return rtf.format(value, unit as Intl.RelativeTimeFormatUnit)
    }
  }

  return rtf.format(0, 'second')
}

/**
 * Formats countdown timer (e.g., "2d 5h 30m")
 */
export function formatCountdown(targetDate: Date): string {
  const now = new Date()
  const diff = targetDate.getTime() - now.getTime()

  if (diff <= 0) return '0m'

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  const parts = []
  if (days > 0) parts.push(`${days}d`)
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0 && days === 0) parts.push(`${minutes}m`)

  return parts.join(' ') || '0m'
}

/**
 * Truncates text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength - 3) + '...'
}

/**
 * Formats contract address for display
 */
export function formatAddress(address: string): string {
  if (address.length <= 10) return address
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
}
