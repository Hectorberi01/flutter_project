import { Router } from 'express';
import { ProductController } from '../controllers/ProductController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();
const ctrl = new ProductController();

/**
 * @swagger
 * tags:
 *   name: Produits
 *   description: Catalogue produits
 */

/**
 * @swagger
 * /products:
 *   get:
 *     tags: [Produits]
 *     summary: Lister les produits (paginé, filtrable)
 *     security: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *         description: Filtrer par catégorie
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Recherche par nom (ILIKE)
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Liste paginée de produits
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 products:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Product' }
 *                 total: { type: integer }
 *                 page: { type: integer }
 *                 limit: { type: integer }
 *                 pages: { type: integer }
 *   post:
 *     tags: [Produits]
 *     summary: Créer un produit (admin)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, price]
 *             properties:
 *               name: { type: string, example: "Boubou en wax" }
 *               description: { type: string }
 *               price: { type: number, example: 15000 }
 *               stock: { type: integer, example: 50 }
 *               category: { type: string, example: "Vêtements" }
 *               imageUrl: { type: string }
 *     responses:
 *       201:
 *         description: Produit créé
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Product' }
 *       400: { description: Données invalides }
 *       403: { description: Accès refusé }
 */
router.get('/products', ctrl.getAll.bind(ctrl));
router.post('/products', authenticate, requireAdmin, ctrl.create.bind(ctrl));

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     tags: [Produits]
 *     summary: Obtenir un produit par ID
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Produit trouvé
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Product' }
 *       404: { description: Produit introuvable }
 *   patch:
 *     tags: [Produits]
 *     summary: Mettre à jour un produit (admin)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               price: { type: number }
 *               stock: { type: integer }
 *               category: { type: string }
 *               imageUrl: { type: string }
 *     responses:
 *       200:
 *         description: Produit mis à jour
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Product' }
 *       404: { description: Produit introuvable }
 *   delete:
 *     tags: [Produits]
 *     summary: Supprimer un produit — soft delete (admin)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       204: { description: Produit désactivé }
 *       404: { description: Produit introuvable }
 */
router.get('/products/:id', ctrl.getById.bind(ctrl));
router.patch('/products/:id', authenticate, requireAdmin, ctrl.update.bind(ctrl));
router.delete('/products/:id', authenticate, requireAdmin, ctrl.delete.bind(ctrl));

export default router;
