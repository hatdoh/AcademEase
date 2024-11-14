import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, useTheme, useMediaQuery } from '@mui/material';

function ViewAttendanceSummary() {
    const { id } = useParams();
    const [attendance, setAttendance] = useState([]);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                const attendanceCollection = collection(db, 'attendance');
                const q = query(attendanceCollection, where('studentId', '==', id));
                const snapshot = await getDocs(q);

                // Flatten the attendance entries across documents
                const attendanceList = snapshot.docs.flatMap(doc => doc.data().attendanceEntries || []);

                setAttendance(attendanceList);
            } catch (error) {
                console.error('Error fetching attendance:', error);
            }
        };

        fetchAttendance();
    }, [id]);

    const countStatus = (status) => {
        return attendance.filter(record => record.remarks === status).length;
    };


    const presentCount = countStatus('Present');
    const lateCount = countStatus('Late');
    const absentCount = countStatus('Absent');

    return (
        <Box sx={{ ml: { xs: 0, md: 0 }, p: isMobile ? 2 : 4 }}>
            <Typography variant={isMobile ? 'h5' : 'h4'} component="h2" fontWeight="bold" mb={2} sx={{ mt: isMobile ? 6 : 0 }}>
                Attendance Summary
            </Typography>
            <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell align="left" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                                Date
                            </TableCell>
                            <TableCell variant='body1' align="left" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                                Remarks
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {attendance.map((record, index) => (
                            <TableRow key={index}>
                                <TableCell align="left">{record.date}</TableCell>
                                <TableCell align="left">{record.remarks}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                    <TableRow>
                        <TableCell colSpan={2} sx={{ borderBottom: 'none' }}>
                            <Box sx={{ display: 'flex', mt: 2 }}>
                                <Typography variant="body1" sx={{ mr: 2 }}>
                                    <strong>Present:</strong> {presentCount}
                                </Typography>
                                <Typography variant="body1" sx={{ mr: 2 }}>
                                    <strong>Late:</strong> {lateCount}
                                </Typography>
                                <Typography variant="body1">
                                    <strong>Absent:</strong> {absentCount}
                                </Typography>
                            </Box>
                        </TableCell>
                    </TableRow>
                </Table>
            </TableContainer>
        </Box>
    );
}

export default ViewAttendanceSummary;
