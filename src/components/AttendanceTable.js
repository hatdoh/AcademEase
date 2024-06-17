import React from 'react';
import { Link } from 'react-router-dom';

function AttendanceTable() {
    const students = {
        present: [
            { id: 1, name: 'Xenia Angelica D. Velacruz', image: 'xenia' },
            { id: 2, name: 'Wyndel S. Albos', image: 'wyndel' },
            { id: 3, name: 'John Homer S. Dar', image: 'homer' },
            { id: 4, name: 'Wyndel S. Albos', image: 'wyndel' },
        ],
        late: [
            { id: 5, name: 'Wyndel S. Albos', image: 'xenia' },
            { id: 6, name: 'John Homer S. Dar', image: 'homer' },
        ],
        absent: [
            { id: 7, name: 'Xenia Angelica D. Velacruz', image: 'xenia' },
            { id: 8, name: 'Wyndel S. Albos', image: 'wyndel' },
        ],
    };

    const presentCount = students.present.length;
    const lateCount = students.late.length;
    const absentCount = students.absent.length;

    return (
        <>
            {/*<h1 className='w-full text-3xl font-bold'>DASHBOARD</h1>*/}
            <div className="container mx-auto p-4">
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
                                {students.present.map(student => (
                                    <div key={student.id} className="flex items-center space-x-3 my-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded transition duration-300">
                                        <img src={require(`../res/img/${student.image}.png`)} alt={student.name} className="w-10 h-10 rounded-full" />
                                        <Link to={`/profile/${student.id}`} className="text-blue-600 hover:underline">
                                            <span>{student.name}</span>
                                        </Link>
                                    </div>
                                ))}
                            </td>
                            <td className="py-4 px-6 border-b border-gray-200">
                                {students.late.map(student => (
                                    <div key={student.id} className="flex items-center space-x-3 my-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded transition duration-300">
                                        <img src={require(`../res/img/${student.image}.png`)} alt={student.name} className="w-10 h-10 rounded-full" />
                                        <Link to={`/profile/${student.id}`} className="text-blue-600 hover:underline">
                                            <span>{student.name}</span>
                                        </Link>
                                    </div>
                                ))}
                            </td>
                            <td className="py-4 px-6 border-b border-gray-200">
                                {students.absent.map(student => (
                                    <div key={student.id} className="flex items-center space-x-3 my-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded transition duration-300">
                                        <img src={require(`../res/img/${student.image}.png`)} alt={student.name} className="w-10 h-10 rounded-full" />
                                        <Link to={`/profile/${student.id}`} className="text-blue-600 hover:underline">
                                            <span>{student.name}</span>
                                        </Link>
                                    </div>
                                ))}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </>
    );
}

export default AttendanceTable;
