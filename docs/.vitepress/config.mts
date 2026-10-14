
import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "FiboUI",
  description: "A Flutter/SwiftUI-inspired React UI framework",
  lastUpdated: true,
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Components', link: '/components/structure-box' }
    ],

    sidebar: [
      {
        text: 'Introduction',
        items: [
          { text: 'Getting Started', link: '/guide/getting-started' },
          { text: 'Architecture (Builder Pattern)', link: '/guide/architecture' },
          { text: 'State Management', link: '/guide/state-management' },
          { text: 'Theming System', link: '/guide/theming' },
          { text: 'Motion (CSS animations)', link: '/guide/motion' }
        ]
      },
      {
        text: 'Core Components',
        items: [
          { text: 'Box', link: '/components/structure-box' },
          { text: 'Grid', link: '/components/structure-grid' },
          { text: 'Card', link: '/components/structure-card' },
          { text: 'Specialized Cards', link: '/components/specialized-cards' },
          { text: 'List & Table', link: '/components/structure-data' },
          { text: 'Button', link: '/components/interactive-button' },
          { text: 'TextField', link: '/components/interactive-inputs' },
          { text: 'Checkbox & Switch', link: '/components/interactive-toggles' },
          { text: 'Select & Textarea', link: '/components/interactive-advanced' },
          { text: 'Combobox', link: '/components/interactive-combobox' },
          { text: 'Text', link: '/components/content-text' },
          { text: 'Avatar', link: '/components/content-avatar' },
          { text: 'Badge', link: '/components/content-badge' },
          { text: 'Alert', link: '/components/content-alert' },
          { text: 'Progress & Spinner', link: '/components/content-loading' },
          { text: 'Utility Components', link: '/components/utility-components' },
          { text: 'Misc Components', link: '/components/misc-components' },
          { text: 'Layout Primitives', link: '/components/layout-primitives' },
          { text: 'Advanced Layout', link: '/components/layout-advanced' },
          { text: 'Scaffold', link: '/components/layout-scaffold' }
        ]
      },
      {
        text: 'Component Reference',
        collapsed: true,
        items: [
          { text: 'Structure', link: '/components/structure-all' },
          { text: 'Interactive', link: '/components/interactive-all' },
          { text: 'Content', link: '/components/content-all' },
          { text: 'Layout', link: '/components/layout-all' },
          { text: 'Dashboard Layout', link: '/components/layout-dashboard' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  }
})
