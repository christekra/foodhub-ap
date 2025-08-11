import { Variants } from 'framer-motion';

export const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

export const staggerContainer = (staggerChildren = 0.1): Variants => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren,
    },
  },
});

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

export const slideIn = (direction: 'left' | 'right' | 'up' | 'down' = 'up') => {
  const directions = {
    left: { x: -100 },
    right: { x: 100 },
    up: { y: 100 },
    down: { y: -100 },
  };

  return {
    hidden: { ...directions[direction], opacity: 0 },
    visible: {
      x: 0,
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };
};

export const hoverScale = {
  scale: 1.05,
  transition: {
    type: 'spring',
    stiffness: 400,
    damping: 10
  }
};

export const tapScale = {
  scale: 0.98
};

export const rotateY = {
  hidden: { rotateY: 0 },
  hover: { 
    rotateY: [0, -5, 5, -5, 0],
    transition: {
      duration: 1.5,
      ease: 'easeInOut'
    }
  }
};

export const float = {
  animate: {
    y: [0, -15, 0],
    transition: {
      duration: 3,
      ease: 'easeInOut',
      repeat: Infinity,
      repeatType: 'reverse' as const
    }
  }
};

export const draw = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: (i: number) => {
    const delay = i * 0.2;
    return {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { delay, type: 'spring', duration: 1.5, bounce: 0 },
        opacity: { delay, duration: 0.01 }
      }
    };
  }
};
