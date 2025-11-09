# Detailed Refactoring Implementation Guide

## 1. Dependency Injection Container

### Current Problem
```typescript
// apps/web-shell/src/init.ts
const terminalApp = new TerminalApp(
  state.os.getProcessManager(),
  state.os.getEventBus(),
  state.os.getVFS()
);
```

Manual dependency passing is brittle and doesn't scale.

### Solution: Type-Safe DI Container with Schema

**Location**: `packages/core/src/container.ts`

```typescript
// Define dependency schema
export interface Dependencies {
  processManager: ProcessManager;
  eventBus: EventBus;
  vfs: VfsImpl;
  windowManager: WindowManager;
  workspaceManager: WorkspaceManager;
  settingsStore: SettingsStoreImpl;
  appHost: AppHost;
  cursorManager: CursorManager;
  networkManager: NetworkManager;
  notificationManager: NotificationManager;
  telemetryManager: TelemetryManager;
}

export class Container {
  private services = new Map<keyof Dependencies, Dependencies[keyof Dependencies]>();
  private factories = new Map<keyof Dependencies, () => Dependencies[keyof Dependencies]>();
  
  register<K extends keyof Dependencies>(key: K, instance: Dependencies[K]): void;
  registerFactory<K extends keyof Dependencies>(key: K, factory: () => Dependencies[K]): void;
  resolve<K extends keyof Dependencies>(key: K): Dependencies[K];
  has<K extends keyof Dependencies>(key: K): boolean;
}

// Usage in OS.ts
const container = new Container();
container.register('processManager', processManager);
container.register('eventBus', eventBus);
container.register('vfs', vfs);

// Type-safe - compiler enforces correct keys and types
class TerminalApp extends App {
  constructor(container: Container) {
    super(
      container.resolve('processManager'),  // TypeScript knows this is ProcessManager
      container.resolve('eventBus'),          // TypeScript knows this is EventBus
      container.resolve('vfs')               // TypeScript knows this is VfsImpl
    );
  }
}
```

### Benefits
- Automatic dependency resolution
- Easier testing (swap implementations)
- Cleaner initialization
- Better scalability

## 2. App Factory Pattern

### Current Problem
App instantiation is scattered and inconsistent.

### Solution: Centralized App Factory

**Location**: `packages/app-sdk/src/AppFactory.ts`

```typescript
export class AppFactory {
  constructor(
    private container: Container,
    private appManager: AppManager
  ) {}
  
  createApp<T extends App>(
    AppClass: new (container: Container) => T
  ): T {
    const app = new AppClass(this.container);
    this.appManager.registerApp(app);
    return app;
  }
  
  createAppFromManifest(manifest: AppManifest): Promise<App>;
  createAppsFromManifests(manifests: AppManifest[]): Promise<App[]>;
}
```

### Usage
```typescript
const factory = new AppFactory(container, appManager);
factory.createApp(TerminalApp);
factory.createApp(CalculatorApp);
```

## 3. Consolidate App Registration

### Remove AppRegistry
- Already deprecated
- Functionality merged into AppManager
- Update all imports

### Consolidate app-manifest.ts
- Move helpers into AppManager
- Single source of truth
- Cleaner API

## 4. Refactor Shell Initialization

### Current Structure
```typescript
// init.ts - does everything
export function initWebShell() {
  const state = initDesktopShell({...});
  // Manual app instantiation
  const terminalApp = new TerminalApp(...);
  // Manual registration
  state.os.registerApps([...]);
}
```

### Proposed Structure
```typescript
// init.ts - orchestration only
export function initWebShell(options?: WebShellInitOptions) {
  const os = createOS(options);
  const systemApps = registerSystemApps(os);
  const shell = configureShell(os, options);
  return { os, shell, systemApps };
}

// create-os.ts - OS creation
export function createOS(options?: OSConfig): OS {
  const container = new Container();
  // Register core services
  container.register('eventBus', new EventBus());
  container.register('processManager', new ProcessManager(...));
  // ... etc
  return new OS({ container });
}

// register-apps.ts - App registration
export function registerSystemApps(os: OS): App[] {
  const factory = new AppFactory(os.getContainer(), os.getAppManager());
  return [
    factory.createApp(TerminalApp),
    factory.createApp(CalculatorApp),
    // ... etc
  ];
}
```

