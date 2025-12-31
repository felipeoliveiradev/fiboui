
# Theming System

FiboUI features a powerful, variable-based theming engine. It supports multiple design languages (Web, iOS/Cupertino, Material) via CSS variables.

## Theme Provider

The `FiboThemeProvider` injects the selected theme's CSS variables into the root of your application.

```tsx
<FiboThemeProvider theme="cupertino">
    <App />
</FiboThemeProvider>
```

## Available Themes

### Web (Default)
A clean, flat design suitable for modern SaaS dashboards.
- font-family: Inter
- radius: 0.5rem

### Cupertino (iOS-like)
Mimics the Apple Human Interface Guidelines.
- font-family: -apple-system
- radius: 12px
- transparency: high

### Material
Mimics Google's Material Design.
- font-family: Roboto
- radius: 4px
- shadows: prominent
