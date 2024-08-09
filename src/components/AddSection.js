import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import Swal from 'sweetalert2';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { Button, TextField, MenuItem, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Typography, Box, Container, Grid, useTheme, useMediaQuery } from '@mui/material';

function AddSection() {
    const [section, setSection] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [day, setDay] = useState('Monday');
    const [acadYear, setAcadYear] = useState('');
    const [sections, setSections] = useState([]);
    const [editingSectionId, setEditingSectionId] = useState(null);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        const fetchSections = async () => {
            const sectionsCollection = collection(db, 'sections');
            const sectionSnapshot = await getDocs(sectionsCollection);
            const sectionList = sectionSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setSections(sectionList);
        };

        fetchSections();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();

        if (acadYear.trim() === '') {
            Swal.fire({
                icon: 'error',
                title: 'Ooops...',
                text: 'Please enter the Academic Year!',
            });
            return;
        }

        if (section.trim() === '') {
            Swal.fire({
                icon: 'error',
                title: 'Ooops...',
                text: 'Please enter a section name!',
            });
            return;
        }

        if (editingSectionId) {
            try {
                const sectionDoc = doc(db, 'sections', editingSectionId);
                await updateDoc(sectionDoc, {
                    section,
                    startTime,
                    endTime,
                    day,
                    acadYear,
                });

                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Section updated successfully!',
                });

                const updatedSections = sections.map(sec => sec.id === editingSectionId ? { ...sec, section, startTime, endTime, day, acadYear } : sec);
                setSections(updatedSections);
                setEditingSectionId(null);
                setSection('');
                setStartTime('');
                setEndTime('');
                setDay('Monday');
                setAcadYear('');
            } catch (error) {
                console.error('Error updating section:', error);

                Swal.fire({
                    icon: 'error',
                    title: 'Ooops...',
                    text: 'Failed to update section. Please try again.',
                });
            }
        } else {
            const { value: confirmAdd } = await Swal.fire({
                icon: 'question',
                title: 'Are you sure?',
                text: 'Do you want to add this section?',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, add it!',
            });

            if (!confirmAdd) {
                return;
            }

            try {
                const sectionsCollection = collection(db, 'sections');
                const docRef = await addDoc(sectionsCollection, {
                    section,
                    startTime,
                    endTime,
                    day,
                    acadYear,
                });

                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Section added successfully!',
                });

                setSections([...sections, { id: docRef.id, section, startTime, endTime, day, acadYear }]);
                setSection('');
                setStartTime('');
                setEndTime('');
                setDay('Monday');
                setAcadYear('');
            } catch (error) {
                console.error('Error adding section:', error);

                Swal.fire({
                    icon: 'error',
                    title: 'Ooops...',
                    text: 'Failed to add section. Please try again.',
                });
            }
        }
    };

    const handleEdit = (section) => {
        setEditingSectionId(section.id);
        setSection(section.section);
        setStartTime(section.startTime);
        setEndTime(section.endTime);
        setDay(section.day);
        setAcadYear(section.acadYear);
    };

    const handleDelete = async (sectionId) => {
        const { value: confirmDelete } = await Swal.fire({
            icon: 'warning',
            title: 'Are you sure?',
            text: 'Do you want to delete this section?',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
        });

        if (!confirmDelete) {
            return;
        }

        try {
            await deleteDoc(doc(db, 'sections', sectionId));

            Swal.fire({
                icon: 'success',
                title: 'Deleted!',
                text: 'Section has been deleted.',
            });

            const updatedSections = sections.filter(sec => sec.id !== sectionId);
            setSections(updatedSections);
        } catch (error) {
            console.error('Error deleting section:', error);

            Swal.fire({
                icon: 'error',
                title: 'Ooops...',
                text: 'Failed to delete section. Please try again.',
            });
        }
    };

    const convertTo12HourFormat = (time) => {
        const [hours, minutes] = time.split(':');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const hours12 = hours % 12 || 12;
        return `${hours12}:${minutes} ${ampm}`;
    };

    return (
        <Container maxWidth="lg">
            <Box sx={{ padding: 2 }}>
                <Box mt={4} mb={2}>
                    <Typography variant="h4" component="h2">
                        {editingSectionId ? 'Edit Section' : 'Add Section'}
                    </Typography>
                </Box>

                <Box component="form" onSubmit={handleSave} mb={4}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={4}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                label="Academic Year"
                                value={acadYear}
                                placeholder="Enter Academic Year (YYYY-YYYY)"
                                onChange={(e) => setAcadYear(e.target.value)}
                                sx={{ backgroundColor: 'white', borderRadius: 1 }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                label="Section Name"
                                value={section}
                                placeholder="Enter Section Name"
                                onChange={(e) => setSection(e.target.value)}
                                sx={{ backgroundColor: 'white', borderRadius: 1 }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                label="Start Time"
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                sx={{ backgroundColor: 'white', borderRadius: 1 }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                label="End Time"
                                type="time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                sx={{ backgroundColor: 'white', borderRadius: 1 }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Select
                                fullWidth
                                variant="outlined"
                                value={day}
                                onChange={(e) => setDay(e.target.value)}
                                label="Day"
                                sx={{ backgroundColor: 'white', borderRadius: 1 }}
                            >
                                <MenuItem value="Monday">Monday</MenuItem>
                                <MenuItem value="Tuesday">Tuesday</MenuItem>
                                <MenuItem value="Wednesday">Wednesday</MenuItem>
                                <MenuItem value="Thursday">Thursday</MenuItem>
                                <MenuItem value="Friday">Friday</MenuItem>
                            </Select>
                        </Grid>
                    </Grid>
                    <Box mt={3} display="flex" justifyContent="flex-start">
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            sx={{ mr: 1 }}
                        >
                            {editingSectionId ? 'Update Section' : 'Add Section'}
                        </Button>
                        <Link to="/sections">
                            <Button variant="outlined"
                                sx={{
                                    color: 'black', backgroundColor: 'white',
                                    '&:hover': {
                                        backgroundColor: '#bbbdbf',
                                    },
                                }}>
                                Back
                            </Button>
                        </Link>
                    </Box>
                </Box>

                <Box mt={4} sx={{ display: 'flex', justifyContent: 'center' }}>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Academic Year</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Section Name</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Start Time</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>End Time</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Day</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {sections.map((section) => (
                                    <TableRow key={section.id}>
                                        <TableCell>{section.acadYear}</TableCell>
                                        <TableCell>{section.section}</TableCell>
                                        <TableCell>{convertTo12HourFormat(section.startTime)}</TableCell>
                                        <TableCell>{convertTo12HourFormat(section.endTime)}</TableCell>
                                        <TableCell>{section.day}</TableCell>
                                        <TableCell>
                                            <IconButton onClick={() => handleEdit(section)} color="primary">
                                                <FaEdit fontSize='medium' />
                                            </IconButton>
                                            <IconButton onClick={() => handleDelete(section.id)} color="error">
                                                <FaTrash fontSize='medium' />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            </Box>
        </Container>
    );
}

export default AddSection;
