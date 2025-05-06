import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAnimations } from '../../hooks/useAnimations';

interface AnimatedListProps {
  items: any[];
  renderItem: (item: any, index: number) => ReactNode;
  keyExtractor: (item: any) => string | number;
  className?: string;
  itemClassName?: string;
  staggerDelay?: number;
  animation?: 'fade' | 'slide' | 'scale';
  direction?: 'left' | 'right' | 'up' | 'down';
  empty?: ReactNode;
  loading?: boolean;
  loadingItems?: number;
}

export default function AnimatedList({
  items,
  renderItem,
  keyExtractor,
  className = '',
  itemClassName = '',
  staggerDelay = 0.05,
  animation = 'scale',
  direction = 'up',
  empty,
  loading = false,
  loadingItems = 3
}: AnimatedListProps) {
  const { slideIn, scale, fadeIn, stagger } = useAnimations();

  const getAnimation = () => {
    switch (animation) {
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

  const containerAnimation = stagger(staggerDelay);
  const itemAnimation = getAnimation();

  if (loading) {
    return (
      <motion.div
        variants={containerAnimation}
        initial="hidden"
        animate="visible"
        className={className}
      >
        {[...Array(loadingItems)].map((_, index) => (
          <motion.div
            key={`skeleton-${index}`}
            variants={itemAnimation}
            className={`
              animate-pulse bg-gray-100 rounded-lg h-24
              ${itemClassName}
            `}
          />
        ))}
      </motion.div>
    );
  }

  if (items.length === 0 && empty) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-8 text-gray-500"
      >
        {empty}
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerAnimation}
      initial="hidden"
      animate="visible"
      className={className}
    >
      <AnimatePresence mode="sync">
        {items.map((item, index) => (
          <motion.div
            key={keyExtractor(item)}
            variants={itemAnimation}
            initial="hidden"
            animate="visible"
            exit="exit"
            layout
            className={itemClassName}
          >
            {renderItem(item, index)}
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
