import React, { useState, useEffect } from "react";
import { Grid, Paper, TextField, Typography, Box } from "@mui/material";
import { db } from "../config/firebase";
import { doc, getDoc } from 'firebase/firestore';
import { useParams } from "react-router-dom";

function ViewGrades() {

    const [student, setStudent] = useState({
        grade: '',
        section: ''
    });
    
    const [loading, setLoading] = useState(true);
    const { id } = useParams();

    const [grades, setGrades] = useState({
        writtenWorks: Array(9).fill(''),
        performanceTasks: Array(9).fill(''),
        periodicalTest: '',
    });

    const [highestScores, setHighestScores] = useState({
        writtenWorks: Array(9).fill(''),
        performanceTasks: Array(9).fill(''),
        periodicalTest: '',
    });

    useEffect(() => {
        const fetchStudent = async () => {
            try {
                const docRef = doc(db, 'students', id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const studentData = docSnap.data();
                    setStudent({
                        grade: studentData.grade,
                        section: studentData.section
                    });
                } else {
                    console.error('No such document!');
                }
                setLoading(false);
            } catch (error) {
                console.error('Error fetching student:', error);
                setLoading(false);
            }
        };

        fetchStudent();
    }, [id]);

    const handleGradeChange = (event, index, category) => {
        const newGrades = { ...grades };
        if (category === 'periodicalTest') {
            newGrades[category] = event.target.value;
        } else {
            newGrades[category][index] = event.target.value;
        }
        setGrades(newGrades);
    };

    const handleHighestScoreChange = (event, index, category) => {
        const newHighestScores = { ...highestScores };
        if (category === 'periodicalTest') {
            newHighestScores[category] = event.target.value;
        } else {
            newHighestScores[category][index] = event.target.value;
        }
        setHighestScores(newHighestScores);
    };

    const calculateCategoryTotal = (category) => {
        const categoryGrades = grades[category];
        if (Array.isArray(categoryGrades)) {
            return categoryGrades.reduce((acc, curr) => acc + (parseFloat(curr) || 0), 0);
        }
        return parseFloat(categoryGrades) || 0;
    };

    const calculateCategoryTotalHighest = (category) => {
        const categoryHighest = highestScores[category];
        if (Array.isArray(categoryHighest)) {
            return categoryHighest.reduce((acc, curr) => acc + (parseFloat(curr) || 0), 0);
        }
        return parseFloat(categoryHighest) || 0;
    };

    const calculatePercentageScore = (category) => {
        const total = calculateCategoryTotal(category);
        const highestPossible = calculateCategoryTotalHighest(category);
        return highestPossible > 0 ? (total / highestPossible) * 100 : 0;
    };

    const calculateWeightedScore = (category, weight) => {
        return (calculatePercentageScore(category) * weight) / 100;
    };

    const calculateInitialGrade = () => {
        const writtenWorksTotal = calculateCategoryTotal('writtenWorks');
        const performanceTasksTotal = calculateCategoryTotal('performanceTasks');
        const periodicalTestScore = parseFloat(grades.periodicalTest) || 0;

        const writtenWorksHighest = calculateCategoryTotalHighest('writtenWorks');
        const performanceTasksHighest = calculateCategoryTotalHighest('performanceTasks');
        const periodicalTestHighest = parseFloat(highestScores.periodicalTest) || 1;

        const writtenWorksAverage = (writtenWorksTotal / (writtenWorksHighest || 1)) * 0.2;
        const performanceTasksAverage = (performanceTasksTotal / (performanceTasksHighest || 1)) * 0.6;
        const periodicalTestAverage = (periodicalTestScore / (periodicalTestHighest || 1)) * 0.2;

        return (writtenWorksAverage + performanceTasksAverage + periodicalTestAverage) * 100;
    };

    const transmuteGrade = (initialGrade) => {
        if (initialGrade == 100) return 100;
        if (initialGrade >= 98.40) return 99;
        if (initialGrade >= 96.80) return 98;
        if (initialGrade >= 95.20) return 97;
        if (initialGrade >= 93.60) return 96;
        if (initialGrade >= 92.00) return 95;
        if (initialGrade >= 90.40) return 94;
        if (initialGrade >= 88.80) return 93;
        if (initialGrade >= 87.20) return 92;
        if (initialGrade >= 85.60) return 91;
        if (initialGrade >= 84.00) return 90;
        if (initialGrade >= 82.40) return 89;
        if (initialGrade >= 80.80) return 88;
        if (initialGrade >= 79.20) return 87;
        if (initialGrade >= 77.60) return 86;
        if (initialGrade >= 76.00) return 85;
        if (initialGrade >= 74.40) return 84;
        if (initialGrade >= 72.80) return 83;
        if (initialGrade >= 71.20) return 82;
        if (initialGrade >= 69.60) return 81;
        if (initialGrade >= 68.00) return 80;
        if (initialGrade >= 66.40) return 79;
        if (initialGrade >= 64.80) return 78;
        if (initialGrade >= 63.20) return 77;
        if (initialGrade >= 61.60) return 76;
        if (initialGrade >= 60.00) return 75;
        if (initialGrade >= 56.00) return 74;
        if (initialGrade >= 52.00) return 73;
        if (initialGrade >= 48.00) return 72;
        if (initialGrade >= 44.00) return 71;
        if (initialGrade >= 40.00) return 70;
        if (initialGrade >= 36.00) return 69;
        if (initialGrade >= 32.00) return 68;
        if (initialGrade >= 28.00) return 67;
        if (initialGrade >= 24.00) return 66;
        if (initialGrade >= 20.00) return 65;
        if (initialGrade >= 16.00) return 64;
        if (initialGrade >= 12.00) return 63;
        if (initialGrade >= 8.00) return 62;
        if (initialGrade >= 4.00) return 61;
        if (initialGrade >= 3.99) return 60;
        return 0;
    };

    const calculateFinalGrade = () => {
        const initialGrade = calculateInitialGrade();
        return transmuteGrade(initialGrade);
    };

    return (
        <Box sx={{ width: '95%', margin: '0 auto', mt: 4 }}>
            <Typography variant="h5" component="h2" sx={{ textAlign: 'center', mb: 2 }}>First Quarter Grades</Typography>
            <Paper sx={{ padding: 2, borderRadius: 2 }}>
                <Grid container spacing={1} sx={{ border: '1px solid #ddd', borderRadius: 1 }}>
                    <Grid item xs={12} sx={{ backgroundColor: '#f5f5f5', textAlign: 'center', fontWeight: 'bold', borderBottom: '1px solid #ddd', padding: 1 }}>
                        GRADE & SECTION: {student.grade} - {student.section}
                    </Grid>
                    <Grid item xs={12} sx={{ backgroundColor: '#f5f5f5', textAlign: 'center', fontWeight: 'bold', borderBottom: '1px solid #ddd', padding: 1 }}>
                        SUBJECT: TLE - COOKERY
                    </Grid>
                    <Grid item xs={12} sx={{ backgroundColor: '#f5f5f5', textAlign: 'center', fontWeight: 'bold', borderBottom: '1px solid #ddd', padding: 1 }}>
                        WRITTEN WORKS (20%)
                    </Grid>
                    <Grid container spacing={1} sx={{ borderBottom: '1px solid #ddd' }}>
                        {Array.from({ length: 9 }, (_, i) => (
                            <Grid item xs={1} key={i} sx={{ textAlign: 'center', borderRight: '1px solid #ddd', padding: 1 }}>
                                WW {i + 1}
                            </Grid>
                        ))}
                        <Grid item xs={1} sx={{ textAlign: 'center', borderRight: '1px solid #ddd', padding: 1 }}>
                            <strong>Total</strong>
                        </Grid>
                        <Grid item xs={1} sx={{ textAlign: 'center', borderRight: '1px solid #ddd', padding: 1 }}>
                            <strong>PS</strong>
                        </Grid>
                        <Grid item xs={1} sx={{ textAlign: 'center', padding: 1 }}>
                            <strong>WS</strong>
                        </Grid>
                    </Grid>

                    <Grid container spacing={1} sx={{ borderBottom: '1px solid #ddd' }}>
                        {highestScores.writtenWorks.map((score, i) => (
                            <Grid item xs={1} key={i} sx={{ borderRight: '1px solid #ddd', padding: 1 }}>
                                <TextField
                                    value={score}
                                    onChange={(event) => handleHighestScoreChange(event, i, 'writtenWorks')}
                                    variant="outlined"
                                    size="small"
                                    type="number"
                                    inputProps={{ min: 0, max: 100 }}
                                    sx={{ width: '100%' }}
                                />
                            </Grid>
                        ))}
                        <Grid item xs={1} sx={{ textAlign: 'center', borderRight: '1px solid #ddd', padding: 1 }}>
                            <strong>{calculateCategoryTotalHighest('writtenWorks')}</strong>
                        </Grid>
                    </Grid>

                    <Grid container spacing={1} sx={{ borderBottom: '1px solid #ddd' }}>
                        {grades.writtenWorks.map((grade, i) => (
                            <Grid item xs={1} key={i} sx={{ borderRight: '1px solid #ddd', padding: 1 }}>
                                <TextField
                                    value={grade}
                                    onChange={(event) => handleGradeChange(event, i, 'writtenWorks')}
                                    variant="outlined"
                                    size="small"
                                    type="number"
                                    inputProps={{ min: 0, max: 100 }}
                                    sx={{ width: '100%' }}
                                />
                            </Grid>
                        ))}
                        <Grid item xs={1} sx={{ textAlign: 'center', borderRight: '1px solid #ddd', padding: 1 }}>
                            <strong>{calculateCategoryTotal('writtenWorks')}</strong>
                        </Grid>
                        <Grid item xs={1} sx={{ textAlign: 'center', borderRight: '1px solid #ddd', padding: 1 }}>
                            <strong>{calculatePercentageScore('writtenWorks').toFixed(2)}%</strong>
                        </Grid>
                        <Grid item xs={1} sx={{ textAlign: 'center', padding: 1 }}>
                            <strong>{calculateWeightedScore('writtenWorks', 20).toFixed(2)}%</strong>
                        </Grid>
                    </Grid>

                    <Grid item xs={12} sx={{ backgroundColor: '#f5f5f5', textAlign: 'center', fontWeight: 'bold', borderBottom: '1px solid #ddd', padding: 1 }}>
                        PERFORMANCE TASKS (60%)
                    </Grid>
                    <Grid container spacing={1} sx={{ borderBottom: '1px solid #ddd' }}>
                        {Array.from({ length: 9 }, (_, i) => (
                            <Grid item xs={1} key={i} sx={{ textAlign: 'center', borderRight: '1px solid #ddd', padding: 1 }}>
                                PT {i + 1}
                            </Grid>
                        ))}
                        <Grid item xs={1} sx={{ textAlign: 'center', borderRight: '1px solid #ddd', padding: 1 }}>
                            <strong>Total</strong>
                        </Grid>
                        <Grid item xs={1} sx={{ textAlign: 'center', borderRight: '1px solid #ddd', padding: 1 }}>
                            <strong>PS</strong>
                        </Grid>
                        <Grid item xs={1} sx={{ textAlign: 'center', padding: 1 }}>
                            <strong>WS</strong>
                        </Grid>
                    </Grid>

                    <Grid container spacing={1} sx={{ borderBottom: '1px solid #ddd' }}>
                        {highestScores.performanceTasks.map((score, i) => (
                            <Grid item xs={1} key={i} sx={{ borderRight: '1px solid #ddd', padding: 1 }}>
                                <TextField
                                    value={score}
                                    onChange={(event) => handleHighestScoreChange(event, i, 'performanceTasks')}
                                    variant="outlined"
                                    size="small"
                                    type="number"
                                    inputProps={{ min: 0, max: 100 }}
                                    sx={{ width: '100%' }}
                                />
                            </Grid>
                        ))}
                        <Grid item xs={1} sx={{ textAlign: 'center', borderRight: '1px solid #ddd', padding: 1 }}>
                            <strong>{calculateCategoryTotalHighest('performanceTasks')}</strong>
                        </Grid>
                    </Grid>

                    <Grid container spacing={1} sx={{ borderBottom: '1px solid #ddd' }}>
                        {grades.performanceTasks.map((grade, i) => (
                            <Grid item xs={1} key={i} sx={{ borderRight: '1px solid #ddd', padding: 1 }}>
                                <TextField
                                    value={grade}
                                    onChange={(event) => handleGradeChange(event, i, 'performanceTasks')}
                                    variant="outlined"
                                    size="small"
                                    type="number"
                                    inputProps={{ min: 0, max: 100 }}
                                    sx={{ width: '100%' }}
                                />
                            </Grid>
                        ))}
                        <Grid item xs={1} sx={{ textAlign: 'center', borderRight: '1px solid #ddd', padding: 1 }}>
                            <strong>{calculateCategoryTotal('performanceTasks')}</strong>
                        </Grid>
                        <Grid item xs={1} sx={{ textAlign: 'center', borderRight: '1px solid #ddd', padding: 1 }}>
                            <strong>{calculatePercentageScore('performanceTasks').toFixed(2)}%</strong>
                        </Grid>
                        <Grid item xs={1} sx={{ textAlign: 'center', padding: 1 }}>
                            <strong>{calculateWeightedScore('performanceTasks', 60).toFixed(2)}%</strong>
                        </Grid>
                    </Grid>

                    <Grid item xs={12} sx={{ backgroundColor: '#f5f5f5', textAlign: 'center', fontWeight: 'bold', borderBottom: '1px solid #ddd', padding: 1 }}>
                        PERIODICAL TEST (20%)
                    </Grid>
                    <Grid container spacing={1} sx={{ borderBottom: '1px solid #ddd' }}>
                        <Grid item xs={3} sx={{ textAlign: 'center', padding: 1 }}>
                            <strong>Highest Score Possible</strong>
                        </Grid>
                        <Grid item xs={3} sx={{ textAlign: 'center', padding: 1 }}>
                            <TextField
                                value={highestScores.periodicalTest}
                                onChange={(event) => handleHighestScoreChange(event, 0, 'periodicalTest')}
                                variant="outlined"
                                size="small"
                                type="number"
                                inputProps={{ min: 0, max: 100 }}
                                sx={{ width: '100%' }}
                            />
                        </Grid>
                        <Grid item xs={3} sx={{ textAlign: 'center', padding: 1 }}>
                            <strong>Score</strong>
                        </Grid>
                        <Grid item xs={3} sx={{ textAlign: 'center', padding: 1 }}>
                            <TextField
                                value={grades.periodicalTest}
                                onChange={(event) => handleGradeChange(event, 0, 'periodicalTest')}
                                variant="outlined"
                                size="small"
                                type="number"
                                inputProps={{ min: 0, max: 100 }}
                                sx={{ width: '100%' }}
                            />
                        </Grid>
                    </Grid>
                    <Grid container spacing={1} sx={{ borderBottom: '1px solid #ddd' }}>
                        <Grid item xs={3} sx={{ textAlign: 'center', padding: 1 }}>
                            <strong>PS</strong>
                        </Grid>
                        <Grid item xs={3} sx={{ textAlign: 'center', padding: 1 }}>
                            <strong>{calculatePercentageScore('periodicalTest').toFixed(2)}%</strong>
                        </Grid>
                        <Grid item xs={3} sx={{ textAlign: 'center', padding: 1 }}>
                            <strong>WS</strong>
                        </Grid>
                        <Grid item xs={3} sx={{ textAlign: 'center', padding: 1 }}>
                            <strong>{calculateWeightedScore('periodicalTest', 20).toFixed(2)}%</strong>
                        </Grid>
                    </Grid>
                    <Grid container spacing={1} sx={{ borderBottom: '1px solid #ddd' }}>
                        <Grid item xs={6} sx={{ textAlign: 'center', borderRight: '1px solid #ddd', padding: 1, fontSize: '1.25rem' }}>
                            <strong>Inital Grade</strong>
                        </Grid>
                        <Grid item xs={6} sx={{ textAlign: 'center', padding: 1, fontSize: '1.25rem' }}>
                            <strong>{calculateInitialGrade().toFixed(2)}</strong>
                        </Grid>
                    </Grid>
                    <Grid container spacing={1} sx={{ borderBottom: '1px solid #ddd' }}>
                        <Grid item xs={6} sx={{ textAlign: 'center', borderRight: '1px solid #ddd', padding: 1, fontSize: '1.5rem' }}>
                            <strong>Final Grade</strong>
                        </Grid>
                        <Grid item xs={6} sx={{ textAlign: 'center', padding: 1, fontSize: '1.5rem' }}>
                            <strong>{calculateFinalGrade().toFixed(2)}</strong>
                        </Grid>
                    </Grid>
                </Grid>
            </Paper>
        </Box >
    );
}

export default ViewGrades;
