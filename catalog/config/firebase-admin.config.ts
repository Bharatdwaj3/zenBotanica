import admin from 'firebase-admin';
import type { Auth } from 'firebase-admin/auth';

import {
  Fbase_project_id,
  Fbase_public_key,
  Fbase_private_key_id, 
  Fbase_client_email,
  Fbase_client_id,
  Fbase_auth_uri,
  Fbase_token_uri,
  Fbase_auth_provider_x509_cert_url, 
  Fbase_client_x509_cert_url, 
  Fbase_universe_domain

} from "./env.config.ts";




let firebaseApp;

if (process.env.NODE_ENV === 'development') {
  process.env.FIREBASE_AUTH_EMULATOR_HOST = 'firebase:9099';
  process.env.FIREBASE_STORAGE_EMULATOR_HOST = 'firebase:9199';
  process.env.GCLOUD_PROJECT = Fbase_project_id || 'demo-project';

  firebaseApp = admin.initializeApp({
    projectId: Fbase_project_id || 'demo-project',
    storageBucket: `${Fbase_project_id || 'demo-project'}.appspot.com`,
  });
} else {
  const serviceAccount = {
  type: 'service_account',
  project_id: Fbase_project_id,
  private_key_id: Fbase_private_key_id,
  private_key: Fbase_private_key_id?.replace(/\\n/g, '\n'),  
  client_email: Fbase_client_email,
  client_id: Fbase_client_id,
  auth_uri: Fbase_auth_uri,
  token_uri: Fbase_token_uri,
  auth_provider_x509_cert_url: Fbase_auth_provider_x509_cert_url,
  client_x509_cert_url: Fbase_client_x509_cert_url,
  universe_domain: Fbase_universe_domain || 'googleapis.com',
}as admin.ServiceAccount;

  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: `${Fbase_project_id}.appspot.com`,
  });
}

export const auth: Auth = admin.auth();
export const storage = admin.storage().bucket();



export default firebaseApp;