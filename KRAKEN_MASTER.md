# 🐙 Yessy Kraken Digital Labs - Documento Maestro

> **ESTADO:** Activo | **VERSIÓN:** 1.0.0
> **REGLA DE ORO:** Este documento es la fuente de la verdad absoluta del proyecto. Cualquier agente, desarrollador o IA que trabaje en este ecosistema **DEBE** leer este archivo antes de modificar código y **DEBE** actualizarlo cada vez que se implemente una nueva funcionalidad o se definan nuevos planes de mejora.

---

## 1. Identidad y Propósito
**Yessy Kraken** es el "Oráculo de Automatización & Riqueza". Una plataforma premium que despliega Agentes de Inteligencia Artificial y sistemas SaaS para transformar la operación de negocios locales en ecosistemas altamente rentables 24/7.

**Diseño Premium (Fantasía Digital):**
- Fondo: Negro ultra profundo (`#050505`) y Oscuro (`#0A0A0A`)
- Acentos: Oro Metálico (`#D4AF37`) y Oro Claro (`#F3E5AB`)
- Detalles: Textos blancos (`#F8F9FA`), sombras doradas brillantes (`shadow-gold-glow`).

---

## 2. Stack Tecnológico
- **Core:** Next.js (App Router), React, TypeScript.
- **Estilos:** Tailwind CSS v4 (Configurado vía `@theme inline` en `globals.css`).
- **Backend & DB:** Firebase (Firestore, Authentication, Analytics).
- **Despliegue:** Vercel (Producción vía GitHub `main`).

---

## 3. Arquitectura Actual

### Módulos Principales (Landing)
1. **Turismo AI Broker:** Agente inteligente que cierra ventas de paquetes turísticos y procesa pagos.
2. **Dev-Factory SaaS:** Sistemas de gestión (PMS, Restaurantes) bajo modelo MRR.
3. **Wealth Oracle:** Auditoría tecnológica premium para detección de fugas operativas.

### Funcionalidades Implementadas
- **UI Base Premium:** Configuración de Tailwind v4 y variables CSS corporativas.
- **Landing Page Interactiva:** Tarjetas con efecto hover (brillo dorado) y diseño full responsive.
- **Integración Firebase:** SDK inicializado en `src/lib/firebase.ts` (Firestore, Auth, Analytics, GoogleAuthProvider).
- **Autenticación (Auth):** Sistema global con `zustand`, `AuthProvider`, y soporte para Correo/Contraseña y **Google Sign-In**.
- **Dashboard Interno:** Ruta protegida `/dashboard` exclusiva para administradores autenticados.
- **Captura de Leads (El Oráculo):** 
  - Modal dinámico (`"use client"`) activado por el botón "Iniciar Secuencia".
  - Captura: Nombre, Email, WhatsApp y Módulo de Interés.
  - Guardado en base de datos: Colección `leads` en Firestore con marca de tiempo y estado.
  - Reglas de Seguridad en BD: Buzón cerrado (Solo `create`).
- **Vista de Leads en Dashboard:** Tabla de datos en `/dashboard` que extrae los leads de Firestore en tiempo real, ordenados por fecha.

### Bloque 1: Cimientos de Datos y Autorización (Implementado v1.1.0)
- **Modelos de Datos Tipados:** `src/types/models.ts` — Interfaces TypeScript para `Ally`, `Lead`, `Plan`, `Order` con tipos estrictos (`UserRole`, `PlanTier`, `LeadStatus`, `OrderStatus`).
- **Capa CRUD Tipada:** `src/lib/firestore-helpers.ts` — Funciones helper para todas las colecciones. Se añadió soporte de "Fallback" (`getAllyByEmail`) para evitar fallos de UID al usar Google Sign-In.
- **Auth Store Extendido:** `src/store/authStore.ts` — Incluye perfil de aliado (`Ally`) con helpers `isAdmin()`, `isAlly()`, `hasProfile()`.
- **Plan Store:** `src/store/planStore.ts` — Estado global del plan activo con `canAccessFeature()` para gating de features.
- **AuthProvider Mejorado:** Carga perfil de Firestore y plan activo automáticamente. Evita race conditions de renderizado en Next.js gestionando el estado global de carga (`setLoading`). Incluye fallback por email para Google Sign-In.
- **Route Groups (Next.js):**
  - `src/app/(public)/` — Rutas públicas (`/login`, `/kraken`). Ambas incluyen integración con Google Sign-In.
  - `src/app/(protected)/` — Layout protegido con verificación de auth + perfil. Contiene `/dashboard` y `/gateway`.
  - **Pantalla de Diagnóstico:** Inyectada en `(protected)/layout.tsx` para detectar UIDs erróneos y guiar al administrador en la configuración de la base de datos.
- **Firestore Security Rules:** `firestore.rules` — RBAC completo. Soporte añadido para la validación por correo electrónico (`isOwnerByEmail()`).
- **Seed Script Planes:** `scripts/seed-plans.ts` — Script para poblar los 3 planes iniciales (Tentáculo $149K, Depredador $349K, Kraken $599K COP/mes).

