# Browser-OS Architecture Refactoring Plan

## Executive Summary

This document outlines a comprehensive refactoring plan to improve the browser-os codebase architecture, organization, and maintainability. The current architecture is solid but has several areas that can be improved for better scalability, maintainability, and developer experience.

## Current Architecture Assessment

### ✅ Strengths

1. **Clear OOP Design**: App class hierarchy is well-designed
2. **Separation of Concerns**: Logic separated from UI components
3. **Event-Driven Architecture**: Event bus provides good decoupling
4. **Monorepo Structure**: Good use of pnpm workspaces
5. **Type Safety**: Strong TypeScript usage throughout

### ⚠️ Issues Identified

1. **Dual Registration System**: Both App instances and manifest-based apps coexist, creating confusion
2. **Manual Dependency Injection**: Apps manually instantiated with dependencies in `init.ts`
3. **Tight Coupling**: System apps directly imported and instantiated in shell initialization
4. **Unstructured DI**: No type-safe dependency registration schema
5. **Inconsistent Patterns**: Some apps use App class, others use legacy component pattern
6. **No Plugin System**: No clear way to dynamically add apps without modifying core code
7. **Registry Duplication**: `AppRegistry` and `AppManager` have overlapping functionality
8. **System Apps Location**: System apps in separate directory but treated differently

## Refactoring Recommendations

### 1. Consolidate App Registration System

**Problem**: Two parallel systems (App instances + manifests) create confusion and maintenance burden.

**Solution**: 
- Remove `AppRegistry` class (deprecated, already marked)
- Consolidate all app registration into `AppManager`
- Create a unified `AppFactory` pattern for app instantiation
- Support both class-based and manifest-based apps through a single interface

**Benefits**:
- Single source of truth for app registration
- Easier to understand and maintain
- Clear migration path for legacy apps

### 2. Implement Dependency Injection Container

**Problem**: Manual dependency passing in `init.ts` is brittle and doesn't scale.

**Solution**:
- Create a lightweight DI container in `@browser-os/core` with typed dependency schema
- Enforce type-safe registration: `register<K extends keyof Dependencies>(key: K, instance: Dependencies[K])`
- Define `Dependencies` interface mapping keys to types
- Apps request dependencies through constructor injection with compile-time type safety
- Factory pattern for app instantiation

**Benefits**:
- Automatic dependency resolution
- Compile-time type safety (no arbitrary string keys)
- Prevents typos and runtime errors
- Easier testing (mock dependencies)
- Better scalability
- Cleaner initialization code

### 3. Create App Plugin System

**Problem**: No way to add apps dynamically without modifying core code.

**Solution**:
- Create `@browser-os/app-loader` package
- Support loading apps from:
  - Built-in system apps
  - External packages
  - Remote URLs (for app store)
  - Local file system
- App discovery and registration system

**Benefits**:
- True plugin architecture
- Easier third-party app development
- App store integration ready
- Hot-reload support for development

### 4. Keep Packages Separate

**Decision**: All packages remain separate for better modularity.

**Rationale**:
- `cursor`, `net`, `notif`, `telemetry` stay as separate packages
- Each package maintains independent versioning
- Clear boundaries and responsibilities
- Better tree-shaking and modularity
- Easier to maintain independently

**Benefits**:
- Independent versioning
- Clear boundaries
- Better modularity
- Easier to maintain
- Better tree-shaking

### 5. Standardize System Apps

**Problem**: System apps are in separate directory but treated inconsistently.

**Solution**:
- Move system apps to `packages/apps/` (or keep `system-apps/` but standardize)
- All system apps must extend `App` class
- Create `SystemAppRegistry` for built-in apps
- Consistent export pattern: `export { AppClass } from './App'`

**Benefits**:
- Consistent structure
- Easier to discover and maintain
- Clear distinction between system and user apps

### 6. Improve Package Exports

**Problem**: Inconsistent export patterns across packages.

**Solution**:
- Standardize on barrel exports (`index.ts`)
- Use explicit exports (no `export *`)
- Document public API clearly
- Use TypeScript path mapping for cleaner imports

**Benefits**:
- Better tree-shaking
- Clearer public APIs
- Easier to maintain
- Better IDE support

### 7. Create App Factory Pattern

**Problem**: App instantiation scattered and inconsistent.

**Solution**:
- Create `AppFactory` class in `@browser-os/app-sdk`
- Factory handles:
  - Dependency injection
  - App instantiation
  - Registration
  - Lifecycle hooks
- Support both class-based and manifest-based apps

**Benefits**:
- Centralized app creation logic
- Consistent initialization
- Easier to extend
- Better error handling

### 8. Refactor Shell Initialization

