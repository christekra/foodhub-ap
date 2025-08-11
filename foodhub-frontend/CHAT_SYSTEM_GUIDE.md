# 🗨️ Guide du Système de Chat FoodHub

## Vue d'ensemble

Le système de chat en ligne de FoodHub offre une assistance client en temps réel avec des fonctionnalités avancées et une interface utilisateur moderne.

## 🚀 Fonctionnalités

### ✅ Fonctionnalités Implémentées

1. **Chat Widget Flottant**
   - Bouton de chat flottant avec badge de notifications
   - Interface minimisable et redimensionnable
   - Animations fluides avec Framer Motion

2. **Page de Chat Dédiée**
   - Interface complète pour une expérience optimale
   - Support des pièces jointes (fichiers, images)
   - Historique des conversations

3. **Système de Notifications**
   - Badge de messages non lus
   - Notifications toast pour nouveaux messages
   - Indicateur de statut en ligne

4. **Réponses Automatiques Intelligentes**
   - Détection de mots-clés en français et anglais
   - Réponses contextuelles basées sur le contenu
   - Support pour commandes, livraison, paiement, etc.

5. **API Backend Complète**
   - Endpoints REST pour toutes les opérations
   - Gestion des sessions utilisateur
   - Stockage temporaire en cache

## 📁 Structure des Fichiers

### Frontend
```
src/
├── components/
│   ├── ChatWidget.tsx          # Widget de chat flottant
│   ├── ChatButton.tsx          # Bouton de chat avec notifications
│   ├── ChatSystem.tsx          # Système de chat principal
│   └── ui/
├── pages/
│   └── ChatPage.tsx            # Page de chat dédiée
├── services/
│   └── chatService.ts          # Service de communication API
├── hooks/
│   └── useChat.ts              # Hook de gestion du chat
└── App.tsx                     # Intégration du système
```

### Backend
```
app/
├── Http/
│   └── Controllers/
│       └── Api/
│           └── ChatController.php  # Contrôleur API chat
└── routes/
    └── api.php                     # Routes API chat
```

## 🔧 Configuration

### Routes API Backend
```php
// Routes protégées par authentification
Route::prefix('chat')->group(function () {
    Route::post('/send', [ChatController::class, 'sendMessage']);
    Route::get('/history', [ChatController::class, 'getHistory']);
    Route::post('/mark-read', [ChatController::class, 'markAsRead']);
    Route::get('/support-status', [ChatController::class, 'getSupportStatus']);
});
```

### Routes Frontend
```typescript
// Routes dans App.tsx
<Route path="/chat" element={<ChatPage />} />
```

## 🎨 Interface Utilisateur

### Palette de Couleurs
- **Primaire**: Orange (#F97316)
- **Secondaire**: Orange foncé (#EA580C)
- **Accent**: Orange clair (#FB923C)
- **Succès**: Vert (#10B981)
- **Erreur**: Rouge (#EF4444)

### Composants UI
- **ChatWidget**: Interface flottante 320x384px
- **ChatButton**: Bouton circulaire avec badge
- **ChatPage**: Interface complète responsive

## 🔄 Flux de Données

### Envoi de Message
1. Utilisateur tape un message
2. Message envoyé via `chatService.sendMessage()`
3. API backend traite et génère réponse automatique
4. Réponse affichée dans l'interface

### Gestion des Erreurs
- Fallback vers simulation locale si API indisponible
- Messages d'erreur utilisateur-friendly
- Logs de débogage en console

## 🤖 Réponses Automatiques

### Mots-clés Détectés
- **Commande/Order**: Suivi de commande
- **Livraison/Delivery**: Délais et notifications
- **Paiement/Payment**: Moyens de paiement acceptés
- **Restaurant/Vendor**: Devenir partenaire
- **Problème/Issue**: Assistance technique
- **Bonjour/Hello**: Salutations

### Exemple de Réponse
```
Utilisateur: "Comment suivre ma commande ?"
Bot: "Pour suivre votre commande, allez dans 'Mes commandes' 
     dans votre profil. Vous pouvez aussi utiliser le numéro 
     de suivi fourni."
```

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 768px - Interface adaptée
- **Tablet**: 768px - 1024px - Taille intermédiaire
- **Desktop**: > 1024px - Interface complète

### Adaptations
- Widget redimensionné sur mobile
- Boutons tactiles optimisés
- Navigation simplifiée

## 🔒 Sécurité

### Authentification
- Tokens JWT pour les utilisateurs connectés
- Sessions anonymes pour visiteurs
- Validation côté serveur

### Validation
- Longueur maximale des messages (1000 caractères)
- Types de fichiers autorisés
- Taille maximale des pièces jointes (5MB)

## 🚀 Déploiement

### Prérequis
- Laravel 10+ (Backend)
- React 18+ (Frontend)
- Node.js 16+ (Frontend)

### Variables d'Environnement
```env
# Backend (.env)
CACHE_DRIVER=redis
SESSION_DRIVER=redis

# Frontend (.env)
REACT_APP_API_URL=http://localhost:8000/api
```

## 📊 Métriques et Analytics

### Données Collectées
- Nombre de messages envoyés
- Temps de réponse moyen
- Taux de satisfaction
- Problèmes les plus fréquents

### Monitoring
- Logs d'erreurs API
- Performance des réponses automatiques
- Utilisation des ressources

## 🔮 Améliorations Futures

### Fonctionnalités Planifiées
1. **Chat en Temps Réel**
   - WebSockets pour messages instantanés
   - Notifications push

2. **IA Avancée**
   - Intégration ChatGPT/Claude
   - Apprentissage des préférences utilisateur

3. **Support Multilingue**
   - Traduction automatique
   - Support des langues locales

4. **Analytics Avancés**
   - Dashboard de support
   - Rapports de performance

5. **Intégrations**
   - Slack/Discord pour équipe support
   - CRM pour suivi client

## 🛠️ Maintenance

### Tâches Régulières
- Nettoyage du cache de chat (24h)
- Sauvegarde des conversations importantes
- Mise à jour des réponses automatiques

### Monitoring
- Vérification de la disponibilité API
- Surveillance des performances
- Alertes en cas d'erreurs

## 📞 Support Technique

### En Cas de Problème
1. Vérifier les logs Laravel (`storage/logs/laravel.log`)
2. Contrôler la console navigateur
3. Tester la connectivité API
4. Vérifier les permissions de cache

### Contacts
- **Développeur**: Support technique
- **Documentation**: Ce guide
- **Issues**: Système de tickets

---

*Dernière mise à jour: Août 2025*
*Version: 1.0.0*
