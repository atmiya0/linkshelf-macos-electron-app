/**
 * Core data types for Linkshelf application
 */

export type ItemType = 'link' | 'text';
export type ThemeMode = 'light' | 'dark';

export interface LinkshelfSection {
  id: string;
  name: string;
  order: number;
}

export interface LinkshelfItem {
  id: string;
  label: string;
  value: string;
  type: ItemType;
  createdAt: number;
  updatedAt: number;
  sectionId?: string; // Optional link to a section
  order: number; // Order within the mode or section
}

export interface Mode {
  id: string;
  name: string;
  items: LinkshelfItem[];
  sections?: LinkshelfSection[];
}

export interface AppData {
  currentModeId: string;
  modes: Mode[];
}

export interface FormData {
  label: string;
  value: string;
  type: ItemType;
  sectionId?: string;
}

export interface AppPreferences {
  theme: ThemeMode;
  windowHeight?: number;
  alwaysOnTop?: boolean;
}

/**
 * Default modes that ship with the application.
 * Additional modes can be added through the UI or by extending this structure.
 */
export const DEFAULT_MODES: Mode[] = [
  {
    id: 'linkshelf',
    name: 'Linkshelf',
    items: [
      {
        id: '1',
        label: 'Portfolio',
        value: 'https://portfolio.com',
        type: 'link',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        order: 0,
      },
      {
        id: '2',
        label: 'LinkedIn',
        value: 'https://linkedin.com/in/user',
        type: 'link',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        order: 1,
      },
      {
        id: '3',
        label: 'Intro Message',
        value: 'Hi there, thanks for reaching out. I will get back to you shortly.',
        type: 'text',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        order: 2,
      },
    ],
  },
];
