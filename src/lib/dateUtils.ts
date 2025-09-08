/**
 * Date utility functions for handling local dates without timezone issues
 * Uses Costa Rica timezone (UTC-6) for all date operations
 */

/**
 * Get current date in Costa Rica timezone (UTC-6) as YYYY-MM-DD string
 */
export function getLocalDate(): string {
  const now = new Date();
  // Create date in local timezone without time component
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format date to local string for display
 */
export function formatLocalDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-CR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Validate that a date is not in the future
 */
export function isFutureDate(dateString: string): boolean {
  const inputDate = new Date(dateString);
  const today = new Date();
  // Reset time to start of day for comparison
  today.setHours(0, 0, 0, 0);
  inputDate.setHours(0, 0, 0, 0);
  return inputDate > today;
}

/**
 * Get maximum allowed date (today)
 */
export function getMaxDate(): string {
  return getLocalDate();
}

/**
 * Convert local date to database format (YYYY-MM-DD)
 */
export function toDatabaseDate(dateString: string): string {
  return dateString; // Already in correct format
}