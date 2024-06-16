import React, { useState } from 'react';
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
  const [editIndex, setEditIndex] = useState(null); // State to track the index of the test being edited

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditIndex(null); // Reset edit index when modal is closed
    resetForm(); // Reset form fields
  };

  const resetForm = () => {
    setTestName('');
    setSelectedDate('');
    setSelectedOption('');
    setItemsInput([]);
    setAnswerSheet([]);
  };

  const handleDropdownChange = (e) => {
    const count = parseInt(e.target.value);
    setSelectedOption(count);
    setItemsInput(Array.from({ length: count }, (_, index) => ({
      question: `Question ${index + 1}`,
      choices: [
        { id: 0, text: '' },
        { id: 1, text: '' },
        { id: 2, text: '' },
        { id: 3, text: '' }
      ]
    })));
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

    if (editIndex !== null) {
      // Edit existing test
      setSavedTests(prevTests => {
        const updatedTests = [...prevTests];
        updatedTests[editIndex] = newTest;
        return updatedTests;
      });
    } else {
      // Save new test
      setSavedTests([newTest, ...savedTests]);
    }

    // Update answer sheet based on current itemsInput
    const answerSet = itemsInput.map(item => Array.from({ length: item.choices.length }, (_, i) => String.fromCharCode(65 + i)));
    setAnswerSheet(answerSet.map(answer => ({ selected: null, options: answer })));

    closeModal();
  };

  const handleDelete = (index) => {
    setSavedTests(prevTests => prevTests.filter((_, i) => i !== index));
  };

  const handleEdit = (index) => {
    const test = savedTests[index];
    setTestName(test.name);
    setSelectedDate(test.date);
    setSelectedOption(test.items);
    setItemsInput(Array.from({ length: test.items }, (_, i) => ({
      question: `Question ${i + 1}`,
      choices: [
        { id: 0, text: '' },
        { id: 1, text: '' },
        { id: 2, text: '' },
        { id: 3, text: '' }
      ]
    })));
    setAnswerSheet(Array.from({ length: test.items }, () => ({ selected: null, options: ['A', 'B', 'C', 'D'] })));
    setEditIndex(index);
    openModal();
  };

  const handleAddChoice = (questionIndex) => {
    const newItemsInput = [...itemsInput];
    newItemsInput[questionIndex].choices.push({ id: newItemsInput[questionIndex].choices.length, text: '' });
    setItemsInput(newItemsInput);
  
    // Update answer sheet when adding a choice
    setAnswerSheet(prevAnswerSheet =>
      prevAnswerSheet.map((answer, index) => ({
        ...answer,
        options: index === questionIndex ? [...answer.options, String.fromCharCode(65 + answer.options.length)] : answer.options
      }))
    );
  };
  
  const handleRemoveChoice = (questionIndex) => {
    const newItemsInput = [...itemsInput];
    newItemsInput[questionIndex].choices.pop();
    setItemsInput(newItemsInput);

    // Update answer sheet when removing a choice
    setAnswerSheet(prevAnswerSheet =>
      prevAnswerSheet.map((answer, index) => ({
        ...answer,
        options: index === questionIndex ? answer.options.slice(0, -1) : answer.options
      }))
    );
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
                <h2 className='uppercase truncate text-wrap flex space-x-4 grid grid-flow-col auto-cols-max text-1xl font-semibold flex-1'>
                  Test: {test.name}
                </h2>
                <h2 className='uppercase text-wrap flex space-x-4 grid grid-flow-col auto-cols-max text-1xl font-semibold flex-1'>
                  Date: {test.date}
                </h2>
                <h2 className='uppercase text-wrap flex space-x-4 grid grid-flow-col auto-cols-max text-1xl font-semibold flex-1'>
                  Items: {test.items}
                </h2>
              </div>
              <div className="flex justify-end mt-2 py-4">
                <button
                  onClick={() => handleEdit(index)}
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
                  onClick={() => handleDelete(index)}
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

      <ModalTestQuestion isOpen={isModalOpen} onClose={closeModal} onSave={handleSave}>
        <div className="flex justify-center items-center mt-10">
          <div className="flex flex-col items-center">
            <label className="text-lg font-bold mb-2">Test Name</label>
            <input
              className="pl-10 uppercase w-64 h-10 border-2 border-indigo-200 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Input Here"
              value={testName}
              onChange={handleNameChange}
            />
          </div>
          <div className="flex flex-col items-center">

          <label className="text-lg font-bold mb-2">Test Date</label>
            <input type="date" value={selectedDate} onChange={handleDateChange} className="uppercase pl-20 ml-2 mt-2 w-64 h-10 border-2 border-indigo-200 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
          </div>
        </div>
        <div className="flex flex-col items-center mt-5">
          <label className="text-lg font-bold mb-2">Select Number of Items</label>
          <select value={selectedOption} onChange={handleDropdownChange} className="text-center w-64 justify-items-center w-24 h-10 mt-1 block border-2 border-indigo-200 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
            <option value="">Select</option>
            <option value="10">10 Items</option>
            <option value="20">20 Items</option>
            <option value="30">30 Items</option>
            <option value="40">40 Items</option>
            <option value="50">50 Items</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4 justify-center mt-4">
        {itemsInput.map((item, index) => (
        <div key={index} className="flex flex-col items-center m-1 ">
          <label className="uppercase text-lg font-bold mb-2">Question {index + 1}</label>
          <div className="flex items-center">
          <input
              className="text-left pl-5 uppercase ml-2 w-64 h-10 border-2 border-indigo-200 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder={`Input Here ${index + 1}`} // Placeholder for the question input
              value={item.question}
              onChange={(e) => {
                const newItemsInput = [...itemsInput];
                newItemsInput[index].question = e.target.value;
                setItemsInput(newItemsInput);
              }}
            />
          </div>
          {item.choices.map((choice, choiceIndex) => (
            <div key={choice.id} className="flex items-center mt-2">
              <input
                className="uppercase text-center w-64 h-10 border-2 border-indigo-200 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder={`Answer ${String.fromCharCode(65 + choiceIndex)}`}
                value={choice.text}
                onChange={(e) => {
                  const newItemsInput = [...itemsInput];
                  newItemsInput[index].choices[choiceIndex].text = e.target.value;
                  setItemsInput(newItemsInput);
                }}
              />
            </div>
          ))}
          <div className="flex mt-2">
            <button
              onClick={() => {
                handleAddChoice(index);
              }}
              className="mb-10 mr-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Add Choice
            </button>
            {item.choices.length > 1 && (
              <button
                onClick={() => {
                  handleRemoveChoice(index);
                }}
                className="mb-10 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Remove Choice
              </button>
            )}
          </div>
        </div>
      ))}
      </div>
        {itemsInput.length > 0 && (
          <div className="flex flex-col items-center mt-4">
            <h3 className="text-lg font-bold">Answer Sheet</h3>
            {answerSheet.map((answer, answerIndex) => (
              <div key={answerIndex} className="mr-10 flex items-center mb-2">
                <span className="mr-10">{answerIndex + 1}.</span>
                {answer.options.map((option, optionIndex) => (
                  <button
                    key={optionIndex}
                    onClick={() => handleAnswerClick(answerIndex, optionIndex)}
                    className={`mr-2 px-4 py-2 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                      answer.selected === optionIndex
                        ? 'bg-indigo-600 text-white'
                        : 'bg-indigo-200 text-indigo-600'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}

      </ModalTestQuestion>
    </div>
  );
}

export default NewTest;

