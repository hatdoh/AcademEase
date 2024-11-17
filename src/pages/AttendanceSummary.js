import React, { useState, useEffect } from 'react';
import { collection, doc, getDocs, getDoc, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { getCurrentUser } from '../utils/Authentication';
import ExcelJS from 'exceljs';
import saveAs from 'file-saver';
import dayjs from 'dayjs';
import { Box, Button, Grid, Typography, TextField, Select, MenuItem, Dialog, DialogActions, DialogContent, DialogTitle, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper, Avatar, TableSortLabel } from '@mui/material';
import { Link } from 'react-router-dom';
import { MdAdd } from 'react-icons/md';

function AttendanceSummary() {
    const [students, setStudents] = useState([]);
    const [selectedSection, setSelectedSection] = useState('All');
    const [selectedMonth, setSelectedMonth] = useState('January');
    const [schoolYear, setSchoolYear] = useState('');
    const [sections, setSections] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [selectedGrade, setSelectedGrade] = useState('7');  // Grade dropdown
    const [modalSections, setModalSections] = useState([]); // Sections for the modal dropdown

    const [lateSortOrder, setLateSortOrder] = useState(null);
    const [absentSortOrder, setAbsentSortOrder] = useState(null);
    const [presentSortOrder, setPresentSortOrder] = useState(null);

    useEffect(() => {
        const fetchSections = async () => {
            const currentUser = getCurrentUser();
            const sectionsQuery = query(collection(db, 'sections'), where('teacherUID', '==', currentUser.uid));
            const querySnapshot = await getDocs(sectionsQuery);
            setSections(['All', ...querySnapshot.docs.map((doc) => doc.data().section)]);
        };

        fetchSections();
    }, []);

    const fetchStudentAttendance = async () => {
        try {
            const currentUser = getCurrentUser();

            let attendanceQuery;

            // Adjust the query based on selectedSection
            if (selectedSection === 'All') {
                attendanceQuery = query(
                    collection(db, 'attendance'),
                    where('teacherUID', '==', currentUser.uid) // Ensure you fetch attendance by the current teacher
                );
            } else {
                attendanceQuery = query(
                    collection(db, 'attendance'),
                    where('section', '==', selectedSection),
                    where('teacherUID', '==', currentUser.uid) // Filter by the current teacher's UID
                );
            }

            const querySnapshot = await getDocs(attendanceQuery);

            const studentData = await Promise.all(
                querySnapshot.docs.map(async (doc) => {
                    const studentData = doc.data();
                    const attendanceSummary = await getMonthlyAttendance(
                        doc.id,
                        dayjs().year(),
                        dayjs().month()
                    );
                    return {
                        id: doc.id,
                        ...studentData,
                        ...attendanceSummary.summary,
                    };
                })
            );

            setStudents(studentData);
        } catch (error) {
            console.error('Error fetching attendance data:', error);
        }
    };


    useEffect(() => {
        if (selectedSection) {
            fetchStudentAttendance();
        }
    }, [selectedSection]);


    const getMonthlyAttendance = async (studentId, year, month) => {
        const studentRef = doc(db, 'attendance', studentId);
        const snapshot = await getDoc(studentRef);

        if (snapshot.exists()) {
            const { attendanceEntries } = snapshot.data();
            const filteredEntries = attendanceEntries.filter((entry) => {
                const date = dayjs(entry.date);
                return date.year() === year && date.month() === month;
            });

            const summary = filteredEntries.reduce(
                (totals, entry) => {
                    if (entry.remarks === 'Late') totals.totalTardy++;
                    if (entry.remarks === 'Absent') totals.totalAbsent++;
                    if (entry.remarks === 'Present') totals.totalPresent++;
                    return totals;
                },
                { totalTardy: 0, totalAbsent: 0, totalPresent: 0 }
            );

            return { filteredEntries, summary };
        }

        throw new Error('Student not found');
    };

    const handleSectionChange = (event) => {
        setSelectedSection(event.target.value);
    };


    const openSF2Modal = () => setOpenModal(true);  // Open modal
    const closeSF2Modal = () => setOpenModal(false);  // Close modal

    const handleGenerateSF2 = async () => {
        try {
            const templateFile = `${process.env.PUBLIC_URL}/resources/SF2_Template.xlsx`;
            const response = await fetch(templateFile);
            if (!response.ok) throw new Error("Failed to load template file.");
            const arrayBuffer = await response.arrayBuffer();

            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(arrayBuffer);
            const worksheet = workbook.getWorksheet(1);

            const [startYear, endYear] = schoolYear.split("-").map((year) => parseInt(year.trim()));
            const monthIndex = [
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
            ].indexOf(selectedMonth);

            if (monthIndex === -1) throw new Error("Invalid month selected.");

            const year = monthIndex <= 4 ? endYear : startYear;

            // School information and inputs from the modal
            worksheet.getCell('C6').value = '500030';
            worksheet.getCell('C8').value = 'Moreno Integrated School';
            worksheet.mergeCells('C8:O8');
            worksheet.getCell('K6').value = schoolYear;
            worksheet.getCell('X6').value = selectedMonth;
            worksheet.getCell('X8').value = selectedGrade;
            worksheet.getCell('AC8').value = selectedSection;

            // Query attendance data from Firestore
            const attendanceCollection = collection(db, "attendance");
            const attendanceQuery = query(attendanceCollection, where("section", "==", selectedSection));
            const querySnapshot = await getDocs(attendanceQuery);

            // Fetch attendance entries per student
            const studentData = await Promise.all(
                querySnapshot.docs.map(async (doc) => {
                    const { FName, LName, MName, section, grade, gender, attendanceEntries } = doc.data();
                    const attendanceSummary = await getMonthlyAttendance(doc.id, year, monthIndex);
                    return {
                        id: doc.id,
                        name: `${LName}, ${FName} ${MName}`,
                        gender, // Include gender field
                        section,
                        grade,
                        attendanceEntries: attendanceSummary.filteredEntries,
                        summary: attendanceSummary.summary,
                    };
                })
            );

            // Write attendance and summary (if needed) for male and female students

            const startRowForNames = 14; // This could be changed if you want a different starting point for names
            const startColumnForDates = 4;
            const startRowForDates = 11;
            const rowForDates = worksheet.getRow(startRowForDates);
            const rowForWeekdays = worksheet.getRow(startRowForDates + 1);

            // Generate calendar for the selected month
            const firstDay = dayjs().year(year).month(monthIndex).startOf("month");
            const weekdayIndex = firstDay.day();
            let columnIndex = weekdayIndex === 0 || weekdayIndex === 6 ? 0 : weekdayIndex - 1;

            let columnMapping = {};
            for (let day = 1; day <= firstDay.daysInMonth(); day++) {
                const date = firstDay.date(day);
                if (date.day() !== 0 && date.day() !== 6) {
                    const cellColumn = startColumnForDates + columnIndex;
                    rowForDates.getCell(cellColumn).value = date.format("D");
                    rowForWeekdays.getCell(cellColumn).value = ["M", "T", "W", "TH", "F"][date.day() - 1];
                    columnMapping[date.format("YYYY-MM-DD")] = cellColumn;
                    columnIndex++;
                }
            }

            // Split male and female students
            const maleStudents = studentData.filter(student => student.gender === 'M');
            const femaleStudents = studentData.filter(student => student.gender === 'F');

            // Write male students' names starting from B14 to B34
            maleStudents.forEach((student, index) => {
                const row = worksheet.getRow(14 + index);
                const cell = row.getCell(2);  // Column B
                cell.value = student.name;

                // Set alignment to left
                cell.alignment = { horizontal: 'left' };
            });

            // Write female students' names starting from B36 to B60
            femaleStudents.forEach((student, index) => {
                const row = worksheet.getRow(36 + index);
                const cell = row.getCell(2);  // Column B
                cell.value = student.name;

                // Set alignment to left
                cell.alignment = { horizontal: 'left' };
            });


            // Write attendance and summary (if needed) for male students
            maleStudents.forEach((student, index) => {
                const row = worksheet.getRow(14 + index);
                student.attendanceEntries.forEach((entry) => {
                    const dateStr = dayjs(entry.date).format("YYYY-MM-DD");
                    const cellColumn = columnMapping[dateStr];
                    if (cellColumn) {
                        const cell = row.getCell(cellColumn);
                        cell.value = entry.remarks === "Absent" ? "X" : entry.remarks === "Late" ? "L" : "✔";
                    }
                });

                // Write summary for each male student
                row.getCell(29).value = student.summary.totalAbsent; // Column AC
                row.getCell(30).value = student.summary.totalTardy; // Column AD
            });

            // Write attendance and summary (if needed) for female students
            femaleStudents.forEach((student, index) => {
                const row = worksheet.getRow(36 + index);
                student.attendanceEntries.forEach((entry) => {
                    const dateStr = dayjs(entry.date).format("YYYY-MM-DD");
                    const cellColumn = columnMapping[dateStr];
                    if (cellColumn) {
                        const cell = row.getCell(cellColumn);
                        cell.value = entry.remarks === "Absent" ? "X" : entry.remarks === "Late" ? "L" : "✔";
                    }
                });

                // Write summary for each female student
                row.getCell(29).value = student.summary.totalAbsent; // Column AC
                row.getCell(30).value = student.summary.totalTardy; // Column AD
            });


            // Generate file for download
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: "application/octet-stream" });
            saveAs(blob, `SF2_${schoolYear}_${selectedGrade}_${selectedSection}_${selectedMonth}.xlsx`);
        } catch (error) {
            console.error("Error generating SF2:", error);
            alert("Error generating SF2.");
        }
        setOpenModal(false);
    };


    const sortByLate = () => {
        const sortedStudents = [...students];
        if (lateSortOrder === null || lateSortOrder === 'desc') {
            setLateSortOrder('asc');
            sortedStudents.sort((a, b) => a.totalTardy - b.totalTardy);
        } else {
            setLateSortOrder('desc');
            sortedStudents.sort((a, b) => b.totalTardy - a.totalTardy);
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
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Attendance Summary ({selectedSection})</Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Select
                        value={selectedSection}
                        onChange={(e) => setSelectedSection(e.target.value)}
                        fullWidth
                        variant="outlined"
                        size='small'
                        sx={{
                            backgroundColor: 'white',
                            borderRadius: 1,
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#818181',
                            },
                        }}
                    >
                        {sections.map((section) => (
                            <MenuItem key={section} value={section}>
                                {section === 'All' ? 'All Sections' : `Section ${section}`}
                            </MenuItem>
                        ))}
                    </Select>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={openSF2Modal}
                    >
                        Generate School Form 2 <MdAdd style={{ marginLeft: 2 }} />
                    </Button>
                </Grid>
            </Grid>

            {/* Table Section */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell align="center" style={{ fontWeight: 'bold' }}>No</TableCell>
                            <TableCell style={{ fontWeight: 'bold' }}>Name</TableCell>
                            <TableCell align="center" style={{ fontWeight: 'bold' }}>Section</TableCell>
                            <TableCell align="center" style={{ fontWeight: 'bold' }}>
                                <TableSortLabel
                                    active={false}
                                    direction="asc"
                                    onClick={sortByLate}
                                >
                                    Total Late
                                </TableSortLabel>
                            </TableCell>
                            <TableCell align="center" style={{ fontWeight: 'bold' }}>
                                <TableSortLabel
                                    active={false}
                                    direction="asc"
                                    onClick={sortByAbsent}
                                >
                                    Total Absent
                                </TableSortLabel>
                            </TableCell>
                            <TableCell align="center" style={{ fontWeight: 'bold' }}>
                                <TableSortLabel
                                    active={false}
                                    direction="asc"
                                    onClick={sortByPresent}
                                >
                                    Total Present
                                </TableSortLabel>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {students.map((student, index) => (
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
                                                color: '#1976d2',
                                            }}
                                        >
                                            {`${student.LName}, ${student.FName} ${student.MName}`}
                                        </Link>
                                    </Box>
                                </TableCell>
                                <TableCell align="center">{student.section}</TableCell>
                                <TableCell align="center">{student.totalTardy}</TableCell>
                                <TableCell align="center">{student.totalAbsent}</TableCell>
                                <TableCell align="center">{student.totalPresent}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Modal Dialog */}
            <Dialog open={openModal} onClose={closeSF2Modal}>
                <DialogTitle>Generate School Form</DialogTitle>
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
                        {sections.map(section => (
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
                            'July', 'August', 'September', 'October', 'November', 'December'].map(month => (
                                <MenuItem key={month} value={month}>
                                    {month}
                                </MenuItem>
                            ))}
                    </Select>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleGenerateSF2} color="primary">Generate School Form 2</Button>
                    <Button onClick={closeSF2Modal} color="secondary">Cancel</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default AttendanceSummary;
