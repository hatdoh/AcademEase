import React, { useState } from 'react';
import { MdAdd, MdDelete } from "react-icons/md";
import { Link } from 'react-router-dom';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

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
        name: 'John Homer S. Dar',
        gender: 'Male',
        address: 'Brgy. Cobangbang, Daet, Camarines Norte',
        contactNumber: '0956-961-0529',
        image: 'homer',
        section: 'A',
    },
    {
        id: 4,
        name: 'John Homer S. Dar',
        gender: 'Male',
        address: 'Paracale, Camarines Norte',
        contactNumber: '0956-961-0529',
        image: 'homer',
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

function AddSectionModal({ isOpen, closeModal, onAddSection }) {
    const [sectionName, setSectionName] = useState('');

    const handleSave = () => {
        if (sectionName.trim() === '') {
            alert('Please enter a section name.');
            return;
        }
        onAddSection(sectionName);
        closeModal();
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-10" onClose={closeModal}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-25" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                                    Add Section
                                </Dialog.Title>
                                <div className="mt-2">
                                    <form className="space-y-4">
                                        <div>
                                            <label htmlFor="sectionName" className="block text-sm font-medium text-gray-700">Section Name</label>
                                            <input
                                                type="text"
                                                name="sectionName"
                                                id="sectionName"
                                                value={sectionName}
                                                placeholder='Enter Section Name'
                                                onChange={(e) => setSectionName(e.target.value)}
                                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="time" className="block text-sm font-medium text-gray-700">Time</label>
                                            <input type="time" name="time" id="time" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                                        </div>
                                        <div>
                                            <label htmlFor="day" className="block text-sm font-medium text-gray-700">Day</label>
                                            <select name="day" id="day" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                                                <option value="Monday">Monday</option>
                                                <option value="Tuesday">Tuesday</option>
                                                <option value="Wednesday">Wednesday</option>
                                                <option value="Thursday">Thursday</option>
                                                <option value="Friday">Friday</option>
                                            </select>
                                        </div>
                                    </form>
                                </div>
                                <div className="flex items-center mt-4">
                                    <button
                                        type="button"
                                        className="inline-flex justify-center rounded-md border-2 border-blue-700 bg-blue-500 px-4 py-2 mr-3 text-sm font-medium text-white hover:bg-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                        onClick={handleSave}
                                    >
                                        Save
                                    </button>
                                    <button
                                        type="button"
                                        className="inline-block rounded border-2 border-neutral-400 bg-neutral-100 px-4 py-2 mr-3 text-xs font-medium leading-normal text-neutral-600 shadow-light-3 transition duration-150 ease-in-out hover:bg-neutral-200 hover:shadow-light-2 focus:bg-neutral-200 focus:shadow-light-2 focus:outline-none focus:ring-0 active:bg-neutral-200 active:shadow-light-2 motion-reduce:transition-none dark:shadow-black/30 dark:hover:shadow-dark-strong dark:focus:shadow-dark-strong dark:active:shadow-dark-strong"
                                        onClick={closeModal}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}

function Section() {
    const [selectedSection, setSelectedSection] = useState('All');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [sectionList, setSectionList] = useState(['All', 'A', 'B', 'C']); // Initial section list

    const handleSectionChange = (section) => {
        setSelectedSection(section);
    };

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const addSection = (sectionName) => {
        setSectionList(prev => [...prev, sectionName]);
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

                    <button
                        className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                        onClick={openModal}
                    >
                        Add Section <MdAdd className="w-6 h-6 mr-1 ml-2" />
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <div className="overflow-y-auto max-h-screen"> {/* Container to make the table scrollable */}
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
                                <tr key={student.id} className='hover:bg-gray-100'>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center space-x-3">
                                            <img className="h-10 w-10 rounded-full" src={getImagePath(student.image)} alt={student.name} />
                                            <Link to={`/profile/${student.id}`} className="text-blue-600 hover:underline">
                                                <span>{student.name}</span>
                                            </Link>
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
                                    {Object.entries(sectionCounts).map(([section, count]) => (
                                        section !== 'All' && <span key={section} className="mr-2">{count} Section {section}</span>
                                    ))}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            <AddSectionModal isOpen={isModalOpen} closeModal={closeModal} onAddSection={addSection} />
        </div>
    );
}

export default Section;
