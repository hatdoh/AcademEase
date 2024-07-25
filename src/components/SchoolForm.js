import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { Link } from 'react-router-dom';
import { FaPrint } from "react-icons/fa";
import { MdDelete, MdDateRange } from "react-icons/md";
import { FaEdit } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { MdArrowUpward, MdArrowDownward } from 'react-icons/md';

function SchoolForm() {
    const [selectedSection, setSelectedSection] = useState('All');
    const [sectionList, setSectionList] = useState(['All']);
    const [students, setStudents] = useState([]);
    const [user, setUser] = useState(null);
    const [sortColumn, setSortColumn] = useState('LName');
    const [sortDirection, setSortDirection] = useState('asc'); // 'asc' or 'desc'


    const [modalIsOpen, setModalIsOpen] = useState(false);

    
    const [formData, setFormData] = useState({
        schoolID: '',
        schoolYear: '',
        schoolName: '',
        gradeLevel: '',
        section: '',
        month: new Date(),
        nameOfLearner: '',
        totalDaysAbsent: '',
        totalDaysTardy: '',
        remarks: ''
    });
    const [savedForms, setSavedForms] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [currentFormIndex, setCurrentFormIndex] = useState(null);

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

                    const sectionsCollection = collection(db, 'sections');
                    const sectionSnapshot = await getDocs(sectionsCollection);
                    const sections = ['All', ...new Set(sectionSnapshot.docs.map((doc) => doc.data().section))];
                    setSectionList(sections);
                } catch (error) {
                    console.error('Error fetching data:', error);
                }
            };

            fetchStudentsAndSections();
        }
    }, [user]);

    const handleSectionChange = (section) => {
        setSelectedSection(section);
    };

    const handleSort = (columnName) => {
        if (sortColumn === columnName) {
            // Toggle sort direction
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            // Sort by the selected column in ascending order by default
            setSortColumn(columnName);
            setSortDirection('asc');
        }
    };

    const filteredStudents = students.filter((student) => {
        return selectedSection === 'All' || student.section === selectedSection;
    });

    const sortedStudents = [...filteredStudents].sort((a, b) => {
        if (sortColumn === 'LName') {
            const fullNameA = `${a.LName}, ${a.FName} ${a.MName}`;
            const fullNameB = `${b.LName}, ${b.FName} ${b.MName}`;
            return sortDirection === 'asc' ? fullNameA.localeCompare(fullNameB) : fullNameB.localeCompare(fullNameA);
        }
        return 0;
    });

    const maleStudents = sortedStudents.filter(student => student.gender === 'M' || student.gender === 'Male');
    const femaleStudents = sortedStudents.filter(student => student.gender === 'F' || student.gender === 'Female');
    const sortedAndFilteredStudents = [...maleStudents, ...femaleStudents];

    if (!user) {
        return <div>Please log in to view the student data.</div>;
    }

    const renderSortIcon = (columnName) => {
        if (sortColumn === columnName) {
            return (
                <span className="ml-1">
                    {sortDirection === 'asc' ? (
                        <MdArrowUpward className="inline-block w-4 h-4 text-gray-500" />
                    ) : (
                        <MdArrowDownward className="inline-block w-4 h-4 text-gray-500" />
                    )}
                </span>
            );
        }
        return null;
    };

    const getFullName = (student) => {
        return `${student.LName}, ${student.FName} ${student.MName}`;
    };

    const handleInputChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
    };

    const handleDateChange = (date) => {
        setFormData({ ...formData, month: date });
    };

    const openModal = (index = null) => {
        if (index !== null) {
            setIsEditing(true);
            setCurrentFormIndex(index);
            setFormData(savedForms[index]);
        } else {
            setIsEditing(false);
            setCurrentFormIndex(null);
            setFormData({
                schoolID: '',
                schoolYear: '',
                schoolName: '',
                gradeLevel: '',
                section: '',
                month: new Date(),
                nameOfLearner: '',
                totalDaysAbsent: '',
                totalDaysTardy: '',
                remarks: ''
            });
        }
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
    };

    const saveData = () => {
        if (isEditing) {
            const updatedForms = [...savedForms];
            updatedForms[currentFormIndex] = formData;
            setSavedForms(updatedForms);
        } else {
            setSavedForms([...savedForms, formData]);
        }
        closeModal();
    };

    const deleteForm = (index) => {
        const updatedForms = savedForms.filter((_, i) => i !== index);
        setSavedForms(updatedForms);
    };

    const downloadForm = (form) => {
        const element = document.createElement("a");
        const file = new Blob([JSON.stringify(form, null, 2)], { type: 'application/json' });
        element.href = URL.createObjectURL(file);
        element.download = `SF2-${form.schoolID}-${form.schoolYear}-${form.month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}.json`;
        document.body.appendChild(element);
        element.click();
    };

        // cons to get holidays for any given year
        const holidays = {
            1: [1], // January
            2: [25], // February
            4: [9, 17, 18], // April
            5: [1], // May
            8: [21, 26], // August
            12: [8, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31] // December
        };
        
    
        const renderDaysOfWeek = () => {
            const daysOfWeek = ['M', 'T', 'W', 'TH', 'F'];
            const firstDayOfMonth = new Date(formData.month.getFullYear(), formData.month.getMonth(), 1);
            const lastDayOfMonth = new Date(formData.month.getFullYear(), formData.month.getMonth() + 1, 0);
            const days = [];
        
            for (let day = firstDayOfMonth.getDate(); day <= lastDayOfMonth.getDate(); day++) {
                const currentDate = new Date(formData.month.getFullYear(), formData.month.getMonth(), day);
                const dayOfWeek = currentDate.getDay();
        
                // Check if the current date is a holiday
                if (!holidays[formData.month.getMonth() + 1]?.includes(day)) {
                    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                        days.push(<td key={day} className='p-2 text-center'>{daysOfWeek[dayOfWeek - 1]}</td>);
                    } else {
                        days.push(<td key={day} className='p-2 text-center'></td>);
                    }
                }
            }
        
            return days;
        };
        
        const renderNoDaysOfWeek = () => {
            const daysOfWeek = ['M', 'T', 'W', 'TH', 'F'];
            const firstDayOfMonth = new Date(formData.month.getFullYear(), formData.month.getMonth(), 1);
            const lastDayOfMonth = new Date(formData.month.getFullYear(), formData.month.getMonth() + 1, 0);
            const days = [];
        
            for (let day = firstDayOfMonth.getDate(); day <= lastDayOfMonth.getDate(); day++) {
                const currentDate = new Date(formData.month.getFullYear(), formData.month.getMonth(), day);
                const dayOfWeek = currentDate.getDay();
        
                // Check if the current date is a holiday
                if (!holidays[formData.month.getMonth() + 1]?.includes(day)) {
                    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                        days.push(
                            <th key={day} className='p-2 text-center'>
                                {day}
                            </th>
                        );
                    } else {
                        days.push(
                            <th key={day} className='p-2 text-center'>
                                {daysOfWeek[dayOfWeek - 1]}
                            </th>
                        );
                    }
                }
            }
        
            return days;
        };
        

    const handleSchoolYearChange = (e) => {
        const value = e.target.value;
        if (/^\d{0,4}(-\d{0,4})?$/.test(value)) {
            setFormData({ ...formData, schoolYear: value });
        }
    };


    return (
        <div className="ml-80 p-4">
            <h2 className="text-2xl font-semibold mb-4">School Form 2 (SF2) Daily Attendance Report of Learners</h2>
                <div className="rounded-lg w-full border-gray-700 max-w-5xl">
                    <form className='flex justify-left'>
                        <div className="flex flex-nowrap">
                            <label className="block mb-2 mt-3 mr-5">School ID</label>
                            <input
                                type="text"
                                className="rounded-lg border h-12 px-5 w-40 mb-4"
                                value={"301906"}
                                
                            />
                        </div>
                        <div className="flex flex-nowrap ml-10">
                            <label className="block mb-2 mt-3 mr-5">School Year</label>
                            <input
                                type="text"
                                className="rounded-lg border px-2 h-12 w-40 mb-4"
                                placeholder="YYYY-YYYY"
                                value={formData.schoolYear}
                                onChange={handleSchoolYearChange}
                            />
                        </div>
                        <div className="flex flex-nowrap ml-10">
                            <label className="block mb-2 mt-3 mr-5">Report for the Month of</label>
                            <DatePicker
                                selected={formData.month}
                                onChange={date => handleDateChange(date)}
                                dateFormat="MMMM yyyy"
                                showMonthYearPicker
                                className="rounded-lg border px-2 h-12 w-40 mb-4"
                            />
                        </div>

                    </form>
                    <form className='flex justify-left'>
                        <div className="flex flex-nowrap">
                            <label className="block mb-2 mt-3 mr-5">Name of School</label>
                            <input
                                type="text"
                                className="rounded-lg border px-2 h-12 w-60 mb-4"
                                value={"Moreno Integrated School"}       
                            />
                        </div>
                        <div className="flex flex-nowrap ml-10">
                            <label className="block mb-2 mt-3 mr-5">Grade Level</label>
                            <select
                                value={formData.gradeLevel || 9}
                                onChange={(e) => handleInputChange('gradeLevel', e.target.value)}
                                className="rounded-lg border px-2 h-12 pl-6 w-20 mb-4"
                            >
                                {[...Array(4)].map((_, index) => (
                                        <option key={index + 7} value={index + 7}>{index + 7}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-nowrap ml-10">
                        <select
                            className="mt-1 mr-3 h-12 block w-40 px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            value={selectedSection}
                            onChange={(e) => handleSectionChange(e.target.value)}
                        >
                            {sectionList.map((section) => (
                                <option key={section} value={section}>
                                    {section === 'All' ? 'All Sections' : `Section ${section}`}
                                </option>
                            ))}
                        </select>
                        </div>
                    </form>
                    <div className='overflow-x-auto'>
                        <div className="bg-white overflow-y-auto max-h-full h-96 w-full">
                            <table className="min-w-full w-full h-lvh bg-white divide-x border border-gray-200 shadow-lg rounded-lg overflow-hidden">
                            <thead className='text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-400'>
                                <tr className='bg-white ml-full'>
                                    <label className='flex flex-nowrap flex-row-reverse items-center font-bold text-sm ml-96 bg-white text-center w-5/6'>
                                        (1st row for date)
                                    </label>
                                </tr>
                                <tr className='border-y-2 border-black'>
                                    <th className="w-20 text-sm border-x-2 border-black" rowSpan="2">LEARNER'S NAME <br />(Last Name, First Name, Middle Name)</th>
                                    {renderNoDaysOfWeek()}
                                    <th className='p-2 text-sm border-x-2 border-black' colSpan="2">Total for the month</th>
                                    <th className='px-7 w-full text-center text-sm border-x-2 border-black' rowSpan="2">REMARKS</th>
                                </tr>
                                <tr className='border-y-2 border-black'>
                                    {renderDaysOfWeek()}
                                    <th className='px-7 text-sm border-x-2 border-black'>ABSENT</th>
                                    <th className='px-7 text-sm border-x-2 border-black'>TARDY</th>
                                </tr>
                            </thead>
                            <tbody className='bg-white h-lvh'>
                            {sortedAndFilteredStudents.map((student) => (
                                <tr key={student.id}>
                                    <td className="h-6 px-10 border-x-2 border-black border-y-2 border-black text-sm">
                                        {getFullName(student)}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                            </table>
                        </div>
                    </div>
                    <div className='overflow-x-auto mt-10'>
                        <div className="bg-white overflow-y-auto max-h-96 w-80"></div>
                        <table className='min-w-full w-80 max-h-full bg-white border border-gray-200 shadow-lg rounded-lg overflow-hidden'>
                                <thead className='text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-400'>   
                                    <tr>
                                        <th className='py-3 pr-10 text-center'>Month: <br></br> No of Days of Classes:</th>
                                        <th className='py-3 px-4'>M</th>
                                        <th className='py-3 px-4'>F</th>
                                        <th className='py-3 px-8'>Total</th>
                                    </tr>
                                    <tr>
                                        <th className='bg-white py-2 px-10'>* Enrolment as of (1st Friday of June)</th>
                                        
                                    </tr>
                                    <tr>
                                        <th className='bg-white py-2 px-10'>Late Enrollment during the month (beyond cut-off)</th>
                                    </tr>
                                    <tr>
                                        <th className='bg-white py-2 px-10'>Registered Learners as of end of the month</th>
                                    </tr>
                                    <tr>
                                        <th className='bg-white py-2 px-10'>Percentage of Enrolment as of end of the month</th>
                                    </tr>
                                    <tr>
                                        <th className='bg-white py-2 px-10'>Average Daily Attendance</th>
                                    </tr>
                                    <tr>
                                        <th className='bg-white py-2 px-10'>Percentage of Attendance for the month</th>
                                    </tr>
                                    <tr>
                                        <th className='bg-white py-2 px-10'>Number of students absent for 5 consecutive days:</th>
                                    </tr>
                                    <tr>
                                        <th className='bg-white py-2 px-10'>Drop out</th>
                                    </tr>
                                    <tr>
                                        <th className='bg-white py-2 px-10'>Transferred out</th>
                                    </tr>
                                    <tr>
                                        <th className='bg-white py-2 px-10'>Transferred in</th>
                                    </tr>

                                </thead>
                            </table>
                        </div>
                    <div className="flex justify-end space-x-4 mt-4">
                        <button onClick={saveData} className='w-24 h-10 text-center shadow-sm py-2 rounded-md bg-blue-500 font-medium text-2xl text-white hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-offset-2 focus:ring-blue-500 sm:ml-4 sm:text-sm'>
                            Save
                        </button>
                        <Link
                            to="/attendance-summary"
                            className="inline-block rounded border-2 border-neutral-400 bg-neutral-100 px-4 py-2 mr-3 text-xs font-medium leading-normal text-neutral-600 shadow-light-3 transition duration-150 ease-in-out hover:bg-neutral-200 hover:shadow-light-2 focus:bg-neutral-200 focus:shadow-light-2 focus:outline-none focus:ring-0 active:bg-neutral-200 active:shadow-light-2 motion-reduce:transition-none dark:shadow-black/30 dark:hover:shadow-dark-strong dark:focus:shadow-dark-strong dark:active:shadow-dark-strong"
                        >
                            Cancel
                        </Link>
                    </div>
                </div>
        </div>
    );
}

export default SchoolForm;
