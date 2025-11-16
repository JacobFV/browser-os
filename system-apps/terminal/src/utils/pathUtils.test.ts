import { describe, it, expect } from 'vitest';
import { resolvePath, normalizePath } from './pathUtils';

describe('pathUtils', () => {
  describe('normalizePath', () => {
    it('should normalize simple paths', () => {
      expect(normalizePath('/a/b/c')).toBe('/a/b/c');
    });

    it('should handle ..', () => {
      expect(normalizePath('/a/b/../c')).toBe('/a/c');
    });

    it('should handle .', () => {
      expect(normalizePath('/a/./b')).toBe('/a/b');
    });

    it('should handle multiple ..', () => {
      expect(normalizePath('/a/b/../../c')).toBe('/c');
    });

    it('should handle root path', () => {
      expect(normalizePath('/')).toBe('/');
    });
  });

  describe('resolvePath', () => {
    const cwd = '/home/user';
    const home = '/home/user';

    it('should resolve absolute paths', () => {
      expect(resolvePath('/absolute/path', cwd, home)).toBe('/absolute/path');
    });

    it('should resolve relative paths', () => {
      expect(resolvePath('documents', cwd, home)).toBe('/home/user/documents');
    });

    it('should expand ~', () => {
      expect(resolvePath('~/documents', cwd, home)).toBe('/home/user/documents');
    });

    it('should handle .. in relative paths', () => {
      expect(resolvePath('../parent', cwd, home)).toBe('/home/parent');
    });

    it('should handle . in relative paths', () => {
      expect(resolvePath('./current', cwd, home)).toBe('/home/user/current');
    });
  });
});

