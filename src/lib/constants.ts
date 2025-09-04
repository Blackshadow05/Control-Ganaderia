// Application constants
export const APP_NAME = 'Ganaderia Control';
export const APP_DESCRIPTION = 'Sistema de control de entrada y salida de ganado';

// Cattle statuses
export const CATTLE_STATUSES = {
  ACTIVE: 'active',
  SOLD: 'sold',
  DECEASED: 'deceased',
} as const;

// Application types
export const APPLICATION_TYPES = {
  INJECTION: 'injection',
  VITAMIN: 'vitamin',
} as const;

// Navigation items
export const NAV_ITEMS = [
  { name: 'Dashboard', href: '/' },
  { name: 'Ganado', href: '/cattle' },
  { name: 'Productos', href: '/applications' },
  { name: 'Lotes', href: '/lots' },
] as const;