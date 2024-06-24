import React, { useState } from 'react';
import Modal from 'react-modal';
import { FaPrint } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { FaEdit } from "react-icons/fa";

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
    const [savedForms, setSavedForms] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [currentFormIndex, setCurrentFormIndex] = useState(null);

    const handleInputChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
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
                month: '',
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
        element.download = `SF2-${form.schoolID}-${form.schoolYear}-${form.month}.json`;
        document.body.appendChild(element);
        element.click();
    };

    return (
        <div className="container mx-auto p-4">
            <h2 className="text-2xl font-semibold mb-4">School Form 2 (SF2) Daily Attendance Report of Learners</h2>
            <button onClick={() => openModal()} className='w-40 h-10 text-center shadow-sm py-2 rounded-md bg-blue-500 font-medium text-2xl text-white hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm top-4 right-4'>
                Create SF2
            </button>


            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                contentLabel="Modal"
                className="fixed inset-0 flex items-center justify-center z-50 overflow-y-auto"
                overlayClassName="fixed inset-0 bg-gray-500 bg-opacity-25"
            >
                <div className="bg-white rounded-lg p-8 border-solid border-2 border-indigo-600 w-full max-w-4xl">
                    <form className='flex justify-center mb-4'>
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
                    <form className='flex justify-center mb-4'>
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
                        <div className="overflow-y-auto max-h-96">
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
                                        {['M', 'T', 'W', 'TH', 'F', 'M', 'T', 'W', 'TH', 'F', 'M', 'T', 'W', 'TH', 'F', 'M', 'T', 'W', 'TH', 'F', 'M', 'T', 'W', 'TH', 'F',].map((day, index) => (
                                            <th key={index} className='p-2 text-center'>{day}</th>
                                        ))}
                                        <th className='p-2'>ABSENT</th>
                                        <th className='p-2'>TARDY</th>
                                        <th className='p-2'>REMARKS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className='p-2'><input type='text' className='h-8' value={formData.nameOfLearner} onChange={(e) => handleInputChange('nameOfLearner', e.target.value)} /></td>
                                        {[...Array(25)].map((_, dayIndex) => (
                                            <td key={dayIndex} className='p-2'><input type='text' className='h-8 w-10' /></td>
                                        ))}
                                        <td className='p-2'><input type='number' className='h-8' value={formData.totalDaysAbsent} onChange={(e) => handleInputChange('totalDaysAbsent', e.target.value)} /></td>
                                        <td className='p-2'><input type='number' className='h-8' value={formData.totalDaysTardy} onChange={(e) => handleInputChange('totalDaysTardy', e.target.value)} /></td>
                                        <td className='p-2'><input type='text' className='h-8' value={formData.remarks} onChange={(e) => handleInputChange('remarks', e.target.value)} /></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="flex justify-end mt-4">
                        <button onClick={saveData} className='w-24 h-10 text-center shadow-sm py-2 rounded-md bg-blue-500 font-medium text-2xl text-white hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-offset-2 focus:ring-blue-500 sm:ml-4 sm:text-sm'>
                            Save
                        </button>
                        <button onClick={closeModal} className='w-24 h-10 text-center shadow-sm py-2 rounded-md bg-gray-500 font-medium text-2xl text-white hover:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-offset-2 focus:ring-gray-500 sm:ml-4 sm:text-sm'>
                            Cancel
                        </button>
                    </div>
                </div>
            </Modal>

            <div className="mt-5 overflow-x-auto">
                <div className="overflow-y-auto max-h-96">
                    <table className="min-w-full bg-white border border-gray-200 shadow-lg rounded-lg overflow-hidden">
                        <thead className='drop-shadow-lg text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-400'>
                            <tr>
                                <th className="w-24 py-3 text-center uppercase">School ID</th>
                                <th className="w-24 py-3 text-center uppercase">School Year</th>
                                <th className="w-24 py-3 text-center uppercase">School Name</th>
                                <th className="w-24 py-3 text-center uppercase">Grade Level</th>
                                <th className="w-24 py-3 text-center uppercase">Section</th>
                                <th className="w-24 py-3 text-center uppercase">Month</th>
                                <th className="w-24 py-3 text-center uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className='items-center'>
                            {savedForms.map((form, index) => (
                                <tr key={index}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{form.schoolID}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{form.schoolYear}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{form.schoolName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{form.gradeLevel}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{form.section}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{form.month}</td>
                                    <td className="mt-3 flex justify-center items-center space-x-4 whitespace-nowrap text-sm text-gray-500">
                                    <button onClick={() => downloadForm(form)} className='text-blue-500 hover:text-indigo-900'>
                                        <FaPrint className='w-6 h-5'/>
                                    </button>
                                    <button onClick={() => openModal(index)} className='text-green-500 hover:text-indigo-900'>
                                        <FaEdit className='w-6 h-5'/>
                                    </button>
                                    <button onClick={() => deleteForm(index)} className='text-red-500 hover:text-indigo-900'>
                                        <MdDelete className='w-6 h-5'/>
                                    </button>
                                    </td>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default SchoolFormTwo;
