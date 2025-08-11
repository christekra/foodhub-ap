# 🚀 Guide de Déploiement FoodHub - Options Gratuites

## 📋 Vue d'ensemble

Ce guide vous accompagne pour déployer votre application FoodHub (Laravel + React) gratuitement en utilisant GitHub et différentes plateformes de déploiement.

## 🎯 Options recommandées

### Option 1 : Vercel + Railway (Recommandée)
- **Frontend React** → Vercel
- **Backend Laravel** → Railway
- **Base de données** → Railway PostgreSQL

### Option 2 : Render (Alternative complète)
- **Frontend + Backend** → Render
- **Base de données** → Render PostgreSQL

## 🔧 Préparation du projet

### 1. Configuration pour la production

#### Frontend (React)
```bash
# Dans foodhub-frontend/
npm run build
```

#### Backend (Laravel)
```bash
# Dans foodhub-backend/
composer install --optimize-autoloader --no-dev
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### 2. Variables d'environnement

#### Frontend (.env.production)
```env
REACT_APP_API_URL=https://votre-backend.railway.app/api
REACT_APP_GOOGLE_MAPS_API_KEY=votre_cle_google_maps
```

#### Backend (.env.production)
```env
APP_NAME=FoodHub
APP_ENV=production
APP_DEBUG=false
APP_URL=https://votre-backend.railway.app

DB_CONNECTION=pgsql
DB_HOST=votre_host_railway
DB_PORT=5432
DB_DATABASE=votre_database
DB_USERNAME=votre_username
DB_PASSWORD=votre_password

CACHE_DRIVER=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis

SANCTUM_STATEFUL_DOMAINS=votre-frontend.vercel.app
SESSION_DOMAIN=.vercel.app
```

## 🚀 Déploiement avec Vercel + Railway

### Étape 1 : Déployer le Backend sur Railway

1. **Créer un compte Railway**
   - Allez sur [railway.app](https://railway.app)
   - Connectez-vous avec GitHub

2. **Connecter votre repository**
   - Cliquez sur "New Project"
   - Sélectionnez "Deploy from GitHub repo"
   - Choisissez votre repository FoodHub

3. **Configurer le service Laravel**
   - Railway détectera automatiquement Laravel
   - Ajoutez les variables d'environnement

4. **Ajouter une base de données PostgreSQL**
   - Cliquez sur "New"
   - Sélectionnez "Database" → "PostgreSQL"
   - Railway créera automatiquement les variables DB_*

5. **Configurer les variables d'environnement**
   ```env
   APP_NAME=FoodHub
   APP_ENV=production
   APP_DEBUG=false
   APP_KEY=base64:votre_cle_generer
   DB_CONNECTION=pgsql
   # Les autres variables DB seront automatiquement ajoutées
   ```

6. **Déployer**
   - Railway déploiera automatiquement à chaque push
   - Exécutez les migrations : `php artisan migrate`

### Étape 2 : Déployer le Frontend sur Vercel

1. **Créer un compte Vercel**
   - Allez sur [vercel.com](https://vercel.com)
   - Connectez-vous avec GitHub

2. **Importer votre projet**
   - Cliquez sur "New Project"
   - Importez votre repository GitHub
   - Sélectionnez le dossier `foodhub-frontend`

3. **Configurer le build**
   - Framework Preset : Create React App
   - Build Command : `npm run build`
   - Output Directory : `build`
   - Install Command : `npm install`

4. **Ajouter les variables d'environnement**
   ```env
   REACT_APP_API_URL=https://votre-backend.railway.app/api
   REACT_APP_GOOGLE_MAPS_API_KEY=votre_cle_google_maps
   ```

5. **Déployer**
   - Vercel déploiera automatiquement
   - Votre site sera accessible sur `https://votre-projet.vercel.app`

## 🚀 Déploiement avec Render (Alternative)

### Étape 1 : Déployer le Backend

