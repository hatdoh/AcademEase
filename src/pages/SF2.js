import React, { useState } from 'react';
import { jsPDF } from 'jspdf';

function SchoolFormTwo() {
    const [schoolID, setSchoolID] = useState('');
    const [schoolYear, setSchoolYear] = useState('');
    const [schoolName, setSchoolName] = useState('');
    const [reportMonth, setReportMonth] = useState('');
    const [gradeLevel, setGradeLevel] = useState('');
    const [section, setSection] = useState('');
    const [learners, setLearners] = useState([{ lastName: '', firstName: '', middleName: '', attendance: Array(31).fill('') }]);
    const [totalAbsences, setTotalAbsences] = useState(0);
    const [totalTardies, setTotalTardies] = useState(0);

    const handleLearnerChange = (index, field, value) => {
        const newLearners = [...learners];
        newLearners[index][field] = value;
        setLearners(newLearners);
    };

    const handleAttendanceChange = (learnerIndex, dayIndex, value) => {
        const newLearners = [...learners];
        newLearners[learnerIndex].attendance[dayIndex] = value;
        setLearners(newLearners);
    };

    const calculateTotals = () => {
        let absences = 0;
        let tardies = 0;
        learners.forEach(learner => {
            learner.attendance.forEach(day => {
                if (day === 'x') absences++;
                if (day === '/') tardies++;
            });
        });
        setTotalAbsences(absences);
        setTotalTardies(tardies);
    };

    const generatePDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(10);

        // Header
        doc.text(`School Form 2 (SF2) Daily Attendance Report of Learners`, 20, 10);
        doc.text(`School ID: ${schoolID}`, 20, 20);
        doc.text(`School Year: ${schoolYear}`, 20, 30);
        doc.text(`School Name: ${schoolName}`, 20, 40);
        doc.text(`Report for the Month of: ${reportMonth}`, 20, 50);
        doc.text(`Grade Level: ${gradeLevel}`, 20, 60);
        doc.text(`Section: ${section}`, 20, 70);

        // Learners Table
        let y = 80;
        doc.text(`Learners Name`, 20, y);
        for (let i = 1; i <= 31; i++) {
            doc.text(`${i}`, 70 + (i * 5), y);
        }
        y += 10;
        learners.forEach(learner => {
            doc.text(`${learner.lastName}, ${learner.firstName} ${learner.middleName}`, 20, y);
            learner.attendance.forEach((day, index) => {
                doc.text(day, 70 + ((index + 1) * 5), y);
            });
            y += 10;
        });

        // Totals
        doc.text(`Total for the Month - Absences: ${totalAbsences}`, 20, y);
        doc.text(`Total for the Month - Tardies: ${totalTardies}`, 20, y + 10);

        // Save PDF
        doc.save('SchoolForm2.pdf');
    };

    return (
        <div className="container mx-auto p-4">
            <h2 className="text-2xl font-semibold mb-4">School Form 2</h2>
            <div className="mb-4">
                <label className="block mb-2">School ID</label>
                <input type="text" value={schoolID} onChange={(e) => setSchoolID(e.target.value)} className="border px-2 py-1 w-full" />
            </div>
            <div className="mb-4">
                <label className="block mb-2">School Year</label>
                <input type="text" value={schoolYear} onChange={(e) => setSchoolYear(e.target.value)} className="border px-2 py-1 w-full" />
            </div>
            <div className="mb-4">
                <label className="block mb-2">School Name</label>
                <input type="text" value={schoolName} onChange={(e) => setSchoolName(e.target.value)} className="border px-2 py-1 w-full" />
            </div>
            <div className="mb-4">
                <label className="block mb-2">Report for the Month of</label>
                <input type="text" value={reportMonth} onChange={(e) => setReportMonth(e.target.value)} className="border px-2 py-1 w-full" />
            </div>
            <div className="mb-4">
                <label className="block mb-2">Grade Level</label>
                <input type="text" value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)} className="border px-2 py-1 w-full" />
            </div>
            <div className="mb-4">
                <label className="block mb-2">Section</label>
                <input type="text" value={section} onChange={(e) => setSection(e.target.value)} className="border px-2 py-1 w-full" />
            </div>

            <h3 className="text-xl font-semibold mt-4 mb-2">Learners</h3>
            {learners.map((learner, learnerIndex) => (
                <div key={learnerIndex} className="mb-4">
                    <div className="flex mb-2">
                        <input type="text" value={learner.lastName} onChange={(e) => handleLearnerChange(learnerIndex, 'lastName', e.target.value)} placeholder="Last Name" className="border px-2 py-1 mr-2 w-1/3" />
                        <input type="text" value={learner.firstName} onChange={(e) => handleLearnerChange(learnerIndex, 'firstName', e.target.value)} placeholder="First Name" className="border px-2 py-1 mr-2 w-1/3" />
                        <input type="text" value={learner.middleName} onChange={(e) => handleLearnerChange(learnerIndex, 'middleName', e.target.value)} placeholder="Middle Name" className="border px-2 py-1 w-1/3" />
                    </div>
                    <div className="flex flex-wrap">
                        {learner.attendance.map((day, dayIndex) => (
                            <input key={dayIndex} type="text" value={day} onChange={(e) => handleAttendanceChange(learnerIndex, dayIndex, e.target.value)} placeholder={dayIndex + 1} className="border px-2 py-1 m-1 w-10 text-center" />
                        ))}
                    </div>
                </div>
            ))}

            <button onClick={calculateTotals} className="bg-blue-500 text-white px-4 py-2 rounded mt-4">Calculate Totals</button>
            <button onClick={generatePDF} className="bg-green-500 text-white px-4 py-2 rounded mt-4 ml-2">Download PDF</button>

            <div className="mt-4">
                <div>Total for the Month - Absences: {totalAbsences}</div>
                <div>Total for the Month - Tardies: {totalTardies}</div>
            </div>
        </div>
    );
}

export default SchoolFormTwo;
