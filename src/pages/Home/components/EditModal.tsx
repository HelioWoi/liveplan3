

export const EditModal = ({ handleSaveEdit, entryToEdit, setIsEditModalOpen, setEntryToEdit }: any) => {
  console.log('EditModal entryToEdit:', entryToEdit);
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Edit Entry</h2>
        <form onSubmit={(e) => {
          e.preventDefault();
          const form = e.target as HTMLFormElement;
          const description = (form.elements.namedItem('description') as HTMLInputElement).value;
          const amount = parseFloat((form.elements.namedItem('amount') as HTMLInputElement).value);
          const category = (form.elements.namedItem('category') as HTMLSelectElement).value;
          const uuid_weekly_budget = (form.elements.namedItem('uuid_weekly_budget') as HTMLInputElement).value;
          
          handleSaveEdit({
            description,
            amount,
            category,
            uuid_weekly_budget
          });
        }}>
          <div className="mb-4">
            <input
              type="hidden"
              name="uuid_weekly_budget"
              value={entryToEdit.id}
            />
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input 
              type="text" 
              name="description"
              defaultValue={entryToEdit.description}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <input 
              type="number" 
              name="amount"
              step="0.01"
              defaultValue={entryToEdit.amount}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select 
              name="category"
              defaultValue={entryToEdit.category}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="Income">Income</option>
              <option value="Fixed">Fixed Expense</option>
              <option value="Variable">Variable Expense</option>
              <option value="Extra">Extra</option>
              <option value="Additional">Additional</option>
            </select>
          </div>
          <div className="flex justify-end space-x-2">
            <button 
              type="button"
              onClick={() => {
                setIsEditModalOpen(false);
                setEntryToEdit(null);
              }}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}