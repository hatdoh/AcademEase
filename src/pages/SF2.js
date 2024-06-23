import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import Modal from 'react-modal';

// Import statements remain the same

// Import statements remain the same

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
        date: '',
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
            <div className="bg-white rounded-lg p-8 h-96 w-120 border-solid border-2 border-indigo-600">
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

                <button onClick={saveData} className="bg-blue-500 text-white px-4 py-2 rounded mt-4">Save</button>
            </div>

            
        </Modal>

        {/* Your existing table rendering logic */}
        {/* ... */}
    </div>

    );
}

export default SchoolFormTwo;

