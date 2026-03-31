# Monolith Admin — React TSX

Tableau de bord d'administration connecté au backend monolithe.

## Stack

- **React 18** + **TypeScript**
- **Vite** — bundler ultra-rapide
- **React Router v6** — navigation SPA avec guards auth
- **Axios** — client HTTP avec intercepteur JWT auto
- **Recharts** — graphiques (PieChart, AreaChart)
- **Lucide React** — icônes
- **DM Sans + DM Mono** — typographie

---

## Structure

```
src/
├── api/
│   └── index.ts          # Axios client + toutes les méthodes API
├── components/
│   ├── layout/
│   │   └── AppLayout.tsx # Sidebar + Topbar
│   └── ui/
│       └── index.tsx     # Badge, Button, Card, Input, Modal, Table, Toast...
├── hooks/
│   └── useAuth.tsx       # AuthContext + Provider
├── pages/
│   ├── LoginPage.tsx     # Connexion admin
│   ├── DashboardPage.tsx # Métriques + graphiques + dernières commandes
│   ├── ProductsPage.tsx  # CRUD produits complet
│   ├── OrdersPage.tsx    # Liste + changement statut
│   └── UsersPage.tsx     # Liste + suppression
├── types/
│   └── index.ts          # Interfaces TypeScript
├── App.tsx               # Router + guards auth
├── main.tsx
└── index.css             # Variables CSS + animations
```

---

## Installation

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer l'URL de l'API
cp .env.example .env
# Éditer .env si nécessaire (défaut : http://localhost:3000/api)

# 3. Lancer en développement
npm run dev
# → http://localhost:5173
```

> Le proxy Vite redirige automatiquement `/api/*` vers `http://localhost:3000` en développement — pas de problème CORS.

---

## Build production

```bash
npm run build
npm run preview
```

---

## Fonctionnalités

### Authentification
- Login avec email/mot de passe
- Token JWT stocké dans `localStorage`
- Intercepteur Axios — injection automatique du token
- Guard de route — redirection `/login` si non connecté
- Vérification du rôle admin au login

### Dashboard
- 4 métriques clés (commandes, CA, produits, utilisateurs)
- Graphique donut — répartition des statuts de commandes
- Barres horizontales — top catégories produits
- Tableau des 8 dernières commandes
- Bouton "Actualiser" global

### Produits
- Liste complète avec image, prix coloré selon stock
- Recherche par nom (temps réel)
- Filtre par catégorie
- Création / édition (modal)
- Suppression avec confirmation (soft delete)

### Commandes
- Liste avec filtre par statut
- Modal détail — articles, prix snapshot, infos livraison
- Changement de statut (pending → confirmed → shipped → delivered)
- Badge coloré par statut

### Utilisateurs
- Liste complète avec avatar initiales
- Badge rôle (admin / utilisateur)
- Suppression (protégée — les admins ne peuvent pas être supprimés)

---

## Configuration avancée

### Changer l'URL de l'API

```env
# .env
VITE_API_URL=http://192.168.1.x:3000/api
```

### Désactiver le proxy Vite (production)

En production, configurer un reverse proxy Nginx :

```nginx
location /api/ {
    proxy_pass http://localhost:3000/api/;
}
```
