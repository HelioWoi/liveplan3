import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Target, PiggyBank } from 'lucide-react';
import classNames from 'classnames';
import { useSupabase } from '../../lib/supabase/SupabaseProvider';
import { useAuthStore } from '../../stores/authStore';

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
  const navigate = useNavigate();
  const { supabase } = useSupabase();
  const { user } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(0);


  const handleNext = async () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Mark onboarding as completed
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
    }
  };

  const handleSkip = async () => {
    // Mark onboarding as completed
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



  const currentStepData = ONBOARDING_STEPS[currentStep];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Progress Dots */}
      <div className="fixed top-8 left-0 right-0 flex justify-center gap-2">
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
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 animate-fade-in">
        <div className="w-full max-w-sm text-center space-y-8">
          {/* Image */}
          <div className="mx-auto">
            <img
              src={currentStepData.image}
              alt={currentStepData.title}
              className="w-64 h-64 object-contain mx-auto"
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
      <div className="p-6 space-y-4">
        <button
          onClick={handleNext}
          className="w-full bg-black text-white rounded-full py-4 font-semibold text-lg transition-colors hover:bg-gray-900"
        >
          {currentStep === ONBOARDING_STEPS.length - 1 ? 'Create Account' : 'Next Step'}
        </button>
        <button
          onClick={handleSkip}
          className="w-full text-gray-600 font-medium hover:text-gray-900 transition-colors"
        >
          Skip This Step
        </button>
      </div>


    </div>
  );
}