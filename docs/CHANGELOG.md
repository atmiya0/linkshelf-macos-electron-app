# Changelog

All notable changes to Linkshelf will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-02-09

### Added

- Initial release of Linkshelf
- macOS menu bar integration
- Two default modes: Job Applications and Email Writing
- CRUD operations for items (Create, Read, Update, Delete)
- Support for both link and text item types
- Instant clipboard copy functionality
- Local data persistence using electron-store
- Frameless window that appears below menu bar icon
- Modal form for adding and editing items
- Delete confirmation to prevent accidental removal
- Visual feedback when copying items
- Hover states showing edit and delete actions
- Keyboard shortcuts in modal (Esc to cancel, ⌘+Enter to save)
- Clean, minimal UI with smooth animations
- Empty state messaging when no items exist
- Support for multi-line text snippets
- Automatic timestamps for created and updated items

### Technical

- Electron + React architecture
- TypeScript for type safety
- Vite for fast development and building
- Clean project structure with separation of concerns
- IPC communication between main and renderer processes
- Custom React hook for state management
- Comprehensive documentation (README, ARCHITECTURE, DEVELOPMENT)

### Security

- Fully offline operation
- Local-only data storage
- No external APIs or cloud services
- No authentication required
- No analytics or tracking

## [Unreleased]

### Planned Features (Future Versions)

- Search functionality across items
- Global keyboard shortcuts
- Ability to add/delete/rename modes
- Export/import modes as JSON files
- Keyboard navigation (arrow keys, number keys)
- Usage statistics and analytics (local only)
- Theme customization
- Drag and drop to reorder items
- Bulk operations (delete multiple, move to another mode)
- Template system for common snippets
- Variable substitution in text snippets

### Under Consideration

- Windows and Linux support
- Icons for different item types
- Color coding or tags within modes
- Recent items history
- Favorite items
- Smart folders (filtered views)
- Import from browser bookmarks
- Import from password managers
