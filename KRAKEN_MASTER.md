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
- **Integración Firebase:** SDK inicializado en `src/lib/firebase.ts` (Firestore, Auth, Analytics).
- **Autenticación (Auth):** Sistema global con `zustand`, `AuthProvider`, y ruta `/login` (Correo/Contraseña).
- **Dashboard Interno:** Ruta protegida `/dashboard` exclusiva para administradores autenticados.
- **Captura de Leads (El Oráculo):** 
  - Modal dinámico (`"use client"`) activado por el botón "Iniciar Secuencia".
  - Captura: Nombre, Email, WhatsApp y Módulo de Interés.
  - Guardado en base de datos: Colección `leads` en Firestore con marca de tiempo y estado.
  - Reglas de Seguridad en BD: Buzón cerrado (Solo `create`).

---

## 4. Planes de Mejora y Siguientes Pasos (Roadmap)

### Fase de Expansión (Prioridad Media/Alta)
- [ ] **Desarrollo del AI Broker:** Integrar lógica de Agente de IA para el módulo de Turismo (respuestas automáticas, cotizaciones).
- [ ] **Sistema de Pagos:** Integrar pasarela de pagos (Stripe / Wompi / MercadoPago) para procesar las ventas del Broker.
- [ ] **Automatización WhatsApp:** Conectar los leads que entran por el formulario con una API de WhatsApp para enviar un mensaje de bienvenida automático.
- [ ] **Vista de Leads en Dashboard:** Conectar la colección `leads` de Firestore para listarlos en el `/dashboard`.

---

## 5. Historial de Cambios (Changelog)
- **v1.0.0 (Julio 2026):** Creación del documento maestro. Implementación de identidad Kraken, conexión con Firebase y módulo de captura de Leads.
