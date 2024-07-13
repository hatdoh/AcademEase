import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import { db } from "../config/firebase";
import { collection, query, onSnapshot } from 'firebase/firestore';

function Dashboard() {
    const [dateTime, setDateTime] = useState(new Date());
    const [attendanceData, setAttendanceData] = useState({ present: [], late: [], absent: [] });

    useEffect(() => {
        const interval = setInterval(() => {
            setDateTime(new Date());
        }, 1000); // Update every second

        return () => {
            clearInterval(interval); // Clean up interval on unmount
        };
    }, []);

    useEffect(() => {
        const q = query(collection(db, 'attendance'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const data = { present: [], late: [], absent: [] };
            querySnapshot.forEach((doc) => {
                const record = doc.data();
                switch (record.remarks) {
                    case 'present':
                        data.present.push({ ...record, id: doc.id });
                        break;
                    case 'late':
                        data.late.push({ ...record, id: doc.id });
                        break;
                    case 'absent':
                        data.absent.push({ ...record, id: doc.id });
                        break;
                    default:
                        break;
                }
            });
            setAttendanceData(data);
        });

        return () => {
            unsubscribe();
        };
    }, []);

    const formattedDateTime = dateTime.toLocaleString('en-US', {
        weekday: 'long',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: true
    });

    const presentCount = attendanceData.present.length;
    const lateCount = attendanceData.late.length;
    const absentCount = attendanceData.absent.length;

    return (
        <div className='px-10 mr-20 mb-20 mt-10 ml-6'>
            <div className="flex items-center space-x-4">
                <h2 className="text-2xl ml-80 mb-2 font-semibold text-gray-800">
                    Section Sampaguita, Friday, 1:00 PM - 2:00 PM
                </h2>
                <div className="ml-2 text-sm text-gray-600">
                    {formattedDateTime}
                </div>
            </div>
            <div className="ml-80 p-4">
                <table className="min-w-full bg-white border border-gray-200 shadow-lg rounded-lg overflow-hidden">
                    <thead className="text-xl text-gray-800 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th className="py-3 px-4 border-b border-gray-200">{`${presentCount} Present`}</th>
                            <th className="py-3 px-4 border-b border-gray-200">{`${lateCount} Late`}</th>
                            <th className="py-3 px-4 border-b border-gray-200">{`${absentCount} Absent`}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                            <td className="py-4 px-6 border-b border-gray-200">
                                {attendanceData.present.map(student => (
                                    <div key={student.id} className="flex items-center space-x-3 my-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded transition duration-300">
                                        <img src={student.image} alt={student.name} className="w-10 h-10 rounded-full" />
                                        <Link to={`/profile/${student.id}`} className="text-blue-600 hover:underline">
                                            <span>{`${student.FName} ${student.MName} ${student.LName}`}</span>
                                        </Link>
                                    </div>
                                ))}
                            </td>
                            <td className="py-4 px-6 border-b border-gray-200">
                                {attendanceData.late.map(student => (
                                    <div key={student.id} className="flex items-center space-x-3 my-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded transition duration-300">
                                        <img src={student.image} alt={student.name} className="w-10 h-10 rounded-full" />
                                        <Link to={`/profile/${student.id}`} className="text-blue-600 hover:underline">
                                            <span>{`${student.FName} ${student.MName} ${student.LName}`}</span>
                                        </Link>
                                    </div>
                                ))}
                            </td>
                            <td className="py-4 px-6 border-b border-gray-200">
                                {attendanceData.absent.map(student => (
                                    <div key={student.id} className="flex items-center space-x-3 my-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded transition duration-300">
                                        <img src={student.image} alt={student.name} className="w-10 h-10 rounded-full" />
                                        <Link to={`/profile/${student.id}`} className="text-blue-600 hover:underline">
                                            <span>{`${student.FName} ${student.MName} ${student.LName}`}</span>
                                        </Link>
                                    </div>
                                ))}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Dashboard;
