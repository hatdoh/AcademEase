import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, collection, getDocs, query, where, writeBatch } from 'firebase/firestore';
import { db, storage } from '../config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Swal from 'sweetalert2';
import { MdEdit } from 'react-icons/md';
import { Button, Container, Grid, Typography, TextField, InputLabel, Select, MenuItem, IconButton, FormControl, useMediaQuery, useTheme, Card, CardContent, CardMedia, CardActions, Box } from '@mui/material';

function StudentProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [student, setStudent] = useState({});
    const [imageFile, setImageFile] = useState(null);
    const [isEditingImage, setIsEditingImage] = useState(false);
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // Check if screen is mobile size

    useEffect(() => {
        const fetchStudent = async () => {
            try {
                const docRef = doc(db, 'students', id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setStudent(docSnap.data());
                } else {
                    console.error('No such document!');
                }
                setLoading(false);
            } catch (error) {
                console.error('Error fetching student:', error);
                setLoading(false);
            }
        };

        fetchStudent();
    }, [id]);

    useEffect(() => {
        const fetchSections = async () => {
            try {
                const sectionsCollection = collection(db, 'sections');
                const snapshot = await getDocs(sectionsCollection);
                const sectionsList = snapshot.docs.map(doc => doc.data().section);
                setSections(sectionsList);
            } catch (error) {
                console.error('Error fetching sections:', error);
            }
        };

        fetchSections();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Handle contact number validation
        if (name === 'contactNumber') {
            const formattedValue = value.replace(/[^0-9]/g, ''); // Remove non-numeric characters

            if (!formattedValue.startsWith('09')) {
                Swal.fire({
                    icon: 'error',
                    title: 'Invalid Contact Number',
                    text: 'Contact number should start with "09".',
                });
                return;
            }

            if (formattedValue.length > 11) {
                Swal.fire({
                    icon: 'error',
                    title: 'Invalid Contact Number',
                    text: 'Contact number should be exactly 11 digits long.',
                });
                return;
            }

            setStudent((prevState) => ({
                ...prevState,
                [name]: formattedValue
            }));
        }
        // Handle LRN validation
        else if (name === 'lrn') {
            const formattedValue = value.replace(/[^0-9]/g, ''); // Remove non-numeric characters

            if (formattedValue.length > 12) {
                Swal.fire({
                    icon: 'error',
                    title: 'Invalid LRN',
                    text: 'LRN should be exactly 12 digits long.',
                });
                return;
            }

            setStudent((prevState) => ({
                ...prevState,
                [name]: formattedValue
            }));
        }
        // Handle other fields
        else {
            setStudent((prevState) => ({
                ...prevState,
                [name]: value
            }));
        }
    };


    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                Swal.fire('Error', 'Please upload an image file (JPEG, PNG, GIF)', 'error');
                return;
            }

            setImageFile(file);
            setStudent((prevStudent) => ({
                ...prevStudent,
                image: URL.createObjectURL(file),
            }));
        }
    };

    const handleImageEditToggle = () => {
        setIsEditingImage(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "Do you really want to save the changes?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, save it!',
            cancelButtonText: 'No, cancel!',
        });

        if (result.isConfirmed) {
            try {
                // Validation for Contact Number
                if (!/^09\d{9}$/.test(student.contactNumber)) {
                    throw new Error('Invalid contact number format. It should start with "09" and be 11 digits.');
                }

                // Validation for Age
                if (isNaN(student.age) || student.age <= 0) {
                    throw new Error('Age should be a valid number.');
                }

                // Upload image to Firebase Storage if there's a new file selected
                let imageUrl = student.image;
                if (imageFile) {
                    const storageRef = ref(storage, `students/${id}/${imageFile.name}`);
                    await uploadBytes(storageRef, imageFile);
                    imageUrl = await getDownloadURL(storageRef);
                }

                const updatedStudent = {
                    ...student,
                    image: imageUrl,
                };

                // Update student document
                const studentDocRef = doc(db, 'students', id);
                await updateDoc(studentDocRef, updatedStudent);

                // Update related attendance records
                const attendanceCollection = collection(db, 'attendance');
                const q = query(attendanceCollection, where('studentId', '==', id));
                const attendanceSnapshot = await getDocs(q);

                const batch = writeBatch(db);
                attendanceSnapshot.forEach(doc => {
                    const attendanceDocRef = doc.ref;
                    batch.update(attendanceDocRef, {
                        FName: updatedStudent.FName,
                        LName: updatedStudent.LName,
                        MName: updatedStudent.MName,
                        lrn: updatedStudent.lrn,
                        grade: updatedStudent.grade,
                        section: updatedStudent.section,
                        image: updatedStudent.image,
                    });
                });

                await batch.commit();

                Swal.fire('Success', 'Student details updated successfully', 'success');

                setIsEditingImage(false);
                navigate('/');
            } catch (error) {
                console.error('Error updating student:', error.message);
                Swal.fire('Error', error.message, 'error');
            }
        }
    };

    const handleCancel = () => {
        navigate('/');
    };

    return (
        <Container maxWidth="lg">
            <Typography variant="h4" gutterBottom sx={{ mt: 3, fontWeight: 'bold' }}>
                Student Profile
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                    <Card sx={{
                        maxWidth: 400,
                        margin: 'auto',
                        padding: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        boxShadow: 3,
                        borderRadius: 2,
                        overflow: 'hidden',
                    }}>
                        <CardMedia
                            component="img"
                            image={student.image || '/default-image.png'}
                            alt={student.FName}
                            sx={{
                                width: 180,
                                heigt: 180,
                                objectFit: 'cover',
                                borderRadius: '50%',
                                mb: 2,
                            }}
                        />
                        <CardContent align='center'>
                            {!isEditingImage ? (
                                <>
                                    <Box
                                        display="flex"
                                        flexDirection="column"
                                        alignItems="center"  // Centers items horizontally
                                        justifyContent="center"  // Centers items vertically (optional)
                                        sx={{ textAlign: 'center' }}  // Ensures text is centered
                                    >
                                        <Typography variant="h6" gutterBottom>
                                            {`${student.FName} ${student.MName} ${student.LName}`}
                                        </Typography>
                                        <Button
                                            variant="outlined"
                                            color="primary"
                                            onClick={() => navigate(`/view-attendance-summary/${id}`)}
                                            sx={{
                                                mb: 2,
                                                '&:hover': {
                                                    bgcolor: 'primary.main',  // Background color on hover
                                                    color: 'white',            // Text color on hover
                                                    borderColor: 'primary.main', // Border color on hover
                                                },
                                            }}
                                        >
                                            View Attendance Summary
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            color="primary"
                                            onClick={() => navigate(`/view-grades/${id}`)}
                                            sx={{
                                                mb: 2,
                                                '&:hover': {
                                                    bgcolor: 'primary.main',  // Background color on hover
                                                    color: 'white',            // Text color on hover
                                                    borderColor: 'primary.main', // Border color on hover
                                                },
                                            }}
                                        >
                                            View Grades
                                        </Button>

                                        <IconButton onClick={handleImageEditToggle} color="primary">
                                            <Box display="flex" alignItems="center">
                                                <Typography variant="body2" sx={{ fontSize: '1rem', mr: 1 }}>
                                                    Edit Profile
                                                </Typography>
                                                <MdEdit fontSize='medium' />
                                            </Box>
                                        </IconButton>
                                    </Box>
                                </>

                            ) : (
                                <input
                                    type="file"
                                    onChange={handleImageChange}
                                    style={{ display: 'block', width: '100%' }}
                                />
                            )}
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={8}>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                        Personal Information
                    </Typography>
                    <form onSubmit={handleSubmit} sx={{ mt: 5 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Last Name"
                                    name="LName"
                                    value={student.LName || ''}
                                    onChange={handleInputChange}
                                    fullWidth
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
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="First Name"
                                    name="FName"
                                    value={student.FName || ''}
                                    onChange={handleInputChange}
                                    fullWidth
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
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Middle Name"
                                    name="MName"
                                    value={student.MName || ''}
                                    onChange={handleInputChange}
                                    fullWidth
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
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="LRN"
                                    name="lrn"
                                    value={student.lrn || ''}
                                    onChange={handleInputChange}
                                    fullWidth
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
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Date of Birth"
                                    type="date"
                                    name="dateOfBirth"
                                    value={student.dateOfBirth || ''}
                                    onChange={handleInputChange}
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
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
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Gender"
                                    name="gender"
                                    value={student.gender || ''}
                                    onChange={handleInputChange}
                                    fullWidth
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
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Age"
                                    name="age"
                                    type="number"
                                    value={student.age || ''}
                                    onChange={handleInputChange}
                                    fullWidth
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
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Address"
                                    name="address"
                                    value={student.address || ''}
                                    onChange={handleInputChange}
                                    fullWidth
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
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Email"
                                    name="emailAddress"
                                    type="email"
                                    value={student.emailAddress || ''}
                                    onChange={handleInputChange}
                                    fullWidth
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
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Contact Number"
                                    name="contactNumber"
                                    value={student.contactNumber || ''}
                                    onChange={handleInputChange}
                                    fullWidth
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
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Grade"
                                    name="grade"
                                    value={student.grade || ''}
                                    onChange={handleInputChange}
                                    fullWidth
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
                            <Grid item xs={12} sm={6}>
                                <FormControl
                                    fullWidth
                                    sx={{
                                        backgroundColor: 'white',
                                        borderRadius: 2
                                    }}
                                >
                                    <InputLabel>Section</InputLabel>
                                    <Select
                                        name="section"
                                        value={student.section || ''}
                                        onChange={handleInputChange}
                                        label="Section"
                                        sx={{
                                            '& .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#818181',
                                            },
                                        }}
                                    >
                                        {sections.map((section, index) => (
                                            <MenuItem key={index} value={section}>
                                                {section}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <Box display="flex" justifyContent="flex-end" gap={1} sx={{ mb: isMobile ? 3 : 0 }}>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        color="primary"
                                    >
                                        Save Changes
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="contained"
                                        color='secondary'
                                        onClick={handleCancel}
                                    >
                                        Back
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </form>
                </Grid>
            </Grid>
        </Container>
    );
}

export default StudentProfile;
