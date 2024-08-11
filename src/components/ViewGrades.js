import React, { useState } from "react";
import { Grid, Paper, TextField, Typography, Box } from "@mui/material";

function ViewGrades() {
    const [grades, setGrades] = useState({
        writtenWorks: Array(10).fill(''),
        performanceTasks: Array(10).fill(''),
        periodicalTest: '',
    });

    const [highestScores, setHighestScores] = useState({
        writtenWorks: Array(10).fill(''),
        performanceTasks: Array(10).fill(''),
        periodicalTest: '',
    });

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

    const calculateFinalGrade = () => {
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

    return (
        <Box sx={{ width: '95%', margin: '0 auto', mt: 4 }}>
            <Typography variant="h5" component="h2" sx={{ textAlign: 'center', mb: 2 }}>First Quarter Grades</Typography>
            <Paper sx={{ padding: 2, borderRadius: 2 }}>
                <Grid container spacing={1} sx={{ border: '1px solid #ddd', borderRadius: 1 }}>
                    <Grid item xs={12} sx={{ backgroundColor: '#f5f5f5', textAlign: 'center', fontWeight: 'bold', borderBottom: '1px solid #ddd', padding: 1 }}>
                        GRADE & SECTION: G9 - RESPONSIBLE
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
                            <strong>{calculateWeightedScore('writtenWorks', 20).toFixed(2)}</strong>
                        </Grid>
                    </Grid>

                    <Grid item xs={12} sx={{ backgroundColor: '#f5f5f5', textAlign: 'center', fontWeight: 'bold', borderBottom: '1px solid #ddd', padding: 1 }}>
                        PERFORMANCE TASKS (60%)
                    </Grid>
                    <Grid container spacing={1} sx={{ borderBottom: '1px solid #ddd' }}>
                        {Array.from({ length: 10 }, (_, i) => (
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
                            <strong>{calculateWeightedScore('performanceTasks', 60).toFixed(2)}</strong>
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
                        <Grid item xs={6} sx={{ textAlign: 'center', borderRight: '1px solid #ddd', padding: 1, fontSize: '1.5rem' }}>
                            <strong>Final Grade</strong>
                        </Grid>
                        <Grid item xs={6} sx={{ textAlign: 'center', padding: 1, fontSize: '1.5rem' }}>
                            <strong>{calculateFinalGrade().toFixed(2)}</strong>
                        </Grid>
                    </Grid>
                </Grid>
            </Paper>
        </Box>
    );
}

export default ViewGrades;
