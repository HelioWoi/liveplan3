import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';

interface QuickActionsProps {
  onOpenAddEntryModal: () => void;
}

export default function QuickActions({ onOpenAddEntryModal }: QuickActionsProps) {
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  // Hide on scroll down (mobile only)
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth > 768) return; // Only mobile
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 32) {
        setVisible(false);
      } else {
        setVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  // Função simplificada para abrir diretamente o modal Add New Entry

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 60 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="fixed bottom-20 right-4 z-50"
        >
          {/* Botão único para abrir o modal Add New Entry */}
          <button
            onClick={onOpenAddEntryModal}
            className="p-4 rounded-full bg-[#1A1A40] text-white
                     shadow-lg hover:bg-[#2A2A50] transition-all duration-300
                     flex items-center justify-center"
          >
            <Plus className="h-6 w-6" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
