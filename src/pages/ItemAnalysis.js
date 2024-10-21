import React, { useState, useEffect } from 'react';
import { Box, MenuItem, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Paper, TextField, Grid, useMediaQuery, useTheme, Button } from '@mui/material';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase'; // Assuming your Firebase config is here
import { getCurrentUser, isSuperAdminLoggedIn } from '../utils/Authentication'; // Adjust path if needed
import Swal from 'sweetalert2';

function ItemAnalysis() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // Check if the screen size is small (mobile)

    const [sections, setSections] = useState([]);
    const [selectedSection, setSelectedSection] = useState('');
    const [quarter, setQuarter] = useState('');
    const [subjectArea, setSubjectArea] = useState('');
    const [noOfExaminees, setNoOfExaminees] = useState('');
    const [tests, setTests] = useState([]);
    const [selectedTest, setSelectedTest] = useState('');
    const [questions, setQuestions] = useState([]);
    const [competencies, setCompetencies] = useState({}); // State to store competencies input
    const [bulkCompetencyText, setBulkCompetencyText] = useState(''); // State for bulk input text
    const [range, setRange] = useState(''); // State for range input
    const [correctResponses, setCorrectResponses] = useState({}); // State for correct responses

    // Fetch sections based on current user
    useEffect(() => {
        const fetchSections = async () => {
            const currentUser = getCurrentUser();
            const isSuperAdminStatus = isSuperAdminLoggedIn();

            if (!currentUser) {
                Swal.fire({
                    icon: 'error',
                    title: 'Ooops...',
                    text: 'You must be logged in to view sections!',
                });
                return;
            }

            const sectionsCollection = collection(db, 'sections');
            let q;

            if (isSuperAdminStatus) {
                q = query(sectionsCollection);
            } else {
                q = query(sectionsCollection, where('teacherUID', '==', currentUser.uid));
            }

            const sectionSnapshot = await getDocs(q);
            const sectionList = sectionSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setSections(sectionList);
        };

        fetchSections();
    }, []);

    // Fetch tests based on the current user
    useEffect(() => {
        const fetchTests = async () => {
            const currentUser = getCurrentUser();
            if (!currentUser) return;

            const testsCollection = collection(db, 'tests');
            const testQuery = query(testsCollection, where('createdBy', '==', currentUser.uid));
            const testSnapshot = await getDocs(testQuery);
            const testList = testSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setTests(testList);
        };

        fetchTests();
    }, []);

    // Handle when the test is selected
    useEffect(() => {
        if (selectedTest) {
            const test = tests.find(test => test.id === selectedTest);
            if (test) {
                setQuestions(test.questions.A || []); // Retrieve Set A questions
            }
        }
    }, [selectedTest, tests]);

    // Fetch correct responses based on section and test
    const fetchCorrectResponses = async () => {
        if (!selectedSection || !selectedTest) return;

        try {
            const scoresCollection = collection(db, 'scores');
            const scoresQuery = query(
                scoresCollection,
                where('section', '==', selectedSection),
                where('testid', '==', selectedTest)
            );
            const scoresSnapshot = await getDocs(scoresQuery);
            const scoresList = scoresSnapshot.docs.map(doc => doc.data());

            const responseCount = {};

            // Helper to normalize text for comparison
            const normalizeText = (text) =>
                text.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, ' ').trim().toLowerCase();

            // Count correct responses
            scoresList.forEach(score => {
                const correctQuestions = score.correct_questions || [];

                correctQuestions.forEach(correctQuestion => {
                    const strippedQuestion = normalizeText(correctQuestion);
                    const matchingQuestion = questions.find(
                        questionObj => normalizeText(questionObj.question) === strippedQuestion
                    );

                    if (matchingQuestion) {
                        const questionIndex = questions.indexOf(matchingQuestion);
                        responseCount[questionIndex] = (responseCount[questionIndex] || 0) + 1;
                    }
                });
            });

            setCorrectResponses(responseCount);
        } catch (error) {
            console.error("Error fetching correct responses:", error);
            Swal.fire({
                icon: 'error',
                title: 'Ooops...',
                text: 'Error fetching the correct responses. Please try again.',
            });
        }
    };

    // Trigger fetching correct responses when dependencies change
    useEffect(() => {
        if (questions.length > 0) {
            fetchCorrectResponses();
        }
    }, [selectedSection, selectedTest, questions]);





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
            <Grid item xs={12}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mt: isMobile ? 5 : 0, mb: 2 }}>Item Analysis</Typography>
            </Grid>
            <Box sx={{ marginBottom: 2 }}>
                <Grid container spacing={2}>
                    {/* Row 1: Section and Quarter */}
                    <Grid item xs={12} sm={6}>
                        <Select
                            fullWidth
                            value={selectedSection}
                            onChange={(e) => setSelectedSection(e.target.value)}
                            displayEmpty
                            variant="outlined"
                            sx={{ backgroundColor: 'white', borderRadius: 1 }}
                        >
                            <MenuItem value="" disabled>Select Section</MenuItem>
                            {sections.map(section => (
                                <MenuItem key={section.id} value={section.id}>
                                    {section.section}
                                </MenuItem>
                            ))}
                        </Select>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Quarter"
                            value={quarter}
                            onChange={(e) => setQuarter(e.target.value)}
                            variant='outlined'
                            sx={{ backgroundColor: 'white', borderRadius: 2 }}
                        />
                    </Grid>

                    {/* Row 2: Subject Area and No. of Examinees */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Subject Area"
                            value={subjectArea}
                            onChange={(e) => setSubjectArea(e.target.value)}
                            variant='outlined'
                            sx={{ backgroundColor: 'white', borderRadius: 2 }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="No. of Examinees"
                            value={noOfExaminees}
                            onChange={(e) => setNoOfExaminees(e.target.value)}
                            variant='outlined'
                            sx={{ backgroundColor: 'white', borderRadius: 2 }}
                        />
                    </Grid>

                    {/* Row 3: Test Name Dropdown */}
                    <Grid item xs={12}>
                        <Select
                            fullWidth
                            value={selectedTest}
                            onChange={(e) => setSelectedTest(e.target.value)}
                            displayEmpty
                            variant="outlined"
                            sx={{ backgroundColor: 'white', borderRadius: 1 }}
                        >
                            <MenuItem value="" disabled>Select Test</MenuItem>
                            {tests.map(test => (
                                <MenuItem key={test.id} value={test.id}>
                                    {test.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </Grid>

                    {/* Competency Inputs */}
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Bulk Competency Input"
                            value={bulkCompetencyText}
                            onChange={(e) => setBulkCompetencyText(e.target.value)}
                            variant='outlined'
                            sx={{ backgroundColor: 'white', borderRadius: 2, mb: 1 }}
                        />
                        <TextField
                            fullWidth
                            label="Range (e.g., 1-5, 7, 9)"
                            value={range}
                            onChange={(e) => setRange(e.target.value)}
                            variant='outlined'
                            sx={{ backgroundColor: 'white', borderRadius: 2 }}
                        />
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleBulkCompetencyInput}
                            sx={{ mt: 1 }}
                        >
                            Apply Bulk Competency Input
                        </Button>
                    </Grid>
                </Grid>
            </Box>

            {/* Display Table of Questions */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>No.</TableCell>
                            <TableCell>Questions</TableCell>
                            <TableCell>Competencies</TableCell>
                            <TableCell>No. Correct Responses</TableCell>
                            <TableCell>% of Correct Responses</TableCell>
                            <TableCell>Remarks</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {questions.map((questionObj, index) => {
                            const correctCount = correctResponses[index] || 0; // Get the count of correct responses for the current question
                            const percentageCorrect = noOfExaminees ? (correctCount / noOfExaminees) * 100 : 0; // Calculate the percentage of correct responses

                            return (
                                <TableRow key={index}>
                                    <TableCell>{index + 1}</TableCell> {/* Display question number */}
                                    <TableCell>{questionObj.question}</TableCell> {/* Display the question text */}
                                    <TableCell>{competencies[index] || 'N/A'}</TableCell> {/* Display competencies if available */}
                                    <TableCell>{correctCount}</TableCell> {/* Display the count of correct responses */}
                                    <TableCell>{percentageCorrect.toFixed(2)}%</TableCell> {/* Display the percentage of correct responses */}
                                </TableRow>
                            );
                        })}
                    </TableBody>

                </Table>
            </TableContainer>
        </Box >
    );
}

export default ItemAnalysis;
