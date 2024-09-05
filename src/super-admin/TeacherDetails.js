import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../config/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Box, Typography, TextField, Grid, Container, Button, useMediaQuery, useTheme, CircularProgress } from '@mui/material';
import Swal from 'sweetalert2';

function TeacherDetails() {
    const { id } = useParams();
    const [teacher, setTeacher] = useState({
        lastName: '',
        firstName: '',
        middleName: '',
        gender: '',
        dob: '',
        phoneNumber: '',
        email: ''
    });
    const [loading, setLoading] = useState(true);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const navigate = useNavigate(); // To navigate back on cancel

    useEffect(() => {
        const fetchTeacher = async () => {
            try {
                const docRef = doc(db, 'teachers-info', id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setTeacher(docSnap.data());
                } else {
                    Swal.fire('Error', 'No such teacher exists!', 'error');
                }
                setLoading(false);
            } catch (error) {
                console.error('Error fetching teacher:', error);
                setLoading(false);
            }
        };

        fetchTeacher();
    }, [id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setTeacher((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        const { phoneNumber } = teacher;

        // Validation for phone number
        if (!/^09\d{9}$/.test(phoneNumber)) {
            Swal.fire('Invalid Phone Number', 'Phone number must start with 09 and contain 11 digits.', 'error');
            return;
        }

        try {
            // Update the document in Firestore
            await updateDoc(doc(db, 'teachers-info', id), teacher);
            Swal.fire('Success', 'Teacher details have been updated!', 'success');
        } catch (error) {
            console.error('Error updating teacher:', error);
            Swal.fire('Error', 'There was a problem updating the details.', 'error');
        }
    };

    const handleCancel = () => {
        navigate('/teachers'); // Navigate back to the teachers list
    };

    if (loading) {
        return <CircularProgress />;
    }

    return (
        <Container maxWidth="md" sx={{ mt: isMobile ? 8 : 4, ml: isMobile ? 0 : 3 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                Teacher Details
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <TextField
                        label="Last Name"
                        name="lastName"
                        value={teacher.lastName}
                        onChange={handleInputChange}
                        fullWidth
                        sx={{ backgroundColor: 'white', borderRadius: 2 }}
                    />
                </Grid>

                <Grid item xs={12} md={4}>
                    <TextField
                        label="First Name"
                        name="firstName"
                        value={teacher.firstName}
                        onChange={handleInputChange}
                        fullWidth
                        sx={{ backgroundColor: 'white', borderRadius: 2 }}
                    />
                </Grid>

                <Grid item xs={12} md={4}>
                    <TextField
                        label="Middle Name"
                        name="middleName"
                        value={teacher.middleName}
                        onChange={handleInputChange}
                        fullWidth
                        sx={{ backgroundColor: 'white', borderRadius: 2 }}
                    />
                </Grid>

                <Grid item xs={12} md={6}>
                    <TextField
                        label="Gender"
                        name="gender"
                        value={teacher.gender}
                        onChange={handleInputChange}
                        fullWidth
                        sx={{ backgroundColor: 'white', borderRadius: 2 }}
                    />
                </Grid>

                <Grid item xs={12} md={6}>
                    <TextField
                        label="Date of Birth"
                        name="dob"
                        value={teacher.dob}
                        type='date'
                        onChange={handleInputChange}
                        fullWidth
                        sx={{ backgroundColor: 'white', borderRadius: 2 }}
                    />
                </Grid>

                <Grid item xs={12} md={6}>
                    <TextField
                        label="Phone Number"
                        name="phoneNumber"
                        value={teacher.phoneNumber}
                        onChange={handleInputChange}
                        fullWidth
                        inputProps={{ maxLength: 11 }}
                        sx={{ backgroundColor: 'white', borderRadius: 2 }}
                    />
                </Grid>

                <Grid item xs={12} md={6}>
                    <TextField
                        label="Email"
                        name="email"
                        value={teacher.email}
                        onChange={handleInputChange}
                        fullWidth
                        sx={{ backgroundColor: 'white', borderRadius: 2 }}
                    />
                </Grid>

                <Grid item xs={12}>
                    <Box display="flex" justifyContent="flex-end">
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSave}
                            sx={{ mr: 2 }}
                        >
                            Save
                        </Button>
                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={handleCancel}
                        >
                            Cancel
                        </Button>
                    </Box>
                </Grid>
            </Grid>
        </Container>
    );
}

export default TeacherDetails;
