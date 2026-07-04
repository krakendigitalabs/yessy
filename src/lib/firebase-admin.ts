import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// ═══════════════════════════════════════════════════════
// Firebase Admin SDK — Inicialización (Servidor)
// Bypasea las Firestore Security Rules completamente.
// Solo se usa en API Routes de Next.js (servidor).
// ═══════════════════════════════════════════════════════

function getAdminApp(): App {
  const existingApps = getApps();
  if (existingApps.length > 0) {
    return existingApps[0];
  }

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (!serviceAccountJson) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_JSON no está definida en .env.local. " +
      "Descarga tu Service Account Key desde Firebase Console → Configuración del proyecto → Cuentas de servicio."
    );
  }

  const serviceAccount = JSON.parse(serviceAccountJson);

  return initializeApp({
    credential: cert(serviceAccount),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
}

export const adminDb = getFirestore(getAdminApp());
