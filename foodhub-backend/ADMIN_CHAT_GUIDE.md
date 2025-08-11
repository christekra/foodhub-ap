# Guide du Système de Chat Administrateur - FoodHub

## Vue d'ensemble

Le système de chat administrateur permet aux administrateurs de FoodHub de répondre directement aux messages des clients via une interface dédiée dans le dashboard administrateur.

## Fonctionnalités

### 🔧 Fonctionnalités Administrateur

1. **Gestion des Chats Actifs**
   - Vue d'ensemble de tous les chats en cours
   - Filtrage par statut (tous, non lus, actifs)
   - Recherche dans les messages et informations utilisateur

2. **Interface de Chat en Temps Réel**
   - Zone de chat avec historique complet
   - Envoi de réponses administrateur
   - Indicateurs de statut des messages
   - Auto-refresh toutes les 5 secondes

3. **Statistiques du Support**
   - Nombre de chats actifs
   - Messages non lus
   - Temps de réponse moyen
   - Taux de satisfaction

4. **Gestion des Sessions**
   - Résolution de chats
   - Notes de résolution
   - Archivage automatique

### 🎯 Fonctionnalités Client

1. **Chat Widget Flottant**
   - Bouton d'ouverture/fermeture
   - Notifications de nouveaux messages
   - Interface responsive

2. **Réponses Automatiques**
   - Réponses intelligentes basées sur les mots-clés
   - Support multilingue (français/anglais)
   - Réponses contextuelles

3. **Page de Chat Dédiée**
   - Interface complète sur `/chat`
   - Support des fichiers joints
   - Historique des conversations

## Architecture Technique

### Backend (Laravel)

#### Contrôleurs
- `ChatController.php` - Gestion des messages clients
- `AdminChatController.php` - Gestion côté administrateur

#### Routes API
```php
// Routes client
POST /api/chat/send
GET /api/chat/history
POST /api/chat/mark-read
GET /api/chat/support-status

// Routes administrateur
GET /api/admin/chat/active-chats
GET /api/admin/chat/chat-history
POST /api/admin/chat/send-response
POST /api/admin/chat/resolve-chat
GET /api/admin/chat/stats
GET /api/admin/chat/search
```

#### Stockage
- **Cache Laravel** pour le stockage temporaire
- **Sessions uniques** par utilisateur
- **Liste des chats actifs** centralisée

### Frontend (React)

#### Composants
- `ChatWidget.tsx` - Widget flottant
- `ChatSystem.tsx` - Orchestrateur du système
- `ChatPage.tsx` - Page dédiée
- `ChatManagementTab.tsx` - Interface administrateur

#### Services
- `chatService.ts` - Communication API
- `useChat.ts` - Hook de gestion d'état

## Utilisation

### Pour les Administrateurs

1. **Accéder au Dashboard**
   - Connectez-vous avec un compte administrateur
   - Allez dans le dashboard administrateur
   - Cliquez sur l'onglet "Chat Support"

2. **Gérer les Chats**
   - Consultez la liste des chats actifs
   - Cliquez sur un chat pour l'ouvrir
   - Répondez aux messages des clients
   - Marquez les chats comme résolus

3. **Utiliser les Filtres**
   - **Tous** : Voir tous les chats
   - **Non lus** : Chats avec messages non lus
   - **Actifs** : Chats récents

4. **Rechercher**
   - Utilisez la barre de recherche
   - Recherchez par nom, email ou contenu

### Pour les Clients

1. **Ouvrir le Chat**
   - Cliquez sur le bouton de chat flottant
   - Ou allez sur la page `/chat`

2. **Envoyer un Message**
   - Tapez votre message
   - Appuyez sur Entrée ou cliquez sur Envoyer
   - Attendez la réponse automatique ou humaine

3. **Joindre des Fichiers**
   - Cliquez sur l'icône de trombone
   - Sélectionnez votre fichier (max 5MB)

## Configuration

### Variables d'Environnement

```env
# Configuration du cache (optionnel)
CACHE_DRIVER=redis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379
```

### Personnalisation des Réponses Automatiques

Modifiez la méthode `generateAutoResponse` dans `ChatController.php` :

```php
private function generateAutoResponse(string $message): ?string
{
    $lowerMessage = strtolower($message);
    
    $responses = [
        'commande' => 'Votre réponse personnalisée...',
        'livraison' => 'Informations sur la livraison...',
        // Ajoutez vos propres réponses
    ];
    
    foreach ($responses as $keyword => $response) {
        if (str_contains($lowerMessage, $keyword)) {
            return $response;
        }
    }
    
    return null;
}
```

## Sécurité

### Authentification
- Toutes les routes administrateur nécessitent une authentification
- Middleware `admin` pour les routes sensibles
- Validation des tokens JWT

### Validation des Données
- Validation côté client et serveur
- Limitation de la taille des messages (1000 caractères)
- Validation des types de fichiers

### Protection contre le Spam
- Limitation du taux d'envoi (à implémenter)
- Validation des sessions utilisateur

## Monitoring et Maintenance

### Logs
```bash
# Surveiller les logs Laravel
tail -f storage/logs/laravel.log

# Logs spécifiques au chat
grep "chat" storage/logs/laravel.log
```

### Cache
```bash
# Vider le cache des chats
php artisan cache:clear

# Voir les clés de cache
php artisan tinker
>>> Cache::get('active_chat_sessions')
```

### Statistiques
- Accédez aux statistiques via l'API
- Surveillez les temps de réponse
- Analysez les taux de satisfaction

## Dépannage

### Problèmes Courants

1. **Chats qui ne se chargent pas**
   - Vérifiez la connexion à la base de données
   - Vérifiez les permissions de cache
   - Redémarrez le serveur Laravel

2. **Messages qui ne s'envoient pas**
   - Vérifiez la configuration CORS
   - Vérifiez les tokens d'authentification
   - Vérifiez les logs d'erreur

3. **Auto-refresh qui ne fonctionne pas**
   - Vérifiez la configuration JavaScript
   - Vérifiez les erreurs de console
   - Désactivez les bloqueurs de scripts

### Commandes Utiles

```bash
# Redémarrer les services
php artisan serve
npm start

# Vider le cache
php artisan cache:clear
php artisan config:clear

# Vérifier les routes
php artisan route:list | grep chat
```

## Évolutions Futures

### Fonctionnalités Planifiées

1. **Base de Données Permanente**
   - Migration des données de cache vers MySQL
   - Historique complet des conversations
   - Sauvegarde automatique

2. **Notifications Push**
   - Notifications en temps réel
   - Intégration WebSocket
   - Notifications mobiles

3. **Intelligence Artificielle**
   - Chatbot plus avancé
   - Analyse de sentiment
   - Suggestions de réponses

4. **Analytics Avancés**
   - Rapports détaillés
   - Métriques de performance
   - Export des données

### Optimisations

1. **Performance**
   - Pagination des messages
   - Lazy loading
   - Compression des données

2. **Scalabilité**
   - Architecture microservices
   - Load balancing
   - Cache distribué

## Support

Pour toute question ou problème :
- Consultez les logs d'erreur
- Vérifiez la documentation Laravel
- Contactez l'équipe de développement

---

**Version :** 1.0.0  
**Dernière mise à jour :** 11 août 2025  
**Auteur :** Équipe FoodHub
