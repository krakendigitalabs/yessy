import { Timestamp } from "firebase/firestore";

// ═══════════════════════════════════════════════════════
// Yessy Kraken — Modelos de Datos Centralizados
// Todas las interfaces mapean 1:1 con colecciones Firestore.
// ═══════════════════════════════════════════════════════

// === ENUMS & TIPOS BASE ===

export type UserRole = "admin" | "ally" | "tourist";

export type PlanTier = "tentaculo" | "depredador" | "kraken" | "ninguno";

export type LeadStatus =
  | "nuevo"
  | "contactado"
  | "en_negociacion"
  | "convertido"
  | "descartado";

export type OrderStatus = "pending" | "approved" | "rejected" | "expired";

export type PaymentMethod = "wompi" | "manual";

export type BusinessType =
  | "hotel"
  | "restaurante"
  | "tour_operator"
  | "agencia_viajes"
  | "otro";

// === COLECCIÓN: allies ===
// Documento ID = Firebase Auth UID
export interface Ally {
  id: string;
  uid: string; // Firebase Auth UID (same as doc ID)
  displayName: string;
  email: string;
  whatsapp: string;
  role: UserRole;
  plan: PlanTier;
  businessName: string;
  businessType: BusinessType;
  city: string;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// === COLECCIÓN: leads ===
// Formaliza la estructura que ya existe en Firestore
export interface Lead {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  interest: string;
  source: string;
  status: LeadStatus;
  assignedAllyId?: string; // Para el Broker (Bloque 2)
  createdAt: Timestamp;
}

// === COLECCIÓN: plans ===
export interface Plan {
  id: string; // "tentaculo" | "depredador" | "kraken"
  name: string;
  price: number; // COP mensual
  features: string[];
  maxLeadsPerMonth: number;
  hasBrokerAccess: boolean;
  hasSaasAccess: boolean;
  hasGrowthEngine: boolean;
  isActive: boolean;
}

// === COLECCIÓN: orders ===
export interface Order {
  id: string;
  allyId: string;
  planId: PlanTier;
  amount: number;
  currency: "COP";
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  wompiTransactionId?: string;
  createdAt: Timestamp;
  paidAt?: Timestamp;
}

// === TIPOS AUXILIARES PARA CREACIÓN (sin campos auto-generados) ===

export type CreateAllyData = Omit<Ally, "id" | "createdAt" | "updatedAt">;
export type CreateLeadData = Omit<Lead, "id" | "createdAt">;
export type CreateOrderData = Omit<Order, "id" | "createdAt">;
