import { describe, it, expect } from 'vitest';
import { PathUtils } from './PathUtils';

describe('PathUtils', () => {
  describe('normalize', () => {
    it('should normalize simple paths', () => {
      expect(PathUtils.normalize('/')).toBe('/');
      expect(PathUtils.normalize('.')).toBe('.');
      expect(PathUtils.normalize('/test')).toBe('/test');
    });

    it('should resolve . and ..', () => {
      expect(PathUtils.normalize('/test/../other')).toBe('/other');
      expect(PathUtils.normalize('/test/./file')).toBe('/test/file');
      expect(PathUtils.normalize('/test/../..')).toBe('/');
    });

    it('should handle multiple slashes', () => {
      expect(PathUtils.normalize('//test//file')).toBe('/test/file');
    });
  });

  describe('join', () => {
    it('should join path segments', () => {
      expect(PathUtils.join('/test', 'file.txt')).toBe('/test/file.txt');
      expect(PathUtils.join('/test', '../other', 'file.txt')).toBe('/other/file.txt');
    });

    it('should handle empty segments', () => {
      expect(PathUtils.join('/test', '', 'file.txt')).toBe('/test/file.txt');
    });
  });

  describe('resolve', () => {
    it('should resolve relative paths', () => {
      expect(PathUtils.resolve('/base', 'file.txt')).toBe('/base/file.txt');
      expect(PathUtils.resolve('/base', '../other')).toBe('/other');
    });
  });

  describe('isAbsolute', () => {
    it('should detect absolute paths', () => {
      expect(PathUtils.isAbsolute('/test')).toBe(true);
      expect(PathUtils.isAbsolute('test')).toBe(false);
      expect(PathUtils.isAbsolute('./test')).toBe(false);
    });
  });

  describe('dirname', () => {
    it('should get directory name', () => {
      expect(PathUtils.dirname('/test/file.txt')).toBe('/test');
      expect(PathUtils.dirname('/test')).toBe('/');
      expect(PathUtils.dirname('/')).toBe('/');
    });
  });

  describe('basename', () => {
    it('should get base name', () => {
      expect(PathUtils.basename('/test/file.txt')).toBe('file.txt');
      expect(PathUtils.basename('/test')).toBe('test');
      expect(PathUtils.basename('/')).toBe('/');
    });
  });

  describe('extname', () => {
    it('should get extension', () => {
      expect(PathUtils.extname('/test/file.txt')).toBe('.txt');
      expect(PathUtils.extname('/test/file')).toBe('');
      expect(PathUtils.extname('/test/.hidden')).toBe('');
    });
  });
});

