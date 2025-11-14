import { describe, it, expect, beforeEach } from 'vitest';
import { FileSystem } from './FileSystem';
import { EphemeralBackend } from './backends/EphemeralBackend';
import { EventBus } from '@browser-os/events';

describe('FileSystem', () => {
  let fs: FileSystem;
  let backend: EphemeralBackend;

  beforeEach(async () => {
    const eventBus = new EventBus();
    fs = new FileSystem({ eventBus });
    backend = new EphemeralBackend();
    await fs.mount('/', backend);
  });

  describe('file operations', () => {
    it('should read and write files', async () => {
      const data = new TextEncoder().encode('hello world');
      await fs.write('/test.txt', data);
      const result = await fs.read('/test.txt');
      expect(new TextDecoder().decode(result)).toBe('hello world');
    });

    it('should check if file exists', async () => {
      expect(await fs.exists('/test.txt')).toBe(false);
      await fs.write('/test.txt', new TextEncoder().encode('test'));
      expect(await fs.exists('/test.txt')).toBe(true);
    });

    it('should delete files', async () => {
      await fs.write('/test.txt', new TextEncoder().encode('test'));
      await fs.delete('/test.txt');
      expect(await fs.exists('/test.txt')).toBe(false);
    });

    it('should append to files', async () => {
      await fs.write('/test.txt', new TextEncoder().encode('hello'));
      await fs.write('/test.txt', new TextEncoder().encode(' world'), { append: true });
      const result = await fs.read('/test.txt');
      expect(new TextDecoder().decode(result)).toBe('hello world');
    });
  });

  describe('directory operations', () => {
    it('should create directories', async () => {
      await fs.mkdir('/test');
      expect(await fs.exists('/test')).toBe(true);
    });

    it('should create nested directories recursively', async () => {
      await fs.mkdir('/test/nested/deep', { recursive: true });
      expect(await fs.exists('/test/nested/deep')).toBe(true);
    });

    it('should list directory contents', async () => {
      await fs.mkdir('/test');
      await fs.write('/test/file1.txt', new TextEncoder().encode('file1'));
      await fs.write('/test/file2.txt', new TextEncoder().encode('file2'));

      const entries = await fs.readdir('/test');
      expect(entries).toContain('file1.txt');
      expect(entries).toContain('file2.txt');
    });

    it('should remove directories', async () => {
      await fs.mkdir('/test');
      await fs.rmdir('/test');
      expect(await fs.exists('/test')).toBe(false);
    });

    it('should remove directories recursively', async () => {
      await fs.mkdir('/test/nested', { recursive: true });
      await fs.write('/test/file.txt', new TextEncoder().encode('test'));
      await fs.rmdir('/test', { recursive: true });
      expect(await fs.exists('/test')).toBe(false);
    });
  });

  describe('stat', () => {
    it('should return file metadata', async () => {
      const data = new TextEncoder().encode('test');
      await fs.write('/test.txt', data);
      const stat = await fs.stat('/test.txt');

      expect(stat.path).toBe('/test.txt');
      expect(stat.type).toBe('file');
      expect(stat.size).toBe(data.length);
    });

    it('should return directory metadata', async () => {
      await fs.mkdir('/test');
      const stat = await fs.stat('/test');
      expect(stat.type).toBe('directory');
    });
  });

  describe('path operations', () => {
    it('should resolve paths', () => {
      expect(fs.resolve('/test', 'file.txt')).toBe('/test/file.txt');
      expect(fs.resolve('/test', '../other')).toBe('/other');
    });

    it('should normalize paths', () => {
      expect(fs.normalize('/test/../other')).toBe('/other');
    });

    it('should check if path is absolute', () => {
      expect(fs.isAbsolute('/test')).toBe(true);
      expect(fs.isAbsolute('test')).toBe(false);
    });

    it('should join paths', () => {
      expect(fs.join('/test', 'file.txt')).toBe('/test/file.txt');
    });
  });

  describe('mount operations', () => {
    it('should mount backends', async () => {
      const tmpBackend = new EphemeralBackend();
      await fs.mount('/tmp', tmpBackend);

      await fs.write('/tmp/test.txt', new TextEncoder().encode('test'));
      expect(await fs.exists('/tmp/test.txt')).toBe(true);
    });

    it('should get mount point', () => {
      const mount = fs.getMount('/test/file.txt');
      expect(mount).not.toBeNull();
      expect(mount?.path).toBe('/');
    });
  });
});

