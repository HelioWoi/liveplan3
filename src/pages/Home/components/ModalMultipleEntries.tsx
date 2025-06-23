import { Edit, Trash2, X, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';

type ModalMultipleEntriesProps = {
  detailsData: any;
  setIsDetailsModalOpen: any;
  setEntryToEdit: any;
  setIsEditModalOpen: any;
  setEntryToMove: any;
  setIsMoveModalOpen: any;
  setEntryToDelete: any;
  setIsDeleteModalOpen: any;
};

export const ModalMultipleEntries = ({
  detailsData,
  setIsDetailsModalOpen,
  setEntryToEdit,
  setIsEditModalOpen,
  setEntryToMove,
  setIsMoveModalOpen,
  setEntryToDelete,
  setIsDeleteModalOpen,
}: ModalMultipleEntriesProps) => {
  console.log('ModalMultipleEntries detailsData:', detailsData);
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{detailsData?.category} - Week {detailsData?.week}</h2>
          <button 
            onClick={() => setIsDetailsModalOpen(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="overflow-y-auto flex-grow">
          {detailsData?.entries?.map((entry: any) => (
            <div key={entry.id} className="mb-3 p-3 border border-gray-200 rounded-md hover:bg-gray-50">
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium">{entry.description}</span>
                <span className={`font-semibold ${entry.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(entry.amount)}
                </span>
              </div>
              <div className="flex justify-end space-x-2 mt-2">
                <button
                  onClick={() => {
                    setEntryToEdit(entry);
                    setIsEditModalOpen(true);
                    setIsDetailsModalOpen(false);
                  }}
                  className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded flex items-center"
                  data-entry-id={entry.id}
                >
                  <Edit size={14} className="mr-1" /> Edit
                </button>
                <button
                  onClick={() => {
                    setEntryToMove(entry.id);
                    setIsMoveModalOpen(true);
                    setIsDetailsModalOpen(false);
                  }}
                  className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded flex items-center"
                  data-entry-id={entry.id}
                >
                  <ArrowRight size={14} className="mr-1" /> Move
                </button>
                <button
                  onClick={() => {
                    setEntryToDelete(entry.id);
                    setIsDeleteModalOpen(true);
                    setIsDetailsModalOpen(false);
                  }}
                  className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded flex items-center"
                  data-entry-id={entry.id}
                >
                  <Trash2 size={14} className="mr-1" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="font-medium">Total:</span>
            <span className={`font-bold text-lg ${detailsData?.entries?.reduce((total: any, entry:any) => total + entry.amount, 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(detailsData?.entries?.reduce((total: any, entry:any) => total + entry.amount, 0))}
            </span>
          </div>
          <button
            onClick={() => setIsDetailsModalOpen(false)}
            className="w-full mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}