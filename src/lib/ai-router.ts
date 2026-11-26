import dns from "node:dns";
import net from "node:net";

dns.setDefaultResultOrder("ipv4first");
net.setDefaultAutoSelectFamily(false);

export interface AIRequest {
    systemPrompt: string;
    userPrompt: string;
}

export interface AIResponse {
    content: string;
    provider: "gemini";
    model: string;
}

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";
const MAX_RETRIES = 3;

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function runAgentCompletion(req: AIRequest): Promise<AIResponse> {
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
        throw new Error("Falta GEMINI_API_KEY en .env.local");
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
    const payload = JSON.stringify({
        system_instruction: {
            parts: [{ text: req.systemPrompt }],
        },
        contents: [
            {
                role: "user",
                parts: [{ text: req.userPrompt }],
            },
        ],
        generationConfig: {
            temperature: 0.7,
        },
    });

    let lastError = "Error desconocido consultando Gemini.";

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        let res: Response;
        try {
            res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                signal: AbortSignal.timeout(60000),
                body: payload,
            });
        } catch (err) {
            const cause =
                err instanceof Error && "cause" in err && err.cause
                    ? ` (${String(err.cause)})`
                    : "";
            lastError = `No se pudo conectar con Gemini: ${err instanceof Error ? err.message : "fetch failed"}${cause}`;
            if (attempt < MAX_RETRIES) {
                await sleep(1500 * attempt);
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

            return { content, provider: "gemini", model: GEMINI_MODEL };
        }

        const errText = await res.text();
        lastError = `Error Gemini (${res.status}): ${errText}`;

        // Si es saturación temporal (503) o límite momentáneo (429), reintenta automáticamente
        if ((res.status === 503 || res.status === 429) && attempt < MAX_RETRIES) {
            await sleep(2000 * attempt);
            continue;
        }

        throw new Error(lastError);
    }

    throw new Error(lastError);
}