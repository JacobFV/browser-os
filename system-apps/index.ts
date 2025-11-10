/**
 * Barrel export for all system apps
 * 
 * This file provides a convenient way to import all system apps at once.
 * For better tree-shaking, prefer importing directly from individual app packages.
 */

// Core system apps
export { TerminalApp, TerminalView, ShellProcess, HeadlessTerminal } from './terminal/src';
export { CalculatorApp, CalculatorView } from './calculator/src';
export { FilesApp, FilesView } from './files/src';
export { NotesApp, NotesView } from './notes/src';
export { MonitorApp, MonitorView } from './monitor/src';
export { SettingsApp, SettingsView } from './settings/src';
export { EditorApp, EditorView } from './editor/src';
export { BrowserApp, BrowserView } from './browser/src';
export { CalendarApp, CalendarView } from './calendar/src';
export { StoreApp, StoreView } from './store/src';
export { WordProcessorApp, DocumentWindow } from './word-processor/src';

