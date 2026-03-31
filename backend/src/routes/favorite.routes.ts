import { Router } from 'express';
import { FavoriteController } from '../controllers/FavoriteController';
import { authenticate } from '../middleware/auth';

const router = Router();
const ctrl = new FavoriteController();

/**
 * @swagger
 * tags:
 *   name: Favoris
 *   description: Gestion des produits favoris
 */

/**
 * @swagger
 * /favorites:
 *   get:
 *     tags: [Favoris]
 *     summary: Lister mes produits favoris
 *     responses:
 *       200:
 *         description: Liste des favoris de l'utilisateur connecté
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Favorite' }
 */
router.get('/favorites', authenticate, ctrl.getAll.bind(ctrl));

/**
 * @swagger
 * /favorites/toggle/{productId}:
 *   post:
 *     tags: [Favoris]
 *     summary: Ajouter ou retirer un produit des favoris (toggle)
 *     description: Si le produit est déjà en favori, il est retiré. Sinon, il est ajouté.
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: UUID du produit
 *     responses:
 *       200:
 *         description: État du favori après l'opération
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 added:
 *                   type: boolean
 *                   description: true = ajouté, false = retiré
 *                 message: { type: string }
 *       400: { description: Produit introuvable }
 */
router.post('/favorites/toggle/:productId', authenticate, ctrl.toggle.bind(ctrl));

/**
 * @swagger
 * /favorites/{id}:
 *   delete:
 *     tags: [Favoris]
 *     summary: Supprimer un favori par son ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: UUID du favori (pas du produit)
 *     responses:
 *       204: { description: Favori supprimé }
 *       404: { description: Favori introuvable }
 */
router.delete('/favorites/:id', authenticate, ctrl.remove.bind(ctrl));

export default router;
