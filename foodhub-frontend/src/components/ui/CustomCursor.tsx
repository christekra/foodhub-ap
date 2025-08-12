import React, { useEffect, useState, useCallback } from 'react';


export const CustomCursor: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const updateMousePosition = useCallback((e: MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
    setIsVisible(true);
  }, []);

  const handleMouseEnter = useCallback(() => setIsHovering(true), []);
  const handleMouseLeave = useCallback(() => setIsHovering(false), []);

  useEffect(() => {
    // Masquer le curseur par défaut
    document.body.style.cursor = 'none';

    // Événements de souris
    window.addEventListener('mousemove', updateMousePosition);
    
    // Gestion des éléments interactifs
    const handleInteractiveElements = () => {
      const interactiveElements = document.querySelectorAll(
        'button, a, [role="button"], input, textarea, select'
      );
      
      interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', handleMouseEnter);
        el.addEventListener('mouseleave', handleMouseLeave);
      });
    };

    // Initialisation
    handleInteractiveElements();

    // Observer les changements dans le DOM
    const observer = new MutationObserver(() => {
      handleInteractiveElements();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Gestion de la sortie de la fenêtre
    const handleWindowMouseLeave = () => setIsVisible(false);
    const handleWindowMouseEnter = () => setIsVisible(true);
    
    document.addEventListener('mouseleave', handleWindowMouseLeave);
    document.addEventListener('mouseenter', handleWindowMouseEnter);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      document.removeEventListener('mouseleave', handleWindowMouseLeave);
      document.removeEventListener('mouseenter', handleWindowMouseEnter);
      observer.disconnect();
      
      // Restaurer le curseur par défaut
      document.body.style.cursor = 'auto';
    };
  }, [updateMousePosition, handleMouseEnter, handleMouseLeave]);

  if (!isVisible) return null;

  return (
    <>
      {/* Curseur principal */}
      <div
        className="fixed top-0 left-0 w-4 h-4 bg-blue-500 rounded-full pointer-events-none z-[9999] mix-blend-difference"
        animate={{
          x: mousePosition.x - 8,
          y: mousePosition.y - 8,
          scale: isHovering ? 2 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 28,
          mass: 0.5,
        }}
      />
      
      {/* Curseur de traînée */}
      <div
        className="fixed top-0 left-0 w-8 h-8 border-2 border-blue-400/50 rounded-full pointer-events-none z-[9998]"
        animate={{
          x: mousePosition.x - 16,
          y: mousePosition.y - 16,
          scale: isHovering ? 1.5 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 250,
          damping: 20,
          mass: 0.5,
        }}
      />
    </>
  );
};

