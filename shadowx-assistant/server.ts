import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

const apiKey = process.env.GEMINI_API_KEY || '';

const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const ROBLOX_SYSTEM_INSTRUCTION = `Eres SHADOWX ASSISTANT, una Inteligencia Artificial de élite especializada en Roblox Studio, programación Luau y arquitectura de videojuegos, desarrollada para ShadowX Studios.

Tu propósito principal es guiar a desarrolladores (desde principiantes hasta avanzados) a crear juegos de calidad profesional en Roblox Studio, resolviendo dudas de código, optimización, físicas, replicación servidor-cliente, interfaces (GUI) y depuración de errores.

DIRECTRICES CLAVE Y REGLAS OBLIGATORIAS:

1. IDIOMA:
- Responde SIEMPRE en ESPAÑOL, de forma técnica, moderna, clara y motivadora.
- Mantén los nombres propios de Roblox Studio en inglés tal como aparecen en el motor (ej. ReplicatedStorage, ServerScriptService, StarterGui, RemoteEvent, TweenService, ContextActionService, ProximityPrompt).

2. FORMATO EXACTO PARA SCRIPTS:
Cada vez que generes o corrijas código en Luau, DEBES incluir obligatoriamente una ficha técnica antes del código:
- **Tipo de Script**: Indicar si es \`Script\` (Servidor), \`LocalScript\` (Cliente) o \`ModuleScript\`.
- **Ubicación en Explorer**: Ruta exacta paso a paso (ej: \`Explorer > ServerScriptService > DataStoreManager\`).
- **Instancias Requeridas**: Si se necesita crear RemoteEvents, carpetas (Folders), Sounds o Animations (ej: Crear un RemoteEvent llamado "ComprarItemEvent" en ReplicatedStorage).
- **Código Luau**: Código completo, con tipado moderno (--!strict o --!nonstrict según aplique), comentarios claros, variables descriptivas y sin omitir partes críticas.

3. BUENAS PRÁCTICAS DE LUAU Y ROBLOX MODERNO:
- NUNCA uses funciones obsoletas/deprecated:
  - Usa \`task.wait()\` en lugar de \`wait()\`.
  - Usa \`task.spawn()\` o \`task.defer()\` en lugar de \`spawn()\`.
  - Usa \`task.delay()\` en lugar de \`delay()\`.
- Replicación y Seguridad Servidor-Cliente:
  - "Never trust the client" (Nunca confíes en el cliente).
  - Los clientes solo envían solicitudes; el servidor verifica monedas, cooldowns, munición, nivel y calcula daño.
  - No permitas que el cliente envíe valores como "cantidad de daño" o "precio".
- DataStores y Pcalls:
  - Usa \`pcall\` para llamadas a \`DataStoreService\` o servicios HTTP.
  - Implementa manejo de fallos para evitar pérdida de datos del jugador.
- Optimización y Limpieza de Memoria:
  - Desconecta conexiones (\`:Disconnect()\`) o usa \`Maid\` / \`Janitor\` / \`Trove\` o almacena conexiones en tablas si los objetos se destruyen.
  - Usa \`CollectionService\` (Tags) para comportamientos modulares en lugar de duplicar scripts en muchas partes.

4. ANÁLISIS DE IMÁGENES / CAPTURAS:
- Si el usuario adjunta una captura de Roblox Studio (Output window, ventana de Explorer, editor de código con subrayados rojos, jerarquía o vista 3D), analízala con máxima atención.
- Extrae el mensaje de error textual exacto (ej. "attempt to index nil with...", "Infinite yield possible on...", "stack begin / stack end").
- Señala el número de línea exacto y el archivo que causó el error.
- Explica POR QUÉ ocurre el error y ofrece la solución corregida lista para copiar y pegar.

5. TONO:
- Profesional, tecnológico, preciso, ágil y al grano.
- Marca oficial: "ShadowX Studios".
`;

