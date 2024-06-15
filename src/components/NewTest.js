// NewTest.js
import React, { useState } from 'react';
import edit from '../res/img/edit-icon.png';
import print from '../res/img/print-icon.jpg';
import trash from '../res/img/trash-icon.jpg';
import add from '../res/img/add-icon.png';
import ModalTestQuestion from './ModalTestQuestion'; // Import the Modal component

function NewTest(props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [itemsInput, setItemsInput] = useState([]);
  const [answerSheet, setAnswerSheet] = useState([]);

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

  const handleAnswerClick = (answerIndex, optionIndex) => {
    setAnswerSheet(prevAnswerSheet =>
      prevAnswerSheet.map((answer, index) => ({
        ...answer,
        selected: index === answerIndex ? optionIndex : answer.selected
      }))
    );
  };

  return (
    <div className='px-10 w-full mr-20 mb-20 mt-40 bg-dark-purple'>
      <div className='flex flex-nowrap items-center'>
        <button className='hover:text-blue-600 text-2xl font-semibold scale-75 rounded-full w-40 h-10 mt-10 bg-sky-500/100' onClick={openModal}>
            New Test
        </button>
      </div>
      <div className='rounded-lg text-center size-20 w-80 bg-indigo-100'>
        <h2 className='pt-3 text-1xl font-semibold flex-1'>Test: {props.name} Date: {props.date}</h2>
        <div className='ml-40 m-3 flex flex-wrap'>
          <img className='size-7' src={print} alt="PRINT" />
          <img className='size-7' src={edit} alt="EDIT" />
          <img className='size-7' src={trash} alt="TRASH" />
        </div>
      </div>
      
      {/* Use the Modal component */}
      <ModalTestQuestion isOpen={isModalOpen} onClose={closeModal}>
        <div className="flex justify-center items-center mt-10">
          <div className="flex flex-col items-center mx-4">
            <h3 className="text-lg font-bold">Test Name*</h3>
            <input className='text-center w-64 mt-1 block border-2 border-indigo-200 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm' placeholder='Input Here' />
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
