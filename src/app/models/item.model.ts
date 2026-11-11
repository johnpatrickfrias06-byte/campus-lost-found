export type ItemType = 'lost' | 'found';

export const CATEGORIES = [
  'Electronics',
  'Wallet / Cards',
  'Keys',
  'Bag',
  'Clothing',
  'ID / Documents',
  'Other',
] as const;

export interface Item {
  id: string;
  type: ItemType;
  title: string;
  category: string;
  description: string;
  locationNote: string;
  contact: string;
  /** Photo stored as a base64 data URL (resized by the Camera plugin). */
  photo?: string;
  lat?: number;
  lng?: number;
  /** ISO timestamp. */
  createdAt: string;
  /** true once the item has been returned to its owner. */
  resolved: boolean;
}

/** What the report form supplies; id, createdAt and resolved are added by the service. */
export type NewItem = Omit<Item, 'id' | 'createdAt' | 'resolved'>;
