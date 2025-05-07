import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Target, PiggyBank } from 'lucide-react';
import classNames from 'classnames';
import { useSupabase } from '../../lib/supabase/SupabaseProvider';
import { useAuthStore } from '../../stores/authStore';
import SpreadsheetUploader from '../../components/spreadsheet/SpreadsheetUploader';

const ONBOARDING_STEPS = [
  {
    title: 'Commitments',
    subtitle: 'Committing to your finances is the first step toward reaching your goals. He who is faithful with little will also be faithful with much.',
    icon: DollarSign,
    color: 'bg-amber-50',
    iconColor: 'text-amber-600',
    image: '/Commitments.png'
  },
  {
    title: 'Joy with Purpose',
    subtitle: "Enjoying life is not a waste—it's part of the journey. True rest renews your strength and prepares you for what's ahead.",
    icon: Target,
    color: 'bg-purple-50',
    iconColor: 'text-purple-600',
    image: '/Joy with Purpose.png'
  },
  {
    title: 'Sow for Tomorrow',
    subtitle: "Investing is more than multiplying resources — it's an act of wisdom and faith. Those who sow generously will also reap generously.",
    icon: PiggyBank,
    color: 'bg-purple-50',
    iconColor: 'text-purple-600',
    image: '/Sow for Tomorrow.png'
  }
];

export default function OnboardingPage() {
  // Prevent layout shift during navigation
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { supabase } = useSupabase();
  const { user } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [showUploader, setShowUploader] = useState(false);

  const handleNext = async () => {
    setIsLoading(true);
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setIsLoading(false);
      }, 100);
    } else {
      setShowUploader(true);
      setIsLoading(false);
    }
  };

  const handleUploadSuccess = async () => {
    if (user) {
      const { error } = await supabase
        .from('user_profiles')
        .update({ onboarding_completed: true })
        .eq('user_id', user.id);

      if (error) {
        console.error('Failed to update onboarding status:', error);
      }
    }
    navigate('/');
  };

  const handleSkipUpload = async () => {
    if (user) {
      const { error } = await supabase
        .from('user_profiles')
        .update({ onboarding_completed: true })
        .eq('user_id', user.id);

      if (error) {
        console.error('Failed to update onboarding status:', error);
      }
    }
    navigate('/');
  };

  const handleSkip = async () => {
    setIsLoading(true);
    if (currentStep === ONBOARDING_STEPS.length - 1) {
      handleSkipUpload();
    } else {
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setIsLoading(false);
      }, 100);
    }
  };



  const currentStepData = ONBOARDING_STEPS[currentStep];

  return (
    <div className={classNames('fixed inset-0 bg-white', {
      'pointer-events-none': isLoading
    })}>
      <div className="absolute inset-0 flex flex-col">
      {/* Spreadsheet Uploader Modal */}
      {showUploader && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Import Your Data</h2>
              <button onClick={() => setShowUploader(false)} className="text-gray-500 hover:text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <SpreadsheetUploader onClose={() => {
              setShowUploader(false);
              handleUploadSuccess();
            }} />
          </div>
        </div>
      )}
      {/* Progress Dots */}
      <div className="absolute top-8 left-0 right-0 flex justify-center gap-2 z-20 select-none pointer-events-none">
        {ONBOARDING_STEPS.map((_, index) => (
          <div
            key={index}
            className={classNames(
              'w-2 h-2 rounded-full transition-colors',
              index === currentStep ? 'bg-primary-600' : 'bg-gray-200'
            )}
          />
        ))}
      </div>

      {/* Content */}
      <div className={classNames(
        'flex-1 flex flex-col items-center justify-center px-6 py-12 relative z-10 transform-gpu',
        { 'opacity-50 transition-opacity duration-200': isLoading }
      )}>
        <div className="w-full max-w-sm text-center space-y-8 select-none">
          {/* Image */}
          <div className="mx-auto">
            <img
              src={currentStepData.image}
              alt={currentStepData.title}
              className="w-64 h-64 object-contain mx-auto select-none pointer-events-none"
              loading="eager"
            />
          </div>

          {/* Text Content */}
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-gray-900">
              {currentStepData.title}
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed">
              {currentStepData.subtitle}
            </p>
          </div>



          {/* Decorative Dots */}
          <div className="flex justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary-200" />
            <div className="w-2 h-2 rounded-full bg-primary-300" />
            <div className="w-2 h-2 rounded-full bg-primary-400" />
          </div>
        </div>
      </div>

      {/* Bottom Buttons */}
      <div className="p-6 space-y-4 relative z-10">
        <button
          onClick={handleNext}
          className="w-full bg-black text-white rounded-full py-4 font-semibold text-lg transition-colors hover:bg-gray-900"
        >
          {currentStep === ONBOARDING_STEPS.length - 1 ? 'Get Started' : 'Next Step'}
        </button>
        <button
          onClick={handleSkip}
          className="w-full text-gray-600 font-medium hover:text-gray-900 transition-colors"
        >
          {currentStep === ONBOARDING_STEPS.length - 1 ? 'Skip Import' : 'Skip This Step'}
        </button>
      </div>
      </div>
    </div>
  );
}