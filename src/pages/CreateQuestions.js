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
import Swal from 'sweetalert2';
import morenoLogo from '../res/img/moreno-logo.jpg'
import DepedLogo from '../res/img/deped-logo.jpg'
import { Box, Button, Grid, IconButton, MenuItem, Paper, Select, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography, Checkbox, InputLabel, useTheme, useMediaQuery, Card, CardContent } from '@mui/material';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.js`;

function CreateQuestions(props) {
  const [id, setId] = useState(null);
  const [directions, setDirections] = useState('');
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

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));


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
    // Ensure items input and answer sheet are updated to match the new dropdown value
    setItemsInput(Array.from({ length: count }, (_, index) => ({
      question: `Question ${index + 1}`,
      choices: [
        { id: 0, text: '' },
        { id: 1, text: '' },
        { id: 2, text: '' },
        { id: 3, text: '' }
      ],
      correctAnswer: null
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

  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };
  
  const handleSave = () => {
    if (!testName || testName.trim() === '') {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Please enter the test name!',
      });
      return;
    }
  
    if (!selectedDate) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Please select a date!',
      });
      return;
    }
  
    if (!selectedOption) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Please select the number of items!',
      });
      return;
    }
  
    if (!directions || directions.trim() === '') {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Please enter the exam directions!',
      });
      return;
    }
  
    if (itemsInput.some(item => !item.question || item.question.trim() === '')) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Please enter all questions!',
      });
      return;
    }
  
    if (itemsInput.some(item => item.choices.some(choice => !choice.text || choice.text.trim() === ''))) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Please fill out all choices!',
      });
      return;
    }
  
    if (itemsInput.some(item => !item.correctAnswer || item.correctAnswer.trim() === '')) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Please select the correct answer for all questions!',
      });
      return;
    }
  
    // Use the current itemsInput with randomized questions and original choices
    const randomizedQuestionsA = shuffleArray(itemsInput.map(item => ({
      ...item,
      choices: item.choices // Choices are not randomized
    })));
    const randomizedQuestionsB = shuffleArray(itemsInput.map(item => ({
      ...item,
      choices: item.choices // Choices are not randomized
    })));
  
    const newTest = {
      name: testName,
      date: selectedDate,
      items: selectedOption,
      directions: directions,
      questions: {
        A: randomizedQuestionsA.map((item) => ({
          question: item.question,
          choices: item.choices.map(choice => ({
            id: choice.id,
            text: choice.text,
            checked: choice.checked
          })),
          correctAnswer: item.correctAnswer
        })),
        B: randomizedQuestionsB.map((item) => ({
          question: item.question,
          choices: item.choices.map(choice => ({
            id: choice.id,
            text: choice.text,
            checked: choice.checked
          })),
          correctAnswer: item.correctAnswer
        }))
      }
    };
  
    const successMessage = () => {
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Test updated successfully!',
      });
      closeModal();
    };
  
    const resetForm = () => {
      setTestName('');
      setSelectedDate(null);
      setSelectedOption(null);
      setDirections('');
      setItemsInput([]);
    };
  
    if (editIndex !== null) {
      const editRef = ref(db, `data/tests/${savedTests[editIndex].id}`);
      set(editRef, newTest)
        .then(() => {
          successMessage();
          resetForm();
        })
        .catch((error) => {
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: `Error: ${error.message}`,
          });
        });
    } else {
      push(ref(db, 'data/tests'), newTest)
        .then(() => {
          successMessage();
          resetForm();
        })
        .catch((error) => {
          Swal.fire({
            icon: 'error',
            title: 'Error!',
            text: `Error: ${error.message}`,
          });
        });
    }
  };
    
  const handleDelete = (index, testId) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You won\'t be able to revert this!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        const testRef = ref(db, `data/tests/${testId}`);

        remove(testRef)
          .then(() => {
            const updatedTests = savedTests.filter((test, idx) => idx !== index);
            setSavedTests(updatedTests);
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'The test has been deleted successfully.',
            });
          })
          .catch((error) => {
            Swal.fire({
              icon: 'error',
              title: 'Error!',
              text: `Error: ${error.message}`,
            });
          });
      }
    });
  };

  const handleEdit = (index) => {
    const test = savedTests[index];
  
    setTestName(test.name || '');
    setSelectedDate(test.date || '');
    setSelectedOption(test.items || '');
  
    // Ensure test.questions is an object with A and B arrays
    const questionsA = Array.isArray(test.questions?.A) ? test.questions.A : [];
    const questionsB = Array.isArray(test.questions?.B) ? test.questions.B : [];
  
    // Combine questions A and B into one array for editing
    const combinedQuestions = [...questionsA, ...questionsB];
  
    setItemsInput(combinedQuestions.map(q => ({
      question: q.question || '',
      choices: Array.isArray(q.choices) ? q.choices.map(choice => ({
        id: choice.id || '',
        text: choice.text || '',
        checked: choice.checked || false
      })) : [], // Default to empty array if q.choices is not an array
      correctAnswer: q.correctAnswer || ''  // Ensure correctAnswer is set
    })));
  
    setAnswerSheet(test.answerSheet || '');
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

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleTestTypeFilterChange = (e) => {
    setSelectedTestType(e.target.value);
  };

  const generateAnswerSheetPDF = async (numQuestions, numChoices) => {
    const doc = new jsPDF({ format: 'a4' });

    // Define margins and page width
    const marginTop = 10;
    const marginLeft = 20;
    const marginRight = 15;
    const pageWidth = doc.internal.pageSize.width;

    // Header text
    doc.text('Answer Sheets', marginLeft + 53, marginTop);
    doc.text('Name: ', marginLeft, marginTop + 10);
    doc.text('Student ID Number: ', marginLeft, marginTop + 20);
    doc.text('Set: ', marginLeft, marginTop + 30);

    // Score label and box
    const scoreX = marginLeft;
    const scoreY = marginTop + 40;
    doc.text('Score', scoreX, scoreY);
    doc.rect(scoreX + 25, scoreY - 5, 40, 12);

    // Calculate column and box dimensions
    const columnMargin = 20;
    const numColumns = 3;
    const colWidth = (pageWidth - marginLeft - marginRight - (numColumns - 1) * columnMargin) / numColumns;
    const colHeight = 104; // Adjust height for two rows
    const colY = scoreY + 15;

    // Define padding values
    const boxPaddingTop = 2; // Padding from top
    const boxPaddingBottom = 2; // Padding from bottom
    const boxPaddingLeft = 5; // Increased padding from left
    const boxPaddingRight = 10; // Padding from right

    // Define the positions for each row (top and bottom)
    const rowPositions = [colY, colY + colHeight + 10];

    // Draw the column boxes for the first row and the first two columns of the second row
    for (let row = 0; row < 2; row++) {
        for (let col = 0; col < numColumns; col++) {
            if (row === 1 && col === 2) continue; // Skip the third column in the second row
            const rectX = marginLeft + col * (colWidth + columnMargin);
            doc.rect(
                rectX + boxPaddingLeft, 
                rowPositions[row] + boxPaddingTop, 
                colWidth + 10 - boxPaddingLeft - boxPaddingRight, 
                colHeight - boxPaddingTop - boxPaddingBottom
            );
        }
    }

    // Define spacing for contents
    const rowSpacing = 2;
    const choiceSpacing = (colWidth - boxPaddingLeft - boxPaddingRight) / (numChoices - 1); // Adjust based on padding
    const choiceCircleRadius = 4;
    const textSize = 12;
    const questionPaddingTop = 1;

    let xOffset, yOffset;

    doc.setFontSize(11);

    // Positioning for questions and answer choices
    for (let i = 1; i <= numQuestions; i++) {
        let colIndex = Math.floor((i - 1) / 10) % 3; // Determine column based on question number
        let rowIndex = Math.floor((i - 1) / 30); // Determine row (first or second row)

        // Skip placing questions in the second row, third column
        if (rowIndex === 1 && colIndex === 2) continue;

        // Calculate the positions
        xOffset = marginLeft + colIndex * (colWidth + columnMargin) + 1; // Adjust xOffset for question margin
        yOffset = rowPositions[rowIndex] + rowSpacing + ((i - 1) % 10) * (choiceCircleRadius * 2 + rowSpacing) + questionPaddingTop;

        // Print question number outside the box
        doc.text(`${i}.`, xOffset - 10, yOffset + 5);

        // Print answer choices inside circles
        const choices = ['A', 'B', 'C', 'D'].slice(0, numChoices);

        choices.forEach((choice, index) => {
            const choiceX = xOffset + boxPaddingLeft + (index * choiceSpacing) + choiceCircleRadius;

            // Draw empty circle
            doc.circle(choiceX, yOffset + choiceCircleRadius, choiceCircleRadius);

            // Center the letter inside the circle
            doc.setFontSize(textSize);
            const textWidth = doc.getTextWidth(choice);
            const textX = choiceX - (textWidth / 2);
            const textY = yOffset + choiceCircleRadius + 2; // Adjust Y to fit better inside the circle
            doc.text(choice, textX, textY);
        });
    }

    // Save the PDF
    doc.save('answer_sheet.pdf');
};


const handlePrint = async (test) => {
  if (!test || !test.questions) {
    console.error('Selected test or questions are undefined');
    return;
  }

  const result = await Swal.fire({
    title: 'Are you sure?',
    text: 'Do you want to generate the PDF files for this test?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, generate!'
  });

  if (result.isConfirmed) {
    const questionsA = test.questions.A;
    const questionsB = test.questions.B;

    try {
      await generatePDF(questionsA, 'A', test.directions);
      await generatePDF(questionsB, 'B', test.directions);
      await generateAnswerSheetPDF(test.questions.A.length, test.questions.A[0].choices.length);

      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'PDFs have been generated successfully!',
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: `Failed to generate PDFs: ${error.message}`,
      });
    }
  } else {
    Swal.fire({
      icon: 'info',
      title: 'Cancelled',
      text: 'PDF generation has been cancelled.',
    });
  }
};

const handleRandomize = () => {
  // Randomize only the questions, keeping the choices unchanged
  const randomizedQuestions = shuffleArray(itemsInput.map(item => ({
    ...item,
    // Keep choices in the original order
    choices: item.choices
  })));

  setItemsInput(randomizedQuestions);
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
  
      try {
        if (fileType === 'pdf') {
          content = await readPdfFile(file);
        } else if (fileType === 'docx') {
          content = await readDocxFile(file);
        } else if (fileType === 'xlsx' || fileType === 'xls') {
          content = await readExcelFile(file);
        } else {
          throw new Error('Unsupported file type');
        }
      } catch (error) {
        console.error('Error reading file:', error);
        return;
      }
  
      const lines = content.split('\n')
        .map(line => line.trim())
        .filter(line => line !== '');
  
      const items = [];
      let currentQuestion = null;
      let directionsText = '';
  
      lines.forEach(line => {
        if (/^directions:/i.test(line)) {
          directionsText = line.replace(/^directions:/i, '').trim();
        } else if (/^\d+\.\s/.test(line) || /^\d+\s/.test(line)) {
          if (currentQuestion) {
            currentQuestion.choices = currentQuestion.choices.filter(choice => choice.text.trim() !== '');
            items.push(currentQuestion);
          }
          const questionWithoutNumber = line.replace(/^\d+\.\s*/, '').replace(/^\d+\s*/, '').trim();
          currentQuestion = {
            question: questionWithoutNumber,
            choices: Array.from({ length: 4 }, (_, index) => ({ id: index, text: '', checked: false })),
            correctAnswer: null
          };
        } else if (/^[A-D][.)]\s/.test(line)) {
          if (currentQuestion) {
            const choiceIndex = line.charCodeAt(0) - 65;
            const choiceText = line.replace(/^[A-D][.)]\s*/, '').trim();
            currentQuestion.choices[choiceIndex] = {
              id: choiceIndex,
              text: choiceText,
              checked: false
            };
          }
        } else if (/^(Answer:|answer:|Correct Answer:|correct answer:|Right Answer:|right answer:)\s*/i.test(line)) {
          if (currentQuestion) {
            const correctAnswer = line.replace(/^(Answer:|answer:|Correct Answer:|correct answer:|Right Answer:|right answer:)\s*/i, '').trim().replace(/[^A-D]/g, '');
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
  
      const itemCount = items.length;
  
      if (itemCount > 50) {
        await Swal.fire({
          title: 'Items Exceeded',
          text: 'The number of items exceeds the maximum limit of 50. Only the first 50 items will be included.',
          icon: 'warning',
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'OK'
        });
        // Only keep the first 50 items
        items.length = 50;
      } else if (itemCount < 40) {
        await Swal.fire({
          title: 'Insufficient Items',
          text: 'The number of items is less than the required minimum of 40. Please include at least 40 items.',
          icon: 'warning',
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'OK'
        });
        return; // Exit the function if the number of items is insufficient
      }
  
      // Update state if the number of items is valid (40 or 50)
      setItemsInput(items);
      setDirections(directionsText); // Set the directions state
  
      // Update the dropdown value and answer sheet
      setSelectedOption(itemCount);
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

  const generatePDF = async (questions, testName, directions) => {
    const doc = new jsPDF({ format: 'a4' });

    // Define margins based on A4 size
    const marginTop = 10; // margin from top
    const marginBottom = 20; // margin from bottom
    const marginLeft = 15; // margin from left
    const marginRight = 15; // margin from right
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    doc.setFontSize(11);

    // Centered text helper function
    const centerText = (text, y) => {
      const textWidth = doc.getTextWidth(text);
      const x = (pageWidth - textWidth) / 2;
      doc.text(text, x, y);
    };

    // Load logos
    const morenoLogoWidth = (pageWidth / 5) / 2;
    const morenoLogoHeight = 15;
    const depedLogoWidth = (pageWidth / 4) / 2;
    const depedLogoHeight = 15;

    // Add logos
    doc.addImage(morenoLogo, 'JPEG', marginLeft + 25, marginTop, morenoLogoWidth, morenoLogoHeight);
    doc.addImage(DepedLogo, 'JPEG', pageWidth - depedLogoWidth - marginRight - 18, marginTop, depedLogoWidth, depedLogoHeight);

    // Print Name and School ID and SCORE box at the beginning of the document
    const textStartY = marginTop + morenoLogoHeight + 5;
    centerText('Republic of the Philippines', marginTop);
    centerText('Department of Education', marginTop + 5);
    centerText('REGION V - BICOL', marginTop + 10);
    centerText('SCHOOLS DIVISION OF CAMARINES NORTE', marginTop + 15);
    centerText('MORENO INTEGRATED SCHOOL', marginTop + 20);

    const lineY = marginTop + 25;
    const lineText = '_________________________________________________________________________';
    const lineTextWidth = doc.getTextWidth(lineText);
    const adjustedLineMarginLeft = marginLeft; // Adjust the margin left as needed

    doc.text(lineText, adjustedLineMarginLeft, lineY);

    centerText('PRE-FINAL EXAMINATION', marginTop + 30);
    centerText('Technology and Livelihood Education Cookery', marginTop + 35);

    // Add Directions section
    const directionsY = marginTop + 45;
    const directionsLabel = "Directions:";
    doc.text(directionsLabel, marginLeft, directionsY);

    // Calculate the width of the "Directions:" label
    const directionsLabelWidth = doc.getTextWidth(directionsLabel);
    const directionsTextX = marginLeft + directionsLabelWidth + 2; // Add some padding

    // Get the lines of directions text
    const directionsTextLines = doc.splitTextToSize(directions || '', pageWidth - directionsTextX - marginRight);

    // Print the directions text next to the "Directions:" label
    directionsTextLines.forEach((line, index) => {
      doc.text(line, directionsTextX, directionsY + (index * 5)); // Adjust spacing between lines as needed
    });

    // Add SCORE box
    const boxSize = 20;
    const boxX = adjustedLineMarginLeft + lineTextWidth + 5; // Adjust position to the right of the line
    const boxY = lineY - 10; // Adjust to align with the line
    doc.rect(boxX, boxY, boxSize, boxSize); // Draw a rectangle for the box
    doc.text('SCORE', boxX + boxSize / 2 - doc.getTextWidth('SCORE') / 2, boxY + boxSize / 2 + 8); // Add SCORE text

    // Set initial yOffset for questions
    let yOffset = directionsY + directionsTextLines.length * 5; // Adjust as needed for spacing

    // Width for questions should match directions text width
    const questionTextMaxWidth = pageWidth - directionsTextX - marginRight; // Same width as directions text

    questions.forEach((item, index) => {
      // Add new page if necessary
      if (yOffset > pageHeight - marginBottom - 20) {
        doc.addPage();
        yOffset = marginTop; // Reset yOffset for new page
      }

      // Set the font size for the question text
      doc.setFontSize(11);

      // Print the question text
      const questionLines = doc.splitTextToSize(`${index + 1}. ${item.question}`, questionTextMaxWidth);
      questionLines.forEach((line, lineIndex) => {
        doc.text(line, marginLeft, yOffset + (lineIndex * 5));
      });

      yOffset += questionLines.length * 5; // Update yOffset after printing question

      // Set the starting positions for the answer choices
      const choiceStartX = marginLeft; // Start position for choices
      let choiceStartY = yOffset; // Start position for choices

      item.choices.forEach((choice, choiceIndex) => {
        const choiceText = choice.text;
        const choiceLines = doc.splitTextToSize(`${String.fromCharCode(65 + choiceIndex)}. ${choiceText}`, questionTextMaxWidth);

        // Print the choice text
        choiceLines.forEach((line, lineIndex) => {
          doc.text(line, choiceStartX, choiceStartY + (lineIndex * 5));
        });

        choiceStartY += choiceLines.length * 5; // Update position for next choice
      });

      // Update yOffset for the next question
      yOffset = choiceStartY + 1; // Ensure enough space for the next question
    });

    // Save the PDF
    doc.save('Test.pdf');
  };

  const handleDirectionsChange = (e) => {
    setDirections(e.target.value);
  };

  const handleCloseSetModal = () => {
    setSetModalVisible(false);
  };

  return (
    <Box sx={{ ml: isMobile ? 0 : 3, p: 2 }}>
      <Typography variant="h4" sx={{ mt: isMobile ? 6 : 1, mb: 2, fontWeight: 'bold' }}>Test Questions</Typography>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            placeholder="Search..."
            value={searchTerm}
            onChange={handleSearch}
            size='small'
            sx={{
              backgroundColor: 'white',
              borderRadius: 2
            }}
            InputProps={{
              sx: {
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#818181'
                }
              }
            }}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <Select
            fullWidth
            value={selectedTestType}
            onChange={handleTestTypeFilterChange}
            variant="outlined"
            size="small"
            displayEmpty
            sx={{
              backgroundColor: 'white',
              borderRadius: 1,
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#818181',
              },
            }}
          >
            <MenuItem value="">All Test Types</MenuItem>
            {savedTests.map((test, index) => (
              <MenuItem key={index} value={test.name}>{test.name}</MenuItem>
            ))}
          </Select>
        </Grid>

        <Grid item xs={12} sm={3}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            startIcon={<MdAdd />}
            onClick={openModal}
          >
            Test Question
          </Button>
        </Grid>
      </Grid>

      {/* Conditional layout for mobile and desktop */}
      {isMobile ? (
        <Box sx={{ mt: 4 }}>
          {filteredTests.map((test, index) => (
            <Card key={index} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6">{test.name}</Typography>
                <Typography>Date: {test.date}</Typography>
                <Typography>Items: {test.items}</Typography>
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                  <IconButton color="primary" onClick={() => handlePrint(test)}
                    sx={{
                      color: '#1e88e5', // Custom color for download icon (blue)
                      '&:hover': {
                        color: '#1565c0', // Darker blue on hover
                      },
                    }}>
                    <FaDownload />
                  </IconButton>
                  <IconButton color="secondary" onClick={() => handleEdit(index)}
                    sx={{
                      color: '#fb8c00', // Custom color for edit icon (orange)
                      '&:hover': {
                        color: '#f57c00', // Darker orange on hover
                      },
                    }}
                  >
                    <FaEdit />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(index, test.id)}
                    sx={{
                      '&:hover': {
                        color: '#d32f2f', // Red color on hover
                      },
                    }}>
                    <MdDelete />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      ) : (
        <Box sx={{ mt: 4, height: 400, overflow: 'auto', px: 2 }}>
          <Paper elevation={3} sx={{ borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      fontWeight: 'bold',
                      fontSize: '1.1rem',
                      backgroundColor: '#f5f5f5',
                      borderBottom: '2px solid #ddd',
                    }}
                  >
                    Test Name
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: 'bold',
                      fontSize: '1.1rem',
                      backgroundColor: '#f5f5f5',
                      borderBottom: '2px solid #ddd',
                    }}
                  >
                    Date
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: 'bold',
                      fontSize: '1.1rem',
                      backgroundColor: '#f5f5f5',
                      borderBottom: '2px solid #ddd',
                    }}
                  >
                    Number of Items
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: 'bold',
                      fontSize: '1.1rem',
                      backgroundColor: '#f5f5f5',
                      borderBottom: '2px solid #ddd',
                    }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTests.map((test, index) => (
                  <TableRow
                    key={index}
                    sx={{
                      '&:nth-of-type(odd)': {
                        backgroundColor: '#f9f9f9',
                      },
                      '&:hover': {
                        backgroundColor: '#f1f1f1',
                      },
                    }}
                  >
                    <TableCell sx={{ padding: '16px' }}>{test.name}</TableCell>
                    <TableCell align="center" sx={{ padding: '16px' }}>{test.date}</TableCell>
                    <TableCell align="center" sx={{ padding: '16px' }}>{test.items}</TableCell>
                    <TableCell align="center" sx={{ padding: '16px' }}>
                      <IconButton
                        onClick={() => handlePrint(test)}
                        sx={{
                          mx: 1,
                          color: '#fb8c00', // Custom color for edit icon (orange)
                          '&:hover': {
                            color: '#f57c00', // Darker orange on hover
                          },
                        }}
                      >
                        <FaDownload fontSize='medium' />
                      </IconButton>
                      <IconButton
                        onClick={() => handleEdit(index)}
                        sx={{
                          mx: 1,
                          color: '#1e88e5', // Custom color for download icon (blue)
                          '&:hover': {
                            color: '#1565c0', // Darker blue on hover
                          },
                        }}
                      >
                        <FaEdit fontSize='medium' />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(index, test.id)}
                        sx={{
                          mx: 1,
                          '&:hover': {
                            color: '#d32f2f', // Red color on hover
                          },
                        }}
                      >
                        <MdDelete fontSize='medium' />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Box>
      )}

      {/* Modal for creating or editing test questions */}
      <ModalTestQuestion isOpen={isModalOpen} onClose={closeModal} onSave={handleSave}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{fontWeight: 'bold'}}>Create/Edit Test</Typography>
          <TextField
            fullWidth
            label="Exam Name"
            value={testName}
            onChange={handleNameChange}
            variant="outlined"
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            label="Date"
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            variant="outlined"
            sx={{ mt: 2 }}
            InputLabelProps={{
              shrink: true,
            }}
            
          />
          <InputLabel sx={{ mt: 2, color: 'black', fontWeight: 'bold' }}>Select Number of Items</InputLabel>
          <Select
            fullWidth
            value={selectedOption}
            onChange={handleDropdownChange}
            variant="outlined"
            sx={{ mt: 1 }}
          >
            <MenuItem value="40">40 Items</MenuItem>
            <MenuItem value="50">50 Items</MenuItem>
          </Select>
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
            <IconButton color="primary" component="label">
              <FaPrint />
              <input
                type="file"
                accept=".pdf,.docx,.xlsx,.xls"
                onChange={handleFileChange}
                hidden
              />
            </IconButton>
            <Typography sx={{ ml: 1 }}>{selectedFile ? selectedFile.name : 'No file selected'}</Typography>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleRandomize}
              sx={{ ml: 2 }}
            >
              Randomize Questions & Answers
            </Button>

          </Box>
          <TextField
            fullWidth
            label="Exam Directions"
            multiline
            rows={4}
            value={directions}
            onChange={handleDirectionsChange}
            variant="outlined"
            sx={{ mt: 2 }}
          />
          {itemsInput.map((item, index) => (
            <Box key={index} sx={{ mt: 3, p: 2, border: '1px solid #ccc', borderRadius: 2 }}>
              <Typography variant="h6">Question {index + 1}</Typography>
              <TextField
                fullWidth
                label={`Question ${index + 1}`}
                value={item.question}
                onChange={(e) => {
                  const newItemsInput = [...itemsInput];
                  newItemsInput[index].question = e.target.value;
                  setItemsInput(newItemsInput);
                }}
                variant="outlined"
                sx={{ mt: 2 }}
              />
              {item.choices.map((choice, choiceIndex) => (
                <Box key={choiceIndex} sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                  <Checkbox
                    checked={choice.checked || false}
                    onChange={(e) => {
                      const newItemsInput = [...itemsInput];
                      newItemsInput[index].choices.forEach((ch, idx) => {
                        if (choiceIndex !== idx) ch.checked = false;
                      });
                      newItemsInput[index].choices[choiceIndex].checked = e.target.checked;
                      setItemsInput(newItemsInput);
                    }}
                  />
                  <TextField
                    fullWidth
                    label={`Answer ${String.fromCharCode(65 + choiceIndex)}`}
                    value={choice.text}
                    onChange={(e) => {
                      const newItemsInput = [...itemsInput];
                      newItemsInput[index].choices[choiceIndex].text = e.target.value;
                      setItemsInput(newItemsInput);
                    }}
                    variant="outlined"
                  />
                </Box>
              ))}
            </Box>
          ))}
        </Box>
      </ModalTestQuestion>
    </Box>
  );
}

export default CreateQuestions;
