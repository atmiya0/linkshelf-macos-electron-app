# Linkshelf - macOS Menu Bar App

A minimal, fast, and keyboard-friendly macOS menu bar application for storing and copying links and text snippets. Built with Electron and React.

## Features

- **Menu Bar Integration**: Lives entirely in the macOS status bar
- **Modes**: Organize items into different contexts (Job Applications, Email Writing, etc.)
- **Quick Copy**: Click any item to instantly copy to clipboard
- **CRUD Operations**: Add, edit, and delete items with ease
- **Offline First**: All data stored locally on your machine
- **No Cloud**: No authentication, no external APIs, fully private

## Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

## Building for Production

To create a distributable macOS app:

```bash
npm run package
```

This will create a `.dmg` file in the `dist` folder.

## Project Structure

```
linkshelf-menubar-macos/
├── electron/
│   └── main.js              # Electron main process
├── src/
│   ├── components/          # React components
│   │   ├── MenuBarWindow.tsx   # Main window container
│   │   ├── ModeSelector.tsx    # Mode dropdown
│   │   ├── ItemList.tsx        # List of items
│   │   ├── ItemRow.tsx         # Individual item
│   │   └── ItemForm.tsx        # Add/edit form
│   ├── hooks/
│   │   └── useStore.ts      # State management hook
│   ├── state/
│   │   └── store.ts         # Data persistence layer
│   ├── types/
│   │   └── index.ts         # TypeScript types
│   ├── styles/
│   │   └── App.css          # Application styles
│   ├── App.tsx              # Root component
│   └── index.tsx            # React entry point
├── public/
│   └── index.html           # HTML template
└── package.json
```

## Usage

### Basic Usage

1. Click the 📎 icon in your menu bar to open Linkshelf
2. Select a mode from the dropdown (e.g., "Job Applications")
3. Click any item to copy it to your clipboard
4. Click "+ Add Item" to create a new item

### Adding Items

1. Click "+ Add Item"
2. Enter a label (e.g., "Portfolio")
3. Select type (Link or Text)
4. Enter the URL or text content
5. Press "Add Item" or use `⌘ Enter`

### Editing Items

1. Hover over an item
2. Click the ✏️ edit button
3. Make your changes
4. Press "Save Changes"

### Deleting Items

1. Hover over an item
2. Click the 🗑️ delete button
3. Click again to confirm

### Keyboard Shortcuts

- `Esc`: Close modal/form
- `⌘ Enter`: Save form (when adding/editing)

## Data Storage

All data is stored locally using `electron-store`, which saves to:
```
~/Library/Application Support/linkshelf-menubar-macos/config.json
```

The data structure is simple JSON:
```json
{
  "currentModeId": "job-applications",
  "modes": [
    {
      "id": "job-applications",
      "name": "Job Applications",
      "items": [
        {
          "id": "1",
          "label": "Portfolio",
          "value": "https://myportfolio.com",
          "type": "link",
          "createdAt": 1234567890,
          "updatedAt": 1234567890
        }
      ]
    }
  ]
}
```

## Future Enhancements

The codebase includes comments marking locations where future features can be added:

### Planned Features (Not Yet Implemented)

- **Search**: Filter items by label or value
- **Keyboard Shortcuts**: 
  - `Cmd+N` for new item
  - Number keys for quick copy
  - Arrow keys for navigation
- **AI-Assisted Modes**: Smart suggestions and auto-categorization
- **Export/Import**: Share modes via JSON files
- **Statistics**: Track most-used items
- **Mode Management**: Add/delete/rename modes

### Explicitly Excluded Features

The following features are intentionally not included:
- Cloud sync
- Authentication
- Analytics/tracking
- Sharing via cloud
- External APIs
- Tags or categories beyond modes

## Technology Stack

- **Electron**: macOS menu bar integration
- **React**: UI components
- **TypeScript**: Type safety
- **Vite**: Fast development and building
- **electron-store**: Local data persistence

## Development

### Prerequisites

- Node.js 18+
- npm or yarn
- macOS (for menu bar features)

### Development Scripts

- `npm start`: Start development server
- `npm run build`: Build for production
- `npm run package`: Create distributable app

### Adding New Modes

To add more default modes, edit `src/types/index.ts` and add to the `DEFAULT_MODES` array:

```typescript
{
  id: 'my-new-mode',
  name: 'My New Mode',
  items: [],
}
```

## License

MIT

## Contributing

This is a personal project, but suggestions and improvements are welcome!

## Known Issues

- Menu bar icon currently uses emoji (📎). For production, replace with a proper icon file.
- DevTools are commented out in development. Uncomment in `electron/main.js` if needed.

## Documentation

Comprehensive documentation is available in the [`docs/`](./docs/) folder:

- **[Quick Start Guide](./docs/QUICKSTART.md)** - Get started in 5 minutes
- **[Architecture](./docs/ARCHITECTURE.md)** - System design and technical details
- **[Development Guide](./docs/DEVELOPMENT.md)** - Developer workflows and debugging
- **[Changelog](./docs/CHANGELOG.md)** - Version history and release notes
- **[Project Summary](./docs/PROJECT_SUMMARY.md)** - Complete project overview
- **[TODO](./docs/TODO.md)** - Future enhancements and roadmap
- **[File Tree](./docs/FILE_TREE.txt)** - Project structure reference
- **[Icon Guide](./docs/ICON.md)** - Menu bar icon specifications

## Support

For issues or questions, please open an issue on GitHub.
