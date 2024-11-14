import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import { db } from "../config/firebase";
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Grid, Typography, Paper, Table, TableHead, TableBody, TableRow, TableCell, Avatar, Box, useTheme, useMediaQuery } from '@mui/material';
import { getCurrentUser } from '../utils/Authentication';

// Helper function to convert 24-hour time to 12-hour format
function convertTo12HourFormat(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;  // 0 becomes 12 (midnight)
    return `${hour12}:${minutes < 10 ? '0' + minutes : minutes} ${period}`;
}

function Dashboard() {
    const [dateTime, setDateTime] = useState(new Date());
    const [attendanceData, setAttendanceData] = useState({ Present: [], Late: [], Absent: [] });
    const [currentSection, setCurrentSection] = useState(null); // State to hold dynamic section data
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const currentUser = getCurrentUser(); // Get current user


    function formatDateToString(date) {
        return date.toISOString().split('T')[0];  // Returns 'YYYY-MM-DD'
    }


    useEffect(() => {
        // Set up interval to update the date and time every second
        const interval = setInterval(() => {
            setDateTime(new Date());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!currentUser) return; // Exit if no user is logged in

        const dayOfWeek = dateTime.toLocaleString('en-US', { weekday: 'long' });
        const q = query(collection(db, 'sections'),
            where('teacherUID', '==', currentUser.uid),
            where('day', '==', dayOfWeek));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const sections = [];
            querySnapshot.forEach((doc) => {
                sections.push({ ...doc.data(), id: doc.id });
            });

            console.log(sections); // Log the sections to debug

            if (sections.length > 0) {
                const now = dateTime.getHours() * 60 + dateTime.getMinutes(); // Current time in minutes
                const closestSection = sections.reduce((closest, section) => {
                    const [startHour, startMinute] = section.startTime.split(':').map(Number);
                    const startMinutes = startHour * 60 + startMinute;
                    const startDiff = Math.abs(startMinutes - now);
                    return !closest || startDiff < closest.diff ? { section, diff: startDiff } : closest;
                }, null);

                if (closestSection) {
                    setCurrentSection(closestSection.section); // Set the closest section (use the name of the section)
                }
            }
        });

        return () => unsubscribe();
    }, [dateTime, currentUser]);

    // Fetch attendance data for the current section by section name (not ID)
    useEffect(() => {
        if (!currentSection) return; // Only fetch attendance data when currentSection is set

        // Format the date as YYYY-MM-DD to match the database entry format
        const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });
        console.log("Today's date:", today); // Log today's date

        const q = query(collection(db, 'attendance'), where('section', '==', currentSection.section));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const data = { Present: [], Late: [], Absent: [] };

            querySnapshot.forEach((doc) => {
                const record = doc.data();

                const attendanceEntries = Array.isArray(record.attendanceEntries) ? record.attendanceEntries : [];

                attendanceEntries.forEach(entry => {
                    console.log("Entry Date:", entry.date); // Log the entry date for debugging

                    // Compare dates
                    if (entry.date === today) {
                        console.log("Entry matched for today:", entry);
                        const studentData = {
                            ...record,
                            remarks: entry.remarks,
                            timeIn: entry.timeIn,
                            date: entry.date,
                        };

                        switch (entry.remarks) {
                            case 'Present':
                                data.Present.push(studentData);
                                break;
                            case 'Late':
                                data.Late.push(studentData);
                                break;
                            case 'Absent':
                                data.Absent.push(studentData);
                                break;
                            default:
                                break;
                        }
                    }
                });
            });

            console.log("Filtered attendance data:", data);
            setAttendanceData(data); // Set filtered attendance data
        });

        return () => unsubscribe();
    }, [currentSection, dateTime]);  // Run the effect when the current section or date changes




    const formattedDateTime = dateTime.toLocaleString('en-US', {
        weekday: 'long',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: true
    });

    const presentCount = attendanceData.Present.length;
    const lateCount = attendanceData.Late.length;
    const absentCount = attendanceData.Absent.length;

    return (
        <Box sx={{ flexGrow: 4, mt: 7, ml: { sm: '220px', md: '32px' }, pr: { xs: 2, sm: 3, md: 4 }, pl: { xs: 2, sm: 3, md: 4 }, overflowX: 'hidden' }}>
            <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6} color={'#1f2b36'}>
                    <Typography variant="h6" sx={{ fontSize: { xs: '1.75rem', sm: '2rem' }, fontWeight: 'bold' }}>
                        {currentSection
                            ? `Section ${currentSection.section}, ${currentSection.day}, ${convertTo12HourFormat(currentSection.startTime)} - ${convertTo12HourFormat(currentSection.endTime)}`
                            : "Loading section data..."}
                    </Typography>
                </Grid>
                <Grid item xs={12} sm={6} sx={{ textAlign: { sm: 'right' } }}>
                    <Typography variant="body2" color="textSecondary">
                        {formattedDateTime}
                    </Typography>
                </Grid>
            </Grid>

            <Paper sx={{ mt: 3, boxShadow: 3, borderRadius: 2, p: 2 }}>
                <Box sx={{ overflowX: 'auto', maxHeight: '60vh' }}>
                    {isMobile ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                            {['Present', 'Late', 'Absent'].map((status) => (
                                <Box key={status} sx={{ mb: 2 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                        {`${status.charAt(0).toUpperCase() + status.slice(1)} (${attendanceData[status].length})`}
                                    </Typography>
                                    {attendanceData[status]?.map(student => (
                                        <Box key={student.id} display="flex" alignItems="center" p={1} sx={{ cursor: 'pointer', '&:hover': { backgroundColor: '#f5f5f5' }, borderRadius: 1 }}>
                                            <Avatar src={student.image} alt={student.name} sx={{ width: 60, height: 60, mr: 2 }} />
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
                                    <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{`${presentCount} Present`}</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{`${lateCount} Late`}</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{`${absentCount} Absent`}</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow>
                                    <TableCell sx={{ overflowY: 'auto', maxHeight: '60vh', verticalAlign: 'top' }}>
                                        {attendanceData.Present.map(student => (
                                            <Box key={student.id} display="flex" alignItems="center" p={1} sx={{ cursor: 'pointer', '&:hover': { backgroundColor: '#f5f5f5' }, borderRadius: 1 }}>
                                                <Avatar src={student.image} alt={student.name} sx={{ width: 60, height: 60, mr: 2 }} />
                                                <Link to={`/profile/${student.id}`} style={{ textDecoration: 'none', color: '#1e88e5' }}>
                                                    {`${student.FName} ${student.MName} ${student.LName}`}
                                                </Link>
                                            </Box>
                                        ))}
                                    </TableCell>
                                    <TableCell sx={{ overflowY: 'auto', maxHeight: '60vh', verticalAlign: 'top' }}>
                                        {attendanceData.Late.map(student => (
                                            <Box key={student.id} display="flex" alignItems="center" p={1} sx={{ cursor: 'pointer', '&:hover': { backgroundColor: '#f5f5f5' }, borderRadius: 1 }}>
                                                <Avatar src={student.image} alt={student.name} sx={{ width: 60, height: 60, mr: 2 }} />
                                                <Link to={`/profile/${student.id}`} style={{ textDecoration: 'none', color: '#1e88e5' }}>
                                                    {`${student.FName} ${student.MName} ${student.LName}`}
                                                </Link>
                                            </Box>
                                        ))}
                                    </TableCell>
                                    <TableCell sx={{ overflowY: 'auto', maxHeight: '60vh', verticalAlign: 'top' }}>
                                        {attendanceData.Absent.map(student => (
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
