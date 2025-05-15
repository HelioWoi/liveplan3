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
        {/* Logo animado */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            duration: 0.8,
            ease: "easeOut"
          }}
          className="mb-8"
        >
          <img 
            src="/logo/logo LivePlan3 white-slogan.svg" 
            alt="LivePlan³" 
            className="h-40 md:h-48"
          />
        </motion.div>
        
        {/* Texto "Beta Version" com fade in */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: showBetaText ? 1 : 0 }}
          transition={{ duration: 0.5 }}
          className="mt-auto absolute bottom-16"
        >
          <p className="text-white text-xl font-light">Beta Version</p>
        </motion.div>
      </div>
    </div>
  );
}
