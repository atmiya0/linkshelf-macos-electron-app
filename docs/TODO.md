# TODO - Future Enhancements

This file tracks planned features and improvements for Linkshelf.

## High Priority

### Core Features

- [ ] **Search functionality**
  - Add search input to filter items
  - Search by label and value
  - Keyboard shortcut to focus search (⌘+F)
  - Highlight matching text

- [ ] **Keyboard shortcuts**
  - ⌘+N for new item
  - Number keys 1-9 for quick copy
  - Arrow keys for navigation
  - Delete key for item removal
  - ⌘+E to edit selected item

- [ ] **Mode management**
  - Add new mode from UI
  - Delete existing modes
  - Rename modes
  - Duplicate mode with items
  - Reorder modes

### UI/UX Improvements

- [ ] **Better icon**
  - Design proper menu bar icon
  - Create Template icon for dark mode support
  - Add @2x retina version

- [ ] **Improved visual feedback**
  - Toast notifications for actions
  - Undo/redo support
  - Drag and drop to reorder items
  - Animations for add/delete

- [ ] **Dark mode support**
  - Detect system theme
  - Create dark theme styles
  - Toggle theme manually

## Medium Priority

### Data Management

- [ ] **Export/Import**
  - Export mode as JSON
  - Import items from JSON
  - Export all data
  - Import/merge data
  - CSV import/export

- [ ] **Backup and restore**
  - Automatic backups
  - Restore from backup
  - Backup reminders
  - Cloud backup option (optional)

- [ ] **Data validation**
  - Validate URLs
  - Check for duplicates
  - Warn on long values
  - Suggest formatting

### Features

- [ ] **Smart features**
  - Recent items list
  - Most used items
  - Auto-detect URL vs text
  - Suggest categories
  - Smart templates

- [ ] **Organization**
  - Tags within modes
  - Color coding items
  - Nested categories
  - Favorites/pinned items
  - Archive old items

- [ ] **Templates**
  - Save item as template
  - Variable substitution
  - Template library
  - Share templates

## Low Priority

### Advanced Features

- [ ] **Statistics**
  - Usage analytics (local only)
  - Most copied items
  - Time-based insights
  - Export statistics

- [ ] **Sync (Optional)**
  - iCloud sync
  - Local network sync
  - End-to-end encryption
  - Conflict resolution

- [ ] **Extensions**
  - Plugin system
  - Custom actions
  - API for third-party tools
  - Webhook support

### Platform Support

- [ ] **Cross-platform**
  - Windows support
  - Linux support
  - Adapt menu bar for each platform

- [ ] **Mobile companion**
  - iOS app (view only)
  - Sync with desktop
  - Quick access

### Developer Experience

- [ ] **Testing**
  - Unit tests for components
  - Integration tests
  - E2E tests with Playwright
  - Test coverage reports

- [ ] **CI/CD**
  - GitHub Actions workflow
  - Automatic releases
  - Version bumping
  - Change log generation

- [ ] **Documentation**
  - Video tutorials
  - Interactive demo
  - API documentation
  - Contributing guide

## Technical Debt

### Security

- [ ] **Improve security**
  - Enable context isolation
  - Add preload script
  - Disable node integration
  - Add CSP headers

- [ ] **Code signing**
  - Set up Apple Developer account
  - Configure code signing
  - Notarize app
  - Auto-update support

### Performance

- [ ] **Optimize rendering**
  - React.memo for components
  - Virtual scrolling for long lists
  - Lazy loading
  - Code splitting

- [ ] **Reduce bundle size**
  - Tree shaking
  - Remove unused dependencies
  - Optimize images
  - Minimize CSS

### Code Quality

- [ ] **Refactoring**
  - Extract common utilities
  - Improve error handling
  - Add logging
  - Better TypeScript types

- [ ] **Accessibility**
  - ARIA labels
  - Keyboard navigation
  - Screen reader support
  - High contrast mode

## Ideas (Not Committed)

- Browser extension companion
- Quick paste with popup
- AI-powered suggestions
- Team sharing (local network)
- Version history for items
- Markdown support in text items
- Rich text editor
- Custom keyboard shortcuts
- Multiple windows
- System-wide quick access
- Command palette (⌘+K)
- Snippets with placeholders
- Regular expressions support
- Scripting support
- Custom themes
- Item attachments
- OCR for images
- Voice input

## Completed

- [x] Initial project setup
- [x] Electron + React integration
- [x] Menu bar integration
- [x] Basic CRUD operations
- [x] Mode switching
- [x] Clipboard copy
- [x] Local storage with electron-store
- [x] Add/edit modal form
- [x] Delete confirmation
- [x] Default modes and sample data
- [x] Clean UI with hover states
- [x] Form validation
- [x] TypeScript types
- [x] Project documentation
- [x] Development guide
- [x] Architecture documentation

## Notes

### Priority Definitions

- **High Priority**: Essential features that significantly improve usability
- **Medium Priority**: Nice-to-have features that enhance the experience
- **Low Priority**: Advanced features for power users or edge cases

### Contribution Guidelines

When implementing features from this list:

1. Move the item to "In Progress" section (create if needed)
2. Create a feature branch
3. Implement with tests
4. Update documentation
5. Submit PR with reference to this TODO
6. Move to "Completed" when merged

### Review Schedule

This TODO should be reviewed and prioritized:
- Monthly: Adjust priorities based on feedback
- Quarterly: Add new ideas and remove obsolete items
- Yearly: Major roadmap planning

---

Last updated: 2026-02-09
