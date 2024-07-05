import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import Swal from 'sweetalert2';

function StudentProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [student, setStudent] = useState({});

    useEffect(() => {
        const fetchStudent = async () => {
            try {
                const docRef = doc(db, "students", id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setStudent(docSnap.data());
                } else {
                    console.error("No such document!");
                }
            } catch (error) {
                console.error("Error fetching student:", error);
            }
        };

        fetchStudent();
    }, [id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setStudent((prevStudent) => ({
            ...prevStudent,
            [name]: value,
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setStudent((prevStudent) => ({
                ...prevStudent,
                image: URL.createObjectURL(file),
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Validation for Contact Number
            if (!/^09\d{9}$/.test(student.contactNumber)) {
                throw new Error('Invalid contact number format. It should start with "09".');
            }

            // Validation for Age
            if (isNaN(student.age) || student.age <= 0) {
                throw new Error('Age should be a valid number.');
            }

            const docRef = doc(db, "students", id);
            await updateDoc(docRef, student);
            Swal.fire('Success', 'Student details updated successfully', 'success');
        } catch (error) {
            console.error("Error updating student:", error.message);
            Swal.fire('Error', error.message, 'error');
        }
    };

    const getImagePath = (imagePath) => {
        try {
            return require(`../res/img/${imagePath}`);
        } catch (e) {
            return '';
        }
    };

    return (
        <div className="container mx-auto p-5">
            <h2 className="text-2xl font-bold mb-4">Student Profile</h2>
            <div className="">
                <div className="mb-4">
                    <label className="mb-2 font-medium">Image</label>
                    <input type="file" onChange={handleImageChange} className="mt-1 block w-full" />
                    {student.image && <img src={getImagePath(student.image)} alt={student.FName} className="mt-2 h-15 w-15 object-cover" />}
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="mb-2 font-medium">Last Name</label>
                            <input type="text" name="LName" value={student.LName || ''} onChange={handleInputChange} className="p-2 border border-gray-300 rounded-md w-full" />
                        </div>
                        <div>
                            <label className="mb-2 font-medium">First Name</label>
                            <input type="text" name="FName" value={student.FName || ''} onChange={handleInputChange} className="p-2 border border-gray-300 rounded-md w-full" />
                        </div>
                        <div>
                            <label className="mb-2 font-medium">Middle Name</label>
                            <input type="text" name="MName" value={student.MName || ''} onChange={handleInputChange} className="p-2 border border-gray-300 rounded-md w-full" />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4 mt-4">
                        <div>
                            <label className="mb-2 font-medium">Date of Birth</label>
                            <input type="date" name="dob" value={student.dob || ''} onChange={handleInputChange} className="p-2 border border-gray-300 rounded-md w-full" />
                        </div>
                        <div>
                            <label className="mb-2 font-medium">Gender</label>
                            <input type="text" name="gender" value={student.gender || ''} onChange={handleInputChange} className="p-2 border border-gray-300 rounded-md w-full" />
                        </div>
                        <div>
                            <label className="mb-2 font-medium">Age</label>
                            <input type="text" name="age" value={student.age || ''} onChange={handleInputChange} className="p-2 border border-gray-300 rounded-md w-full" />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4 mt-4">
                        <div>
                            <label className="mb-2 font-medium">Address</label>
                            <input type="text" name="address" value={student.address || ''} onChange={handleInputChange} className="p-2 border border-gray-300 rounded-md w-full" />
                        </div>
                        <div>
                            <label className="mb-2 font-medium">Email Address</label>
                            <input type="text" name="emailAddress" value={student.emailAddress || ''} onChange={handleInputChange} className="p-2 border border-gray-300 rounded-md w-full" />
                        </div>
                        <div>
                            <label className="mb-2 font-medium">Contact Number</label>
                            <input type="text" name="contactNumber" value={student.contactNumber || ''} onChange={handleInputChange} className="p-2 border border-gray-300 rounded-md w-full" maxLength='11'/>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4 mt-4">
                        <div>
                            <label className="mb-2 font-medium">Grade</label>
                            <input type="text" name="grade" value={student.grade || ''} onChange={handleInputChange} className="p-2 border border-gray-300 rounded-md w-full" />
                        </div>
                        <div>
                            <label className="mb-2 font-medium">Section</label>
                            <input type="text" name="section" value={student.section || ''} onChange={handleInputChange} className="p-2 border border-gray-300 rounded-md w-full" />
                        </div>
                    </div>

                    <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md">Save</button>
                </form>
            </div>
        </div>
    );
}

export default StudentProfile;
