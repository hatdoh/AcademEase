import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaSort } from 'react-icons/fa';
import { MdAdd } from 'react-icons/md';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Box, Button, MenuItem, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, Typography, Paper, Grid, useMediaQuery, useTheme, Avatar } from '@mui/material';

function AttendanceSummary() {
    const [students, setStudents] = useState([]);
    const [selectedSection, setSelectedSection] = useState('All');
    const [selectedAttendanceSummary, setSelectedAttendanceSummary] = useState('Daily');
    const [sectionList, setSectionList] = useState(['All']);
    const [attendanceSummaryList] = useState(['Daily', 'Weekly', 'Monthly']);
    const [lateSortOrder, setLateSortOrder] = useState(null);
    const [absentSortOrder, setAbsentSortOrder] = useState(null);
    const [presentSortOrder, setPresentSortOrder] = useState(null);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        const fetchAttendanceData = async () => {
            const attendanceCollection = collection(db, 'attendance');
            let attendanceQuery = attendanceCollection;

            if (startDate && endDate) {
                attendanceQuery = query(attendanceCollection,
                    where('date', '>=', startDate),
                    where('date', '<=', endDate)
                );
            }

            const querySnapshot = await getDocs(attendanceQuery);
            const attendanceData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));

            const studentData = attendanceData.reduce((acc, record) => {
                const { id, FName, LName, MName, section, remarks, image, grade } = record;
                const key = `${LName} ${FName} ${MName}-${section}`;

                if (!acc[key]) {
                    acc[key] = {
                        id,
                        name: `${LName}, ${FName} ${MName}`,
                        grade,
                        section,
                        image: image || 'defaultImageURL',
                        totalLate: 0,
                        totalAbsent: 0,
                        totalPresent: 0,
                    };
                }

                if (remarks === 'late') acc[key].totalLate += 1;
                if (remarks === 'absent') acc[key].totalAbsent += 1;
                if (remarks === 'present') acc[key].totalPresent += 1;

                return acc;
            }, {});

            setStudents(Object.values(studentData));
        };

        const fetchSectionData = async () => {
            const querySnapshot = await getDocs(collection(db, 'sections'));
            const sections = querySnapshot.docs.map(doc => doc.data().section);
            setSectionList(['All', ...sections]);
        };

        fetchAttendanceData();
        fetchSectionData();
    }, [startDate, endDate]);

    const handleSectionChange = (event) => {
        setSelectedSection(event.target.value);
    };

    const handleAttendanceSummaryChange = (event) => {
        setSelectedAttendanceSummary(event.target.value);
    };

    const filterByAttendanceSummary = (student, summary) => {
        switch (summary) {
            case 'Daily':
                return student.totalLate <= 1 && student.totalAbsent <= 1;
            case 'Weekly':
                return student.totalLate <= 5 && student.totalAbsent <= 5;
            case 'Monthly':
                return student.totalLate <= 25 && student.totalAbsent <= 25;
            default:
                return true;
        }
    };

    const sortByLate = () => {
        const sortedStudents = [...students];
        if (lateSortOrder === null || lateSortOrder === 'desc') {
            setLateSortOrder('asc');
            sortedStudents.sort((a, b) => a.totalLate - b.totalLate);
        } else {
            setLateSortOrder('desc');
            sortedStudents.sort((a, b) => b.totalLate - a.totalLate);
        }
        setStudents(sortedStudents);
    };

    const sortByAbsent = () => {
        const sortedStudents = [...students];
        if (absentSortOrder === null || absentSortOrder === 'desc') {
            setAbsentSortOrder('asc');
            sortedStudents.sort((a, b) => a.totalAbsent - b.totalAbsent);
        } else {
            setAbsentSortOrder('desc');
            sortedStudents.sort((a, b) => b.totalAbsent - a.totalAbsent);
        }
        setStudents(sortedStudents);
    };

    const sortByPresent = () => {
        const sortedStudents = [...students];
        if (presentSortOrder === null || presentSortOrder === 'desc') {
            setPresentSortOrder('asc');
            sortedStudents.sort((a, b) => a.totalPresent - b.totalPresent);
        } else {
            setPresentSortOrder('desc');
            sortedStudents.sort((a, b) => b.totalPresent - a.totalPresent);
        }
        setStudents(sortedStudents);
    };

    const filteredStudents = students.filter(student =>
        (selectedSection === 'All' || student.section === selectedSection) &&
        filterByAttendanceSummary(student, selectedAttendanceSummary)
    );

    return (
        <Box sx={{ padding: 2 }}>
            <Grid container spacing={2} mb={2}>
                <Grid item xs={12}>
                    <Typography variant="h6">Attendance Summary ({selectedSection})</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Select
                        value={selectedSection}
                        onChange={handleSectionChange}
                        fullWidth
                        variant="outlined"
                        sx={{ backgroundColor: 'white', borderRadius: 1 }}
                    >
                        {sectionList.map((section) => (
                            <MenuItem key={section} value={section}>
                                {section === 'All' ? 'All Sections' : `Section ${section}`}
                            </MenuItem>
                        ))}
                    </Select>
                </Grid>
                <Grid item xs={12} sm={6} md={3} sx={{ mt: 2 }}>
                    <DatePicker
                        selected={startDate}
                        onChange={(date) => setStartDate(date)}
                        selectsStart
                        startDate={startDate}
                        endDate={endDate}
                        placeholderText="From"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3} sx={{ mt: 2 }}>
                    <DatePicker
                        selected={endDate}
                        onChange={(date) => setEndDate(date)}
                        selectsEnd
                        startDate={startDate}
                        endDate={endDate}
                        minDate={startDate}
                        placeholderText="To"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3} sx={{ mt: 1 }}>
                    <Link to="/school-form" style={{ textDecoration: 'none' }}>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<MdAdd />}
                            fullWidth={isMobile}
                        >
                            Create SF2
                        </Button>
                    </Link>
                </Grid>
            </Grid>

            {isMobile ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', marginTop: 2 }}>
                    {filteredStudents.map((student, index) => (
                        <Box key={student.id} sx={{ border: '1px solid', borderRadius: 1, padding: 2, mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                {student.image && (
                                    <Avatar src={student.image} alt={student.name} sx={{ width: 80, height: 80, mt: 1 }} />
                                )}
                            </Box>
                            <Typography variant="h6" sx={{ marginLeft: 1 }}>
                                {index + 1}. {student.name}
                            </Typography>
                            <Typography variant="body1"><strong>Grade:</strong> {student.grade}</Typography>
                            <Typography variant="body1"><strong>Section:</strong> {student.section}</Typography>
                            <Typography variant="body1"><strong>Total Present:</strong> {student.totalPresent}</Typography>
                            <Typography variant="body1"><strong>Total Late:</strong> {student.totalLate}</Typography>
                            <Typography variant="body1"><strong>Total Absent:</strong> {student.totalAbsent}</Typography>
                            <Link to={`/profile/${student.id}`} style={{ textDecoration: 'none', color: theme.palette.primary.main }}>
                                View Profile
                            </Link>
                        </Box>
                    ))}
                </Box>
            ) : (
                <TableContainer component={Paper} sx={{ marginTop: 2 }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell style={{fontWeight: 'bold'}}>Name</TableCell>
                                <TableCell align='center' style={{fontWeight: 'bold'}}>Section</TableCell>
                                <TableCell align='center' style={{fontWeight: 'bold'}}>
                                    <TableSortLabel
                                        active={lateSortOrder !== null}
                                        direction={lateSortOrder || 'asc'}
                                        onClick={sortByLate}
                                    >
                                        Total Late <FaSort />
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell align='center' style={{fontWeight: 'bold'}}>
                                    <TableSortLabel
                                        active={absentSortOrder !== null}
                                        direction={absentSortOrder || 'asc'}
                                        onClick={sortByAbsent}
                                    >
                                        Total Absent <FaSort />
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell align="center" style={{fontWeight: 'bold'}}>
                                    <TableSortLabel
                                        active={presentSortOrder !== null}
                                        direction={presentSortOrder || 'asc'}
                                        onClick={sortByPresent}
                                    >
                                        Total Present <FaSort />
                                    </TableSortLabel>
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredStudents.map((student, index) => (
                                <TableRow key={student.id}>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            {student.image && (
                                                <Avatar src={student.image} alt={student.name} sx={{ width: 40, height: 40, marginRight: 2 }} />
                                            )}
                                            <Link to={`/profile/${student.id}`} style={{ textDecoration: 'none', color: theme.palette.primary.main, fontWeight: 'bold' }}>
                                                <Typography>{student.name}</Typography>
                                            </Link>
                                        </Box>
                                    </TableCell>
                                    <TableCell align='center'>{student.section}</TableCell>
                                    <TableCell align="center">{student.totalLate}</TableCell>
                                    <TableCell align="center">{student.totalAbsent}</TableCell>
                                    <TableCell align="center">{student.totalPresent}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
}

export default AttendanceSummary;
