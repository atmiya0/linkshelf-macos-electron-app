import { LinkshelfItem } from '../types';

/** Number of items reachable with the global ⌃⌥1 … ⌃⌥9 shortcuts. */
export const QUICK_COPY_SLOTS = 9;

/**
 * The order items appear on screen: links first, then text, each by their saved order.
 * Shortcut numbers follow this order, so the list and the shortcuts always agree.
 */
export function getDisplayOrder(items: LinkshelfItem[]): LinkshelfItem[] {
  const sorted = [...items].sort((a, b) => a.order - b.order);
  return [
    ...sorted.filter((item) => item.type === 'link'),
    ...sorted.filter((item) => item.type === 'text'),
  ];
}
