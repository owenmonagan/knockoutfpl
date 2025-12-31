/**
 * DataConnect Admin SDK client for E2E tests
 * Similar to functions/src/dataconnect-admin.ts but configured for E2E testing
 * with emulator support.
 */

import { initializeApp, getApps, deleteApp, App } from 'firebase-admin/app';
import { getDataConnect, DataConnect } from 'firebase-admin/data-connect';

let adminApp: App | null = null;
let dataConnectInstance: DataConnect | null = null;

// Data Connect configuration matching dataconnect/dataconnect.yaml
const dataConnectConfig = {
  serviceId: 'knockoutfpl-dev-service',
  location: 'us-east1',
};

/**
 * Initialize DataConnect admin client for E2E tests
 * Sets up emulator host and returns DataConnect instance
 */
export async function initializeDataConnect(): Promise<DataConnect> {
  // Set emulator host for DataConnect
  if (!process.env.DATA_CONNECT_EMULATOR_HOST) {
    process.env.DATA_CONNECT_EMULATOR_HOST = '127.0.0.1:9399';
  }

  // Clear any existing apps to ensure clean state
  for (const app of getApps()) {
    await deleteApp(app);
  }
  adminApp = null;
  dataConnectInstance = null;

  // Initialize Firebase Admin SDK
  adminApp = initializeApp({
    projectId: 'knockoutfpl-dev',
  });

  // Get DataConnect instance
  dataConnectInstance = getDataConnect(dataConnectConfig);

  console.log(`DataConnect initialized: ${process.env.DATA_CONNECT_EMULATOR_HOST}`);

  return dataConnectInstance;
}

/**
 * Get the DataConnect instance (must call initializeDataConnect first)
 */
export function getDataConnectInstance(): DataConnect {
  if (!dataConnectInstance) {
    throw new Error(
      'DataConnect not initialized. Call initializeDataConnect() first.'
    );
  }
  return dataConnectInstance;
}

/**
 * Get the admin app instance (for Auth operations)
 */
export function getAdminApp(): App {
  if (!adminApp) {
    throw new Error(
      'Admin app not initialized. Call initializeDataConnect() first.'
    );
  }
  return adminApp;
}

/**
 * Cleanup DataConnect and Firebase Admin SDK
 */
export async function cleanupDataConnect(): Promise<void> {
  if (adminApp) {
    await deleteApp(adminApp);
    adminApp = null;
    dataConnectInstance = null;
    console.log('DataConnect cleaned up');
  }
}
