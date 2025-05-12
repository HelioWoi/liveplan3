// Componente de logo com símbolo ³ garantido

interface CubeLogoLivePlanProps {
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

export default function CubeLogoLivePlan({ className = '', size = 'medium' }: CubeLogoLivePlanProps) {
  // Define tamanhos baseados na prop size
  const sizes = {
    small: 'text-2xl',
    medium: 'text-3xl',
    large: 'text-4xl'
  };
  
  // Usando HTML direto para garantir que o símbolo ³ seja exibido corretamente
  return (
    <div className={`font-bold ${sizes[size]} ${className} text-center`}>
      <span 
        className="bg-gradient-to-r from-purple-500 to-indigo-800 bg-clip-text text-transparent inline-block"
      >
        LivePlan<span style={{ verticalAlign: 'super', fontSize: '60%' }}>³</span>
      </span>
    </div>
  );
}
