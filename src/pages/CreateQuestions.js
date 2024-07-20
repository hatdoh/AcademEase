import React, { useState, useEffect } from 'react';
import ModalTestQuestion from '../components/ModalTestQuestion'; // Import the Modal component
import { FaPrint, FaEdit, FaDownload } from "react-icons/fa";
import { MdDelete, MdAdd } from "react-icons/md";
import html2pdf from 'html2pdf.js';
import app from "../config/firebase";
import { getDatabase, ref, set, push, remove, onValue, get } from "firebase/database";

import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import * as XLSX from 'xlsx';

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import QRCode from 'qrcode';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.js`;

function CreateQuestions(props) {
  const [selectedTestId, setSelectedTestId] = useState(null);
  const [isSetModalVisible, setSetModalVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
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
      questions: itemsInput.map((item, index) => ({
        question: item.question,
        choices: item.choices.map(choice => ({
          id: choice.id,
          text: choice.text,
          checked: choice.checked
        })),
        correctAnswer: item.correctAnswer
      }))
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
        const updatedTests = savedTests.filter((test, idx) => idx !== index);
        setSavedTests(updatedTests);
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

  const generateAnswerSheetPDF = async (numQuestions, numChoices) => {
    const doc = new jsPDF({ format: 'a4' });

    // Define margins based on A4 size
    const marginTop = 10; // margin from top
    const marginBottom = 20; // margin from bottom
    const marginLeft = 30; // margin from left
    const marginRight = 15; // margin from right
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // Print the header text
    doc.text('Answer Sheets', marginLeft + 53, marginTop);
    doc.text('Name: ____________________', marginLeft, marginTop + 10);
    doc.text('Student ID Number: ___________________', marginLeft, marginTop + 20);
    doc.text('Set: ____', marginLeft, marginTop + 30);

    // Set initial yOffset for answer choices
    let yOffset = marginTop + 50; // Adjust as needed for spacing
    let xOffset = marginLeft; // Initial xOffset for answer choices

    // Set the font size for the answer choices
    doc.setFontSize(11);

    // Define horizontal and vertical spacing for choices
    const choiceSpacing = 10;
    const choiceCircleRadius = 4;
    const textSize = 12;
    const rowSpacing = 10; // Vertical spacing between rows
    const colSpacing = 50; // Horizontal spacing between columns

    for (let i = 1; i <= numQuestions; i++) {
        // Calculate column and row index
        const colIndex = Math.floor((i - 1) / 10);
        const rowIndex = Math.floor((colIndex) / 3);

        // Reset xOffset and yOffset for each new set of columns
        xOffset = marginLeft + (colIndex % 3) * colSpacing;
        yOffset = marginTop + 50 + (i - 1) % 10 * rowSpacing + (rowIndex * 100); // Adjust yOffset for rows

        // Add new page if necessary
        if (yOffset > pageHeight - marginBottom - 20) {
            doc.addPage();
            yOffset = marginTop + 50; // Reset yOffset for new page
        }

        // Print the question number
        doc.text(`${i}.`, xOffset, yOffset);

        // Print the answer choices in circles
        const choices = ['A', 'B', 'C', 'D'].slice(0, numChoices); // Adjust choices based on number of choices
        choices.forEach((choice, index) => {
            const x = xOffset + 7 + (index * choiceSpacing);
            const circleX = x + 3; // Adjust for additional space between circle and text
            doc.circle(circleX, yOffset - 3, choiceCircleRadius); // Draw circle

            // Center the letter inside the circle
            doc.setFontSize(textSize);
            const textWidth = doc.getTextWidth(choice);
            const textX = circleX - (textWidth / 2);
            const textY = yOffset + -1; // Adjust the vertical position of the text
            doc.text(choice, textX, textY); // Add choice letter inside circle
        });
    }

    // Save the answer sheet PDF
    doc.save('answer_sheet.pdf');
};


const handlePrint = async (test) => {
    if (!test || !test.questions) {
        console.error('Selected test or questions are undefined');
        return;
    }

    const questionsA = generateRandomSequence(test.questions);
    const questionsB = generateRandomSequence(test.questions);

    await generatePDFWithQRCode(questionsA, 'A');
    await generatePDFWithQRCode(questionsB, 'B');
    await generateAnswerSheetPDF(test.questions.length, test.questions[0].choices.length); // Generate answer sheet PDF
};
  

  const filteredTests = savedTests.filter((test) =>
    test.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedTestType === '' || test.name === selectedTestType)
  );

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileType = file.name.split('.').pop().toLowerCase();
      let content = '';
  
      if (fileType === 'pdf') {
        content = await readPdfFile(file);
      } else if (fileType === 'docx') {
        content = await readDocxFile(file);
      } else if (fileType === 'xlsx' || fileType === 'xls') {
        content = await readExcelFile(file);
      }
  
      const lines = content.split('\n')
        .map(line => line.trim())
        .filter(line => line !== '');
  
      const items = [];
      let currentQuestion = null;
  
      lines.forEach(line => {
        if (line.endsWith('?') || line.endsWith('.')) {
          if (currentQuestion) {
            currentQuestion.choices = currentQuestion.choices.filter(choice => choice.text.trim() !== '');
            items.push(currentQuestion);
          }
          const questionWithoutNumber = line.replace(/^\d+[\.\s]*/, '').trim();
          currentQuestion = {
            question: questionWithoutNumber,
            choices: Array.from({ length: 4 }, (_, index) => ({ id: index, text: '', checked: false })),
            correctAnswer: null
          };
        } else if (line.match(/^[A-D][.)]\s/)) {
          if (currentQuestion) {
            const choiceIndex = line.charCodeAt(0) - 65;
            const choiceText = line.replace(/^[A-D][.)]\s*/, '').trim();
            currentQuestion.choices[choiceIndex] = {
              id: choiceIndex,
              text: choiceText,
              checked: false
            };
          }
        } else if (line.startsWith('Answer:') || line.startsWith('answer:')) {
          if (currentQuestion) {
            const correctAnswer = line.replace(/Answer:|answer:/, '').trim().replace(/[^A-D]/g, '');
            currentQuestion.correctAnswer = correctAnswer;
            const correctIndex = correctAnswer.charCodeAt(0) - 65;
            currentQuestion.choices[correctIndex].checked = true;
          }
        }
      });
  
      if (currentQuestion) {
        currentQuestion.choices = currentQuestion.choices.slice(0, 4);
        items.push(currentQuestion);
      }
  
      setItemsInput(items);
  
      // Update the state of the number of selected items based on the items or questions parsed
      setSelectedOption(items.length);
  
      // Update answer sheet based on the correct answer
      setAnswerSheet(items.map(item => ({
        selected: item.correctAnswer ? item.correctAnswer.charCodeAt(0) - 65 : null,
        options: item.choices.map(choice => String.fromCharCode(65 + choice.id))
      })));
    }
  };
  
  
  const readPdfFile = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    let text = '';

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      textContent.items.forEach(item => {
        text += item.str + ' ';
      });
    }

    return text;
  };

  const readDocxFile = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const { value } = await mammoth.extractRawText({ arrayBuffer });
    return value;
  };

  const readExcelFile = async (file) => {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: 'array' });
    let text = '';

    workbook.SheetNames.forEach(sheetName => {
      const worksheet = workbook.Sheets[sheetName];
      text += XLSX.utils.sheet_to_csv(worksheet);
    });

    return text;
  };
  
  const generateRandomSequence = (questions) => {
    const shuffled = [...questions];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };
  
  const generateQRCode = async (data) => {
    try {
      const url = await QRCode.toDataURL(data);
      return url;
    } catch (err) {
      console.error(err);
    }
  };

  const generatePDFWithQRCode = async (questions, setId) => {
    const doc = new jsPDF({ format: 'a4' });

    const qrCodeDataUrl = await generateQRCode(setId);

    // Define margins based on A4 size
    const marginTop = 10; // margin from top
    const marginBottom = 20; // margin from bottom
    const marginLeft = 15; // margin from left
    const marginRight = 15; // margin from right
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // Print Name and School ID and QR Code at the beginning of the document
    doc.text('Name: ____________________', marginLeft, marginTop);
    doc.text('Student ID: ___________________', marginLeft, marginTop + 10);
    doc.addImage(qrCodeDataUrl, 'PNG', pageWidth - marginRight - 40, marginTop, 40, 40);

    // Set initial yOffset for questions
    let yOffset = marginTop + 50; // Adjust as needed for spacing
    const columnWidth = (pageWidth - marginLeft - marginRight) / 2; // Width for two columns
    const textMaxWidth = columnWidth - 20; // Width for text including padding
    const textMaxWidthSingleColumn = pageWidth - marginLeft - marginRight; // Width for single column

    questions.forEach((item, index) => {
        // Add new page if necessary
        if (yOffset > pageHeight - marginBottom - 20) {
            doc.addPage();
            yOffset = marginTop; // Reset yOffset for new page
        }

        // Set the font size for the question text
        doc.setFontSize(11);

        // Print the question text
        doc.text(`${index + 1}. ${item.question}`, marginLeft, yOffset);

        // Set the font size for the answer choices
        doc.setFontSize(11);

        // Determine layout based on text length
        let useSingleColumn = item.choices.some(choice => {
            const choiceText = choice.text;
            const textWidth = doc.getTextWidth(choiceText);
            return textWidth > textMaxWidth;
        });

        // Set the starting positions for the answer choices
        let startX1 = marginLeft; // Start of first column
        let startX2 = marginLeft + columnWidth; // Start of second column
        let startX = startX1; // Default to first column
        let startY = yOffset + 5; // Start position for choices
        let spacingY = 4; // Adjust the vertical spacing between rows as needed

        item.choices.forEach((choice, choiceIndex) => {
            // Use single column layout if text is too long
            if (useSingleColumn) {
                startX = marginLeft;
                const choiceText = choice.text;
                const textLines = doc.splitTextToSize(choiceText, textMaxWidthSingleColumn);

                if (startY + (textLines.length * 5) > pageHeight - marginBottom) {
                    doc.addPage();
                    startY = marginTop;
                }

                // Print the choice letter and text in a single column
                doc.text(`${String.fromCharCode(65 + choiceIndex)}. ${textLines[0]}`, startX, startY);
                textLines.slice(1).forEach((line, lineIndex) => {
                    doc.text(line, startX, startY + ((lineIndex + 1) * 5));
                });

                startY += Math.max(2, textLines.length * 5);
            } else {
                const column = choiceIndex % 2;
                const row = Math.floor(choiceIndex / 2);

                startX = column === 0 ? startX1 : startX2;
                let yPosition = startY + row * spacingY;

                // Wrap text if it exceeds column width
                const choiceText = choice.text;
                const textLines = doc.splitTextToSize(choiceText, textMaxWidth);

                // Print the choice letter and text in two columns
                doc.text(`${String.fromCharCode(65 + choiceIndex)}. ${textLines[0]}`, startX, yPosition);
                textLines.slice(1).forEach((line, lineIndex) => {
                    doc.text(line, startX, yPosition + ((lineIndex + 1) * 2));
                });

                // Add a new page if needed and adjust yOffset
                if (yPosition + (textLines.length * 2) > pageHeight - marginBottom) {
                    doc.addPage();
                    startY = marginTop;
                    startX1 = marginLeft; // Reset to start of first column
                    startX2 = marginLeft + columnWidth; // Reset to start of second column
                }
            }
        });

        // Update yOffset for the next set of questions
        yOffset = startY + Math.max(item.choices.length * spacingY, -3); // Adjust spacing as needed
    });

    doc.save(`Test_${setId}.pdf`);
};


  const handleCloseSetModal = () => {
    setSetModalVisible(false);
  };

  return (
    <div className='ml-80 p-4'>
      <div className="flex items-center">
      <button className='flex items-center w-40 h-10 mt-5 text-center shadow-sm py-2 rounded-md bg-blue-500 font-medium text-2xl text-white hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-offset-2 focus:ring-blue-500 sm:ml-4 sm:text-sm' onClick={openModal}>
        <span className="ml-7">Test Question</span>
        <MdAdd className='h-6 w-6' />
      </button>
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={handleSearch}
          className="w-80 h-10 pl-3 pr-10 mt-5 ml-72 rounded-lg border-2 border-gray-300 focus:outline-none focus:border-indigo-500 sm:text-sm"
        />
        <select
          value={selectedTestType}
          onChange={handleTestTypeFilterChange}
          className="w-48 h-10 pl-3 pr-10 mt-5 ml-4 rounded-lg border-2 border-gray-300 focus:outline-none focus:border-indigo-500 sm:text-sm"
        >
          <option value="">All Test Types</option>
          {savedTests.map((test, index) => (
            <option key={index} value={test.name}>{test.name}</option>
          ))}
        </select>
      </div>

      {/* Display saved tests in a scrollable table */}
      <div className="mt-8 mr-5 bg-white w-12/12 h-96 overflow-x-scroll overflow-y-scroll rounded-lg">
        <table className="w-full bg-white shadow-md rounded-lg">
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
                <tr key={index} className="h-10">
                <td className="py-3 px-6 h-10 text-left uppercase">{test.name}</td>
                <td className="py-3 px-6 h-10 text-center uppercase">{test.date}</td>
                <td className="py-3 px-6 h-10 text-center uppercase">{test.items}</td>
                <td className="py-3 px-6 h-10 text-center uppercase">
                    <button
                    onClick={() => handlePrint(test)}
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full mr-2"
                    >
                    <FaDownload />
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
        <div className="flex justify-left items-left">
          <div className="flex flex-col items-left w-full">
            <label className="text-lg font-bold mb-2">Name</label>
            <input
              className="px-6 uppercase w-full h-10 border-2 border-indigo-200 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Input Here"
              value={testName}
              onChange={handleNameChange}
            />
            <label className="text-lg font-bold mt-4 mb-2">Date</label>
              <input type="date" value={selectedDate} onChange={handleDateChange} className="px-6 uppercase w-full h-10 border-2 border-indigo-200 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
          </div>
        </div>
        <div className="flex flex-col items-left mt-5 ">
          <label  className="text-lg font-bold mb-2" >Select Number of Items</label>
          <select value={selectedOption} onChange={handleDropdownChange} className="text-center w-full justify-items-center w-24 h-10 mt-1 block border-2 border-indigo-200 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
            <option value="">Select</option>
            <option value="10">10 Items</option>
            <option value="20">20 Items</option>
            <option value="30">30 Items</option>
            <option value="40">40 Items</option>
            <option value="50">50 Items</option>
          </select>
        </div>
        <div className="flex flex-nowrap justify-left mt-4">
            <label htmlFor="file-input" className="cursor-pointer">
            <FaPrint className="h-8 w-10" />
            </label>
            <input
              id="file-input"
              type="file"
              accept=".pdf,.docx,.xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />
            <span>{selectedFile ? selectedFile.name : 'No file selected'}</span>
            {/* <div className="mt-4">
              <label className="text-lg font-bold mb-2">File Content</label>
              <pre>{fileContent}</pre>
            </div> */}
          </div>
        <div className="gap-4 justify-center mt-4">
        {itemsInput.map((item, index) => (
        <div key={index} className="flex flex-col items-center m-1 mt-5 shadow-blue-500/50 shadow-xl">
          <label className="uppercase text-lg font-bold mt-5 mb-2">Question {index + 1}</label>
          <input
            className="uppercase text-left px-8 w-5/6 h-10 border-2 border-indigo-200 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder={`Input Here ${index + 1}`}
            value={item.question}
            onChange={(e) => {
              const newItemsInput = [...itemsInput];
              newItemsInput[index].question = e.target.value;
              setItemsInput(newItemsInput);
            }}
          />
          {/* Display file content here */}
          {/* Inside the mapping of itemsInput.map((item, index)) */}
                    {/* Inside the mapping of itemsInput.map((item, index)) */}
          {item.choices.map((choice, choiceIndex) => (
            <div key={choice.id} className="flex items-center px-8 mt-2 w-full">
              <input
                type="checkbox"
                checked={choice.checked || false}
                onChange={(e) => {
                  const newItemsInput = [...itemsInput];
                  // Uncheck all other choices in the same question
                  newItemsInput[index].choices.forEach((ch, idx) => {
                    if (choiceIndex !== idx) ch.checked = false;
                  });
                  // Toggle current choice
                  newItemsInput[index].choices[choiceIndex].checked = e.target.checked;
                  setItemsInput(newItemsInput);
                }}
              />
              <input
                className="uppercase text-left ml-4 px-10 w-11/12 h-10 border-2 border-indigo-200 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
              className="flex items-center mb-10 mr-2 shadow-xl text-blue-500 font-bold py-2 px-4 rounded"
            >
              <span>New Answer</span><MdAdd className='h-6 w-6' />
            </button>
            {item.choices.length > 1 && (
              <button
                onClick={() => {
                  handleRemoveChoice(index);
                }}
                className="flex items-center mb-10 shadow-xl text-red-700 font-bold py-2 px-4 rounded"
              >
                <span>Remove</span> <MdDelete className='h-6 w-6'/>
              </button>
            )}
          </div>
        </div>
      ))}

      <div className="mb-5 mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="mt-3 mb-5 mr-24 px-20 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
              onClick={closeModal}
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
      </ModalTestQuestion>
    </div>
  );
}

export default CreateQuestions;

