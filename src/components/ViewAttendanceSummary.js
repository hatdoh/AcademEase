import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';

function ViewAttendanceSummary() {
    const { id } = useParams();
    const [attendance, setAttendance] = useState([]);
    
    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                const attendanceCollection = collection(db, 'attendance');
                const q = query(attendanceCollection, where('studentId', '==', id));
                const snapshot = await getDocs(q);
                const attendanceList = snapshot.docs.map(doc => doc.data());
                setAttendance(attendanceList);
            } catch (error) {
                console.error('Error fetching attendance:', error);
            }
        };

        fetchAttendance();
    }, [id]);

    const countStatus = (status) => {
        return attendance.filter(record => record.remarks.toLowerCase() === status).length;
    };

    const presentCount = countStatus('present');
    const lateCount = countStatus('late');
    const absentCount = countStatus('absent');

    return (
        <div className="ml-80 p-4">
            <h2 className="text-2xl font-bold mb-4">Attendance Summary</h2>
            <table className="min-w-full bg-white border border-gray-200 shadow-lg rounded-lg overflow-hidden">
                <thead className="text-sm text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                        <th className="px-6 py-3 text-left uppercase">Date</th>
                        <th className="px-6 py-3 text-left uppercase">Remarks</th>
                    </tr>
                </thead>
                <tbody>
                    {attendance.map((record, index) => (
                        <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-left text-gray-800">{record.date}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-left text-gray-800">{record.remarks}</td>
                        </tr>
                    ))}
                </tbody>
                <tfoot className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                        <td className="px-6 py-3 text-left" colSpan="2">
                            <div className="flex space-x-2">
                                <span className="font-bold">Present: {presentCount}</span>
                                <span className="font-bold">Late: {lateCount}</span>
                                <span className="font-bold">Absent: {absentCount}</span>
                            </div>
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
}

export default ViewAttendanceSummary;
