import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { db } from '../config/firebase';
import { collection, writeBatch, doc } from 'firebase/firestore';
import { getCurrentUser } from '../utils/Authentication';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Card, CardContent, Typography, Button, Box, Input
} from '@mui/material';
import Swal from 'sweetalert2';

function RegisterStudents() {
    const [studentsData, setStudentsData] = useState([]);
    const [fileUploaded, setFileUploaded] = useState(false);
    const [teacherUID, setTeacherUID] = useState(null);

    useEffect(() => {
        // Get the current user's UID
        const user = getCurrentUser();
        if (user) {
            setTeacherUID(user.uid); // Set the teacherUID
        }
    }, []);

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];

            // Get the section and academic year from cells
            const section = worksheet['X6'] ? worksheet['X6'].v : "";
            const acadYear = worksheet['P6'] ? worksheet['P6'].v : "";
            const grade = worksheet['U6'] ? String(worksheet['U6'].v) : "";

            // Initialize an array to store all student recordsz
            const parsedStudents = [];

            // Loop through rows 10 to 30 to get students' data
            for (let row = 10; row <= 30; row++) {
                // Handle Date of Birth (check if it's an Excel date serial number)
                let rawDateOfBirth = worksheet[`H${row}`] ? worksheet[`H${row}`].v : "";
                let formattedDateOfBirth = "";

                if (rawDateOfBirth) {
                    // If it's a number, it might be an Excel date serial number
                    if (typeof rawDateOfBirth === 'number') {
                        // Convert the Excel date serial number to a JavaScript Date object
                        const date = XLSX.utils.format_cell({ t: 'n', v: rawDateOfBirth });
                        formattedDateOfBirth = new Date(rawDateOfBirth - 25569) * 86400 * 1000; // Convert Excel's date serial number to JavaScript Date
                        formattedDateOfBirth = formattedDateOfBirth ? new Date(formattedDateOfBirth).toISOString().split('T')[0] : "Invalid Date"; // Format to YYYY-MM-DD
                    } else if (typeof rawDateOfBirth === 'string') {
                        // If it's a string (e.g., 06/04/2002), directly format it
                        const [month, day, year] = rawDateOfBirth.split('/');
                        const fullYear = year.length === 2 ? `20${year}` : year; // Assumes dates are in 21st century if given in 2-digit year format
                        formattedDateOfBirth = `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                    }
                }



                // Concatenate address fields from O to R with conditional handling for empty values
                const address = [
                    worksheet[`O${row}`] ? worksheet[`O${row}`].v : "",
                    worksheet[`P${row}`] ? worksheet[`P${row}`].v : "",
                    worksheet[`Q${row}`] ? worksheet[`Q${row}`].v : "",
                    worksheet[`R${row}`] ? worksheet[`R${row}`].v : ""
                ].filter(Boolean).join(', ');

                // Add a leading zero to contact number if it doesn't already have one
                let contactNumber = worksheet[`Z${row}`] ? worksheet[`Z${row}`].v.toString() : "";
                if (contactNumber && !contactNumber.startsWith("0")) {
                    contactNumber = "0" + contactNumber;
                }

                // Update the student object
                const student = {
                    lrn: worksheet[`B${row}`] ? String(worksheet[`B${row}`].v) : "",
                    LName: worksheet[`C${row}`] ? worksheet[`C${row}`].v.split(',')[0].trim() : "",
                    FName: worksheet[`C${row}`] ? worksheet[`C${row}`].v.split(',')[1].trim() : "",
                    MName: worksheet[`C${row}`] && worksheet[`C${row}`].v.split(',').length > 2 ? worksheet[`C${row}`].v.split(',')[2].trim() : "",
                    gender: worksheet[`G${row}`] ? worksheet[`G${row}`].v : "",
                    dateOfBirth: formattedDateOfBirth,
                    age: worksheet[`I${row}`] ? String(worksheet[`I${row}`].v) : "",
                    address: address,
                    grade: grade,
                    contactNumber: contactNumber,
                    section: section,
                    acadYear: acadYear,
                    teacherUID: teacherUID,
                    image: "",
                    emailAddress: ""
                };


                // Only add the student if LRN (or other unique field) is filled to avoid empty records
                if (student.lrn) {
                    parsedStudents.push(student);
                }
            }

            setStudentsData(parsedStudents);
            setFileUploaded(true); // Set file uploaded status for preview
        };
        reader.readAsArrayBuffer(file);
    };

    const handleImport = async () => {
        // SweetAlert2 confirmation prompt
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'You are about to import these students. Do you want to continue?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, import them!',
            cancelButtonText: 'Cancel',
        });

        if (result.isConfirmed) {
            try {
                const studentsCollection = collection(db, 'students');
                const batch = writeBatch(db);

                studentsData.forEach((student) => {
                    const studentDoc = {
                        lrn: student.lrn,
                        LName: student.LName,
                        FName: student.FName,
                        MName: student.MName,
                        gender: student.gender,
                        dateOfBirth: student.dateOfBirth,
                        age: student.age,
                        address: student.address,
                        grade: student.grade,
                        contactNumber: student.contactNumber,
                        section: student.section,
                        acadYear: student.acadYear,
                        teacherUID: teacherUID,
                        image: "",
                        emailAddress: "",
                    };

                    const newDocRef = doc(studentsCollection);
                    batch.set(newDocRef, studentDoc);
                });

                await batch.commit();
                Swal.fire('Success', 'Students successfully imported!', 'success');
            } catch (error) {
                console.error('Error importing students:', error);
                Swal.fire('Error', 'An error occurred during import. Check the console for more details.', 'error');
            }
        }
    };

    return (
        <Box sx={{ padding: 3 }}>
            <Card variant="outlined" sx={{ mb: 3, p: 3 }}>
                <Typography variant="h5" gutterBottom sx={{fontWeight: 'bold'}}>
                    Register Students
                </Typography>
                <Input
                    type="file"
                    onChange={handleFileUpload}
                    sx={{ display: 'block', mb: 2 }}
                />
                {fileUploaded && (
                    <Button variant="contained" onClick={handleImport} color="primary">
                        Import Students
                    </Button>
                )}
            </Card>

            {fileUploaded && (
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom sx={{fontWeight: 'bold'}}>
                            Preview
                        </Typography>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        {['LRN', 'Last Name', 'First Name', 'Middle Name', 'Gender', 'Date of Birth',  'Age', 'Contact Number', 'Grade', 'Section', 'School Year']
                                            .map((header) => (
                                                <TableCell key={header} align="center" sx={{fontWeight: 'bold'}}>
                                                    {header}
                                                </TableCell>
                                            ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {studentsData.map((student, index) => (
                                        <TableRow key={index}>
                                            <TableCell align='center'>{student.lrn}</TableCell>
                                            <TableCell align='center'>{student.LName}</TableCell>
                                            <TableCell align='center'>{student.FName}</TableCell>
                                            <TableCell align='center'>{student.MName}</TableCell>
                                            <TableCell align='center'>{student.gender}</TableCell>
                                            <TableCell align='center'>{student.dateOfBirth}</TableCell>
                                            <TableCell align='center'>{student.age}</TableCell>
                                            <TableCell align='center'>{student.contactNumber}</TableCell>
                                            <TableCell align='center'>{student.grade}</TableCell>
                                            <TableCell align='center'>{student.section}</TableCell>
                                            <TableCell align='center'>{student.acadYear}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </CardContent>
                </Card>
            )}
        </Box>
    );
}

export default RegisterStudents;
