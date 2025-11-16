# Development Notes

This document tracks common bugs, gotchas, and development patterns encountered during development.

## Table of Contents

- [pnpm Workspace Package Recognition](#pnpm-workspace-package-recognition)
- [TypeScript Module Resolution](#typescript-module-resolution)

---

## pnpm Workspace Package Recognition

### Issue

When adding a new package to the monorepo (especially in `system-apps/` or `packages/`), TypeScript may fail to resolve the module even after:
- Creating the package structure
- Adding it to `package.json` dependencies
- Running `pnpm install`

**Error Example:**
```
error TS2307: Cannot find module '@browser-os/terminal' or its corresponding type declarations.
```

**Build Warning:**
```
WARNING  Unable to calculate transitive closures: Workspace 'system-apps/terminal' not found
WARNING  Unable to calculate transitive closures: Workspace 'system-apps/terminal' not found in lockfile.
```

### Root Cause

pnpm needs to update its lockfile to recognize the new workspace package. A regular `pnpm install` may not always pick up newly created packages, especially if they were created after the last install.

### Solution

Run `pnpm install --force` to force pnpm to recalculate workspace dependencies and update the lockfile:

```bash
pnpm install --force
```

Then rebuild:

```bash
pnpm build
```

### Prevention

When adding a new package:
1. Create the package structure
2. Add it to dependencies in consuming packages
3. Run `pnpm install --force` immediately
4. Verify the build works

### Related Files

- `pnpm-workspace.yaml` - Defines workspace packages
- `pnpm-lock.yaml` - Lockfile that needs updating
- Package `package.json` files - Dependencies using `workspace:*`

---

## TypeScript Module Resolution

### Issue

TypeScript may fail to resolve workspace packages even when they're properly installed.

### Common Causes

1. **Lockfile not updated** - See [pnpm Workspace Package Recognition](#pnpm-workspace-package-recognition)
2. **Missing package.json entry** - Package not listed in consuming package's dependencies
3. **Incorrect package name** - Mismatch between package name and import path

### Solution Checklist

- [ ] Package exists in `pnpm-workspace.yaml` scope (usually automatic for `packages/*` and `system-apps/*`)
- [ ] Package has correct `name` field in its `package.json` (e.g., `@browser-os/terminal`)
- [ ] Consuming package lists dependency with `workspace:*` protocol
- [ ] Lockfile is up to date (`pnpm install --force`)
- [ ] Package builds successfully (`pnpm --filter @browser-os/terminal build`)

### Example: Adding a System App

```bash
# 1. Create package structure
mkdir -p system-apps/my-app/src
# ... create files ...

# 2. Add to consuming package (e.g., packages/os/package.json)
{
  "dependencies": {
    "@browser-os/my-app": "workspace:*"
  }
}

# 3. Force install to update lockfile
pnpm install --force

# 4. Verify build
pnpm build
```

---

## Adding New System Apps

### Pattern

When creating a new system app (like terminal, browser, etc.):

1. **Package Structure:**
   ```
   system-apps/my-app/
   ├── package.json          # Name: @browser-os/my-app
   ├── tsconfig.json         # Extends root config
   ├── vite.config.ts        # Build config
   └── src/
       ├── index.ts          # Export component
       ├── MyApp.tsx         # Component
       └── MyApp.css         # Styles
   ```

2. **Registration in OS:**
   - Import component: `import { MyApp } from '@browser-os/my-app';`
   - Register component: `appComponentRegistry.registerAppComponent('my-app', MyApp);`
   - Add registry entry with `showInTaskbar: true` for taskbar/search visibility

3. **Dependencies:**
   - Add to `packages/os/package.json`: `"@browser-os/my-app": "workspace:*"`
   - Run `pnpm install --force`

4. **Component Props:**
   - Must accept `AppComponentProps` interface: `{ windowId: string }`

---

## Build Warnings

### Turbo Output Warnings

**Warning:**
```
WARNING  no output files found for task @browser-os/kernel#build
```

This is a configuration warning, not an error. Some packages (like kernel) may not produce output files but still need to run build scripts for type checking.

**Fix:** Add `outputs` to `turbo.json` if needed, or ignore if intentional.

---

## Notes

- Always run `pnpm install --force` after adding new workspace packages
- Check `pnpm-workspace.yaml` includes the directory pattern (usually already configured)
- Verify package names match between `package.json` and imports
- System apps should follow the same structure as `browser` app for consistency

