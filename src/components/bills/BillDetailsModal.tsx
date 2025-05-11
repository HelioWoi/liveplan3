import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import type { Transaction } from '../../types/transaction';
import { formatCurrency } from '../../utils/formatters';
import { format } from 'date-fns';
import { Calendar, DollarSign, CheckCircle } from 'lucide-react';
import { useTransactionStore } from '../../stores/transactionStore';
import { toast } from 'react-hot-toast';

interface BillDetailsModalProps {
  bill: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function BillDetailsModal({ bill, isOpen, onClose }: BillDetailsModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { updateTransaction } = useTransactionStore();
  
  if (!bill) return null;
  
  const handleMarkAsPaid = async () => {
    if (!bill) return;
    
    setIsProcessing(true);
    try {
      // Criar uma cópia da transação com prefixo PAID: no origin
      await updateTransaction(bill.id, {
        origin: `PAID: ${bill.origin}`,
      });
      
      // Criar uma nova transação no statement para registrar o pagamento
      // Não precisamos criar uma nova transação, apenas marcar a existente como paga
      
      toast.success('Bill marked as paid successfully!');
      onClose();
    } catch (error) {
      console.error('Error marking bill as paid:', error);
      toast.error('Failed to mark bill as paid');
    } finally {
      setIsProcessing(false);
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
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 mb-4"
                >
                  Bill Details
                </Dialog.Title>

                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-full bg-primary-50">
                        <DollarSign className="h-5 w-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Amount</p>
                        <p className="text-lg font-semibold">{formatCurrency(bill.amount)}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-primary-50">
                        <Calendar className="h-5 w-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Due Date</p>
                        <p className="text-lg font-semibold">{format(new Date(bill.date), 'PPP')}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Description</h4>
                    <p className="text-gray-900">{bill.origin}</p>
                  </div>
                </div>

                <div className="mt-6 flex justify-between">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleMarkAsPaid}
                    disabled={isProcessing || bill.origin.startsWith('PAID:')}
                  >
                    {isProcessing ? (
                      'Processing...'
                    ) : bill.origin.startsWith('PAID:') ? (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Already Paid
                      </>
                    ) : (
                      'Mark as Paid'
                    )}
                  </button>
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
