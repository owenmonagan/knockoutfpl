// functions/src/dataconnect.ts
// Data Connect client for Cloud Functions

import { initializeApp, getApps } from 'firebase/app';
import { getDataConnect, DataConnect } from 'firebase/data-connect';
import { connectorConfig } from './generated/dataconnect';

// Firebase configuration for Data Connect
// In Cloud Functions, GCLOUD_PROJECT is automatically set
const firebaseConfig = {
  projectId: process.env.GCLOUD_PROJECT || 'knockoutfpl',
};

// Initialize Firebase app if not already done
const app = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApps()[0];

// Get Data Connect instance
export const dataConnect: DataConnect = getDataConnect(app, connectorConfig);
