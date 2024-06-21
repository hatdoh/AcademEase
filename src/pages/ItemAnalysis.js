import React, { useState } from 'react';
import { MdDelete } from "react-icons/md";

// Your students data...
const students = [
    // ... your students data
];

function ItemAnalysis() {
    const [selectedSection, setSelectedSection] = useState('All');
    const [sectionList, setSectionList] = useState(['All', 'A', 'B', 'C']); // Initial section list

    const handleSectionChange = (section) => {
        setSelectedSection(section);
    };

    const deleteSection = (sectionName) => {
        if (sectionName === 'All') return; // Prevent deletion of 'All' section
        setSectionList(prev => prev.filter(section => section !== sectionName));
        if (selectedSection === sectionName) setSelectedSection('All'); // Reset to 'All' if current section is deleted
    };

    const filteredStudents = students.filter(student =>
        selectedSection === 'All' || student.section === selectedSection
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
                    {selectedSection !== 'All' && (
                        <button
                            onClick={() => deleteSection(selectedSection)}
                            className="flex items-center right-0 top-0 mt-1 mr-1 px-2 py-1 bg-red-600 text-white text-xs rounded-full hover:bg-red-700 focus:outline-none"
                        >
                            <MdDelete />
                        </button>
                    )}
                </div>
            </div>

            <div className="overflow-x-auto">
                <div className="overflow-y-auto max-h-screen"> {/* Container to make the table scrollable */}
                    <table className="min-w-full bg-white border border-gray-200 shadow-lg rounded-lg overflow-hidden">
                        <thead className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th className="px-6 py-3 text-left uppercase">Question</th>
                                <th className="px-6 py-3 text-left uppercase">No.</th>
                                <th className="px-6 py-3 text-left uppercase">% Correct Answer A</th>
                                <th className="px-6 py-3 text-left uppercase">% Correct Answer B</th>
                                <th className="px-6 py-3 text-left uppercase">% Correct Answer C</th>
                                <th className="px-6 py-3 text-left uppercase">% Correct Answer D</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm text-gray-700">
                            {/* Table rows */}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default ItemAnalysis;
