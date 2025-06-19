import { useState } from "react";
import { Edit, HelpCircle, Info, Trash2 } from "lucide-react";

import Tooltip from "./Tooltip";
import { formatCurrency } from "../../../utils/formatters";
import { CATEGORY_DESCRIPTIONS } from "../../../constants";
import { ModalMultipleEntries } from "./ModalMultipleEntries";
import { EditModal } from "./EditModal";
import { useDeleteWeeklyBudget } from "../../../hooks/useCreateWeeklyBudget";
import { FullScreenLoader } from "./FullScreenLoader";


type Props = {
  // data: Record<string, any>;
  data: Record<string, { [week: number]: { id: string | null; amount: number; week: number; category: string, count: number, entries: any } }>; 
  activeWeek: number;
};

const weeks = [1, 2, 3, 4];
const textGreen = ['Income', 'Balance'];

export function BudgetMatrixTable({ data, activeWeek }: Props) {
  const { mutate: deleteBudget, isPending } = useDeleteWeeklyBudget();

  const [detailsData, setDetailsData] = useState<{category: string, week: number, entries: any[]}>({category: '', week: 1, entries: []});
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [entryToEdit, setEntryToEdit] = useState<any>(null);
  // Estado para controlar a entrada selecionada para movimentação
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null);
  const [showOptions, setShowOptions] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);
  const [entryToMove, setEntryToMove] = useState<string | null>(null);

   const handleSaveEdit = (updatedEntry: any) => {
    if (entryToEdit) {
      console.log('Saving edit for entry:', updatedEntry);
      setIsEditModalOpen(false);
      setEntryToEdit(null);
    }
  };

  const handleEditEntry = (entries: any) => {
    if (selectedEntry) {
      const entry = entries.find((e: any) => e.id === selectedEntry);

      if (entry) {
        setEntryToEdit(entry);
        setIsEditModalOpen(true);
      }
    }
  };

  // Função para abrir o modal de confirmação de deleção
  const handleDeleteEntry = (selectedEntry: any) => {
    if (selectedEntry) {
      setEntryToDelete(selectedEntry);
      setIsDeleteModalOpen(true);
    }
  };

  // Função para selecionar uma entrada para mover
  const handleSelectEntry = (entryId: string) => {
    if (selectedEntry === entryId) {
      // Se clicar no mesmo item novamente, alterna a exibição das opções
      setShowOptions(!showOptions);
    } else {
      // Se clicar em um novo item, seleciona e mostra as opções
      setSelectedEntry(entryId);
      setShowOptions(true);
    }
  };

  // Função para confirmar a deleção
  const confirmDelete = () => {
    if (entryToDelete) {
      // deleteEntry(entryToDelete);
      deleteBudget(entryToDelete);
      setEntryToDelete(null);
      setIsDeleteModalOpen(false);
      setSelectedEntry(null);
      setShowOptions(false);
    }
  };
  
  return (
    <>
      { isPending && <FullScreenLoader /> }
      <div className="bg-white rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                {weeks.map((week) => (
                <th
                    key={week}
                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider 
                      ${week === activeWeek ? 'bg-purple-50' : 'bg-gray-50'}`}
                >
                    WEEK {week}
                </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.entries(data).map(([category, values]) => {
                return (
                  <tr key={category} className={category === 'Balance' ? 'bg-gray-50' : 'hover:bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div className="flex items-center">
                        {category}

                        {category !== 'Balance' &&
                          <Tooltip content={CATEGORY_DESCRIPTIONS[category] || ''}>
                            <HelpCircle className="h-4 w-4 text-gray-400 ml-1" />
                          </Tooltip>
                        }
                        
                      </div>
                    </td>

                    {weeks.map((week) => {
                      const isCurrentWeek = week === activeWeek;

                      return (
                      <td
                        data-id={values[week].id || ''}
                        data-category={values[week].category}
                        data-week={values[week].week}
                        data-amount={values[week].amount}
                        key={week}
                        className={`px-6 py-4 whitespace-nowrap text-sm ${isCurrentWeek ? 'bg-purple-50' : ''}`}
                      >
                        
                          {values[week].count > 1 ?

                            <div
                              className={`text-gray-500 
                                ${values[week].amount < 1 ? '' : 'hover:bg-gray-100'}
                                ${!textGreen.includes(values[week].category) && values[week].amount > 0 ? 'mb-1 p-1 rounded cursor-pointer text-yellow-600' : ''}
                                ${textGreen.includes(values[week].category) && values[week].amount > 0 ? 'mb-1 p-1 rounded cursor-pointer text-green-600' : ''}
                                ${values[week].category === 'Balance' && values[week].amount < 0 ? 'mb-1 p-1 rounded cursor-pointer text-red-600' : ''}
                              `}
                            >
                              <div className="flex items-center relative" 
                                onClick={() => {
                                  setDetailsData({
                                    category: values[week].category,
                                    week: values[week].week,
                                    entries: values[week].entries || []
                                  });
                                  setIsDetailsModalOpen(true);
                                }}
                              >
                                {formatCurrency(values[week].amount)}

                                {values[week].count > 1 && (
                                  <>
                                    <span className="ml-2 text-gray-500 text-xs">
                                      ({values[week].count})
                                    </span>

                                    <Info size={16} className="text-blue-500 ml-1" />
                                  </>
                                )}

                                {/* Options for edit and delete */}
                                  {selectedEntry === values[week].id && showOptions && (
                                    <div className="absolute right-0 top-0 bg-white shadow-lg rounded-md p-1 z-10 flex space-x-1">
                                    <button 
                                      onClick={() => handleEditEntry(values[week].entries)}
                                      className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                                      title="Edit"
                                    >
                                      <Edit size={16} />
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteEntry(values[week].entries)}
                                      className="p-1 text-red-600 hover:bg-red-100 rounded"
                                      title="Delete"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                  
                                )}
                              </div>
                            </div>
                          :
                            // Single entry - show as before
                            <div key={values[week].id} className="relative">
                              <div
                                onClick={() => handleSelectEntry(values[week].id || '')}
                                data-id={values[week].id || ''}
                                data-category={values[week].category}
                                className={`text-gray-500 
                                  ${values[week].amount < 1 ? '' : 'hover:bg-gray-100'}
                                  ${!textGreen.includes(values[week].category) && values[week].amount > 0 ? 'mb-1 p-1 rounded cursor-pointer text-yellow-600' : ''}
                                  ${textGreen.includes(values[week].category) && values[week].amount > 0 ? 'mb-1 p-1 rounded cursor-pointer text-green-600' : ''}
                                  ${values[week].category === 'Balance' && values[week].amount < 0 ? 'mb-1 p-1 rounded cursor-pointer text-red-600' : ''}
                                `}
                              >
                                {formatCurrency(values[week].amount)}
                              </div>

                              {/* Options for edit and delete */}
                              {selectedEntry === values[week].id && showOptions && (
                                <div className="absolute right-0 top-0 bg-white shadow-lg rounded-md p-1 z-10 flex space-x-1">
                                  <button 
                                    onClick={() => handleEditEntry(values[week].entries)}
                                    className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                                    title="Edit"
                                  >
                                    <Edit size={16} />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteEntry(selectedEntry)}
                                    className="p-1 text-red-600 hover:bg-red-100 rounded"
                                    title="Delete"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              )}
                            </div>
                          }
                      </td>
                    )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    
      {isEditModalOpen && (
        <EditModal 
          handleSaveEdit={handleSaveEdit}
          entryToEdit={entryToEdit}
          setIsEditModalOpen={setIsEditModalOpen}
          setEntryToEdit={setEntryToEdit}
        />
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Confirm Delete</h2>
            <p className="mb-6 text-gray-600">Are you sure you want to delete this entry?</p>
            <div className="flex justify-end space-x-2">
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {isDetailsModalOpen &&
        <ModalMultipleEntries
          detailsData={detailsData}
          setIsDetailsModalOpen={setIsDetailsModalOpen}
          setEntryToEdit={setEntryToEdit}
          setIsEditModalOpen={setIsEditModalOpen}
          setEntryToMove={setEntryToMove}
          setIsMoveModalOpen={setIsMoveModalOpen}
          setEntryToDelete={setEntryToDelete}
          setIsDeleteModalOpen={setIsDeleteModalOpen}
        />
      }
      
    </>
  );
}
