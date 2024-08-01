import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaSort } from 'react-icons/fa';
import { MdAdd } from "react-icons/md";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';

function AttendanceSummary() {
    const [students, setStudents] = useState([]);
    const [selectedSection, setSelectedSection] = useState('All');
    const [selectedAttendanceSummary, setSelectedAttendanceSummary] = useState('Daily');
    const [sectionList, setSectionList] = useState(['All']); // Initial section list
    const [attendanceSummaryList] = useState(['Daily', 'Weekly', 'Monthly']); // Attendance summary list
    const [lateSortOrder, setLateSortOrder] = useState(null);
    const [absentSortOrder, setAbsentSortOrder] = useState(null);
    const [presentSortOrder, setPresentSortOrder] = useState(null); // New state for present sort order
    const [startDate, setStartDate] = useState(null); // State for start date
    const [endDate, setEndDate] = useState(null); // State for end date

    useEffect(() => {
        // Fetch attendance data from Firestore
        const fetchAttendanceData = async () => {
            const attendanceCollection = collection(db, 'attendance');
            let attendanceQuery = attendanceCollection;

            if (startDate && endDate) {
                attendanceQuery = query(attendanceCollection,
                    where('date', '>=', startDate),
                    where('date', '<=', endDate)
                );
            }

            const querySnapshot = await getDocs(attendanceQuery);
            const attendanceData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));

            // Calculate totalLate, totalAbsent, and totalPresent based on 'remarks'
            const studentData = attendanceData.reduce((acc, record) => {
                const { id, FName, LName, MName, section, remarks, image } = record;
                const key = `${LName} ${FName} ${MName}-${section}`;

                if (!acc[key]) {
                    acc[key] = {
                        id,
                        name: `${LName}, ${FName} ${MName}`,
                        section,
                        image: image || 'defaultImageURL', // Use actual image URL or a default one
                        totalLate: 0,
                        totalAbsent: 0,
                        totalPresent: 0,
                    };
                }

                if (remarks === 'late') acc[key].totalLate += 1;
                if (remarks === 'absent') acc[key].totalAbsent += 1;
                if (remarks === 'present') acc[key].totalPresent += 1; // Increment totalPresent if 'present'

                return acc;
            }, {});

            setStudents(Object.values(studentData));
        };

        // Fetch section data from Firestore
        const fetchSectionData = async () => {
            const querySnapshot = await getDocs(collection(db, 'sections'));
            const sections = querySnapshot.docs.map(doc => doc.data().section);
            setSectionList(['All', ...sections]);
        };

        fetchAttendanceData();
        fetchSectionData();
    }, [startDate, endDate]);

    const handleSectionChange = (section) => {
        setSelectedSection(section);
    };

    const handleAttendanceSummaryChange = (summary) => {
        setSelectedAttendanceSummary(summary);
    };

    const filterByAttendanceSummary = (student, summary) => {
        switch (summary) {
            case 'Daily':
                return student.totalLate <= 1 && student.totalAbsent <= 1;
            case 'Weekly':
                return student.totalLate <= 5 && student.totalAbsent <= 5;
            case 'Monthly':
                return student.totalLate <= 25 && student.totalAbsent <= 25;
            default:
                return true;
        }
    };

    const sortByLate = () => {
        const sortedStudents = [...students];
        if (lateSortOrder === null || lateSortOrder === 'desc') {
            setLateSortOrder('asc');
            sortedStudents.sort((a, b) => a.totalLate - b.totalLate);
        } else {
            setLateSortOrder('desc');
            sortedStudents.sort((a, b) => b.totalLate - a.totalLate);
        }
        setStudents(sortedStudents);
    };

    const sortByAbsent = () => {
        const sortedStudents = [...students];
        if (absentSortOrder === null || absentSortOrder === 'desc') {
            setAbsentSortOrder('asc');
            sortedStudents.sort((a, b) => a.totalAbsent - b.totalAbsent);
        } else {
            setAbsentSortOrder('desc');
            sortedStudents.sort((a, b) => b.totalAbsent - a.totalAbsent);
        }
        setStudents(sortedStudents);
    };

    const sortByPresent = () => {
        const sortedStudents = [...students];
        if (presentSortOrder === null || presentSortOrder === 'desc') {
            setPresentSortOrder('asc');
            sortedStudents.sort((a, b) => a.totalPresent - b.totalPresent);
        } else {
            setPresentSortOrder('desc');
            sortedStudents.sort((a, b) => b.totalPresent - a.totalPresent);
        }
        setStudents(sortedStudents);
    };

    const filteredStudents = students.filter(student =>
        (selectedSection === 'All' || student.section === selectedSection) &&
        filterByAttendanceSummary(student, selectedAttendanceSummary)
    );

    const sectionCounts = sectionList.reduce((counts, section) => {
        counts[section] = students.filter(student => student.section === section).length;
        return counts;
    }, {});

    return (
        <div className="ml-80 p-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                    <h2 className="text-2xl ml-2 font-semibold text-gray-800">Section ({selectedSection})</h2>
                </div>
                <div className="flex items-center space-x-4">
                    <DatePicker
                        selected={startDate}
                        onChange={(date) => setStartDate(date)}
                        selectsStart
                        startDate={startDate}
                        endDate={endDate}
                        placeholderText="From"
                        className="mt-1 block w-40 px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                    <DatePicker
                        selected={endDate}
                        onChange={(date) => setEndDate(date)}
                        selectsEnd
                        startDate={startDate}
                        endDate={endDate}
                        minDate={startDate}
                        placeholderText="To"
                        className="mt-1 block w-40 px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                    <select
                        className="mt-1 block w-40 px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        value={selectedSection}
                        onChange={(e) => handleSectionChange(e.target.value)}
                    >
                        {sectionList.map((section) => (
                            <option key={section} value={section}>{section === 'All' ? 'All Sections' : `Section ${section}`}</option>
                        ))}
                    </select>
                    {/*<select
                        className="mt-1 block w-40 px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        value={selectedAttendanceSummary}
                        onChange={(e) => handleAttendanceSummaryChange(e.target.value)}
                    >
                        {attendanceSummaryList.map((summary) => (
                            <option key={summary} value={summary}>{summary}</option>
                        ))}
                    </select>*/}
                    <Link
                        to="/school-form"
                        className="flex items-center px-3 py-2 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    >
                        Create SF2 <MdAdd className="w-5 h-5 mr-1 ml-2" />
                    </Link>
                </div>
            </div>

            <div className="overflow-x-auto">
                <div className="overflow-y-auto">
                    <table className="min-w-full bg-white border border-gray-200 shadow-lg rounded-lg overflow-hidden">
                        <thead className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th className="px-6 py-3 text-left uppercase">Name</th>
                                <th className="px-6 py-3 text-center uppercase">Section</th>
                                <th className="px-6 py-3 text-center uppercase cursor-pointer" onClick={sortByPresent}>
                                    Total No. of Present {presentSortOrder === 'asc' ? <FaSort className="inline-block mb-1 ml-1" /> : presentSortOrder === 'desc' ? <FaSort className="inline-block rotate-180 mb-1 ml-1" /> : ''}
                                </th>
                                <th className="px-6 py-3 text-center uppercase cursor-pointer" onClick={sortByLate}>
                                    Total No. of Late {lateSortOrder === 'asc' ? <FaSort className="inline-block mb-1 ml-1" /> : lateSortOrder === 'desc' ? <FaSort className="inline-block rotate-180 mb-1 ml-1" /> : ''}
                                </th>
                                <th className="px-6 py-3 text-center uppercase cursor-pointer" onClick={sortByAbsent}>
                                    Total No. of Absent {absentSortOrder === 'asc' ? <FaSort className="inline-block mb-1 ml-1" /> : absentSortOrder === 'desc' ? <FaSort className="inline-block rotate-180 mb-1 ml-1" /> : ''}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredStudents.map((student) => (
                                <tr key={student.id} className="hover:bg-gray-100">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center space-x-3">
                                            <img className="h-10 w-10 rounded-full" src={student.image} alt={student.name} />
                                            <Link to={`/profile/${student.id}`} className="text-blue-600 hover:underline">
                                                <span>{student.name}</span>
                                            </Link>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-gray-800">{student.section}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-gray-800">{student.totalPresent}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-gray-800">{student.totalLate}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-gray-800">{student.totalAbsent}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <td className="px-6 py-3 text-left" colSpan="6">
                                    {Object.entries(sectionCounts).map(([section, count]) => (
                                        section !== 'All' && (
                                            <span key={section} className="mr-2">{count} Section {section}</span>
                                        )
                                    ))}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default AttendanceSummary;
