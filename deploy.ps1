# 🚀 Script de déploiement FoodHub - PowerShell
# Ce script automatise le processus de déploiement sur Vercel + Railway

Write-Host "🚀 Démarrage du déploiement FoodHub..." -ForegroundColor Blue

# Fonction pour afficher les messages
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Vérifier que Git est configuré
function Test-GitConfig {
    Write-Status "Vérification de la configuration Git..."
    
    $userName = git config --get user.name
    $userEmail = git config --get user.email
    
    if (-not $userName) {
        Write-Error "Nom d'utilisateur Git non configuré"
        Write-Host "Configurez votre nom d'utilisateur Git :" -ForegroundColor Yellow
        Write-Host "git config --global user.name 'Votre Nom'" -ForegroundColor Yellow
        exit 1
    }
    
    if (-not $userEmail) {
        Write-Error "Email Git non configuré"
        Write-Host "Configurez votre email Git :" -ForegroundColor Yellow
        Write-Host "git config --global user.email 'votre.email@example.com'" -ForegroundColor Yellow
        exit 1
    }
    
    Write-Success "Configuration Git OK"
}

# Vérifier que le repository est connecté à GitHub
function Test-GitHubConnection {
    Write-Status "Vérification de la connexion GitHub..."
    
    try {
        $originUrl = git remote get-url origin
        if (-not $originUrl) {
            Write-Error "Aucun remote 'origin' configuré"
            Write-Host "Connectez votre repository à GitHub :" -ForegroundColor Yellow
            Write-Host "git remote add origin https://github.com/votre-username/votre-repo.git" -ForegroundColor Yellow
            exit 1
        }
        
        if ($originUrl -notmatch "github\.com") {
            Write-Error "Le remote 'origin' ne pointe pas vers GitHub"
            exit 1
        }
        
        Write-Success "Connexion GitHub OK"
    }
    catch {
        Write-Error "Erreur lors de la vérification GitHub"
        exit 1
    }
}

# Préparer le frontend pour la production
function Invoke-FrontendBuild {
    Write-Status "Préparation du frontend pour la production..."
    
    Set-Location foodhub-frontend
    
    # Installer les dépendances
    Write-Status "Installation des dépendances frontend..."
    npm install
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Échec de l'installation des dépendances frontend"
        exit 1
    }
    
    # Build de production
    Write-Status "Build de production..."
    npm run build
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Build frontend réussi"
    }
    else {
        Write-Error "Échec du build frontend"
        exit 1
    }
    
    Set-Location ..
}

# Préparer le backend pour la production
function Invoke-BackendBuild {
    Write-Status "Préparation du backend pour la production..."
    
    Set-Location foodhub-backend
    
    # Installer les dépendances
    Write-Status "Installation des dépendances backend..."
    composer install --optimize-autoloader --no-dev
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Échec de l'installation des dépendances backend"
        exit 1
    }
    
    # Optimiser Laravel
    Write-Status "Optimisation Laravel..."
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Optimisation backend réussie"
    }
    else {
        Write-Error "Échec de l'optimisation backend"
        exit 1
    }
    
    Set-Location ..
}

# Commiter et pousser les changements
function Invoke-GitDeploy {
    Write-Status "Commit et push des changements..."
    
    # Ajouter tous les fichiers
    git add .
    
    # Commit avec message descriptif
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    git commit -m "🚀 Préparation déploiement production - $timestamp"
    
    if ($LASTEXITCODE -ne 0) {
        Write-Warning "Aucun changement à commiter"
        return
    }
    
    # Push vers GitHub
    git push origin main
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Push vers GitHub réussi"
    }
    else {
        Write-Error "Échec du push vers GitHub"
        exit 1
    }
}

# Afficher les instructions post-déploiement
function Show-PostDeploymentInstructions {
    Write-Host ""
    Write-Host "🎉 Déploiement terminé !" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Prochaines étapes :" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. 🌐 Déployer le Backend sur Railway :" -ForegroundColor Cyan
    Write-Host "   - Allez sur https://railway.app" -ForegroundColor White
    Write-Host "   - Connectez-vous avec GitHub" -ForegroundColor White
    Write-Host "   - Créez un nouveau projet" -ForegroundColor White
    Write-Host "   - Sélectionnez votre repository FoodHub" -ForegroundColor White
    Write-Host "   - Ajoutez une base de données PostgreSQL" -ForegroundColor White
    Write-Host "   - Configurez les variables d'environnement" -ForegroundColor White
    Write-Host ""
    Write-Host "2. 🎨 Déployer le Frontend sur Vercel :" -ForegroundColor Cyan
    Write-Host "   - Allez sur https://vercel.com" -ForegroundColor White
    Write-Host "   - Connectez-vous avec GitHub" -ForegroundColor White
    Write-Host "   - Importez votre repository" -ForegroundColor White
    Write-Host "   - Sélectionnez le dossier 'foodhub-frontend'" -ForegroundColor White
    Write-Host "   - Configurez les variables d'environnement" -ForegroundColor White
    Write-Host ""
    Write-Host "3. ⚙️ Configuration des variables d'environnement :" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "   Frontend (Vercel) :" -ForegroundColor Yellow
    Write-Host "   - REACT_APP_API_URL=https://votre-backend.railway.app/api" -ForegroundColor White
    Write-Host "   - REACT_APP_GOOGLE_MAPS_API_KEY=votre_cle_google_maps" -ForegroundColor White
    Write-Host ""
    Write-Host "   Backend (Railway) :" -ForegroundColor Yellow
    Write-Host "   - APP_NAME=FoodHub" -ForegroundColor White
    Write-Host "   - APP_ENV=production" -ForegroundColor White
    Write-Host "   - APP_DEBUG=false" -ForegroundColor White
    Write-Host "   - DB_CONNECTION=pgsql" -ForegroundColor White
    Write-Host "   - (Les autres variables DB seront ajoutées automatiquement)" -ForegroundColor White
    Write-Host ""
    Write-Host "4. 🔧 Post-déploiement :" -ForegroundColor Cyan
    Write-Host "   - Exécutez les migrations : php artisan migrate --force" -ForegroundColor White
    Write-Host "   - Exécutez les seeders : php artisan db:seed --force" -ForegroundColor White
    Write-Host "   - Testez toutes les fonctionnalités" -ForegroundColor White
    Write-Host ""
    Write-Host "📚 Consultez le fichier DEPLOYMENT_GUIDE.md pour plus de détails" -ForegroundColor Cyan
    Write-Host ""
}

# Fonction principale
function Main {
    Write-Host "🍕 FoodHub - Script de déploiement" -ForegroundColor Magenta
    Write-Host "==================================" -ForegroundColor Magenta
    Write-Host ""
    
    # Vérifications préliminaires
    Test-GitConfig
    Test-GitHubConnection
    
    # Préparation
    Invoke-FrontendBuild
    Invoke-BackendBuild
    
    # Déploiement
    Invoke-GitDeploy
    
    # Instructions post-déploiement
    Show-PostDeploymentInstructions
}

# Exécuter le script principal
Main
