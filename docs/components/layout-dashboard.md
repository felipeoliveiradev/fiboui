
# DashboardLayout

A high-level scaffold for building responsive dashboard applications.
It implements the **Classic Sidebar Layout** pattern with a modern responsive implementation.

## Features
- **Responsive Grid:** `grid-cols-[260px_1fr]` on Desktop.
- **Mobile Drawer:** Automatically moves Sidebar to a hidden drawer on mobile.
- **Hamburger Toggle:** Built-in mobile menu toggle.

## Usage

```tsx
DashboardLayout()
    .sidebar(
        Sidebar().children([...]).build()
    )
    .header(
        Header().children([...]).build()
    )
    .children([
        // Main Content Area
        Box().p(8).children("Content").build()
    ])
    .build()
```
