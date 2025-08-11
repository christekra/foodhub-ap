// Configuration des couleurs pour FoodHub - Palette Orange/Blanc
export const colors = {
  // Couleur principale (Orange)
  primary: {
    50: '#FFF7ED',
    100: '#FFEDD5',
    200: '#FED7AA',
    300: '#FDBA74',
    400: '#FB923C',
    500: '#F97316', // Couleur principale
    600: '#EA580C',
    700: '#C2410C',
    800: '#9A3412',
    900: '#7C2D12',
  },
  
  // Couleur secondaire (Orange foncé)
  secondary: {
    50: '#FFF7ED',
    100: '#FFEDD5',
    200: '#FED7AA',
    300: '#FDBA74',
    400: '#FB923C',
    500: '#EA580C', // Orange foncé
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },
  
  // Couleur d'accent (Orange clair)
  accent: {
    50: '#FFF7ED',
    100: '#FFEDD5',
    200: '#FED7AA',
    300: '#FDBA74',
    400: '#FB923C', // Orange clair
    500: '#F97316',
    600: '#EA580C',
    700: '#C2410C',
    800: '#9A3412',
    900: '#7C2D12',
  },
  
  // Couleur de succès (Vert)
  success: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10B981', // Vert succès
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
  },
  
  // Couleur d'avertissement (Jaune)
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B', // Jaune avertissement
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },
  
  // Couleur d'erreur (Rouge)
  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444', // Rouge erreur
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },
  
  // Gradients populaires
  gradients: {
    primary: 'from-orange-500 to-orange-600',
    secondary: 'from-orange-400 to-orange-500',
    accent: 'from-orange-300 to-orange-400',
    success: 'from-green-500 to-green-600',
    sunset: 'from-orange-400 to-red-500',
    warm: 'from-orange-200 to-orange-300',
    light: 'from-orange-100 to-orange-200',
  }
};

// Classes Tailwind pour les couleurs principales
export const colorClasses = {
  primary: {
    bg: 'bg-orange-500',
    hover: 'hover:bg-orange-600',
    text: 'text-orange-500',
    border: 'border-orange-500',
    focus: 'focus:ring-orange-500',
  },
  secondary: {
    bg: 'bg-orange-600',
    hover: 'hover:bg-orange-700',
    text: 'text-orange-600',
    border: 'border-orange-600',
    focus: 'focus:ring-orange-600',
  },
  accent: {
    bg: 'bg-orange-400',
    hover: 'hover:bg-orange-500',
    text: 'text-orange-400',
    border: 'border-orange-400',
    focus: 'focus:ring-orange-400',
  },
  success: {
    bg: 'bg-green-500',
    hover: 'hover:bg-green-600',
    text: 'text-green-500',
    border: 'border-green-500',
    focus: 'focus:ring-green-500',
  },
  warning: {
    bg: 'bg-yellow-500',
    hover: 'hover:bg-yellow-600',
    text: 'text-yellow-500',
    border: 'border-yellow-500',
    focus: 'focus:ring-yellow-500',
  },
  error: {
    bg: 'bg-red-500',
    hover: 'hover:bg-red-600',
    text: 'text-red-500',
    border: 'border-red-500',
    focus: 'focus:ring-red-500',
  },
};
