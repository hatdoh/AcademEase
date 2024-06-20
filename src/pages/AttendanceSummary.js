import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaSort } from 'react-icons/fa';

const students = [
    {
        id: 1,
        name: 'Xenia Angelica D. Velacruz',
        section: 'A',
        image: 'xenia',
        totalLate: 3,
        totalAbsent: 1,
    },
    {
        id: 2,
        name: 'Wyndel S. Albos',
        section: 'B',
        image: 'wyndel',
        totalLate: 1,
        totalAbsent: 0,
    },
    {
        id: 3,
        name: 'John Homer S. Dar',
        section: 'A',
        image: 'homer',
        totalLate: 2,
        totalAbsent: 2,
    },
    {
        id: 4,
        name: 'John Homer S. Dar',
        section: 'C',
        image: 'homer',
        totalLate: 0,
        totalAbsent: 1,
    },
    {
        id: 5,
        name: 'Wyndel S. Albos',
        section: 'B',
        image: 'wyndel',
        totalLate: 4,
        totalAbsent: 0,
    },
];

function AttendanceSummary() {
    const [selectedSection, setSelectedSection] = useState('All');
    const [selectedAttendanceSummary, setSelectedAttendanceSummary] = useState('Daily');
    const [sectionList] = useState(['All', 'A', 'B', 'C']); // Initial section list
    const [attendanceSummaryList] = useState(['Daily', 'Weekly', 'Monthly']); // Attendance summary list

    const [lateSortOrder, setLateSortOrder] = useState(null);
    const [absentSortOrder, setAbsentSortOrder] = useState(null);

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
        if (lateSortOrder === null || lateSortOrder === 'desc') {
            setLateSortOrder('asc');
            students.sort((a, b) => a.totalLate - b.totalLate);
        } else {
            setLateSortOrder('desc');
            students.sort((a, b) => b.totalLate - a.totalLate);
        }
    };

    const sortByAbsent = () => {
        if (absentSortOrder === null || absentSortOrder === 'desc') {
            setAbsentSortOrder('asc');
            students.sort((a, b) => a.totalAbsent - b.totalAbsent);
        } else {
            setAbsentSortOrder('desc');
            students.sort((a, b) => b.totalAbsent - a.totalAbsent);
        }
    };

    const sortedStudents = [...students].filter(student =>
        (selectedSection === 'All' || student.section === selectedSection) &&
        filterByAttendanceSummary(student, selectedAttendanceSummary)
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
        <div className="container mx-auto p-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                    <h2 className="text-2xl ml-2 font-semibold text-gray-800">Section ({selectedSection})</h2>
                </div>
                <div className="flex items-center space-x-4">
                    <select
                        className="mt-1 block w-40 px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        value={selectedSection}
                        onChange={(e) => handleSectionChange(e.target.value)}
                    >
                        {sectionList.map((section) => (
                            <option key={section} value={section}>{section === 'All' ? 'All Sections' : `Section ${section}`}</option>
                        ))}
                    </select>
                    <select
                        className="mt-1 block w-40 px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        value={selectedAttendanceSummary}
                        onChange={(e) => handleAttendanceSummaryChange(e.target.value)}
                    >
                        {attendanceSummaryList.map((summary) => (
                            <option key={summary} value={summary}>{summary}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="overflow-x-auto">
                <div className="overflow-y-auto max-h-screen"> {/* Container to make the table scrollable */}
                    <table className="min-w-full bg-white border border-gray-200 shadow-lg rounded-lg overflow-hidden">
                        <thead className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th className="px-6 py-3 text-left uppercase">Name</th>
                                <th className="px-6 py-3 text-left uppercase">Section</th>
                                <th className="px-6 py-3 text-left uppercase cursor-pointer" onClick={sortByLate}>
                                    Total Number of Late {lateSortOrder === 'asc' ? <FaSort className="inline-block mb-1 ml-1" /> : lateSortOrder === 'desc' ? <FaSort className="inline-block rotate-180 mb-1 ml-1" /> : ''}
                                </th>
                                <th className="px-6 py-3 text-left uppercase cursor-pointer" onClick={sortByAbsent}>
                                    Total Number of Absent {absentSortOrder === 'asc' ? <FaSort className="inline-block mb-1 ml-1" /> : absentSortOrder === 'desc' ? <FaSort className="inline-block rotate-180 mb-1 ml-1" /> : ''}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {sortedStudents.map((student) => (
                                <tr key={student.id} className="hover:bg-gray-100">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center space-x-3">
                                            <img className="h-10 w-10 rounded-full" src={getImagePath(student.image)} alt={student.name} />
                                            <Link to={`/profile/${student.id}`} className="text-blue-600 hover:underline">
                                                <span>{student.name}</span>
                                            </Link>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center whitespace-nowrap">{student.section}</td>
                                    <td className="px-6 py-4 text-center whitespace-nowrap">{student.totalLate}</td>
                                    <td className="px-6 py-4 text-center whitespace-nowrap">{student.totalAbsent}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <td className="px-6 py-3 text-left" colSpan="4">
                                    {Object.entries(sectionCounts).map(([section, count]) => (
                                        section !== 'All' && <span key={section} className="mr-2">{count} in Section {section}</span>
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
