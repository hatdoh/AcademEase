import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import Swal from 'sweetalert2';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { Button, TextField, MenuItem, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Typography, Box, Container, Grid, useTheme, useMediaQuery, Card, CardContent } from '@mui/material';
import { getCurrentUser, isSuperAdminLoggedIn } from '../utils/Authentication';

function AddSection() {
    const [section, setSection] = useState('');
    const [subject, setSubject] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [day, setDay] = useState('Monday');
    const [acadYear, setAcadYear] = useState('');
    const [sections, setSections] = useState([]);
    const [editingSectionId, setEditingSectionId] = useState(null);
    const [teachers, setTeachers] = useState({});
    const [isSuperAdmin, setIsSuperAdmin] = useState(false); // Add state for super admin
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        const fetchSections = async () => {
            const currentUser = getCurrentUser(); // Get the currently logged-in user
            const isSuperAdminStatus = isSuperAdminLoggedIn(); // Check if the user is a super admin
            setIsSuperAdmin(isSuperAdminStatus); // Set super admin status

            if (!currentUser) {
                Swal.fire({
                    icon: 'error',
                    title: 'Ooops...',
                    text: 'You must be logged in to view sections!',
                });
                return;
            }

            const sectionsCollection = collection(db, 'sections');
            let q;

            if (isSuperAdminStatus) {
                q = query(sectionsCollection);
            } else {
                q = query(sectionsCollection, where('teacherUID', '==', currentUser.uid));
            }

            const sectionSnapshot = await getDocs(q);
            const sectionList = sectionSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setSections(sectionList);

            if (isSuperAdminStatus) {
                const teachersCollection = collection(db, 'teachers-info');
                const teacherSnapshot = await getDocs(teachersCollection);
                const teacherList = teacherSnapshot.docs.reduce((acc, doc) => {
                    const teacherData = doc.data();
                    acc[teacherData.uid] = teacherData.firstName + ' ' + teacherData.lastName;
                    return acc;
                }, {});
                setTeachers(teacherList);
            }
        };

        fetchSections();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();

        const currentUser = getCurrentUser(); // Get the currently logged-in user

        if (!currentUser) {
            Swal.fire({
                icon: 'error',
                title: 'Ooops...',
                text: 'You must be logged in to add a section!',
            });
            return;
        }

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

        if (subject.trim() === '') {
            Swal.fire({
                icon: 'error',
                title: 'Ooops...',
                text: 'Please enter a subject name!',
            });
            return;
        }

        if (editingSectionId) {
            try {
                const sectionDoc = doc(db, 'sections', editingSectionId);
                await updateDoc(sectionDoc, {
                    section,
                    subject,
                    startTime,
                    endTime,
                    day,
                    acadYear,
                    teacherUID: currentUser.uid, // Add teacher's UID
                });

                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Section updated successfully!',
                });

                const updatedSections = sections.map(sec => sec.id === editingSectionId ? { ...sec, section, subject, startTime, endTime, day, acadYear, teacherUID: currentUser.uid } : sec);
                setSections(updatedSections);
                setEditingSectionId(null);
                setSection('');
                setSubject('');
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
                    subject,
                    startTime,
                    endTime,
                    day,
                    acadYear,
                    teacherUID: currentUser.uid, // Add teacher's UID
                });

                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Section added successfully!',
                });

                setSections([...sections, { id: docRef.id, section, subject, startTime, endTime, day, acadYear, teacherUID: currentUser.uid }]);
                setSection('');
                setSubject('');
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
        setSubject(section.subject);
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
            <Box sx={{ padding: isMobile ? 0 : 2 }}>
                <Box sx={{ mt: isMobile ? 8 : 2, mb: 1 }}>
                    <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold' }}>
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
                                sx={{
                                    backgroundColor: 'white',
                                    borderRadius: 2
                                }}
                                InputProps={{
                                    sx: {
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#818181'
                                        }
                                    }
                                }}
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
                                sx={{
                                    backgroundColor: 'white',
                                    borderRadius: 2
                                }}
                                InputProps={{
                                    sx: {
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#818181'
                                        }
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                label="Subject Name"
                                value={subject}
                                placeholder="Enter Subject Name"
                                onChange={(e) => setSubject(e.target.value)}
                                sx={{
                                    backgroundColor: 'white',
                                    borderRadius: 2
                                }}
                                InputProps={{
                                    sx: {
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#818181'
                                        }
                                    }
                                }}
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
                                sx={{
                                    backgroundColor: 'white',
                                    borderRadius: 2
                                }}
                                InputProps={{
                                    sx: {
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#818181'
                                        }
                                    }
                                }}
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
                                sx={{
                                    backgroundColor: 'white',
                                    borderRadius: 2
                                }}
                                InputProps={{
                                    sx: {
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#818181'
                                        }
                                    }
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Select
                                fullWidth
                                variant="outlined"
                                value={day}
                                onChange={(e) => setDay(e.target.value)}
                                label="Day"
                                sx={{
                                    backgroundColor: 'white',
                                    borderRadius: 1,
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: '#818181',
                                    },
                                }}
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
                            <Button variant="contained" color='secondary'>Cancel</Button>
                        </Link>
                    </Box>
                </Box>

                {/* Conditionally render layout based on screen size */}
                {isMobile ? (
                    <Box>
                        {sections.map((section) => (
                            <Card key={section.id} sx={{ marginBottom: 2 }}>
                                <CardContent>
                                    <Typography variant="h6">{section.section}</Typography>
                                    <Typography variant="body2">
                                        {convertTo12HourFormat(section.startTime)} - {convertTo12HourFormat(section.endTime)}
                                    </Typography>
                                    <Typography variant="body2">{section.day}</Typography>
                                    <Typography variant="body2">{section.acadYear}</Typography>
                                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                        <IconButton color="primary" onClick={() => handleEdit(section)}>
                                            <FaEdit />
                                        </IconButton>
                                        <IconButton color="error" onClick={() => handleDelete(section.id)}>
                                            <FaTrash />
                                        </IconButton>
                                    </Box>
                                </CardContent>
                            </Card>
                        ))}
                    </Box>
                ) : (
                    <Box>
                        <Typography variant="h5" component="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                            Sections
                        </Typography>
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell align='center' sx={{ fontWeight: 'bold' }}>Section</TableCell>
                                        <TableCell align='center' sx={{ fontWeight: 'bold' }}>Subject</TableCell>
                                        <TableCell align='center' sx={{ fontWeight: 'bold' }}>Start Time</TableCell>
                                        <TableCell align='center' sx={{ fontWeight: 'bold' }}>End Time</TableCell>
                                        <TableCell align='center' sx={{ fontWeight: 'bold' }}>Day</TableCell>
                                        <TableCell align='center' sx={{ fontWeight: 'bold' }}>Academic Year</TableCell>
                                        {isSuperAdmin && <TableCell align='center' sx={{ fontWeight: 'bold' }}>Teacher</TableCell>}
                                        <TableCell align='center' sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {sections.map(section => (
                                        <TableRow key={section.id}>
                                            <TableCell align='center'>{section.section}</TableCell>
                                            <TableCell align='center'>{section.subject}</TableCell>
                                            <TableCell align='center'>{convertTo12HourFormat(section.startTime)}</TableCell>
                                            <TableCell align='center'>{convertTo12HourFormat(section.endTime)}</TableCell>
                                            <TableCell align='center'>{section.day}</TableCell>
                                            <TableCell align='center'>{section.acadYear}</TableCell>
                                            {isSuperAdmin && (
                                                <TableCell align='center'>{teachers[section.teacherUID] || 'Unknown'}</TableCell>
                                            )}
                                            <TableCell align='center'>
                                                <IconButton onClick={() => handleEdit(section)}  sx={{
                                                    mx: 1,
                                                    color: '#1e88e5', // (blue)
                                                    '&:hover': {
                                                        color: '#1565c0', // Darker blue on hover
                                                    },
                                                }}>
                                                    <FaEdit fontSize='medium' />
                                                </IconButton>
                                                <IconButton onClick={() => handleDelete(section.id)} sx={{
                                                mx: 1,
                                                color: '#db1a1a', // red
                                                '&:hover': {
                                                    color: '#ff0000', // Red color on hover
                                                },
                                            }}>
                                                    <FaTrash fontSize='medium'/>
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                )}
            </Box>
        </Container >
    );
}

export default AddSection;
