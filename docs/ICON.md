# Menu Bar Icon

This folder should contain the menu bar icon for Linkshelf.

## Required Icon

Create a file named `iconTemplate.png` in this directory with the following specifications:

### Specifications

- **Size**: 22x22 pixels (for standard resolution)
- **Format**: PNG with transparency
- **Color**: Black icon on transparent background
- **Style**: Simple, minimal design (works at small sizes)
- **Naming**: Must end with `Template` for proper macOS dark mode support

### Recommended Sizes

For best results, provide these sizes:
- `iconTemplate.png` - 22x22px (1x)
- `iconTemplate@2x.png` - 44x44px (2x retina)

### Design Guidelines

1. Use a simple, recognizable symbol (paperclip, link, bookmark, etc.)
2. Ensure it's visible at small sizes
3. Black color on transparent background
4. No text in the icon
5. Keep it minimal and clean

### Temporary Fallback

Currently, the app uses an emoji (📎) as a fallback in the menu bar.
This works for development but should be replaced with a proper icon for production.

### Tools for Icon Creation

- **Figma**: Design at large size, export at required dimensions
- **Sketch**: Use built-in icon templates
- **SF Symbols**: macOS system icons (for inspiration)
- **ImageOptim**: Optimize PNG files

### Testing

After adding the icon:
1. Restart the app
2. Check both light and dark mode
3. Verify visibility at menu bar size
4. Test on retina and non-retina displays

## Example Icon Code

The icon is loaded in `electron/main.js`:

```javascript
const iconPath = path.join(__dirname, 'assets', 'iconTemplate.png');
tray = new Tray(iconPath);
```

If the icon file is missing, the app falls back to displaying text (📎) in the menu bar.
