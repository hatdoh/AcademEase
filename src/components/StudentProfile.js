import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, storage } from '../config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Swal from 'sweetalert2';
import { MdEdit } from "react-icons/md";

function StudentProfile() {
    const { id } = useParams();
    const [student, setStudent] = useState({});
    const [imageFile, setImageFile] = useState(null);
    const [isEditingImage, setIsEditingImage] = useState(false);

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
            if (!file.type.startsWith('image/')) {
                Swal.fire('Error', 'Please upload an image file (JPEG, PNG, GIF)', 'error');
                return;
            }

            setImageFile(file);
            setStudent((prevStudent) => ({
                ...prevStudent,
                image: URL.createObjectURL(file),
            }));
        }
    };

    const handleImageEditToggle = () => {
        setIsEditingImage(true); // Set editing mode to true to show the file input
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

            // Upload image to Firebase Storage if there's a new file selected
            let imageUrl = student.image;
            if (imageFile) {
                const storageRef = ref(storage, `students/${id}/${imageFile.name}`);
                await uploadBytes(storageRef, imageFile);
                imageUrl = await getDownloadURL(storageRef);
            }

            const updatedStudent = {
                ...student,
                image: imageUrl,
            };

            const docRef = doc(db, "students", id);
            await updateDoc(docRef, updatedStudent);
            Swal.fire('Success', 'Student details updated successfully', 'success');
            setIsEditingImage(false); // Close editing mode after successful update
        } catch (error) {
            console.error("Error updating student:", error.message);
            Swal.fire('Error', error.message, 'error');
        }
    };

    return (
        <div className="ml-80 p-4">
            <div className="">
                <h2 className='text-2xl font-bold mb-2'> Student Profile</h2>
                <div className="mb-4 flex items-center">
                    {student.image && !isEditingImage ? (
                        <>
                            <img src={student.image} alt={student.FName} className="mt-2 h-[110px] w-[110px] object-cover rounded-full" />
                            <div className="ml-2">
                                <p className="font-bold text-lg">{`${student.FName} ${student.MName} ${student.LName}`}</p>
                                <button onClick={handleImageEditToggle} className="flex items-center border-2 border-gray-600 bg-neutral-100 text-black px-2 py-1 rounded-md mt-1"><MdEdit className='mr-1' />Edit</button>
                            </div>
                        </>
                    ) : (
                        <input type="file" onChange={handleImageChange} className="mt-1 block w-full" />
                    )}
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
                            <input type="date" name="dateOfBirth" value={student.dateOfBirth || ''} onChange={handleInputChange} className="p-2 border border-gray-300 rounded-md w-full" />
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
                            <input type="text" name="contactNumber" value={student.contactNumber || ''} onChange={handleInputChange} className="p-2 border border-gray-300 rounded-md w-full" maxLength='11' />
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