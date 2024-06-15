import React from 'react';

function UserTable() {
    return (
        <div className="relative overflow-x-auto mt-7 shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                        <th scope="col" className="px-6 py-3">Present</th>
                        <th scope="col" className="px-6 py-3">Late</th>
                        <th scope="col" className="px-6 py-3">Absent</th>
                    </tr>
                </thead>
                <tbody>
                    {/* Example User */}
                    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                        {/* Present */}
                        <td scope="row" className="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white">
                            <img className="w-10 h-10 rounded-full" src={require("../res/img/xenia.png")} alt="User image" />
                            <div className="ps-3">
                                <div className="text-base font-semibold">Xenia Angelica D. Velacruz</div>
                            </div>
                        </td>
                        {/* Late */}
                        <td scope="row" className=" px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white">
                            <img className="w-10 h-10 rounded-full" src={require("../res/img/xenia.png")} alt="User image" />
                            <div className="ps-3">
                                <div className="text-base font-semibold">Xenia Angelica D. Velacruz</div>
                            </div>
                        </td>
                        {/* Absent */}
                        <td scope="row" className=" px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white">
                            <img className="w-10 h-10 rounded-full" src={require("../res/img/xenia.png")} alt="User image" />
                            <div className="ps-3">
                                <div className="text-base font-semibold">Xenia Angelica D. Velacruz</div>
                            </div>
                        </td>
                    </tr>
                    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                        {/* Present */}
                        <td scope="row" className="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white">
                            <img className="w-10 h-10 rounded-full" src={require("../res/img/xenia.png")} alt="User image" />
                            <div className="ps-3">
                                <div className="text-base font-semibold">Xenia Angelica D. Velacruz</div>
                            </div>
                        </td>
                        {/* Late */}
                        <td scope="row" className=" px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white">
                            <img className="w-10 h-10 rounded-full" src={require("../res/img/xenia.png")} alt="User image" />
                            <div className="ps-3">
                                <div className="text-base font-semibold">Xenia Angelica D. Velacruz</div>
                            </div>
                        </td>
                        {/* Absent */}
                        <td scope="row" className=" px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white">
                            <img className="w-10 h-10 rounded-full" src={require("../res/img/xenia.png")} alt="User image" />
                            <div className="ps-3">
                                <div className="text-base font-semibold">Xenia Angelica D. Velacruz</div>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}

export default UserTable;
