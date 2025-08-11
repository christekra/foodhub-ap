# 🚀 Déploiement FoodHub - Guide Rapide

## ⚡ Déploiement Express (5 minutes)

### Option 1 : Vercel + Railway (Recommandée)

#### 1. Préparer le projet
```bash
# Rendre le script exécutable
chmod +x deploy.sh

# Lancer le script de déploiement
./deploy.sh
```

#### 2. Déployer le Backend sur Railway
1. Allez sur [railway.app](https://railway.app)
2. Connectez-vous avec GitHub
3. Cliquez sur "New Project"
4. Sélectionnez votre repository FoodHub
5. Ajoutez une base de données PostgreSQL
6. Configurez les variables d'environnement :
   ```env
   APP_NAME=FoodHub
   APP_ENV=production
   APP_DEBUG=false
   APP_KEY=base64:votre_cle_generer
   DB_CONNECTION=pgsql
   ```

#### 3. Déployer le Frontend sur Vercel
1. Allez sur [vercel.com](https://vercel.com)
2. Connectez-vous avec GitHub
3. Cliquez sur "New Project"
4. Importez votre repository
5. Sélectionnez le dossier `foodhub-frontend`
6. Configurez les variables d'environnement :
   ```env
   REACT_APP_API_URL=https://votre-backend.railway.app/api
   REACT_APP_GOOGLE_MAPS_API_KEY=votre_cle_google_maps
   ```

### Option 2 : Render (Alternative)

#### 1. Déployer le Backend
1. Allez sur [render.com](https://render.com)
2. Connectez-vous avec GitHub
3. Créez un "Web Service"
4. Sélectionnez votre repository et le dossier `foodhub-backend`
5. Configuration :
   - **Build Command** : `composer install --optimize-autoloader --no-dev`
   - **Start Command** : `php artisan serve --host 0.0.0.0 --port $PORT`

#### 2. Déployer le Frontend
1. Créez un "Static Site"
2. Sélectionnez le dossier `foodhub-frontend`
3. Configuration :
   - **Build Command** : `npm install && npm run build`
   - **Publish Directory** : `build`

## 🔧 Configuration Post-Déploiement

### 1. Exécuter les migrations
```bash
# Sur Railway/Render
php artisan migrate --force
php artisan db:seed --force
```

### 2. Tester l'application
- ✅ Frontend se charge
- ✅ Authentification fonctionne
- ✅ API calls fonctionnent
- ✅ Images s'affichent
- ✅ Chat fonctionne
- ✅ Commandes peuvent être créées

## 🌐 URLs de votre application

- **Frontend** : `https://votre-projet.vercel.app`
- **Backend** : `https://votre-backend.railway.app`
- **API** : `https://votre-backend.railway.app/api`

## 💰 Coûts

### Gratuit (Limites)
- **Vercel** : Illimité pour projets personnels
- **Railway** : 500 heures/mois
- **Render** : Services web gratuits

## 🆘 Problèmes courants

### Erreur CORS
```php
// Dans config/cors.php
'allowed_origins' => [
    'http://localhost:3000',
    'https://votre-frontend.vercel.app'
],
```

### Erreur de base de données
- Vérifiez les variables d'environnement DB_*
- Assurez-vous que la base de données est créée

### Build failures
- Vérifiez les logs de build
- Assurez-vous que toutes les dépendances sont installées

## 📚 Ressources

- [Guide complet](DEPLOYMENT_GUIDE.md)
- [Documentation Vercel](https://vercel.com/docs)
- [Documentation Railway](https://docs.railway.app)
- [Documentation Render](https://render.com/docs)

---

**Note** : Ce guide couvre les options gratuites. Pour une application en production avec beaucoup de trafic, considérez les plans payants.
