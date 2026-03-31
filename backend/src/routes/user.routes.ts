import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();
const ctrl = new UserController();

/**
 * @swagger
 * tags:
 *   name: Utilisateurs
 *   description: Authentification et gestion des comptes utilisateurs
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Utilisateurs]
 *     summary: Créer un nouveau compte
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Hector Dupont
 *               email:
 *                 type: string
 *                 format: email
 *                 example: hector@example.com
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: secret123
 *               phone:
 *                 type: string
 *                 example: "+22997000000"
 *     responses:
 *       201:
 *         description: Compte créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 user: { $ref: '#/components/schemas/User' }
 *       400:
 *         description: Email déjà utilisé ou données invalides
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post('/auth/register', ctrl.register.bind(ctrl));

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Utilisateurs]
 *     summary: Se connecter et obtenir un token JWT
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: hector@example.com
 *               password:
 *                 type: string
 *                 example: secret123
 *     responses:
 *       200:
 *         description: Connexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT Bearer token
 *                 user: { $ref: '#/components/schemas/User' }
 *       401:
 *         description: Identifiants invalides
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post('/auth/login', ctrl.login.bind(ctrl));

/**
 * @swagger
 * /users/me:
 *   get:
 *     tags: [Utilisateurs]
 *     summary: Obtenir mon profil
 *     responses:
 *       200:
 *         description: Profil de l'utilisateur connecté
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/User' }
 *       401:
 *         description: Non authentifié
 *   patch:
 *     tags: [Utilisateurs]
 *     summary: Mettre à jour mon profil
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string, example: Hector B. }
 *               phone: { type: string, example: "+22997111111" }
 *               address: { type: string, example: "Cotonou, Bénin" }
 *     responses:
 *       200:
 *         description: Profil mis à jour
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/User' }
 */
router.get('/users/me', authenticate, ctrl.getMe.bind(ctrl));
router.patch('/users/me', authenticate, ctrl.updateMe.bind(ctrl));

/**
 * @swagger
 * /users:
 *   get:
 *     tags: [Utilisateurs]
 *     summary: Lister tous les utilisateurs (admin)
 *     responses:
 *       200:
 *         description: Liste complète des utilisateurs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/User' }
 *       403: { description: Accès refusé }
 */
router.get('/users', authenticate, requireAdmin, ctrl.getAll.bind(ctrl));

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     tags: [Utilisateurs]
 *     summary: Obtenir un utilisateur par ID (admin)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *         description: UUID de l'utilisateur
 *     responses:
 *       200:
 *         description: Utilisateur trouvé
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/User' }
 *       404: { description: Utilisateur introuvable }
 *   delete:
 *     tags: [Utilisateurs]
 *     summary: Supprimer un utilisateur (admin)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       204: { description: Utilisateur supprimé }
 *       404: { description: Introuvable }
 */
router.get('/users/:id', authenticate, requireAdmin, ctrl.getById.bind(ctrl));
router.delete('/users/:id', authenticate, requireAdmin, ctrl.delete.bind(ctrl));

export default router;
