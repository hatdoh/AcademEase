import React, { useState, useEffect } from 'react';
import ModalTestQuestion from './ModalTestQuestion'; // Import the Modal component
import { FaPrint, FaEdit } from "react-icons/fa";
import { MdDelete, MdAdd } from "react-icons/md";


import html2pdf from 'html2pdf.js';

import app from "../config/firebase";
import { getDatabase, ref, set, push, remove, onValue } from "firebase/database";

function NewTest(props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [testName, setTestName] = useState('');
  const [itemsInput, setItemsInput] = useState([]);
  const [answerSheet, setAnswerSheet] = useState([]);
  const [savedTests, setSavedTests] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTestType, setSelectedTestType] = useState('');

  const db = getDatabase(app);

  // Load saved tests from Firebase on component mount
  useEffect(() => {
    const testsRef = ref(db, 'data/tests');
    onValue(testsRef, (snapshot) => {
      const tests = [];
      snapshot.forEach((childSnapshot) => {
        tests.push({ id: childSnapshot.key, ...childSnapshot.val() });
      });
      setSavedTests(tests.reverse()); // Reverse to show latest first
    });
  }, []);

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
    const newTest = {
      name: testName,
      date: selectedDate,
      items: selectedOption,
      questions: itemsInput,
      answerSheet: answerSheet
    };
  
    if (editIndex !== null) {
      // Edit existing test
      const editRef = ref(db, `data/tests/${savedTests[editIndex].id}`);
      set(editRef, newTest)
        .then(() => {
          alert("Test updated successfully");
        })
        .catch((error) => {
          alert("Error: " + error.message);
        });
    } else {
      // Save new test
      push(ref(db, 'data/tests'), newTest)
        .then(() => {
          alert("Test saved successfully");
        })
        .catch((error) => {
          alert("Error: " + error.message);
        });
    }
  
    closeModal(); // Close modal after saving or editing
  };
  

  const handleDelete = (index, testId) => {
    const testRef = ref(db, `data/tests/${testId}`);

    remove(testRef)
      .then(() => {
        alert("Test deleted successfully");
      })
      .catch((error) => {
        alert("Error: " + error.message);
      });
  };

  const handleEdit = (index) => {
    const test = savedTests[index];
    setTestName(test.name);
    setSelectedDate(test.date);
    setSelectedOption(test.items);
    setItemsInput(test.questions.map(q => ({
      question: q.question,
      choices: q.choices
    })));
    setAnswerSheet(test.answerSheet);
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

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleTestTypeFilterChange = (e) => {
    setSelectedTestType(e.target.value);
  };

  const handlePrint = (test) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write('<html><head><title>Test Questions and Answer Sheet</title></head><body>');

      // Test Name and Date
      printWindow.document.write(`<h1>${test.name}</h1>`);
      printWindow.document.write(`<p>Date: ${test.date}</p>`);

      // Number of Items
      printWindow.document.write(`<p>Number of Items: ${test.items.length}</p>`);

      // Test Questions and Answer Choices
      if (Array.isArray(test.items)) {
        test.items.forEach((item, index) => {
          printWindow.document.write(`<p><strong>Question ${index + 1}:</strong> ${item.question}</p>`);
          printWindow.document.write('<ul>');
          item.choices.forEach((choice, choiceIndex) => {
            printWindow.document.write(`<li>${String.fromCharCode(65 + choiceIndex)}. ${choice.text}</li>`);
          });
          printWindow.document.write('</ul>');
        });
      }

      // Answer Sheet
      printWindow.document.write('<h2>Answer Sheet</h2>');
      if (Array.isArray(test.answerSheet)) {
        test.answerSheet.forEach((answer, index) => {
          printWindow.document.write(`<p><strong>Question ${index + 1}:</strong></p>`);
          printWindow.document.write('<ul>');
          answer.options.forEach((option, optionIndex) => {
            const selected = answer.selected === optionIndex;
            const bgColor = selected ? 'background-color: #4CAF50; color: white;' : '';
            printWindow.document.write(`<li style="${bgColor}">${String.fromCharCode(65 + optionIndex)}. ${option.text}</li>`);
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

  const filteredTests = savedTests.filter((test) =>
    test.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedTestType === '' || test.name === selectedTestType)
  );

  return (
    <div className='ml-3'>
      <div className="flex items-center">
      <button className='flex items-center w-40 h-10 mt-5 text-center shadow-sm py-2 rounded-md bg-blue-500 font-medium text-2xl text-white hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-offset-2 focus:ring-blue-500 sm:ml-4 sm:text-sm' onClick={openModal}>
        <span className="ml-10">New Quiz</span>
        <MdAdd className='h-6 w-6' />
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
          className="w-48 h-10 pl-3 pr-10 mt-5 ml-8 rounded-lg border-2 border-gray-300 focus:outline-none focus:border-indigo-500 sm:text-sm"
        >
          <option value="">All Test Types</option>
          {savedTests.map((test, index) => (
            <option key={index} value={test.name}>{test.name}</option>
          ))}
        </select>
      </div>

      {/* Display saved tests in a scrollable table */}
      <div className="mt-8 mr-5 w-12/12 h-96 overflow-x-scroll overflow-y-scroll rounded-lg">
        <table className="w-full h-full bg-white shadow-md rounded-lg">
          <thead className="bg-gray-200 text-gray-700 uppercase">
            <tr>
              <th className="py-3 px-6 text-left">Test Name</th>
              <th className="py-3 px-6 text-center">Date</th>
              <th className="py-3 px-6 text-center">Number of Items</th>
              <th className="py-3 px-6 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredTests.map((test, index) => (
              <tr key={index}>
                <td className="py-4 px-6 text-left whitespace-nowrap trucant">{test.name}</td>
                <td className="py-4 px-6 text-center">{test.date}</td>
                <td className="py-4 px-6 text-center">{test.items}</td>
                <td className="py-4 px-6 text-center">
                  <button
                    onClick={() => handlePrint(test)}
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full mr-2"
                  >
                    <FaPrint />
                  </button>
                  <button
                    onClick={() => handleEdit(index)}
                    className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-full mr-2"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(index, test.id)}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full"
                  >
                    <MdDelete />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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

