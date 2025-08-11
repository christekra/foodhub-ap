#!/bin/bash

# 🚀 Script de déploiement FoodHub
# Ce script automatise le processus de déploiement sur Vercel + Railway

echo "🚀 Démarrage du déploiement FoodHub..."

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérifier que Git est configuré
check_git() {
    print_status "Vérification de la configuration Git..."
    
    if ! git config --get user.name > /dev/null 2>&1; then
        print_error "Nom d'utilisateur Git non configuré"
        echo "Configurez votre nom d'utilisateur Git :"
        echo "git config --global user.name 'Votre Nom'"
        exit 1
    fi
    
    if ! git config --get user.email > /dev/null 2>&1; then
        print_error "Email Git non configuré"
        echo "Configurez votre email Git :"
        echo "git config --global user.email 'votre.email@example.com'"
        exit 1
    fi
    
    print_success "Configuration Git OK"
}

# Vérifier que le repository est connecté à GitHub
check_github() {
    print_status "Vérification de la connexion GitHub..."
    
    if ! git remote get-url origin > /dev/null 2>&1; then
        print_error "Aucun remote 'origin' configuré"
        echo "Connectez votre repository à GitHub :"
        echo "git remote add origin https://github.com/votre-username/votre-repo.git"
        exit 1
    fi
    
    if [[ ! $(git remote get-url origin) =~ github\.com ]]; then
        print_error "Le remote 'origin' ne pointe pas vers GitHub"
        exit 1
    fi
    
    print_success "Connexion GitHub OK"
}

# Préparer le frontend pour la production
prepare_frontend() {
    print_status "Préparation du frontend pour la production..."
    
    cd foodhub-frontend
    
    # Installer les dépendances
    print_status "Installation des dépendances frontend..."
    npm install
    
    # Build de production
    print_status "Build de production..."
    npm run build
    
    if [ $? -eq 0 ]; then
        print_success "Build frontend réussi"
    else
        print_error "Échec du build frontend"
        exit 1
    fi
    
    cd ..
}

# Préparer le backend pour la production
prepare_backend() {
    print_status "Préparation du backend pour la production..."
    
    cd foodhub-backend
    
    # Installer les dépendances
    print_status "Installation des dépendances backend..."
    composer install --optimize-autoloader --no-dev
    
    # Optimiser Laravel
    print_status "Optimisation Laravel..."
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
    
    if [ $? -eq 0 ]; then
        print_success "Optimisation backend réussie"
    else
        print_error "Échec de l'optimisation backend"
        exit 1
    fi
    
    cd ..
}

# Commiter et pousser les changements
commit_and_push() {
    print_status "Commit et push des changements..."
    
    # Ajouter tous les fichiers
    git add .
    
    # Commit avec message descriptif
    git commit -m "🚀 Préparation déploiement production - $(date '+%Y-%m-%d %H:%M:%S')"
    
    # Push vers GitHub
    git push origin main
    
    if [ $? -eq 0 ]; then
        print_success "Push vers GitHub réussi"
    else
        print_error "Échec du push vers GitHub"
        exit 1
    fi
}

# Afficher les instructions post-déploiement
show_post_deployment_instructions() {
    echo ""
    echo "🎉 Déploiement terminé !"
    echo ""
    echo "📋 Prochaines étapes :"
    echo ""
    echo "1. 🌐 Déployer le Backend sur Railway :"
    echo "   - Allez sur https://railway.app"
    echo "   - Connectez-vous avec GitHub"
    echo "   - Créez un nouveau projet"
    echo "   - Sélectionnez votre repository FoodHub"
    echo "   - Ajoutez une base de données PostgreSQL"
    echo "   - Configurez les variables d'environnement"
    echo ""
    echo "2. 🎨 Déployer le Frontend sur Vercel :"
    echo "   - Allez sur https://vercel.com"
    echo "   - Connectez-vous avec GitHub"
    echo "   - Importez votre repository"
    echo "   - Sélectionnez le dossier 'foodhub-frontend'"
    echo "   - Configurez les variables d'environnement"
    echo ""
    echo "3. ⚙️ Configuration des variables d'environnement :"
    echo ""
    echo "   Frontend (Vercel) :"
    echo "   - REACT_APP_API_URL=https://votre-backend.railway.app/api"
    echo "   - REACT_APP_GOOGLE_MAPS_API_KEY=votre_cle_google_maps"
    echo ""
    echo "   Backend (Railway) :"
    echo "   - APP_NAME=FoodHub"
    echo "   - APP_ENV=production"
    echo "   - APP_DEBUG=false"
    echo "   - DB_CONNECTION=pgsql"
    echo "   - (Les autres variables DB seront ajoutées automatiquement)"
    echo ""
    echo "4. 🔧 Post-déploiement :"
    echo "   - Exécutez les migrations : php artisan migrate --force"
    echo "   - Exécutez les seeders : php artisan db:seed --force"
    echo "   - Testez toutes les fonctionnalités"
    echo ""
    echo "📚 Consultez le fichier DEPLOYMENT_GUIDE.md pour plus de détails"
    echo ""
}

# Fonction principale
main() {
    echo "🍕 FoodHub - Script de déploiement"
    echo "=================================="
    echo ""
    
    # Vérifications préliminaires
    check_git
    check_github
    
    # Préparation
    prepare_frontend
    prepare_backend
    
    # Déploiement
    commit_and_push
    
    # Instructions post-déploiement
    show_post_deployment_instructions
}

# Exécuter le script principal
main "$@"
