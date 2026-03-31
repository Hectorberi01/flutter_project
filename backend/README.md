# Monolith Backend — TypeScript + TypeORM + Swagger

Backend REST monolithique avec Express.js, TypeORM et PostgreSQL.

## Stack

- **Runtime** : Node.js + TypeScript
- **Framework** : Express.js
- **ORM** : TypeORM 0.3 (PostgreSQL)
- **Auth** : JWT (jsonwebtoken) + bcryptjs
- **Docs** : Swagger UI (OpenAPI 3.0)

---

## Structure

```
src/
├── config/
│   ├── database.ts       # DataSource TypeORM
│   └── swagger.ts        # Spec OpenAPI 3.0 + schemas
├── entities/
│   ├── User.ts           # Hash password @BeforeInsert
│   ├── Product.ts        # Soft delete via isActive
│   ├── CartItem.ts       # userId + productId (unique)
│   ├── Order.ts          # Status enum + cascade items
│   ├── OrderItem.ts      # Snapshot prix unitaire
│   └── Favorite.ts       # @Unique(['userId','productId'])
├── middleware/
│   └── auth.ts           # authenticate + requireAdmin
├── services/             # Logique métier
│   ├── UserService.ts
│   ├── ProductService.ts
│   ├── CartService.ts
│   ├── OrderService.ts
│   └── FavoriteService.ts
├── controllers/          # Couche HTTP (thin)
│   ├── UserController.ts
│   ├── ProductController.ts
│   ├── CartController.ts
│   ├── OrderController.ts
│   └── FavoriteController.ts
├── routes/               # Routes + JSDoc Swagger
│   ├── user.routes.ts
│   ├── product.routes.ts
│   ├── cart.routes.ts
│   ├── order.routes.ts
│   └── favorite.routes.ts
└── index.ts              # Bootstrap Express + DB
```

---

## Installation

```bash
# 1. Variables d'environnement
cp .env.example .env
# Éditer .env : DB_PASSWORD, JWT_SECRET

# 2. Dépendances
npm install

# 3. Démarrage (hot-reload)
npm run dev
```

### URLs disponibles

| URL | Description |
|-----|-------------|
| `http://localhost:3000/docs` | Swagger UI |
| `http://localhost:3000/docs.json` | Spec JSON (import Postman) |
| `http://localhost:3000/health` | Health check |
| `http://localhost:3000/api/...` | Endpoints API |

> **Note** : `synchronize: true` en développement — les tables sont créées automatiquement au démarrage.

---

## Endpoints

### Authentification (public)
| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/auth/register` | Créer un compte |
| POST | `/api/auth/login` | Se connecter → JWT |

### Utilisateurs
| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| GET | `/api/users/me` | ✅ | Mon profil |
| PATCH | `/api/users/me` | ✅ | Mettre à jour mon profil |
| GET | `/api/users` | Admin | Lister tous les utilisateurs |
| GET | `/api/users/:id` | Admin | Détail utilisateur |
| DELETE | `/api/users/:id` | Admin | Supprimer utilisateur |

### Produits
| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| GET | `/api/products` | Public | Liste paginée (search, category) |
| GET | `/api/products/:id` | Public | Détail produit |
| POST | `/api/products` | Admin | Créer produit |
| PATCH | `/api/products/:id` | Admin | Modifier produit |
| DELETE | `/api/products/:id` | Admin | Soft delete |

### Panier
| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| GET | `/api/cart` | ✅ | Mon panier + total |
| POST | `/api/cart` | ✅ | Ajouter un article |
| PATCH | `/api/cart/:id` | ✅ | Modifier quantité |
| DELETE | `/api/cart/:id` | ✅ | Supprimer article |
| DELETE | `/api/cart` | ✅ | Vider le panier |

### Commandes
| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| GET | `/api/orders` | ✅ | Mes commandes |
| POST | `/api/orders` | ✅ | Checkout depuis le panier |
| GET | `/api/orders/:id` | ✅ | Détail commande |
| PATCH | `/api/orders/:id/cancel` | ✅ | Annuler (pending/confirmed) |
| GET | `/api/orders/admin/all` | Admin | Toutes les commandes |
| PATCH | `/api/orders/:id/status` | Admin | Changer le statut |

### Favoris
| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| GET | `/api/favorites` | ✅ | Mes favoris |
| POST | `/api/favorites/toggle/:productId` | ✅ | Ajouter/retirer (toggle) |
| DELETE | `/api/favorites/:id` | ✅ | Supprimer favori |

---

## Comportements métier clés

- **Checkout** : vérifie les stocks → snapshot des prix → décrémente les stocks → vide le panier
- **Annulation** : uniquement si status `pending` ou `confirmed` → remet les stocks
- **Soft delete produit** : `isActive = false`, le produit n'apparaît plus dans les listes
- **Panier** : `addItem` incrémente si l'article existe déjà, crée sinon
- **Favoris** : `toggle` — idempotent, ajoute ou retire selon l'état actuel

---

## Build production

```bash
npm run build
node dist/index.js
```
