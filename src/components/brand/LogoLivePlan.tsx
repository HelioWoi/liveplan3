// Componente de logo com efeito gradiente e símbolo ³

interface LogoLivePlanProps {
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

export default function LogoLivePlan({ className = '', size = 'medium' }: LogoLivePlanProps) {
  // Define tamanhos baseados na prop size
  const textSizes = {
    small: 'text-2xl',
    medium: 'text-3xl',
    large: 'text-4xl'
  };
  
  return (
    <h1 className={`font-bold ${textSizes[size]} ${className}`}>
      <span className="bg-gradient-to-r from-purple-500 to-indigo-800 bg-clip-text text-transparent">
        LivePlan³
      </span>
    </h1>
  );
}
