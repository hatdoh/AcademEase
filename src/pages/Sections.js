import React, { useState, useEffect } from 'react';
import { MdAdd, MdArrowUpward, MdArrowDownward } from 'react-icons/md';
import { Link } from 'react-router-dom';
import { collection, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Grid, Typography, TextField, Select, MenuItem, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, Paper, Box, Avatar, IconButton, useTheme, useMediaQuery } from '@mui/material';

function Section() {
    const [selectedSection, setSelectedSection] = useState('All');
    const [sectionList, setSectionList] = useState(['All']);
    const [students, setStudents] = useState([]);
    const [user, setUser] = useState(null);
    const [sectionCounts, setSectionCounts] = useState({});
    const [searchAcadYear, setSearchAcadYear] = useState('');
    const [searchGrade, setSearchGrade] = useState('');
    const [searchSection, setSearchSection] = useState('');
    const [sortColumn, setSortColumn] = useState('LName');
    const [sortDirection, setSortDirection] = useState('asc'); // 'asc' or 'desc'

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user);
            } else {
                setUser(null);
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (user) {
            const fetchStudentsAndSections = async () => {
                try {
                    const studentsCollection = collection(db, 'students');
                    const studentSnapshot = await getDocs(studentsCollection);
                    const studentList = studentSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
                    setStudents(studentList);

                    // Calculate section counts
                    const counts = studentList.reduce((acc, student) => {
                        const section = student.section;
                        if (section in acc) {
                            acc[section]++;
                        } else {
                            acc[section] = 1;
                        }
                        return acc;
                    }, {});
                    setSectionCounts(counts);

                } catch (error) {
                    console.error('Error fetching students:', error);
                }
            };

            fetchStudentsAndSections();
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            const sectionsCollection = collection(db, 'sections');
            const unsubscribeSections = onSnapshot(sectionsCollection, (snapshot) => {
                const sections = ['All', ...new Set(snapshot.docs.map((doc) => doc.data().section))];
                setSectionList(sections);
            });

            return () => unsubscribeSections();
        }
    }, [user]);

    const handleSectionChange = (event) => {
        setSelectedSection(event.target.value);
    };

    const handleSort = (columnName) => {
        if (sortColumn === columnName) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(columnName);
            setSortDirection('asc');
        }
    };

    const filteredStudents = students.filter((student) => {
        const acadYear = student.acadYear ? student.acadYear.toLowerCase() : '';
        const grade = student.grade ? student.grade.toLowerCase() : '';
        const section = student.section ? student.section.toLowerCase() : '';

        return (
            (selectedSection === 'All' || student.section === selectedSection) &&
            (acadYear.includes(searchAcadYear.toLowerCase())) &&
            (grade.includes(searchGrade.toLowerCase())) &&
            (section.includes(searchSection.toLowerCase()))
        );
    });

    const sortedStudents = [...filteredStudents].sort((a, b) => {
        if (sortColumn === 'LName') {
            const fullNameA = `${a.LName}, ${a.FName} ${a.MName}`;
            const fullNameB = `${b.LName}, ${b.FName} ${b.MName}`;
            return sortDirection === 'asc' ? fullNameA.localeCompare(fullNameB) : fullNameB.localeCompare(fullNameA);
        }
        return 0;
    });

    const renderSortIcon = (columnName) => {
        if (sortColumn === columnName) {
            return (
                <span>
                    {sortDirection === 'asc' ? (
                        <MdArrowUpward style={{ verticalAlign: 'middle', fontSize: '1rem' }} />
                    ) : (
                        <MdArrowDownward style={{ verticalAlign: 'middle', fontSize: '1rem' }} />
                    )}
                </span>
            );
        }
        return null;
    };

    const getFullName = (student) => {
        return `${student.LName}, ${student.FName} ${student.MName}`;
    };

    return (
        <Box sx={{ padding: 2 }}>
            <Grid container spacing={2} mb={2}>
                <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                        Section ({selectedSection})
                    </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <TextField
                        label="Acad Year"
                        variant="outlined"
                        fullWidth
                        value={searchAcadYear}
                        onChange={(e) => setSearchAcadYear(e.target.value)}
                        sx={{ backgroundColor: 'white', borderRadius: 1 }}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <TextField
                        label="Grade"
                        variant="outlined"
                        fullWidth
                        value={searchGrade}
                        onChange={(e) => setSearchGrade(e.target.value)}
                        sx={{ backgroundColor: 'white', borderRadius: 1 }}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <TextField
                        label="Section"
                        variant="outlined"
                        fullWidth
                        value={searchSection}
                        onChange={(e) => setSearchSection(e.target.value)}
                        sx={{ backgroundColor: 'white', borderRadius: 1 }}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <Select
                        value={selectedSection}
                        onChange={handleSectionChange}
                        fullWidth
                        variant="outlined"
                        sx={{ backgroundColor: 'white', borderRadius: 1 }}
                    >
                        {sectionList.map((section) => (
                            <MenuItem key={section} value={section}>
                                {section === 'All' ? 'All Sections' : `Section ${section}`}
                            </MenuItem>
                        ))}
                    </Select>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <Button
                        component={Link}
                        to="/add-section"
                        variant="contained"
                        color="primary"
                        startIcon={<MdAdd />}
                        sx={{ mt: 1 }}
                    >
                        Add Section
                    </Button>
                </Grid>
            </Grid>

            {
        isMobile ? (
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" gutterBottom>
                    Section ({selectedSection})
                </Typography>
                {sortedStudents.map((student, index) => (
                    <Box key={student.id} sx={{ border: '1px solid', borderRadius: 1, padding: 2, mb: 2 }}>
                        {student.image && (
                            <Avatar src={student.image} alt={student.FName} sx={{ width: 80, height: 80, mt: 1 }} />
                        )}
                        <Typography variant="h6" gutterBottom>
                            {index + 1}. {getFullName(student)}
                        </Typography>
                        <Typography variant="body1"><strong>Grade:</strong> {student.grade}</Typography>
                        <Typography variant="body1"><strong>Section:</strong> {student.section}</Typography>
                        <Typography variant="body1"><strong>Gender:</strong> {student.gender}</Typography>
                        <Typography variant="body1"><strong>Contact Number:</strong> {student.contactNumber}</Typography>
                        <Link to={`/profile/${student.id}`} style={{ textDecoration: 'none', color: theme.palette.primary.main }}>
                            View Profile
                        </Link>
                    </Box>
                ))}
            </Box>
        ) : (
            <TableContainer component={Paper} sx={{ display: 'flex', justifyContent: 'center' }}>
                <Table sx={{ minWidth: 650, width: '100%' }}>
                    <TableHead>
                        <TableRow>
                            <TableCell align="center" style={{fontWeight: 'bold'}}>No</TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={sortColumn === 'LName'}
                                    direction={sortColumn === 'LName' ? sortDirection : 'asc'}
                                    onClick={() => handleSort('LName')}
                                    style={{fontWeight: 'bold'}}
                                >
                                    Name
                                </TableSortLabel>
                            </TableCell>
                            <TableCell align="center" style={{fontWeight: 'bold'}}>Grade</TableCell>
                            <TableCell align="center" style={{fontWeight: 'bold'}}>Section</TableCell>
                            <TableCell align="center" style={{fontWeight: 'bold'}}>Gender</TableCell>
                            <TableCell align="center" style={{fontWeight: 'bold'}}>Contact Number</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortedStudents.map((student, index) => (
                            <TableRow key={student.id}>
                                <TableCell align="center">{index + 1}</TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center'}}>
                                        {student.image && (
                                            <Avatar
                                                src={student.image}
                                                alt={student.FName}
                                                sx={{ width: 60, height: 60, mr: 2 }}
                                            />
                                        )}
                                        <Link
                                            to={`/profile/${student.id}`}
                                            style={{
                                                textDecoration: 'none',
                                                color: theme.palette.primary.main,
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            {getFullName(student)}
                                        </Link>
                                    </Box>
                                </TableCell>
                                <TableCell align="center">{student.grade}</TableCell>
                                <TableCell align="center">{student.section}</TableCell>
                                <TableCell align="center">{student.gender}</TableCell>
                                <TableCell align="center">{student.contactNumber}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        )
    }
        </Box >

    );
}

export default Section;
