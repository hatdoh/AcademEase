import React, { useState } from 'react';
import edit from '../res/img/edit-icon.png';
import print from '../res/img/print-icon.jpg';
import trash from '../res/img/trash-icon.jpg';
import add from '../res/img/add.webp'; // Import the add icon
import ModalTestQuestion from './ModalTestQuestion'; // Import the Modal component

function NewTest(props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [testName, setTestName] = useState('');
  const [itemsInput, setItemsInput] = useState([]);
  const [answerSheet, setAnswerSheet] = useState([]);
  const [savedTests, setSavedTests] = useState([]);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleDropdownChange = (e) => {
    const count = parseInt(e.target.value);
    setSelectedOption(count);
    setItemsInput(Array.from({ length: count }, (_, index) => `Question ${index + 1}`));
    const answerSet = Array.from({ length: count }, () => ['A', 'B', 'C', 'D']);
    setAnswerSheet(answerSet.map(answer => ({ selected: null, options: answer })));
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleNameChange = (e) => {
    setTestName(e.target.value);
  };

  const handleAnswerClick = (answerIndex, optionIndex) => {
    setAnswerSheet(prevAnswerSheet =>
      prevAnswerSheet.map((answer, index) => ({
        ...answer,
        selected: index === answerIndex ? optionIndex : answer.selected
      }))
    );
  };

  const handleSave = () => {
    const newTest = { name: testName, date: selectedDate, items: selectedOption };
    setSavedTests([newTest, ...savedTests]); // Prepend the new test
    closeModal();
  };  

  return (
    <div className='flex flex-col px-10 w-full mr-20 mb-20 mt-40 bg-dark-purple'>
      <div className='flex flex-nowrap items-center'>
        <button className='mb-3 w-40 ml-5 text-center shadow-sm px-4 py-2 mt-10 rounded-md bg-blue-900 font-medium text-2xl text-white hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-offset-2 focus:ring-blue-500 sm:ml-4 sm:text-sm' onClick={openModal}>
        <img src={add} alt="Add" className="flex-1 bg-blue-300 w-6 h-6 mr-5 rounded-full" />
          New Test
        </button>
      </div>
      {savedTests.length > 0 && (
        <div className='flex flex-col rounded-lg text-center size-96 w-full bg-indigo-100 border-solid border-2 border-sky-600 overflow-y-auto' style={{ maxHeight: '400px' }}>
          {savedTests.map((test, index) => (
            <div key={index} className='outline outline-offset-1 outline-1 flex flex-wrap py-2'>
              <div className='truncate ml-10 mt-1 flex-1'>
                <h2 className='truncate text-wrap flex space-x-4 grid grid-flow-col auto-cols-max text-1xl font-semibold flex-1'>
                  Test: {test.name}
                </h2>
                <h2 className='text-wrap flex space-x-4 grid grid-flow-col auto-cols-max text-1xl font-semibold flex-1'>
                  Date: {test.date} 
                </h2>
                <h2 className='text-wrap flex space-x-4 grid grid-flow-col auto-cols-max text-1xl font-semibold flex-1'>
                  Items: {test.items}
                </h2> 
              </div>
              <div className="flex justify-end mt-2 py-4">
                <button
                  onClick={() => {/* handleEdit */}}
                  type="button"
                  className="h-10 mb-1 mr-2 text-center inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-sky-600 text-base font-medium text-white hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-4 sm:text-sm"
                
                >
                  Edit
                </button>
                <button
                  onClick={() => {/* handlePrint */}}
                  type="button"
                  className="h-10 mb-1 mr-2 text-center inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-emerald-600 text-base font-medium text-white hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-4 sm:text-sm"
                >
                  Print
                </button>
                <button
                  onClick={() => {/* handleDelete */}}
                  type="button"
                  className="h-10 mb-1 mr-2 text-center inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-4 sm:text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Use the Modal component */}
      <ModalTestQuestion isOpen={isModalOpen} onClose={closeModal} onSave={handleSave}>
        <div className="flex justify-center items-center mt-10">
          <div className="flex flex-col items-center mx-4">
            <h3 className="text-lg font-bold">Test Name*</h3>
            <input value={testName} onChange={handleNameChange} className='text-center w-64 mt-1 block border-2 border-indigo-200 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm' placeholder='Input Here' />
          </div>
          <div className="flex flex-col items-center mx-4">
            <h3 className="text-lg font-bold">Date*</h3>
            <input type="date" value={selectedDate} onChange={handleDateChange} className="text-center w-64 mt-1 block border-2 border-indigo-200 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
          </div>
        </div>
        <div className="flex justify-center my-4">
          <div className="flex flex-col items-center mx-4">
            <h3 className="text-center text-lg font-bold">Select No. Items*</h3>
            <select value={selectedOption} onChange={handleDropdownChange} className="text-center w-64 justify-items-center w-24 h-10 mt-1 block border-2 border-indigo-200 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
              <option value="10">10 Items</option>
              <option value="15">15 Items</option>
              <option value="20">20 Items</option>
              <option value="25">25 Items</option>
              <option value="30">30 Items</option>
            </select>
          </div>
        </div>
        
        {/* Display the input items */}
        <div className="mr-20 flex flex-col items-left max-h-64 overflow-y-auto">
          {itemsInput.map((item, index) => (
            <div key={index} className="flex flex-col w-full mt-4">
              <div className="flex items-center">
                <span className="mr-3 ml-40 ms-24">{index + 1}</span>
                <input className="w-40 text-center w-full block border-2 border-indigo-200 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder={item} />
              </div>
            </div>
          ))}
          <div className="flex justify-center my-4">
            <h3 className="text-lg font-bold ml-24">Answer Sheet*</h3>
          </div>
          <div className="flex flex-col items-center mx-4">
            {answerSheet.map((answer, index) => (
              <div key={index} className="ml-24 flex justify-center">
                <h3 className="text-lg">{index + 1}</h3> {/* Add label */}
                {answer.options.map((letter, letterIndex) => (
                  <button 
                    key={letterIndex} 
                    className={`mb-2 ml-5 mx-2 p-3 rounded-full w-full block border-2 border-indigo-200 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${answer.selected === letterIndex ? 'bg-indigo-500' : 'bg-indigo-300 shadow-sm'}`}
                    onClick={() => handleAnswerClick(index, letterIndex)}
                  >
                    {letter}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      </ModalTestQuestion>
    </div>
  );
}

export default NewTest;