## 5. Keep Packages Separate

### Decision: Keep All Packages Separate
- `cursor`, `net`, `notif`, `telemetry` remain as separate packages
- Each maintains its own package.json, build config, versioning
- Better modularity and independent maintenance

### Benefits
- Independent versioning
- Clear boundaries
- Easier to maintain
- Better tree-shaking

## 6. System Apps Standardization

### Current Structure
```
system-apps/
├── terminal/
├── calculator/
└── ...
```

### Proposed Structure
```
packages/apps/  # or keep system-apps/ but standardize
├── terminal/
│   ├── TerminalApp.ts
│   ├── TerminalView.tsx
│   ├── ShellProcess.ts
│   └── index.ts  # export { TerminalApp }
├── calculator/
│   ├── CalculatorApp.ts
│   ├── CalculatorView.tsx
│   └── index.ts
└── index.ts  # export all system apps
```

### Standard Export Pattern
```typescript
// packages/apps/terminal/index.ts
export { TerminalApp } from './TerminalApp';
export { TerminalView } from './TerminalView';
export { ShellProcess } from './ShellProcess';

// packages/apps/index.ts
export * from './terminal';
export * from './calculator';
// ... etc
```

## 7. Remove Legacy Code

### Files to Remove Immediately
- `packages/app-sdk/src/registry.ts` (AppRegistry) - DELETE NOW
- `apps/web-shell/src/app-manifest.ts` (consolidate into AppManager) - DELETE NOW
- Legacy component fallbacks in AppRenderer - REMOVE NOW

### Migration Steps (No Gradual Migration)
1. Move AppRegistry functionality to AppManager
2. Update all imports immediately
3. Delete deprecated code immediately
4. Update tests
5. No backward compatibility layer needed

## Implementation Order

### Step 1: Create DI Container (Foundation)
1. Create `packages/core/src/container.ts`
2. Add tests
3. Update OS.ts to use container
4. Update App base class to accept container

### Step 2: Create App Factory
1. Create `packages/app-sdk/src/AppFactory.ts`
2. Integrate with AppManager
3. Add tests
4. Update shell initialization

### Step 3: Consolidate Registration
1. Merge AppRegistry into AppManager
2. Consolidate app-manifest.ts helpers
3. Update all imports
4. Remove deprecated code

### Step 4: Refactor Initialization
1. Split init.ts into focused modules
2. Create builder pattern for OS creation
3. Update web-shell to use new structure
4. Update tests

### Step 5: Keep Packages Separate
1. Verify all packages have consistent structure
2. Ensure proper exports
3. No consolidation needed - keep separate

### Step 6: Standardize System Apps
1. Create consistent export pattern
2. Update all system apps
3. Create barrel exports
4. Update imports

## Testing Strategy

### Unit Tests
- Container: dependency resolution, factory registration
- AppFactory: app creation, registration
- AppManager: registration, lookup, lifecycle

### Integration Tests
- Shell initialization with typed DI
- App creation and registration
- Type safety verification

### Type Safety Tests
- Verify DI container enforces schema at compile time
- Test invalid key registration (should fail at compile time)
- Test type inference works correctly
- Verify compile-time errors for wrong types

## Rollout Plan

### Phase 1: Foundation (Week 1-2)
- DI container
- AppFactory
- Basic tests

### Phase 2: Cleanup (Week 3-4)
- Merge AppRegistry into AppManager
- Remove deprecated code immediately
- Update imports

### Phase 3: Refactoring (Week 5-6)
- Refactor initialization
- Standardize system apps
- Remove legacy code

### Phase 4: Polish (Week 7-8)
- Documentation
- Final tests
- Migration guide
- Release

## Risk Mitigation

### No Backward Compatibility Needed
- Remove deprecated code immediately
- Update all code to use new patterns
- Clear migration guide for reference

### Testing
- Comprehensive test suite
- Integration tests
- Manual testing checklist

### Rollback Plan
- Feature flags
- Git branches
- Incremental rollout

