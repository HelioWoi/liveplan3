import { ArrowLeft, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  showBackButton?: boolean;
  showMoreOptions?: boolean;
  onMoreClick?: () => void;
}

export function PageHeader({ 
  title, 
  showBackButton = true,
  showMoreOptions = false,
  onMoreClick
}: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="bg-[#120B39] text-white">
      <div className="relative">
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-[#120B39] rounded-b-[40px]"></div>
        <div className="relative px-4 pt-12 pb-6">
          <div className="flex items-center justify-between">
            {showBackButton ? (
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
            ) : (
              /* Spacer for alignment */
              <div className="w-10"></div>
            )}
            
            <h1 className="text-2xl font-bold">{title}</h1>
            
            {showMoreOptions ? (
              <button
                onClick={onMoreClick}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <MoreVertical className="h-6 w-6" />
              </button>
            ) : (
              /* Spacer for alignment */
              <div className="w-10"></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PageHeader