import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";

// ═══════════════════════════════════════════════════════
// Firebase Admin SDK — Inicialización (Servidor)
// Bypasea las Firestore Security Rules completamente.
// Solo se usa en API Routes de Next.js (servidor).
// Inicialización LAZY: no se ejecuta al importar el módulo,
// solo cuando se llama a getAdminDb() por primera vez.
// ═══════════════════════════════════════════════════════

let _adminApp: App | null = null;
let _adminDb: Firestore | null = null;

function getAdminApp(): App {
  if (_adminApp) return _adminApp;

  const existingApps = getApps();
  if (existingApps.length > 0) {
    _adminApp = existingApps[0];
    return _adminApp;
  }

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (!serviceAccountJson) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_JSON no está definida. " +
      "Agrégala en Vercel → Settings → Environment Variables."
    );
  }

  const serviceAccount = JSON.parse(serviceAccountJson);

  _adminApp = initializeApp({
    credential: cert(serviceAccount),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });

  return _adminApp;
}

/**
 * Retorna la instancia de Firestore del Admin SDK.
 * Usar SOLO dentro de API Routes o Server Actions.
 */
export function getAdminDb(): Firestore {
  if (!_adminDb) {
    _adminDb = getFirestore(getAdminApp());
  }
  return _adminDb;
}
