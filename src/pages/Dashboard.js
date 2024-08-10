import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import { db } from "../config/firebase";
import { collection, query, onSnapshot } from 'firebase/firestore';
import { Grid, Typography, Paper, Table, TableHead, TableBody, TableRow, TableCell, Avatar, Box, useTheme, useMediaQuery } from '@mui/material';

function Dashboard() {
    const [dateTime, setDateTime] = useState(new Date());
    const [attendanceData, setAttendanceData] = useState({ present: [], late: [], absent: [] });
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        const interval = setInterval(() => {
            setDateTime(new Date());
        }, 1000); // Update every second

        return () => {
            clearInterval(interval); // Clean up interval on unmount
        };
    }, []);

    useEffect(() => {
        const q = query(collection(db, 'attendance'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const data = { present: [], late: [], absent: [] };
            querySnapshot.forEach((doc) => {
                const record = doc.data();
                switch (record.remarks) {
                    case 'present':
                        data.present.push({ ...record, id: doc.id });
                        break;
                    case 'late':
                        data.late.push({ ...record, id: doc.id });
                        break;
                    case 'absent':
                        data.absent.push({ ...record, id: doc.id });
                        break;
                    default:
                        break;
                }
            });
            setAttendanceData(data);
        });

        return () => {
            unsubscribe();
        };
    }, []);

    const formattedDateTime = dateTime.toLocaleString('en-US', {
        weekday: 'long',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: true
    });

    const presentCount = attendanceData.present.length;
    const lateCount = attendanceData.late.length;
    const absentCount = attendanceData.absent.length;

    return (
        <Box sx={{ flexGrow: 4, mt: 7, ml: { sm: '220px', md: '32px' }, pr: { xs: 2, sm: 3, md: 4 }, pl: { xs: 2, sm: 3, md: 4 }, overflowX: 'hidden' }}>
            <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6} color={'#1f2b36'}>
                    <Typography variant="h6" sx={{ fontSize: { xs: '1.75rem', sm: '2rem' }, fontWeight: 'bold' }}>
                        Section Sampaguita, Friday, 1:00 PM - 2:00 PM
                    </Typography>
                </Grid>
                <Grid item xs={12} sm={6} sx={{ textAlign: { sm: 'right' } }}>
                    <Typography variant="body2" color="textSecondary">
                        {formattedDateTime}
                    </Typography>
                </Grid>
            </Grid>

            <Paper sx={{ mt: 3, boxShadow: 3, borderRadius: 2, p: 2}}>
                <Box sx={{ overflowX: 'auto', maxHeight: '60vh' }}>
                    {isMobile ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            {['present', 'late', 'absent'].map((status) => (
                                <Box key={status} sx={{ mb: 2 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                        {`${status.charAt(0).toUpperCase() + status.slice(1)} (${attendanceData[status].length})`}
                                    </Typography>
                                    {attendanceData[status].map(student => (
                                        <Box key={student.id} display="flex" alignItems="center" p={1} sx={{ cursor: 'pointer', '&:hover': { backgroundColor: '#f5f5f5' }, borderRadius: 1 }}>
                                            <Avatar src={student.image} alt={student.name} sx={{ width: 40, height: 40, mr: 2 }} />
                                            <Link to={`/profile/${student.id}`} style={{ textDecoration: 'none', color: '#1e88e5' }}>
                                                {`${student.FName} ${student.MName} ${student.LName}`}
                                            </Link>
                                        </Box>
                                    ))}
                                </Box>
                            ))}
                        </Box>
                    ) : (
                        <Table sx={{ minWidth: 650, borderRadius: 2 }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell  align="center" sx={{ fontWeight: 'bold', fontSize: '1.2rem'}}>{`${presentCount} Present`}</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '1.2rem'}}>{`${lateCount} Late`}</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '1.2rem'}}>{`${absentCount} Absent`}</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow>
                                    <TableCell sx={{overflowY: 'auto', maxHeight: '60vh' }}>
                                        {attendanceData.present.map(student => (
                                            <Box key={student.id} display="flex" alignItems="center" p={1} sx={{ cursor: 'pointer', '&:hover': { backgroundColor: '#f5f5f5' }, borderRadius: 1 }}>
                                                <Avatar src={student.image} alt={student.name} sx={{ width: 60, height: 60, mr: 2 }} />
                                                <Link to={`/profile/${student.id}`} style={{ textDecoration: 'none', color: '#1e88e5' }}>
                                                    {`${student.FName} ${student.MName} ${student.LName}`}
                                                </Link>
                                            </Box>
                                        ))}
                                    </TableCell>
                                    <TableCell sx={{overflowY: 'auto', maxHeight: '60vh' }}>
                                        {attendanceData.late.map(student => (
                                            <Box key={student.id} display="flex" alignItems="center" p={1} sx={{ cursor: 'pointer', '&:hover': { backgroundColor: '#f5f5f5' }, borderRadius: 1 }}>
                                                <Avatar src={student.image} alt={student.name} sx={{ width: 60, height: 60, mr: 2 }} />
                                                <Link to={`/profile/${student.id}`} style={{ textDecoration: 'none', color: '#1e88e5' }}>
                                                    {`${student.FName} ${student.MName} ${student.LName}`}
                                                </Link>
                                            </Box>
                                        ))}
                                    </TableCell>
                                    <TableCell sx={{ overflowY: 'auto', maxHeight: '60vh' }}>
                                        {attendanceData.absent.map(student => (
                                            <Box key={student.id} display="flex" alignItems="center" p={1} sx={{ cursor: 'pointer', '&:hover': { backgroundColor: '#f5f5f5' }, borderRadius: 1 }}>
                                                <Avatar src={student.image} alt={student.name} sx={{ width: 60, height: 60, mr: 2 }} />
                                                <Link to={`/profile/${student.id}`} style={{ textDecoration: 'none', color: '#1e88e5' }}>
                                                    {`${student.FName} ${student.MName} ${student.LName}`}
                                                </Link>
                                            </Box>
                                        ))}
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    )}
                </Box>
            </Paper>
        </Box>
    );
}

export default Dashboard;