**Problem**: `init.ts` files are doing too much (violating SRP).

**Solution**:
- Split initialization into:
  - `createOS()` - Creates OS instance
  - `registerSystemApps()` - Registers built-in apps
  - `configureShell()` - Configures shell UI
- Use builder pattern for complex initialization
- Support configuration presets

**Benefits**:
- More testable
- Easier to customize
- Clearer responsibilities
- Better error handling

### 9. Remove Legacy Code

**Problem**: Deprecated code still present (AppRegistry, manifest helpers).

**Solution**:
- Remove `AppRegistry` class immediately (no gradual migration)
- Remove `app-manifest.ts` helpers immediately (consolidate into AppManager)
- Remove legacy component fallbacks in AppRenderer immediately
- Update all system apps to use App class immediately

**Benefits**:
- Less code to maintain
- Clearer architecture
- No confusion about which pattern to use
- Better performance (no fallback checks)
- No technical debt from deprecated code

### 10. Improve Type Safety

**Problem**: Some areas use `any` or loose types.

**Solution**:
- Create strict types for app configs
- Use branded types for IDs (WindowId, AppId, Pid)
- Create interfaces for all public APIs
- Remove `any` types where possible

**Benefits**:
- Better IDE support
- Catch errors at compile time
- Self-documenting code
- Easier refactoring

## Implementation Priority

### Phase 1: Foundation (High Priority)
1. Create DI container
2. Implement AppFactory
3. Consolidate AppManager (remove AppRegistry)
4. Refactor shell initialization

### Phase 2: Cleanup (Medium Priority)
5. Standardize system apps
6. Improve package exports
7. Remove legacy code immediately
8. Update all imports

### Phase 3: Enhancement (Lower Priority)
9. Create app plugin system
10. Improve type safety
11. Add comprehensive tests
12. Update documentation

## Migration Strategy

### Immediate Removal (No Gradual Migration)

1. **Remove Deprecated Code Immediately**: Delete `AppRegistry`, `app-manifest.ts` helpers
2. **Update All Code**: All code must use new patterns immediately
3. **No Backward Compatibility**: No compatibility layer needed
4. **Migration Guide**: Provide clear steps for reference

### For New Code

1. **Use New Patterns**: All new code uses new architecture
2. **Documentation**: Clear examples of new patterns
3. **Code Review**: Enforce new patterns in reviews
4. **Type Safety**: Use typed DI container schema

## File Structure Proposal

```
browser-os/
├── packages/
│   ├── core/                    # Event bus, DI, IDs, schemas
│   ├── app-sdk/                 # App base class, AppManager, OS, AppFactory
│   ├── windowing/               # Window, WindowManager
│   ├── process/                 # Process management
│   ├── fs/                      # Virtual filesystem
│   ├── cursor/                  # Cursor management (separate)
│   ├── net/                     # Network abstraction (separate)
│   ├── notif/                   # Notifications (separate)
│   ├── telemetry/               # Metrics and logging (separate)
│   ├── ui/                      # UI components
│   ├── theme/                   # Theme system
│   ├── dialogs/                 # Dialog components
│   ├── shell/                   # Shell initialization
│   ├── workspace/               # Workspace management
│   ├── taskbar/                 # Taskbar
│   ├── desktop/                 # Desktop
│   └── app-loader/              # NEW: App loading and plugin system
├── apps/
│   ├── system/                  # System apps (moved from system-apps/)
│   │   ├── terminal/
│   │   ├── calculator/
│   │   └── ...
│   ├── web-shell/               # Web shell
│   ├── electron-shell/          # Electron wrapper
│   └── showcase/                # Component gallery
└── examples/                    # Example apps
```

## Breaking Changes

### Breaking Changes (Immediate)
- Remove `AppRegistry` immediately (no deprecation period)
- Consolidate `app-manifest.ts` helpers into AppManager immediately
- All code must use new patterns immediately

### Migration Path
- Clear migration guide for reference
- Update all imports immediately
- No compatibility layer needed
- Type-safe DI container prevents errors

## Success Metrics

1. **Code Reduction**: 15-20% reduction in total LOC
2. **Type Safety**: 100% type-safe DI container with schema enforcement
3. **Import Clarity**: All imports use clear, consistent paths
4. **Test Coverage**: 80%+ coverage for core packages
5. **Documentation**: All public APIs documented
6. **Developer Experience**: Faster onboarding, clearer patterns, compile-time safety

## Next Steps

1. Review and approve this plan
2. Create detailed implementation tickets
3. Set up feature branch for refactoring
4. Implement Phase 1 changes
5. Test thoroughly
6. Update documentation
7. Release with migration guide

