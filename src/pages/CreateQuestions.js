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
import { getCurrentUser, isSuperAdminLoggedIn } from '../utils/Authentication';

import { collection, getDoc, addDoc, getFirestore, updateDoc, doc, onSnapshot, deleteDoc, getDocs, query, where } from "firebase/firestore"; // Import Firestore functions
import { db, auth } from '../config/firebase'

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

  const [sections, setSections] = useState([]); // Holds sections data
  const [selectedSection, setSelectedSection] = useState(""); // Holds the selected section
  const [filteredSubjects, setFilteredSubjects] = useState([]); // Holds subjects filtered by selected section
  const [selectedSubject, setSelectedSubject] = useState(""); // Holds the selected subject

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // const db = getDatabase(app);
  // Load saved tests from Firebase on component mount
  useEffect(() => {
    const testsRef = collection(db, 'tests');
    const currentUser = getCurrentUser();
    const isSuperAdmin = isSuperAdminLoggedIn();

    const unsubscribe = onSnapshot(testsRef, (snapshot) => {
      const tests = [];
      snapshot.forEach((doc) => {
        const test = { id: doc.id, ...doc.data() };

        if (isSuperAdmin || test.createdBy === currentUser.uid) {
          tests.push(test);
        }
      });
      setSavedTests(tests.reverse());
    });

    return () => unsubscribe();
  }, []);

  // Fetch the students' LRN, Name, and Section
  const fetchStudentsData = async () => {
    try {
      const studentsRef = collection(db, 'students'); // Reference to the 'students' collection
      const snapshot = await getDocs(studentsRef); // Fetch all student documents
      const studentsData = snapshot.docs.map(doc => doc.data()); // Get data from each document

      const studentsInfo = studentsData.map(student => ({
        name: `${student.FName} ${student.MName ? student.MName[0] + '.' : ''} ${student.LName}`,
        section: student.section,
        lrn: student.lrn
      }));

      console.log("Fetched students info:", studentsInfo);
      return studentsInfo;
    } catch (error) {
      console.error("Error fetching student data: ", error);
    }
  };

  // Use the fetchStudentsData function
  useEffect(() => {
    fetchStudentsData();
  }, []);

  useEffect(() => {
    const fetchSections = async () => {
      const sectionsRef = collection(db, 'sections');
      const snapshot = await getDocs(sectionsRef);
      const sectionsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSections(sectionsData);
    };
    fetchSections();
  }, []);
  
  // Update filtered subjects based on selected section
  useEffect(() => {
      if (selectedSection) {
        const sectionData = sections.find(section => section.id === selectedSection);
        setFilteredSubjects(sectionData ? [sectionData.subject] : []);
        setSelectedSubject('');
      }
  }, [selectedSection, sections]);
    
  // Fetch sections and subjects based on the current user
  useEffect(() => {
    const fetchSectionsAndStudents = async () => {
      const user = getCurrentUser();
      const isSuperAdmin = isSuperAdminLoggedIn();
      if (!user) {
        console.error("No user is currently logged in.");
        return;
      }

      try {
        let sectionsData = [];
        if (isSuperAdmin) {
          // Fetch all sections if super admin
          const allSectionsSnapshot = await getDocs(collection(db, 'sections'));
          sectionsData = allSectionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } else {
          // Fetch sections added by the current user (teacher)
          const sectionsQuery = query(collection(db, 'sections'), where('teacherUID', '==', user.uid));
          const sectionsSnapshot = await getDocs(sectionsQuery);
          sectionsData = sectionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }

        setSections(sectionsData);

      } catch (error) {
        console.error('Error fetching sections:', error);
      }
    };

    fetchSectionsAndStudents();
  }, []);

  // Fetch tests based on search term and selected section/subject
  useEffect(() => {
      const fetchTests = async () => {
        const testsRef = collection(db, 'tests');
        const queryConditions = [];
  
        if (selectedSection) queryConditions.push(where('section', '==', selectedSection));
        if (selectedSubject) queryConditions.push(where('subject', '==', selectedSubject));
  
        const testsQuery = query(testsRef, ...queryConditions);
        const snapshot = await getDocs(testsQuery);
        const testsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSavedTests(testsData);
      };
  
      fetchTests();
  }, [selectedSection, selectedSubject]);
  
  // Handle subject change
  const handleSubjectChange = (event) => {
      setSelectedSubject(event.target.value);
  };

  const filteredTests = savedTests.filter((test) =>
      test.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedSection === '' || test.section === selectedSection) &&
      (selectedSubject === '' || test.subject === selectedSubject)
  );
    
  // Update filtered subjects based on selected section
  const handleSectionChange = (event) => {
    const sectionId = event.target.value;
    setSelectedSection(sectionId);
  
    // Find the selected section data based on sectionId
    const selectedSectionData = sections.find(section => section.id === sectionId);
  
    // If the section has subjects, set them, otherwise reset the subject list
    if (selectedSectionData && selectedSectionData.subjects) {
      setFilteredSubjects(selectedSectionData.subjects);
    } else {
      setFilteredSubjects([]);
    }
  
    // Reset selected subject whenever the section changes
    setSelectedSubject("");
  };

  const generateAnswerSheetPDF = async (testId, set = 'A', selectedSection) => {
    // Fetch test data from Firestore
    const testDocRef = doc(db, 'tests', testId);
    let testData;
  
    try {
      const testDoc = await getDoc(testDocRef);
      if (testDoc.exists()) {
        testData = testDoc.data();
        console.log('Fetched test data:', testData);
      } else {
        console.error('No such document!');
        return;
      }
    } catch (error) {
      console.error('Error fetching test data:', error);
      return;
    }
  
    // Initialize jsPDF instance
    const pdfDoc = new jsPDF({ format: 'a4' });
  
    // Extract questions from the selected set (either A or B)
    const selectedQuestions = testData.questions[set];
    
      // Fetch students data
    const studentsInfo = await fetchStudentsData();
    const filteredStudents = studentsInfo.filter(student => student.section === selectedSection);

    // Define margins and page width
    const marginTop = 10;
    const marginLeft = 20;
    const marginRight = 15;
    const pageWidth = pdfDoc.internal.pageSize.width;
    
    //Iterate over each student to create a separate page
    filteredStudents.forEach((student, index) => {
    // Add a new page for each student except the first one
    if (index > 0) pdfDoc.addPage();
      // Header text
      pdfDoc.setFontSize(12);
      pdfDoc.setFont('helvetica', 'bold'); // Make the header text bold
      pdfDoc.text(`NAME: ${student.name}`, marginLeft, marginTop + 5);
      pdfDoc.text(`SECTION: ${student.section}`, marginLeft, marginTop + 11);
      pdfDoc.text('DATE:____________________________________________', marginLeft, marginTop + 16.5);
      pdfDoc.text('SUBJECT:____________________________________________', marginLeft, marginTop + 21.5);
      pdfDoc.text(`LRN:                          ${student.lrn}`, marginLeft, marginTop + 30.5);
    
      // Add 12 squares next to "LRN" in one line without lines inside
      const squareSize = 8;
      const startX = marginLeft + 15;
      const startY = marginTop + 25;
    
      pdfDoc.setLineWidth(1); // Make the box line thicker for LRN
      pdfDoc.rect(startX, startY, squareSize * 12, squareSize); // One large box for LRN
      pdfDoc.setLineWidth(0.2); // Reset line width for other elements
    
      // Define position for the "SET" box and circles
      const setBoxX = startX + 140; // Adjust the position next to LRN
      const setBoxY = marginTop + 5;
      const setBoxWidth = 30;
      const setBoxHeight = 13;
    
      // Add "SET" text above the box
      pdfDoc.setFontSize(12);
      pdfDoc.text('SET', setBoxX, setBoxY - 2); // Bold the "SET" text
    
      // Draw the box for "SET"
      pdfDoc.setLineWidth(1); // Set the box line thicker like the question boxes
      pdfDoc.rect(setBoxX, setBoxY, setBoxWidth - 5, setBoxHeight + 10);
    
      // Reset line width for circles
      pdfDoc.setLineWidth(0.2);
    
      // Draw the circles with (A) and (B) inside the "SET" box
      const circleRadius = 3.5;
      const circleA_X = setBoxX + 8;
      const circleB_X = setBoxX + 18;
      const circleY = setBoxY + 11;
    
      pdfDoc.circle(circleA_X, circleY, circleRadius); // Circle A
      pdfDoc.text('A', circleA_X - 1.5, circleY + 1);
    
      pdfDoc.circle(circleB_X, circleY, circleRadius); // Circle B
      pdfDoc.text('B', circleB_X - 1.5, circleY + 1);
    
      // Define dimensions for three columns in the first row
      const columnMargin = 12;
      const colWidth = (pageWidth - marginLeft - marginRight - 2 * columnMargin) / 3; // 3 columns
      const boxHeight = 96;
      const startRowY = startY + 20;
    
      // Function to draw a question box for 10 questions
      const drawQuestionBox = (row, col, questionStart, colCount) => {
        const xOffset = marginLeft + col * (colWidth + columnMargin);
        const yOffset = startRowY + row * (boxHeight + 3);
    
        // Set thicker line width for the boxes
        pdfDoc.setLineWidth(1);
        pdfDoc.rect(xOffset, yOffset, colWidth, boxHeight); // Draw box for 10 questions
    
        // Reset line width to default (1) for circles and text
        pdfDoc.setLineWidth(0.2);
    
        // Draw question numbers and answer choices (A, B, C, D)
        for (let i = 0; i < 10; i++) {
          const questionIndex = questionStart + i - 1;
          if (questionIndex >= selectedQuestions.length) return; // Stop when reaching the total number of questions
    
          const questionY = yOffset + 10 + i * 9;
    
          // Place question number
          pdfDoc.text(`${questionStart + i}.`, xOffset - 10, questionY);
    
          // Draw the answer choice placeholders (A, B, C, D)
          const choiceXStart = xOffset + 8;
          const choiceSpacing = (colWidth - 4) / 4; // 4 choices: A, B, C, D
          const choices = ['A', 'B', 'C', 'D'];
    
          choices.forEach((choice, choiceIndex) => {
            const choiceX = choiceXStart + choiceIndex * choiceSpacing;
            pdfDoc.circle(choiceX, questionY - 2.5, 3.5); // Draw circle for the choice
            pdfDoc.text(choice, choiceX - 1.5, questionY - 1); // Display choice letter (A, B, C, D)
          });
        }
      };
    
      // Total number of questions and boxes needed
      const numQuestions = selectedQuestions.length;
      const numBoxes = Math.ceil(numQuestions / 10);
    
      // First row with 3 columns
      for (let col = 0; col < 3; col++) {
        const boxNumber = col;
        const questionStart = boxNumber * 10 + 1;
        if (questionStart <= numQuestions) {
          drawQuestionBox(0, col, questionStart, 3);
        }
      }
    
      // Second row with remaining boxes (up to 2 columns)
      for (let col = 0; col < 2; col++) {
        const boxNumber = 3 + col;
        const questionStart = boxNumber * 10 + 1;
        if (questionStart <= numQuestions) {
          drawQuestionBox(1, col, questionStart, 2);
        }
      }
    });
    // Save the PDF
    pdfDoc.save('answer_sheet.pdf');
  };
  
  const handlePrint = async (test) => {
    console.log('Received test:', test);
  
    // Validate test structure and ensure questions exist
    if (!test || !test.questions || !Array.isArray(test.questions.A) || !Array.isArray(test.questions.B)) {
      console.error('Selected test or questions are undefined or not an array');
      return;
    }
  
    // Retrieve the section from the selected test row
    const selectedSection = test.section;
    console.log(`Generating answer sheet for section: ${selectedSection}`);
  
    // Confirmation modal to ensure user wants to generate PDFs
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
        // Ensure there's no empty set before generating
        if (questionsA.length > 0) {
          await generatePDF(questionsA, 'A', test.directions);
        } else {
          console.warn('Questions A is empty, skipping PDF generation for Set A.');
        }
  
        if (questionsB.length > 0) {
          await generatePDF(questionsB, 'B', test.directions);
        } else {
          console.warn('Questions B is empty, skipping PDF generation for Set B.');
        }
  
        // Generate answer sheet PDF based on the section and test ID
        if (questionsA.length > 0 || questionsB.length > 0) {
          await generateAnswerSheetPDF(test.id, 'A', selectedSection); // Pass section to generateAnswerSheetPDF
        } else {
          throw new Error('No questions available to generate an answer sheet.');
        }
  
        // Success message on completion
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'PDFs have been generated successfully!',
        });
      } catch (error) {
        // Handle error in PDF generation
        console.error('Error generating PDFs:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: `Failed to generate PDFs: ${error.message}`,
        });
      }
    } else {
      // Handle cancellation of the process
      Swal.fire({
        icon: 'info',
        title: 'Cancelled',
        text: 'PDF generation has been cancelled.',
      });
    }
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

  const handleDelete = async (index, testId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You won\'t be able to revert this!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const testDocRef = doc(db, 'tests', testId); // Get a reference to the document
        await deleteDoc(testDocRef); // Delete the document
        const updatedTests = savedTests.filter((_, idx) => idx !== index);
        setSavedTests(updatedTests);
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'The test has been deleted successfully.',
        });
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: `Error: ${error.message}`,
        });
      }
    }
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

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleTestTypeFilterChange = (e) => {
    setSelectedTestType(e.target.value);
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

  const handleDirectionsChange = (e) => {
    setDirections(e.target.value);
  };
  
  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const handleSave = async () => {
    // Ensure the section data is retrieved based on the selected ID
  const selectedSectionData = sections.find(section => section.id === selectedSection);
  // Validate the input fields
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

  // Prepare the test data
  const randomizedQuestionsA = shuffleArray(itemsInput.map(item => ({
    ...item,
    choices: item.choices.map((choice, index) => ({
      ...choice,
      id: index // Update the choice ID to be 0, 1, 2, 3
    }))
  })));

  const randomizedQuestionsB = shuffleArray(itemsInput.map(item => ({
    ...item,
    choices: item.choices.map((choice, index) => ({
      ...choice,
      id: index // Update the choice ID to be 0, 1, 2, 3
    }))
  })));

  const newTest = {
    name: testName,
    date: selectedDate,
    items: selectedOption,
    directions: directions,
    createdBy: getCurrentUser().uid, // Add the creator's UID
    section: selectedSectionData.section,  // Add the selected section
    subject: selectedSubject,  // Add the selected subject
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
    setSelectedSection('');  // Reset section
    setSelectedSubject('');  // Reset subject
  };

  try {
    if (editIndex !== null) {
      // Update existing test
      const testDocRef = doc(db, 'tests', savedTests[editIndex].id);
      await updateDoc(testDocRef, newTest);
    } else {
      // Add new test
      await addDoc(collection(db, 'tests'), newTest);
    }
    successMessage();
    resetForm();
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error!',
      text: `Error: ${error.message}`,
    });
  }
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
        {/* Section Dropdown */}
        <Grid item xs={12} sm={4}>
            <Select
              fullWidth
              value={selectedSection}
              onChange={handleSectionChange}
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
              <MenuItem value="">Select Section</MenuItem>
              {sections.map((section, index) => (
                <MenuItem key={index} value={section.id}>{section.name}</MenuItem>
              ))}
            </Select>
          </Grid>

          {/* Subject Dropdown */}
          <Grid item xs={12} sm={4}>
            <Select
              fullWidth
              value={selectedSubject}
              onChange={handleSubjectChange}
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
              disabled={!selectedSection} // Disable if no section is selected
            >
              <MenuItem value="">Select Subject</MenuItem>
              {filteredSubjects.map((subject, index) => (
                <MenuItem key={index} value={subject}>{subject}</MenuItem>
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

      {isMobile ? (
        <Box sx={{ mt: 4 }}>
          {savedTests.map((test, index) => (
            <Card key={index} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6">{test.name}</Typography>
                <Typography>Date: {test.date}</Typography>
                <Typography>Items: {test.items}</Typography>
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                  <IconButton color="primary" onClick={() => handlePrint(test)} sx={{ color: '#1e88e5', '&:hover': { color: '#1565c0' } }}>
                    <FaDownload />
                  </IconButton>
                  <IconButton color="secondary" onClick={() => handleEdit(index)} sx={{ color: '#fb8c00', '&:hover': { color: '#f57c00' } }}>
                    <FaEdit />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(index, test.id)} sx={{ '&:hover': { color: '#d32f2f' } }}>
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
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: '#f5f5f5' }}>Test Name</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: '#f5f5f5' }}>Date</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: '#f5f5f5' }}>Items</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: '#f5f5f5' }}>Section</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: '#f5f5f5' }}>Subject</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: '#f5f5f5' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {savedTests.filter(test => 
                  test.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
                  (selectedSection === '' || test.section === selectedSection) &&
                  (selectedSubject === '' || test.subject === selectedSubject)
                ).map((test, index) => (
                  <TableRow key={index} sx={{ '&:nth-of-type(odd)': { backgroundColor: '#f9f9f9' }, '&:hover': { backgroundColor: '#f1f1f1' } }}>
                    <TableCell sx={{ padding: '16px' }}>{test.name}</TableCell>
                    <TableCell align="center" sx={{ padding: '16px' }}>{test.date}</TableCell>
                    <TableCell align="center" sx={{ padding: '16px' }}>{test.items}</TableCell>
                    <TableCell align="center" sx={{ padding: '16px' }}>{test.section}</TableCell>
                    <TableCell align="center" sx={{ padding: '16px' }}>{test.subject}</TableCell>
                    <TableCell align="center" sx={{ padding: '16px' }}>
                      <IconButton onClick={() => handlePrint(test)} sx={{ mx: 1, color: '#fb8c00', '&:hover': { color: '#f57c00' } }}>
                        <FaDownload fontSize='medium' />
                      </IconButton>
                      <IconButton onClick={() => handleEdit(index)} sx={{ mx: 1, color: '#1e88e5', '&:hover': { color: '#1565c0' } }}>
                        <FaEdit fontSize='medium' />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(index, test.id)} sx={{ mx: 1, '&:hover': { color: '#d32f2f' } }}>
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
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Create/Edit Test</Typography>
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
          {/* Section Selection */}
          <InputLabel sx={{ mt: 2, color: 'black', fontWeight: 'bold' }}>Select Section</InputLabel>
          <Select
            fullWidth
            value={selectedSection}
            onChange={handleSectionChange}
            variant="outlined"
            sx={{ mt: 1 }}
          >
            {sections.map((section) => (
              <MenuItem key={section.id} value={section.id}>
                {section.section}
              </MenuItem>
            ))}
          </Select>

          {/* Subject Selection */}
          <InputLabel sx={{ mt: 2, color: 'black', fontWeight: 'bold' }}>Select Subject</InputLabel>
          <Select
            fullWidth
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            variant="outlined"
            sx={{ mt: 1 }}
            disabled={!selectedSection}
          >
            {filteredSubjects.map((subject, index) => (
              <MenuItem key={index} value={subject}>
                {subject}
              </MenuItem>
            ))}
          </Select>

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
