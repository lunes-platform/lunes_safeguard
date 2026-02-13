/**
 * Utility functions for Toast components
 */

/**
 * Generates a unique ID for toast notifications
 * @returns A unique string ID
 */
export function genId(): string {
  return Math.random().toString(36).substring(2, 9);
}