import 'reflect-metadata';
import * as dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { AppDataSource } from './config/database';
import { swaggerSpec } from './config/swagger';

import userRoutes from './routes/user.routes';
import productRoutes from './routes/product.routes';
import cartRoutes from './routes/cart.routes';
import orderRoutes from './routes/order.routes';
import favoriteRoutes from './routes/favorite.routes';

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// ── Middlewares globaux ──────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Swagger UI ───────────────────────────────────────────────────────────────
app.use(
  '/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'Monolith API — Documentation',
    customCss: `
      .swagger-ui .topbar { background-color: #1a1a2e; }
      .swagger-ui .topbar .download-url-wrapper { display: none; }
    `,
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list',
      filter: true,
    },
  }),
);

// Spec JSON brute (utile pour Postman import)
app.get('/docs.json', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    db: AppDataSource.isInitialized ? 'connected' : 'disconnected',
  });
});

// ── Routes API ───────────────────────────────────────────────────────────────
app.use('/api', userRoutes);
app.use('/api', productRoutes);
app.use('/api', cartRoutes);
app.use('/api', orderRoutes);
app.use('/api', favoriteRoutes);

// ── 404 handler ──────────────────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: 'Route introuvable', statusCode: 404 });
});

// ── Global error handler ─────────────────────────────────────────────────────
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Erreur non gérée :', err.message);
  res.status(500).json({ message: 'Erreur interne du serveur', statusCode: 500 });
});

// ── Bootstrap ────────────────────────────────────────────────────────────────
AppDataSource.initialize()
  .then(() => {
    console.log('✅ Base de données connectée (PostgreSQL)');
    app.listen(PORT, () => {
      console.log(`\n🚀 Serveur démarré sur http://localhost:${PORT}`);
      console.log(`📚 Swagger UI     → http://localhost:${PORT}/docs`);
      console.log(`📄 Swagger JSON   → http://localhost:${PORT}/docs.json`);
      console.log(`💚 Health check   → http://localhost:${PORT}/health\n`);
    });
  })
  .catch((err: Error) => {
    console.error('❌ Impossible de se connecter à la base de données :', err.message);
    process.exit(1);
  });
