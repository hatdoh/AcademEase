import React, { useState } from 'react';
import Modal from 'react-modal';

function SchoolFormTwo() {
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [formData, setFormData] = useState({
        schoolID: '',
        schoolYear: '',
        schoolName: '',
        gradeLevel: '',
        section: '',
        month: '',
        nameOfLearner: '',
        totalDaysAbsent: '',
        totalDaysTardy: '',
        remarks: ''
    });

    const handleInputChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
    };

    const openModal = () => {
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
    };

    const saveData = () => {
        closeModal();
        // You can process or save the form data here
    };

    return (
        <div className="container mx-auto p-4">
            <h2 className="text-2xl font-semibold mb-4">School Form 2 (SF2) Daily Attendance Report of Learners</h2>
            <button onClick={openModal} className='ml-10 w-40 h-10 mt-5 text-center shadow-sm py-2 rounded-md bg-blue-500 font-medium text-2xl text-white hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-offset-2 focus:ring-blue-500 sm:ml-4 sm:text-sm'>
                Create SF2
            </button>

            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                contentLabel="Modal"
                className="fixed inset-0 flex items-center justify-center z-50 overflow-y-auto"
                overlayClassName="fixed inset-0 bg-gray-500 bg-opacity-25"
            >
                <div className="bg-white rounded-lg p-8 h-3/5 w-3/5 border-solid border-2 border-indigo-600 overflow-y-auto">
                    <form className='flex justify-center'>
                        <div className="flex flex-col mr-10">
                            <label className="block mb-2">School ID</label>
                            <input type="number" value={formData.schoolID} onChange={(e) => handleInputChange('schoolID', e.target.value)} className="border px-2 py-1 w-40 mb-4" />
                        </div>
                        <div className="flex flex-col">
                            <label className="block mb-2">School Year</label>
                            <input type="number" value={formData.schoolYear} onChange={(e) => handleInputChange('schoolYear', e.target.value)} className="border px-2 py-1 w-40 mb-4" />
                        </div>
                        <div className="flex flex-col ml-10">
                            <label className="block mb-2">Report for the Month of</label>
                            <input type="text" value={formData.month} onChange={(e) => handleInputChange('month', e.target.value)} className="border px-2 py-1 w-40 mb-4" />
                        </div>
                    </form>
                    <form className='flex justify-center'>
                        <div className="flex flex-col mr-10">
                            <label className="block mb-2">School Name</label>
                            <input type="text" value={formData.schoolName} onChange={(e) => handleInputChange('schoolName', e.target.value)} className="border px-2 py-1 w-80 mb-4" />
                        </div>
                        <div className="flex flex-col">
                            <label className="block mb-2">Grade Level</label>
                            <input type="number" value={formData.gradeLevel} onChange={(e) => handleInputChange('gradeLevel', e.target.value)} className="border px-2 py-1 w-20 mb-4" />
                        </div>
                        <div className="flex flex-col ml-10">
                            <label className="block mb-2">Section</label>
                            <input type="text" value={formData.section} onChange={(e) => handleInputChange('section', e.target.value)} className="border px-2 py-1 w-60 mb-4" />
                        </div>
                    </form>
                    <div className='overflow-x-auto'>
                        <div className="overflow-y-auto max-h-screen">
                            <table className="min-w-full bg-white border border-gray-200 shadow-lg rounded-lg overflow-hidden">
                                <thead className='text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-400'>
                                    <tr>
                                        <th className="w-24 py-3 text-center uppercase">LEARNER'S NAME</th>
                                        {[...Array(25)].map((_, dayIndex) => (
                                            <th key={dayIndex} className='p-2'>
                                                <input type='number' className='text-right h-8 w-10' />
                                            </th>
                                        ))}
                                        <th className='p-2'></th>
                                        <th className='p-2'></th>
                                        <th className='p-2'></th>
                                    </tr>
                                    <tr>
                                        <th className='px-20'></th>
                                        <th className='p-2'></th>
                                        <th className='p-2'></th>
                                        <th className='p-2'></th>
                                        <th className='p-2'></th>
                                        <th className='p-2'></th>
                                        <th className='p-2'></th>
                                        <th className='p-2'></th>
                                        <th className='p-2'></th>
                                        <th className='p-2'></th>
                                        <th className='p-2'></th>
                                        <th className='p-2'></th>
                                        <th className='p-2'></th>
                                        <th className='p-2'></th>
                                        <th className='p-2'></th>
                                        <th className='p-2'></th>
                                        <th className='p-2'></th>
                                        <th className='p-2'></th>
                                        <th className='p-2'></th>
                                        <th className='p-2'></th>
                                        <th className='p-2'></th>
                                        <th className='p-2'></th>
                                        <th className='p-2'></th>
                                        <th className='p-2'></th>
                                        <th className='p-2'></th>
                                        <th className='p-2'></th>
                                        <th className='p-2'></th>
                                        <th className='p-2'></th>
                                        <th className='p-2'></th>
                                        
                                    </tr>
                                    <tr>
                                        <th className="w-24 pt-3 text-center uppercase">(Last Name, First Name, Middle Name)</th>
                                        {['M', 'T', 'W', 'TH', 'F', 'M', 'T', 'W', 'TH', 'F', 'M', 'T', 'W', 'TH', 'F', 'M', 'T', 'W', 'TH', 'F', 'M', 'T', 'W', 'TH', 'F', ].map((day, index) => (
                                            <th key={index} className='p-2 text-center'>{day}</th>
                                        ))}
                                        <th className='p-2'>ABSENT</th>
                                        <th className='p-2'>TARDY</th>
                                        <th className='p-2'>REMARKS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className='border-b border-gray-200'>
                                        <td className="py-2 px-4 border">{formData.nameOfLearner}</td>
                                        {[...Array(20)].map((_, dayIndex) => (
                                            <td className="py-2 px-4 border" key={dayIndex}></td>
                                        ))}
                                        <td className="py-2 px-4 border">{formData.totalDaysAbsent}</td>
                                        <td className="py-2 px-4 border">{formData.totalDaysTardy}</td>
                                        <td className="py-2 px-4 border">{formData.remarks}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="flex justify-center mt-4">
                        <button onClick={closeModal} className='ml-10 w-40 h-10 mt-5 text-center shadow-sm py-2 rounded-md bg-red-500 font-medium text-2xl text-white hover:bg-red-700 focus:outline-none focus:ring-1 focus:ring-offset-2 focus:ring-red-500 sm:ml-4 sm:text-sm'>
                            Close
                        </button>
                        <button onClick={saveData} className='ml-10 w-40 h-10 mt-5 text-center shadow-sm py-2 rounded-md bg-green-500 font-medium text-2xl text-white hover:bg-green-700 focus:outline-none focus:ring-1 focus:ring-offset-2 focus:ring-green-500 sm:ml-4 sm:text-sm'>
                            Save
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

export default SchoolFormTwo;
