# Browser OS Design Principles

## Core Philosophy: "Naked Content"

**Content should not be boxed unless necessary.** Interactive elements (inputs, toggles, lists) should sit directly on the primary background layer. Do not create visual groups using borders or background colors ("cards") unless the content is distinctly separate or requires specific isolation.

## Container Minimization

### ❌ Avoid: Unnecessary Container Nesting
- **Don't** wrap content groups in bordered boxes
- **Don't** add backgrounds to section containers
- **Don't** add shadows to group containers
- **Don't** create "cards" for related content

### ✅ Prefer: Direct Content Placement
- **Do** place content directly on the window background
- **Do** use whitespace (padding/margin) for spacing
- **Do** use typography (headings, font weights) for hierarchy
- **Do** rely on the window's existing glassmorphism styling

## Visual Hierarchy

### Hierarchy Through:
1. **Typography**: Headings, font sizes, weights
2. **Whitespace**: Padding, margins, gaps
3. **Color**: Text colors, subtle borders (only when needed)
4. **Interactive States**: Hover, focus, active states

### Hierarchy NOT Through:
- Background boxes
- Border containers
- Shadow layers
- Nested card components

## Window Styling

The window itself already has perfect glassmorphism styling:
- Translucent background with blur
- Rounded corners
- Subtle borders
- Appropriate shadows

**Do not duplicate or override this at the content level.**

## Component Design

### Settings App Example

**Before (Bad):**
```css
.settings-section-content {
  background: var(--glass-surface);
  border: 1px solid var(--glass-border-subtle);
  box-shadow: var(--shadow-sm);
  padding: 20px;
  border-radius: var(--radius-md);
}
```

**After (Good):**
```css
.settings-section-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 0; /* No container styling */
}
```

### Form Groups

**Before (Bad):**
```css
.mount-form {
  background: #f9f9f9;
  border: 1px solid #ddd;
  padding: 20px;
  border-radius: 4px;
}
```

**After (Good):**
```css
.mount-form {
  padding: 0;
  margin-top: 24px; /* Use margin for spacing */
}
```

## When Containers ARE Acceptable

Containers with backgrounds/borders are acceptable ONLY when:

1. **Modal/Dialog Windows**: Distinct overlays that need separation
2. **Dropdown Menus**: Floating menus that need clear boundaries
3. **Tooltips**: Floating information that needs isolation
4. **Error/Success Messages**: Alerts that need visual prominence
5. **Input Fields**: Form inputs themselves (not their containers)

## Color Usage

- Use CSS variables from `@browser-os/ui` theme system
- Prefer `--text-primary`, `--text-secondary` for text
- Use `--glass-border-subtle` for minimal separators (only when needed)
- Avoid creating new background colors for containers

## Spacing Guidelines

- Use consistent spacing scale (16px, 24px, 32px)
- Prefer margin-top for section separation
- Use gap property for flex/grid layouts
- Avoid padding on container elements (use on content)

## Summary

**The window is the container. The content is naked.**

Let the window's beautiful glassmorphism do the work. Don't fight it with nested containers.

