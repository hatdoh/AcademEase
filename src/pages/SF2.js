import React, { useState } from 'react';
import Modal from 'react-modal';
import { Button, TextField, FormControl, InputLabel, Select, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box, Typography, Grid, IconButton } from '@mui/material';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { FaPrint, FaEdit } from "react-icons/fa";
import { MdDelete, MdDateRange } from "react-icons/md";

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
    const [savedForms, setSavedForms] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [currentFormIndex, setCurrentFormIndex] = useState(null);

    const handleInputChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
    };

    const handleDateChange = (date) => {
        setFormData({ ...formData, month: date });
    };

    const openModal = (index = null) => {
        if (index !== null) {
            setIsEditing(true);
            setCurrentFormIndex(index);
            setFormData(savedForms[index]);
        } else {
            setIsEditing(false);
            setCurrentFormIndex(null);
            setFormData({
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
        }
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
    };

    const saveData = () => {
        if (isEditing) {
            const updatedForms = [...savedForms];
            updatedForms[currentFormIndex] = formData;
            setSavedForms(updatedForms);
        } else {
            setSavedForms([...savedForms, formData]);
        }
        closeModal();
    };

    const deleteForm = (index) => {
        const updatedForms = savedForms.filter((_, i) => i !== index);
        setSavedForms(updatedForms);
    };

    const downloadForm = (form) => {
        const element = document.createElement("a");
        const file = new Blob([JSON.stringify(form, null, 2)], { type: 'application/json' });
        element.href = URL.createObjectURL(file);
        element.download = `SF2-${form.schoolID}-${form.schoolYear}-${form.month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}.json`;
        document.body.appendChild(element);
        element.click();
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

    return (
        <Box sx={{ padding: 2 }}>
            <Typography variant="h5" gutterBottom>
                School Form 2 (SF2) Daily Attendance Report of Learners
            </Typography>
            <Button
                variant="contained"
                color="primary"
                onClick={() => openModal()}
                sx={{ marginBottom: 2 }}
            >
                Create SF2
            </Button>

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
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Name of Learner"
                                    variant="outlined"
                                    fullWidth
                                    value={formData.nameOfLearner}
                                    onChange={(e) => handleInputChange('nameOfLearner', e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Total Days Absent"
                                    variant="outlined"
                                    fullWidth
                                    type="number"
                                    value={formData.totalDaysAbsent}
                                    onChange={(e) => handleInputChange('totalDaysAbsent', e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Total Days Tardy"
                                    variant="outlined"
                                    fullWidth
                                    type="number"
                                    value={formData.totalDaysTardy}
                                    onChange={(e) => handleInputChange('totalDaysTardy', e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Remarks"
                                    variant="outlined"
                                    fullWidth
                                    multiline
                                    rows={4}
                                    value={formData.remarks}
                                    onChange={(e) => handleInputChange('remarks', e.target.value)}
                                />
                            </Grid>
                        </Grid>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                            <Button onClick={closeModal} sx={{ mr: 2 }}>Cancel</Button>
                            <Button variant="contained" color="primary" onClick={saveData}>Save</Button>
                        </Box>
                    </Box>
                </Box>
            </Modal>

            <Box sx={{ mt: 2 }}>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Actions</TableCell>
                                <TableCell>School Year</TableCell>
                                <TableCell>Month</TableCell>
                                <TableCell>Grade Level</TableCell>
                                <TableCell>Section</TableCell>
                                <TableCell>Name of Learner</TableCell>
                                <TableCell>Total Days Absent</TableCell>
                                <TableCell>Total Days Tardy</TableCell>
                                <TableCell>Remarks</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {savedForms.map((form, index) => (
                                <TableRow key={index}>
                                    <TableCell>
                                        <IconButton onClick={() => openModal(index)}><FaEdit /></IconButton>
                                        <IconButton onClick={() => deleteForm(index)}><MdDelete /></IconButton>
                                        <IconButton onClick={() => downloadForm(form)}><FaPrint /></IconButton>
                                    </TableCell>
                                    <TableCell>{form.schoolYear}</TableCell>
                                    <TableCell>{form.month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</TableCell>
                                    <TableCell>{form.gradeLevel}</TableCell>
                                    <TableCell>{form.section}</TableCell>
                                    <TableCell>{form.nameOfLearner}</TableCell>
                                    <TableCell>{form.totalDaysAbsent}</TableCell>
                                    <TableCell>{form.totalDaysTardy}</TableCell>
                                    <TableCell>{form.remarks}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </Box>
    );
}

export default SchoolFormTwo;
