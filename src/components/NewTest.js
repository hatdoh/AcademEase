import React, { useState } from 'react';
import add from '../res/img/add.webp'; // Import the add icon
import ModalTestQuestion from './ModalTestQuestion'; // Import the Modal component
import { FaPrint } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { FaEdit } from "react-icons/fa";
import html2pdf from 'html2pdf.js';


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
      question: '', // Ensure this is set correctly based on your logic
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
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTestType, setSelectedTestType] = useState('');

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleTestTypeFilterChange = (e) => {
    setSelectedTestType(e.target.value);
  };

  const filteredTests = savedTests.filter((test) =>
    test.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedTestType === '' || test.name === selectedTestType)
  );

  const handlePrint = (test) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write('<html><head><title>Test Questions and Answer Sheet</title></head><body>');
  
      // Test Questions
      printWindow.document.write('<h1>Test Questions</h1>');
      if (Array.isArray(test.items)) {
        test.items.forEach((item, index) => {
          printWindow.document.write(`<p>${index + 1}. ${item.question}</p>`);
          printWindow.document.write('<ul>');
          item.choices.forEach((choice) => {
            printWindow.document.write(`<li>${choice.text}</li>`);
          });
          printWindow.document.write('</ul>');
        });
      }
  
      // Answer Sheet
      printWindow.document.write('<h1>Answer Sheet</h1>');
      if (Array.isArray(test.items)) {
        test.items.forEach((item, index) => {
          printWindow.document.write(`<p>${index + 1}. ${item.question}</p>`);
          printWindow.document.write('<ul>');
          item.choices.forEach((choice, choiceIndex) => {
            const option = String.fromCharCode(65 + choiceIndex);
            const selected = test.answerSheet[index].selected === choiceIndex;
            const bgColor = selected ? 'background-color: #4CAF50; color: white;' : '';
            printWindow.document.write(`<li style="${bgColor}">${option}: ${choice.text}</li>`);
          });
          printWindow.document.write('</ul>');
        });
      }
  
      printWindow.document.write('</body></html>');
      printWindow.document.close();
  
      // Convert HTML to PDF and download
      html2pdf().from(printWindow.document.body).save('test.pdf');
    } else {
      alert('Please allow popups for this site');
    }
  };
  
  
  
  
  
  
  
  
// State to store the selected test type for filtering

// Function to handle the test type filter change


// Get unique test types from savedTests
const testTypes = [...new Set(savedTests.map(test => test.name))];

return (
    <div className='ml-3'>
      <div className="flex items-center">
        <button className='ml-10 w-40 h-10 mt-5 text-center shadow-sm py-2 rounded-md bg-blue-500 font-medium text-2xl text-white hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-offset-2 focus:ring-blue-500 sm:ml-4 sm:text-sm' onClick={openModal}>
          New Test
        </button>
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={handleSearch}
          className="w-80 h-10 pl-3 pr-10 mt-5 ml-80 rounded-lg border-2 border-gray-300 focus:outline-none focus:border-indigo-500 sm:text-sm"
        />
        <select
          value={selectedTestType}
          onChange={handleTestTypeFilterChange}
          className="w-48 h-10 pl-3 pr-10 ml-4 mt-5 rounded-lg border-2 border-gray-300 focus:outline-none focus:border-indigo-500 sm:text-sm"
        >
          <option value="">Test Type</option>
          {testTypes.map((testType, index) => (
            <option key={index} value={testType}>{testType}</option>
          ))}
        </select>
      </div>
      <div className='h-96 flex flex-col mr-4 mt-5 ml-6 bg-white rounded-lg shadow-md'>
        <div className='flex justify-center items-center bg-gray-200 py-2 rounded-lg'>
          <h2 className='text-center uppercase font-semibold flex-1'>Test Type</h2>
          <h2 className='text-right mr-20 uppercase font-semibold flex-1'>Date</h2>
          <h2 className='text-center mr-80 uppercase font-semibold flex-1'>No. Items</h2>
        </div>
        {filteredTests.length > 0 && (
          <div className='flex flex-col rounded-lg text-center bg-white shadow-md border-sky-600 overflow-y-auto' style={{ maxHeight: '350px' }}>
            {/* List of Filtered Saved Tests */}
            {filteredTests.map((test, index) => (
              <div key={index} className='shadow-md flex flex-nowrap py-2'>
                <div className='grid grid-cols-3 divide-x'>
                  <div className='w-60 overflow-auto ml-7 mt-1'>
                    <h2 className='mt-2 text-center uppercase text-nowrap flex space-x-4 grid grid-flow-col auto-cols-max text-1xl font-semibold flex-1'>
                      {test.name}
                    </h2>
                  </div>
                  <div className='w-40 mr-80 overflow-auto ml-10 mt-1'>
                    <h2 className='mt-2 ml-14 uppercase text-nowrap flex space-x-4 grid grid-flow-col auto-cols-max text-1xl font-semibold flex-1'>
                      {test.date}
                    </h2>
                  </div>
                  <div className='w-60 mr-80 overflow-auto mt-1'>
                    <h2 className='mt-2 ml-24 uppercase text-nowrap flex space-x-4 grid grid-flow-col auto-cols-max text-1xl font-semibold flex-1'>
                      {test.items}
                    </h2>
                  </div>
                </div>
                <div className="flex justify-end flex-1">
                  <button
                    onClick={() => handlePrint(test)}
                    type="button"
                    className="h-10 mb-1 mr-2 text-center inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-emerald-600 text-base font-medium text-white hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-4 sm:text-sm"
                  >
                    Print <FaPrint className='ml-2 w-4 h-5'/>
                  </button>
                  <button
                    onClick={() => handleEdit(index)}
                    type="button"
                    className="h-10 mb-1 mr-2 text-center inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-sky-600 text-base font-medium text-white hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-4 sm:text-sm"
                  >
                    <FaEdit className='h-5 w-5'/>
                  </button>
                  <button
                    onClick={() => handleDelete(index)}
                    type="button"
                    className="h-10 mb-1 mr-2 text-center inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-4 sm:text-sm"
                  >
                    <MdDelete className='h-5 w-5'/> 
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
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
            <input type="date" value={selectedDate} onChange={handleDateChange} className="uppercase pl-20 ml-2 w-64 h-10 border-2 border-indigo-200 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
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
        <div key={index} className="flex flex-col items-center m-1">
          <label className="uppercase text-lg font-bold mb-2">Question {index + 1}</label>
          <input
            className="uppercase text-center w-64 h-10 border-2 border-indigo-200 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder={`Input Here ${index + 1}`}
            value={item.question}
            onChange={(e) => {
              const newItemsInput = [...itemsInput];
              newItemsInput[index].question = e.target.value;
              setItemsInput(newItemsInput);
            }}
          />
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
      <h3 className="text-center text-lg font-bold">Answer Sheet</h3>
        {itemsInput.length > 0 && (
          <div className="divide-y divide-dashed grid grid-cols-2 gap-4 items-center mt-4">
            
            {answerSheet.map((answer, answerIndex) => (
              <div key={answerIndex} className="pb-1 flex flex-wrap mr-10 flex items-center mb-2">
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

