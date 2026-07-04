/**
 * ═══════════════════════════════════════════════════════
 * Yessy Kraken — Seed Script: Administrador Principal
 *
 * Ejecutar UNA SOLA VEZ para crear el perfil del admin en Firestore.
 * Necesario cuando el usuario admin inicia sesión con Google por
 * primera vez y su UID de Auth no coincide con ningún documento.
 *
 * REQUISITO PREVIO: Abrir temporalmente las rules de `allies` en Firebase Console:
 *
 *   match /allies/{allyId} {
 *     allow read, write: if true;
 *   }
 *
 * Luego ejecutar:
 *   npx tsx scripts/seed-admin.ts
 *
 * Después del seed, restaura las rules completas de firestore.rules.
 * ═══════════════════════════════════════════════════════
 */

import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { config } from "dotenv";

config({ path: ".env.local" });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ─── DATOS DEL ADMIN ──────────────────────────────────
// ⚠️  AJUSTA estos valores antes de ejecutar:
const ADMIN_UID = "Q9ivJSbPSvTf9euGcptXlmbo7on2"; // UID de Firebase Auth (el dorado de la pantalla de diagnóstico)
const ADMIN_EMAIL = "krakendigitalabs@gmail.com";
const ADMIN_NAME = "Yessy Kraken Admin";
const ADMIN_WHATSAPP = "+57"; // Ajustar si es necesario

async function seedAdmin() {
  console.log("🐙 Yessy Kraken — Creando perfil de administrador...\n");
  console.log(`   UID: ${ADMIN_UID}`);
  console.log(`   Email: ${ADMIN_EMAIL}\n`);

  const docRef = doc(db, "allies", ADMIN_UID);
  await setDoc(docRef, {
    uid: ADMIN_UID,
    displayName: ADMIN_NAME,
    email: ADMIN_EMAIL,
    whatsapp: ADMIN_WHATSAPP,
    role: "admin",
    plan: "kraken",
    businessName: "Yessy Kraken Digital Labs",
    businessType: "otro",
    city: "Colombia",
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  console.log("✅ Documento admin creado exitosamente en allies/" + ADMIN_UID);
  console.log("\n⚠️  RECUERDA: Restaura las security rules completas en Firebase Console.");
  console.log("    Archivo: firestore.rules\n");
  process.exit(0);
}

seedAdmin().catch((error) => {
  console.error("❌ Error al crear el admin:", error);
  if (error.code === "permission-denied") {
    console.error("\n💡 PERMISO DENEGADO. ¿Abriste las rules de allies temporalmente?");
    console.error("   En Firebase Console → Firestore → Rules, cambia temporalmente a:");
    console.error("   match /allies/{allyId} { allow read, write: if true; }");
  }
  process.exit(1);
});
