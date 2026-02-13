// Security utilities for SafeGard application

/**
 * Sanitizes HTML content to prevent XSS attacks
 */
export function sanitizeHtml(html: string): string {
  // Create a temporary div element
  const temp = document.createElement('div')
  temp.textContent = html
  return temp.innerHTML
}

/**
 * Validates and sanitizes user input
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 1000) // Limit length
}

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validates contract address format (basic validation)
 */
export function isValidContractAddress(address: string): boolean {
  // Basic validation for blockchain addresses
  return /^[a-zA-Z0-9]{40,}$/.test(address)
}

/**
 * Masks sensitive data for logging
 */
export function maskSensitiveData(data: string): string {
  if (data.length <= 8) return '***'
  return data.substring(0, 4) + '***' + data.substring(data.length - 4)
}

/**
 * Generates a secure random nonce for CSP
 */
export function generateNonce(): string {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Validates numeric input for amounts
 */
export function validateAmount(amount: string): { isValid: boolean; error?: string } {
  const num = parseFloat(amount)
  
  if (isNaN(num)) {
    return { isValid: false, error: 'Invalid number format' }
  }
  
  if (num < 0) {
    return { isValid: false, error: 'Amount cannot be negative' }
  }
  
  if (num > 1000000000) {
    return { isValid: false, error: 'Amount too large' }
  }
  
  return { isValid: true }
}
