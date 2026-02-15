/**
 * Color utility functions for consistent opacity handling
 */

/**
 * Converts a hex color to rgba with specified opacity
 * @param hex - The hex color code (e.g., '#8B5CF6')
 * @param opacity - Opacity value between 0 and 1
 * @returns rgba color string
 */
export const withOpacity = (hex: string, opacity: number): string => {
  // Handle shorthand hex (e.g., #FFF)
  let normalizedHex = hex;
  if (hex.length === 4) {
    normalizedHex = `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`;
  }

  const r = parseInt(normalizedHex.slice(1, 3), 16);
  const g = parseInt(normalizedHex.slice(3, 5), 16);
  const b = parseInt(normalizedHex.slice(5, 7), 16);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

/**
 * Lightens a hex color by a given amount
 * @param hex - The hex color code
 * @param amount - Amount to lighten (0-100)
 * @returns Lightened hex color
 */
export const lighten = (hex: string, amount: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  const newR = Math.min(255, Math.round(r + (255 - r) * (amount / 100)));
  const newG = Math.min(255, Math.round(g + (255 - g) * (amount / 100)));
  const newB = Math.min(255, Math.round(b + (255 - b) * (amount / 100)));

  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
};

/**
 * Darkens a hex color by a given amount
 * @param hex - The hex color code
 * @param amount - Amount to darken (0-100)
 * @returns Darkened hex color
 */
export const darken = (hex: string, amount: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  const newR = Math.max(0, Math.round(r * (1 - amount / 100)));
  const newG = Math.max(0, Math.round(g * (1 - amount / 100)));
  const newB = Math.max(0, Math.round(b * (1 - amount / 100)));

  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
};
