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
    id: 'job-apps',
    name: 'Job Applications',
    sections: [
      { id: 'ja-1', name: 'Links', order: 0 },
      { id: 'ja-2', name: 'Resume', order: 1 },
    ],
    items: [
      {
        id: '1',
        label: 'Portfolio',
        value: 'https://portfolio.com',
        type: 'link',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        sectionId: 'ja-1',
        order: 0,
      },
      {
        id: '2',
        label: 'LinkedIn',
        value: 'https://linkedin.com/in/user',
        type: 'link',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        sectionId: 'ja-1',
        order: 1,
      },
      {
        id: '3',
        label: 'Standard Resume',
        value: 'https://drive.google.com/resume.pdf',
        type: 'link',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        sectionId: 'ja-2',
        order: 0,
      },
    ],
  },
  {
    id: 'emails',
    name: 'Emails',
    sections: [
      { id: 'em-1', name: 'Signatures', order: 0 },
      { id: 'em-2', name: 'Templates', order: 1 },
    ],
    items: [
      {
        id: '4',
        label: 'Work Signature',
        value: 'Best regards,\nJohn Doe | Software Engineer',
        type: 'text',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        sectionId: 'em-1',
        order: 0,
      },
      {
        id: '5',
        label: 'Meeting Follow-up',
        value: "Hi,\n\nThanks for the great meeting earlier! Let's connect soon.",
        type: 'text',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        sectionId: 'em-2',
        order: 0,
      },
    ],
  },
];
