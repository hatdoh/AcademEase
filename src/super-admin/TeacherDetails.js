import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Box, Typography, CircularProgress, Avatar } from '@mui/material';

function TeacherDetails() {
    const { id } = useParams();
    const [teacher, setTeacher] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTeacher = async () => {
            try {
                const docRef = doc(db, 'teachers-info', id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setTeacher(docSnap.data());
                } else {
                    console.log("No such document!");
                }
                setLoading(false);
            } catch (error) {
                console.error('Error fetching teacher:', error);
                setLoading(false);
            }
        };

        fetchTeacher();
    }, [id]);

    if (loading) {
        return <CircularProgress />;
    }

    if (!teacher) {
        return <Typography variant="h6">Teacher not found</Typography>;
    }

    return (
        <Box sx={{ padding: 2 }}>
            {teacher.image && (
                <Avatar src={teacher.image} alt={teacher.firstName} sx={{ width: 120, height: 120, mb: 2 }} />
            )}
            <Typography variant="h4" gutterBottom>
                {`${teacher.firstName} ${teacher.middleName} ${teacher.lastName}`.trim()}
            </Typography>
            <Typography variant="body1"><strong>Email:</strong> {teacher.email}</Typography>
            <Typography variant="body1"><strong>Subject:</strong> {teacher.subject}</Typography>
            {/* Add more details here as needed */}
        </Box>
    );
}

export default TeacherDetails;
