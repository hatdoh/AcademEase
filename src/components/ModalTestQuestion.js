import React from 'react';

function ModalTestQuestion({ isOpen, onClose, onSave, children }) {
  if (!isOpen) return null;

  const handleSave = () => {
    onSave();
    onClose();
  };

  return (
    <div className="fixed z-20 inset-0 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-5 text-left overflow-hidden shadow-xl transform transition-all sm:my-2 sm:align-middle sm:max-w-3xl sm:w-full sm:p-6">
          <div className="max-h-96 overflow-y-auto">
            {children}
          </div>
          <div className="mb-5 mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="mt-3 mb-5 mr-24 px-20 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
            type="button"
            className="mr-8 mb-5 ml-4 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
            onClick={handleSave}
          >
            Save
          </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModalTestQuestion;
