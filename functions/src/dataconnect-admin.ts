// functions/src/dataconnect-admin.ts
// Data Connect Admin SDK client for Cloud Functions
// Uses admin privileges (no impersonation) for internal mutations

import { initializeApp, getApps } from 'firebase-admin/app';
import { getDataConnect, DataConnect } from 'firebase-admin/data-connect';

// Initialize Firebase Admin SDK (if not already initialized)
if (getApps().length === 0) {
  // In emulator, uses default credentials
  // In production, uses Application Default Credentials (ADC)
  initializeApp();
}

// Data Connect configuration matching dataconnect/dataconnect.yaml
const dataConnectConfig = {
  serviceId: 'knockoutfpl-dev-service',
  location: 'us-east1',
};

// Get Data Connect instance
export const dataConnectAdmin: DataConnect = getDataConnect(dataConnectConfig);
