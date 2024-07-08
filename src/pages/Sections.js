import React, { useState, useEffect } from 'react';
import { MdAdd } from 'react-icons/md';
import { Link } from 'react-router-dom';
import { collection, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

function Section() {
    const [selectedSection, setSelectedSection] = useState('All');
    const [sectionList, setSectionList] = useState(['All']);
    const [students, setStudents] = useState([]);
    const [user, setUser] = useState(null);

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

   // const deleteSection = (sectionName) => {
    //    if (sectionName === 'All') return; // Prevent deletion of 'All' section
    //    setSectionList((prev) => prev.filter((section) => section !== sectionName));
   //     if (selectedSection === sectionName) setSelectedSection('All'); // Reset to 'All' if current section is deleted
  //  };

    const filteredStudents = students.filter(
        (student) => selectedSection === 'All' || student.section === selectedSection
    );

    const sectionCounts = sectionList.reduce((counts, section) => {
        counts[section] = students.filter((student) => student.section === section).length;
        return counts;
    }, {});

    const getFullName = (student) => {
        return `${student.LName}, ${student.FName} ${student.MName}`;
    };


    if (!user) {
        return <div>Please log in to view the student data.</div>;
    }

    return (
        <>
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
                                <option key={section} value={section}>
                                    {section === 'All' ? 'All Sections' : `Section ${section}`}
                                </option>
                            ))}
                        </select>
                        <Link
                            to="/add-section"
                            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                        >
                            Add Section <MdAdd className="w-6 h-6 mr-1 ml-2" />
                        </Link>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <div className="overflow-y-auto max-h-screen">
                        <table className="min-w-full bg-white border border-gray-200 shadow-lg rounded-lg overflow-hidden">
                            <thead className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
                                <tr>
                                    <th className="px-6 py-3 text-left uppercase">Name</th>
                                    <th className="px-6 py-3 text-center uppercase">Grade</th>
                                    <th className="px-6 py-3 text-center uppercase">Section</th>
                                    <th className="px-6 py-3 text-center uppercase">Gender</th>
                                    <th className="px-6 py-3 text-center uppercase">Contact Number</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredStudents.map((student) => (
                                    <tr key={student.id} className="hover:bg-gray-100">
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
                                    <td className="px-6 py-3 text-left" colSpan="5">
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
