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
        const response = await fetch(templateFile);
        if (!response.ok) {
            throw new Error('Failed to fetch the template file. Check the file path or network issue.');
        }

        const arrayBuffer = await response.arrayBuffer();
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(arrayBuffer);
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

        // Extract the start and end year from the school year
        const [startYear, endYear] = schoolYear.split('-').map(year => parseInt(year.trim()));

        // Get the index of the selected month
        const monthIndex = ['January', 'February', 'March', 'April', 'May', 'June',
                            'July', 'August', 'September', 'October', 'November', 'December']
                            .indexOf(selectedMonth);

        if (monthIndex === -1) {
            throw new Error('Invalid month selected.');
        }

        // Adjust the year based on the selected month
        // If the month is from January to May, it belongs to the next calendar year
        const year = monthIndex <= 4 ? endYear : startYear;

        const monthYear = dayjs().year(year).month(monthIndex).startOf('month');

        // Filter attendance records based on the selected month and section
        const filteredAttendance = attendance.filter((entry) => {
            const attendanceDate = dayjs(entry.date);
            return attendanceDate.year() === year && attendanceDate.month() === monthIndex && entry.section === selectedSection;
        });

        // Filter students who are in the selected section and have attendance records for the selected month
        const studentsWithAttendance = students.filter(student => 
            student.section === selectedSection && filteredAttendance.some(entry => entry.studentId === student.id)
        );

        if (studentsWithAttendance.length === 0) {
            console.warn('No students found with attendance for the selected month and section.');
            alert('No students found with attendance for the selected month and section.');
            return;
        }

        // Write learner names in column B starting from row 14
        studentsWithAttendance.forEach((student, index) => {
            const row = worksheet.getRow(startRowForNames + index);
            row.getCell(2).value = `${student.name || 'N/A'}`; // Ensure names are assigned
        });

        // Fill in the dates for the month and place them in the correct columns according to the weekday
        let columnIndex = 0;
        const firstDayOfMonth = monthYear.startOf('month').day(); // Get the weekday of the 1st day of the month

        // Adjust column index based on the day of the week (1 for Monday, 5 for Friday, etc.)
        if (firstDayOfMonth !== 0 && firstDayOfMonth !== 6) { // Exclude weekends
            columnIndex = firstDayOfMonth - 1; // Adjust to match column index (Monday should be index 0)
        }

        // Write the dates in one row and weekdays in the row below
        const rowForDates = worksheet.getRow(startRowForDates); // Row for dates
        const rowForWeekdays = worksheet.getRow(startRowForDates + 1); // Row for weekdays

        for (let day = 1; day <= monthYear.daysInMonth(); day++) {
            const date = monthYear.date(day);
            if (date.day() !== 0 && date.day() !== 6) { // Exclude weekends
                // Write the day of the month in the first row
                rowForDates.getCell(startColumnForDates + columnIndex).value = date.format('D');
                
                // Write the corresponding weekday abbreviation in the second row
                const weekdayAbbreviations = ['M', 'T', 'W', 'TH', 'F'];
                const weekday = weekdayAbbreviations[date.day() - 1]; // Adjust index for weekdays
                
                rowForWeekdays.getCell(startColumnForDates + columnIndex).value = weekday;

                columnIndex++;
            }
        }

        // Process attendance records and calculate total absences and tardiness
        studentsWithAttendance.forEach((student, rowIndex) => {
            let totalAbsent = 0;
            let totalTardy = 0;

            let columnIndex = firstDayOfMonth !== 0 && firstDayOfMonth !== 6 ? firstDayOfMonth - 1 : 0;

            for (let day = 1; day <= monthYear.daysInMonth(); day++) {
                const date = monthYear.date(day);
                if (date.day() !== 0 && date.day() !== 6) { // Exclude weekends

                    const attendanceRecord = filteredAttendance.find(
                        (entry) => entry.studentId === student.id && dayjs(entry.date).date() === day
                    );

                    const row = worksheet.getRow(startRowForAttendance + rowIndex);
                    const cell = row.getCell(startColumnForDates + columnIndex);

                    // Set cell value to '✔' only if attendance is explicitly present, otherwise leave blank
                    if (attendanceRecord) {
                        const remark = attendanceRecord.remarks.toLowerCase();
                        if (remark === 'absent') {
                            cell.value = 'X'; // Absent
                            totalAbsent++;
                        } else if (remark === 'late') {
                            cell.value = 'late'; // Late
                            totalTardy++;
                        } else if (remark === 'present') {
                            cell.value = '✔'; // Present
                        }
                    } else {
                        cell.value = ''; // Empty for dates with no records
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
        const blob = new Blob([buffer], { type: 'application/octet-stream' });
        saveAs(blob, `SF2_${schoolYear}_${selectedGrade}_${selectedSection}_${selectedMonth}.xlsx`);

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
