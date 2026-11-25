cat << 'EOF' > src / lib / ai - router.ts
export interface AIRequest {
    systemPrompt: string;
    userPrompt: string;
    temperature?: number;
    preferLocal?: boolean;
}

export interface AIResponse {
    content: string;
    provider: "ollama" | "gemini";
    model: string;
}

const OLLAMA_URL = process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.1";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

async function callOllama(req: AIRequest): Promise<AIResponse> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
        const res = await fetch(`${OLLAMA_URL}/api/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: controller.signal,
            body: JSON.stringify({
                model: OLLAMA_MODEL,
                stream: false,
                options: { temperature: req.temperature ?? 0.4 },
                messages: [
                    { role: "system", content: req.systemPrompt },
                    { role: "user", content: req.userPrompt },
                ],
            }),
        });

        if (!res.ok) {
            throw new Error(`Ollama respondió con estado ${res.status}`);
        }

        const data = (await res.json()) as { message?: { content?: string } };
        const content = data.message?.content?.trim();
        if (!content) throw new Error("Respuesta vacía de Ollama");

        return { content, provider: "ollama", model: OLLAMA_MODEL };
    } finally {
        clearTimeout(timeout);
    }
}

async function callGemini(req: AIRequest): Promise<AIResponse> {
    if (!GEMINI_API_KEY) {
        throw new Error(
            "Falta GEMINI_API_KEY en .env.local y Ollama no está disponible.",
        );
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            system_instruction: { parts: [{ text: req.systemPrompt }] },
            contents: [{ role: "user", parts: [{ text: req.userPrompt }] }],
            generationConfig: { temperature: req.temperature ?? 0.4 },
        }),
    });

    if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Error Gemini (${res.status}): ${errText}`);
    }

    const data = (await res.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };

    const content = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!content) throw new Error("Respuesta vacía de Gemini");

    return { content, provider: "gemini", model: GEMINI_MODEL };
}

/**
 * Enrutador inteligente de Kraken OS:
 * - Si preferLocal=true (o en desarrollo con Ollama activo), intenta Ollama primero.
 * - Si falla o está en producción serverless (Vercel), cae automáticamente a Gemini.
 */
export async function runAgentCompletion(req: AIRequest): Promise<AIResponse> {
    const tryOllamaFirst =
        req.preferLocal === true || Boolean(process.env.OLLAMA_BASE_URL);

    if (tryOllamaFirst) {
        try {
            return await callOllama(req);
        } catch (err) {
            console.warn("[ai-router] Ollama no disponible, usando fallback Gemini:", err);
        }
    }

    return callGemini(req);
}
EOF