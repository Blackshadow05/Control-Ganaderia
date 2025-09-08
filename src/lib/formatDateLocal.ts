/**
 * Format dates without timezone issues for display in Costa Rica
 * Ensures dates are shown exactly as stored in the database
 */

/**
 * Format date string to local display format without timezone conversion
 */
export function formatDateLocal(dateString: string): string {
  // Parse the date string (YYYY-MM-DD format)
  const date = new Date(dateString);
  
  // Extract date components without timezone conversion
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // getMonth() returns 0-11
  const day = date.getDate();
  
  // Format as DD/MM/YYYY for display
  const dayStr = String(day).padStart(2, '0');
  const monthStr = String(month).padStart(2, '0');
  
  return `${dayStr}/${monthStr}/${year}`;
}

/**
 * Parse date from database to ensure no timezone offset
 */
export function parseDateLocal(dateString: string): string {
  // Ensure we're working with just the date part
  const dateOnly = dateString.split('T')[0]; // Remove time component if present
  
  // Return as-is, it's already in local format
  return dateOnly;
}

/**
 * Format date for display in Spanish (Costa Rica)
 */
export function formatDateDisplay(dateString: string): string {
  const localDate = parseDateLocal(dateString);
  const [year, month, day] = localDate.split('-');
  
  // Create date object without timezone issues
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  
  // Format in Spanish
  return date.toLocaleDateString('es-CR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/Costa_Rica'
  });
}