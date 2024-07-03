import React, { useState } from 'react';
import Modal from 'react-modal';
import { FaPrint } from "react-icons/fa";
import { MdDelete, MdDateRange } from "react-icons/md";
import { FaEdit } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";


function SchoolFormTwo() {
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [formData, setFormData] = useState({
        schoolID: '',
        schoolYear: '',
        schoolName: '',
        gradeLevel: '',
        section: '',
        month: new Date(),
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

    const handleDateChange = (date) => {
        setFormData({ ...formData, month: date });
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
                month: new Date(),
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
        element.download = `SF2-${form.schoolID}-${form.schoolYear}-${form.month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}.json`;
        document.body.appendChild(element);
        element.click();
    };

    const renderDaysOfWeek = () => {
        const daysOfWeek = ['M', 'T', 'W', 'TH', 'F'];
        const firstDayOfMonth = new Date(formData.month.getFullYear(), formData.month.getMonth(), 1);
        const lastDayOfMonth = new Date(formData.month.getFullYear(), formData.month.getMonth() + 1, 0);
        const days = [];

        for (let day = firstDayOfMonth.getDate(); day <= lastDayOfMonth.getDate(); day++) {
            const currentDate = new Date(formData.month.getFullYear(), formData.month.getMonth(), day);
            const dayOfWeek = currentDate.getDay();

            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                days.push(<td key={day} className='p-2 text-center'>{daysOfWeek[dayOfWeek - 1]}</td>);
            } else {
                days.push(<td key={day} className='p-2 text-center'></td>);
            }
        }

        return days;
    };


    const renderNoDaysOfWeek = () => {
        const daysOfWeek = ['M', 'T', 'W', 'TH', 'F'];
        const firstDayOfMonth = new Date(formData.month.getFullYear(), formData.month.getMonth(), 1);
        const lastDayOfMonth = new Date(formData.month.getFullYear(), formData.month.getMonth() + 1, 0);
        const days = [];

        for (let day = firstDayOfMonth.getDate(); day <= lastDayOfMonth.getDate(); day++) {
            const currentDate = new Date(formData.month.getFullYear(), formData.month.getMonth(), day);
            const dayOfWeek = currentDate.getDay();

            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                days.push(
                    <th key={day} className='p-2 text-center'>
                        {day}
                    </th>
                );
            } else {
                days.push(
                    <th key={day} className='p-2 text-center'>
                        {daysOfWeek[dayOfWeek - 1]}
                    </th>
                );
            }
        }

        return days;
    };

    const handleSchoolYearChange = (e) => {
        const value = e.target.value;
        if (/^\d{0,4}(-\d{0,4})?$/.test(value)) {
            setFormData({ ...formData, schoolYear: value });
        }
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
                        <div className="flex flex-col">
                            <label className="block mb-2">School Year</label>
                            <input
                                type="text"
                                className="border px-2 py-1 w-40 mb-4"
                                placeholder="YYYY-YYYY"
                                value={formData.schoolYear}
                                onChange={handleSchoolYearChange}
                            />
                        </div>
                        <div className="flex flex-col ml-10">
                            <label className="block mb-2">Report for the Month of</label>
                            <DatePicker
                                selected={formData.month}
                                onChange={date => handleDateChange(date)}
                                dateFormat="MMMM yyyy"
                                showMonthYearPicker
                                className="border px-2 py-1 w-40 mb-4"
                            />
                        </div>
                    </form>
                    <form className='flex justify-center mb-4'>
                        <div className="flex flex-col">
                            <label className="block mb-2">Grade Level</label>
                            <select
                                value={formData.gradeLevel}
                                onChange={(e) => handleInputChange('gradeLevel', e.target.value)}
                                className="border px-2 py-1 pl-6 w-20 mb-4"
                            >
                                {[...Array(12)].map((_, index) => (
                                    <option key={index + 1} value={index + 1}>{index + 1}</option>
                                ))}
                            </select>
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
                                        <th className="w-24 px-20"></th>
                                        {renderNoDaysOfWeek()}
                                        <th className='p-2'></th>
                                        <th className='p-2'></th>
                                        <th className='p-2'></th>
                                    </tr>
                                    <tr>
                                        <th className="w-24 text-center uppercase">LEARNER'S NAME <br />(Last Name, First Name, Middle Name)</th>
                                        {renderDaysOfWeek()}
                                        <th className='p-2'>ABSENT</th>
                                        <th className='p-2'>TARDY</th>
                                        <th className='p-2'>REMARKS</th>
                                    </tr>
                                </thead>
                                <tbody className='bg-white h-80'>
                                    <td></td>
                                </tbody>
                            </table>
                            <table className='mt-10'>
                                <thead className='text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-400'>   
                                    <tr>
                                        <th className='py-3 pr-10 text-center'>Month: <br></br> No of Days of Classes:</th>
                                        <th className='py-3 px-4'>M</th>
                                        <th className='py-3 px-4'>F</th>
                                        <th className='py-3 px-8'>Total</th>
                                    </tr>
                                    <tr>
                                        <th className='bg-white py-2 px-10'>* Enrolment as of (1st Friday of June)</th>
                                        
                                    </tr>
                                    <tr>
                                        <th className='bg-white py-2 px-10'>Late Enrollment during the month (beyond cut-off)</th>
                                    </tr>
                                    <tr>
                                        <th className='bg-white py-2 px-10'>Registered Learners as of end of the month</th>
                                    </tr>
                                    <tr>
                                        <th className='bg-white py-2 px-10'>Percentage of Enrolment as of end of the month</th>
                                    </tr>
                                    <tr>
                                        <th className='bg-white py-2 px-10'>Average Daily Attendance</th>
                                    </tr>
                                    <tr>
                                        <th className='bg-white py-2 px-10'>Percentage of Attendance for the month</th>
                                    </tr>
                                    <tr>
                                        <th className='bg-white py-2 px-10'>Number of students absent for 5 consecutive days:</th>
                                    </tr>
                                    <tr>
                                        <th className='bg-white py-2 px-10'>Drop out</th>
                                    </tr>
                                    <tr>
                                        <th className='bg-white py-2 px-10'>Transferred out</th>
                                    </tr>
                                    <tr>
                                        <th className='bg-white py-2 px-10'>Transferred in</th>
                                    </tr>

                                </thead>
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
        </div>
    );
}

export default SchoolFormTwo;
