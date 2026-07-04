/**
 * ═══════════════════════════════════════════════════════
 * Yessy Kraken — Seed Script: Planes Iniciales
 * 
 * Ejecutar UNA SOLA VEZ para poblar la colección `plans` en Firestore.
 * 
 * IMPORTANTE: Este script usa el SDK de cliente con una ventana temporal
 * de reglas abiertas. Antes de ejecutar:
 * 
 * 1. Ve a Firebase Console → Firestore → Rules
 * 2. Cambia temporalmente las rules de `plans` a:
 *    match /plans/{planId} { allow read, write: if true; }
 * 3. Ejecuta: npx tsx scripts/seed-plans.ts
 * 4. Después del seed, despliega las reglas completas de firestore.rules
 * 
 * ═══════════════════════════════════════════════════════
 */

import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

// Cargar variables de entorno
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

// ─── DATOS DE LOS PLANES ───────────────────────────────

const plans = [
  {
    id: "tentaculo",
    name: "Tentáculo",
    price: 149000,
    features: [
      "AI Broker de Turismo",
      "Hasta 50 leads/mes",
      "Panel de métricas básico",
      "Soporte por WhatsApp",
    ],
    maxLeadsPerMonth: 50,
    hasBrokerAccess: true,
    hasSaasAccess: false,
    hasGrowthEngine: false,
    isActive: true,
  },
  {
    id: "depredador",
    name: "Depredador",
    price: 349000,
    features: [
      "Todo lo de Tentáculo",
      "Dev-Factory SaaS (PMS o Restaurante)",
      "Hasta 200 leads/mes",
      "Dashboard avanzado con gráficos",
      "Soporte prioritario",
    ],
    maxLeadsPerMonth: 200,
    hasBrokerAccess: true,
    hasSaasAccess: true,
    hasGrowthEngine: false,
    isActive: true,
  },
  {
    id: "kraken",
    name: "Kraken",
    price: 599000,
    features: [
      "Todo lo de Depredador",
      "Growth Engine (IA Generativa)",
      "Leads ilimitados",
      "Auditoría Wealth Oracle",
      "Consultor dedicado",
      "Acceso API completo",
    ],
    maxLeadsPerMonth: -1,
    hasBrokerAccess: true,
    hasSaasAccess: true,
    hasGrowthEngine: true,
    isActive: true,
  },
];

// ─── EJECUTAR SEED ─────────────────────────────────────

async function seedPlans() {
  console.log("🐙 Yessy Kraken — Sembrando planes en Firestore...\n");

  for (const plan of plans) {
    const { id, ...data } = plan;
    const docRef = doc(db, "plans", id);
    await setDoc(docRef, data);
    console.log(`  ✅ Plan "${plan.name}" (${plan.id}) — $${plan.price.toLocaleString("es-CO")} COP/mes`);
  }

  console.log("\n🎯 Seed completado. 3 planes creados en Firestore.");
  console.log("\n⚠️  RECUERDA: Despliega las reglas completas de firestore.rules en la consola de Firebase.");
  process.exit(0);
}

seedPlans().catch((error) => {
  console.error("❌ Error ejecutando seed:", error);
  console.error("\n💡 ¿Abriste las rules de Firestore temporalmente? Ver instrucciones en la cabecera de este archivo.");
  process.exit(1);
});
