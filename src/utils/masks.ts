// #region Utility functions for input masks and formatting
export function formatDate(value: string): string {
  // Remove non-digits
  const digits = value.replace(/\D/g, '')

  // Apply dd/mm/yyyy mask
  if (digits.length <= 2) {
    return digits
  } else if (digits.length <= 4) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`
  } else {
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`
  }
}

export function formatTime(value: string): string {
  // Remove non-digits
  const digits = value.replace(/\D/g, '')

  // Apply hh:mm:ss mask (flexible)
  if (digits.length <= 2) {
    return digits
  } else if (digits.length <= 4) {
    return `${digits.slice(0, 2)}:${digits.slice(2)}`
  } else {
    return `${digits.slice(0, 2)}:${digits.slice(2, 4)}:${digits.slice(4, 6)}`
  }
}

export function formatPhone(value: string): string {
  // Remove non-digits
  const digits = value.replace(/\D/g, '')

  // Apply (xx) xxxxx-xxxx mask
  if (digits.length <= 2) {
    return digits
  } else if (digits.length <= 7) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  } else if (digits.length <= 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  } else {
    // Limit to 11 digits
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`
  }
}

export function formatEmail(value: string): string {
  // Just trim and lowercase for email
  return value.trim().toLowerCase()
}

export function isValidDate(dateStr: string): boolean {
  const match = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!match) return false

  const [, day, month, year] = match
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))

  return date.getDate() === parseInt(day) &&
         date.getMonth() === parseInt(month) - 1 &&
         date.getFullYear() === parseInt(year)
}

export function isValidTime(timeStr: string): boolean {
  if (!timeStr) return true // optional field

  const match = timeStr.match(/^(\d{1,2})(?::(\d{1,2}))?(?::(\d{1,2}))?$/)
  if (!match) return false

  const [, hour, minute = '0', second = '0'] = match
  const h = parseInt(hour)
  const m = parseInt(minute)
  const s = parseInt(second)

  return h >= 0 && h <= 23 && m >= 0 && m <= 59 && s >= 0 && s <= 59
}

export function isValidPhone(phoneStr: string): boolean {
  if (!phoneStr) return true // optional field

  const digits = phoneStr.replace(/\D/g, '')
  return digits.length >= 10 && digits.length <= 11
}

export function isValidEmail(emailStr: string): boolean {
  if (!emailStr) return true // optional field

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(emailStr)
}
// #endregion
