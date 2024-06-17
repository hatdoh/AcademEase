import React from "react";
import AttendanceTable from "../components/AttendanceTable";

function Dashboard() {
    return (
        <>
        <div className='px-10 w-screen mr-20 mb-20 mt-10 ml-6'>
            <AttendanceTable />
        </div>
        </>
    );
}

export default Dashboard;