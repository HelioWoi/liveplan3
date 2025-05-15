import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState, useEffect } from 'react';
import { Goal, useGoalsStore } from '../../stores/goalsStore';
import { formatCurrency } from '../../utils/formatters';
import { formatDistance } from 'date-fns';
import { Edit2 } from 'lucide-react';

interface GoalDetailsModalProps {
  goal: Goal | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function GoalDetailsModal({ goal, isOpen, onClose }: GoalDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editMode, setEditMode] = useState<'title' | 'description' | 'target' | 'current' | 'date' | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const { updateGoal } = useGoalsStore();
  
  // Reset editing state when modal is closed or goal changes
  useEffect(() => {
    if (!isOpen) {
      setIsEditing(false);
      setEditMode(null);
      setEditValue('');
    }
  }, [isOpen, goal]);
  
  if (!goal) return null;

  const progress = (goal.current_amount / goal.target_amount) * 100;
  const timeLeft = formatDistance(new Date(goal.target_date), new Date(), { addSuffix: true });
  
  // Function to close edit mode
  const closeEditMode = () => {
    setIsEditing(false);
    setEditMode(null);
    setEditValue('');
  };
  
  // Function to handle cancel button click
  const handleCancel = () => {
    setEditMode(null);
    setEditValue('');
  };
  
  // Function to handle back button click
  const handleBack = () => {
    setEditMode(null);
  };
  
  const startEditing = (mode: 'title' | 'description' | 'target' | 'current' | 'date') => {
    console.log('Starting edit mode:', mode);
    setEditMode(mode);
    switch (mode) {
      case 'title':
        setEditValue(goal.title);
        break;
      case 'description':
        setEditValue(goal.description);
        break;
      case 'target':
        setEditValue(goal.target_amount.toString());
        break;
      case 'current':
        setEditValue(goal.current_amount.toString());
        break;
      case 'date':
        // Format date to YYYY-MM-DD for input
        const date = new Date(goal.target_date);
        setEditValue(date.toISOString().split('T')[0]);
        break;
    }
    // Ensure we're in editing mode
    setIsEditing(true);
  };
  
  const saveEdit = async () => {
    if (!editMode || !goal) return;
    
    try {
      const updates: Partial<Goal> = {};
      
      switch (editMode) {
        case 'title':
          updates.title = editValue;
          break;
        case 'description':
          updates.description = editValue;
          break;
        case 'target':
          updates.target_amount = Number(editValue);
          break;
        case 'current':
          updates.current_amount = Number(editValue);
          break;
        case 'date':
          updates.target_date = new Date(editValue).toISOString();
          break;
      }
      
      console.log('Updating goal with:', updates);
      await updateGoal(goal.id, updates);
      
      // Close the edit mode
      setEditMode(null);
      setIsEditing(false);
      
      // Show success message
      alert('Goal updated successfully!');
    } catch (error) {
      console.error('Failed to update goal:', error);
      alert('Failed to update goal. Please try again.');
    }
  };

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
                {isEditing ? (
                  <>
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                      Edit Goal
                    </Dialog.Title>
                    <div className="mt-4">
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 gap-4">
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="font-medium">What would you like to edit?</h4>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              <button 
                                className={`p-3 rounded-lg border ${editMode === 'title' ? 'bg-primary-50 border-primary-300' : 'border-gray-200 hover:border-primary-200'} flex items-center`}
                                onClick={() => startEditing('title')}
                              >
                                <div className="ml-2">
                                  <p className="font-medium">Title</p>
                                  <p className="text-xs text-gray-500">Change the goal name</p>
                                </div>
                              </button>
                              
                              <button 
                                className={`p-3 rounded-lg border ${editMode === 'description' ? 'bg-primary-50 border-primary-300' : 'border-gray-200 hover:border-primary-200'} flex items-center`}
                                onClick={() => startEditing('description')}
                              >
                                <div className="ml-2">
                                  <p className="font-medium">Description</p>
                                  <p className="text-xs text-gray-500">Modify the description</p>
                                </div>
                              </button>
                              
                              <button 
                                className={`p-3 rounded-lg border ${editMode === 'target' ? 'bg-primary-50 border-primary-300' : 'border-gray-200 hover:border-primary-200'} flex items-center`}
                                onClick={() => startEditing('target')}
                              >
                                <div className="ml-2">
                                  <p className="font-medium">Target Amount</p>
                                  <p className="text-xs text-gray-500">Change the goal's total amount</p>
                                </div>
                              </button>
                              
                              <button 
                                className={`p-3 rounded-lg border ${editMode === 'current' ? 'bg-primary-50 border-primary-300' : 'border-gray-200 hover:border-primary-200'} flex items-center`}
                                onClick={() => startEditing('current')}
                              >
                                <div className="ml-2">
                                  <p className="font-medium">Current Amount</p>
                                  <p className="text-xs text-gray-500">Update the amount already saved</p>
                                </div>
                              </button>
                              
                              <button 
                                className={`p-3 rounded-lg border ${editMode === 'date' ? 'bg-primary-50 border-primary-300' : 'border-gray-200 hover:border-primary-200'} flex items-center`}
                                onClick={() => startEditing('date')}
                              >
                                <div className="ml-2">
                                  <p className="font-medium">Target Date</p>
                                  <p className="text-xs text-gray-500">Modify the deadline</p>
                                </div>
                              </button>
                            </div>
                          </div>
                          
                          {editMode && (
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <h4 className="font-medium mb-3">
                                {editMode === 'title' && 'Edit Title'}
                                {editMode === 'description' && 'Edit Description'}
                                {editMode === 'target' && 'Edit Target Amount'}
                                {editMode === 'current' && 'Edit Current Amount'}
                                {editMode === 'date' && 'Edit Target Date'}
                              </h4>
                              
                              {editMode === 'description' ? (
                                <textarea
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  className="w-full p-2 border border-gray-300 rounded-md"
                                  rows={3}
                                />
                              ) : editMode === 'date' ? (
                                <input
                                  type="date"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  className="w-full p-2 border border-gray-300 rounded-md"
                                />
                              ) : editMode === 'target' || editMode === 'current' ? (
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  className="w-full p-2 border border-gray-300 rounded-md"
                                />
                              ) : (
                                <input
                                  type="text"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  className="w-full p-2 border border-gray-300 rounded-md"
                                />
                              )}
                              
                              <div className="flex gap-2 mt-3">
                                <button 
                                  className="btn btn-primary flex-1"
                                  onClick={saveEdit}
                                >
                                  Save
                                </button>
                                <button 
                                  className="btn btn-outline flex-1"
                                  onClick={handleCancel}
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex justify-end">
                          <button 
                            className="btn btn-outline"
                            onClick={handleBack}
                          >
                            Back
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
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

                    <div className="mt-6 flex justify-between">
                      <button
                        type="button"
                        className="inline-flex justify-center rounded-md border border-transparent bg-primary-100 px-4 py-2 text-sm font-medium text-primary-900 hover:bg-primary-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                        onClick={onClose}
                      >
                        Close
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          // Apenas ativar o modo de edição sem selecionar um campo específico
                          setIsEditing(true);
                          setEditMode(null);
                          console.log('Edit mode activated');
                        }}
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit
                      </button>
                    </div>
                  </>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
