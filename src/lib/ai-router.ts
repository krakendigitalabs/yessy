import dns from "node:dns";
import net from "node:net";
import type { IntelligenceTier } from "@/types/agents";

dns.setDefaultResultOrder("ipv4first");
net.setDefaultAutoSelectFamily(false);

export interface AIRequest {
    systemPrompt: string;
    userPrompt: string;
    tier?: IntelligenceTier;
    temperature?: number;
    maxOutputTokens?: number;
}

export interface AIResponse {
    provider: "gemini";
    model: string;
    content: string;
}

const REQUEST_TIMEOUT_MS = 60000;
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1500;

function resolveGeminiModel(tier: IntelligenceTier): string {
    const globalModel = process.env.GEMINI_MODEL?.trim();
    if (globalModel) {
        return globalModel;
    }

    switch (tier) {
        case "deep":
            return (process.env.GEMINI_MODEL_DEEP || "gemini-3.8-flash").trim();
        case "fast":
            return (process.env.GEMINI_MODEL_FAST || "gemini-3.8-flash").trim();
        case "balanced":
        default:
            return (process.env.GEMINI_MODEL_BALANCED || "gemini-3.8-flash").trim();
    }
}

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableStatus(status: number): boolean {
    return status === 429 || status === 500 || status === 502 || status === 503 || status === 504;
}

export async function runAgentCompletion(req: AIRequest): Promise<AIResponse> {
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
        throw new Error("Falta GEMINI_API_KEY en el entorno (.env.local).");
    }

    const tier = req.tier ?? "balanced";
    const model = resolveGeminiModel(tier);
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

    const payload = JSON.stringify({
        systemInstruction: {
            parts: [{ text: req.systemPrompt }],
        },
        contents: [
            {
                role: "user",
                parts: [{ text: req.userPrompt }],
            },
        ],
        generationConfig: {
            temperature: req.temperature ?? 0.4,
            maxOutputTokens: req.maxOutputTokens ?? 1500,
        },
    });

    let lastError = "Error desconocido consultando Gemini.";

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        let res: Response;
        try {
            res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
                body: payload,
            });
        } catch (err) {
            const cause =
                err instanceof Error && "cause" in err && err.cause
                    ? ` (${String(err.cause)})`
                    : "";
            lastError = `No se pudo conectar con Gemini: ${err instanceof Error ? err.message : "fetch failed"}${cause}`;

            if (attempt < MAX_RETRIES) {
                await sleep(RETRY_DELAY_MS * (attempt + 1));
                continue;
            }
            throw new Error(lastError);
        }

        if (res.ok) {
            const data = (await res.json()) as {
                candidates?: Array<{
                    content?: { parts?: Array<{ text?: string }> };
                }>;
            };

            const content =
                data.candidates?.[0]?.content?.parts
                    ?.map((p) => p.text ?? "")
                    .join("")
                    .trim() ?? "";

            if (!content) {
                throw new Error("Gemini devolvió una respuesta vacía.");
            }

            return {
                provider: "gemini",
                model,
                content,
            };
        }

        const errText = await res.text();
        lastError = `Error Gemini (${res.status}): ${errText}`;

        if (isRetryableStatus(res.status) && attempt < MAX_RETRIES) {
            await sleep(RETRY_DELAY_MS * (attempt + 1));
            continue;
        }

        throw new Error(lastError);
    }

    throw new Error(lastError);
}