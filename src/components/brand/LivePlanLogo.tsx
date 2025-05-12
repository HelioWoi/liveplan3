// Componente de logo com efeito gradiente

interface LivePlanLogoProps {
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

export default function LivePlanLogo({ className = '', size = 'medium' }: LivePlanLogoProps) {
  // Define tamanhos baseados na prop size
  const textSizes = {
    small: 'text-2xl',
    medium: 'text-3xl',
    large: 'text-4xl'
  };
  
  const supSizes = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-xl'
  };
  
  return (
    <h1 className={`font-bold ${textSizes[size]} ${className}`}>
      <span className="bg-gradient-to-r from-purple-500 to-indigo-800 bg-clip-text text-transparent">
        LivePlan<sup className={`${supSizes[size]} align-super`} dangerouslySetInnerHTML={{ __html: '³' }}></sup>
      </span>
    </h1>
  );
}
