/**
 * Date utilities specifically for application dates to avoid timezone issues
 * Ensures dates are displayed exactly as stored in the database
 */

/**
 * Format application date from database to display format without timezone conversion
 * This ensures the date shown is exactly what's stored in the database
 */
export function formatApplicationDate(dateString: string): string {
  // Parse the date string (assumes YYYY-MM-DD format from database)
  const parts = dateString.split('-');
  if (parts.length !== 3) {
    return dateString; // Return as-is if not in expected format
  }
  
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  
  // Format as DD/MM/YYYY for display
  const dayStr = String(day).padStart(2, '0');
  const monthStr = String(month).padStart(2, '0');
  
  return `${dayStr}/${monthStr}/${year}`;
}

/**
 * Parse date from input field to ensure no timezone offset
 */
export function parseInputDate(dateString: string): string {
  // Just return the date as-is, it's already in YYYY-MM-DD format
  return dateString;
}

/**
 * Get current date in YYYY-MM-DD format for database storage
 */
export function getCurrentDateForDatabase(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Validate that a date is not in the future (local time)
 */
export function isFutureDateLocal(dateString: string): boolean {
  const inputDate = new Date(dateString + 'T12:00:00'); // Add midday to avoid edge cases
  const today = new Date();
  today.setHours(12, 0, 0, 0); // Reset to midday for comparison
  return inputDate > today;
}

/**
 * Format date for database storage (ensures YYYY-MM-DD format)
 */
export function formatForDatabase(year: number, month: number, day: number): string {
  const monthStr = String(month).padStart(2, '0');
  const dayStr = String(day).padStart(2, '0');
  return `${year}-${monthStr}-${dayStr}`;
}
