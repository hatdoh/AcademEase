import React from "react";
import AttendanceTable from "../components/AttendanceTable";

function Dashboard() {
    return (
        <>
            <div className='px-10 w-screen mr-20 mb-20 mt-10 ml-6'>
                <div className="flex items-center space-x-4">
                    <h2 className="text-2xl ml-2 font-semibold text-gray-800">Dashboard</h2>
                </div>
                <AttendanceTable />
            </div>
        </>
    );
}

export default Dashboard;