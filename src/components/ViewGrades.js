import React, { useState, useEffect } from "react";
import { Grid, Paper, TextField, Typography, Box, Button, Tabs, Tab } from "@mui/material";
import { db } from "../config/firebase";
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useParams } from "react-router-dom";


function ViewGrades() {
    const [student, setStudent] = useState({
        grade: '',
        section: '',
        FName: '',
        MName: '',
        LName: '',
        lrn: '',
    });

    const [loading, setLoading] = useState(true);
    const { id } = useParams();
    const [hasGrades, setHasGrades] = useState(false);
    const [activeQuarter, setActiveQuarter] = useState(0); // Track which tab (quarter) is selected

    const quarters = ['First Quarter', 'Second Quarter', 'Third Quarter', 'Fourth Quarter'];

    // Separate state for each quarter's grades
    const initialQuarterState = {
        writtenWorks: Array(9).fill(''),
        performanceTasks: Array(9).fill(''),
        periodicalTest: '' // Default empty
    };

    const [highestScores, setHighestScores] = useState({
        0: { ...initialQuarterState },
        1: { ...initialQuarterState },
        2: { ...initialQuarterState },
        3: { ...initialQuarterState },
    });

    const [grades, setGrades] = useState({
        0: { ...initialQuarterState },
        1: { ...initialQuarterState },
        2: { ...initialQuarterState },
        3: { ...initialQuarterState },
    });


    const fetchStudentData = async () => {
        try {
            const studentDoc = await getDoc(doc(db, 'students', id));
            if (studentDoc.exists()) {
                setStudent(studentDoc.data());
            } else {
                console.error("No student document found");
            }
        } catch (error) {
            console.error("Error fetching student data:", error);
        }
    };

    const fetchPeriodicalTestScore = async () => {
        try {
            const scoresQuery = query(collection(db, "scores"), where("student_info.student_id", "==", id));
            const querySnapshot = await getDocs(scoresQuery);

            setGrades((prevGrades) => {
                const newGrades = { ...prevGrades };
                setHighestScores((prevHighestScores) => {
                    const newHighestScores = { ...prevHighestScores };

                    querySnapshot.forEach((doc) => {
                        const scoreData = doc.data();
                        const quarter = scoreData.quarter;
                        const quarterIndex = quarters.indexOf(quarter);

                        if (quarterIndex !== -1) {
                            newGrades[quarterIndex].periodicalTest = scoreData.scores.total_correct.toString();
                            newHighestScores[quarterIndex].periodicalTest = (
                                scoreData.scores.total_correct + scoreData.scores.total_incorrect
                            ).toString();
                        }
                    });

                    return newHighestScores;
                });
                return newGrades;
            });
        } catch (error) {
            console.error("Error fetching periodical test scores:", error);
        }
    };





    useEffect(() => {
        const fetchData = async () => {
            await fetchStudentData();
            await fetchPeriodicalTestScore();
        };

        fetchData();
    }, [id]);


    useEffect(() => {
        // Trigger recalculations whenever grades or highestScores update
        calculateInitialGrade();
        calculateFinalGrade();
    }, [grades, highestScores]);

    const handleTabChange = (event, newValue) => {
        setActiveQuarter(newValue);
    };

    const handleHighestScoreChange = (event, index, category) => {
        setHighestScores((prevHighestScores) => {
            const newHighestScores = JSON.parse(JSON.stringify(prevHighestScores)); // Deep clone
            if (!newHighestScores[activeQuarter]) {
                newHighestScores[activeQuarter] = { writtenWorks: Array(9).fill(''), performanceTasks: Array(9).fill(''), periodicalTest: '' };
            }
            if (category === 'periodicalTest') {
                newHighestScores[activeQuarter].periodicalTest = event.target.value;
            } else {
                newHighestScores[activeQuarter][category][index] = event.target.value;
            }
            return newHighestScores;
        });
    };


    const handleGradeChange = (event, index, category) => {
        setGrades((prevGrades) => {
            const newGrades = { ...prevGrades };
            if (!newGrades[activeQuarter]) {
                newGrades[activeQuarter] = { writtenWorks: Array(9).fill(''), performanceTasks: Array(9).fill(''), periodicalTest: '' };
            }
            if (category === 'periodicalTest') {
                newGrades[activeQuarter].periodicalTest = event.target.value;
            } else {
                newGrades[activeQuarter][category][index] = event.target.value;
            }
            return newGrades;
        });
    };



    const calculateCategoryTotal = (category) => {
        const categoryGrades = grades[activeQuarter][category];
        console.log('Category Grades:', categoryGrades);
        if (!Array.isArray(categoryGrades)) return 0;
        return categoryGrades.reduce((acc, curr) => acc + (parseFloat(curr) || 0), 0);
    };


    const calculateCategoryTotalHighest = (category) => {
        const categoryHighest = highestScores[activeQuarter][category];
        console.log('Category Highest:', categoryHighest); // Log for debugging
        if (!Array.isArray(categoryHighest)) return 0; // Return 0 if not an array
        return categoryHighest.reduce((acc, curr) => acc + (parseFloat(curr) || 0), 0);
    };


    const calculatePercentageScore = (category) => {
        const total = calculateCategoryTotal(category);
        const highestPossible = calculateCategoryTotalHighest(category);
        return highestPossible > 0 ? (total / highestPossible) * 100 : 0;
    };

    const calculateWeightedScore = (category, weight) => {
        return (calculatePercentageScore(category) * weight) / 100;
    };

    const calculatePeriodicalTestPercentage = () => {
        const score = parseFloat(grades[activeQuarter]?.periodicalTest) || 0;
        const highest = parseFloat(highestScores[activeQuarter]?.periodicalTest) || 1; // Avoid division by 0
        return (score / highest) * 100;
    };

    const calculatePeriodicalTestWeighted = (weight) => {
        return (calculatePeriodicalTestPercentage() * weight) / 100;
    };

    useEffect(() => {
        const fetchGrades = async () => {
            try {
                const gradesDoc = await getDoc(doc(db, "grades", id));
                if (gradesDoc.exists()) {
                    const data = gradesDoc.data();
                    setGrades(data.grades);
                    setHighestScores(data.highestScores);
                    setHasGrades(true); // Mark that grades already exist
                }
            } catch (error) {
                console.error("Error fetching grades:", error);
            }
        };

        fetchGrades();
    }, [id]);


    const handleSave = async () => {
        try {
            const gradesData = {
                studentId: id,
                FName: student.FName,
                MName: student.MName,
                LName: student.LName,
                section: student.section,
                lrn: student.lrn,
                grades: grades,
                highestScores: highestScores,
                finalGrade: calculateFinalGrade(),
            };

            await setDoc(doc(db, "grades", id), gradesData);
            setHasGrades(true); // Mark as saved after successful operation
            alert("Grades saved successfully!");
        } catch (error) {
            console.error("Error saving grades:", error);
            alert("Failed to save grades.");
        }
    };


    const calculateInitialGrade = () => {
        const writtenWorksTotal = calculateCategoryTotal('writtenWorks'); // Total score for written works
        const performanceTasksTotal = calculateCategoryTotal('performanceTasks'); // Total score for performance tasks
        const periodicalTestScore = parseFloat(grades[activeQuarter]?.periodicalTest) || 0; // Periodical test score

        const writtenWorksHighest = calculateCategoryTotalHighest('writtenWorks'); // Highest possible score for written works
        const performanceTasksHighest = calculateCategoryTotalHighest('performanceTasks'); // Highest possible score for performance tasks
        const periodicalTestHighest = parseFloat(highestScores[activeQuarter]?.periodicalTest) || 1; // Avoid division by 0

        // Calculate averages (normalized by their highest possible scores)
        const writtenWorksAverage = writtenWorksHighest > 0
            ? (writtenWorksTotal / writtenWorksHighest) * 100 * 0.2
            : 0;

        const performanceTasksAverage = performanceTasksHighest > 0
            ? (performanceTasksTotal / performanceTasksHighest) * 100 * 0.6
            : 0;

        const periodicalTestAverage = periodicalTestHighest > 0
            ? (periodicalTestScore / periodicalTestHighest) * 100 * 0.2
            : 0;

        // Initial grade is the sum of the weighted averages
        const initialGrade = writtenWorksAverage + performanceTasksAverage + periodicalTestAverage;

        return initialGrade; // Returns initial grade as a percentage
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
            <Paper sx={{ padding: 2, borderRadius: 2 }}>
                <Tabs value={activeQuarter} onChange={handleTabChange} centered>
                    {quarters.map((quarter, index) => (
                        <Tab key={index} label={quarter} />
                    ))}
                </Tabs>

                {quarters.map((quarter, index) => (
                    <Box
                        key={index}
                        hidden={activeQuarter !== index}
                        sx={{ mt: 2 }}
                    >
                        {/* Reuse your existing layout here */}
                        <Grid container spacing={1} sx={{ border: '1px solid #ddd', borderRadius: 1 }}>
                            <Grid item xs={12} sx={{ backgroundColor: '#f5f5f5', textAlign: 'center', fontWeight: 'bold', borderBottom: '1px solid #ddd', padding: 1 }}>
                                {quarter}
                            </Grid>
                            <Grid item xs={12} sx={{ backgroundColor: '#f5f5f5', textAlign: 'center', fontWeight: 'bold', borderBottom: '1px solid #ddd', padding: 1 }}>
                                GRADE & SECTION: {student.grade} - {student.section}
                            </Grid>

                            {/* WRITTEN WORKS */}
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
                                {(highestScores[activeQuarter]?.writtenWorks || []).map((score, i) => (
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
                                {(grades[activeQuarter]?.writtenWorks || []).map((grade, i) => (
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
                                    {/* Display PS for Written Works */}
                                    <strong>{calculatePercentageScore('writtenWorks').toFixed(2)}%</strong>
                                </Grid>
                                <Grid item xs={1} sx={{ textAlign: 'center', padding: 1 }}>
                                    {/* Display WS for Written Works */}
                                    <strong>{calculateWeightedScore('writtenWorks', 20).toFixed(2)}</strong>
                                </Grid>
                            </Grid>

                            {/* PERFORMANCE TASK */}
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
                                {(highestScores[activeQuarter]?.performanceTasks || []).map((score, i) => (
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
                                <Grid item xs={1} sx={{ textAlign: 'center', borderRight: '1px solid #ddd', padding: 1 }}>
                                    {/* Display PS for Written Works */}
                                    <strong>{calculatePercentageScore('performanceTasks').toFixed(2)}%</strong>
                                </Grid>
                                <Grid item xs={1} sx={{ textAlign: 'center', padding: 1 }}>
                                    {/* Display WS for Written Works */}
                                    <strong>{calculateWeightedScore('performanceTasks', 60).toFixed(2)}</strong>
                                </Grid>
                            </Grid>

                            <Grid container spacing={1} sx={{ borderBottom: '1px solid #ddd' }}>
                                {(grades[activeQuarter]?.performanceTasks || []).map((grade, i) => (
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
                            </Grid>

                            {/* PERIODICAL TEST */}
                            <Grid item xs={12} sx={{ backgroundColor: '#f5f5f5', textAlign: 'center', fontWeight: 'bold', borderBottom: '1px solid #ddd', padding: 1 }}>
                                PERIODICAL TEST (20%)
                            </Grid>
                            <Grid container spacing={1} sx={{ borderBottom: '1px solid #ddd' }}>
                                <Grid item xs={3} sx={{ textAlign: 'center', padding: 1, mt: 1 }}>
                                    <strong>Highest Score Possible</strong>
                                </Grid>
                                <Grid item xs={3} sx={{ textAlign: 'center', padding: 1 }}>
                                    <TextField
                                        value={highestScores[activeQuarter]?.periodicalTest || ''}
                                        variant="outlined"
                                        size="small"
                                        disabled
                                        sx={{ width: '100%' }}
                                    />
                                </Grid>
                                <Grid item xs={3} sx={{ textAlign: 'center', padding: 1, mt: 1 }}>
                                    <strong>Score</strong>
                                </Grid>
                                <Grid item xs={3} sx={{ textAlign: 'center', padding: 1 }}>
                                    <TextField
                                        value={grades[activeQuarter]?.periodicalTest || ''}
                                        variant="outlined"
                                        size="small"
                                        disabled
                                        sx={{ width: '100%' }}
                                    />
                                </Grid>
                            </Grid>
                            <Grid container spacing={1} sx={{ borderBottom: '1px solid #ddd' }}>
                                <Grid item xs={3} sx={{ textAlign: 'center', padding: 1 }}>
                                    <strong>PS</strong>
                                </Grid>
                                <Grid item xs={3} sx={{ textAlign: 'center', padding: 1 }}>
                                    <strong>{calculatePeriodicalTestPercentage().toFixed(2)}%</strong>
                                </Grid>
                                <Grid item xs={3} sx={{ textAlign: 'center', padding: 1 }}>
                                    <strong>WS</strong>
                                </Grid>
                                <Grid item xs={3} sx={{ textAlign: 'center', padding: 1 }}>
                                    <strong>{calculatePeriodicalTestWeighted(20).toFixed(2)}%</strong>
                                </Grid>
                            </Grid>
                            {/* INITIAL GRADE */}
                            <Grid container spacing={1} sx={{ borderBottom: '1px solid #ddd' }}>
                                <Grid item xs={6} sx={{ textAlign: 'center', borderRight: '1px solid #ddd', padding: 1, fontSize: '1.25rem' }}>
                                    <strong>Inital Grade</strong>
                                </Grid>
                                <Grid item xs={6} sx={{ textAlign: 'center', padding: 1, fontSize: '1.25rem' }}>
                                    <strong>{calculateInitialGrade().toFixed(2)}</strong>
                                </Grid>
                            </Grid>
                            {/* FINAL GRADE */}
                            <Grid container spacing={1} sx={{ borderBottom: '1px solid #ddd' }}>
                                <Grid item xs={6} sx={{ textAlign: 'center', borderRight: '1px solid #ddd', padding: 1, fontSize: '1.5rem' }}>
                                    <strong>Final Grade</strong>
                                </Grid>
                                <Grid item xs={6} sx={{ textAlign: 'center', padding: 1, fontSize: '1.5rem' }}>
                                    <strong>{calculateFinalGrade().toFixed(2)}</strong>
                                </Grid>
                            </Grid>

                            {/* Save Button */}
                            <Grid item xs={12} sx={{ textAlign: 'center', mt: 1, mb: 2 }}>
                                <Button variant="contained" color="primary" onClick={handleSave}>
                                    {hasGrades ? "Update Grades" : "Save Grades"}
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>
                ))}
            </Paper>
        </Box>
    );
}

export default ViewGrades;