import React, { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { Box, Grid, Typography, TextField, CircularProgress, Paper, Avatar, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, useMediaQuery, useTheme } from '@mui/material';

function Teachers() {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchName, setSearchName] = useState("");

    const theme = useTheme();
    const isMobile = useMediaQuery('(max-width:600px)');

    useEffect(() => {
        const fetchTeachers = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'teachers-info'));
                const teachersList = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setTeachers(teachersList);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching teachers:', error);
                setLoading(false);
            }
        };

        fetchTeachers();
    }, []);

    const filteredTeachers = teachers.filter(teacher => {
        const fullName = `${teacher.firstName || ''} ${teacher.middleName || ''} ${teacher.lastName || ''}`.trim();
        return fullName.toLowerCase().includes(searchName.toLowerCase());
    });

    if (loading) {
        return <CircularProgress />;
    }

    return (
        <Box sx={{ padding: 2 }}>
            <Grid container spacing={2} mb={2}>
                <Grid item xs={12} sx={{ mt: isMobile ? 6 : 2 }}>
                    <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                        Teachers List
                    </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <TextField
                        label="Search Teacher"
                        variant="outlined"
                        fullWidth
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
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
            </Grid>

            {isMobile ? (
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    {filteredTeachers.map((teacher, index) => (
                        <Box key={teacher.id} sx={{ border: '1px solid', borderRadius: 1, padding: 2, mb: 2 }}>
                            {teacher.image && (
                                <Avatar src={teacher.image} alt={teacher.firstName} sx={{ width: 80, height: 80, mt: 1 }} />
                            )}
                            <Typography variant="h6" gutterBottom>
                                {index + 1}. {`${teacher.firstName} ${teacher.middleName} ${teacher.lastName}`.trim()}
                            </Typography>
                            <Typography variant="body1"><strong>Email:</strong> {teacher.email}</Typography>
                        </Box>
                    ))}
                </Box>
            ) : (
                <TableContainer component={Paper} sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Table sx={{ minWidth: 650, width: '100%' }}>
                        <TableHead>
                            <TableRow>
                                <TableCell align="center" style={{ fontWeight: 'bold', fontSize: '1rem' }}>No</TableCell>
                                <TableCell align='center' style={{ fontWeight: 'bold', fontSize: '1rem' }}>Name</TableCell>
                                <TableCell align="center" style={{ fontWeight: 'bold', fontSize: '1rem' }}>Email</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredTeachers.map((teacher, index) => (
                                <TableRow key={teacher.id}>
                                    <TableCell align="center" style={{ fontSize: '1rem' }}>{index + 1}</TableCell>
                                    <TableCell align="center" style={{ fontSize: '1rem' }}>
                                        <Link
                                            to={`/teacher-details/${teacher.id}`}
                                            style={{
                                                textDecoration: 'none',
                                                color: theme.palette.primary.main,
                                            }}
                                        >
                                            {`${teacher.firstName} ${teacher.middleName} ${teacher.lastName}`.trim()}
                                        </Link>
                                    </TableCell>
                                    <TableCell align="center" style={{ fontSize: '1rem' }}>{teacher.email}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
}

export default Teachers;
