import React, { useState, useEffect } from 'react';
import {
  Box, MenuItem, Select, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Typography, Paper, TextField, Grid, Button, useMediaQuery, useTheme
} from '@mui/material';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { getCurrentUser } from '../utils/Authentication';
import Swal from 'sweetalert2';

function ItemAnalysis() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState('');
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState('');
  const [questions, setQuestions] = useState([]);
  const [noOfExaminees, setNoOfExaminees] = useState('');
  const [correctResponses, setCorrectResponses] = useState({});
  const [competencies, setCompetencies] = useState({});
  const [bulkCompetencyText, setBulkCompetencyText] = useState('');
  const [range, setRange] = useState('');
  const [quarter, setQuarter] = useState('');

  useEffect(() => {
    const fetchSections = async () => {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        Swal.fire({ icon: 'error', title: 'Ooops...', text: 'You must be logged in!' });
        return;
      }

      const sectionsQuery = query(collection(db, 'sections'), where('teacherUID', '==', currentUser.uid));
      const sectionSnapshot = await getDocs(sectionsQuery);
      const sectionList = sectionSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSections(sectionList);
    };
    fetchSections();
  }, []);

  useEffect(() => {
    const fetchTests = async () => {
      const scoresQuery = query(collection(db, 'scores'));
      const scoresSnapshot = await getDocs(scoresQuery);

      const uniqueTests = [...new Set(scoresSnapshot.docs.map(doc => doc.data().test_name))];
      setTests(uniqueTests);
    };
    fetchTests();
  }, []);

  useEffect(() => {
    const fetchQuestionsAndResponses = async () => {
      if (!selectedTest || !selectedSection) return;

      try {
        const scoresQuery = query(
          collection(db, 'scores'),
          where('test_name', '==', selectedTest),
          where('student_info.section', '==', selectedSection)
        );
        const scoresSnapshot = await getDocs(scoresQuery);
        const scoresList = scoresSnapshot.docs.map(doc => doc.data());

        const questionMap = {};
        const responseCount = {};

        scoresList.forEach(score => {
          score.scores.question_results.forEach(result => {
            const questionNum = result.question_number;
            if (!questionMap[questionNum]) {
              questionMap[questionNum] = result.question_text;
              responseCount[questionNum] = 0;
            }
            if (result.is_correct) {
              responseCount[questionNum] += 1;
            }
          });
        });

        setQuestions(Object.entries(questionMap).map(([num, text]) => ({
          question_number: Number(num),
          question_text: text,
        })));
        setCorrectResponses(responseCount);
        setNoOfExaminees(scoresList.length);
      } catch (error) {
        console.error('Error fetching questions:', error);
        Swal.fire({ icon: 'error', title: 'Error', text: 'Could not fetch data!' });
      }
    };
    fetchQuestionsAndResponses();
  }, [selectedTest, selectedSection]);

  // Determine difficulty level based on % of correct responses
  const getDifficultyLevel = (percentageCorrect) => {
    if (percentageCorrect <= 30) return "High";
    if (percentageCorrect > 30 && percentageCorrect < 80) return "Medium";
    return "Low";
  };

  // Handle input change for competencies
  const handleCompetencyChange = (index, value) => {
    setCompetencies(prevState => ({
      ...prevState,
      [index]: value,
    }));
  };

  // Handle bulk input replication for competencies
  const handleBulkCompetencyInput = () => {
    const input = range.split(',').map(item => item.trim());
    const updatedCompetencies = { ...competencies };
    let isValid = true;

    input.forEach(item => {
      if (item.includes('-')) {
        const [start, end] = item.split('-').map(Number);

        if (isNaN(start) || isNaN(end) || start < 1 || end < start || end > questions.length) {
          isValid = false;
          return;
        }

        for (let i = start - 1; i < end; i++) {
          updatedCompetencies[i] = bulkCompetencyText;
        }
      } else {
        const number = Number(item);
        if (isNaN(number) || number < 1 || number > questions.length) {
          isValid = false;
          return;
        }

        updatedCompetencies[number - 1] = bulkCompetencyText;
      }
    });

    if (!isValid) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Input',
        text: 'Please enter a valid range or specific numbers (e.g., 1-10 or 1,6,7).',
      });
      return;
    }

    setCompetencies(updatedCompetencies);
  };

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>Item Analysis</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Select
            fullWidth value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            displayEmpty variant="outlined"
            sx={{ backgroundColor: 'white', borderRadius: 1 }}
          >
            <MenuItem value="" disabled>Select Section</MenuItem>
            {sections.map(section => (
              <MenuItem key={section.id} value={section.section}>{section.section}</MenuItem>
            ))}
          </Select>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth value={quarter}
            onChange={(e) => setQuarter(e.target.value)}
            label="Quarter"
            variant="outlined"
            sx={{ backgroundColor: 'white', borderRadius: 2 }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth label="Subject Area" variant="outlined"
            sx={{ backgroundColor: 'white', borderRadius: 2 }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <Select
            fullWidth value={selectedTest}
            onChange={(e) => setSelectedTest(e.target.value)}
            displayEmpty variant="outlined"
            sx={{ backgroundColor: 'white', borderRadius: 2 }}
          >
            <MenuItem value="" disabled>Select Test</MenuItem>
            {tests.map(test => (
              <MenuItem key={test} value={test}>{test}</MenuItem>
            ))}
          </Select>
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth value={noOfExaminees}
            label="No. of Examinees"
            variant="outlined"
            sx={{ backgroundColor: 'white', borderRadius: 2 }}
            disabled
          />
        </Grid>

        <Grid item xs={4}> {/* Adjust size to fit 3 items in the row */}
          <TextField
            fullWidth
            value={bulkCompetencyText}
            onChange={(e) => setBulkCompetencyText(e.target.value)}
            label="Competency Input"
            variant="outlined"
            sx={{ backgroundColor: 'white', borderRadius: 2 }}
          />
        </Grid>

        <Grid item xs={4}> {/* Adjust size to fit 3 items in the row */}
          <TextField
            fullWidth
            value={range}
            onChange={(e) => setRange(e.target.value)}
            label="Range (1-9 or comma-separated values)"
            variant="outlined"
            sx={{ backgroundColor: 'white', borderRadius: 2 }}
          />
        </Grid>

        <Grid item xs={4}> {/* Adjust size to fit 3 items in the row */}
          <Button
            variant="contained"
            onClick={handleBulkCompetencyInput}
            sx={{ mt: 1 }}
          >
            Apply Competency
          </Button>
        </Grid>

      </Grid>

      {/* Existing Table */}
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align='center' sx={{fontWeight: 'bold'}}>No.</TableCell>
              <TableCell sx={{fontWeight: 'bold'}}>Questions</TableCell>
              <TableCell sx={{fontWeight: 'bold'}}>Competencies</TableCell>
              <TableCell align='center' sx={{fontWeight: 'bold'}}>No. Correct Responses</TableCell>
              <TableCell align='center' sx={{fontWeight: 'bold'}}>% of Correct Responses</TableCell>
              <TableCell align='center' sx={{fontWeight: 'bold'}}>Difficulty Level</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {questions.map((question, index) => {
              const correctCount = correctResponses[question.question_number] || 0;
              const percentCorrect = noOfExaminees ? Math.round((correctCount / noOfExaminees) * 100) : 0;
              const difficultyLevel = getDifficultyLevel(percentCorrect);

              return (
                <TableRow key={question.question_number}>
                  <TableCell align='center'>{question.question_number}</TableCell>
                  <TableCell>{question.question_text}</TableCell>
                  <TableCell align='center'>{competencies[index] || 'N/A'}</TableCell>
                  <TableCell align='center'>{correctCount}</TableCell>
                  <TableCell align='center'>{percentCorrect}%</TableCell>
                  <TableCell align='center'>{difficultyLevel}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default ItemAnalysis;
