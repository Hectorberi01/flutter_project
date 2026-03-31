import { Router } from 'express';
import { OrderController } from '../controllers/OrderController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();
const ctrl = new OrderController();

/**
 * @swagger
 * tags:
 *   name: Commandes
 *   description: Gestion des commandes
 */

/**
 * @swagger
 * /orders:
 *   get:
 *     tags: [Commandes]
 *     summary: Mes commandes
 *     responses:
 *       200:
 *         description: Liste des commandes de l'utilisateur connecté
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Order' }
 *   post:
 *     tags: [Commandes]
 *     summary: Passer une commande depuis le panier (checkout)
 *     description: >
 *       Crée une commande à partir du panier courant.
 *       Vérifie les stocks, snapshot les prix, décrémente les stocks, vide le panier.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [shippingAddress]
 *             properties:
 *               shippingAddress:
 *                 type: string
 *                 example: "123 Rue du Commerce, Cotonou, Bénin"
 *               notes:
 *                 type: string
 *                 example: "Livrer après 18h"
 *     responses:
 *       201:
 *         description: Commande créée avec succès
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Order' }
 *       400:
 *         description: Panier vide ou stock insuffisant
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get('/orders', authenticate, ctrl.getMyOrders.bind(ctrl));
router.post('/orders', authenticate, ctrl.checkout.bind(ctrl));

/**
 * @swagger
 * /orders/admin/all:
 *   get:
 *     tags: [Commandes]
 *     summary: Toutes les commandes — tous utilisateurs (admin)
 *     responses:
 *       200:
 *         description: Liste complète des commandes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Order' }
 *       403: { description: Accès refusé }
 */
router.get('/orders/admin/all', authenticate, requireAdmin, ctrl.getAllOrders.bind(ctrl));

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     tags: [Commandes]
 *     summary: Détail d'une commande
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Commande trouvée
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Order' }
 *       404: { description: Commande introuvable }
 */
router.get('/orders/:id', authenticate, ctrl.getOrderById.bind(ctrl));

/**
 * @swagger
 * /orders/{id}/status:
 *   patch:
 *     tags: [Commandes]
 *     summary: Changer le statut d'une commande (admin)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, shipped, delivered, cancelled]
 *     responses:
 *       200:
 *         description: Statut mis à jour
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Order' }
 *       400: { description: Données invalides }
 */
router.patch('/orders/:id/status', authenticate, requireAdmin, ctrl.updateStatus.bind(ctrl));

/**
 * @swagger
 * /orders/{id}/cancel:
 *   patch:
 *     tags: [Commandes]
 *     summary: Annuler sa commande (pending ou confirmed uniquement)
 *     description: Annule la commande et remet les stocks à jour automatiquement.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Commande annulée
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Order' }
 *       400: { description: Annulation impossible (déjà expédiée, livrée...) }
 */
router.patch('/orders/:id/cancel', authenticate, ctrl.cancel.bind(ctrl));

export default router;