async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3, initialDelay = 1000): Promise<T> {
  let delay = initialDelay;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      const isTransient =
        err?.status === 503 ||
        err?.status === 429 ||
        err?.message?.includes('503') ||
        err?.message?.includes('high demand') ||
        err?.message?.includes('UNAVAILABLE') ||
        err?.message?.includes('RESOURCE_EXHAUSTED');

      if (attempt < maxRetries && isTransient) {
        console.warn(`[Gemini API] Reintentando tras error temporal (${attempt}/${maxRetries}) en ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 1.5;
      } else {
        throw err;
      }
    }
  }
  throw new Error('No se pudo completar la solicitud tras varios reintentos.');
}

// Status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    assistant: 'ShadowX Assistant',
    brand: 'ShadowX Studios',
    hasKey: Boolean(apiKey && apiKey !== 'MY_GEMINI_API_KEY'),
    model: 'gemini-3.8-flash',
  });
});

// Chat endpoint with stream support (Server-Sent Events)
app.post('/api/chat/stream', async (req, res) => {
  try {
    const { message, image, history = [] } = req.body;

    if (!message && !image) {
      return res.status(400).json({ error: 'Debes proporcionar un mensaje o una imagen.' });
    }

    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      return res.status(500).json({
        error: 'No se ha configurado la clave GEMINI_API_KEY en las variables de entorno.',
      });
    }

    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    // Prepare contents
    const contents: any[] = [];

    // Add previous turns
    for (const item of history) {
      if (item.role === 'user') {
        const parts: any[] = [];
        if (item.image && item.image.data && item.image.mimeType) {
          parts.push({
            inlineData: {
              mimeType: item.image.mimeType,
              data: item.image.data,
            },
          });
        }
        if (item.content) {
          parts.push({ text: item.content });
        }
        if (parts.length > 0) {
          contents.push({ role: 'user', parts });
        }
      } else if (item.role === 'assistant' && item.content) {
        contents.push({
          role: 'model',
          parts: [{ text: item.content }],
        });
      }
    }

    // Current turn parts
    const currentParts: any[] = [];
    if (image && image.data && image.mimeType) {
      currentParts.push({
        inlineData: {
          mimeType: image.mimeType,
          data: image.data,
        },
      });
    }

    if (message) {
      currentParts.push({ text: message });
    } else {
      currentParts.push({
        text: 'Por favor analiza esta captura de pantalla de Roblox Studio. Detecta si hay errores en el Output, revisa la jerarquía o el código visible y dime qué está sucediendo y cómo resolverlo.',
      });
    }

    contents.push({ role: 'user', parts: currentParts });

    const streamResponse = await withRetry(() =>
      ai.models.generateContentStream({
        model: 'gemini-3.8-flash',
        contents: contents,
        config: {
          systemInstruction: ROBLOX_SYSTEM_INSTRUCTION,
        },
      })
    );

    for await (const chunk of streamResponse) {
      const text = chunk.text;
      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (error: any) {
    console.error('Error en /api/chat/stream:', error);
    let errorMessage = error?.message || 'Error procesando la solicitud con Gemini';
    if (errorMessage.includes('high demand') || errorMessage.includes('503')) {
      errorMessage = 'El modelo de IA está experimentando alta demanda temporal en los servidores de Google. Por favor, reintenta en unos instantes.';
    }
    res.write(`data: ${JSON.stringify({ error: errorMessage })}\n\n`);
    res.end();
  }
});

// Non-streaming chat fallback endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, image, history = [] } = req.body;

    if (!message && !image) {
      return res.status(400).json({ error: 'Debes proporcionar un mensaje o una imagen.' });
    }

    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      return res.status(500).json({
        error: 'No se ha configurado la clave GEMINI_API_KEY en las variables de entorno.',
      });
    }

    const contents: any[] = [];

    for (const item of history) {
      if (item.role === 'user') {
        const parts: any[] = [];
        if (item.image && item.image.data && item.image.mimeType) {
          parts.push({
            inlineData: {
              mimeType: item.image.mimeType,
              data: item.image.data,
            },
          });
        }
        if (item.content) {
          parts.push({ text: item.content });
        }
        if (parts.length > 0) {
          contents.push({ role: 'user', parts });
        }
      } else if (item.role === 'assistant' && item.content) {
        contents.push({
          role: 'model',
          parts: [{ text: item.content }],
        });
      }
    }

    const currentParts: any[] = [];
    if (image && image.data && image.mimeType) {
      currentParts.push({
        inlineData: {
          mimeType: image.mimeType,
          data: image.data,
        },
      });
    }
    if (message) {
      currentParts.push({ text: message });
    } else {
      currentParts.push({
        text: 'Por favor analiza esta captura de pantalla de Roblox Studio. Detecta si hay errores en el Output, revisa la jerarquía o el código visible y dime qué está sucediendo y cómo resolverlo.',
      });
    }

    contents.push({ role: 'user', parts: currentParts });

    const response = await withRetry(() =>
      ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: contents,
        config: {
          systemInstruction: ROBLOX_SYSTEM_INSTRUCTION,
        },
      })
    );

    const reply = response.text || '';
    res.json({ reply });
  } catch (error: any) {
    console.error('Error en /api/chat:', error);
    let errorMsg = error?.message || 'Error al comunicarse con Gemini AI.';
    if (errorMsg.includes('high demand') || errorMsg.includes('503')) {
      errorMsg = 'El modelo de IA está experimentando alta demanda momentánea. Por favor, reintenta en unos instantes.';
    }
    res.status(500).json({
      error: errorMsg,
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ShadowX Assistant backend listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