### Bloque 1.2: Firebase Admin SDK & Seed de Admin (Implementado v1.1.2)
- **Firebase Admin SDK:** `src/lib/firebase-admin.ts` — Inicialización del SDK de servidor usando `FIREBASE_SERVICE_ACCOUNT_JSON`. Bypasea las Firestore Security Rules completamente para operaciones de administración.
- **API Route de Seed:** `src/app/api/admin/seed-admin-user/route.ts` — Endpoint `POST` protegido por `SEED_SECRET_TOKEN` para crear el documento admin en Firestore sin necesidad de abrir las reglas de seguridad.
- **Seed Script Admin:** `scripts/seed-admin.ts` — Script alternativo para crear el perfil admin (requiere abrir las rules temporalmente).
- **Variables de entorno añadidas:** `FIREBASE_SERVICE_ACCOUNT_JSON` (Service Account Key) y `SEED_SECRET_TOKEN` en `.env.local`.

---

## 4. Planes de Mejora y Siguientes Pasos (Roadmap)

### Fase de Expansión — Bloque 2: Motores de Ejecución (Los Tentáculos)
- [x] **Feature Broker:** `src/features/broker/` — Motor de matchmaking "Indrive Turístico". Dashboard admin con asignación de leads, portal del aliado, listener en tiempo real.
- [ ] **Feature SaaS Factory:** `src/features/saas/` — Lógica de despliegue y gestión de suscripciones.
- [ ] **Feature Growth Engine:** `src/features/growth/` — Agente Ollama para generación de contenido (Copys, descripciones).
- [ ] **API Routes Ollama:** `src/app/api/ollama/` — Endpoint para inteligencia central.

### Fase de Expansión — Bloque 3: Capa Financiera y Dashboards
- [ ] **Integración Wompi:** Generación de links de pago dinámicos.
- [ ] **Webhooks de Pago:** Listener que cambia estado de la orden en Firestore.
- [ ] **Dashboard de Aliado:** Visualización de leads y métricas de impacto.
- [ ] **Testing E2E:** Flujo completo Lead → Asignación → Orden → Pago.

---

## 5. Estructura de Carpetas
```
src/
├── app/
│   ├── (public)/login/page.tsx
│   ├── (public)/kraken/page.tsx
│   ├── (protected)/
│   │   ├── layout.tsx          # Guardia de auth + Pantalla de Diagnóstico
│   │   ├── dashboard/page.tsx  # Panel Admin (leads + métricas + asignación)
│   │   ├── portal/page.tsx     # Portal del Aliado (leads propios)
│   │   └── gateway/page.tsx    # Router por rol (admin→dashboard, ally→portal)
│   ├── api/admin/
│   │   └── seed-admin-user/route.ts  # Seed admin vía Admin SDK
│   ├── globals.css
│   ├── layout.tsx              # Root Layout
│   └── page.tsx                # Landing pública
├── components/
│   └── AuthProvider.tsx        # Sincroniza Auth + Perfil + Race Condition fix
├── features/
│   └── broker/                 # Feature Broker (Indrive Turístico)
│       ├── components/
│       │   ├── AssignLeadModal.tsx # Modal admin para asignar leads
│       │   ├── LeadCard.tsx        # Tarjeta de lead para el aliado
│       │   └── LeadStatusBadge.tsx # Badge de colores por estado
│       └── hooks/
│           ├── useLeads.ts         # Listener tiempo real (admin) / getDocs (ally)
│           └── useAllies.ts        # Listener aliados activos (admin)
├── lib/
│   ├── firebase.ts             # SDK Firebase (+ Google Auth)
│   ├── firebase-admin.ts       # Admin SDK (bypasea security rules)
│   └── firestore-helpers.ts    # CRUD tipado (+ assignLeadToAlly, updateLeadStatus)
├── store/
│   ├── authStore.ts            # User + Profile + Roles
│   └── planStore.ts            # Plan activo + Feature gating
└── types/
    └── models.ts               # Interfaces centralizadas
```

---

## 6. Historial de Cambios (Changelog)
- **v1.2.0 (Julio 2026):** Bloque 2 implementado — Feature Broker completo: `AssignLeadModal`, `LeadCard`, `LeadStatusBadge`, hooks `useLeads`/`useAllies` con listeners en tiempo real. Portal del aliado `/portal`. Dashboard admin mejorado con 4 métricas, columna de asignación y actualización en vivo.
- **v1.1.2 (Julio 2026):** Firebase Admin SDK integrado. API Route de seed. Fallback email en AuthProvider. UID desincronizado resuelto.
- **v1.1.1 (Julio 2026):** Google Sign-In, Pantalla de diagnóstico, fallback email, Race Conditions.
- **v1.1.0 (Julio 2026):** Bloque 1 — Modelos de datos, RBAC, Route Groups, Firestore Rules, Stores.
- **v1.0.0 (Julio 2026):** Creación del proyecto. Landing, Firebase, captura de Leads.

