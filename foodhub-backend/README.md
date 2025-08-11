# FoodHub Backend API

Backend Laravel pour l'application FoodHub - plateforme de livraison de nourriture.

## 🚀 Installation

1. **Cloner le projet**
```bash
git clone <repository-url>
cd foodhub-backend
```

2. **Installer les dépendances**
```bash
composer install
```

3. **Configuration de l'environnement**
```bash
cp .env.example .env
php artisan key:generate
```

4. **Configuration de la base de données**
Modifiez le fichier `.env` avec vos paramètres de base de données :
```env
DB_CONNECTION=sqlite
DB_DATABASE=/absolute/path/to/database.sqlite
```

5. **Exécuter les migrations**
```bash
php artisan migrate
```

6. **Démarrer le serveur**
```bash
php artisan serve
```

Le serveur sera accessible sur `http://localhost:8000`

## 📚 Structure de l'API

### Authentification

#### POST /api/register
Inscription d'un nouvel utilisateur
```json
{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "password_confirmation": "password123",
    "phone": "+1234567890",
    "address": "123 Main St",
    "city": "New York",
    "postal_code": "10001"
}
```

#### POST /api/login
Connexion utilisateur
```json
{
    "email": "john@example.com",
    "password": "password123"
}
```

#### POST /api/logout
Déconnexion (nécessite authentification)

#### GET /api/user
Récupérer les informations de l'utilisateur connecté

### Vendeurs

#### GET /api/vendors
Liste des vendeurs avec filtres
- `city` - Filtrer par ville
- `min_rating` - Note minimum
- `max_delivery_fee` - Frais de livraison maximum
- `is_open` - Vendeurs ouverts
- `featured` - Vendeurs en vedette
- `verified` - Vendeurs vérifiés
- `search` - Recherche par nom/description

#### GET /api/vendors/featured
Vendeurs en vedette

#### GET /api/vendors/{id}
Détails d'un vendeur

#### GET /api/vendors/search?q={query}
Recherche de vendeurs

### Plats

#### GET /api/dishes
Liste des plats avec filtres
- `vendor_id` - Filtrer par vendeur
- `category_id` - Filtrer par catégorie
- `min_price` / `max_price` - Fourchette de prix
- `available` - Plats disponibles
- `popular` - Plats populaires
- `featured` - Plats en vedette
- `vegetarian` / `vegan` / `gluten_free` - Préférences alimentaires
- `cuisine_type` - Type de cuisine
- `spice_level` - Niveau d'épices (0-5)

#### GET /api/dishes/popular
Plats populaires

#### GET /api/dishes/featured
Plats en vedette

#### GET /api/dishes/{id}
Détails d'un plat

#### GET /api/dishes/vendor/{vendorId}
Plats d'un vendeur

#### GET /api/dishes/category/{categoryId}
Plats d'une catégorie

### Catégories

#### GET /api/categories
Liste des catégories

#### GET /api/categories/{id}
Détails d'une catégorie

### Commandes

#### GET /api/orders
Commandes de l'utilisateur connecté
- `status` - Filtrer par statut
- `from_date` / `to_date` - Période

#### POST /api/orders
Créer une nouvelle commande
```json
{
    "vendor_id": 1,
    "items": [
        {
            "dish_id": 1,
            "quantity": 2,
            "special_instructions": "Sans oignons"
        }
    ],
    "delivery_address": "123 Main St",
    "delivery_city": "New York",
    "customer_name": "John Doe",
    "customer_phone": "+1234567890",
    "payment_method": "cash"
}
```

#### GET /api/orders/{id}
Détails d'une commande

#### PUT /api/orders/{id}/cancel
Annuler une commande

### Avis

#### GET /api/reviews
Liste des avis
- `rating` - Filtrer par note
- `verified` - Avis vérifiés
- `helpful` - Avis utiles

#### POST /api/reviews
Créer un avis
```json
{
    "dish_id": 1,
    "rating": 5,
    "comment": "Excellent plat !",
    "images": ["url1", "url2"]
}
```

#### GET /api/reviews/dish/{dishId}
Avis d'un plat

#### GET /api/reviews/vendor/{vendorId}
Avis d'un vendeur

## 🔐 Authentification

L'API utilise Laravel Sanctum pour l'authentification par token.

### Headers requis
```
Authorization: Bearer {token}
Content-Type: application/json
Accept: application/json
```

## 📊 Statuts des commandes

- `pending` - En attente
- `confirmed` - Confirmée
- `preparing` - En préparation
- `ready` - Prête
- `out_for_delivery` - En livraison
- `delivered` - Livrée
- `cancelled` - Annulée

## 🛠️ Développement

### Créer des données de test
```bash
php artisan db:seed
```

### Tests
```bash
php artisan test
```

### Linting
```bash
./vendor/bin/pint
```

## 📝 Variables d'environnement

```env
APP_NAME=FoodHub
APP_ENV=local
APP_KEY=base64:...
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=sqlite
DB_DATABASE=/path/to/database.sqlite

SANCTUM_STATEFUL_DOMAINS=localhost:3000
SESSION_DOMAIN=localhost
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.
