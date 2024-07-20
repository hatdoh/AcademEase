import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import Swal from 'sweetalert2';
import { FaEdit, FaTrash } from 'react-icons/fa';

function AddSection() {
    const [section, setSection] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [day, setDay] = useState('Monday'); // Default day
    const [acadYear, setAcadYear] = useState('');
    const [sections, setSections] = useState([]);
    const [editingSectionId, setEditingSectionId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSections = async () => {
            const sectionsCollection = collection(db, 'sections');
            const sectionSnapshot = await getDocs(sectionsCollection);
            const sectionList = sectionSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setSections(sectionList);
        };

        fetchSections();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault(); // Prevent default form submission

        if (acadYear.trim() === '') {
            Swal.fire({
                icon: 'error',
                title: 'Ooops...',
                text: 'Please enter the Academic Year!',
            });
            return;
        }

        if (section.trim() === '') {
            Swal.fire({
                icon: 'error',
                title: 'Ooops...',
                text: 'Please enter a section name!',
            });
            return;
        }

        if (editingSectionId) {
            // Update existing section
            try {
                const sectionDoc = doc(db, 'sections', editingSectionId);
                await updateDoc(sectionDoc, {
                    section,
                    startTime,
                    endTime,
                    day,
                    acadYear,
                });

                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Section updated successfully!',
                });

                const updatedSections = sections.map(sec => sec.id === editingSectionId ? { ...sec, section, startTime, endTime, day, acadYear } : sec);
                setSections(updatedSections);
                setEditingSectionId(null);
                setSection('');
                setStartTime('');
                setEndTime('');
                setDay('Monday');
                setAcadYear('');
            } catch (error) {
                console.error('Error updating section:', error);

                Swal.fire({
                    icon: 'error',
                    title: 'Ooops...',
                    text: 'Failed to update section. Please try again.',
                });
            }
        } else {
            // Add new section
            const { value: confirmAdd } = await Swal.fire({
                icon: 'question',
                title: 'Are you sure?',
                text: 'Do you want to add this section?',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, add it!',
            });

            if (!confirmAdd) {
                return;
            }

            try {
                const sectionsCollection = collection(db, 'sections');
                const docRef = await addDoc(sectionsCollection, {
                    section,
                    startTime,
                    endTime,
                    day,
                    acadYear,
                });

                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Section added successfully!',
                });

                setSections([...sections, { id: docRef.id, section, startTime, endTime, day, acadYear }]);
                setSection('');
                setStartTime('');
                setEndTime('');
                setDay('Monday');
                setAcadYear('');
            } catch (error) {
                console.error('Error adding section:', error);

                Swal.fire({
                    icon: 'error',
                    title: 'Ooops...',
                    text: 'Failed to add section. Please try again.',
                });
            }
        }
    };

    const handleEdit = (section) => {
        setEditingSectionId(section.id);
        setSection(section.section);
        setStartTime(section.startTime);
        setEndTime(section.endTime);
        setDay(section.day);
        setAcadYear(section.acadYear);
    };

    const handleDelete = async (sectionId) => {
        const { value: confirmDelete } = await Swal.fire({
            icon: 'warning',
            title: 'Are you sure?',
            text: 'Do you want to delete this section?',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
        });

        if (!confirmDelete) {
            return;
        }

        try {
            await deleteDoc(doc(db, 'sections', sectionId));

            Swal.fire({
                icon: 'success',
                title: 'Deleted!',
                text: 'Section has been deleted.',
            });

            const updatedSections = sections.filter(sec => sec.id !== sectionId);
            setSections(updatedSections);
        } catch (error) {
            console.error('Error deleting section:', error);

            Swal.fire({
                icon: 'error',
                title: 'Ooops...',
                text: 'Failed to delete section. Please try again.',
            });
        }
    };

    const convertTo12HourFormat = (time) => {
        const [hours, minutes] = time.split(':');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const hours12 = hours % 12 || 12;
        return `${hours12}:${minutes} ${ampm}`;
    };

    return (
        <div className="ml-80 p-4">
            <h2 className="text-2xl font-semibold mb-4">{editingSectionId ? 'Edit Section' : 'Add Section'}</h2>
            <form className="space-y-4" onSubmit={handleSave}>
                <div>
                    <label htmlFor="acadYear" className="block font-medium">Academic Year</label>
                    <input
                        type="text"
                        name="acadYear"
                        id="acadYear"
                        value={acadYear}
                        placeholder="Enter Academic Year (YYYY-YYYY)"
                        onChange={(e) => setAcadYear(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
                <div>
                    <label htmlFor="section" className="block font-medium">Section Name</label>
                    <input
                        type="text"
                        name="section"
                        id="section"
                        value={section}
                        placeholder="Enter Section Name"
                        onChange={(e) => setSection(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
                <div className="flex space-x-4">
                    <div className="w-1/2">
                        <label htmlFor="startTime" className="block font-medium">Start Time</label>
                        <input
                            type="time"
                            name="startTime"
                            id="startTime"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                    <div className="w-1/2">
                        <label htmlFor="endTime" className="block font-medium">End Time</label>
                        <input
                            type="time"
                            name="endTime"
                            id="endTime"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                </div>
                <div>
                    <label htmlFor="day" className="block font-medium">Day</label>
                    <select
                        name="day"
                        id="day"
                        value={day}
                        onChange={(e) => setDay(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                        <option value="Monday">Monday</option>
                        <option value="Tuesday">Tuesday</option>
                        <option value="Wednesday">Wednesday</option>
                        <option value="Thursday">Thursday</option>
                        <option value="Friday">Friday</option>
                    </select>
                </div>
                <div className="flex items-center">
                    <button
                        type="submit"
                        className="inline-flex justify-center rounded-md border-2 border-blue-600 bg-blue-500 px-4 py-2 mr-3 text-sm font-medium text-white hover:bg-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    >
                        {editingSectionId ? 'Update' : 'Add'}
                    </button>
                    <Link
                        to="/sections"
                        className="inline-block rounded border-2 border-neutral-400 bg-neutral-100 px-4 py-2 mr-3 text-xs font-medium leading-normal text-neutral-600 shadow-light-3 transition duration-150 ease-in-out hover:bg-neutral-200 hover:shadow-light-2 focus:bg-neutral-200 focus:shadow-light-2 focus:outline-none focus:ring-0 active:bg-neutral-200 active:shadow-light-2 motion-reduce:transition-none dark:shadow-black/30 dark:hover:shadow-dark-strong dark:focus:shadow-dark-strong dark:active:shadow-dark-strong"
                    >
                        Cancel
                    </Link>
                </div>
            </form>

            <div className="mt-6">
                <h3 className="text-xl font-semibold mb-4">Added Sections</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 shadow-lg rounded-lg overflow-hidden">
                        <thead className="text-xs text-gray-500 bg-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-center uppercase">Section Name</th>
                                <th className="px-6 py-3 text-center uppercase">Day</th>
                                <th className="px-6 py-3 text-center uppercase">Time Started</th>
                                <th className="px-6 py-3 text-center uppercase">Time End</th>
                                <th className="px-6 py-3 text-center uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {sections.map((section) => (
                                <tr key={section.id} className="hover:bg-gray-100">
                                    <td className="px-6 py-4 text-center whitespace-nowrap">{section.section}</td>
                                    <td className="px-6 py-4 text-center whitespace-nowrap">{section.day}</td>
                                    <td className="px-6 py-4 text-center whitespace-nowrap">{convertTo12HourFormat(section.startTime)}</td>
                                    <td className="px-6 py-4 text-center whitespace-nowrap">{convertTo12HourFormat(section.endTime)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap flex justify-center items-center space-x-2">
                                        <FaEdit
                                            className="cursor-pointer text-blue-600"
                                            onClick={() => handleEdit(section)}
                                        />
                                        <FaTrash
                                            className="cursor-pointer text-red-600"
                                            onClick={() => handleDelete(section.id)}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default AddSection;
