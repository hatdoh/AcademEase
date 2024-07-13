import React, { useState, useEffect } from 'react';
import { MdAdd, MdArrowUpward, MdArrowDownward } from 'react-icons/md';
import { Link } from 'react-router-dom';
import { collection, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

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
    const [sortDirection, setSortDirection] = useState('asc'); // 'asc' or 'desc'

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
                    console.error('Error fetching students:', error);
                }
            };

            fetchStudentsAndSections();
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            const sectionsCollection = collection(db, 'sections');
            const unsubscribeSections = onSnapshot(sectionsCollection, (snapshot) => {
                const sections = ['All', ...new Set(snapshot.docs.map((doc) => doc.data().section))];
                setSectionList(sections);
            });

            return () => unsubscribeSections();
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

    return (
        <>
            <div className="ml-80 p-4">
                <div className="flex items-center space-x-4 mb-4">
                    <h2 className="text-2xl ml-2 font-semibold text-gray-800">Section ({selectedSection})</h2>
                </div>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                        <label htmlFor="acadYear" className='font-medium mr-1'>AcadYear</label>
                        <input
                            type="text"
                            id="acadYear"
                            placeholder="Search AcadYear"
                            value={searchAcadYear}
                            onChange={(e) => setSearchAcadYear(e.target.value)}
                            className="mt-1 mr-2 block w-36 px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                        <label htmlFor="grade" className='font-medium mr-1'>Grade</label>
                        <input
                            type="text"
                            id="grade"
                            placeholder="Search Grade"
                            value={searchGrade}
                            onChange={(e) => setSearchGrade(e.target.value)}
                            className="mt-1 mr-2 block w-36 px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                        <label htmlFor="section" className='font-medium mr-1'>Section</label>
                        <input
                            type="text"
                            id="section"
                            placeholder="Search Section"
                            value={searchSection}
                            onChange={(e) => setSearchSection(e.target.value)}
                            className="mt-1 mr-12 block w-36 px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                        <select
                            className="mt-1 mr-3 block w-40 px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            value={selectedSection}
                            onChange={(e) => handleSectionChange(e.target.value)}
                        >
                            {sectionList.map((section) => (
                                <option key={section} value={section}>
                                    {section === 'All' ? 'All Sections' : `Section ${section}`}
                                </option>
                            ))}
                        </select>
                        <Link
                            to="/add-section"
                            className="flex items-center px-3 py-2 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                        >
                            Add Section <MdAdd className="w-5 h-5 mr-1 ml-2" />
                        </Link>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <div className="overflow-y-auto max-h-screen">
                        <table className="min-w-full bg-white border border-gray-200 shadow-lg rounded-lg overflow-hidden">
                            <thead className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th className="px-6 py-3 text-center uppercase">No</th>
                                    <th
                                        className="px-6 py-3 text-left uppercase cursor-pointer"
                                        onClick={() => handleSort('LName')}
                                    >
                                        Name
                                        {renderSortIcon('LName')}
                                    </th>
                                    <th
                                        className="px-6 py-3 text-center uppercase"
                                    >
                                        Grade
                                    </th>
                                    <th
                                        className="px-6 py-3 text-center uppercase"
                                    >
                                        Section
                                    </th>
                                    <th className="px-6 py-3 text-center uppercase">Gender</th>
                                    <th className="px-6 py-3 text-center uppercase">Contact Number</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {sortedStudents.map((student, index) => (
                                    <tr key={student.id} className="hover:bg-gray-100">
                                        <td className="px-6 py-4 whitespace-nowrap text-center">{index + 1}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center space-x-3">
                                                {student.image && (
                                                    <img
                                                        className="h-10 w-10 rounded-full"
                                                        src={student.image}
                                                        alt={student.FName}
                                                    />
                                                )}
                                                <Link
                                                    to={`/profile/${student.id}`}
                                                    className="text-blue-600 hover:underline"
                                                >
                                                    <span>{getFullName(student)}</span>
                                                </Link>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">{student.grade}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">{student.section}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">{student.gender}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            {student.contactNumber}
                                        </td>
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
        </>
    );
}

export default Section;
