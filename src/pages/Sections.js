import React, { useState } from 'react';
import { MdAdd } from "react-icons/md";



const students = [
    {
        id: 1,
        name: 'Xenia Angelica D. Velacruz',
        gender: 'Female',
        address: 'Purok 8 Brgy. VIII, Daet, Camarines Norte',
        contactNumber: '0956-961-0529',
        image: 'xenia',
        section: 'A',
    },
    {
        id: 2,
        name: 'Wyndel S. Albos',
        gender: 'Male',
        address: 'Brgy. Camambugan, Daet, Camarines Norte',
        contactNumber: '0956-961-0529',
        image: 'wyndel',
        section: 'B',
    },
    {
        id: 3,
        name: 'Xenia Angelica D. Velacruz',
        gender: 'Female',
        address: 'Brgy. Cobangbang, Daet, Camarines Norte',
        contactNumber: '0956-961-0529',
        image: 'xenia',
        section: 'A',
    },
    {
        id: 4,
        name: 'Wyndel S. Albos',
        gender: 'Male',
        address: 'Paracale, Camarines Norte',
        contactNumber: '0956-961-0529',
        image: 'wyndel',
        section: 'C',
    },
    {
        id: 5,
        name: 'Xenia Angelica D. Velacruz',
        gender: 'Female',
        address: 'Brgy. Hatdog, Daet, Camarines Norte',
        contactNumber: '0956-961-0529',
        image: 'xenia',
        section: 'B',
    },
];

function Section() {
    const [selectedSection, setSelectedSection] = useState('All'); // State to manage selected section filter

    // Function to handle section filter change
    const handleSectionChange = (section) => {
        setSelectedSection(section);
    };

    // Filtered students based on selected section
    const filteredStudents = students.filter(student =>
        selectedSection === 'All' || student.section === selectedSection
    );

    // Count of students in each section
    const sectionCounts = {
        A: filteredStudents.filter(student => student.section === 'A').length,
        B: filteredStudents.filter(student => student.section === 'B').length,
        C: filteredStudents.filter(student => student.section === 'C').length,
    };

    return (
        <div className="container mx-auto p-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                    <h2 className="text-2xl ml-2 font-semibold text-gray-800">Section {selectedSection}</h2>
                </div>
                <div className="flex items-center space-x-4">
                    <label className="block text-sm font-medium text-gray-700">Select Section:</label>
                    <select
                        className="mt-1 block w-40 px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        value={selectedSection}
                        onChange={(e) => handleSectionChange(e.target.value)}
                    >
                        <option value="All">All Sections</option>
                        <option value="A">Section A</option>
                        <option value="B">Section B</option>
                        <option value="C">Section C</option>
                    </select>
                    <button
                    className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    onClick={() => alert('Add Section clicked')}
                >
                    Add Section <MdAdd className="w-6 h-6 mr-1 ml-2" />
                </button>
                
                </div>

            </div>


            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 shadow-lg rounded-lg overflow-hidden">
                    <thead className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th className="px-6 py-3 text-left uppercase">Name</th>
                            <th className="px-6 py-3 text-left uppercase">Section</th>
                            <th className="px-6 py-3 text-left uppercase">Gender</th>
                            <th className="px-6 py-3 text-left uppercase">Address</th>
                            <th className="px-6 py-3 text-left uppercase">Contact Number</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredStudents.map((student) => (
                            <tr key={student.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center space-x-3">
                                        <img className="h-10 w-10 rounded-full" src={require(`../res/img/${student.image}.png`)} alt={student.name} />
                                        <div className="text-sm font-medium text-gray-900">{student.name}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">{student.section}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{student.gender}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{student.address}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{student.contactNumber}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <td className="px-6 py-3 text-left" colSpan="5">
                                <span className="mr-2">{sectionCounts.A} Section A</span>
                                <span className="mr-2">{sectionCounts.B} Section B</span>
                                <span>{sectionCounts.C} Section C</span>
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
}

export default Section;
