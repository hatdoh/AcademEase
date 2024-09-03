import React, { useState } from 'react';
import Modal from 'react-modal';
import { Button, TextField, FormControl, InputLabel, Select, MenuItem, Table, TableContainer, TableHead, TableRow, TableCell, Paper, Box, Typography, Grid } from '@mui/material';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { TableBody } from '@mui/material';


Modal.setAppElement('#root'); // Important for accessibility

function SchoolFormTwo() {
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [formData, setFormData] = useState({
        schoolID: '',
        schoolYear: '',
        schoolName: '',
        gradeLevel: '',
        section: '',
        month: new Date(),
        nameOfLearner: '',
        totalDaysAbsent: '',
        totalDaysTardy: '',
        remarks: ''
    });
    const [isEditing, setIsEditing] = useState(false);

    const handleInputChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
    };

    const handleDateChange = (date) => {
        setFormData({ ...formData, month: date });
    };

    const closeModal = () => {
        setModalIsOpen(false);
    };

    const renderDaysOfWeek = () => {
        const daysOfWeek = ['M', 'T', 'W', 'TH', 'F'];
        const firstDayOfMonth = new Date(formData.month.getFullYear(), formData.month.getMonth(), 1);
        const lastDayOfMonth = new Date(formData.month.getFullYear(), formData.month.getMonth() + 1, 0);
        const days = [];

        for (let day = firstDayOfMonth.getDate(); day <= lastDayOfMonth.getDate(); day++) {
            const currentDate = new Date(formData.month.getFullYear(), formData.month.getMonth(), day);
            const dayOfWeek = currentDate.getDay();

            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                days.push(<TableCell key={day} align="center">{daysOfWeek[dayOfWeek - 1]}</TableCell>);
            } else {
                days.push(<TableCell key={day} align="center"></TableCell>);
            }
        }

        return days;
    };

    const renderNoDaysOfWeek = () => {
        const daysOfWeek = ['M', 'T', 'W', 'TH', 'F'];
        const firstDayOfMonth = new Date(formData.month.getFullYear(), formData.month.getMonth(), 1);
        const lastDayOfMonth = new Date(formData.month.getFullYear(), formData.month.getMonth() + 1, 0);
        const days = [];

        for (let day = firstDayOfMonth.getDate(); day <= lastDayOfMonth.getDate(); day++) {
            const currentDate = new Date(formData.month.getFullYear(), formData.month.getMonth(), day);
            const dayOfWeek = currentDate.getDay();

            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                days.push(
                    <TableCell key={day} align="center">
                        {day}
                    </TableCell>
                );
            } else {
                days.push(
                    <TableCell key={day} align="center">
                        {daysOfWeek[dayOfWeek - 1]}
                    </TableCell>
                );
            }
        }

        return days;
    };

    const handleSchoolYearChange = (e) => {
        const value = e.target.value;
        if (/^\d{0,4}(-\d{0,4})?$/.test(value)) {
            setFormData({ ...formData, schoolYear: value });
        }
    };

    const handleDownloadPDF = () => {
        console.log('Download PDF function called');
        const doc = new jsPDF();

        // Title
        doc.setFontSize(16);
        doc.text('School Form 2 (SF2) Daily Attendance Report of Learners', 14, 20);

        // Form data
        doc.setFontSize(12);
        doc.text(`School ID: ${formData.schoolID}`, 14, 30);
        doc.text(`School Year: ${formData.schoolYear}`, 14, 36);
        doc.text(`Name of School: ${formData.schoolName}`, 14, 42);
        doc.text(`Grade Level: ${formData.gradeLevel}`, 14, 48);
        doc.text(`Section: ${formData.section}`, 14, 54);
        doc.text(`Report for the Month of: ${formData.month.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}`, 14, 60);

        // Table
        const headers = [['LEARNER\'S NAME (Last Name, First Name, Middle Name)', 'M', 'T', 'W', 'TH', 'F', 'ABSENT', 'TARDY', 'REMARKS']];
        const data = [
            [formData.nameOfLearner, '', '', '', '', '', formData.totalDaysAbsent, formData.totalDaysTardy, formData.remarks],
            // Add more rows here as needed
        ];

        doc.autoTable({
            startY: 70,
            head: headers,
            body: data,
        });

        // Footer
        doc.text('MALE | Total Per Day', 14, doc.lastAutoTable.finalY + 10);
        doc.text('FEMALE | Total Per Day', 14, doc.lastAutoTable.finalY + 16);
        doc.text('Combined TOTAL PER DAY', 14, doc.lastAutoTable.finalY + 22);

        // Save the PDF
        doc.save('SF2_Daily_Attendance_Report.pdf');
    };

    return (
        <Box sx={{ padding: 2 }}>
            <Typography variant="h5" gutterBottom>
                School Form 2 (SF2) Daily Attendance Report of Learners
            </Typography>
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                contentLabel="Modal"
                className="fixed inset-0 flex items-center justify-center z-50 overflow-y-auto"
                overlayClassName="fixed inset-0 bg-gray-500 bg-opacity-25"
            >
                <Box sx={{ bgcolor: 'background.paper', p: 4, borderRadius: 1, width: '80%', maxWidth: 800 }}>
                    <Typography variant="h6" gutterBottom>
                        {isEditing ? 'Edit SF2 Form' : 'Create SF2 Form'}
                    </Typography>
                    <Box component="form" sx={{ display: 'flex', flexDirection: 'column', mb: 2 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="School Year"
                                    variant="outlined"
                                    fullWidth
                                    value={formData.schoolYear}
                                    onChange={handleSchoolYearChange}
                                    placeholder="YYYY-YYYY"
                                    sx={{ mb: 2 }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <DatePicker
                                    selected={formData.month}
                                    onChange={date => handleDateChange(date)}
                                    dateFormat="MMMM yyyy"
                                    showMonthYearPicker
                                    customInput={<TextField label="Report for the Month of" variant="outlined" fullWidth />}
                                />
                            </Grid>
                        </Grid>
                        <Grid container spacing={2} sx={{ mb: 2 }}>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Grade Level</InputLabel>
                                    <Select
                                        value={formData.gradeLevel}
                                        onChange={(e) => handleInputChange('gradeLevel', e.target.value)}
                                    >
                                        {[...Array(12)].map((_, index) => (
                                            <MenuItem key={index + 1} value={index + 1}>{index + 1}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Section"
                                    variant="outlined"
                                    fullWidth
                                    value={formData.section}
                                    onChange={(e) => handleInputChange('section', e.target.value)}
                                />
                            </Grid>
                        </Grid>
                        <Box sx={{ overflowX: 'auto', mb: 2 }}>
                            <TableContainer component={Paper}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell></TableCell>
                                            {renderNoDaysOfWeek()}
                                            <TableCell>ABSENT</TableCell>
                                            <TableCell>TARDY</TableCell>
                                            <TableCell>REMARKS</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>LEARNER'S NAME <br />(Last Name, First Name, Middle Name)</TableCell>
                                            {renderDaysOfWeek()}
                                            <TableCell></TableCell>
                                            <TableCell></TableCell>
                                            <TableCell></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {/* Render table body rows here */}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                        <Button variant="contained" color="primary" sx={{ marginLeft: 10 }}onClick={handleDownloadPDF}>
                            Download PDF
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </Box>
    );
}

export default SchoolFormTwo;
