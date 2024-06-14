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

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleDropdownChange = (e) => {
    setSelectedOption(e.target.value);
    setItemsInput(Array.from({ length: parseInt(e.target.value) }, (_, index) => `Question ${index + 1}: `));
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
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
        <div className="m-4 flex items-center mt-10">
            <h3 className="text-lg font-bold">Name*</h3>
            <input className='text-center flex-initial w-64 border-4 border-indigo-200 border-l-indigo-500' placeholder='Input Here'></input>
            <h3 className="text-lg font-bold">Date*</h3>
            <input type="date" value={selectedDate} onChange={handleDateChange} className="flex-initial w-64 border-4 border-indigo-200 border-l-indigo-500" />
            <h3 className="text-center text-lg font-bold">Select No. Items*</h3>
            <select value={selectedOption} onChange={handleDropdownChange} className="justify-items-center w-24 h-10 mt-1 block w-full border-2 border-indigo-200 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
            <option value="5">5 Items</option>
            <option value="10">10 Items</option>
            <option value="15">15 Items</option>
            <option value="20">20 Items</option>
            <option value="25">25 Items</option>
            <option value="30">30 Items</option>
            </select>
        </div>
        
        {/* Display the input items */}
        <div className="m-4">
            {itemsInput.map((item, index) => (
            <input key={index} className="outline-offset-0 mt-2 hover:outline-offset-2" placeholder={item} />
            ))}
        </div>
     </ModalTestQuestion>

    </div>
  );
}

export default NewTest;
