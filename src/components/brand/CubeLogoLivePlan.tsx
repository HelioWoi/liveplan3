// Componente de logo usando o arquivo SVG oficial

interface CubeLogoLivePlanProps {
  className?: string;
  size?: 'small' | 'medium' | 'large' | 'xlarge' | 'xxlarge' | 'huge' | 'massive' | 'giant' | 'enormous' | 'colossal';
  withSlogan?: boolean;
}

export default function CubeLogoLivePlan({ 
  className = '', 
  size = 'medium',
  withSlogan = false
}: CubeLogoLivePlanProps) {
  // Define tamanhos baseados na prop size
  const sizes = {
    small: 'h-8',
    medium: 'h-12',
    large: 'h-16',
    xlarge: 'h-20',
    xxlarge: 'h-24',
    huge: 'h-32',
    massive: 'h-40',
    giant: 'h-48',
    enormous: 'h-56',
    colossal: 'h-64'
  };
  
  // Usa o arquivo SVG oficial do logo
  const logoPath = withSlogan 
    ? '/logo/logo LivePlan3-slogan.svg'
    : '/logo/logo LivePlan3.svg';
    
  return (
    <div className={`${className} text-center`}>
      <img 
        src={logoPath} 
        alt="LivePlan³" 
        className={`${sizes[size]} inline-block`} 
      />
    </div>
  );
}
