/**
 * Core data types for Linkshelf application
 */

export type ItemType = 'link' | 'text';
export type ThemeMode = 'light' | 'dark';

export interface LinkshelfItem {
  id: string;
  label: string;
  value: string;
  type: ItemType;
  createdAt: number;
  updatedAt: number;
}

export interface Mode {
  id: string;
  name: string;
  items: LinkshelfItem[];
}

export interface AppData {
  currentModeId: string;
  modes: Mode[];
}

export interface FormData {
  label: string;
  value: string;
  type: ItemType;
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
    id: 'job-applications',
    name: 'Job Applications',
    items: [
      {
        id: '1',
        label: 'Portfolio',
        value: 'https://myportfolio.com',
        type: 'link',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: '2',
        label: 'GitHub',
        value: 'https://github.com/username',
        type: 'link',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: '3',
        label: 'LinkedIn',
        value: 'https://linkedin.com/in/username',
        type: 'link',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ],
  },
];
