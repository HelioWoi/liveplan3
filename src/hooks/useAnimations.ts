import { Variants } from 'framer-motion';

export const useAnimations = () => {
  const slideIn = (direction: 'left' | 'right' | 'up' | 'down'): Variants => {
    const directions = {
      left: { x: -50 },
      right: { x: 50 },
      up: { y: -50 },
      down: { y: 50 }
    };

    return {
      hidden: {
        ...directions[direction],
        opacity: 0
      },
      visible: {
        x: 0,
        y: 0,
        opacity: 1,
        transition: {
          type: 'spring',
          damping: 20,
          stiffness: 300
        }
      },
      exit: {
        ...directions[direction],
        opacity: 0,
        transition: {
          type: 'spring',
          damping: 20,
          stiffness: 300
        }
      }
    };
  };

  const scale = (scale: number = 0.95): Variants => ({
    hidden: {
      scale,
      opacity: 0
    },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: 'spring',
        damping: 20,
        stiffness: 300
      }
    },
    exit: {
      scale,
      opacity: 0,
      transition: {
        type: 'spring',
        damping: 20,
        stiffness: 300
      }
    }
  });

  const fadeIn: Variants = {
    hidden: {
      opacity: 0
    },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.2
      }
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.2
      }
    }
  };

  const stagger = (staggerChildren: number = 0.1): Variants => ({
    hidden: {},
    visible: {
      transition: {
        staggerChildren
      }
    }
  });

  const pulse = (scale: number = 1.05): Variants => ({
    initial: {
      scale: 1
    },
    pulse: {
      scale: [1, scale, 1],
      transition: {
        duration: 0.4
      }
    }
  });

  const shake = (offset: number = 10): Variants => ({
    initial: {
      x: 0
    },
    shake: {
      x: [0, -offset, offset, -offset/2, offset/2, 0],
      transition: {
        duration: 0.4
      }
    }
  });

  const bounce = (height: number = 10): Variants => ({
    initial: {
      y: 0
    },
    bounce: {
      y: [0, -height, 0],
      transition: {
        type: 'spring',
        damping: 10,
        stiffness: 300
      }
    }
  });

  return {
    slideIn,
    scale,
    fadeIn,
    stagger,
    pulse,
    shake,
    bounce
  };
};
