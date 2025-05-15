import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface SplashScreenProps {
  duration?: number; // Duração em ms
  redirectTo?: string; // Rota para redirecionar após a animação
}

export default function SplashScreen({ 
  duration = 3000, 
  redirectTo = '/login' 
}: SplashScreenProps) {
  const navigate = useNavigate();
  const [showBetaText, setShowBetaText] = useState(false);

  useEffect(() => {
    // Mostrar o texto "Beta Version" após um pequeno delay
    const betaTextTimer = setTimeout(() => {
      setShowBetaText(true);
    }, 1000);

    // Redirecionar após a duração especificada
    const redirectTimer = setTimeout(() => {
      navigate(redirectTo);
    }, duration);

    // Limpar timers quando o componente for desmontado
    return () => {
      clearTimeout(betaTextTimer);
      clearTimeout(redirectTimer);
    };
  }, [navigate, redirectTo, duration]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-purple-600 via-purple-800 to-indigo-900">
      <div className="flex flex-col items-center justify-center h-full">
        {/* Logo animado com efeito mais impressionante */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: -50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ 
            duration: 1.2,
            ease: "easeOut",
            delay: 0.3
          }}
          className="mb-12"
        >
          <img 
            src="/logo/logo LivePlan3 white-slogan.svg" 
            alt="LivePlan³" 
            className="h-64 md:h-80 lg:h-96 w-auto"
          />
        </motion.div>
        
        {/* Texto "Beta Version" com animação aprimorada */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: showBetaText ? 1 : 0, y: showBetaText ? 0 : 20 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mt-auto absolute bottom-20"
        >
          <p className="text-white text-2xl font-light tracking-widest">Beta Version</p>
        </motion.div>
      </div>
    </div>
  );
}
