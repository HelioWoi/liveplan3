import { ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { useAnimations } from '../../hooks/useAnimations';

interface AnimatedCardProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  variant?: 'scale' | 'slide' | 'fade';
  direction?: 'left' | 'right' | 'up' | 'down';
  delay?: number;
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
}

export default function AnimatedCard({
  children,
  variant = 'scale',
  direction = 'up',
  delay = 0,
  className = '',
  onClick,
  interactive = true,
  ...props
}: AnimatedCardProps) {
  const { slideIn, scale, fadeIn } = useAnimations();

  const getAnimation = () => {
    switch (variant) {
      case 'slide':
        return slideIn(direction);
      case 'scale':
        return scale();
      case 'fade':
        return fadeIn;
      default:
        return scale();
    }
  };

  const animation = getAnimation();

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={animation}
      transition={{ delay }}
      whileHover={interactive ? { scale: 1.02 } : undefined}
      whileTap={interactive ? { scale: 0.98 } : undefined}
      className={`
        rounded-lg bg-white shadow-sm border border-gray-100
        ${interactive ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}
        ${className}
      `}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.div>
  );
}
