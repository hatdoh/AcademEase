import React, { useState, useEffect } from 'react';
import { MdAdd, MdArrowUpward, MdArrowDownward } from 'react-icons/md';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getCurrentUser, isSuperAdminLoggedIn } from '../utils/Authentication'; // Import added
import {
    Grid, Typography, TextField, Button, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, TableSortLabel, Paper, Box, Avatar, useTheme, useMediaQuery
} from '@mui/material';
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
    const [sortDirection, setSortDirection] = useState('asc');
    const [isSuperAdmin, setIsSuperAdmin] = useState(false); // State to track super admin status

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUser(user);
                // Check if the user is a super admin directly
                const checkAdmin = isSuperAdminLoggedIn();
                setIsSuperAdmin(checkAdmin);
            } else {
                setUser(null);
                setIsSuperAdmin(false);
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (user) {
            const fetchSectionsAndStudents = async () => {
                try {
                    let sections = [];
                    if (isSuperAdmin) {
                        // Fetch all sections if super admin
                        const allSectionsSnapshot = await getDocs(collection(db, 'sections'));
                        sections = allSectionsSnapshot.docs.map(doc => doc.data().section);
                        setSectionList(['All', ...sections]);
                    } else {
                        // Fetch sections added by the current user (teacher)
                        const sectionsQuery = query(collection(db, 'sections'), where('teacherUID', '==', user.uid));
                        const sectionsSnapshot = await getDocs(sectionsQuery);
                        sections = sectionsSnapshot.docs.map(doc => doc.data().section);
                        setSectionList([...sections]);
                    }

                    // Fetch students
                    const studentsCollection = collection(db, 'students');
                    const studentSnapshot = await getDocs(studentsCollection);
                    const studentList = studentSnapshot.docs
                        .map(doc => ({ id: doc.id, ...doc.data() }))
                        .filter(student => sections.includes(student.section)); // Filter students by sections
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
                    console.error('Error fetching data:', error);
                }
            };

            fetchSectionsAndStudents();
        }
    }, [user, isSuperAdmin]);

    const handleSectionClick = (section) => {
        setSelectedSection(section);
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
                <Grid item xs={12} sx={{ mt: isMobile ? 6 : 2 }}>
                    <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                        Section ({selectedSection})
                    </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <TextField
                        label="Search Acad Year"
                        variant="outlined"
                        fullWidth
                        value={searchAcadYear}
                        onChange={(e) => setSearchAcadYear(e.target.value)}
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
                        label="Search Grade"
                        variant="outlined"
                        fullWidth
                        value={searchGrade}
                        onChange={(e) => setSearchGrade(e.target.value)}
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
                        label="Search Section"
                        variant="outlined"
                        fullWidth
                        value={searchSection}
                        onChange={(e) => setSearchSection(e.target.value)}
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
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {sectionList.map((section) => (
                            <Button
                                key={section}
                                variant={selectedSection === section ? 'contained' : 'contained'}
                                onClick={() => handleSectionClick(section)}
                                sx={{ flexShrink: 0 }}
                            >
                                {section === 'All' ? 'All Sections' : `Section ${section}`}
                            </Button>
                        ))}
                        <Button
                            component={Link}
                            to="/add-section"
                            variant="outlined"
                            color="primary"
                            startIcon={<MdAdd />}
                            sx={{
                                mt: 1,
                                '&:hover': {
                                    backgroundColor: 'primary.main',  // Change the background color on hover
                                    color: 'white',                   // Change the text color on hover
                                }
                            }}
                        >
                            Add Section
                        </Button>

                    </Box>
                </Grid>
            </Grid>

            {isMobile ? (
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
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
                                <TableCell align="center" style={{ fontWeight: 'bold' }}>No</TableCell>
                                <TableCell>
                                    <TableSortLabel
                                        active={sortColumn === 'LName'}
                                        direction={sortColumn === 'LName' ? sortDirection : 'asc'}
                                        onClick={() => handleSort('LName')}
                                        style={{ fontWeight: 'bold' }}
                                    >
                                        Name
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell align="center" style={{ fontWeight: 'bold' }}>Grade</TableCell>
                                <TableCell align="center" style={{ fontWeight: 'bold' }}>Section</TableCell>
                                <TableCell align="center" style={{ fontWeight: 'bold' }}>Gender</TableCell>
                                <TableCell align="center" style={{ fontWeight: 'bold' }}>Contact Number</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sortedStudents.map((student, index) => (
                                <TableRow key={student.id}>
                                    <TableCell align="center">{index + 1}</TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
            )}
        </Box>
    );
}

export default Section;
