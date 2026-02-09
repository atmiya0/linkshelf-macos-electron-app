# Quick Start Guide

Get Linkshelf running in under 5 minutes!

## Installation

```bash
# 1. Navigate to the project
cd linkshelf-menubar-macos

# 2. Install dependencies (already done if you see this)
npm install

# 3. Start the app
npm start
```

## First Launch

1. Look for the 📎 icon in your macOS menu bar (top-right corner)
2. Click the icon to open Linkshelf
3. You'll see two default modes with sample items

## Basic Usage

### Copying Items

1. Click any item to copy it to your clipboard
2. You'll see a "✓ Copied!" confirmation
3. Paste anywhere with `⌘+V`

### Switching Modes

1. Use the dropdown at the top to switch between modes
2. Each mode has its own set of items
3. Try switching between "Job Applications" and "Email Writing"

### Adding New Items

1. Click "+ Add Item" at the bottom
2. Fill in the form:
   - **Label**: A friendly name (e.g., "GitHub Profile")
   - **Type**: Choose "Link" or "Text"
   - **Value**: The URL or text content
3. Click "Add Item" or press `⌘+Enter`

### Editing Items

1. Hover over any item
2. Click the ✏️ edit button
3. Make your changes
4. Click "Save Changes"

### Deleting Items

1. Hover over any item
2. Click the 🗑️ delete button
3. Click again to confirm deletion

## Tips & Tricks

### Keyboard Shortcuts

- `Esc` - Close modal/form
- `⌘+Enter` - Save form (when adding/editing)

### Organizing Your Items

**Job Applications Mode:**
- Portfolio website
- GitHub profile
- LinkedIn profile
- Resume link
- References document

**Email Writing Mode:**
- Email signatures
- Common responses
- Meeting request templates
- Follow-up templates

### Best Practices

1. **Use descriptive labels** - Make it easy to find items at a glance
2. **Keep values updated** - Edit items when information changes
3. **Organize by context** - Use modes to separate different use cases
4. **Start simple** - Add items as you need them, don't over-organize

## Common Questions

**Q: Where is my data stored?**
A: Locally on your Mac at:
`~/Library/Application Support/linkshelf-menubar-macos/config.json`

**Q: Can I add more modes?**
A: Not in the UI yet, but you can edit the config file or modify `src/types/index.ts`

**Q: Does this sync to the cloud?**
A: No, Linkshelf is intentionally offline-only for privacy and speed

**Q: Can I backup my data?**
A: Yes! Copy the config.json file mentioned above to backup all your data

**Q: How do I hide the app?**
A: Click anywhere outside the window, or click the menu bar icon again

**Q: How do I quit the app?**
A: Right-click the menu bar icon and select "Quit" (or press `Ctrl+C` in the terminal during development)

## What's Next?

1. **Clear sample data** - Delete the default items and add your own
2. **Customize modes** - Edit `src/types/index.ts` to change default modes
3. **Add more items** - Build your personal snippet library
4. **Read the docs** - Check out [README.md](../README.md) and [ARCHITECTURE.md](./ARCHITECTURE.md)

## Troubleshooting

**App won't start:**
```bash
# Try reinstalling dependencies
rm -rf node_modules
npm install
npm start
```

**Window not showing:**
- Check if the menu bar icon appears
- Click the icon
- Try restarting the app

**Changes not saving:**
- Check terminal for errors
- Verify write permissions
- Try clearing data: `rm ~/Library/Application\ Support/linkshelf-menubar-macos/config.json`

**Need help?**
- Check [DEVELOPMENT.md](./DEVELOPMENT.md) for debugging tips
- Look for errors in the terminal
- Review the [ARCHITECTURE.md](./ARCHITECTURE.md) to understand how it works

## Development

Want to customize or extend Linkshelf?

1. **Read [ARCHITECTURE.md](./ARCHITECTURE.md)** - Understand the code structure
2. **Read [DEVELOPMENT.md](./DEVELOPMENT.md)** - Learn development workflows
3. **Enable DevTools** - Uncomment in `electron/main.js`
4. **Make changes** - Edit React components in `src/`
5. **Test thoroughly** - Follow the testing checklist

## Building for Distribution

```bash
# Build the app
npm run build

# Create macOS installer
npm run package
```

The output will be in `dist/Linkshelf-1.0.0.dmg`

---

**Happy organizing! 📎**

Need more details? Check out the full [README.md](../README.md)
