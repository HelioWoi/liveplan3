import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { Goal } from '../../stores/goalsStore';
import { formatCurrency } from '../../utils/formatters';
import { formatDistance } from 'date-fns';

interface GoalDetailsModalProps {
  goal: Goal | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function GoalDetailsModal({ goal, isOpen, onClose }: GoalDetailsModalProps) {
  if (!goal) return null;

  const progress = (goal.current_amount / goal.target_amount) * 100;
  const timeLeft = formatDistance(new Date(goal.target_date), new Date(), { addSuffix: true });

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  {goal.title}
                </Dialog.Title>

                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-4">
                    {goal.description}
                  </p>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{progress.toFixed(1)}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-600 transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Current Amount</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {formatCurrency(goal.current_amount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Target Amount</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {formatCurrency(goal.target_amount)}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">Target Date</p>
                      <p className="text-base text-gray-900">{timeLeft}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-primary-100 px-4 py-2 text-sm font-medium text-primary-900 hover:bg-primary-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                    onClick={onClose}
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
