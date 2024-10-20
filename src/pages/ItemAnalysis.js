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
    const [competencies, setCompetencies] = useState({}); // New state to store competencies input
    const [bulkCompetencyText, setBulkCompetencyText] = useState(''); // State for bulk input text
    const [range, setRange] = useState(''); // State for range input

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

    // Handle input change for competencies
    const handleCompetencyChange = (index, value) => {
        setCompetencies(prevState => ({
            ...prevState,
            [index]: value,
        }));
    };

    // Handle bulk input replication for competencies
    const handleBulkCompetencyInput = () => {
        // Trim spaces and split by comma
        const input = range.split(',').map(item => item.trim());
        const updatedCompetencies = { ...competencies };
        let isValid = true;

        input.forEach(item => {
            if (item.includes('-')) {
                // Handle range (e.g., "1-10")
                const [start, end] = item.split('-').map(Number);

                // Validate the input range
                if (isNaN(start) || isNaN(end) || start < 1 || end < start || end > questions.length) {
                    isValid = false;
                    return; // Exit loop on error
                }

                // Update competencies for the specified range
                for (let i = start - 1; i < end; i++) {
                    updatedCompetencies[i] = bulkCompetencyText;
                }
            } else {
                // Handle specific number (e.g., "1", "6")
                const number = Number(item);

                // Validate the specific number
                if (isNaN(number) || number < 1 || number > questions.length) {
                    isValid = false;
                    return; // Exit loop on error
                }

                // Update competency for the specific number
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
            {/* Dropdown and text fields before the table */}
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
                            sx={{
                                backgroundColor: 'white',
                                borderRadius: 1,
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#818181',
                                },
                            }}
                        >
                            <MenuItem value="" disabled>Select Section</MenuItem>
                            {sections.map(section => (
                                <MenuItem key={section.id} value={section.id}>
                                    {section.section} {/* Adjust based on your section field */}
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

                    {/* Row 2: Subject Area and No. of Examinees */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Subject Area"
                            value={subjectArea}
                            onChange={(e) => setSubjectArea(e.target.value)}
                            variant='outlined'
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
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="No. of Examinees"
                            value={noOfExaminees}
                            onChange={(e) => setNoOfExaminees(e.target.value)}
                            variant='outlined'
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

                    {/* Row 3: Test Name Dropdown */}
                    <Grid item xs={12}>
                        <Select
                            fullWidth
                            value={selectedTest}
                            onChange={(e) => setSelectedTest(e.target.value)}
                            displayEmpty
                            variant="outlined"
                            sx={{
                                backgroundColor: 'white',
                                borderRadius: 1,
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#818181',
                                },
                            }}
                        >
                            <MenuItem value="" disabled>Select Test</MenuItem>
                            {tests.map(test => (
                                <MenuItem key={test.id} value={test.id}>
                                    {test.name} {/* Adjust based on your test name field */}
                                </MenuItem>
                            ))}
                        </Select>
                    </Grid>
                    {/* Other Inputs */}
                    {/* Add inputs for bulk competency input and range */}
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Add Competency"
                            value={bulkCompetencyText}
                            onChange={(e) => setBulkCompetencyText(e.target.value)}
                            variant='outlined'
                            sx={{ backgroundColor: 'white', borderRadius: 2 }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Number/s (e.g., 1-15, 8, 11-13)"
                            value={range}
                            onChange={(e) => setRange(e.target.value)}
                            variant='outlined'
                            sx={{ backgroundColor: 'white', borderRadius: 2 }}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Button variant="contained" onClick={handleBulkCompetencyInput}>Add Competency</Button>
                    </Grid>
                </Grid>
            </Box>

            {/* Table */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }} align='center'>No.</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }} align='center'>Questions</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }} align='center'>Competencies</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }} align='center'>No. of Correct Response</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }} align='center'>% of Correct Response</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }} align='center'>Remarks</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {questions.map((questionObj, index) => (
                            <TableRow key={index}>
                                <TableCell align='center'>{index + 1}</TableCell>
                                <TableCell align='center'>{questionObj.question}</TableCell> {/* Display the question text */}
                                <TableCell align='center'>
                                    {competencies[index] || 'N/A'} {/* Display competency value or 'N/A' if not set */}
                                </TableCell>

                                <TableCell align='center'>Correct Responses</TableCell> {/* Adjust as needed */}
                                <TableCell align='center'>% Correct</TableCell> {/* Adjust as needed */}
                                <TableCell align='center'>Remarks</TableCell> {/* Adjust as needed */}
                            </TableRow>
                        ))}
                    </TableBody>

                </Table>
            </TableContainer>
        </Box>
    );
}

export default ItemAnalysis;
