import { vfs, createMemDriver } from '@browser-os/fs';

// Create a shared driver instance that persists across the test session
let sharedDriver: ReturnType<typeof createMemDriver> | null = null;

// Mount VFS before any tests run
console.log('Test setup: Mounting VFS...');
if (!sharedDriver) {
  sharedDriver = createMemDriver();
}
vfs.mount({
  mountPoint: '/documents',
  driver: sharedDriver,
});
console.log('Test setup: VFS mounted');

// Export the driver so it can be reused
export { sharedDriver };

