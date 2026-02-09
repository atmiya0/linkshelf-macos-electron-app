# Development Guide

This guide will help you set up, develop, and extend Linkshelf.

## Quick Start

### Prerequisites

- **Node.js**: v18 or higher
- **npm**: v9 or higher
- **macOS**: Required for menu bar features (Electron works on other platforms but menu bar is macOS-specific)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd linkshelf-menubar-macos

# Install dependencies
npm install

# Start development server
npm start
```

The app should appear in your menu bar with a 📎 icon.

## Development Workflow

### Running the App

```bash
npm start
```

This command:
1. Starts Vite dev server on http://localhost:3000
2. Waits for server to be ready
3. Launches Electron app
4. Enables hot reload for React changes

### Project Structure

```
linkshelf-menubar-macos/
├── electron/           # Main process code
├── src/               # Renderer process (React)
│   ├── components/    # React components
│   ├── hooks/        # Custom React hooks
│   ├── state/        # State management
│   ├── types/        # TypeScript types
│   └── styles/       # CSS files
├── public/           # Static assets
└── dist/             # Build output (generated)
```

### Making Changes

#### Modifying the UI

1. Edit files in `src/components/`
2. Changes hot-reload automatically
3. Test in the app window

#### Modifying Main Process

1. Edit `electron/main.js`
2. Restart the app (Ctrl+C and `npm start`)
3. Main process changes require full restart

#### Adding New Features

Follow this checklist:

- [ ] Define types in `src/types/index.ts`
- [ ] Add state functions in `src/state/store.ts`
- [ ] Update `useStore` hook if needed
- [ ] Create or modify components
- [ ] Add styles to `src/styles/App.css`
- [ ] Test the feature thoroughly
- [ ] Update README with new functionality

## Common Development Tasks

### Adding a New Component

```typescript
// src/components/MyComponent.tsx
import React from 'react';

interface MyComponentProps {
  // Define props
}

export const MyComponent: React.FC<MyComponentProps> = ({ }) => {
  return (
    <div className="my-component">
      {/* Component content */}
    </div>
  );
};
```

### Adding a New IPC Handler

```javascript
// electron/main.js
ipcMain.handle('my:action', (event, arg) => {
  // Handle action
  return result;
});
```

```typescript
// src/state/store.ts
const result = await ipcRenderer.invoke('my:action', argument);
```

### Adding a New Mode

Edit `src/types/index.ts`:

```typescript
export const DEFAULT_MODES: Mode[] = [
  // Existing modes...
  {
    id: 'new-mode',
    name: 'New Mode',
    items: [],
  },
];
```

### Modifying Data Structure

1. Update types in `src/types/index.ts`
2. Update store functions in `src/state/store.ts`
3. Clear existing data: `rm ~/Library/Application\ Support/linkshelf-menubar-macos/config.json`
4. Restart app to generate new data

## Debugging

### Enable Developer Tools

Uncomment in `electron/main.js`:

```javascript
window.webContents.openDevTools({ mode: 'detach' });
```

### View Stored Data

```bash
# Pretty print stored JSON
cat ~/Library/Application\ Support/linkshelf-menubar-macos/config.json | jq

# Or use default cat
cat ~/Library/Application\ Support/linkshelf-menubar-macos/config.json
```

### Clear All Data

```bash
rm ~/Library/Application\ Support/linkshelf-menubar-macos/config.json
```

### Console Logging

**Main process logs:**
Appear in the terminal where you ran `npm start`

```javascript
console.log('Main process:', data);
```

**Renderer process logs:**
Appear in DevTools console

```typescript
console.log('Renderer process:', data);
```

## Building and Distribution

### Build for Production

```bash
# Build React app
npm run build

# Package as macOS app
npm run package
```

Output: `dist/Linkshelf-1.0.0.dmg`

### Distribution Checklist

Before distributing:

- [ ] Replace emoji icon with proper PNG icon
- [ ] Enable code signing
- [ ] Test on clean macOS installation
- [ ] Verify data persistence works
- [ ] Test all CRUD operations
- [ ] Check window positioning on different screen sizes
- [ ] Test in both light and dark mode
- [ ] Update version in `package.json`

### Code Signing (macOS)

For distribution outside App Store:

1. Get a Developer ID certificate from Apple
2. Configure electron-builder:

```json
// package.json
"build": {
  "mac": {
    "identity": "Developer ID Application: Your Name (TEAMID)"
  }
}
```

3. Run: `npm run package`

### Notarization (macOS)

Required for distribution:

1. Notarize with Apple
2. Add to electron-builder config:

```json
"afterSign": "scripts/notarize.js"
```

## Testing

### Manual Testing Checklist

Test these scenarios:

**Basic Operations:**
- [ ] Open app from menu bar
- [ ] Switch between modes
- [ ] Copy item to clipboard
- [ ] Add new item (link)
- [ ] Add new item (text)
- [ ] Edit existing item
- [ ] Delete item (with confirmation)

**Edge Cases:**
- [ ] Add item with empty label (should fail)
- [ ] Add item with empty value (should fail)
- [ ] Very long labels/values
- [ ] Special characters in text
- [ ] URLs without http://

**UI/UX:**
- [ ] Window closes on blur
- [ ] Window positions correctly
- [ ] Hover states work
- [ ] Copy confirmation appears
- [ ] Modal keyboard shortcuts work
- [ ] Form validation shows errors

**Data Persistence:**
- [ ] Quit and reopen app
- [ ] Verify data persists
- [ ] Check mode selection persists
- [ ] Verify timestamps update

### Automated Testing (Future)

Set up Jest and React Testing Library:

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
```

