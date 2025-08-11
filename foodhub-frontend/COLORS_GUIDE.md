# 🎨 Guide des Couleurs - FoodHub

## Palette Orange/Blanc

FoodHub utilise une palette de couleurs moderne et chaleureuse basée sur l'orange et le blanc, créant une expérience utilisateur accueillante et professionnelle.

### 🟠 Couleurs Principales

#### Orange (Couleur principale)
- **Orange-50**: `#FFF7ED` - Fond très clair
- **Orange-100**: `#FFEDD5` - Fond clair
- **Orange-200**: `#FED7AA` - Bordure claire
- **Orange-300**: `#FDBA74` - Texte secondaire
- **Orange-400**: `#FB923C` - Accent clair
- **Orange-500**: `#F97316` - **Couleur principale**
- **Orange-600**: `#EA580C` - Hover/Interaction
- **Orange-700**: `#C2410C` - Texte sur fond clair
- **Orange-800**: `#9A3412` - Texte important
- **Orange-900**: `#7C2D12` - Texte très important

#### Blanc/Gris (Couleurs neutres)
- **White**: `#FFFFFF` - Fond principal
- **Gray-50**: `#F9FAFB` - Fond secondaire
- **Gray-100**: `#F3F4F6` - Bordure légère
- **Gray-200**: `#E5E7EB` - Bordure
- **Gray-300**: `#D1D5DB` - Bordure plus foncée
- **Gray-400**: `#9CA3AF` - Texte secondaire
- **Gray-500**: `#6B7280` - Texte normal
- **Gray-600**: `#4B5563` - Texte important
- **Gray-700**: `#374151` - Texte très important
- **Gray-800**: `#1F2937` - Texte sur fond clair
- **Gray-900**: `#111827` - Texte principal

### 🎯 Utilisation des Couleurs

#### Boutons
- **Bouton principal**: `bg-orange-500 hover:bg-orange-600`
- **Bouton secondaire**: `bg-gray-100 hover:bg-gray-200 text-gray-900`
- **Bouton outline**: `border-orange-500 text-orange-500 hover:bg-orange-50`

#### Navigation
- **Lien actif**: `text-orange-500`
- **Lien hover**: `hover:text-orange-500`
- **Menu déroulant**: `hover:bg-orange-50`

#### Textes
- **Titre principal**: `text-gray-900`
- **Sous-titre**: `text-gray-700`
- **Texte normal**: `text-gray-600`
- **Texte secondaire**: `text-gray-500`
- **Lien**: `text-orange-600 hover:text-orange-700`

#### Cartes et Sections
- **Fond de carte**: `bg-white`
- **Bordure de carte**: `border-gray-200`
- **Ombre**: `shadow-sm` ou `shadow-md`

### 🌈 Gradients

#### Gradients Principaux
- **Gradient principal**: `from-orange-500 to-orange-600`
- **Gradient clair**: `from-orange-400 to-orange-500`
- **Gradient très clair**: `from-orange-300 to-orange-400`

#### Gradients Hover
- **Hover principal**: `hover:from-orange-600 hover:to-orange-700`
- **Hover clair**: `hover:from-orange-500 hover:to-orange-600`

### 🌙 Mode Sombre

#### Couleurs Sombre
- **Fond principal**: `dark:bg-gray-900`
- **Fond secondaire**: `dark:bg-gray-800`
- **Texte principal**: `dark:text-white`
- **Texte secondaire**: `dark:text-gray-300`
- **Bordure**: `dark:border-gray-700`

#### Orange en Mode Sombre
- **Orange clair**: `dark:text-orange-400`
- **Orange hover**: `dark:hover:text-orange-300`
- **Fond orange**: `dark:bg-orange-900`

### 📱 États et Interactions

#### États de Boutons
- **Normal**: `bg-orange-500`
- **Hover**: `hover:bg-orange-600`
- **Focus**: `focus:ring-2 focus:ring-orange-500 focus:ring-offset-2`
- **Disabled**: `opacity-50 cursor-not-allowed`

#### États de Liens
- **Normal**: `text-orange-600`
- **Hover**: `hover:text-orange-700`
- **Visité**: `text-orange-800`

### 🎨 Classes Utilitaires

#### Classes Principales
```css
/* Boutons */
.btn-primary: bg-orange-500 hover:bg-orange-600 text-white
.btn-secondary: bg-gray-100 hover:bg-gray-200 text-gray-900
.btn-outline: border-orange-500 text-orange-500 hover:bg-orange-50

/* Textes */
.text-primary: text-orange-600
.text-secondary: text-gray-600
.text-muted: text-gray-500

/* Bordures */
.border-primary: border-orange-500
.border-secondary: border-gray-200

/* Focus */
.focus-ring: focus:ring-2 focus:ring-orange-500 focus:ring-offset-2
```

### 🔧 Personnalisation

Pour modifier les couleurs, utilisez les variables CSS personnalisées dans `src/lib/theme/colors.ts` :

```typescript
export const colors = {
  primary: {
    50: '#FFF7ED',
    500: '#F97316', // Couleur principale
    600: '#EA580C', // Hover
    // ...
  }
}
```

### 📋 Checklist d'Application

- [ ] Navigation principale (Navbar)
- [ ] Boutons d'action
- [ ] Liens et interactions
- [ ] Cartes et sections
- [ ] Formulaires
- [ ] Messages d'état (succès, erreur, avertissement)
- [ ] Mode sombre
- [ ] Responsive design

### 🎯 Bonnes Pratiques

1. **Cohérence**: Utilisez toujours la même palette dans toute l'application
2. **Contraste**: Assurez-vous d'un bon contraste pour l'accessibilité
3. **Hiérarchie**: Utilisez les différentes nuances pour créer une hiérarchie visuelle
4. **Accessibilité**: Testez avec des outils d'accessibilité
5. **Mode sombre**: Pensez toujours au mode sombre lors de la conception

---

*Dernière mise à jour: $(Get-Date)*