1. **Créer un compte Render**
   - Allez sur [render.com](https://render.com)
   - Connectez-vous avec GitHub

2. **Créer un service Web**
   - Cliquez sur "New" → "Web Service"
   - Connectez votre repository GitHub
   - Sélectionnez le dossier `foodhub-backend`

3. **Configuration**
   - **Name** : foodhub-backend
   - **Environment** : PHP
   - **Build Command** : `composer install --optimize-autoloader --no-dev`
   - **Start Command** : `php artisan serve --host 0.0.0.0 --port $PORT`

4. **Ajouter une base de données PostgreSQL**
   - Cliquez sur "New" → "PostgreSQL"
   - Notez les informations de connexion

5. **Variables d'environnement**
   ```env
   APP_NAME=FoodHub
   APP_ENV=production
   APP_DEBUG=false
   APP_KEY=base64:votre_cle_generer
   DB_CONNECTION=pgsql
   DB_HOST=votre_host_render
   DB_PORT=5432
   DB_DATABASE=votre_database
   DB_USERNAME=votre_username
   DB_PASSWORD=votre_password
   ```

### Étape 2 : Déployer le Frontend

1. **Créer un service Static Site**
   - Cliquez sur "New" → "Static Site"
   - Connectez votre repository GitHub
   - Sélectionnez le dossier `foodhub-frontend`

2. **Configuration**
   - **Name** : foodhub-frontend
   - **Build Command** : `npm install && npm run build`
   - **Publish Directory** : `build`

3. **Variables d'environnement**
   ```env
   REACT_APP_API_URL=https://votre-backend.onrender.com/api
   REACT_APP_GOOGLE_MAPS_API_KEY=votre_cle_google_maps
   ```

## 🔧 Configuration post-déploiement

### 1. Mettre à jour les URLs dans le code

#### Frontend - services/api.ts
```typescript
// Remplacer
export const API_BASE_URL = 'http://localhost:8000/api';

// Par
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://votre-backend.railway.app/api';
```

#### Backend - config/cors.php
```php
'allowed_origins' => [
    'http://localhost:3000',
    'https://votre-frontend.vercel.app',
    'https://votre-frontend.onrender.com'
],
```

### 2. Exécuter les migrations et seeders
```bash
# Sur Railway/Render
php artisan migrate --force
php artisan db:seed --force
```

### 3. Configurer les domaines personnalisés (optionnel)
- **Vercel** : Ajoutez votre domaine dans les paramètres
- **Railway** : Configurez un domaine personnalisé
- **Render** : Ajoutez votre domaine dans les paramètres

## 🔍 Vérification du déploiement

### Tests à effectuer
1. ✅ Le frontend se charge correctement
2. ✅ L'authentification fonctionne
3. ✅ Les API calls fonctionnent
4. ✅ Les images s'affichent
5. ✅ Le chat fonctionne
6. ✅ Les commandes peuvent être créées
7. ✅ Les notifications fonctionnent

### Outils de monitoring
- **Vercel Analytics** : Performance du frontend
- **Railway Metrics** : Performance du backend
- **Sentry** : Gestion des erreurs (optionnel)

## 🛠️ Maintenance

### Mises à jour automatiques
- Les déploiements se font automatiquement à chaque push sur GitHub
- Configurez des branches de développement si nécessaire

### Sauvegarde de la base de données
- **Railway** : Sauvegardes automatiques
- **Render** : Sauvegardes automatiques
- Exportez régulièrement vos données

### Monitoring
- Surveillez les logs d'erreur
- Configurez des alertes en cas de problème
- Vérifiez régulièrement les performances

## 💰 Coûts

### Gratuit (Limites)
- **Vercel** : Illimité pour les projets personnels
- **Railway** : 500 heures/mois
- **Render** : Services web gratuits avec limitations

### Évolution
- Passez aux plans payants si vous dépassez les limites
- Les coûts restent raisonnables pour une application de production

## 🆘 Dépannage

### Problèmes courants
1. **Erreurs CORS** : Vérifiez les domaines autorisés
2. **Erreurs de base de données** : Vérifiez les variables d'environnement
3. **Build failures** : Vérifiez les logs de build
4. **Variables d'environnement manquantes** : Vérifiez la configuration

### Support
- **Vercel** : Documentation excellente, communauté active
- **Railway** : Support Discord, documentation détaillée
- **Render** : Documentation complète, support par email

## 📚 Ressources utiles

- [Documentation Vercel](https://vercel.com/docs)
- [Documentation Railway](https://docs.railway.app)
- [Documentation Render](https://render.com/docs)
- [Laravel Deployment Guide](https://laravel.com/docs/deployment)
- [React Deployment Guide](https://create-react-app.dev/docs/deployment/)

---

**Note** : Ce guide couvre les options gratuites. Pour une application en production avec beaucoup de trafic, considérez les plans payants ou d'autres solutions comme AWS, Google Cloud, ou DigitalOcean.