Example test:

```typescript
// src/components/__tests__/ItemRow.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ItemRow } from '../ItemRow';

test('copies value when clicked', () => {
  const mockCopy = jest.fn();
  const item = {
    id: '1',
    label: 'Test',
    value: 'test value',
    type: 'text',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  
  render(<ItemRow item={item} onCopy={mockCopy} onEdit={() => {}} onDelete={() => {}} />);
  
  fireEvent.click(screen.getByText('Test'));
  expect(mockCopy).toHaveBeenCalledWith('test value');
});
```

## Performance Optimization

### React Performance

**Use React.memo for expensive components:**

```typescript
export const ItemRow = React.memo<ItemRowProps>(({ item, onCopy }) => {
  // Component code
});
```

**Use useCallback for event handlers:**

```typescript
const handleCopy = useCallback(() => {
  onCopy(item.value);
}, [item.value, onCopy]);
```

### Electron Performance

**Lazy load windows:**
Only create window when needed

**Minimize IPC calls:**
Batch multiple operations when possible

**Optimize bundle size:**
Check bundle size: `npm run build`

## Common Issues and Solutions

### Issue: Hot Reload Not Working

**Solution:**
1. Stop the dev server
2. Delete `node_modules/.vite`
3. Run `npm start` again

### Issue: Window Not Appearing

**Solution:**
1. Check console for errors
2. Verify tray icon is created
3. Try clicking tray icon multiple times
4. Check screen bounds calculation

### Issue: Data Not Persisting

**Solution:**
1. Check IPC handlers are registered
2. Verify electron-store has write permissions
3. Check for errors in console
4. Try clearing existing data

### Issue: TypeScript Errors

**Solution:**
1. Run `npm install` to update types
2. Check `tsconfig.json` is correct
3. Restart TypeScript server in IDE
4. Clear TypeScript cache

### Issue: Build Fails

**Solution:**
1. Delete `dist` and `node_modules`
2. Run `npm install` again
3. Run `npm run build`
4. Check for TypeScript errors

## Code Style Guidelines

### TypeScript

- Use `interface` for props and public APIs
- Use `type` for unions and complex types
- Always specify return types for functions
- Avoid `any`, use `unknown` if needed

### React

- Use functional components
- Use hooks for state and effects
- Keep components small and focused
- Extract complex logic to custom hooks

### Naming Conventions

- Components: `PascalCase` (e.g., `ItemRow`)
- Files: Match component name (e.g., `ItemRow.tsx`)
- Functions: `camelCase` (e.g., `handleClick`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `DEFAULT_MODES`)
- CSS classes: `kebab-case` (e.g., `item-row`)

### Comments

Add comments for:
- Complex logic
- Future enhancement opportunities
- Non-obvious behavior
- External API usage

Example:

```typescript
/**
 * Calculates the position of the window below the tray icon.
 * Takes into account the tray bounds and window dimensions.
 */
function calculateWindowPosition() {
  // Implementation
}
```

## Git Workflow

### Commit Messages

Follow conventional commits:

```
feat: add search functionality
fix: correct window positioning on external monitors
docs: update README with keyboard shortcuts
refactor: extract clipboard logic to separate file
style: improve button hover states
test: add tests for ItemRow component
```

### Branch Strategy

```
main         - Stable releases
develop      - Development branch
feature/*    - New features
bugfix/*     - Bug fixes
release/*    - Release preparation
```

## Environment Variables

Currently not used, but you can add them:

```bash
# .env
VITE_APP_NAME=Linkshelf
VITE_DEBUG=true
```

Access in code:

```typescript
const appName = import.meta.env.VITE_APP_NAME;
```

## Resources

### Documentation

- [Electron Docs](https://www.electronjs.org/docs)
- [React Docs](https://react.dev)
- [Vite Docs](https://vitejs.dev)
- [electron-store](https://github.com/sindresorhus/electron-store)

### Tools

- [Electron Fiddle](https://www.electronjs.org/fiddle) - Electron playground
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [ImageOptim](https://imageoptim.com/) - Icon optimization

### Community

- [Electron Discord](https://discord.com/invite/electronjs)
- [React Community](https://react.dev/community)

## Next Steps

After getting familiar with the codebase:

1. **Read [ARCHITECTURE.md](./ARCHITECTURE.md)** to understand the design
2. **Try implementing a small feature** (e.g., search)
3. **Improve the icon** with a proper design
4. **Add keyboard shortcuts** for power users
5. **Implement tests** for critical paths
6. **Share with others** and gather feedback

## Getting Help

If you're stuck:

1. Check console for errors
2. Read relevant documentation
3. Review similar Electron apps
4. Search GitHub issues
5. Ask in Electron Discord

## Contributing

When adding features:

1. Create a feature branch
2. Make changes with clear commits
3. Test thoroughly
4. Update documentation
5. Submit pull request with description

Happy coding! 🚀
