import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Target, PiggyBank, Upload, FileSpreadsheet, Check, AlertCircle } from 'lucide-react';
import classNames from 'classnames';
import SpreadsheetUploader from '../../components/spreadsheet/SpreadsheetUploader';
import { useSupabase } from '../../lib/supabase/SupabaseProvider';
import { useAuthStore } from '../../stores/authStore';

const ONBOARDING_STEPS = [
  {
    title: 'Commitments',
    subtitle: 'Committing to your finances is the first step toward reaching your goals. He who is faithful with little will also be faithful with much.',
    icon: DollarSign,
    color: 'bg-primary-100',
    iconColor: 'text-primary-600'
  },
  {
    title: 'Set Your Goals',
    subtitle: 'Define clear financial goals and track your progress. Whether it\'s saving for a home or building an emergency fund, we\'ll help you get there.',
    icon: Target,
    color: 'bg-success-100',
    iconColor: 'text-success-600'
  },
  {
    title: 'Track Expenses',
    subtitle: 'Keep track of where your money goes. Understanding your spending habits is key to better financial management.',
    icon: PiggyBank,
    color: 'bg-warning-100',
    iconColor: 'text-warning-600'
  },
  {
    title: 'Import Your Data',
    subtitle: 'Upload your financial spreadsheet to get started with your existing data, or skip this step to start fresh.',
    icon: FileSpreadsheet,
    color: 'bg-accent-100',
    iconColor: 'text-accent-600'
  }
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { supabase } = useSupabase();
  const { user } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [showUploader, setShowUploader] = useState(false);

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

  const handleUploadSuccess = async () => {
    setShowUploader(false);
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
          {/* Icon */}
          <div className="mx-auto">
            <div className={classNames(
              'w-24 h-24 rounded-full flex items-center justify-center mx-auto',
              currentStepData.color
            )}>
              <currentStepData.icon className={classNames(
                'h-12 w-12',
                currentStepData.iconColor
              )} />
            </div>
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

          {/* Import Data Step */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <button
                onClick={() => setShowUploader(true)}
                className="w-full bg-primary-600 text-white rounded-xl py-4 font-semibold text-lg transition-colors hover:bg-primary-700"
              >
                Import Data
              </button>

              <div className="bg-gray-50 rounded-lg p-4 text-left">
                <p className="text-sm text-gray-600 font-medium mb-2">Your spreadsheet should include:</p>
                <ul className="text-sm text-gray-500 space-y-1 list-disc list-inside">
                  <li>Date (YYYY-MM-DD format)</li>
                  <li>Type (Income/Expense)</li>
                  <li>Category (e.g., Salary, Rent, Groceries)</li>
                  <li>Description</li>
                  <li>Amount (numeric value)</li>
                </ul>
              </div>
            </div>
          )}

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
          {currentStep === ONBOARDING_STEPS.length - 1 ? 'Start Fresh' : 'Next Step'}
        </button>
        <button
          onClick={handleSkip}
          className="w-full text-gray-600 font-medium hover:text-gray-900 transition-colors"
        >
          Skip This Step
        </button>
      </div>

      {/* Spreadsheet Uploader Modal */}
      {showUploader && (
        <SpreadsheetUploader onClose={() => setShowUploader(false)} />
      )}
    </div>
  );
}