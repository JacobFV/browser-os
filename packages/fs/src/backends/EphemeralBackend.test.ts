import { describe, it, expect, beforeEach } from 'vitest';
import { EphemeralBackend } from './EphemeralBackend';

describe('EphemeralBackend', () => {
  let backend: EphemeralBackend;

  beforeEach(() => {
    backend = new EphemeralBackend();
  });

  describe('file operations', () => {
    it('should write and read files', async () => {
      const data = new TextEncoder().encode('hello world');
      await backend.write('/test.txt', data);
      const result = await backend.read('/test.txt');
      expect(new TextDecoder().decode(result)).toBe('hello world');
    });

    it('should check if file exists', async () => {
      expect(await backend.exists('/test.txt')).toBe(false);
      await backend.write('/test.txt', new TextEncoder().encode('test'));
      expect(await backend.exists('/test.txt')).toBe(true);
    });

    it('should delete files', async () => {
      await backend.write('/test.txt', new TextEncoder().encode('test'));
      expect(await backend.exists('/test.txt')).toBe(true);
      await backend.delete('/test.txt');
      expect(await backend.exists('/test.txt')).toBe(false);
    });

    it('should throw error when reading non-existent file', async () => {
      await expect(backend.read('/nonexistent.txt')).rejects.toThrow('File not found');
    });
  });

  describe('directory operations', () => {
    it('should create directories', async () => {
      await backend.mkdir('/test');
      expect(await backend.exists('/test')).toBe(true);
    });

    it('should create nested directories', async () => {
      await backend.mkdir('/test/nested/deep');
      expect(await backend.exists('/test')).toBe(true);
      expect(await backend.exists('/test/nested')).toBe(true);
      expect(await backend.exists('/test/nested/deep')).toBe(true);
    });

    it('should list directory contents', async () => {
      await backend.mkdir('/test');
      await backend.write('/test/file1.txt', new TextEncoder().encode('file1'));
      await backend.write('/test/file2.txt', new TextEncoder().encode('file2'));
      await backend.mkdir('/test/subdir');

      const entries = await backend.readdir('/test');
      expect(entries).toContain('file1.txt');
      expect(entries).toContain('file2.txt');
      expect(entries).toContain('subdir');
    });

    it('should remove empty directories', async () => {
      await backend.mkdir('/test');
      await backend.rmdir('/test');
      expect(await backend.exists('/test')).toBe(false);
    });

    it('should throw error when removing non-empty directory', async () => {
      await backend.mkdir('/test');
      await backend.write('/test/file.txt', new TextEncoder().encode('test'));
      await expect(backend.rmdir('/test')).rejects.toThrow('Directory not empty');
    });
  });

  describe('stat', () => {
    it('should return file metadata', async () => {
      const data = new TextEncoder().encode('test content');
      await backend.write('/test.txt', data);
      const stat = await backend.stat('/test.txt');

      expect(stat.path).toBe('/test.txt');
      expect(stat.type).toBe('file');
      expect(stat.size).toBe(data.length);
      expect(stat.permissions).toBe('rwxrwxrwx');
    });

    it('should return directory metadata', async () => {
      await backend.mkdir('/test');
      const stat = await backend.stat('/test');

      expect(stat.path).toBe('/test');
      expect(stat.type).toBe('directory');
      expect(stat.size).toBe(0);
    });
  });
});

