import React, { useState } from 'react';
import { Box, Button, MenuItem, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Paper, Avatar, useMediaQuery, useTheme } from '@mui/material';

const students = [
    // ... your students data
];

function ItemAnalysis() {
    const [selectedSection, setSelectedSection] = useState('All');
    const [sectionList, setSectionList] = useState(['All', 'A', 'B', 'C']); // Initial section list
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // Check if the screen size is small (mobile)

    const handleSectionChange = (event) => {
        setSelectedSection(event.target.value);
    };

    const deleteSection = (sectionName) => {
        if (sectionName === 'All') return; // Prevent deletion of 'All' section
        setSectionList(prev => prev.filter(section => section !== sectionName));
        if (selectedSection === sectionName) setSelectedSection('All'); // Reset to 'All' if current section is deleted
    };

    const filteredStudents = students.filter(student =>
        selectedSection === 'All' || student.section === selectedSection
    );

    const sectionCounts = sectionList.reduce((counts, section) => {
        counts[section] = students.filter(student => student.section === section).length;
        return counts;
    }, {});

    const getImagePath = (imageName) => {
        try {
            return require(`../res/img/${imageName}.png`);
        } catch (e) {
            return '';
        }
    };

    return (
        <Box sx={{ padding: 2 }}>
            <Box sx={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between',
                mb: 2
            }}>
                <Typography variant='h4' sx={{ mt: isMobile ? 6 : 1, fontWeight: 'bold' }}>Section ({selectedSection})</Typography>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        marginTop: isMobile ? 1 : 0,
                    }}
                >
                    <Select
                        value={selectedSection}
                        onChange={handleSectionChange}
                        sx={{
                            backgroundColor: 'white',
                            borderRadius: 2,
                            minWidth: isMobile ? '100%' : 150,
                            mt: isMobile ? 1 : 0,
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#818181',
                            },
                        }}
                        MenuProps={{
                            PaperProps: {
                                sx: {
                                    backgroundColor: 'white',
                                    borderRadius: 2,
                                    '& .MuiMenuItem-root': {
                                        borderBottom: '1px solid #f0f0f0', // Optional: Add border between items
                                    },
                                    '& .MuiMenuItem-root:hover': {
                                        backgroundColor: '#f0f0f0', // Optional: Change background color on hover
                                    },
                                },
                            },
                        }}
                    >
                        {sectionList.map((section) => (
                            <MenuItem key={section} value={section}>
                                {section === 'All' ? 'All Sections' : `Section ${section}`}
                            </MenuItem>
                        ))}
                    </Select>
                </Box>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }} align='center'>Question</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }} align='center'>No.</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }} align='center'>% Correct Answer A</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }} align='center'>% Correct Answer B</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }} align='center'>% Correct Answer C</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }} align='center'>% Correct Answer D</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredStudents.map((student, index) => (
                            <TableRow key={student.id}>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: isMobile ? 'column' : 'row' }}>
                                        {student.image && (
                                            <Avatar src={getImagePath(student.image)} alt={student.name} sx={{ width: 40, height: 40, marginBottom: isMobile ? 1 : 0, marginRight: isMobile ? 0 : 2 }} />
                                        )}
                                        {student.name}
                                    </Box>
                                </TableCell>
                                <TableCell>{student.section}</TableCell>
                                <TableCell>{student.totalPresent}</TableCell>
                                <TableCell>{student.totalLate}</TableCell>
                                <TableCell>{student.totalAbsent}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}

export default ItemAnalysis;
