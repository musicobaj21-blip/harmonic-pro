import express from 'express';
import type { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // JSON Body parser con límite suficiente para catálogos completos
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Asegurar que el directorio data exista para la base de datos
  const dataDir = path.resolve(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const dbFilePath = path.join(dataDir, 'catalog.json');

  // API Route: POST /api/guardar-catalogo-xml
  app.post('/api/guardar-catalogo-xml', (req: Request, res: Response) => {
    try {
      const payload = req.body;
      const songs = Array.isArray(payload) ? payload : (payload && Array.isArray(payload.songs) ? payload.songs : null);

      if (!songs) {
        return res.status(400).json({
          success: false,
          error: 'El cuerpo de la petición debe ser un arreglo de canciones (JSON array) o un objeto con propiedad songs.'
        });
      }

      // Guardar el catálogo limpio en el archivo de base de datos
      fs.writeFileSync(dbFilePath, JSON.stringify(songs, null, 2), 'utf-8');

      console.log(`[API] Guardadas exitosamente ${songs.length} canciones limpias en la base de datos (${dbFilePath}).`);

      return res.status(200).json({
        success: true,
        message: 'Catálogo guardado exitosamente en la base de datos.',
        count: songs.length,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('[API Error] Error guardando catálogo en DB:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Error interno del servidor al guardar en DB'
      });
    }
  });

  // API Route: GET /api/obtener-catalogo-xml (para recuperar el catálogo persistido)
  app.get('/api/obtener-catalogo-xml', (_req: Request, res: Response) => {
    try {
      if (fs.existsSync(dbFilePath)) {
        const raw = fs.readFileSync(dbFilePath, 'utf-8');
        const songs = JSON.parse(raw);
        return res.status(200).json({ success: true, songs, count: songs.length });
      }
      return res.status(200).json({ success: true, songs: [], count: 0 });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // Integración de Vite: middleware en desarrollo o archivos estáticos en producción
  const isProduction = process.env.NODE_ENV === 'production';
  const distPath = path.resolve(process.cwd(), 'dist');

  if (isProduction && fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor Linus Studio Pro escuchando en http://0.0.0.0:${PORT}`);
  });
}

startServer();
