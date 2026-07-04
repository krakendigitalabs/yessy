import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import type {
  Ally,
  CreateAllyData,
  Lead,
  CreateLeadData,
  Plan,
  Order,
  CreateOrderData,
  OrderStatus,
} from "@/types/models";

// ═══════════════════════════════════════════════════════
// Yessy Kraken — Firestore CRUD Helpers
// Capa de abstracción tipada sobre Firestore.
// Ningún componente debe escribir queries directamente.
// ═══════════════════════════════════════════════════════

// === ALLIES ===

/**
 * Busca un aliado por su Firebase Auth UID.
 * El UID se usa como document ID en la colección `allies`.
 */
export async function getAllyByUid(uid: string): Promise<Ally | null> {
  const docRef = doc(db, "allies", uid);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return null;

  return { id: docSnap.id, ...docSnap.data() } as Ally;
}

/**
 * Busca un aliado por su email (útil si entra con Google y el UID no coincide).
 */
export async function getAllyByEmail(email: string): Promise<Ally | null> {
  const q = query(collection(db, "allies"), where("email", "==", email));
  const snapshot = await getDocs(q);

  if (snapshot.empty) return null;

  const docSnap = snapshot.docs[0];
  return { id: docSnap.id, ...docSnap.data() } as Ally;
}

/**
 * Crea un nuevo aliado. El document ID será el UID de Auth.
 */
export async function createAlly(data: CreateAllyData): Promise<string> {
  const docRef = doc(db, "allies", data.uid);
  await setDoc(docRef, {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return data.uid;
}

/**
 * Actualiza campos de un aliado existente.
 */
export async function updateAlly(
  uid: string,
  data: Partial<Omit<Ally, "id" | "uid" | "createdAt">>
): Promise<void> {
  const docRef = doc(db, "allies", uid);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Lista todos los aliados activos.
 */
export async function getAllAllies(): Promise<Ally[]> {
  const q = query(
    collection(db, "allies"),
    where("isActive", "==", true),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Ally);
}

// === LEADS ===

/**
 * Crea un nuevo lead (desde el formulario público).
 */
export async function createLead(data: CreateLeadData): Promise<string> {
  const docRef = await addDoc(collection(db, "leads"), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Lista todos los leads, ordenados por fecha descendente.
 */
export async function getAllLeads(): Promise<Lead[]> {
  const q = query(collection(db, "leads"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Lead);
}

/**
 * Lista leads asignados a un aliado específico.
 */
export async function getLeadsByAlly(allyId: string): Promise<Lead[]> {
  const q = query(
    collection(db, "leads"),
    where("assignedAllyId", "==", allyId),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Lead);
}

/**
 * Asigna un lead a un aliado (Feature Broker).
 * Cambia el estado a 'contactado' automáticamente.
 */
export async function assignLeadToAlly(
  leadId: string,
  allyId: string
): Promise<void> {
  const docRef = doc(db, "leads", leadId);
  await updateDoc(docRef, {
    assignedAllyId: allyId,
    status: "contactado",
  });
}

/**
 * Actualiza el estado de un lead (usado por el aliado desde su portal).
 */
export async function updateLeadStatus(
  leadId: string,
  status: import("@/types/models").LeadStatus
): Promise<void> {
  const docRef = doc(db, "leads", leadId);
  await updateDoc(docRef, { status });
}

// === PLANS ===

/**
 * Lista todos los planes activos.
 */
export async function getPlans(): Promise<Plan[]> {
  const q = query(collection(db, "plans"), where("isActive", "==", true));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Plan);
}

/**
 * Obtiene un plan por su ID (tentaculo | depredador | kraken).
 */
export async function getPlanById(planId: string): Promise<Plan | null> {
  const docRef = doc(db, "plans", planId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return null;

  return { id: docSnap.id, ...docSnap.data() } as Plan;
}

// === ORDERS ===

/**
 * Crea una nueva orden de compra.
 */
export async function createOrder(data: CreateOrderData): Promise<string> {
  const docRef = await addDoc(collection(db, "orders"), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Actualiza el estado de una orden (usado por webhooks de Wompi).
 */
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  transactionId?: string
): Promise<void> {
  const docRef = doc(db, "orders", orderId);
  const updateData: Record<string, unknown> = { status };

  if (status === "approved") {
    updateData.paidAt = serverTimestamp();
  }

  if (transactionId) {
    updateData.wompiTransactionId = transactionId;
  }

  await updateDoc(docRef, updateData);
}

/**
 * Lista órdenes de un aliado específico.
 */
export async function getOrdersByAlly(allyId: string): Promise<Order[]> {
  const q = query(
    collection(db, "orders"),
    where("allyId", "==", allyId),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Order);
}
