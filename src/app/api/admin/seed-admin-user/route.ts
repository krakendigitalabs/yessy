import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

// ═══════════════════════════════════════════════════════
// POST /api/admin/seed-admin-user
// Crea cualquier perfil en la colección allies usando
// Firebase Admin SDK (bypasea las security rules).
//
// ⚠️  SEGURIDAD: Protegido por SEED_SECRET_TOKEN en .env.local
// ═══════════════════════════════════════════════════════

export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      token?: string;
      uid: string;
      email: string;
      displayName?: string;
      whatsapp?: string;
      role?: "admin" | "ally" | "tourist";
      plan?: "tentaculo" | "depredador" | "kraken" | "ninguno";
      businessName?: string;
      businessType?: string;
      city?: string;
    };

    // Verificar token secreto
    const secretToken = process.env.SEED_SECRET_TOKEN;
    if (!secretToken || body.token !== secretToken) {
      return NextResponse.json(
        { error: "Unauthorized. Token inválido o ausente." },
        { status: 401 }
      );
    }

    const {
      uid,
      email,
      displayName,
      whatsapp,
      role = "admin",
      plan = "kraken",
      businessName,
      businessType,
      city,
    } = body;

    if (!uid || !email) {
      return NextResponse.json(
        { error: "uid y email son requeridos." },
        { status: 400 }
      );
    }

    const docRef = getAdminDb().collection("allies").doc(uid);

    // Verificar si ya existe
    const existing = await docRef.get();
    if (existing.exists) {
      return NextResponse.json(
        { message: "El documento ya existe.", data: existing.data() },
        { status: 200 }
      );
    }

    const allyData = {
      uid,
      displayName: displayName ?? email,
      email,
      whatsapp: whatsapp ?? "+57",
      role,
      plan,
      businessName: businessName ?? "Sin registrar",
      businessType: businessType ?? "otro",
      city: city ?? "Colombia",
      isActive: true,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    await docRef.set(allyData);

    console.log(`✅ [seed-ally] ${role} creado: allies/${uid}`);

    return NextResponse.json(
      { message: `✅ ${role} creado exitosamente en Firestore.`, uid, role },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("❌ [seed-ally] Error:", message);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
