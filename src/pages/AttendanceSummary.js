import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MdAdd } from 'react-icons/md';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { getCurrentUser } from '../utils/Authentication';
import ExcelJS from 'exceljs';
import saveAs from 'file-saver';
import dayjs from 'dayjs';
import {
    Box, Button, MenuItem, Select, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, TableSortLabel, Typography,
    Paper, Grid, useMediaQuery, useTheme, Avatar, Dialog, DialogActions,
    DialogContent, DialogTitle, TextField
} from '@mui/material';

function AttendanceSummary() {
    // State declarations and other variables
    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [selectedSection, setSelectedSection] = useState('All');
    const [selectedAttendanceSummary, setSelectedAttendanceSummary] = useState('Daily');
    const [sectionList, setSectionList] = useState(['All']);
    const [attendanceSummaryList] = useState(['Daily', 'Weekly', 'Monthly']);
    const [lateSortOrder, setLateSortOrder] = useState(null);
    const [absentSortOrder, setAbsentSortOrder] = useState(null);
    const [presentSortOrder, setPresentSortOrder] = useState(null);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    const [openModal, setOpenModal] = useState(false); // Modal open state
    const [schoolYear, setSchoolYear] = useState('');  // School Year input
    const [selectedGrade, setSelectedGrade] = useState('7');  // Grade dropdown
    const [selectedMonth, setSelectedMonth] = useState('January');  // Month dropdown
    const [modalSections, setModalSections] = useState([]);  // Sections for the modal dropdown

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        const fetchAttendanceData = async () => {
            const currentUser = getCurrentUser();
            const attendanceCollection = collection(db, 'attendance');
            let attendanceQuery = attendanceCollection;
    
            const querySnapshot = await getDocs(attendanceQuery);
            const attendanceData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
    
            console.log('Fetched attendance data:', attendanceData); // Debugging
    
            const studentData = attendanceData.reduce((acc, record) => {
                const { id, FName, LName, MName, section, remarks, image, grade } = record;
                const key = `${ LName } ${ FName } ${ MName }-${ section }`;
    
                if (!acc[key]) {
                    acc[key] = {
                        id,
                        name: `${ LName }, ${ FName } ${ MName }`,
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
            }, { });
    
            setStudents(Object.values(studentData));
            setAttendance(attendanceData); // Ensure attendance data is set
        };
    
        const fetchSectionData = async () => {
            const currentUser = getCurrentUser();
            const sectionsQuery = query(collection(db, 'sections'), where('teacherUID', '==', currentUser.uid));
            const querySnapshot = await getDocs(sectionsQuery);
            const sections = querySnapshot.docs.map(doc => doc.data().section);
            setSectionList(['All', ...sections]);
            setModalSections(sections);
        };
    
        fetchAttendanceData();
        fetchSectionData();
    }, []);
    

const handleSectionChange = (event) => {
    setSelectedSection(event.target.value);
};

const handleAttendanceSummaryChange = (event) => {
    setSelectedAttendanceSummary(event.target.value);
};

const openSF2Modal = () => setOpenModal(true);  // Open modal
const closeSF2Modal = () => setOpenModal(false);  // Close modal

const handleGenerateSF2 = async () => {
    try {
        console.log('Attendance data at generate time:', attendance); // Debugging: Check attendance data
        console.log('Student data:', students); // Debugging: Check student data

        if (attendance.length === 0) {
            console.error('Attendance data is empty.');
            alert('No attendance data available.');
            return; // Exit early if no data is available
        }

        // Ensure the template file is in the 'public/resources/' folder
        const templateFile = `${process.env.PUBLIC_URL}/resources/SF2_Template.xlsx`;
        console.log('Fetching template from:', templateFile); // Debugging: Check file path

        const response = await fetch(templateFile);

        if (!response.ok) {
            throw new Error('Failed to fetch the template file. Check the file path or network issue.');
        }

        const arrayBuffer = await response.arrayBuffer();
        const workbook = new ExcelJS.Workbook();

        // Load the workbook from the buffer
        await workbook.xlsx.load(arrayBuffer);
        console.log('Template file loaded successfully.'); // Debugging: Ensure file loaded

        const worksheet = workbook.getWorksheet(1); // Assuming first sheet

        // School information and inputs from the modal
        worksheet.getCell('C6').value = '500030';
        worksheet.getCell('C8').value = 'Moreno Integrated School';
        worksheet.mergeCells('C8:O8');
        
        worksheet.getCell('K6').value = schoolYear;
        worksheet.getCell('X6').value = selectedMonth; 
        worksheet.getCell('X8').value = selectedGrade; 
        worksheet.getCell('AC8').value = selectedSection; 

        const startRowForNames = 14;
        const startColumnForDates = 4; // Column D
        const startRowForDates = 11;
        const startRowForAttendance = 14;

        // Filter students by the selected section
        const filteredStudents = students.filter(student => student.section === selectedSection);

        if (filteredStudents.length === 0) {
            console.warn('No students found for the selected section.');
            alert('No students found for the selected section.');
            return;
        }

        // Write learner names in column B starting from row 14
        filteredStudents.forEach((student, index) => {
            const row = worksheet.getRow(startRowForNames + index);
            row.getCell(2).value = `${student.name || 'N/A'}`; // Ensure names are assigned
        });

        // Get month and year from the selected month and year
        const monthIndex = ['January', 'February', 'March', 'April', 'May', 'June',
                            'July', 'August', 'September', 'October', 'November', 'December']
                            .indexOf(selectedMonth);
        const year = parseInt(schoolYear.split('-')[1], 10); // Assuming schoolYear is in the format 'YYYY-YYYY'

        if (monthIndex === -1 || isNaN(year)) {
            throw new Error('Invalid month or year selected.');
        }

        const monthYear = dayjs().year(year).month(monthIndex).startOf('month');
        console.log('Month and year for dates:', monthYear.format('MMMM YYYY')); // Debugging

        // Fill in the dates for the month, skipping weekends
        let columnIndex = 0;
        for (let day = 1; day <= monthYear.daysInMonth(); day++) {
            const date = monthYear.date(day);
            if (date.day() !== 0 && date.day() !== 6) { // Exclude weekends
                const row = worksheet.getRow(startRowForDates);
                row.getCell(startColumnForDates + columnIndex).value = date.format('D'); // Write the day
                columnIndex++;
            }
        }

        // Initialize variables for total absent/tardy per student
        filteredStudents.forEach((student, rowIndex) => {
            let totalAbsent = 0;
            let totalTardy = 0;

            columnIndex = 0;

            for (let day = 1; day <= monthYear.daysInMonth(); day++) {
                const date = monthYear.date(day);
                if (date.day() !== 0 && date.day() !== 6) {
                    const attendanceRecord = attendance.find(
                        (entry) => entry.studentId === student.id && dayjs(entry.date).date() === day
                    );

                    const row = worksheet.getRow(startRowForAttendance + rowIndex);
                    const cell = row.getCell(startColumnForDates + columnIndex);

                    if (attendanceRecord) {
                        const remark = attendanceRecord.remarks.toLowerCase();
                        if (remark === 'absent') {
                            cell.value = 'Absent';
                            totalAbsent++;
                        } else if (remark === 'late' || remark === 'tardy') {
                            cell.value = 'Tardy';
                            totalTardy++;
                        } else {
                            cell.value = 'Present';
                        }
                    } else {
                        cell.value = ''; // No record found
                    }
                    columnIndex++;
                }
            }

            // Write total absent and tardy in columns AC (Absent) and AD (Tardy)
            const totalAbsentCell = worksheet.getRow(startRowForAttendance + rowIndex).getCell(29); // Column AC
            totalAbsentCell.value = totalAbsent;

            const totalTardyCell = worksheet.getRow(startRowForAttendance + rowIndex).getCell(30); // Column AD
            totalTardyCell.value = totalTardy;
        });

        // Write the workbook to a buffer
        const buffer = await workbook.xlsx.writeBuffer();
        console.log('Excel workbook generated successfully.'); // Debugging: Ensure file generated

        // Create a Blob from the buffer and download the file
        const blob = new Blob([buffer], { type: 'application/octet-stream' });
        saveAs(blob, `SF2_${schoolYear}_${selectedGrade}_${selectedSection}_${selectedMonth}.xlsx`);
        console.log('File download triggered successfully.'); // Debugging: Check download

    } catch (error) {
        console.error('Error generating or downloading the Excel file:', error);
        alert('Error: ' + error.message); // Show user-friendly error
    }

    closeSF2Modal(); // Close modal after generating
};





const filteredStudents = students.filter(student =>
    (selectedSection === 'All' || student.section === selectedSection) 
);

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

return (
    <Box sx={{ padding: 2 }}>
        <Grid container spacing={2} mb={2}>
            <Grid item xs={12}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', mt: isMobile ? 5 : 0 }}>Attendance Summary ({selectedSection})</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <Select
                    value={selectedSection}
                    onChange={handleSectionChange}
                    fullWidth
                    variant="outlined"
                    size='small'
                    sx={{
                        mt: isMobile ? 0 : 2,
                        backgroundColor: 'white',
                        borderRadius: 1,
                        '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: '#818181',
                        },
                    }}
                >
                    {sectionList.map((section) => (
                        <MenuItem key={section} value={section}>
                            {section === 'All' ? 'All Sections' : `Section ${section}`}
                        </MenuItem>
                    ))}
                </Select>
            </Grid>

            <Grid item xs={12} sm={6} md={3} sx={{ ml: 5 }}>
                <Grid item xs={12} sm={6} md={3} sx={{ mt: 1 }}>
                    <DatePicker
                        selected={startDate}
                        onChange={(date) => setStartDate(date)}
                        selectsStart
                        startDate={startDate}
                        endDate={endDate}
                        placeholderText="From"
                        sx={{
                            backgroundColor: 'white',
                            borderRadius: 2,
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#818181',
                            },
                        }}
                        InputProps={{
                            sx: {
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#818181',
                                },
                            },
                        }}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3} sx={{ mt: 1 }}>
                    <DatePicker
                        selected={endDate}
                        onChange={(date) => setEndDate(date)}
                        selectsEnd
                        startDate={startDate}
                        endDate={endDate}
                        minDate={startDate}
                        placeholderText="To"
                        sx={{
                            backgroundColor: 'white',
                            borderRadius: 2,
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#818181',
                            },
                        }}
                        InputProps={{
                            sx: {
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#818181',
                                },
                            },
                        }}
                    />
                </Grid>
            </Grid>
            <Grid item xs={12} sm={6} md={3} sx={{ mt: isMobile ? 0 : 2 }}>
                <Button
                    variant="contained"
                    color="primary"
                    fullWidth={isMobile}
                    onClick={openSF2Modal}
                >
                    Create SF2 <MdAdd style={{ marginLeft: 2 }} />
                </Button>
            </Grid>

            {/* Modal Dialog */}
            <Dialog open={openModal} onClose={closeSF2Modal}>
                <DialogTitle>Generate SF2</DialogTitle>
                <DialogContent>
                    <TextField
                        label="School Year"
                        value={schoolYear}
                        onChange={(e) => setSchoolYear(e.target.value)}
                        fullWidth
                        sx={{ mb: 2 }}
                    />
                    <Select
                        label="Grade"
                        value={selectedGrade}
                        onChange={(e) => setSelectedGrade(e.target.value)}
                        fullWidth
                        sx={{ mb: 2 }}
                    >
                        {[7, 8, 9, 10, 11, 12].map(grade => (
                            <MenuItem key={grade} value={grade}>
                                Grade {grade}
                            </MenuItem>
                        ))}
                    </Select>
                    <Select
                        label="Section"
                        value={selectedSection}
                        onChange={(e) => setSelectedSection(e.target.value)}
                        fullWidth
                        sx={{ mb: 2 }}
                    >
                        {modalSections.map(section => (
                            <MenuItem key={section} value={section}>
                                {section}
                            </MenuItem>
                        ))}
                    </Select>
                    <Select
                        label="Month"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        fullWidth
                        sx={{ mb: 2 }}
                    >
                        {['January', 'February', 'March', 'April', 'May', 'June',
                            'July', 'August', 'September', 'October', 'November',
                            'December'].map(month => (
                                <MenuItem key={month} value={month}>
                                    {month}
                                </MenuItem>
                            ))}
                    </Select>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeSF2Modal} color="secondary">Cancel</Button>
                    <Button onClick={handleGenerateSF2} color="primary">Generate SF2</Button>
                </DialogActions>
            </Dialog>
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
                            <TableCell align="center" style={{ fontWeight: 'bold' }}>No</TableCell>
                            <TableCell style={{ fontWeight: 'bold' }}>Name</TableCell>
                            <TableCell align='center' style={{ fontWeight: 'bold' }}>Section</TableCell>
                            <TableCell align='center' style={{ fontWeight: 'bold' }}>
                                <TableSortLabel
                                    active={lateSortOrder !== null}
                                    direction={lateSortOrder || 'asc'}
                                    onClick={sortByLate}
                                >
                                    Total Late
                                </TableSortLabel>
                            </TableCell>
                            <TableCell align='center' style={{ fontWeight: 'bold' }}>
                                <TableSortLabel
                                    active={absentSortOrder !== null}
                                    direction={absentSortOrder || 'asc'}
                                    onClick={sortByAbsent}
                                >
                                    Total Absent
                                </TableSortLabel>
                            </TableCell>
                            <TableCell align="center" style={{ fontWeight: 'bold' }}>
                                <TableSortLabel
                                    active={presentSortOrder !== null}
                                    direction={presentSortOrder || 'asc'}
                                    onClick={sortByPresent}
                                >
                                    Total Present
                                </TableSortLabel>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredStudents.map((student, index) => (
                            <TableRow key={student.id}>
                                <TableCell align="center">{index + 1}</TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        {student.image && (
                                            <Avatar
                                                src={student.image}
                                                alt={student.FName}
                                                sx={{ width: 60, height: 60, mr: 2 }}
                                            />
                                        )}
                                        <Link
                                            to={`/profile/${student.id}`}
                                            style={{
                                                textDecoration: 'none',
                                                color: theme.palette.primary.main,
                                                fontWeight: 'bold'
                                            }}
                                        >
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
