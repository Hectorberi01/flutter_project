import { Router } from 'express';
import { CartController } from '../controllers/CartController';
import { authenticate } from '../middleware/auth';

const router = Router();
const ctrl = new CartController();

/**
 * @swagger
 * tags:
 *   name: Panier
 *   description: Gestion du panier d'achat
 */

/**
 * @swagger
 * /cart:
 *   get:
 *     tags: [Panier]
 *     summary: Obtenir mon panier avec le total
 *     responses:
 *       200:
 *         description: Contenu du panier
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/CartItem' }
 *                 total:
 *                   type: number
 *                   description: Montant total calculé
 *   post:
 *     tags: [Panier]
 *     summary: Ajouter un produit au panier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId]
 *             properties:
 *               productId:
 *                 type: string
 *                 format: uuid
 *               quantity:
 *                 type: integer
 *                 default: 1
 *                 minimum: 1
 *     responses:
 *       201:
 *         description: Article ajouté ou quantité mise à jour
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/CartItem' }
 *       400: { description: Produit introuvable ou données invalides }
 *   delete:
 *     tags: [Panier]
 *     summary: Vider tout le panier
 *     responses:
 *       200:
 *         description: Panier vidé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 */
router.get('/cart', authenticate, ctrl.getCart.bind(ctrl));
router.post('/cart', authenticate, ctrl.addItem.bind(ctrl));
router.delete('/cart', authenticate, ctrl.clearCart.bind(ctrl));

/**
 * @swagger
 * /cart/{id}:
 *   patch:
 *     tags: [Panier]
 *     summary: Modifier la quantité d'un article (quantity=0 supprime)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: ID de l'article dans le panier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [quantity]
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 0
 *                 example: 3
 *     responses:
 *       200:
 *         description: Article mis à jour ou supprimé si quantity=0
 *       404: { description: Article introuvable }
 *   delete:
 *     tags: [Panier]
 *     summary: Supprimer un article du panier
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       204: { description: Article supprimé }
 *       404: { description: Article introuvable }
 */
router.patch('/cart/:id', authenticate, ctrl.updateItem.bind(ctrl));
router.delete('/cart/:id', authenticate, ctrl.removeItem.bind(ctrl));

export default router;
