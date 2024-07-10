import React, {useState} from "react";
import app from "../config/firebase";
import {getDatabase, ref, push} from "firebase/database";

function ModalTestQuestion({ isOpen, onClose, onSave, children, itemsInput, answerSheet }) {
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
        
        <div className="ml-20 inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-5 text-left overflow-hidden shadow-xl transform transition-all sm:my-2 sm:align-middle sm:max-w-3xl sm:w-full sm:p-6">
          <div className="max-h-96 overflow-y-auto">
            {children}
            {itemsInput && itemsInput.map((item, index) => (
              <div key={index} className="mt-4">
                <p className="font-semibold">{`Question ${index + 1}`}</p>
                <input
                  className="w-full mt-2 border border-gray-300 rounded-md p-2"
                  placeholder={`Enter question ${index + 1}`}
                  value={item.question}
                  readOnly
                />
                <p className="mt-2 font-semibold">Answer Choices:</p>
                {item.choices.map((choice, choiceIndex) => (
                  <div key={choiceIndex} className="flex items-center mt-1">
                    <input
                      className="w-full border border-gray-300 rounded-md p-2"
                      placeholder={`Enter choice ${String.fromCharCode(65 + choiceIndex)}`}
                      value={choice.text}
                      readOnly
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
          
        </div>
      </div>
    </div>
  );
}

export default ModalTestQuestion;
