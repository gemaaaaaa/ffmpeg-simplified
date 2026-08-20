import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { generateFfmpegCommand } from './server/groq.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProd = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 3000;

async function createServer() {
  const app = express();

  app.use(express.json({ limit: '64kb' }));

  app.post('/api/v1/ffmpeg/generate', async (req, res) => {
    const request = req.body?.request;

    if (typeof request !== 'string' || !request.trim()) {
      return res.status(400).json({ error: 'Missing "request" in request body' });
    }

    try {
      const command = await generateFfmpegCommand(request);
      res.json({ command });
    } catch (err) {
      res.status(500).json({ error: err.message || 'Failed to generate command' });
    }
  });

  if (isProd) {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('/{*splat}', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

createServer();